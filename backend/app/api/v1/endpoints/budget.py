from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import Budget, User, Wallet, Expense
from app.schemas.budget import BudgetCreate, BudgetUpdate, BudgetResponse
from app.services.calculation_service import CalculationService

router = APIRouter()


async def _build_budget_response(b: Budget, wallet_id: str, db: AsyncSession) -> BudgetResponse:
    e_stmt = select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
        and_(
            Expense.wallet_id == wallet_id,
            func.extract("year", Expense.transaction_date) == b.year,
            func.extract("month", Expense.transaction_date) == b.month
        )
    )
    if b.category:
        e_stmt = e_stmt.where(Expense.category == b.category)
    if b.user_id:
        e_stmt = e_stmt.where(Expense.user_id == b.user_id)

    spent = float((await db.execute(e_stmt)).scalar() or 0.0)
    remaining = float(b.amount_limit) - spent
    pct = (spent / float(b.amount_limit) * 100) if float(b.amount_limit) > 0 else 0.0

    user_name = b.user.full_name if b.user else None

    return BudgetResponse(
        id=b.id,
        wallet_id=b.wallet_id,
        user_id=b.user_id,
        user_name=user_name,
        category=b.category,
        amount_limit=float(b.amount_limit),
        spent_amount=spent,
        remaining_amount=remaining,
        percentage_used=round(pct, 2),
        is_exceeded=spent > float(b.amount_limit),
        year=b.year,
        month=b.month
    )


@router.post("/", response_model=BudgetResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_budget(
    budget_in: BudgetCreate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    conditions = [
        Budget.wallet_id == wallet.id,
        Budget.year == budget_in.year,
        Budget.month == budget_in.month,
    ]
    if budget_in.category:
        conditions.append(Budget.category == budget_in.category)
    else:
        conditions.append(Budget.category.is_(None))

    if budget_in.user_id:
        conditions.append(Budget.user_id == budget_in.user_id)
    else:
        conditions.append(Budget.user_id.is_(None))

    stmt = select(Budget).options(joinedload(Budget.user)).where(and_(*conditions))
    existing = (await db.execute(stmt)).scalar_one_or_none()

    if existing:
        existing.amount_limit = budget_in.amount_limit
        budget_obj = existing
    else:
        budget_obj = Budget(
            wallet_id=wallet.id,
            user_id=budget_in.user_id,
            category=budget_in.category,
            amount_limit=budget_in.amount_limit,
            year=budget_in.year,
            month=budget_in.month
        )
        db.add(budget_obj)

    await db.commit()
    await db.refresh(budget_obj)

    stmt_reload = select(Budget).options(joinedload(Budget.user)).where(Budget.id == budget_obj.id)
    budget_obj = (await db.execute(stmt_reload)).scalar_one()

    return await _build_budget_response(budget_obj, wallet.id, db)


@router.get("/", response_model=List[BudgetResponse])
async def list_budgets(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Budget).options(joinedload(Budget.user)).where(
        and_(
            Budget.wallet_id == wallet.id,
            Budget.year == year,
            Budget.month == month
        )
    )
    budgets = (await db.execute(stmt)).scalars().all()

    res = []
    for b in budgets:
        res.append(await _build_budget_response(b, wallet.id, db))

    return res


@router.put("/{budget_id}", response_model=BudgetResponse)
async def update_budget(
    budget_id: str,
    budget_in: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Budget).options(joinedload(Budget.user)).where(
        and_(Budget.id == budget_id, Budget.wallet_id == wallet.id)
    )
    budget_obj = (await db.execute(stmt)).scalar_one_or_none()
    if not budget_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    if budget_in.amount_limit is not None:
        budget_obj.amount_limit = budget_in.amount_limit
    if budget_in.category is not None:
        budget_obj.category = budget_in.category
    if "user_id" in budget_in.model_fields_set:
        budget_obj.user_id = budget_in.user_id

    await db.commit()
    await db.refresh(budget_obj)

    stmt_reload = select(Budget).options(joinedload(Budget.user)).where(Budget.id == budget_obj.id)
    budget_obj = (await db.execute(stmt_reload)).scalar_one()

    return await _build_budget_response(budget_obj, wallet.id, db)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Budget).where(and_(Budget.id == budget_id, Budget.wallet_id == wallet.id))
    budget_obj = (await db.execute(stmt)).scalar_one_or_none()
    if not budget_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Budget not found.")

    await db.delete(budget_obj)
    await db.commit()
