from typing import List, Optional, Dict
from pydantic import BaseModel


class CategoryBreakdownItem(BaseModel):
    category: str
    amount: float
    percentage: float


class DailySpendingItem(BaseModel):
    date: str
    amount: float


class PartnerAnalyticsItem(BaseModel):
    user_id: str
    user_name: str
    avatar_url: Optional[str] = None
    income: float
    expense: float
    savings_contribution: float


class MonthlyComparisonItem(BaseModel):
    month_name: str
    income: float
    expense: float
    savings: float


class DashboardAnalyticsResponse(BaseModel):
    current_balance: float
    total_income: float
    total_expense: float
    savings: float
    savings_rate: float
    average_daily_expense: float
    category_breakdown: List[CategoryBreakdownItem]
    daily_spending: List[DailySpendingItem]
    partner_analytics: List[PartnerAnalyticsItem]
    top_category: Optional[str] = None
    least_used_category: Optional[str] = None
    highest_expense: float = 0.0
    lowest_expense: float = 0.0
    average_expense: float = 0.0
    total_transactions_count: int = 0
