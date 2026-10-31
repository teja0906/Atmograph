"""
AtmoGraph - FastAPI Backend Test Suite
Directly exercises the endpoint handlers and schemas synchronously for ultra-fast, robust verification.
"""

import os
import sys
import pytest

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from app.api.endpoints import (
    get_dashboard_data,
    get_supply_chain_network,
    get_companies,
    get_company_by_id,
    get_disruptions,
    analyze_disruption_text,
    predict_ripple_effect,
    get_risk_analysis,
    simulate_scenario,
    get_recommendations,
    get_executive_report,
)
from app.models.schemas import (
    DisruptionAnalyzeRequest,
    RipplePredictRequest,
    ScenarioSimulateRequest,
)


def test_dashboard_endpoint():
    res = get_dashboard_data()
    assert res.kpis.total_suppliers > 0
    assert res.kpis.total_manufacturers > 0
    assert res.kpis.overall_resilience_score > 0
    assert len(res.risk_distribution) == 4
    assert len(res.top_vulnerable_suppliers) > 0


def test_supply_chain_network_endpoint():
    res = get_supply_chain_network()
    assert len(res["nodes"]) >= 14
    assert len(res["edges"]) >= 15
    assert res["nodes"][0]["data"]["risk_score"] > 0


def test_companies_endpoints():
    companies = get_companies(category="Supplier", risk_level=None)
    assert len(companies) > 0
    first_id = companies[0].id
    detail = get_company_by_id(first_id)
    assert detail.id == first_id


def test_disruptions_nlp_endpoint():
    req = DisruptionAnalyzeRequest(
        text="Torrential typhoon in Taiwan forced Taiwan Advanced Foundry to halt 3nm logic wafer cleanrooms for 2 weeks.",
        source="Unit Test",
        is_simulated=False
    )
    res = analyze_disruption_text(req)
    assert res.origin_company_id == "node-t2-01"
    assert res.severity >= 0.70
    assert len(res.extracted_entities) > 0


def test_gnn_ripple_prediction_endpoint():
    req = RipplePredictRequest(
        origin_company_id="node-t2-01",
        disruption_category="Factory Shutdowns",
        initial_severity=0.88,
        propagation_hops=3
    )
    res = predict_ripple_effect(req)
    assert res.origin_company_id == "node-t2-01"
    assert res.affected_companies_count >= 3
    assert res.model_metrics.test_accuracy > 0.85
    assert len(res.affected_nodes) > 0


def test_risk_analysis_endpoint():
    res = get_risk_analysis()
    assert res.average_network_risk > 0.0
    assert res.resilience_score > 0.0
    assert len(res.companies) >= 14
    assert res.companies[0].score_breakdown.structural_centrality >= 0


def test_scenario_simulator_endpoint():
    req = ScenarioSimulateRequest(
        origin_company_id="node-wh-01",
        scenario_type="Transportation disruption",
        severity_level=0.80,
        duration_days=21
    )
    res = simulate_scenario(req)
    assert len(res.ripple_steps) >= 2
    assert len(res.mitigation_actions) >= 3


def test_recommendations_endpoint():
    res = get_recommendations()
    assert res.total_recommendations >= 3
    assert res.model_driven_count >= 1


def test_executive_report_endpoint():
    res = get_executive_report()
    assert "report_id" in res
    assert res["resilience_score"] > 0
    assert len(res["top_bottlenecks"]) > 0
