from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import Expense, User, Wallet
from app.schemas.transaction import ExpenseCreate, ExpenseUpdate, ExpenseResponse

router = APIRouter()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
async def create_expense(
    expense_in: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    expense = Expense(
        wallet_id=wallet.id,
        user_id=current_user.id,
        amount=expense_in.amount,
        category=expense_in.category.value,
        description=expense_in.description,
        transaction_date=expense_in.transaction_date
    )
    db.add(expense)
    await db.commit()
    await db.refresh(expense)

    stmt = select(Expense).options(joinedload(Expense.user)).where(Expense.id == expense.id)
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/", response_model=List[ExpenseResponse])
async def list_expenses(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    category: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Expense).options(joinedload(Expense.user)).where(Expense.wallet_id == wallet.id)

    if year:
        stmt = stmt.where(func.extract("year", Expense.transaction_date) == year)
    if month:
        stmt = stmt.where(func.extract("month", Expense.transaction_date) == month)
    if category:
        stmt = stmt.where(Expense.category == category)
    if user_id:
        stmt = stmt.where(Expense.user_id == user_id)

    stmt = stmt.order_by(Expense.transaction_date.desc(), Expense.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.put("/{expense_id}", response_model=ExpenseResponse)
async def update_expense(
    expense_id: str,
    expense_in: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Expense).options(joinedload(Expense.user)).where(
        and_(Expense.id == expense_id, Expense.wallet_id == wallet.id)
    )
    expense = (await db.execute(stmt)).scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense transaction not found.")

    if expense_in.amount is not None:
        expense.amount = expense_in.amount
    if expense_in.category is not None:
        expense.category = expense_in.category.value
    if expense_in.description is not None:
        expense.description = expense_in.description
    if expense_in.transaction_date is not None:
        expense.transaction_date = expense_in.transaction_date

    await db.commit()
    await db.refresh(expense)

    stmt_reload = select(Expense).options(joinedload(Expense.user)).where(Expense.id == expense.id)
    return (await db.execute(stmt_reload)).scalar_one()


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Expense).where(and_(Expense.id == expense_id, Expense.wallet_id == wallet.id))
    expense = (await db.execute(stmt)).scalar_one_or_none()
    if not expense:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense transaction not found.")

    await db.delete(expense)
    await db.commit()
