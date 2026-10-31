"""
AtmoGraph - GNN Dataset Preparation & Synthetic Graph Generator
Generates topological supply chain networks with multi-tier hierarchy, component dependencies,
and Monte Carlo disruption shock labels for inductive GNN training.
"""

import os
import random
import numpy as np
import torch
from torch_geometric.data import Data
from typing import List, Tuple, Dict, Any


def generate_supply_chain_graph(
    num_nodes: int = 40,
    shock_origin_idx: int = 0,
    shock_severity: float = 0.85
) -> Data:
    """
    Constructs a synthetic supply chain graph matching realistic enterprise topologies:
    Tier 3 (Raw) -> Tier 2 (Foundry) -> Tier 1 (Module) -> Tier 0 (OEM) -> Warehouse -> Retail.
    """
    np.random.seed(random.randint(1, 10000))
    torch.manual_seed(random.randint(1, 10000))

    # Node attributes (8 dimensions)
    # 0: In-degree normalized
    # 1: Out-degree normalized
    # 2: Financial criticality [0.4 - 1.0]
    # 3: Single source flag [0, 1]
    # 4: Buffer days normalized (days / 60)
    # 5: Lead time variance normalized (variance / 30)
    # 6: Initial shock severity [0.0 - 1.0]
    # 7: Regional vulnerability [0.1 - 0.9]

    node_features = []
    edges = []

    # Assign tiers to nodes
    tiers = []
    nodes_per_tier = {
        0: int(num_nodes * 0.15),  # Tier 3 Raw Materials
        1: int(num_nodes * 0.25),  # Tier 2 Component Foundry
        2: int(num_nodes * 0.20),  # Tier 1 Modules
        3: int(num_nodes * 0.15),  # Tier 0 OEMs
        4: int(num_nodes * 0.15),  # Warehouses
        5: num_nodes               # Retailers (remaining)
    }

    current_idx = 0
    tier_ranges = {}
    for tier in range(5):
        count = nodes_per_tier[tier]
        start = current_idx
        end = min(num_nodes, current_idx + count)
        tier_ranges[tier] = (start, end)
        for _ in range(start, end):
            tiers.append(tier)
        current_idx = end
    # Remaining for tier 5
    tier_ranges[5] = (current_idx, num_nodes)
    for _ in range(current_idx, num_nodes):
        tiers.append(5)

    # Generate hierarchical forward edges (tier i -> tier i+1) with cross-tier links
    for tier in range(5):
        src_start, src_end = tier_ranges[tier]
        dst_start, dst_end = tier_ranges[tier + 1]

        if src_start >= src_end or dst_start >= dst_end:
            continue

        for src in range(src_start, src_end):
            # Connect to 1-3 downstream nodes
            num_targets = min(dst_end - dst_start, random.randint(1, 3))
            targets = random.sample(range(dst_start, dst_end), num_targets)
            for dst in targets:
                edges.append((src, dst))

    # Convert to edge_index tensor
    edge_index = torch.tensor(edges, dtype=torch.long).t().contiguous()
    if edge_index.size(0) == 0:
        # Fallback dummy edge
        edge_index = torch.tensor([[0], [1]], dtype=torch.long)

    # Compute node degrees
    in_degrees = torch.zeros(num_nodes)
    out_degrees = torch.zeros(num_nodes)
    for src, dst in edges:
        out_degrees[src] += 1
        in_degrees[dst] += 1

    # Simulate ground-truth disruption propagation using epidemic/cascade model
    affected_labels = torch.zeros(num_nodes, dtype=torch.float)
    risk_deltas = torch.zeros(num_nodes, dtype=torch.float)

    # The shock origin is always disrupted
    affected_labels[shock_origin_idx] = 1.0
    risk_deltas[shock_origin_idx] = shock_severity * 45.0

    # Breadth-first cascade simulation
    visited = {shock_origin_idx}
    queue = [(shock_origin_idx, shock_severity, 0)]

    while queue:
        curr, intensity, hop = queue.pop(0)
        if hop >= 4:
            continue

        # Find downstream neighbors
        downstream = [dst for src, dst in edges if src == curr]
        for nbr in downstream:
            if nbr not in visited:
                visited.add(nbr)
                # Propagation probability decreases with distance and increases with intensity
                prop_chance = intensity * (0.85 ** (hop + 1))
                if random.random() < prop_chance:
                    affected_labels[nbr] = 1.0
                    inherited_delta = intensity * 35.0 * (0.8 ** (hop + 1))
                    risk_deltas[nbr] = inherited_delta
                    queue.append((nbr, intensity * 0.85, hop + 1))

    # Assemble 8-dimensional feature vectors
    for i in range(num_nodes):
        in_deg_norm = float(in_degrees[i] / max(1.0, float(in_degrees.max())))
        out_deg_norm = float(out_degrees[i] / max(1.0, float(out_degrees.max())))
        fin_crit = float(np.random.uniform(0.5, 0.98))
        single_source = float(1.0 if (in_degrees[i] == 1 and tiers[i] > 0) else 0.0)
        buffer_norm = float(np.random.uniform(10, 45) / 60.0)
        lead_var_norm = float(np.random.uniform(2, 20) / 30.0)
        current_shock = float(shock_severity if i == shock_origin_idx else 0.0)
        geo_vuln = float(np.random.uniform(0.2, 0.75))

        node_features.append([
            in_deg_norm,
            out_deg_norm,
            fin_crit,
            single_source,
            buffer_norm,
            lead_var_norm,
            current_shock,
            geo_vuln
        ])

    x = torch.tensor(node_features, dtype=torch.float)

    data = Data(
        x=x,
        edge_index=edge_index,
        y=affected_labels,
        risk_deltas=risk_deltas,
        num_nodes=num_nodes
    )
    return data


def create_dataset(num_graphs: int = 150) -> List[Data]:
    """Generates a dataset of diverse supply chain graph disruption scenarios."""
    dataset = []
    for _ in range(num_graphs):
        num_nodes = random.randint(25, 45)
        origin = random.randint(0, int(num_nodes * 0.3))  # Shocks typically originate in Tier 3/2
        severity = random.uniform(0.5, 0.95)
        graph_data = generate_supply_chain_graph(
            num_nodes=num_nodes,
            shock_origin_idx=origin,
            shock_severity=severity
        )
        dataset.append(graph_data)
    return dataset


if __name__ == "__main__":
    data_list = create_dataset(10)
    print(f"Generated {len(data_list)} sample supply chain graphs.")
    sample = data_list[0]
    print(f"Sample Graph: Nodes={sample.num_nodes}, Edges={sample.edge_index.size(1)}, Features={sample.x.shape}")
    print(f"Disrupted Target Count: {int(sample.y.sum().item())} / {sample.num_nodes}")
