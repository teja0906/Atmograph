<div align="center">

# 🌐 AtmoGraph – Supply Chain Ripple Effect Predictor
### *Enterprise AI-Powered Supply Chain Intelligence & Ripple Cascade Forecaster*

[![Python Version](https://img.shields.io/badge/Python-3.11-3776AB.svg?style=flat&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PyTorch Geometric](https://img.shields.io/badge/PyG-GraphSAGE-EE4C2C.svg?style=flat&logo=pytorch&logoColor=white)](https://pyg.org)
[![spaCy](https://img.shields.io/badge/spaCy-3.8+-09A3D5.svg?style=flat&logo=spacy&logoColor=white)](https://spacy.io)
[![Neo4j](https://img.shields.io/badge/Neo4j-Graph_DB-45818E.svg?style=flat&logo=neo4j&logoColor=white)](https://neo4j.com)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![React Flow](https://img.shields.io/badge/React_Flow-Interactive_Graph-FF0072.svg?style=flat)](https://reactflow.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<p align="center">
  <b>Predicting how disruptions in one supplier, factory, or maritime corridor propagate through interconnected global enterprises before damage occurs.</b>
</p>

[Quick Start](#-quick-start-guide) • [Architecture](#-system-architecture) • [Core Modules](#-core-application-modules) • [GNN Model](#-graph-neural-network-engine) • [API Specs](#-rest-api-documentation) • [Testing](#-testing--verification)

</div>

---

## 📌 Executive Summary & Problem Statement

Modern global supply chains are hyper-connected multi-tier networks. When a Tier-3 raw material supplier suffers an earthquake, or a major maritime canal is blocked, the effects do not stay localized—they amplify exponentially into downstream component fabricators, sub-system assemblers, Original Equipment Manufacturers (OEMs), and consumer retailers.

**The Real-World Dilemma**:
1. **Limited Multi-Tier Visibility**: Traditional ERP tools (SAP, Oracle) provide visibility only into direct Tier-1 suppliers. Vulnerabilities hidden at Tier-2 and Tier-3 go unnoticed until production lines halt.
2. **Delayed Reaction to Signals**: Disruption signals appear in news headlines, weather bulletins, and port reports days or weeks before formal vendor notifications arrive.
3. **The Bullwhip Amplification**: A 10-day delay at a silicon wafer foundry can cascade into a 60-day manufacturing shutdown and hundreds of millions in lost revenue downstream.

**AtmoGraph** addresses these challenges by uniting **Graph Databases (Neo4j)**, **Natural Language Processing (spaCy)**, and **Inductive Graph Neural Networks (PyTorch Geometric)** into a command-center web application that autonomously maps supply dependencies, extracts disruption intelligence from unstructured news, forecasts multi-step ripple propagation, and generates tactical mitigation playbooks.

---

## 🛠️ Mandatory Technology Stack

| Layer | Technology | Version | Purpose & Implementation |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | **React** | `18.3.1` | Single-page enterprise command center application |
| **Graph Visualization** | **React Flow** | `@xyflow/react` | Interactive supply chain network canvas with custom nodes, animated waves, and path highlighting |
| **Analytical Visuals** | **Recharts** | `2.12.7` | Risk distribution, category breakdown, resilience trends, and factor radar charts |
| **Icons & Styling** | **Lucide React & Tailwind CSS** | `0.454.0` / `3.4.1` | Dark command-center UI, glassmorphism, glowing risk indicators, responsive layouts |
| **Backend Framework** | **FastAPI** | `0.115.0+` | High-performance asynchronous Python REST APIs with automatic Swagger / OpenAPI |
| **Data Validation** | **Pydantic** | `2.9.2+` | Strict schema serialization and runtime type safety |
| **Graph Database** | **Neo4j** | `5.25.0` (Dual-Mode) | Graph schema with Cypher queries + embedded high-speed NetworkX fallback |
| **NLP Engine** | **spaCy** | `3.8.18` (`en_core_web_sm`) | Named Entity Recognition (NER), taxonomy categorization, linguistic intensity scoring |
| **Machine Learning** | **PyTorch & PyTorch Geometric** | `2.15.0+cpu` / `2.8.1` | Inductive 2-Layer GraphSAGE with multi-task prediction heads (cascade probability & risk delta) |

---

## 🏛️ System Architecture

```
                                  AtmoGraph Enterprise Architecture
 
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   FRONTEND (React 18)                                       │
 │  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐  │
 │  │   Module 1: Dashboard   │  │ Module 2: React Flow Graph│  │ Module 3: Disruption NLP  │  │
 │  └─────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘  │
 │  ┌─────────────────────────┐  ┌───────────────────────────┐  ┌───────────────────────────┐  │
 │  │ Module 4: GNN Prediction│  │ Module 6: Risk Analysis   │  │ Module 7: What-If Simulator│ │
 │  └─────────────────────────┘  └───────────────────────────┘  └───────────────────────────┘  │
 └──────────────────────────────────────────────┬──────────────────────────────────────────────┘
                                                │ REST API (JSON / HTTP)
 ┌──────────────────────────────────────────────▼──────────────────────────────────────────────┐
 │                                 BACKEND (Python 3.11 / FastAPI)                             │
 │  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │ REST API Routers: /dashboard | /supply-chain | /disruptions | /predict/ripple | ...  │  │
 │  └───────────────────────────────────────┬───────────────────────────────────────────────┘  │
 │                                          │                                                  │
 │            ┌─────────────────────────────┼─────────────────────────────┐                    │
 │            ▼                             ▼                             ▼                    │
 │  ┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐           │
 │  │   spaCy NLP      │          │ PyG GraphSAGE GNN│          │ Multi-Factor Risk│           │
 │  │ Disruption Engine│          │ Prediction Model │          │ Scoring Engine   │           │
 │  │ (NER & Taxonomy) │          │ (supply_chain_   │          │ (Transparent &   │           │
 │  │                  │          │  gnn.pt)         │          │  Configurable)   │           │
 │  └─────────┬────────┘          └─────────┬────────┘          └─────────┬────────┘           │
 └────────────┼─────────────────────────────┼─────────────────────────────┼────────────────────┘
              │                             │                             │
 ┌────────────▼─────────────────────────────▼─────────────────────────────▼────────────────────┐
 │                               GRAPH PERSISTENCE LAYER                                       │
 │  ┌───────────────────────────────────────────────────────────────────────────────────────┐  │
 │  │ Dual-Mode Graph Engine (neo4j_client.py)                                              │  │
 │  │  ├── Mode A (Active Neo4j Server): Native Bolt Driver with Cypher Queries             │  │
 │  │  └── Mode B (Embedded Standalone): NetworkX Multigraph Fallback (Zero Config Needed!) │  │
 │  └───────────────────────────────────────────────────────────────────────────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version `3.11` (or Python 3.10+)
- **Node.js**: Version `18.x` or `20.x` (and `npm`)

### 1. One-Click Launch (Windows)
The repository includes automated one-click launchers that require zero environment setup:

```cmd
# Double click or run in terminal to start the complete system:
start_all.bat
```
This automatically:
1. Resolves the Python 3.11 runtime.
2. Launches the FastAPI backend on port `8000`.
3. Opens your default browser directly to the web dashboard at `http://127.0.0.1:8000/`.

---

### 2. Manual Step-by-Step Setup

#### A. Backend Setup
```bash
# 1. Navigate to the repository root
cd Atmograph

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Download the spaCy English NLP model
python -m spacy download en_core_web_sm

# 4. (Optional) Run the GNN model training script
python ml/train.py

# 5. Launch the FastAPI server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --app-dir backend
```
*API documentation will now be live at `http://127.0.0.1:8000/docs`.*

#### B. Frontend Development Server (Optional)
If you wish to edit the frontend with live Hot Module Reloading (Vite):
```bash
# In a separate terminal:
cd frontend
npm install
npm run dev
```
*The Vite live dev server runs at `http://localhost:5173/` and proxies all API requests to port `8000`.*

---

## 📦 Core Application Modules

### 1. Interactive Command Dashboard (`Module 1`)
- **Executive Metrics**: Total Suppliers, Manufacturers, Logistics Hubs, Active Connections, Detected Disruptions, High-Risk Companies, Mean Disruption Probability, and Global Resilience Score.
- **Analytics**: Real-time Recharts visualizations showing risk category distribution, disruptions by category, and chronological disruption timeline.
- **Top 5 Vulnerable Suppliers**: Highlighting sole-source flags, buffer deficits, and critical dependencies.

### 2. Supply Chain Network Canvas (`Module 2`)
- **React Flow Graph**: Dynamic interactive canvas with pan, zoom, fit view, minimap, and auto-layout.
- **Custom Nodes**: Distinct visual hierarchy across Raw Materials, Foundries, Modules, OEMs, Logistics, Distribution, and Retail.
- **Risk Indicators**: Color-coded borders and glowing status pills:
  - 🟢 **Low Risk** ($0-30$)
  - 🟡 **Medium Risk** ($31-60$)
  - 🟠 **High Risk** ($61-80$)
  - 🔴 **Critical Risk** ($81-100$)
- **Downstream Cascade Highlighting**: Click any node to instantly trace and highlight all connected downstream dependencies.
- **Animated Disruption Waves**: Watch disruption propagation ripple through the network edges in real-time.

### 3. AI-Powered Disruption Detection (`Module 3`)
- **NLP Text Intake**: Paste raw news stories, weather alerts, or port logs into the interface.
- **spaCy Entity Extraction**: Extracts organizations (`ORG`), locations (`GPE`), and temporal references (`DATE`).
- **Entity Resolution**: Matches unstructured mentions (e.g. *"Taiwan Advanced Foundry"*) to graph node IDs (`node-raw-01`).
- **Taxonomy Classification**: Classifies incidents into Natural Disasters, Factory Shutdowns, Transportation Delays, Raw Material Shortages, Supplier Failures, or Political Instability.
- **Linguistic Severity Scoring**: Computes disruption intensity ($0.0 - 1.0$) based on syntactic modifier cues.
- **Neo4j Persistence**: Saves detected disruptions directly into the graph schema.

### 4. Ripple Effect Prediction Engine (`Module 4`)
- **Inductive PyG GNN**: Uses a trained GraphSAGE neural network to analyze topology and node features.
- **Outputs**:
  - Probability of propagation for every connected entity ($0.0 - 1.0$).
  - Expected risk delta ($\Delta_{risk}$) following disruption.
  - Multi-hop propagation cascade paths.
- **Explainability**: Clear visual distinction between AI model predictions and heuristic fallback rules, complete with live Model Performance Metrics ($93.32\%$ Accuracy, $0.9228$ AUC).

### 5. Neo4j Graph Database Integration (`Module 5`)
- **Graph Data Model**: Nodes (`Supplier`, `Manufacturer`, `Warehouse`, `Distributor`, `Retailer`, `Disruption`, `Location`) connected by relationships (`SUPPLIES_TO`, `DISTRIBUTES_TO`, `TRANSPORTS_TO`, `LOCATED_IN`, `AFFECTED_BY`).
- **Dual-Mode Architecture**: Operates against a live Neo4j database using Bolt driver, or automatically switches to the embedded in-memory graph repository if Neo4j is offline.
- **DDL Schema & Cypher Queries**: Fully documented in `backend/app/database/schema.cypher`.

### 6. Transparent Risk Analysis (`Module 6`)
- **Mathematical Transparency**: Avoids opaque black-box numbers. Displays exact factor contributions:
  1. *GNN Propagation Probability* ($30\%$)
  2. *Upstream Dependency Breadth* ($25\%$)
  3. *Sole-Source Vulnerability* ($20\%$)
  4. *Buffer Stock Deficit* ($15\%$)
  5. *Geopolitical Exposure* ($10\%$)
- **Visual Factor Radar**: Multi-axis radar breakdown for individual company risk profiles.
- **Critical Dependency Paths**: Identifies bottleneck routes that can paralyze manufacturing.

### 7. What-If Scenario Simulator (`Module 7`)
- **Interactive Simulation**: Select any company, choose a scenario type (Factory Shutdown, Maritime Route Congestion, Critical Shortage), and adjust severity ($10\% - 100\%$).
- **Time-Stepped Cascade Waves**: Step through propagation waves ($T_0 \to T_1 \to T_2 \to T_3$) with an interactive playback controller.
- **Quantified Business Impact**: Calculates estimated direct revenue loss (\$ Millions) and compounding delivery delay (days).
- **Automated Mitigation Playbook**: Synthesizes actionable operational countermeasures for each wave.

### 8. AI Recommendations Engine (`Module 8`)
- **Alternative Supplier Matcher**: Automatically scans the graph to find qualified alternative suppliers in non-overlapping geographic regions to eliminate single points of failure.
- **Strategic Directives**: Identifies buffer expansion recommendations, multi-sourcing mandates, and transport rerouting options.

---

## 🧠 Graph Neural Network Engine

### Architecture
The GNN is implemented in `backend/app/ml/gnn_model.py` using **PyTorch Geometric**:
- **Layer 1**: `SAGEConv(in_channels=6, out_channels=32)` + `LayerNorm` + `ReLU` + `Dropout(0.2)`
- **Layer 2**: `SAGEConv(in_channels=32, out_channels=32)` + `LayerNorm` + `ReLU` + `Dropout(0.2)`
- **Primary Head**: Linear layer $\to$ Sigmoid $\to$ Propagation Probability ($y_{prop} \in [0, 1]$)
- **Secondary Head**: Linear layer $\to$ Tanh $\to$ Risk Score Delta ($\Delta_{risk} \in [-50, +50]$)

### Feature Vector Representation ($D=6$)
For each node $v$:
$$\mathbf{x}_v = \big[ \text{Severity}(v), \text{InDegree}(v), \text{OutDegree}(v), \text{BufferDeficit}(v), \text{SoleSource}(v), \text{GeoVulnerability}(v) \big]$$

### Model Training & Verification Metrics
The model was trained on multi-tier synthetic supply chain topologies generated in `ml/data_preprocessing.py`:
- **Training Epochs**: 35
- **Optimizer**: Adam ($lr=0.005$, weight decay $10^{-4}$)
- **Loss Function**: Multi-Task BCE Loss + 0.1 * MSE Loss
- **Test Accuracy**: **`93.32%`**
- **Test ROC-AUC**: **`0.9228`**
- **Test F1-Score**: **`0.9104`**

To re-train or evaluate the model at any time:
```bash
python ml/train.py     # Generates dataset, trains GNN, saves supply_chain_gnn.pt
python ml/evaluate.py  # Evaluates checkpoint and reports classification metrics
```

---

## 🔌 REST API Documentation

FastAPI serves interactive documentation at:
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Dashboard KPIs, risk distribution, disruption categories, resilience score |
| `GET` | `/api/supply-chain` | Complete supply chain graph (nodes, edges, risk scores, locations) |
| `GET` | `/api/companies` | Company directory with search, type filters, and risk filters |
| `GET` | `/api/disruptions` | Historical and detected disruption records |
| `POST`| `/api/disruptions/analyze` | Ingests news text $\to$ spaCy extraction $\to$ classification $\to$ graph persist |
| `POST`| `/api/predict/ripple` | GNN inference forecasting disruption spread and cascade paths |
| `GET` | `/api/risk-analysis` | Transparent multi-factor risk scores and bottleneck paths |
| `POST`| `/api/simulate` | Executes multi-wave What-If cascade simulation with financial loss |
| `GET` | `/api/recommendations` | AI mitigation actions and qualified alternative suppliers |
| `GET` | `/api/reports` | Executive briefing document with JSON export payload |

---

## 🧪 Testing & Verification

AtmoGraph includes a complete automated test suite ensuring every module, ML tensor calculation, and API endpoint operates reliably.

```bash
# Run the 7-step End-to-End System Integration Suite:
python tests/run_tests.py

# Run the 9-endpoint REST API Pytest Suite:
pytest tests/test_backend.py -v
```

### Test Verification Summary:
- **`run_tests.py`**: **7/7 PASSED** (100% Success Rate)
- **`test_backend.py`**: **9/9 PASSED** (100% Success Rate)

For complete testing methodology and assertions, see [`docs/testing.md`](docs/testing.md).

---

## 📁 Repository Directory Structure

```
AtmoGraph/
│
├── start_all.bat              # One-click system launcher (Windows)
├── start_backend.bat          # Standalone FastAPI server launcher
├── start_frontend.bat         # Standalone Vite frontend dev launcher
├── start_backend.sh           # Linux / macOS backend launcher
├── .env.example               # Environment variables template
├── .env                       # Active environment configuration
├── README.md                  # Project documentation
│
├── backend/
│   ├── requirements.txt       # Python dependencies
│   └── app/
│       ├── main.py            # FastAPI entrypoint & static frontend mount
│       ├── api/
│       │   └── endpoints.py   # REST API route implementations
│       ├── database/
│       │   ├── neo4j_client.py# Dual-mode Neo4j / NetworkX graph engine
│       │   ├── schema.cypher  # Neo4j DDL schema and sample Cypher queries
│       │   └── seed_data.py   # Multi-tier enterprise supply chain seed data
│       ├── models/
│       │   └── schemas.py     # Pydantic schemas and validation models
│       ├── nlp/
│       │   └── extractor.py   # spaCy NER and disruption taxonomy classifier
│       ├── ml/
│       │   ├── gnn_model.py   # PyG 2-layer GraphSAGE architecture
│       │   └── checkpoints/   # Trained model weights & metrics
│       │       ├── supply_chain_gnn.pt
│       │       └── model_metrics.json
│       └── services/
│           ├── ripple_engine.py   # GNN ripple effect predictor
│           ├── risk_analyzer.py   # Multi-factor transparent risk scoring
│           ├── simulator.py       # What-If scenario wave cascade simulator
│           └── recommender.py     # Alternative supplier and mitigation engine
│
├── ml/
│   ├── data_preprocessing.py # Synthetic multi-tier graph generator
│   ├── train.py              # PyG GNN training loop
│   ├── evaluate.py           # Model evaluation and metrics reporter
│   └── predict.py            # Real-time GNN inference service
│
├── frontend/
│   ├── package.json          # Node.js dependencies
│   ├── vite.config.js        # Vite build configuration with API proxy
│   ├── tailwind.config.js    # Tailwind enterprise dark theme configuration
│   ├── dist/                 # Production compiled build (served by backend)
│   └── src/
│       ├── main.jsx          # React DOM entrypoint
│       ├── App.jsx           # Root application component and layout
│       ├── index.css         # Global styles and React Flow overrides
│       ├── components/       # TopNav, Sidebar, shared UI widgets
│       ├── graph/            # Custom React Flow SupplyChainNode
│       ├── pages/            # 9 enterprise module view components
│       └── services/         # Axios API client services
│
├── docs/
│   ├── architecture.md       # Technical architecture specification
│   ├── methodology.md        # Mathematical formulations and ML methodology
│   ├── api_documentation.md  # Detailed API endpoint documentation
│   ├── user_guide.md         # End-user operator manual
│   ├── testing.md            # Test specifications and execution instructions
│   └── presentation_summary.md# Technical project defense & presentation guide
│
└── tests/
    ├── run_tests.py          # 7-step End-to-End integration test suite
    └── test_backend.py       # 9-endpoint FastAPI pytest suite
```

---

## 📄 License
This project is licensed under the MIT License. See `LICENSE` for details.
