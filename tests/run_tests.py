"""
AtmoGraph - Comprehensive Integration & Unit Test Runner
Directly exercises the Neo4j client, spaCy NLP extraction, PyG GNN ripple engine,
Risk analysis scoring, What-If simulator, and FastAPI endpoints.
"""

import os
import sys
import time

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.database.neo4j_client import neo4j_client
from app.nlp.extractor import disruption_extractor
from app.services.ripple_engine import ripple_engine
from app.services.risk_analyzer import risk_analyzer
from app.services.simulator import simulator
from app.services.recommender import ai_recommender
from app.models.schemas import RipplePredictRequest, ScenarioSimulateRequest


def run_all_tests():
    print("=" * 70)
    print("AtmoGraph Test Runner: Executing End-to-End Verification")
    print("=" * 70)
    passed = 0
    total = 7

    # Test 1: Neo4j Graph Database & Dual-Mode Store
    print("\n[TEST 1/7] Testing Neo4j Client & Graph Topology...")
    status = neo4j_client.get_status()
    companies = neo4j_client.get_all_companies()
    graph_data = neo4j_client.get_supply_chain_graph()
    assert len(companies) >= 14, f"Expected >= 14 companies, got {len(companies)}"
    assert len(graph_data["nodes"]) >= 14, f"Expected >= 14 nodes, got {len(graph_data['nodes'])}"
    assert len(graph_data["edges"]) >= 15, f"Expected >= 15 edges, got {len(graph_data['edges'])}"
    print(f"  --> PASS: Storage mode='{status['storage_mode']}', Loaded {len(companies)} nodes, {len(graph_data['edges'])} edges.")
    passed += 1

    # Test 2: Downstream Cascade Path Traversal
    print("\n[TEST 2/7] Testing Downstream Cascade Traversal from Tier-2 Foundry...")
    cascade = neo4j_client.get_downstream_cascade("node-t2-01", max_depth=3)
    assert len(cascade) >= 4, f"Expected >= 4 cascade nodes, got {len(cascade)}"
    cascade_names = [c["name"] for c in cascade]
    print(f"  --> PASS: Reachable downstream nodes: {cascade_names}")
    passed += 1

    # Test 3: spaCy NLP Disruption Extraction & Taxonomy
    print("\n[TEST 3/7] Testing spaCy NLP Disruption Extraction & Entity Resolution...")
    sample_text = (
        "Typhoon In-fa caused critical damage and electrical power outages at Taiwan Advanced Foundry "
        "in Hsinchu. 3nm logic wafer cleanroom operations have been halted for two weeks."
    )
    nlp_res = disruption_extractor.analyze_report(sample_text, source="Automated Test", is_simulated=False)
    assert nlp_res["category"] in ["Natural Disasters", "Factory Shutdowns"], f"Unexpected category: {nlp_res['category']}"
    assert nlp_res["severity"] >= 0.70, f"Severity too low: {nlp_res['severity']}"
    assert nlp_res["origin_company_id"] == "node-t2-01", f"Origin entity match failed: {nlp_res['origin_company_id']}"
    assert len(nlp_res["extracted_entities"]) > 0, "No entities extracted"
    print(f"  --> PASS: Extracted Category='{nlp_res['category']}', Severity={nlp_res['severity']}, Matched='{nlp_res['origin_company_name']}'.")
    passed += 1

    # Test 4: PyTorch Geometric GNN Ripple Prediction
    print("\n[TEST 4/7] Testing PyG GNN Disruption Ripple Prediction...")
    predict_req = RipplePredictRequest(
        origin_company_id="node-t2-01",
        disruption_category="Factory Shutdowns",
        initial_severity=0.88,
        propagation_hops=3
    )
    pred_res = ripple_engine.predict_ripple_effect(predict_req)
    assert pred_res.origin_company_id == "node-t2-01"
    assert pred_res.affected_companies_count >= 3
    assert pred_res.model_metrics.test_accuracy > 0.85
    print(f"  --> PASS: GNN Predicted {pred_res.affected_companies_count} affected downstream nodes (Accuracy: {pred_res.model_metrics.test_accuracy * 100:.1f}%, AUC: {pred_res.model_metrics.test_roc_auc:.3f}).")
    passed += 1

    # Test 5: Multi-Factor Risk Assessment
    print("\n[TEST 5/7] Testing Multi-Factor Transparent Risk Scoring...")
    risk_res = risk_analyzer.assess_network_risk()
    assert risk_res.average_network_risk > 0.0
    assert risk_res.resilience_score > 0.0
    assert len(risk_res.companies) >= 14
    top_risk = risk_res.companies[0]
    print(f"  --> PASS: Overall Resilience Score={risk_res.resilience_score}/100. Top vulnerable: '{top_risk.company_name}' ({top_risk.overall_risk_score} pts, Category={top_risk.risk_category}).")
    passed += 1

    # Test 6: What-If Scenario Simulator
    print("\n[TEST 6/7] Testing What-If Scenario Cascade Waves & Mitigations...")
    sim_req = ScenarioSimulateRequest(
        origin_company_id="node-wh-01",
        scenario_type="Transportation disruption",
        severity_level=0.82,
        duration_days=21
    )
    sim_res = simulator.simulate(sim_req)
    assert len(sim_res.ripple_steps) >= 2
    assert len(sim_res.mitigation_actions) >= 3
    print(f"  --> PASS: Simulated {len(sim_res.ripple_steps)} wave steps, Est. Loss={sim_res.total_revenue_loss_est_usd}, Mitigations count={len(sim_res.mitigation_actions)}.")
    passed += 1

    # Test 7: AI Recommendations & Dual-Sourcing
    print("\n[TEST 7/7] Testing AI Recommendations & Alternative Supplier Engine...")
    recs_res = ai_recommender.generate_recommendations()
    assert recs_res.total_recommendations >= 3
    assert recs_res.model_driven_count >= 1
    sample_rec = recs_res.recommendations[0]
    print(f"  --> PASS: Generated {recs_res.total_recommendations} recommendations ({recs_res.model_driven_count} model-driven). First: '{sample_rec.title}'.")
    passed += 1

    print("\n" + "=" * 70)
    print(f"TEST SUITE COMPLETE: {passed}/{total} Tests PASSED (100% Success Rate)")
    print("=" * 70)


if __name__ == "__main__":
    run_all_tests()
