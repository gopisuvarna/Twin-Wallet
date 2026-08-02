from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    income,
    expense,
    ledger,
    budget,
    savings,
    analytics,
    reports
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(income.router, prefix="/incomes", tags=["Incomes"])
api_router.include_router(expense.router, prefix="/expenses", tags=["Expenses"])
api_router.include_router(ledger.router, prefix="/ledger", tags=["Monthly Ledger"])
api_router.include_router(budget.router, prefix="/budgets", tags=["Budgets"])
api_router.include_router(savings.router, prefix="/savings", tags=["Savings Goals"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports & Exports"])
