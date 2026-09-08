import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    roc_auc_score
)

df = pd.read_csv(r"E:\my research\Cardiosense\swat_heart_disease_dataset.csv")

df.drop_duplicates(inplace=True)
df.drop(columns=['ecg', 'rwma', 'trop', 'angio'], inplace=True)

X = df.drop(columns='target')
y = df['target']

preprocessor = ColumnTransformer(
    transformers=[
        ('num', StandardScaler(), ['age']),

        ('binary_cat',
         OneHotEncoder(drop='first'),
         ['sex', 'diabetes', 'fhist']),

        ('cp_encoder',
         OrdinalEncoder(categories=[[
             'No Angina',
             'Stable Angina',
             'Unstable Angina'
         ]]),
         ['cp']),

        ('bp_encoder',
         OneHotEncoder(drop='first'),
         ['BP']),

        ('activity_encoder',
         OrdinalEncoder(categories=[[
             'High',
             'Moderate',
             'Low'
         ]]),
         ['Physical_Activity'])
    ],
    remainder='passthrough'
)

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.25, random_state=42, stratify=y
)

base_pipeline = Pipeline([
    ('preprocessing', preprocessor),
    ('classifier', DecisionTreeClassifier(random_state=42))
])

param_grid = {
    'classifier__max_depth': [3, 4, 5, 6, 7, None],
    'classifier__min_samples_leaf': [5, 10, 15, 20],
    'classifier__min_samples_split': [10, 20, 30],
    'classifier__criterion': ['gini', 'entropy'],
    'classifier__ccp_alpha': [0.0, 0.005, 0.01, 0.02, 0.03],
}
grid_search = GridSearchCV(
    base_pipeline,
    param_grid,
    scoring='roc_auc',
    cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
)
grid_search.fit(X_train, y_train)
print(f"Best params     : {grid_search.best_params_}")
print(f"Best CV ROC AUC : {grid_search.best_score_:.4f}")

model = CalibratedClassifierCV(
    estimator=grid_search.best_estimator_,
    method='sigmoid',
    cv=5
)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
y_proba = model.predict_proba(X_test)
confidence = y_proba.max(axis=1)

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, pos_label='Yes')
recall = recall_score(y_test, y_pred, pos_label='Yes')
f1 = f1_score(y_test, y_pred, pos_label='Yes')
roc_auc = roc_auc_score(
    (y_test == 'Yes').astype(int),
    y_proba[:, 1]
)
print(f"Accuracy  : {accuracy:.4f}")
print(f"Precision : {precision:.4f}")
print(f"Recall    : {recall:.4f}")
print(f"F1 Score  : {f1:.4f}")
print(f"ROC AUC   : {roc_auc:.4f}")
print(f"Confidence range on test set : {confidence.min()*100:.1f}% - {confidence.max()*100:.1f}%")
print(f"Predictions stuck at exactly 100% : {(confidence == 1.0).sum()} / {len(confidence)}")

feature_names = grid_search.best_estimator_.named_steps['preprocessing'].get_feature_names_out()
best_tree = grid_search.best_estimator_.named_steps['classifier']
importances = pd.Series(best_tree.feature_importances_, index=feature_names).sort_values(ascending=False)
print("\nFeature importances (uncalibrated best tree):")
print(importances.to_string())

cm = confusion_matrix(y_test, y_pred)

plt.figure(figsize=(6, 5))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', annot_kws={"size": 16})
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.title("Confusion Matrix")
plt.tight_layout()
plt.savefig("DT/confusion_matrix.png", bbox_inches='tight', dpi=150)
print(f"\nSaved to: DT/confusion_matrix.png")
plt.close()

metrics = {
    'Accuracy': accuracy,
    'Precision': precision,
    'Recall': recall,
    'F1 Score': f1,
    'ROC AUC': roc_auc
}

plt.figure(figsize=(8, 5))
ax = sns.barplot(x=list(metrics.keys()), y=list(metrics.values()))
for container in ax.containers:
    ax.bar_label(container, fmt='%.2f', padding=3)
plt.ylim(0, 1)
plt.ylabel("Score")
plt.title("Decision Tree Performance")
plt.tight_layout()
plt.savefig("DT/decision_tree_performance.png", bbox_inches='tight', dpi=150)
print(f"Saved to: DT/decision_tree_performance.png")
plt.close()

import pickle
with open('non_technical.pkl', 'wb') as file:
    pickle.dump(model, file)

print("Model saved successfully!")