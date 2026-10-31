"""
AtmoGraph - Supply Chain Ripple Effect Predictor
FastAPI Production Application Entry Point
"""

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.endpoints import router as api_router
from app.database.neo4j_client import neo4j_client

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("atmograph.main")

app = FastAPI(
    title="AtmoGraph – Supply Chain Ripple Effect Predictor API",
    description=(
        "Enterprise-grade AI platform predicting multi-tier supply chain disruption ripple effects "
        "using Graph Neural Networks (PyTorch Geometric), Natural Language Processing (spaCy), "
        "and Neo4j Graph Database."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(api_router)


@app.get("/api-status", tags=["System"])
def api_status():
    return {
        "system": "AtmoGraph – Supply Chain Ripple Effect Predictor",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "database": neo4j_client.get_status()
    }


@app.get("/health", tags=["System"])
def health_check():
    return {
        "status": "healthy",
        "storage_mode": neo4j_client.storage_mode,
        "is_connected_to_neo4j": neo4j_client.is_connected,
        "nodes_loaded": len(neo4j_client.companies_store)
    }


# Mount compiled frontend static assets if available
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
    logger.info(f"Mounted compiled frontend static files from: {FRONTEND_DIST}")
else:
    @app.get("/", tags=["System"])
    def root():
        return {
            "system": "AtmoGraph – Supply Chain Ripple Effect Predictor",
            "version": "1.0.0",
            "status": "operational",
            "docs_url": "/docs",
            "database": neo4j_client.get_status()
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
