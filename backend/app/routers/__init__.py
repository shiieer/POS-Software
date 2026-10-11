from fastapi import APIRouter

from app.routers import auth, menu, orders, reports, settings, tables, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(menu.router)
api_router.include_router(tables.router)
api_router.include_router(orders.router)
api_router.include_router(reports.router)
api_router.include_router(users.router)
api_router.include_router(settings.router)