import os
import sys
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from backend.routers import (
    auth,
    chat,
    donations,
    care_homes,
    claims,
    dashboard,
    admin,
    uploads,
)
from backend.config import settings

app = FastAPI(
    title="ShareNest API",
    description="Intelligent Community Surplus Food & Essentials Redistribution System",
    version="1.0.0",
)

# Enable CORS for local Vite dev and web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(donations.router)
app.include_router(care_homes.router)
app.include_router(claims.router)
app.include_router(dashboard.router)
app.include_router(admin.router)
app.include_router(uploads.router)

# Mount frontend build from either backend/static_dist or ../frontend/dist
base_dir = os.path.dirname(__file__)
static_dist = os.path.join(base_dir, "static_dist")
frontend_dist = os.path.join(base_dir, "..", "frontend", "dist")

active_dist = static_dist if os.path.exists(static_dist) else (frontend_dist if os.path.exists(frontend_dist) else None)

if active_dist:
    assets_dir = os.path.join(active_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(active_dist, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(active_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "name": "ShareNest API",
            "version": "1.0.0",
            "docs": "/docs",
            "agent": "ADK gemini-2.5-flash",
        }
