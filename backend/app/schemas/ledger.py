from typing import Optional, List
from pydantic import BaseModel


class MonthlyLedgerResponse(BaseModel):
    id: str
    wallet_id: str
    year: int
    month: int
    opening_balance: float
    status: str

    class Config:
        from_attributes = True


class UserContribution(BaseModel):
    user_id: str
    user_name: str
    avatar_url: Optional[str] = None
    income: float
    expense: float
    contribution_percentage: float


class WalletSummaryResponse(BaseModel):
    year: int
    month: int
    opening_balance: float
    total_income: float
    total_expense: float
    closing_balance: float
    savings: float
    savings_rate: float
    average_daily_expense: float
    partner_contributions: List[UserContribution]
    status: str
