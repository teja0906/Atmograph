"""
AtmoGraph - What-If Scenario Simulator Engine
Simulates dynamic shock propagation across multi-tier networks, generating
time-stepped cascade wave data for React Flow graph animations, revenue impact, and mitigations.
"""

import uuid
import networkx as nx
from typing import Dict, Any, List

from app.database.neo4j_client import neo4j_client
from app.models.schemas import (
    ScenarioSimulateRequest,
    ScenarioSimulateResponse,
    SimulationCascadeStep,
    AffectedNodePrediction,
)
from app.services.ripple_engine import ripple_engine
from app.models.schemas import RipplePredictRequest


class ScenarioSimulator:
    """Executes time-stepped dynamic shock simulations over the supply chain."""

    def simulate(self, request: ScenarioSimulateRequest) -> ScenarioSimulateResponse:
        origin_id = request.origin_company_id
        scenario_type = request.scenario_type
        severity = float(request.severity_level)
        duration_days = int(request.duration_days)

        comp = neo4j_client.get_company_by_id(origin_id) or neo4j_client.companies_store.get(origin_id, {})
        comp_name = comp.get("name", origin_id)

        # Run GNN ripple prediction to get probabilistic weights
        predict_req = RipplePredictRequest(
            origin_company_id=origin_id,
            disruption_category=scenario_type,
            initial_severity=severity,
            propagation_hops=4
        )
        prediction_response = ripple_engine.predict_ripple_effect(predict_req)

        # Generate Wave Steps for UI Graph Animation
        nx_graph = neo4j_client.nx_graph
        ripple_steps: List[SimulationCascadeStep] = []

        # Step 0: Shock Origin Shock Wave
        step0_desc = f"Initial shock impact at {comp_name} ({scenario_type}, severity {int(severity * 100)}%)."
        ripple_steps.append(SimulationCascadeStep(
            step_number=0,
            active_wave_node_ids=[origin_id],
            active_edge_ids=[],
            description=step0_desc,
            accumulated_delay_days=int(duration_days * 0.4),
            accumulated_revenue_loss_usd=round(severity * 120.0, 1)
        ))

        # Build consecutive waves based on graph hop distance
        max_hops = prediction_response.max_downstream_hops
        accumulated_delay = int(duration_days * 0.4)
        accumulated_revenue = round(severity * 120.0, 1)

        for hop in range(1, max_hops + 1):
            hop_nodes = [n for n in prediction_response.affected_nodes if n.hop_distance == hop]
            if not hop_nodes:
                continue

            active_node_ids = [n.node_id for n in hop_nodes]

            # Find active edges feeding into these nodes
            active_edges = []
            for n_id in active_node_ids:
                in_edges = list(nx_graph.in_edges(n_id))
                for src, dst in in_edges:
                    active_edges.append(f"e-{src}-{dst}")

            step_delay_incr = int(round(severity * 6.5 * (0.85 ** hop)))
            accumulated_delay += step_delay_incr
            revenue_incr = round(len(hop_nodes) * severity * 85.0 * (0.9 ** hop), 1)
            accumulated_revenue += revenue_incr

            tier_names = set(n.tier for n in hop_nodes)
            desc = (
                f"Wave {hop}: Disruption propagates downstream into {len(hop_nodes)} entities "
                f"across [{', '.join(tier_names)}]. Inbound buffer stocks depleting."
            )

            ripple_steps.append(SimulationCascadeStep(
                step_number=hop,
                active_wave_node_ids=active_node_ids,
                active_edge_ids=active_edges,
                description=desc,
                accumulated_delay_days=accumulated_delay,
                accumulated_revenue_loss_usd=accumulated_revenue
            ))

        # Mitigation Strategies based on Scenario
        mitigations = self._generate_scenario_mitigations(scenario_type, comp, severity)

        total_affected = len(prediction_response.affected_nodes)
        total_rev_str = f"${accumulated_revenue / 1000:.2f} Billion" if accumulated_revenue >= 1000 else f"${int(accumulated_revenue)} Million"

        return ScenarioSimulateResponse(
            scenario_id=f"sim-{uuid.uuid4().hex[:8]}",
            scenario_type=scenario_type,
            origin_company_id=origin_id,
            origin_company_name=comp_name,
            severity=severity,
            duration_days=duration_days,
            total_affected_companies=total_affected,
            total_revenue_loss_est_usd=total_rev_str,
            max_network_delay_days=accumulated_delay,
            ripple_steps=ripple_steps,
            affected_nodes=prediction_response.affected_nodes,
            mitigation_actions=mitigations
        )

    def _generate_scenario_mitigations(
        self,
        scenario_type: str,
        comp: Dict[str, Any],
        severity: float
    ) -> List[str]:
        comp_name = comp.get("name", "Target Supplier")
        category = comp.get("category", "Supplier")

        actions = [
            f"Activate pre-qualified secondary supplier contracts to absorb 35-50% allocation from {comp_name}.",
            f"Increase safety stock buffer parameters from current {comp.get('buffer_days', 15)} days to {int(comp.get('buffer_days', 15) * 1.8)} days across critical downstream OEM tiers.",
            f"Implement priority dynamic freight allocation; expedite transit via air-bridge corridors for critical micro-modules.",
            f"Trigger emergency production schedule revisions at downstream assembly plants to reallocate assembly capacity toward non-impacted product configurations.",
            "Establish continuous automated telemetric sensor and telemetry monitoring on key transportation choke-points."
        ]

        if "Transportation" in scenario_type:
            actions.insert(0, "Reroute maritime container vessels to alternative deep-water berths (e.g., Antwerp or Wilhelmshaven) to bypass congestion.")
        elif "Raw Material" in scenario_type:
            actions.insert(0, f"Authorize secondary purity grade procurement protocols to sustain fabrication line continuity for {comp_name}.")

        return actions[:5]


simulator = ScenarioSimulator()
