from typing import Optional
from pydantic import BaseModel, Field


class BudgetCreate(BaseModel):
    category: Optional[str] = Field(None, description="Category name, or None for overall budget")
    amount_limit: float = Field(..., gt=0)
    year: int
    month: int = Field(..., ge=1, le=12)


class BudgetResponse(BaseModel):
    id: str
    wallet_id: str
    category: Optional[str] = None
    amount_limit: float
    spent_amount: float
    remaining_amount: float
    percentage_used: float
    is_exceeded: bool
    year: int
    month: int

    class Config:
        from_attributes = True
