import io
import pandas as pd
from datetime import date
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.models import Income, Expense, User
from app.services.calculation_service import CalculationService


class ReportService:
    @staticmethod
    async def generate_monthly_pdf(db: AsyncSession, wallet_id: str, year: int, month: int) -> bytes:
        summary = await CalculationService.calculate_wallet_summary(db, wallet_id, year, month)
        
        # Fetch transactions
        inc_stmt = select(Income, User.full_name).join(User, Income.user_id == User.id).where(
            and_(
                Income.wallet_id == wallet_id,
                func.extract("year", Income.transaction_date) == year,
                func.extract("month", Income.transaction_date) == month
            )
        )
        exp_stmt = select(Expense, User.full_name).join(User, Expense.user_id == User.id).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        )

        inc_res = await db.execute(inc_stmt)
        exp_res = await db.execute(exp_stmt)

        inc_list = inc_res.all()
        exp_list = exp_res.all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=36, bottomMargin=36)
        styles = getSampleStyleSheet()

        title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=20, textColor=colors.HexColor('#6366F1'), spaceAfter=12)
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'], fontSize=12, textColor=colors.gray, spaceAfter=20)
        h2_style = ParagraphStyle('H2', parent=styles['Heading2'], fontSize=14, textColor=colors.HexColor('#1E1E2E'), spaceBefore=15, spaceAfter=8)

        story = []
        month_name = date(year, month, 1).strftime('%B %Y')
        story.append(Paragraph(f"TwinWallet Monthly Report", title_style))
        story.append(Paragraph(f"Statement for {month_name}", subtitle_style))

        # Financial Summary Table
        summary_data = [
            ["Metric", "Amount (INR)"],
            ["Opening Balance", f"Rs. {summary['opening_balance']:,.2f}"],
            ["Total Income", f"Rs. {summary['total_income']:,.2f}"],
            ["Total Expense", f"Rs. {summary['total_expense']:,.2f}"],
            ["Closing Balance / Savings", f"Rs. {summary['closing_balance']:,.2f}"],
            ["Savings Rate", f"{summary['savings_rate']:.2f}%"],
            ["Avg Daily Expense", f"Rs. {summary['average_daily_expense']:,.2f}"]
        ]
        t_summary = Table(summary_data, colWidths=[250, 250])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6366F1')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')])
        ]))
        story.append(t_summary)
        story.append(Spacer(1, 15))

        # Expenses Table
        story.append(Paragraph("Expense Details", h2_style))
        exp_table_data = [["Date", "User", "Category", "Description", "Amount"]]
        for item, user_name in exp_list:
            exp_table_data.append([
                str(item.transaction_date),
                user_name,
                item.category,
                item.description or "-",
                f"Rs. {float(item.amount):,.2f}"
            ])
        if len(exp_table_data) == 1:
            exp_table_data.append(["No expenses logged", "-", "-", "-", "-"])

        t_exp = Table(exp_table_data, colWidths=[70, 90, 90, 160, 90])
        t_exp.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#EF4444')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#FFF5F5')])
        ]))
        story.append(t_exp)

        doc.build(story)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes

    @staticmethod
    async def generate_csv_export(db: AsyncSession, wallet_id: str, year: int, month: int) -> str:
        inc_stmt = select(Income, User.full_name).join(User, Income.user_id == User.id).where(
            and_(
                Income.wallet_id == wallet_id,
                func.extract("year", Income.transaction_date) == year,
                func.extract("month", Income.transaction_date) == month
            )
        )
        exp_stmt = select(Expense, User.full_name).join(User, Expense.user_id == User.id).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        )
        inc_list = (await db.execute(inc_stmt)).all()
        exp_list = (await db.execute(exp_stmt)).all()

        rows = []
        for item, user_name in inc_list:
            rows.append({
                "Type": "Income",
                "Date": item.transaction_date,
                "User": user_name,
                "Category/Source": item.source,
                "Description": item.description or "",
                "Amount (INR)": float(item.amount)
            })

        for item, user_name in exp_list:
            rows.append({
                "Type": "Expense",
                "Date": item.transaction_date,
                "User": user_name,
                "Category/Source": item.category,
                "Description": item.description or "",
                "Amount (INR)": float(item.amount)
            })

        df = pd.DataFrame(rows)
        return df.to_csv(index=False)
