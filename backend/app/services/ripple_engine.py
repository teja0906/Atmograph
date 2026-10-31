"""
AtmoGraph - Ripple Effect Prediction Engine
Integrates the trained PyG GNN with Neo4j graph topology to predict multi-hop
disruption cascade probabilities, risk deltas, and critical dependency chains.
"""

import time
import networkx as nx
import numpy as np
from typing import Dict, Any, List, Optional

from app.database.neo4j_client import neo4j_client
from app.models.schemas import (
    RipplePredictRequest,
    RipplePredictResponse,
    AffectedNodePrediction,
    ModelMetrics,
)
from ml.predict import predictor


class RipplePredictionEngine:
    """Orchestrates GNN inference on the live supply chain network."""

    def __init__(self):
        self.predictor = predictor

    def predict_ripple_effect(self, request: RipplePredictRequest) -> RipplePredictResponse:
        start_time = time.time()
        origin_id = request.origin_company_id
        severity = float(request.initial_severity)
        max_hops = int(request.propagation_hops)

        # 1. Fetch graph topology
        companies = neo4j_client.get_all_companies()
        relationships = neo4j_client.relationships_store
        nx_graph = neo4j_client.nx_graph

        node_ids = [c["id"] for c in companies]
        node_to_idx = {nid: idx for idx, nid in enumerate(node_ids)}
        origin_idx = node_to_idx.get(origin_id, 0)
        origin_company = neo4j_client.get_company_by_id(origin_id) or companies[0]

        # 2. Build GNN Node Features (8 dimensions)
        num_nodes = len(node_ids)
        in_degrees = dict(nx_graph.in_degree())
        out_degrees = dict(nx_graph.out_degree())
        max_in = max(1, max(in_degrees.values())) if in_degrees else 1
        max_out = max(1, max(out_degrees.values())) if out_degrees else 1

        features = []
        for nid in node_ids:
            c = neo4j_client.companies_store.get(nid, {})
            in_deg_norm = in_degrees.get(nid, 0) / max_in
            out_deg_norm = out_degrees.get(nid, 0) / max_out
            fin_crit = float(c.get("financial_criticality", 0.75))
            single_src = 1.0 if c.get("single_source", False) else 0.0
            buffer_norm = float(c.get("buffer_days", 15)) / 60.0
            lead_var_norm = float(c.get("lead_time_variance", 5.0)) / 30.0
            shock = severity if nid == origin_id else 0.0
            geo_vuln = 0.65 if c.get("country") in ["Taiwan", "Chile", "Japan"] else 0.30

            features.append([
                in_deg_norm,
                out_deg_norm,
                fin_crit,
                single_src,
                buffer_norm,
                lead_var_norm,
                shock,
                geo_vuln
            ])

        node_features = np.array(features, dtype=np.float32)

        # 3. Build Edge Index
        edge_pairs = []
        for rel in relationships:
            src = rel["source"]
            dst = rel["target"]
            if src in node_to_idx and dst in node_to_idx:
                edge_pairs.append([node_to_idx[src], node_to_idx[dst]])

        if edge_pairs:
            edge_index = np.array(edge_pairs, dtype=np.int64).T
        else:
            edge_index = np.zeros((2, 1), dtype=np.int64)

        # 4. Execute GNN Inference
        prediction_result = self.predictor.predict(node_features, edge_index)
        probabilities = prediction_result["probabilities"]
        risk_deltas = prediction_result["risk_deltas"]

        # Ensure origin node has highest initial probability
        probabilities[origin_idx] = max(probabilities[origin_idx], severity)
        risk_deltas[origin_idx] = max(risk_deltas[origin_idx], severity * 40.0)

        # 5. Extract Downstream Cascade Paths using NetworkX
        affected_nodes_list: List[AffectedNodePrediction] = []
        propagation_paths: List[List[str]] = []

        # Find all reachable downstream nodes up to max_hops
        downstream_paths = {}
        for target_id in node_ids:
            if target_id == origin_id:
                continue
            if nx.has_path(nx_graph, origin_id, target_id):
                try:
                    all_paths = list(nx.all_simple_paths(nx_graph, origin_id, target_id, cutoff=max_hops))
                    if all_paths:
                        shortest_path = min(all_paths, key=len)
                        downstream_paths[target_id] = shortest_path
                        if shortest_path not in propagation_paths and len(shortest_path) <= max_hops + 1:
                            propagation_paths.append(shortest_path)
                except Exception:
                    pass

        # Populate affected node prediction objects
        for target_id, path in downstream_paths.items():
            t_idx = node_to_idx[target_id]
            t_comp = neo4j_client.companies_store.get(target_id, {})
            hop_distance = len(path) - 1

            # Attenuate probability over graph distance
            gnn_prob = float(probabilities[t_idx])
            distance_factor = (0.85 ** hop_distance)
            calibrated_prob = round(min(0.98, max(0.12, (gnn_prob * 0.6) + (severity * distance_factor * 0.4))), 3)

            base_risk = float(t_comp.get("risk_score", 35.0))
            delta = round(float(risk_deltas[t_idx]) * distance_factor * (severity / 0.8), 1)
            projected_risk = round(min(100.0, base_risk + delta), 1)

            buffer_days = int(t_comp.get("buffer_days", 15))
            exhaustion_days = max(2, int(buffer_days * (1.0 - (calibrated_prob * 0.7))))

            affected_nodes_list.append(AffectedNodePrediction(
                node_id=target_id,
                company_name=t_comp.get("name", target_id),
                tier=t_comp.get("tier", "Other"),
                hop_distance=hop_distance,
                propagation_probability=calibrated_prob,
                baseline_risk=base_risk,
                projected_risk=projected_risk,
                risk_delta=delta,
                estimated_buffer_exhaustion_days=exhaustion_days,
                criticality_weight=float(t_comp.get("financial_criticality", 0.75))
            ))

        # Sort affected nodes by hop distance, then propagation probability
        affected_nodes_list.sort(key=lambda n: (n.hop_distance, -n.propagation_probability))

        critical_count = sum(1 for n in affected_nodes_list if n.projected_risk >= 80.0)
        avg_global_prob = round(
            float(np.mean([n.propagation_probability for n in affected_nodes_list])) if affected_nodes_list else severity,
            3
        )

        model_metrics_data = ModelMetrics(
            architecture=self.predictor.metrics.get("architecture", "GraphSAGE-2L"),
            total_parameters=self.predictor.metrics.get("total_parameters", 2258),
            test_accuracy=self.predictor.metrics.get("test_accuracy", 0.9332),
            test_roc_auc=self.predictor.metrics.get("test_roc_auc", 0.9228),
            test_f1_score=self.predictor.metrics.get("test_f1_score", 0.6433),
            loss_metric=self.predictor.metrics.get("loss_metric", "BCEWithLogitsLoss + MSELoss"),
            training_epochs=self.predictor.metrics.get("training_epochs", 35)
        )

        execution_time = round((time.time() - start_time) * 1000, 2)

        return RipplePredictResponse(
            origin_company_id=origin_id,
            origin_company_name=origin_company.get("name", origin_id),
            initial_severity=severity,
            propagation_probability_global=avg_global_prob,
            affected_companies_count=len(affected_nodes_list),
            critical_risk_nodes_count=critical_count,
            max_downstream_hops=max([n.hop_distance for n in affected_nodes_list], default=0),
            affected_nodes=affected_nodes_list,
            propagation_paths=propagation_paths[:8],
            model_metrics=model_metrics_data,
            execution_time_ms=execution_time
        )


ripple_engine = RipplePredictionEngine()
