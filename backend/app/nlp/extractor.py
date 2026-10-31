"""
AtmoGraph - spaCy Natural Language Processing & Disruption Extraction Engine
Processes free-form text reports, news articles, and incident feeds to extract
organizations, locations, event types, severity scores, and affected supply chain nodes.
"""

import re
import datetime
import logging
from typing import List, Dict, Any, Tuple, Optional
import spacy
from spacy.tokens import Doc

from app.database.neo4j_client import neo4j_client

logger = logging.getLogger("atmograph.nlp")


class DisruptionExtractor:
    """
    Intelligent NLP pipeline utilizing spaCy NER, semantic keyword clustering,
    and supply chain entity matching.
    """

    TAXONOMY_KEYWORDS = {
        "Natural Disasters": [
            "typhoon", "earthquake", "flood", "flooding", "heavy rainfall", "tsunami",
            "hurricane", "wildfire", "cyclone", "monsoon", "landslide", "extreme weather"
        ],
        "Transportation Delays": [
            "port congestion", "shipping delay", "vessel", "freight", "dock strike",
            "canal blockage", "container shortage", "rail bottleneck", "air cargo",
            "berthing delay", "customs backlog", "anchorage", "transit delay"
        ],
        "Supplier Failures": [
            "insolvency", "bankruptcy", "quality failure", "audit failure", "cyberattack",
            "ransomware", "equipment failure", "machinery breakdown", "financial distress",
            "contract breach", "certification revoked", "supplier default"
        ],
        "Political Instability": [
            "sanctions", "trade embargo", "export ban", "tariff dispute", "geopolitical",
            "protest", "labor strike", "union strike", "civil unrest", "border closure",
            "nationalization", "military conflict", "regulatory clampdown"
        ],
        "Raw Material Shortages": [
            "raw material shortage", "wafer shortage", "silicon shortage", "lithium shortage",
            "rare earth", "chemical purity", "scarcity", "depletion", "allocation quota",
            "supply crunch", "mineral deficit", "neon gas shortage"
        ],
        "Factory Shutdowns": [
            "factory shutdown", "facility closure", "production halt", "cleanroom contamination",
            "fire incident", "explosion", "emergency maintenance", "power outage", "blackout",
            "line suspension", "halted operations", "temporary suspension"
        ]
    }

    SEVERITY_INTENSIFIERS = {
        "catastrophic": 0.95, "critical": 0.90, "severe": 0.85, "massive": 0.85,
        "devastating": 0.90, "complete shutdown": 0.92, "emergency": 0.82,
        "significant": 0.75, "major": 0.75, "widespread": 0.78, "disrupted": 0.70,
        "moderate": 0.55, "delayed": 0.50, "partial": 0.45, "minor": 0.35,
        "isolated": 0.30, "slight": 0.25
    }

    def __init__(self):
        try:
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy English model 'en_core_web_sm' loaded successfully.")
        except Exception as e:
            logger.warning(f"Could not load 'en_core_web_sm' ({e}). Initializing blank English pipeline.")
            self.nlp = spacy.blank("en")

    def analyze_report(
        self,
        text: str,
        source: str = "Manual Entry",
        is_simulated: bool = False
    ) -> Dict[str, Any]:
        """
        Executes end-to-end NLP extraction and entity linkage.
        """
        doc: Doc = self.nlp(text)

        # 1. Extract Named Entities
        extracted_entities = []
        organizations = []
        locations = []
        dates = []

        for ent in doc.ents:
            extracted_entities.append({
                "text": ent.text,
                "label": ent.label_,
                "category": self._map_spacy_label(ent.label_)
            })
            if ent.label_ in ["ORG", "PERSON"]:
                organizations.append(ent.text)
            elif ent.label_ in ["GPE", "LOC", "FAC"]:
                locations.append(ent.text)
            elif ent.label_ in ["DATE", "TIME"]:
                dates.append(ent.text)

        # Fallback regex regex matching for locations and organizations if blank model
        if not locations:
            text_lower = text.lower()
            known_locations = ["taiwan", "rotterdam", "hsinchu", "germany", "chile", "japan", "united states", "singapore", "korea", "china"]
            for loc in known_locations:
                if loc in text_lower:
                    locations.append(loc.title())

        # 2. Classify Disruption Category
        category, confidence = self._classify_category(text)

        # 3. Calculate Severity from Linguistic Features
        severity = self._compute_severity(text)

        # 4. Supply Chain Graph Entity Resolution
        matched_company_id, matched_company_name = self._match_graph_company(text, organizations, locations)

        # 5. Financial & Duration Estimations
        duration_days = int(round(7 + (severity * 28)))
        affected_nodes_count = self._estimate_affected_count(matched_company_id, severity)
        financial_impact = self._estimate_financial_impact(severity, affected_nodes_count)

        # Construct title and summary
        location_str = locations[0] if locations else "Global Network"
        target_str = matched_company_name or organizations[0] if organizations else "Supply Chain Corridor"
        title = f"{category} affecting {target_str} ({location_str})"

        timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
        disruption_id = f"disr-{datetime.datetime.now().strftime('%m%d%H%M%S')}"

        result = {
            "id": disruption_id,
            "title": title,
            "category": category,
            "severity": round(severity, 2),
            "confidence": round(confidence, 2),
            "origin_company_id": matched_company_id,
            "origin_company_name": matched_company_name or target_str,
            "location": location_str,
            "extracted_entities": extracted_entities,
            "estimated_duration_days": duration_days,
            "affected_nodes_count": affected_nodes_count,
            "financial_impact_est_usd": financial_impact,
            "is_simulated": is_simulated,
            "summary": text.strip(),
            "detected_at": timestamp,
            "source": source
        }

        # Automatically record into Neo4j / Graph Store
        neo4j_client.save_disruption(result)

        return result

    def _map_spacy_label(self, label: str) -> str:
        mapping = {
            "ORG": "Organization / Enterprise",
            "GPE": "Geopolitical Entity / Country",
            "LOC": "Geographic Location",
            "FAC": "Facility / Port / Hub",
            "DATE": "Temporal Timestamp",
            "PRODUCT": "Product / Component",
            "MONEY": "Financial Currency",
            "PERCENT": "Metric Ratio"
        }
        return mapping.get(label, label)

    def _classify_category(self, text: str) -> Tuple[str, float]:
        """Categorizes disruption text based on weighted semantic match."""
        text_lower = text.lower()
        category_scores: Dict[str, float] = {}

        for category, keywords in self.TAXONOMY_KEYWORDS.items():
            score = 0.0
            for kw in keywords:
                if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                    score += 1.0
                elif kw in text_lower:
                    score += 0.5
            category_scores[category] = score

        best_category = max(category_scores, key=category_scores.get)
        max_score = category_scores[best_category]

        if max_score == 0:
            return "Supplier Failures", 0.60

        confidence = min(0.98, 0.65 + (max_score * 0.08))
        return best_category, confidence

    def _compute_severity(self, text: str) -> float:
        """Determines disruption severity on a 0.1 to 1.0 scale."""
        text_lower = text.lower()
        base_severity = 0.55

        # Check intensifiers
        found_weights = []
        for word, weight in self.SEVERITY_INTENSIFIERS.items():
            if word in text_lower:
                found_weights.append(weight)

        if found_weights:
            base_severity = max(found_weights)

        # Check for duration numbers (e.g., "3 weeks", "30 days")
        if re.search(r'(\d+)\s*(weeks|months)', text_lower):
            base_severity = min(0.98, base_severity + 0.15)

        return round(base_severity, 2)

    def _match_graph_company(
        self,
        text: str,
        organizations: List[str],
        locations: List[str]
    ) -> Tuple[Optional[str], Optional[str]]:
        """Resolves extracted entities to known graph nodes in Neo4j."""
        companies = neo4j_client.get_all_companies()
        text_lower = text.lower()

        # 1. Exact or Cleaned Name match
        for comp in companies:
            c_name_raw = comp["name"].lower()
            c_name_clean = re.sub(r'\(.*?\)', '', comp["name"]).strip().lower()
            if c_name_clean in text_lower or c_name_raw in text_lower:
                return comp["id"], comp["name"]

        # 2. Substring / abbreviation match
        abbreviations = {
            "tafc": "node-t2-01",
            "taiwan advanced foundry": "node-t2-01",
            "tsmc": "node-t2-01",
            "taiwan semi": "node-t2-01",
            "silicium": "node-raw-01",
            "pacific silicium": "node-raw-01",
            "andean lithium": "node-raw-02",
            "rotterdam": "node-wh-01",
            "titan": "node-mfg-01",
            "long beach": "node-wh-03",
            "jurong": "node-wh-02",
            "bavaria": "node-mfg-03",
            "aerodrive": "node-mfg-02",
            "stuttgart": "node-t1-02",
            "gyeonggi": "node-t2-02"
        }
        for abbr, comp_id in abbreviations.items():
            if abbr in text_lower:
                comp = neo4j_client.get_company_by_id(comp_id)
                if comp:
                    return comp["id"], comp["name"]

        # Location heuristic match
        for loc in locations:
            loc_lower = loc.lower()
            for comp in companies:
                if (comp.get("city", "").lower() in loc_lower) or (comp.get("country", "").lower() in loc_lower):
                    return comp["id"], comp["name"]

        # Default to critical semiconductor node if electronics / chip related
        if any(w in text_lower for w in ["chip", "semiconductor", "wafer", "foundry", "fab"]):
            return "node-t2-01", "Taiwan Advanced Foundry (TAFC)"

        # Default fallback
        if companies:
            return companies[0]["id"], companies[0]["name"]

        return None, None

    def _estimate_affected_count(self, origin_id: Optional[str], severity: float) -> int:
        if not origin_id:
            return int(round(3 * severity))
        downstream = neo4j_client.get_downstream_cascade(origin_id, max_depth=3)
        return max(1, len(downstream))

    def _estimate_financial_impact(self, severity: float, affected_count: int) -> str:
        base_millions = (severity * 400) + (affected_count * 180)
        if base_millions >= 1000:
            return f"${base_millions / 1000:.2f} Billion"
        return f"${int(base_millions)} Million"


# Global NLP Extractor Instance
disruption_extractor = DisruptionExtractor()
