"""
AtmoGraph - Pydantic Schemas and Data Transfer Objects (DTO)
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# =============================================================================
# Supply Chain Entities
# =============================================================================

class NodeData(BaseModel):
    id: str
    name: str
    category: str
    tier: str
    type: str
    city: str
    country: str
    risk_score: float
    status: str
    color_class: str
    lead_time_days: Optional[int] = 14
    buffer_days: Optional[int] = 15
    single_source: bool = False
    description: Optional[str] = None


class GraphNode(BaseModel):
    id: str
    type: str = "supplyChainNode"
    position: Dict[str, float]
    data: NodeData


class GraphEdgeData(BaseModel):
    component: Optional[str] = None
    lead_time_days: Optional[int] = None
    criticality: Optional[float] = 0.7
    relationship_type: Optional[str] = "SUPPLIES_TO"


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    animated: bool = True
    label: Optional[str] = None
    type: str = "smoothstep"
    data: GraphEdgeData


class SupplyChainGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    metadata: Dict[str, Any]


class CompanyDetail(BaseModel):
    id: str
    name: str
    category: str
    tier: str
    type: str
    city: str
    country: str
    risk_score: float
    status: str
    financial_criticality: float
    single_source: bool
    buffer_days: int
    lead_time_days: int
    lead_time_variance: float
    description: Optional[str] = None
    in_degree: Optional[int] = 0
    out_degree: Optional[int] = 0
    downstream_count: Optional[int] = 0
    upstream_count: Optional[int] = 0
    direct_downstream: Optional[List[str]] = []
    direct_upstream: Optional[List[str]] = []


# =============================================================================
# Disruption Detection (NLP)
# =============================================================================

class DisruptionAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw incident text report or news excerpt")
    source: Optional[str] = "Manual Input"
    is_simulated: Optional[bool] = False


class DisruptionEntity(BaseModel):
    text: str
    label: str
    category: str


class DisruptionAnalysisResponse(BaseModel):
    id: str
    title: str
    category: str
    severity: float
    confidence: float
    origin_company_id: Optional[str] = None
    origin_company_name: Optional[str] = None
    location: str
    extracted_entities: List[DisruptionEntity]
    estimated_duration_days: int
    affected_nodes_count: int
    financial_impact_est_usd: str
    is_simulated: bool
    summary: str
    detected_at: str


class DisruptionItem(BaseModel):
    id: str
    title: str
    category: str
    severity: float
    status: str
    detected_at: str
    origin_company_id: Optional[str] = None
    origin_company_name: Optional[str] = None
    location: str
    estimated_duration_days: int
    affected_nodes_count: int
    financial_impact_est_usd: str
    is_simulated: bool
    summary: str


# =============================================================================
# Ripple Effect Prediction (GNN)
# =============================================================================

class RipplePredictRequest(BaseModel):
    origin_company_id: str
    disruption_category: str = "Supplier Failures"
    initial_severity: float = Field(0.8, ge=0.0, le=1.0)
    propagation_hops: int = Field(3, ge=1, le=5)


class AffectedNodePrediction(BaseModel):
    node_id: str
    company_name: str
    tier: str
    hop_distance: int
    propagation_probability: float
    baseline_risk: float
    projected_risk: float
    risk_delta: float
    estimated_buffer_exhaustion_days: int
    criticality_weight: float


class ModelMetrics(BaseModel):
    architecture: str
    total_parameters: int
    test_accuracy: float
    test_roc_auc: float
    test_f1_score: float
    loss_metric: str
    training_epochs: int


class RipplePredictResponse(BaseModel):
    origin_company_id: str
    origin_company_name: str
    initial_severity: float
    propagation_probability_global: float
    affected_companies_count: int
    critical_risk_nodes_count: int
    max_downstream_hops: int
    affected_nodes: List[AffectedNodePrediction]
    propagation_paths: List[List[str]]
    model_metrics: ModelMetrics
    execution_time_ms: float


# =============================================================================
# Risk Analysis & Impact Assessment
# =============================================================================

class DependencyPath(BaseModel):
    path: List[str]
    bottleneck_node: str
    combined_lead_time_days: int
    vulnerability_score: float


class RiskScoreBreakdown(BaseModel):
    structural_centrality: float
    upstream_exposure: float
    single_source_penalty: float
    buffer_deficiency: float
    geographic_hazard: float


class CompanyRiskAssessment(BaseModel):
    company_id: str
    company_name: str
    category: str
    tier: str
    location: str
    overall_risk_score: float
    risk_category: str  # Low, Medium, High, Critical
    disruption_probability: float
    downstream_exposure_count: int
    estimated_delay_days: int
    score_breakdown: RiskScoreBreakdown
    critical_paths: List[DependencyPath]


class RiskOverviewResponse(BaseModel):
    average_network_risk: float
    resilience_score: float
    high_risk_count: int
    critical_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    risk_distribution: List[Dict[str, Any]]
    companies: List[CompanyRiskAssessment]


# =============================================================================
# What-If Scenario Simulator
# =============================================================================

class ScenarioSimulateRequest(BaseModel):
    origin_company_id: str
    scenario_type: str = Field(
        ...,
        description="Supplier shutdown, Transportation disruption, Raw material shortage, Natural disaster, Production delay"
    )
    severity_level: float = Field(0.85, ge=0.1, le=1.0)
    duration_days: int = Field(21, ge=1, le=180)


class SimulationCascadeStep(BaseModel):
    step_number: int
    active_wave_node_ids: List[str]
    active_edge_ids: List[str]
    description: str
    accumulated_delay_days: int
    accumulated_revenue_loss_usd: float


class ScenarioSimulateResponse(BaseModel):
    scenario_id: str
    scenario_type: str
    origin_company_id: str
    origin_company_name: str
    severity: float
    duration_days: int
    total_affected_companies: int
    total_revenue_loss_est_usd: str
    max_network_delay_days: int
    ripple_steps: List[SimulationCascadeStep]
    affected_nodes: List[AffectedNodePrediction]
    mitigation_actions: List[str]


# =============================================================================
# AI Recommendations
# =============================================================================

class AlternativeSupplierOption(BaseModel):
    supplier_id: str
    supplier_name: str
    country: str
    lead_time_days: int
    similarity_score: float
    cost_delta_percent: float


class RecommendationItem(BaseModel):
    id: str
    title: str
    priority: str  # Critical, High, Medium, Low
    category: str
    target_company_id: str
    target_company_name: str
    problem_statement: str
    actionable_remediation: str
    expected_risk_reduction_percent: float
    estimated_cost_level: str
    is_model_driven: bool
    alternative_suppliers: Optional[List[AlternativeSupplierOption]] = []


class RecommendationsResponse(BaseModel):
    total_recommendations: int
    model_driven_count: int
    top_priority_count: int
    recommendations: List[RecommendationItem]


# =============================================================================
# Dashboard Overview
# =============================================================================

class DashboardKPIs(BaseModel):
    total_suppliers: int
    total_manufacturers: int
    active_connections: int
    active_disruptions: int
    high_risk_companies: int
    average_disruption_probability: float
    predicted_affected_companies: int
    overall_resilience_score: float


class VulnerableSupplier(BaseModel):
    id: str
    name: str
    category: str
    country: str
    risk_score: float
    status: str
    downstream_impact_count: int
    single_source: bool


class DashboardResponse(BaseModel):
    kpis: DashboardKPIs
    risk_distribution: List[Dict[str, Any]]
    disruption_trends: List[Dict[str, Any]]
    geographic_risk: List[Dict[str, Any]]
    recent_disruptions: List[DisruptionItem]
    top_vulnerable_suppliers: List[VulnerableSupplier]
    database_status: Dict[str, Any]
