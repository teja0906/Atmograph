# AtmoGraph - Enterprise User & Operator Guide
## Step-by-Step Walkthrough for Supply Chain Control Tower Operations

Welcome to **AtmoGraph – Supply Chain Ripple Effect Predictor**. This guide walks through operating the intelligence modules, conducting GNN simulations, and executing remediations.

---

### Step 1: Navigating the Executive Dashboard (Overview)
1. Launch the platform at `http://localhost:8000` (or `http://localhost:5173` in development mode).
2. The **Executive Command Center** displays 8 real-time KPIs:
   - Total Suppliers, Manufacturers, and Logistics Connections.
   - High-Risk Bottlenecks and Currently Detected Disruptions.
   - Global Resilience Score ($0-100$).
3. Review the **Risk Distribution** donut chart, **Disruption Trend** area chart, and **Top 5 Vulnerable Suppliers**.
4. Click **Simulate** next to any vulnerable supplier to immediately test shock impact.

---

### Step 2: Exploring the Interactive Supply Chain Network
1. Click **Supply Chain Network** in the left sidebar.
2. The canvas renders a multi-tier flow from Tier-3 Raw Materials (left) to Retail & Fleet Consumers (right).
3. **Controls**:
   - Pan by dragging the canvas background.
   - Zoom in/out using scroll wheel or the corner control buttons.
   - Drag any node to customize visual layout.
4. **Vulnerability Colors**:
   - 🟢 Green: Low Risk ($0-30$)
   - 🟡 Yellow: Medium Risk ($31-60$)
   - 🟠 Orange: High Risk ($61-80$)
   - 🔴 Red: Critical Risk ($81-100$)
5. **Node Inspection**:
   - Click on any node (e.g. `Taiwan Advanced Foundry (TAFC)`).
   - An inspection drawer slides out showing inventory buffer days, lead time, direct upstream suppliers, and direct downstream consumers.
   - All outgoing downstream connections automatically highlight in red/orange.
6. **Live Animation**:
   - Click **Animate Ripple on [Company]** to observe multi-wave animated pulse lines traveling across connected supply routes!

---

### Step 3: Detecting Disruptions via spaCy NLP
1. Select **Disruption Detection** from the sidebar.
2. Use one of the pre-loaded incident scenarios (e.g., *Taiwan Fab Shutdown*, *Rotterdam Port Congestion*, or *Lithium Mine Strike*), or paste custom text from a news feed.
3. Choose whether to mark the event as a simulated stress test or detected real incident.
4. Click **Analyze Disruption Report**.
5. spaCy automatically:
   - Extracts organizations, locations, and dates.
   - Classifies taxonomy into one of 6 core disruption categories.
   - Estimates shock severity ($0.1-1.0$), projected duration, and financial damage.
   - Resolves text entities to exact Neo4j graph nodes.
   - Logs the event permanently into the Neo4j Disruption Registry.

---

### Step 4: Predicting Ripple Cascades with the GNN Engine
1. Select **Ripple Prediction** from the sidebar.
2. Choose an **Origin Entity** (e.g., `Taiwan Advanced Foundry (TAFC)`), specify disruption category, severity level, and propagation cutoff hops.
3. Click **Predict Ripple Effect**.
4. The trained **PyTorch Geometric GraphSAGE** model computes:
   - Probability of disruption transmission across every downstream link ($P \in [0, 1]$).
   - Expected risk elevation score ($\Delta R$).
   - Estimated days until buffer stock exhaustion.
   - Discovered critical cascade paths.
5. Review the **Architecture Specifications** card confirming test accuracy ($93.3\%$) and inference latency ($<15 \text{ ms}$).

---

### Step 5: Conducting What-If Scenario Simulations
1. Select **Scenario Simulator** from the sidebar.
2. Select a target facility, choose a scenario type (*Supplier shutdown*, *Transportation disruption*, *Raw material shortage*, *Natural disaster*, *Production delay*), and set duration.
3. Click **Simulate Ripple Effect**.
4. Use the **Propagation Wave Player**:
   - Step through **Wave 0 (Origin Shock)** $\to$ **Wave 1 (Subassemblies)** $\to$ **Wave 2 (OEMs)** $\to$ **Wave 3 (Warehouses)** $\to$ **Wave 4 (Retailers)**.
   - Click **Play Cascade** to view automated time-stepped progression.
   - Review accumulated revenue losses and network transit delay days.
5. Review the generated **Actionable Mitigation Playbook**.

---

### Step 6: Reviewing AI Recommendations & Exporting Briefings
1. Navigate to **AI Recommendations** to review prioritized mitigation playbooks.
2. High-risk bottlenecks feature **Qualified Alternative Suppliers for Dual-Sourcing** with similarity percentages, country diversification, and lead time deltas.
3. Navigate to **Reports & Analytics** to view the quarterly executive intelligence briefing.
4. Click **Export JSON** to download machine-readable audit payloads, or **Print Briefing** for executive presentation.
