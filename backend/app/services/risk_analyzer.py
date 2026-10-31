"""
AtmoGraph - Multi-Factor Risk Analysis & Supply Chain Resilience Engine
Provides transparent, configurable risk classification (Low, Medium, High, Critical)
and critical dependency path discovery.
"""

import networkx as nx
import numpy as np
from typing import Dict, Any, List

from app.database.neo4j_client import neo4j_client
from app.models.schemas import (
    CompanyRiskAssessment,
    RiskScoreBreakdown,
    DependencyPath,
    RiskOverviewResponse,
)


class RiskAnalyzer:
    """Computes transparent enterprise risk scores across all network nodes."""

    # Configurable Risk Category Thresholds
    THRESHOLDS = {
        "LOW": (0.0, 30.0),
        "MEDIUM": (30.1, 60.0),
        "HIGH": (60.1, 80.0),
        "CRITICAL": (80.1, 100.0)
    }

    def assess_network_risk(self) -> RiskOverviewResponse:
        """Evaluates risk and resilience across all supply chain entities."""
        companies = neo4j_client.get_all_companies()
        nx_graph = neo4j_client.nx_graph

        betweenness = nx.betweenness_centrality(nx_graph) if len(nx_graph) > 0 else {}
        pagerank = nx.pagerank(nx_graph) if len(nx_graph) > 0 else {}

        assessments: List[CompanyRiskAssessment] = []
        scores = []

        for comp in companies:
            c_id = comp["id"]
            assessment = self._assess_single_company(comp, betweenness.get(c_id, 0.0), pagerank.get(c_id, 0.0))
            assessments.append(assessment)
            scores.append(assessment.overall_risk_score)

        avg_risk = round(float(np.mean(scores)), 1) if scores else 45.0
        # Resilience score is inversely correlated with network risk and bottleneck concentration
        resilience = round(max(10.0, min(95.0, 100.0 - avg_risk + 5.0)), 1)

        low_count = sum(1 for a in assessments if a.risk_category == "Low Risk")
        med_count = sum(1 for a in assessments if a.risk_category == "Medium Risk")
        high_count = sum(1 for a in assessments if a.risk_category == "High Risk")
        crit_count = sum(1 for a in assessments if a.risk_category == "Critical Risk")

        risk_distribution = [
            {"category": "Low Risk (0-30)", "count": low_count, "color": "#10B981"},
            {"category": "Medium Risk (31-60)", "count": med_count, "color": "#F59E0B"},
            {"category": "High Risk (61-80)", "count": high_count, "color": "#F97316"},
            {"category": "Critical Risk (81-100)", "count": crit_count, "color": "#EF4444"},
        ]

        # Sort assessments by risk score descending
        assessments.sort(key=lambda x: x.overall_risk_score, reverse=True)

        return RiskOverviewResponse(
            average_network_risk=avg_risk,
            resilience_score=resilience,
            high_risk_count=high_count,
            critical_risk_count=crit_count,
            medium_risk_count=med_count,
            low_risk_count=low_count,
            risk_distribution=risk_distribution,
            companies=assessments
        )

    def _assess_single_company(
        self,
        comp: Dict[str, Any],
        betweenness_val: float,
        pagerank_val: float
    ) -> CompanyRiskAssessment:
        c_id = comp["id"]
        nx_graph = neo4j_client.nx_graph

        # Factor 1: Structural Centrality (0 - 25 pts)
        in_deg = nx_graph.in_degree(c_id) if c_id in nx_graph else 0
        out_deg = nx_graph.out_degree(c_id) if c_id in nx_graph else 0
        centrality_score = min(25.0, (betweenness_val * 60.0) + (pagerank_val * 100.0) + (out_deg * 2.5))

        # Factor 2: Upstream Exposure (0 - 25 pts)
        upstream_count = len(nx.ancestors(nx_graph, c_id)) if c_id in nx_graph else 0
        upstream_score = min(25.0, (upstream_count * 3.5) + (in_deg * 2.0))

        # Factor 3: Single Source Dependency Penalty (0 - 20 pts)
        is_single_src = comp.get("single_source", False)
        single_src_score = 18.0 if is_single_src else 4.0

        # Factor 4: Buffer Inventory Deficiency (0 - 15 pts)
        buffer_days = comp.get("buffer_days", 20)
        lead_time = comp.get("lead_time_days", 30)
        buffer_ratio = buffer_days / max(1.0, float(lead_time))
        # Lower buffer ratio means higher risk
        buffer_score = max(0.0, min(15.0, (1.0 - min(1.0, buffer_ratio)) * 15.0))

        # Factor 5: Geographic / Country Hazard (0 - 15 pts)
        country = comp.get("country", "")
        if country in ["Taiwan", "Chile"]:
            geo_score = 14.0
        elif country in ["Japan", "Netherlands"]:
            geo_score = 9.0
        elif country in ["Germany", "South Korea"]:
            geo_score = 7.0
        else:
            geo_score = 4.0

        total_risk = round(centrality_score + upstream_score + single_src_score + buffer_score + geo_score, 1)
        total_risk = max(12.0, min(96.0, total_risk))

        if total_risk <= 30.0:
            category_label = "Low Risk"
        elif total_risk <= 60.0:
            category_label = "Medium Risk"
        elif total_risk <= 80.0:
            category_label = "High Risk"
        else:
            category_label = "Critical Risk"

        disruption_prob = round(total_risk / 100.0 * 0.95, 2)
        downstream_count = len(nx.descendants(nx_graph, c_id)) if c_id in nx_graph else 0
        est_delay = int(round(5 + (total_risk * 0.28)))

        # Find critical paths through this node
        critical_paths: List[DependencyPath] = []
        if c_id in nx_graph:
            ancestors = list(nx.ancestors(nx_graph, c_id))[:2]
            descendants = list(nx.descendants(nx_graph, c_id))[:2]
            for anc in ancestors:
                for dsc in descendants:
                    if nx.has_path(nx_graph, anc, dsc):
                        try:
                            path = nx.shortest_path(nx_graph, anc, dsc)
                            if c_id in path and len(path) > 2:
                                path_names = [neo4j_client.companies_store.get(p, {}).get("name", p) for p in path]
                                critical_paths.append(DependencyPath(
                                    path=path_names,
                                    bottleneck_node=comp.get("name", c_id),
                                    combined_lead_time_days=int(len(path) * 18),
                                    vulnerability_score=round(total_risk * 0.92, 1)
                                ))
                        except Exception:
                            pass

        return CompanyRiskAssessment(
            company_id=c_id,
            company_name=comp.get("name", c_id),
            category=comp.get("category", "General"),
            tier=comp.get("tier", "Other"),
            location=f"{comp.get('city', '')}, {comp.get('country', '')}",
            overall_risk_score=total_risk,
            risk_category=category_label,
            disruption_probability=disruption_prob,
            downstream_exposure_count=downstream_count,
            estimated_delay_days=est_delay,
            score_breakdown=RiskScoreBreakdown(
                structural_centrality=round(centrality_score, 1),
                upstream_exposure=round(upstream_score, 1),
                single_source_penalty=round(single_src_score, 1),
                buffer_deficiency=round(buffer_score, 1),
                geographic_hazard=round(geo_score, 1)
            ),
            critical_paths=critical_paths[:3]
        )


risk_analyzer = RiskAnalyzer()
