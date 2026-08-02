from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class SavingsGoalCreate(BaseModel):
    goal_name: str = Field(..., min_length=2, max_length=100)
    target_amount: float = Field(..., gt=0)
    target_date: Optional[date] = None


class SavingsGoalResponse(BaseModel):
    id: str
    wallet_id: str
    goal_name: str
    target_amount: float
    current_progress: float
    completion_percentage: float
    target_date: Optional[date] = None
    is_completed: bool
    created_at: datetime

    class Config:
        from_attributes = True


class PartnerSavingsItem(BaseModel):
    user_id: str
    user_name: str
    monthly_income: float
    monthly_expense: float
    monthly_savings: float
    lifetime_savings: float


class SavingsOverviewResponse(BaseModel):
    year: int
    month: int
    combined_monthly_savings: float
    combined_lifetime_savings: float
    partner_savings: List[PartnerSavingsItem]
