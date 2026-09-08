import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder,LabelEncoder,OrdinalEncoder
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
from tensorflow.keras import layers, regularizers
import tensorflow as tf
from tensorflow import keras
import pickle


df = pd.read_csv("swat_heart_disease_dataset.csv")
X = df.drop(columns='target')
y = df['target']

scaler = StandardScaler()
X['age'] = scaler.fit_transform(X[['age']])

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print('Training samples:', X_train.shape[0])
print('Testing samples :', X_test.shape[0])

df = df.drop_duplicates()

df['sex'] = df['sex'].map({
    "Female":0,
    "Male":1
})
df['diabetes'] = df['diabetes'].map({
    "No":0,
    "Yes":1
})
df['fhist'] = df['fhist'].map({
    "No":0,
    "Yes":1
})
df['cp'] = df['cp'].map({
    "No Angina":0,
    "Stable Angina":1,
    "Unstable Angina":2
})
df['ecg'] = df['ecg'].map({
    "Normal":0,
    "ST Depression":1,
    "ST Elevation":2,
    "T-wave Inversion":3,
    "Complete Heart Block":4
})
df['rwma'] = df['rwma'].map({
    "No":0,
    "yes":1
})
df['trop'] = df['trop'].map({
    "Not Done":0,
    "Negative":1,
    "Positive":2
})
df['angio'] = df['angio'].map({
    "Normal":0,
    "Single Vessel Disease":1,
    "Double Vessel Disease":2,
    "Triple Vessel Disease":3
})
df['Physical_Activity'] = df['Physical_Activity'].map({
    "High":0,
    "Moderate":1,
    "Low":2
})
df['BP'] = df['BP'].map({
    "Normal":0,
    "Low":1,
    "High":2
})
df['target'] = df['target'].map({
    "No":0,
    "Yes":1
})


X = df.drop(columns='target')
y = df['target']

tf.random.set_seed(42)
np.random.seed(42)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

print('Training samples:', X_train.shape[0])
print('Testing samples :', X_test.shape[0])


# Set random seed so results are reproducible
tf.random.set_seed(42)
np.random.seed(42)
model = keras.Sequential([
    keras.layers.Dense(128, activation='relu', input_shape=(11,)),  # Hidden layer 1 
    keras.layers.Dense(64, activation='relu',kernel_regularizer=regularizers.l1_l2(0.001,0.001)),                   # Hidden layer 2 
    keras.layers.Dense(32, activation='relu',kernel_regularizer=regularizers.l1_l2(0.001,0.001)),                   # Hidden layer 3
    # keras.layers.Dense(16, activation='relu',kernel_regularizer=regularizers.l1_l2(0.001,0.00001)),                   # Hidden layer 3
    # keras.layers.Dense(8, activation='relu',kernel_regularizer=regularizers.l1_l2(0.001,0.00001)),                   # Hidden layer 3
    keras.layers.Dense(1,  activation='sigmoid')                   # Output layer
])

model.summary()


model.compile(
    optimizer = 'adam',
    loss      = 'binary_crossentropy',
    metrics   = ['accuracy']
)

print('Model compiled and ready to train!')

history = model.fit(
    X_train, y_train,
    epochs = 500,
    batch_size = 64,
    validation_split = 0.2,
    verbose= 1
)


fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Plot Loss
axes[0].plot(history.history['loss'],     label='Train Loss',      color='blue')
axes[0].plot(history.history['val_loss'], label='Validation Loss', color='red', linestyle='--')
axes[0].set_title('Loss over Epochs', fontsize=14)
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Loss')
axes[0].legend()
axes[0].grid(True)

# Plot Accuracy
axes[1].plot(history.history['accuracy'],     label='Train Accuracy',      color='blue')
axes[1].plot(history.history['val_accuracy'], label='Validation Accuracy', color='red', linestyle='--')
axes[1].set_title('Accuracy over Epochs', fontsize=14)
axes[1].set_xlabel('Epoch')
axes[1].set_ylabel('Accuracy')
axes[1].legend()
axes[1].grid(True)

plt.tight_layout()
plt.savefig(
    "NN/NN_performance.png"
)
plt.show()



test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)

print(f'Test Loss     : {test_loss:.4f}')
print(f'Test Accuracy : {test_accuracy * 100:.2f}%')


# save the train model after showing performance of model
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle

print('performance of model')
print('accuracy score : {} precision score : {} recall score : {} f1 score : {}'.format(
    accuracy_score(y_test, model.predict(X_test).round()),
    precision_score(y_test, model.predict(X_test).round()),
    recall_score(y_test, model.predict(X_test).round()),
    f1_score(y_test, model.predict(X_test).round())
))



from sklearn.metrics import roc_curve, auc
import matplotlib.pyplot as plt
 
# ─────────────────────────────────────────────
# ROC CURVE  –  ANN Heart Disease Detection
# ─────────────────────────────────────────────
 
# Get predicted probabilities (sigmoid output, shape: (n, 1))
y_probs = model.predict(X_test).ravel()   # flatten to 1-D
 
# Compute FPR, TPR, and AUC
fpr, tpr, thresholds = roc_curve(y_test, y_probs)
roc_auc = auc(fpr, tpr)
 
# Plot
plt.figure(figsize=(8, 6))
 
plt.plot(
    fpr, tpr,
    color='darkorange',
    linewidth=2,
    label=f'ANN ROC Curve (AUC = {roc_auc:.4f})'
)
 
plt.plot(
    [0, 1], [0, 1],
    color='navy',
    linewidth=1.5,
    linestyle='--',
    label='Random Classifier (AUC = 0.50)'
)
 
plt.xlim([0.0, 1.0])
plt.ylim([0.0, 1.05])
plt.xlabel('False Positive Rate', fontsize=13)
plt.ylabel('True Positive Rate',  fontsize=13)
plt.title('ROC Curve – ANN Heart Disease Detection', fontsize=14)
plt.legend(loc='lower right', fontsize=11)
plt.grid(True, alpha=0.3)
plt.tight_layout()
 
plt.savefig("NN/roc_curve.png", bbox_inches='tight', dpi=150)
plt.show()
 
print(f"ROC AUC Score : {roc_auc:.4f}")
print("Saved: NN/roc_curve.png")

from sklearn.metrics import confusion_matrix
import seaborn as sns
import matplotlib.pyplot as plt

# ─────────────────────────────────────────────
# CONFUSION MATRIX  –  ANN Heart Disease Detection
# ─────────────────────────────────────────────

# Get predicted class labels (threshold = 0.5)
y_pred = (model.predict(X_test) >= 0.5).astype(int).ravel()

# Compute confusion matrix
cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(6, 5))

sns.heatmap(
    cm,
    annot=True,
    fmt='d',
    cmap='Blues',
    xticklabels=['No Disease', 'Disease'],
    yticklabels=['No Disease', 'Disease'],
    annot_kws={"size": 16}
)

plt.xlabel('Predicted', fontsize=12)
plt.ylabel('Actual',    fontsize=12)
plt.title('Confusion Matrix – ANN Heart Disease Detection', fontsize=13)
plt.tight_layout()

plt.savefig("NN/confusion_matrix.png", bbox_inches='tight', dpi=150)
plt.show()

# Print values explicitly
tn, fp, fn, tp = cm.ravel()
print(f"True  Negatives (TN) : {tn}")
print(f"False Positives (FP) : {fp}")
print(f"False Negatives (FN) : {fn}")
print(f"True  Positives (TP) : {tp}")
print("Saved: NN/confusion_matrix.png")

model.save('technical_model.keras')

with open('age_scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
