from typing import List
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import SavingsGoal, User, Wallet
from app.schemas.savings import SavingsGoalCreate, SavingsGoalResponse
from app.services.calculation_service import CalculationService

router = APIRouter()


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

    # Current progress is calculated from overall accumulated savings
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
