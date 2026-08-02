from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import User, Wallet
from app.schemas.ledger import WalletSummaryResponse
from app.services.calculation_service import CalculationService

router = APIRouter()


@router.get("/summary", response_model=WalletSummaryResponse)
async def get_monthly_summary(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    summary = await CalculationService.calculate_wallet_summary(db, wallet.id, year, month)
    return WalletSummaryResponse(**summary)
