import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api_router import api_router
from app.services.ml_service import ml_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Booting FinSight AI Asynchronous Backend...")
    try:
        await init_db()
        logger.info("Database schemas verified.")
    except Exception as e:
        logger.error(f"Database initialization warning: {e}")

    try:
        ml_service.load_model()
        logger.info("Machine Learning risk model loaded into memory.")
    except Exception as e:
        logger.warning(f"ML model loading note: {e}")

    yield

    # Shutdown actions
    logger.info("FinSight AI Backend shutting down gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Asynchronous Backend API for FinSight AI - Indian Wealth & Market Intelligence Platform",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
async def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "philosophy": "Clean-slate architecture with zero predefined bias."
    }

@app.get("/healthz", tags=["Health"])
async def health_check():
    return {"status": "healthy"}
