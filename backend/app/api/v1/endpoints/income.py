from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import Income, User, Wallet
from app.schemas.transaction import IncomeCreate, IncomeResponse

router = APIRouter()


@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
async def create_income(
    income_in: IncomeCreate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    income = Income(
        wallet_id=wallet.id,
        user_id=current_user.id,
        amount=income_in.amount,
        source=income_in.source.value,
        description=income_in.description,
        transaction_date=income_in.transaction_date
    )
    db.add(income)
    await db.commit()
    await db.refresh(income)

    # Load relationship for response
    stmt = select(Income).options(joinedload(Income.user)).where(Income.id == income.id)
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/", response_model=List[IncomeResponse])
async def list_incomes(
    year: Optional[int] = Query(None),
    month: Optional[int] = Query(None, ge=1, le=12),
    user_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Income).options(joinedload(Income.user)).where(Income.wallet_id == wallet.id)

    if year:
        stmt = stmt.where(func.extract("year", Income.transaction_date) == year)
    if month:
        stmt = stmt.where(func.extract("month", Income.transaction_date) == month)
    if user_id:
        stmt = stmt.where(Income.user_id == user_id)

    stmt = stmt.order_by(Income.transaction_date.desc(), Income.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_income(
    income_id: str,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Income).where(and_(Income.id == income_id, Income.wallet_id == wallet.id))
    income = (await db.execute(stmt)).scalar_one_or_none()
    if not income:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income transaction not found.")

    await db.delete(income)
    await db.commit()
