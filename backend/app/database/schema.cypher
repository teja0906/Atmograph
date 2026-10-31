// ==============================================================================
// AtmoGraph Neo4j Database Schema & Cypher Specifications
// ==============================================================================

// 1. UNIQUE CONSTRAINTS
CREATE CONSTRAINT company_id_unique IF NOT EXISTS
FOR (c:Company) REQUIRE c.id IS UNIQUE;

CREATE CONSTRAINT supplier_id_unique IF NOT EXISTS
FOR (s:Supplier) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT manufacturer_id_unique IF NOT EXISTS
FOR (m:Manufacturer) REQUIRE m.id IS UNIQUE;

CREATE CONSTRAINT warehouse_id_unique IF NOT EXISTS
FOR (w:Warehouse) REQUIRE w.id IS UNIQUE;

CREATE CONSTRAINT distributor_id_unique IF NOT EXISTS
FOR (d:Distributor) REQUIRE d.id IS UNIQUE;

CREATE CONSTRAINT retailer_id_unique IF NOT EXISTS
FOR (r:Retailer) REQUIRE r.id IS UNIQUE;

CREATE CONSTRAINT disruption_id_unique IF NOT EXISTS
FOR (x:Disruption) REQUIRE x.id IS UNIQUE;

CREATE CONSTRAINT location_id_unique IF NOT EXISTS
FOR (l:Location) REQUIRE l.id IS UNIQUE;

// 2. SEARCH & PERFORMANCE INDEXES
CREATE INDEX company_name_idx IF NOT EXISTS
FOR (c:Company) ON (c.name);

CREATE INDEX company_risk_idx IF NOT EXISTS
FOR (c:Company) ON (c.risk_score);

CREATE INDEX disruption_category_idx IF NOT EXISTS
FOR (x:Disruption) ON (x.category);

CREATE INDEX location_country_idx IF NOT EXISTS
FOR (l:Location) ON (l.country);

// ==============================================================================
// 3. CORE RELATIONSHIPS
// (:Supplier)-[:SUPPLIES_TO {lead_time_days: int, component: string, single_source: boolean}]->(:Manufacturer)
// (:Manufacturer)-[:DISTRIBUTES_TO {volume_units: int, mode: string}]->(:Warehouse)
// (:Warehouse)-[:DISTRIBUTES_TO {shipping_days: int}]->(:Distributor)
// (:Distributor)-[:TRANSPORTS_TO {corridor: string, risk_weight: float}]->(:Retailer)
// (:Company)-[:LOCATED_IN]->(:Location)
// (:Company)-[:AFFECTED_BY {impact_severity: float, detected_at: datetime}]->(:Disruption)
// ==============================================================================

// Example Cypher: Retrieve entire supply chain with risk states
// MATCH (n) OPTIONAL MATCH (n)-[r]->(m) RETURN n, r, m;

// Example Cypher: Downstream propagation query (Variable length traversal up to 4 hops)
// MATCH path = (origin:Supplier {id: $supplier_id})-[:SUPPLIES_TO|DISTRIBUTES_TO|TRANSPORTS_TO*1..4]->(downstream)
// RETURN path, [node IN nodes(path) | node.name] AS cascade_path, downstream.name, downstream.risk_score;

// Example Cypher: Find most critical bottleneck suppliers
// MATCH (s:Supplier)-[:SUPPLIES_TO]->(m:Manufacturer)
// WITH s, count(m) AS downstream_fanout
// ORDER BY downstream_fanout DESC
// RETURN s.name, s.category, downstream_fanout, s.risk_score;
