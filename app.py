import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request

# static_folder='public' + static_url_path='' serves assets straight from
# /public at the site root (e.g. /css/doctor.css). Vercel's CDN expects
# static files in public/**, and this keeps url_for('static', ...) in the
# templates working unchanged, both on Vercel and with `python app.py` locally.
app = Flask(__name__, static_folder='public', static_url_path='')
BASE = os.path.dirname(__file__)


def load_pkl(name):
    path = os.path.join(BASE, name)
    if os.path.exists(path):
        with open(path, 'rb') as f:
            return pickle.load(f)
    print(f"WARNING: {name} not found.")
    return None


class TechnicalModel:
    """Pure NumPy re-implementation of technical_model.keras (11 -> 128 -> 64
    -> 32 -> 1, relu/relu/relu/sigmoid). Same architecture, same trained
    weights (exported via export_technical_weights.py), identical predictions
    - verified to match Keras output to within float32 rounding (<1e-6).
    Swapped in so the app doesn't need the ~2GB TensorFlow dependency, which
    exceeds Vercel's serverless function size limit.
    """
    def __init__(self, weights_path):
        w = np.load(weights_path)
        self.layers = [(w['W1'], w['b1']), (w['W2'], w['b2']),
                        (w['W3'], w['b3']), (w['W4'], w['b4'])]

    def predict(self, X, verbose=0):
        h = np.asarray(X, dtype=np.float32)
        for W, b in self.layers[:-1]:
            h = np.maximum(h @ W + b, 0)          # relu
        W, b = self.layers[-1]
        return 1.0 / (1.0 + np.exp(-(h @ W + b)))  # sigmoid


def load_technical_model(name):
    path = os.path.join(BASE, name)
    if os.path.exists(path):
        return TechnicalModel(path)
    print(f"WARNING: {name} not found.")
    return None


technical_model    = load_technical_model('technical_model_weights.npz')
nontechnical_model = load_pkl('non_technical.pkl')   


def predict(model, X):
    if hasattr(model, 'predict_proba'):
        proba    = model.predict_proba(X)[0]
        pred     = int(np.argmax(proba))
        conf     = float(max(proba))
        prob_yes = float(proba[1])          
    else:
        raw      = model.predict(X, verbose=0)
        prob_yes = float(raw[0][0])
        pred     = int(prob_yes >= 0.5)
        conf     = float(max(prob_yes, 1.0 - prob_yes))
    return pred, round(conf, 4), round(prob_yes, 4)



@app.route('/')
def index():
    return render_template('index.html')


@app.route('/doctor')
def doctor():
    return render_template('doctor.html')


@app.route('/patient')
def patient():
    return render_template('patient.html')



@app.route('/predict_doctor', methods=['POST'])
def predict_doctor():
    if technical_model is None:
        return render_template('doctor.html',
            error="technical_model_weights.npz not found. Run export_technical_weights.py first.")
    try:
        X = np.array([[
            float(request.form['age']),
            float(request.form['sex']),
            float(request.form['BP']),
            float(request.form['diabetes']),
            float(request.form['fhist']),
            float(request.form['act']),      
            float(request.form['cp']),
            float(request.form['ecg']),
            float(request.form['rwma']),
            float(request.form['trop']),
            float(request.form['angio']),
        ]])
        pred, conf, prob_yes = predict(technical_model, X)
        return render_template('doctor.html',
            prediction=pred,
            confidence=conf,
            prob_yes=round(prob_yes * 100, 1),
            prob_no=round((1 - prob_yes) * 100, 1))
    except KeyError as e:
        return render_template('doctor.html', error=f"Missing form field: {e}")
    except Exception as e:
        return render_template('doctor.html', error=f"Prediction error: {e}")



_SEX_MAP  = {'0': 'Female', '1': 'Male'}
_BP_MAP   = {'0': 'Normal', '1': 'Low',       '2': 'High'}
_DIAB_MAP = {'0': 'No',     '1': 'Yes'}
_FH_MAP   = {'0': 'No',     '1': 'Yes'}
_ACT_MAP  = {'0': 'Low',    '1': 'Moderate',  '2': 'High'}
_CP_MAP   = {'0': 'No Angina', '1': 'Stable Angina', '2': 'Unstable Angina'}


@app.route('/predict_patient', methods=['POST'])
def predict_patient():
    if nontechnical_model is None:
        return render_template('patient.html',
            error="non_technical_model.pkl not found. Run the DT notebook first.")
    try:
        row = {
            'age':               float(request.form['age']),
            'sex':               _SEX_MAP[request.form['sex']],
            'BP':                _BP_MAP[request.form['BP']],
            'diabetes':          _DIAB_MAP[request.form['diabetes']],
            'fhist':             _FH_MAP[request.form['fhist']],
            'Physical_Activity': _ACT_MAP[request.form['act']],
            'cp':                _CP_MAP[request.form['cp']],
        }
        X = pd.DataFrame([row])
        pred, conf, prob_yes = predict(nontechnical_model, X)
        return render_template('patient.html',
            prediction=pred,
            confidence=conf,
            prob_yes=round(prob_yes * 100, 1),
            prob_no=round((1 - prob_yes) * 100, 1))
    except KeyError as e:
        return render_template('patient.html', error=f"Missing form field: {e}")
    except Exception as e:
        return render_template('patient.html', error=f"Prediction error: {e}")


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
