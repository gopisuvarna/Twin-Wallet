from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import Budget, User, Wallet
from app.schemas.budget import BudgetCreate, BudgetResponse
from app.services.calculation_service import CalculationService

router = APIRouter()


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Budget).where(
        and_(
            Budget.wallet_id == wallet.id,
            Budget.year == budget_in.year,
            Budget.month == budget_in.month,
            Budget.category == budget_in.category
        )
    )
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        existing.amount_limit = budget_in.amount_limit
        budget_obj = existing
    else:
        budget_obj = Budget(
            wallet_id=wallet.id,
            category=budget_in.category,
            amount_limit=budget_in.amount_limit,
            year=budget_in.year,
            month=budget_in.month
        )
        db.add(budget_obj)

    await db.commit()
    await db.refresh(budget_obj)

    # Calculate current spent amount dynamically
    if budget_obj.category:
        # Category specific spent amount
        from app.models import Expense
        from sqlalchemy import func
        e_stmt = select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            and_(
                Expense.wallet_id == wallet.id,
                Expense.category == budget_obj.category,
                func.extract("year", Expense.transaction_date) == budget_obj.year,
                func.extract("month", Expense.transaction_date) == budget_obj.month
            )
        )
        spent = float((await db.execute(e_stmt)).scalar() or 0.0)
    else:
        # Overall spent amount
        spent = await CalculationService.get_total_expense(db, wallet.id, budget_obj.year, budget_obj.month)

    remaining = float(budget_obj.amount_limit) - spent
    pct = (spent / float(budget_obj.amount_limit) * 100) if float(budget_obj.amount_limit) > 0 else 0.0

    return BudgetResponse(
        id=budget_obj.id,
        wallet_id=budget_obj.wallet_id,
        category=budget_obj.category,
        amount_limit=float(budget_obj.amount_limit),
        spent_amount=spent,
        remaining_amount=remaining,
        percentage_used=round(pct, 2),
        is_exceeded=spent > float(budget_obj.amount_limit),
        year=budget_obj.year,
        month=budget_obj.month
    )


@router.get("/", response_model=List[BudgetResponse])
async def list_budgets(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Budget).where(
        and_(
            Budget.wallet_id == wallet.id,
            Budget.year == year,
            Budget.month == month
        )
    )
    budgets = (await db.execute(stmt)).scalars().all()

    res = []
    for b in budgets:
        if b.category:
            from app.models import Expense
            from sqlalchemy import func
            e_stmt = select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
                and_(
                    Expense.wallet_id == wallet.id,
                    Expense.category == b.category,
                    func.extract("year", Expense.transaction_date) == year,
                    func.extract("month", Expense.transaction_date) == month
                )
            )
            spent = float((await db.execute(e_stmt)).scalar() or 0.0)
        else:
            spent = await CalculationService.get_total_expense(db, wallet.id, year, month)

        remaining = float(b.amount_limit) - spent
        pct = (spent / float(b.amount_limit) * 100) if float(b.amount_limit) > 0 else 0.0

        res.append(BudgetResponse(
            id=b.id,
            wallet_id=b.wallet_id,
            category=b.category,
            amount_limit=float(b.amount_limit),
            spent_amount=spent,
            remaining_amount=remaining,
            percentage_used=round(pct, 2),
            is_exceeded=spent > float(b.amount_limit),
            year=b.year,
            month=b.month
        ))

    return res
