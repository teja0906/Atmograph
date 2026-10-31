# AtmoGraph - REST API Reference & Swagger Specifications
## Complete OpenAPI 3.0 Documentation

Base URL: `http://localhost:8000/api`
Interactive Swagger UI: `http://localhost:8000/docs`
Alternative ReDoc: `http://localhost:8000/redoc`

---

### 1. Dashboard & Telemetry

#### `GET /api/dashboard`
Returns high-level supply chain KPIs, risk distribution, disruption trend analytics, and top vulnerable suppliers.

**Response `200 OK`**:
```json
{
  "kpis": {
    "total_suppliers": 8,
    "total_manufacturers": 3,
    "active_connections": 21,
    "active_disruptions": 4,
    "high_risk_companies": 5,
    "average_disruption_probability": 0.55,
    "predicted_affected_companies": 14,
    "overall_resilience_score": 61.7
  },
  "risk_distribution": [
    { "category": "Low Risk (0-30)", "count": 2, "color": "#10B981" },
    { "category": "Medium Risk (31-60)", "count": 11, "color": "#F59E0B" },
    { "category": "High Risk (61-80)", "count": 4, "color": "#F97316" },
    { "category": "Critical Risk (81-100)", "count": 1, "color": "#EF4444" }
  ],
  "disruption_trends": [ ... ],
  "geographic_risk": [ ... ],
  "recent_disruptions": [ ... ],
  "top_vulnerable_suppliers": [ ... ],
  "database_status": {
    "is_connected": true,
    "storage_mode": "in_memory",
    "total_nodes": 18,
    "total_edges": 21
  }
}
```

---

### 2. Supply Chain Network & Companies

#### `GET /api/supply-chain`
Returns nodes and edges formatted for React Flow graph rendering, complete with coordinates, colors, and attributes.

#### `GET /api/companies`
Query parameters:
- `category` (optional): `Supplier`, `Manufacturer`, `Warehouse`, `Distributor`, `Retailer`
- `risk_level` (optional): `Low Risk`, `Medium Risk`, `High Risk`, `Critical Risk`

#### `GET /api/companies/{company_id}`
Returns granular company profile with direct upstream suppliers and direct downstream consumers.

---

### 3. AI Disruption Detection (NLP)

#### `POST /api/disruptions/analyze`
Extracts entities using spaCy NER, maps taxonomy, resolves Neo4j graph nodes, and persists event.

**Request Body**:
```json
{
  "text": "Typhoon In-fa caused critical damage and flooding at Taiwan Advanced Foundry in Hsinchu. 3nm logic cleanrooms suspended operations for two weeks.",
  "source": "Incident News Wire",
  "is_simulated": false
}
```

**Response `200 OK`**:
```json
{
  "id": "disr-1031132400",
  "title": "Natural Disasters affecting Taiwan Advanced Foundry (TAFC) (Hsinchu)",
  "category": "Natural Disasters",
  "severity": 0.90,
  "confidence": 0.81,
  "origin_company_id": "node-t2-01",
  "origin_company_name": "Taiwan Advanced Foundry (TAFC)",
  "location": "Hsinchu",
  "extracted_entities": [
    { "text": "Taiwan Advanced Foundry", "label": "ORG", "category": "Organization / Enterprise" },
    { "text": "Hsinchu", "label": "GPE", "category": "Geopolitical Entity / Country" },
    { "text": "two weeks", "label": "DATE", "category": "Temporal Timestamp" }
  ],
  "estimated_duration_days": 32,
  "affected_nodes_count": 7,
  "financial_impact_est_usd": "$1.62 Billion",
  "is_simulated": false,
  "summary": "...",
  "detected_at": "2026-10-31T07:54:00Z"
}
```

---

### 4. GNN Ripple Effect Prediction

#### `POST /api/predict/ripple`
Executes forward pass of trained PyG GraphSAGE model on active supply chain network.

**Request Body**:
```json
{
  "origin_company_id": "node-t2-01",
  "disruption_category": "Factory Shutdowns",
  "initial_severity": 0.85,
  "propagation_hops": 3
}
```

**Response `200 OK`**:
```json
{
  "origin_company_id": "node-t2-01",
  "origin_company_name": "Taiwan Advanced Foundry (TAFC)",
  "initial_severity": 0.85,
  "propagation_probability_global": 0.642,
  "affected_companies_count": 7,
  "critical_risk_nodes_count": 3,
  "max_downstream_hops": 3,
  "affected_nodes": [
    {
      "node_id": "node-t1-01",
      "company_name": "Apex Micro-Modules Precision",
      "tier": "Tier 1 - Subassembly",
      "hop_distance": 1,
      "propagation_probability": 0.842,
      "baseline_risk": 68.0,
      "projected_risk": 98.4,
      "risk_delta": 30.4,
      "estimated_buffer_exhaustion_days": 4,
      "criticality_weight": 0.85
    }
  ],
  "propagation_paths": [
    ["node-t2-01", "node-t1-01", "node-mfg-01", "node-wh-03"]
  ],
  "model_metrics": {
    "architecture": "GraphSAGE-2L + MultiTask Head",
    "total_parameters": 2258,
    "test_accuracy": 0.9332,
    "test_roc_auc": 0.9228,
    "test_f1_score": 0.6433,
    "loss_metric": "BCEWithLogitsLoss + MSELoss",
    "training_epochs": 35
  },
  "execution_time_ms": 14.8
}
```

---

### 5. What-If Scenario Simulator

#### `POST /api/simulate`
Simulates dynamic shock cascade and returns time-stepped wave animation states.

**Request Body**:
```json
{
  "origin_company_id": "node-wh-01",
  "scenario_type": "Transportation disruption",
  "severity_level": 0.80,
  "duration_days": 21
}
```

**Response `200 OK`**:
```json
{
  "scenario_id": "sim-a1b2c3d4",
  "scenario_type": "Transportation disruption",
  "origin_company_id": "node-wh-01",
  "origin_company_name": "Rotterdam EuroPort Central Vault",
  "severity": 0.80,
  "duration_days": 21,
  "total_affected_companies": 4,
  "total_revenue_loss_est_usd": "$217 Million",
  "max_network_delay_days": 18,
  "ripple_steps": [
    {
      "step_number": 0,
      "active_wave_node_ids": ["node-wh-01"],
      "active_edge_ids": [],
      "description": "Initial shock impact at Rotterdam EuroPort Central Vault...",
      "accumulated_delay_days": 8,
      "accumulated_revenue_loss_usd": 96.0
    }
  ],
  "mitigation_actions": [ ... ]
}
```

---

### 6. AI Recommendations & Reports

#### `GET /api/recommendations`
Returns prioritized mitigation playbooks and pre-qualified alternative suppliers for dual-sourcing.

#### `GET /api/reports`
Returns executive-level briefing document with audit metadata and resilience grading.
