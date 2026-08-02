from datetime import date
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import io

from app.api.deps import get_db, get_current_user, get_shared_wallet
from app.models import User, Wallet
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/pdf")
async def export_pdf_report(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    pdf_bytes = await ReportService.generate_monthly_pdf(db, wallet.id, year, month)
    filename = f"TwinWallet_Report_{year}_{month:02d}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/csv")
async def export_csv_report(
    year: int = Query(default_factory=lambda: date.today().year),
    month: int = Query(default_factory=lambda: date.today().month, ge=1, le=12),
    current_user: User = Depends(get_current_user),
    wallet: Wallet = Depends(get_shared_wallet),
    db: AsyncSession = Depends(get_db)
):
    csv_data = await ReportService.generate_csv_export(db, wallet.id, year, month)
    filename = f"TwinWallet_Export_{year}_{month:02d}.csv"
    
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
