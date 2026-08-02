from datetime import date, datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from app.schemas.user import UserResponse


class IncomeSource(str, Enum):
    SALARY = "Salary"
    BONUS = "Bonus"
    GIFT = "Gift"
    FREELANCING = "Freelancing"
    BUSINESS = "Business"
    INVESTMENT = "Investment"
    CASHBACK = "Cashback"
    OTHER = "Other"


class ExpenseCategory(str, Enum):
    FOOD = "Food"
    SHOPPING = "Shopping"
    TRAVEL = "Travel"
    MEDICAL = "Medical"
    RENT = "Rent"
    FUEL = "Fuel"
    BILLS = "Bills"
    ENTERTAINMENT = "Entertainment"
    EDUCATION = "Education"
    INSURANCE = "Insurance"
    INVESTMENT = "Investment"
    SUBSCRIPTION = "Subscription"
    GIFT = "Gift"
    UTILITIES = "Utilities"
    CLOTHING = "Clothing"
    OTHERS = "Others"


class IncomeCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Income amount in INR (₹)")
    source: IncomeSource
    description: Optional[str] = None
    transaction_date: date = Field(default_factory=date.today)


class IncomeResponse(BaseModel):
    id: str
    wallet_id: str
    user_id: str
    amount: float
    source: str
    description: Optional[str] = None
    transaction_date: date
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    amount: float = Field(..., gt=0, description="Expense amount in INR (₹)")
    category: ExpenseCategory
    description: Optional[str] = None
    transaction_date: date = Field(default_factory=date.today)


class ExpenseResponse(BaseModel):
    id: str
    wallet_id: str
    user_id: str
    amount: float
    category: str
    description: Optional[str] = None
    transaction_date: date
    created_at: datetime
    user: UserResponse

    class Config:
        from_attributes = True
