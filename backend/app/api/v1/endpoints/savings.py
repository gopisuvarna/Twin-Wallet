from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import SavingsGoal, User, Wallet, Income, Expense
from app.schemas.savings import (
    SavingsGoalCreate,
    SavingsGoalResponse,
    PartnerSavingsItem,
    SavingsOverviewResponse,
)
from app.services.calculation_service import CalculationService

router = APIRouter()


@router.get("/overview", response_model=SavingsOverviewResponse)
async def get_savings_overview(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    users_result = await db.execute(select(User))
    users = users_result.scalars().all()

    partner_savings_list = []
    combined_monthly_savings = 0.0
    combined_lifetime_savings = 0.0

    for u in users:
        # Monthly calculation for selected period
        m_inc = await CalculationService.get_total_income(db, wallet.id, year, month, user_id=u.id)
        m_exp = await CalculationService.get_total_expense(db, wallet.id, year, month, user_id=u.id)
        m_sav = m_inc - m_exp

        # Lifetime total income & expenses across all time
        lt_inc_stmt = select(func.coalesce(func.sum(Income.amount), 0.0)).where(
            and_(Income.wallet_id == wallet.id, Income.user_id == u.id)
        )
        lt_exp_stmt = select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            and_(Expense.wallet_id == wallet.id, Expense.user_id == u.id)
        )
        lt_inc = float((await db.execute(lt_inc_stmt)).scalar() or 0.0)
        lt_exp = float((await db.execute(lt_exp_stmt)).scalar() or 0.0)
        lt_sav = lt_inc - lt_exp

        combined_monthly_savings += m_sav
        combined_lifetime_savings += lt_sav

        partner_savings_list.append(
            PartnerSavingsItem(
                user_id=u.id,
                user_name=u.full_name,
                monthly_income=m_inc,
                monthly_expense=m_exp,
                monthly_savings=m_sav,
                lifetime_savings=lt_sav,
            )
        )

    return SavingsOverviewResponse(
        year=year,
        month=month,
        combined_monthly_savings=combined_monthly_savings,
        combined_lifetime_savings=combined_lifetime_savings,
        partner_savings=partner_savings_list,
    )


@router.post("/", response_model=SavingsGoalResponse, status_code=status.HTTP_201_CREATED)
async def create_savings_goal(
    goal_in: SavingsGoalCreate,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    goal = SavingsGoal(
        wallet_id=wallet.id,
        goal_name=goal_in.goal_name,
        target_amount=goal_in.target_amount,
        target_date=goal_in.target_date,
        is_completed=False
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)

    summary = await CalculationService.calculate_wallet_summary(db, wallet.id, date.today().year, date.today().month)
    current_progress = max(0.0, summary["closing_balance"])
    pct = (current_progress / float(goal.target_amount) * 100) if float(goal.target_amount) > 0 else 0.0

    return SavingsGoalResponse(
        id=goal.id,
        wallet_id=goal.wallet_id,
        goal_name=goal.goal_name,
        target_amount=float(goal.target_amount),
        current_progress=current_progress,
        completion_percentage=min(100.0, round(pct, 2)),
        target_date=goal.target_date,
        is_completed=current_progress >= float(goal.target_amount),
        created_at=goal.created_at
    )


@router.get("/", response_model=List[SavingsGoalResponse])
async def list_savings_goals(
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavingsGoal).where(SavingsGoal.wallet_id == wallet.id).order_by(SavingsGoal.created_at.desc())
    goals = (await db.execute(stmt)).scalars().all()

    summary = await CalculationService.calculate_wallet_summary(db, wallet.id, date.today().year, date.today().month)
    current_progress = max(0.0, summary["closing_balance"])

    res = []
    for g in goals:
        pct = (current_progress / float(g.target_amount) * 100) if float(g.target_amount) > 0 else 0.0
        res.append(SavingsGoalResponse(
            id=g.id,
            wallet_id=g.wallet_id,
            goal_name=g.goal_name,
            target_amount=float(g.target_amount),
            current_progress=current_progress,
            completion_percentage=min(100.0, round(pct, 2)),
            target_date=g.target_date,
            is_completed=current_progress >= float(g.target_amount),
            created_at=g.created_at
        ))

    return res


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_savings_goal(
    goal_id: str,
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(SavingsGoal).where(and_(SavingsGoal.id == goal_id, SavingsGoal.wallet_id == wallet.id))
    goal = (await db.execute(stmt)).scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Savings goal not found.")

    await db.delete(goal)
    await db.commit()
