/**
 * AtmoGraph - Frontend API Client Service
 */

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

export const api = {
  // Module 1: Dashboard
  getDashboard: async () => {
    const res = await client.get('/dashboard');
    return res.data;
  },

  // Module 2: Supply Chain Network Graph
  getSupplyChainGraph: async () => {
    const res = await client.get('/supply-chain');
    return res.data;
  },

  getCompanies: async (category = null, riskLevel = null) => {
    const params = {};
    if (category && category !== 'All') params.category = category;
    if (riskLevel && riskLevel !== 'All') params.risk_level = riskLevel;
    const res = await client.get('/companies', { params });
    return res.data;
  },

  getCompanyById: async (id) => {
    const res = await client.get(`/companies/${id}`);
    return res.data;
  },

  // Module 3: Disruption Detection (spaCy NLP)
  getDisruptions: async (activeOnly = false) => {
    const res = await client.get('/disruptions', { params: { active_only: activeOnly } });
    return res.data;
  },

  analyzeDisruption: async (text, source = 'Manual Input', isSimulated = false) => {
    const res = await client.post('/disruptions/analyze', {
      text,
      source,
      is_simulated: isSimulated,
    });
    return res.data;
  },

  // Module 4: Ripple Effect Prediction (PyG GNN)
  predictRipple: async (originCompanyId, disruptionCategory = 'Supplier Failures', severity = 0.85, hops = 3) => {
    const res = await client.post('/predict/ripple', {
      origin_company_id: originCompanyId,
      disruption_category: disruptionCategory,
      initial_severity: parseFloat(severity),
      propagation_hops: parseInt(hops, 10),
    });
    return res.data;
  },

  // Module 6: Risk Analysis & Impact Assessment
  getRiskAnalysis: async () => {
    const res = await client.get('/risk-analysis');
    return res.data;
  },

  // Module 7: What-If Scenario Simulator
  simulateScenario: async (originCompanyId, scenarioType, severity = 0.85, durationDays = 21) => {
    const res = await client.post('/simulate', {
      origin_company_id: originCompanyId,
      scenario_type: scenarioType,
      severity_level: parseFloat(severity),
      duration_days: parseInt(durationDays, 10),
    });
    return res.data;
  },

  // Module 8: AI Recommendations
  getRecommendations: async () => {
    const res = await client.get('/recommendations');
    return res.data;
  },

  // Reports
  getReports: async () => {
    const res = await client.get('/reports');
    return res.data;
  },
};

export default api;
