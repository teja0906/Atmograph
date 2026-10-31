"""
AtmoGraph - Neo4j Graph Database Client & Dual-Mode Engine
Supports live Neo4j database connections via the official driver, with an intelligent
in-memory high-performance fallback graph store mirroring the exact Neo4j Cypher schema.
"""

import os
import logging
from typing import List, Dict, Any, Optional
import networkx as nx
from neo4j import GraphDatabase, Driver, Session

from app.database.seed_data import (
    SEED_LOCATIONS,
    SEED_COMPANIES,
    SEED_RELATIONSHIPS,
    SEED_DISRUPTIONS,
)

logger = logging.getLogger("atmograph.neo4j")


class Neo4jClient:
    """
    Enterprise Neo4j database adapter with dual-mode operational resilience.
    Connects to external Neo4j instances if available, otherwise runs an
    in-memory schema-compatible Graph Engine powered by NetworkX.
    """

    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "bolt://127.0.0.1:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.driver: Optional[Driver] = None
        self.is_connected: bool = False
        self.storage_mode: str = "in_memory"

        # In-memory graph storage
        self.nx_graph = nx.DiGraph()
        self.locations_store: Dict[str, Dict[str, Any]] = {}
        self.companies_store: Dict[str, Dict[str, Any]] = {}
        self.relationships_store: List[Dict[str, Any]] = []
        self.disruptions_store: List[Dict[str, Any]] = []

        # Initialize fallback memory store first so data is guaranteed available
        self._init_memory_store()
        
        # Connect to Neo4j if explicitly enabled or requested
        if os.getenv("ENABLE_NEO4J_REMOTE", "false").lower() in ["true", "1", "yes"]:
            self._try_connect_neo4j()

    def _init_memory_store(self):
        """Populates the in-memory graph repository with seed data."""
        self.nx_graph.clear()
        self.locations_store = {loc["id"]: dict(loc) for loc in SEED_LOCATIONS}
        self.companies_store = {comp["id"]: dict(comp) for comp in SEED_COMPANIES}
        self.relationships_store = [dict(rel) for rel in SEED_RELATIONSHIPS]
        self.disruptions_store = [dict(disr) for disr in SEED_DISRUPTIONS]

        # Build NetworkX DiGraph
        for comp_id, comp in self.companies_store.items():
            self.nx_graph.add_node(
                comp_id,
                **comp
            )

        for rel in self.relationships_store:
            self.nx_graph.add_edge(
                rel["source"],
                rel["target"],
                type=rel.get("type", "SUPPLIES_TO"),
                component=rel.get("component", "General Supply"),
                lead_time_days=rel.get("lead_time_days", 14),
                criticality=rel.get("criticality", 0.7),
                single_source=rel.get("single_source", False),
            )

        logger.info(
            f"InMemory GraphStore initialized: {len(self.companies_store)} nodes, "
            f"{len(self.relationships_store)} edges, {len(self.disruptions_store)} disruptions."
        )

    def _try_connect_neo4j(self):
        """Attempts connection to live Neo4j server."""
        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
                connection_timeout=2.0
            )
            # Verify connectivity
            self.driver.verify_connectivity()
            self.is_connected = True
            self.storage_mode = "neo4j_live"
            logger.info(f"Successfully connected to live Neo4j cluster at {self.uri}")
            self._seed_neo4j_if_empty()
        except Exception as e:
            self.is_connected = False
            self.storage_mode = "in_memory"
            logger.warning(
                f"Neo4j offline at {self.uri} ({e}). Falling back to built-in Neo4j GraphEngine."
            )

    def _seed_neo4j_if_empty(self):
        """Seeds the live Neo4j database if node count is zero."""
        if not self.is_connected or not self.driver:
            return

        try:
            with self.driver.session() as session:
                result = session.run("MATCH (n:Company) RETURN count(n) AS count").single()
                if result and result["count"] == 0:
                    logger.info("Live Neo4j is empty. Executing seed Cypher transaction...")
                    for comp in self.companies_store.values():
                        session.run(
                            """
                            CREATE (c:Company {
                                id: $id, name: $name, category: $category, tier: $tier,
                                type: $type, city: $city, country: $country, risk_score: $risk_score,
                                status: $status, financial_criticality: $financial_criticality,
                                single_source: $single_source, buffer_days: $buffer_days,
                                lead_time_days: $lead_time_days, lead_time_variance: $lead_time_variance
                            })
                            """,
                            **comp
                        )
                    for rel in self.relationships_store:
                        session.run(
                            """
                            MATCH (a:Company {id: $source}), (b:Company {id: $target})
                            CREATE (a)-[:SUPPLIES_TO {
                                component: $component, lead_time_days: $lead_time_days,
                                criticality: $criticality, single_source: $single_source
                            }]->(b)
                            """,
                            source=rel["source"],
                            target=rel["target"],
                            component=rel.get("component", "General"),
                            lead_time_days=rel.get("lead_time_days", 14),
                            criticality=rel.get("criticality", 0.7),
                            single_source=rel.get("single_source", False),
                        )
                    logger.info("Live Neo4j database successfully seeded with schema entities.")
        except Exception as err:
            logger.error(f"Error seeding live Neo4j: {err}")

    # =========================================================================
    # Data Access Queries
    # =========================================================================

    def get_status(self) -> Dict[str, Any]:
        """Returns database connectivity and statistics."""
        return {
            "is_connected": self.is_connected,
            "storage_mode": self.storage_mode,
            "uri": self.uri,
            "total_nodes": len(self.companies_store),
            "total_edges": len(self.relationships_store),
            "total_disruptions": len(self.disruptions_store),
            "graph_density": round(nx.density(self.nx_graph), 4),
        }

    def get_all_companies(
        self,
        category: Optional[str] = None,
        risk_level: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Retrieves company nodes with optional filtering."""
        companies = list(self.companies_store.values())

        if category and category.lower() != "all":
            companies = [c for c in companies if c.get("category", "").lower() == category.lower()]

        if risk_level and risk_level.lower() != "all":
            companies = [c for c in companies if c.get("status", "").lower() == risk_level.lower()]

        # Attach centrality and degree metrics
        for comp in companies:
            c_id = comp["id"]
            if c_id in self.nx_graph:
                comp["in_degree"] = self.nx_graph.in_degree(c_id)
                comp["out_degree"] = self.nx_graph.out_degree(c_id)
                comp["downstream_count"] = len(nx.descendants(self.nx_graph, c_id))
                comp["upstream_count"] = len(nx.ancestors(self.nx_graph, c_id))

        return companies

    def get_company_by_id(self, company_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves a single company node by ID with topological metadata."""
        comp = self.companies_store.get(company_id)
        if not comp:
            return None

        result = dict(comp)
        if company_id in self.nx_graph:
            result["in_degree"] = self.nx_graph.in_degree(company_id)
            result["out_degree"] = self.nx_graph.out_degree(company_id)
            result["downstream_dependents"] = list(nx.descendants(self.nx_graph, company_id))
            result["upstream_suppliers"] = list(nx.ancestors(self.nx_graph, company_id))
            result["direct_downstream"] = [
                self.companies_store[target]["name"]
                for _, target in self.nx_graph.out_edges(company_id)
                if target in self.companies_store
            ]
            result["direct_upstream"] = [
                self.companies_store[source]["name"]
                for source, _ in self.nx_graph.in_edges(company_id)
                if source in self.companies_store
            ]

        return result

    def get_supply_chain_graph(self) -> Dict[str, Any]:
        """
        Returns full graph representation formatted for React Flow visualization,
        including position coordinates, color coding, and connection edges.
        """
        # Tier-based hierarchical layout for React Flow
        tier_x_positions = {
            "Tier 3 - Raw Materials": 100,
            "Tier 2 - Component Foundry": 380,
            "Tier 1 - Subassembly": 680,
            "Tier 0 - OEM": 980,
            "Logistics & Storage": 1280,
            "Wholesale Distribution": 1580,
            "Consumer Retail & Commercial": 1880,
            "Enterprise Fleet & Dealer": 1880,
        }

        # Track y-position spacing per tier
        tier_counters: Dict[str, int] = {}

        formatted_nodes = []
        for comp_id, comp in self.companies_store.items():
            tier = comp.get("tier", "Other")
            y_idx = tier_counters.get(tier, 0)
            tier_counters[tier] = y_idx + 1

            x_pos = tier_x_positions.get(tier, 500)
            y_pos = 120 + (y_idx * 160)

            risk_score = comp.get("risk_score", 30)
            if risk_score <= 30:
                risk_status = "Low Risk"
                color_class = "risk-low"
            elif risk_score <= 60:
                risk_status = "Medium Risk"
                color_class = "risk-medium"
            elif risk_score <= 80:
                risk_status = "High Risk"
                color_class = "risk-high"
            else:
                risk_status = "Critical Risk"
                color_class = "risk-critical"

            formatted_nodes.append({
                "id": comp_id,
                "type": "supplyChainNode",
                "position": {"x": x_pos, "y": y_pos},
                "data": {
                    "id": comp_id,
                    "name": comp.get("name"),
                    "category": comp.get("category"),
                    "tier": comp.get("tier"),
                    "type": comp.get("type"),
                    "city": comp.get("city"),
                    "country": comp.get("country"),
                    "risk_score": comp.get("risk_score"),
                    "status": risk_status,
                    "color_class": color_class,
                    "lead_time_days": comp.get("lead_time_days"),
                    "buffer_days": comp.get("buffer_days"),
                    "single_source": comp.get("single_source", False),
                    "description": comp.get("description"),
                }
            })

        formatted_edges = []
        for idx, rel in enumerate(self.relationships_store):
            edge_id = f"e-{rel['source']}-{rel['target']}"
            formatted_edges.append({
                "id": edge_id,
                "source": rel["source"],
                "target": rel["target"],
                "animated": True,
                "label": rel.get("component", ""),
                "type": "smoothstep",
                "data": {
                    "component": rel.get("component"),
                    "lead_time_days": rel.get("lead_time_days"),
                    "criticality": rel.get("criticality", 0.7),
                    "relationship_type": rel.get("type", "SUPPLIES_TO")
                }
            })

        return {
            "nodes": formatted_nodes,
            "edges": formatted_edges,
            "metadata": {
                "total_nodes": len(formatted_nodes),
                "total_edges": len(formatted_edges),
                "tier_breakdown": {
                    tier: sum(1 for n in formatted_nodes if n["data"]["tier"] == tier)
                    for tier in tier_x_positions.keys()
                }
            }
        }

    def get_disruptions(self, active_only: bool = False) -> List[Dict[str, Any]]:
        """Returns all recorded disruption incidents."""
        if active_only:
            return [d for d in self.disruptions_store if d.get("status") == "Active"]
        return list(self.disruptions_store)

    def save_disruption(self, disruption_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a newly analyzed disruption event into the store."""
        disr_id = disruption_data.get("id") or f"disr-{len(self.disruptions_store) + 1:03d}"
        disruption_data["id"] = disr_id
        self.disruptions_store.insert(0, disruption_data)

        # Update origin company risk score if found
        origin_id = disruption_data.get("origin_company_id")
        if origin_id and origin_id in self.companies_store:
            severity = float(disruption_data.get("severity", 0.7))
            curr_score = self.companies_store[origin_id].get("risk_score", 40.0)
            elevated_score = min(100.0, curr_score + (severity * 30.0))
            self.update_company_risk(origin_id, elevated_score, "Critical Risk" if elevated_score > 80 else "High Risk")

        logger.info(f"Saved disruption: {disruption_data.get('title')} ({disr_id})")
        return disruption_data

    def update_company_risk(self, company_id: str, new_score: float, status: str):
        """Updates a company's real-time risk score."""
        if company_id in self.companies_store:
            self.companies_store[company_id]["risk_score"] = round(new_score, 1)
            self.companies_store[company_id]["status"] = status
            if company_id in self.nx_graph:
                self.nx_graph.nodes[company_id]["risk_score"] = round(new_score, 1)
                self.nx_graph.nodes[company_id]["status"] = status

    def get_downstream_cascade(self, origin_id: str, max_depth: int = 4) -> List[Dict[str, Any]]:
        """
        Calculates all downstream paths and affected companies emanating from origin_id
        using breadth-first graph traversal.
        """
        if origin_id not in self.nx_graph:
            return []

        cascade_nodes = []
        visited = {origin_id}
        queue = [(origin_id, 0, 1.0)]  # (node_id, depth, propagation_strength)

        while queue:
            curr_node, depth, prop_strength = queue.pop(0)
            if depth >= max_depth:
                continue

            for _, neighbor, edge_data in self.nx_graph.out_edges(curr_node, data=True):
                edge_crit = edge_data.get("criticality", 0.7)
                next_strength = prop_strength * edge_crit * 0.9

                if neighbor not in visited:
                    visited.add(neighbor)
                    neighbor_data = self.companies_store.get(neighbor, {})
                    cascade_nodes.append({
                        "node_id": neighbor,
                        "name": neighbor_data.get("name"),
                        "tier": neighbor_data.get("tier"),
                        "category": neighbor_data.get("category"),
                        "depth": depth + 1,
                        "inherited_propagation_prob": round(next_strength, 3),
                        "baseline_risk": neighbor_data.get("risk_score", 30),
                        "projected_risk": round(min(100.0, neighbor_data.get("risk_score", 30) + (next_strength * 40)), 1)
                    })
                    queue.append((neighbor, depth + 1, next_strength))

        return cascade_nodes


# Global Singleton Client Instance
neo4j_client = Neo4jClient()
