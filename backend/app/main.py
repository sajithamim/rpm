
from fastapi import FastAPI
from app.core.database import Base, engine
from app.models.pricing import PricingRecord
from app.api.routes.pricing import router as pricing_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.cors import configure_cors

Base.metadata.create_all(bind=engine)

app = FastAPI()
configure_cors(app)

app.include_router(pricing_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}