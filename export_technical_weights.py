"""
Regenerates technical_model_weights.npz from technical_model.keras.

app.py runs the technical (11-feature) model as plain NumPy (see the
TechnicalModel class in app.py) instead of loading it through Keras/
TensorFlow, because the TensorFlow package is ~2GB and exceeds Vercel's
serverless function size limit. technical_model_weights.npz just holds
the trained weight matrices exported below - same architecture, same
weights, same predictions as technical_model.keras (verified to match
to within float32 rounding, <1e-6).

Only re-run this if you retrain and overwrite technical_model.keras.
Requires `pip install tensorflow` locally (not needed to run app.py itself).
"""
import numpy as np
from keras.models import load_model

model = load_model('technical_model.keras')

weights = {}
for i, layer in enumerate(model.layers):
    W, b = layer.get_weights()
    weights[f'W{i + 1}'] = W
    weights[f'b{i + 1}'] = b

np.savez('technical_model_weights.npz', **weights)
print("Wrote technical_model_weights.npz:", list(weights.keys()))
