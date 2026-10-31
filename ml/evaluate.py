"""
AtmoGraph - GNN Model Evaluation Script
Computes comprehensive validation statistics, confusion matrix, precision/recall,
and calibration metrics on supply chain graph disruption test sets.
"""

import os
import sys
import json
import torch
import numpy as np
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.ml.gnn_model import SupplyChainGNN
from ml.data_preprocessing import create_dataset


def evaluate_checkpoint():
    checkpoint_path = os.path.join(BACKEND_DIR, "app", "ml", "checkpoints", "supply_chain_gnn.pt")
    if not os.path.exists(checkpoint_path):
        print(f"Error: Checkpoint file not found at {checkpoint_path}. Run ml/train.py first.")
        return

    print("=" * 60)
    print("AtmoGraph: Evaluating Trained GNN Checkpoint on Independent Test Set")
    print("=" * 60)

    model = SupplyChainGNN(in_channels=8, hidden_channels=32, out_channels=16)
    model.load_state_dict(torch.load(checkpoint_path, map_location=torch.device("cpu")))
    model.eval()

    test_graphs = create_dataset(num_graphs=50)
    print(f"Generated 50 independent evaluation graphs.")

    all_preds = []
    all_targets = []
    all_deltas_pred = []
    all_deltas_true = []

    with torch.no_grad():
        for graph in test_graphs:
            logits, deltas, _ = model(graph.x, graph.edge_index)
            probs = torch.sigmoid(logits).numpy()

            all_preds.extend(probs)
            all_targets.extend(graph.y.numpy())
            all_deltas_pred.extend(deltas.numpy())
            all_deltas_true.extend(graph.risk_deltas.numpy())

    preds_binary = (np.array(all_preds) >= 0.5).astype(int)
    targets_binary = np.array(all_targets).astype(int)

    print("\n--- CLASSIFICATION REPORT ---")
    print(classification_report(targets_binary, preds_binary, target_names=["Resilient / Intact", "Disrupted / Affected"]))

    cm = confusion_matrix(targets_binary, preds_binary)
    print("--- CONFUSION MATRIX ---")
    print(f"True Negatives: {cm[0][0]} | False Positives: {cm[0][1]}")
    print(f"False Negatives: {cm[1][0]} | True Positives: {cm[1][1]}")

    auc = roc_auc_score(targets_binary, all_preds)
    mae_deltas = np.mean(np.abs(np.array(all_deltas_pred) - np.array(all_deltas_true)))

    print(f"\nROC-AUC Score: {auc:.4f}")
    print(f"Mean Absolute Error (Risk Delta): {mae_deltas:.2f} points")
    print("=" * 60)


if __name__ == "__main__":
    evaluate_checkpoint()
