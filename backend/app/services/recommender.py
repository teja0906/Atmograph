"""
AtmoGraph - AI Recommendation Engine
Generates model-driven and policy-based supply chain mitigation strategies,
including alternative supplier matching, inventory buffer adjustments, and route diversification.
"""

from typing import List, Dict, Any
from app.database.neo4j_client import neo4j_client
from app.models.schemas import (
    RecommendationItem,
    RecommendationsResponse,
    AlternativeSupplierOption,
)
from app.services.risk_analyzer import risk_analyzer


class AIRecommender:
    """Generates intelligent operational remediations for vulnerable supply nodes."""

    ALTERNATIVE_SUPPLIERS_CATALOG = {
        "Pacific Silicium Wafers Corp": [
            AlternativeSupplierOption(
                supplier_id="alt-sil-01",
                supplier_name="Shin-Etsu Handotai Micro",
                country="Japan",
                lead_time_days=38,
                similarity_score=0.94,
                cost_delta_percent=4.5
            ),
            AlternativeSupplierOption(
                supplier_id="alt-sil-02",
                supplier_name="Siltronic AG Europe",
                country="Germany",
                lead_time_days=42,
                similarity_score=0.89,
                cost_delta_percent=6.2
            )
        ],
        "Taiwan Advanced Foundry (TAFC)": [
            AlternativeSupplierOption(
                supplier_id="alt-fnd-01",
                supplier_name="GlobalFoundries Fab 8 New York",
                country="United States",
                lead_time_days=65,
                similarity_score=0.88,
                cost_delta_percent=7.8
            ),
            AlternativeSupplierOption(
                supplier_id="alt-fnd-02",
                supplier_name="Samsung Foundry Giheung",
                country="South Korea",
                lead_time_days=70,
                similarity_score=0.91,
                cost_delta_percent=3.2
            )
        ],
        "Rotterdam EuroPort Central Vault": [
            AlternativeSupplierOption(
                supplier_id="alt-port-01",
                supplier_name="Port of Antwerp-Bruges Terminal",
                country="Belgium",
                lead_time_days=13,
                similarity_score=0.92,
                cost_delta_percent=-2.0
            ),
            AlternativeSupplierOption(
                supplier_id="alt-port-02",
                supplier_name="JadeWeserPort Wilhelmshaven",
                country="Germany",
                lead_time_days=15,
                similarity_score=0.86,
                cost_delta_percent=1.5
            )
        ],
        "Andean Lithium Minerals Ltd": [
            AlternativeSupplierOption(
                supplier_id="alt-lith-01",
                supplier_name="Pilbara Minerals Western Hub",
                country="Australia",
                lead_time_days=45,
                similarity_score=0.90,
                cost_delta_percent=5.0
            )
        ]
    }

    def generate_recommendations(self) -> RecommendationsResponse:
        risk_overview = risk_analyzer.assess_network_risk()
        companies = neo4j_client.get_all_companies()
        recommendations: List[RecommendationItem] = []

        rec_counter = 1

        for comp_assess in risk_overview.companies:
            c_name = comp_assess.company_name
            c_id = comp_assess.company_id
            risk_score = comp_assess.overall_risk_score
            comp_data = neo4j_client.companies_store.get(c_id, {})

            # 1. Model-Driven Alternative Supplier Recommendation for High/Critical Risk Nodes
            if risk_score >= 65.0:
                alts = self.ALTERNATIVE_SUPPLIERS_CATALOG.get(c_name, [])
                if alts:
                    alt_names = ", ".join([f"{a.supplier_name} ({a.country})" for a in alts])
                    recommendations.append(RecommendationItem(
                        id=f"rec-{rec_counter:03d}",
                        title=f"Dual-Source Qualified Alternative for {c_name}",
                        priority="Critical" if risk_score >= 80 else "High",
                        category="Supplier Diversification",
                        target_company_id=c_id,
                        target_company_name=c_name,
                        problem_statement=f"{c_name} exhibits an elevated vulnerability score of {risk_score} with single-source dependency across {comp_assess.downstream_exposure_count} downstream facilities.",
                        actionable_remediation=f"Contractually activate secondary capacity splits with {alt_names}. Shift 30-40% volume to insulate downstream lines.",
                        expected_risk_reduction_percent=round(min(38.0, risk_score * 0.42), 1),
                        estimated_cost_level="Medium ($2.5M - $5.0M CapEx/Legal)",
                        is_model_driven=True,
                        alternative_suppliers=alts
                    ))
                    rec_counter += 1

            # 2. Safety Stock Buffer Expansion for Bottlenecks
            buffer_days = comp_data.get("buffer_days", 15)
            lead_time = comp_data.get("lead_time_days", 30)
            if buffer_days < (lead_time * 0.6) and comp_assess.downstream_exposure_count >= 2:
                recommended_buffer = int(round(lead_time * 0.8))
                recommendations.append(RecommendationItem(
                    id=f"rec-{rec_counter:03d}",
                    title=f"Expand Component Safety Stock Buffer for {c_name}",
                    priority="High",
                    category="Inventory Optimization",
                    target_company_id=c_id,
                    target_company_name=c_name,
                    problem_statement=f"Current buffer of {buffer_days} days is critically inadequate compared to the baseline lead time of {lead_time} days.",
                    actionable_remediation=f"Increase regional safety stock buffer from {buffer_days} to {recommended_buffer} days across staging warehouses to absorb upstream transit volatility.",
                    expected_risk_reduction_percent=26.5,
                    estimated_cost_level="Low ($800K Working Capital)",
                    is_model_driven=True,
                    alternative_suppliers=[]
                ))
                rec_counter += 1

        # 3. Network-Wide Strategic Policy Recommendations (Rule / Policy Based)
        recommendations.append(RecommendationItem(
            id=f"rec-{rec_counter:03d}",
            title="Implement Trans-Pacific & European Intermodal Air-Freight Contigency",
            priority="Medium",
            category="Logistics & Rerouting",
            target_company_id="node-wh-01",
            target_company_name="Rotterdam EuroPort Central Vault",
            problem_statement="Maritime bottleneck at primary European deep-water ports threatens containerized micro-module arrivals.",
            actionable_remediation="Pre-book dry-cargo air charter slots between Taoyuan (TPE) and Frankfurt (FRA) to ensure continuity during seasonal weather or labor disruptions.",
            expected_risk_reduction_percent=18.0,
            estimated_cost_level="High ($4.0M Flexible Retainer)",
            is_model_driven=False,
            alternative_suppliers=[]
        ))
        rec_counter += 1

        recommendations.append(RecommendationItem(
            id=f"rec-{rec_counter:03d}",
            title="Geographic Decoupling of Subassembly and Packaging Facilities",
            priority="Medium",
            category="Geopolitical De-Risking",
            target_company_id="node-t1-01",
            target_company_name="Apex Micro-Modules Precision",
            problem_statement="Excessive geographic concentration in Northern Taiwan leaves the assembly chain vulnerable to seismic and extreme typhoon events.",
            actionable_remediation="Establish secondary HDI substrate pilot line in Penang, Malaysia or Dresden, Germany to decentralize manufacturing clusters.",
            expected_risk_reduction_percent=32.0,
            estimated_cost_level="Enterprise Strategic ($25M+ Multi-Year)",
            is_model_driven=False,
            alternative_suppliers=[]
        ))

        model_driven_count = sum(1 for r in recommendations if r.is_model_driven)
        top_priority_count = sum(1 for r in recommendations if r.priority in ["Critical", "High"])

        return RecommendationsResponse(
            total_recommendations=len(recommendations),
            model_driven_count=model_driven_count,
            top_priority_count=top_priority_count,
            recommendations=recommendations
        )


ai_recommender = AIRecommender()
