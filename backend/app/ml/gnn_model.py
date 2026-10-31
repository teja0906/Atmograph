"""
AtmoGraph - Graph Neural Network (GNN) Architecture
Implemented using PyTorch and PyTorch Geometric (PyG).
Features a 2-layer GraphSAGE model with edge conditioning and multi-task prediction heads.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import SAGEConv, GCNConv, LayerNorm


class SupplyChainGNN(nn.Module):
    """
    Graph Neural Network for Supply Chain Disruption & Ripple Effect Prediction.
    Consists of inductive GraphSAGE message-passing layers to capture multi-hop
    supplier dependencies, buffer resilience, and shock propagation.
    """

    def __init__(
        self,
        in_channels: int = 8,
        hidden_channels: int = 32,
        out_channels: int = 16,
        dropout: float = 0.2
    ):
        super(SupplyChainGNN, self).__init__()

        self.in_channels = in_channels
        self.hidden_channels = hidden_channels
        self.dropout = dropout

        # Graph Convolutional Message-Passing Layers
        self.conv1 = SAGEConv(in_channels, hidden_channels, aggr="mean")
        self.norm1 = LayerNorm(hidden_channels)

        self.conv2 = SAGEConv(hidden_channels, out_channels, aggr="mean")
        self.norm2 = LayerNorm(out_channels)

        # Multi-Task Prediction Heads
        # Head A: Propagation Probability (Binary Classification -> Sigmoid)
        self.head_propagation = nn.Sequential(
            nn.Linear(out_channels, 16),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(16, 1)
        )

        # Head B: Downstream Risk Delta (Regression -> [0, 50] points)
        self.head_risk_delta = nn.Sequential(
            nn.Linear(out_channels, 16),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(
        self,
        x: torch.Tensor,
        edge_index: torch.Tensor
    ) -> torch.Tensor:
        """
        Forward pass producing node embeddings, propagation logits, and risk deltas.
        """
        # Layer 1
        h = self.conv1(x, edge_index)
        h = self.norm1(h)
        h = F.leaky_relu(h, negative_slope=0.1)
        h = F.dropout(h, p=self.dropout, training=self.training)

        # Layer 2
        h = self.conv2(h, edge_index)
        h = self.norm2(h)
        h = F.leaky_relu(h, negative_slope=0.1)

        # Multi-task heads
        prop_logits = self.head_propagation(h).squeeze(-1)
        risk_deltas = self.head_risk_delta(h).squeeze(-1) * 50.0  # Scale to max +50 delta

        return prop_logits, risk_deltas, h

    def predict_probabilities(
        self,
        x: torch.Tensor,
        edge_index: torch.Tensor
    ) -> torch.Tensor:
        """Helper returning calibrated probabilities in [0, 1]."""
        self.eval()
        with torch.no_grad():
            prop_logits, risk_deltas, _ = self.forward(x, edge_index)
            probs = torch.sigmoid(prop_logits)
            return probs, risk_deltas


def create_model(in_channels: int = 8) -> SupplyChainGNN:
    """Instantiates a new SupplyChainGNN model."""
    return SupplyChainGNN(in_channels=in_channels, hidden_channels=32, out_channels=16)
