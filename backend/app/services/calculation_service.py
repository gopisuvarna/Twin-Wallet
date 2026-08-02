import calendar
from datetime import date
from typing import List, Dict, Any, Tuple
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Income, Expense, MonthlyLedger, User


class CalculationService:
    @staticmethod
    async def get_total_income(db: AsyncSession, wallet_id: str, year: int, month: int, user_id: str = None) -> float:
        query = select(func.coalesce(func.sum(Income.amount), 0.0)).where(
            and_(
                Income.wallet_id == wallet_id,
                func.extract("year", Income.transaction_date) == year,
                func.extract("month", Income.transaction_date) == month
            )
        )
        if user_id:
            query = query.where(Income.user_id == user_id)
        
        result = await db.execute(query)
        return float(result.scalar() or 0.0)

    @staticmethod
    async def get_total_expense(db: AsyncSession, wallet_id: str, year: int, month: int, user_id: str = None) -> float:
        query = select(func.coalesce(func.sum(Expense.amount), 0.0)).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        )
        if user_id:
            query = query.where(Expense.user_id == user_id)
            
        result = await db.execute(query)
        return float(result.scalar() or 0.0)

    @staticmethod
    async def get_or_create_monthly_ledger(db: AsyncSession, wallet_id: str, year: int, month: int) -> MonthlyLedger:
        # Check if ledger for current month exists
        stmt = select(MonthlyLedger).where(
            and_(
                MonthlyLedger.wallet_id == wallet_id,
                MonthlyLedger.year == year,
                MonthlyLedger.month == month
            )
        )
        result = await db.execute(stmt)
        ledger = result.scalar_one_or_none()

        if ledger:
            return ledger

        # Calculate opening balance from previous month
        prev_month = 12 if month == 1 else month - 1
        prev_year = year - 1 if month == 1 else year

        # Recursively or iteratively ensure previous ledger exists to roll forward balance
        prev_stmt = select(MonthlyLedger).where(
            and_(
                MonthlyLedger.wallet_id == wallet_id,
                MonthlyLedger.year == prev_year,
                MonthlyLedger.month == prev_month
            )
        )
        prev_result = await db.execute(prev_stmt)
        prev_ledger = prev_result.scalar_one_or_none()

        opening_balance = 0.0
        if prev_ledger:
            # Closing balance of prev month = prev_opening + prev_income - prev_expense
            prev_inc = await CalculationService.get_total_income(db, wallet_id, prev_year, prev_month)
            prev_exp = await CalculationService.get_total_expense(db, wallet_id, prev_year, prev_month)
            opening_balance = float(prev_ledger.opening_balance) + prev_inc - prev_exp

        # Create new ledger for target month
        new_ledger = MonthlyLedger(
            wallet_id=wallet_id,
            year=year,
            month=month,
            opening_balance=opening_balance,
            status="ACTIVE"
        )
        db.add(new_ledger)
        await db.flush()
        return new_ledger

    @staticmethod
    async def calculate_wallet_summary(db: AsyncSession, wallet_id: str, year: int, month: int) -> Dict[str, Any]:
        ledger = await CalculationService.get_or_create_monthly_ledger(db, wallet_id, year, month)
        opening_balance = float(ledger.opening_balance)
        
        income = await CalculationService.get_total_income(db, wallet_id, year, month)
        expense = await CalculationService.get_total_expense(db, wallet_id, year, month)
        
        closing_balance = opening_balance + income - expense
        savings = closing_balance
        savings_rate = (savings / income * 100) if income > 0 else 0.0

        # Number of days in month or days elapsed
        today = date.today()
        if today.year == year and today.month == month:
            days = today.day
        else:
            _, days = calendar.monthrange(year, month)
        
        avg_daily_expense = (expense / days) if days > 0 else 0.0

        # Fetch all users (strictly 2)
        users_result = await db.execute(select(User))
        users = users_result.scalars().all()
        
        partner_contributions = []
        for u in users:
            u_inc = await CalculationService.get_total_income(db, wallet_id, year, month, user_id=u.id)
            u_exp = await CalculationService.get_total_expense(db, wallet_id, year, month, user_id=u.id)
            contrib_pct = (u_inc / income * 100) if income > 0 else (50.0 if len(users) == 2 else 100.0)
            partner_contributions.append({
                "user_id": u.id,
                "user_name": u.full_name,
                "avatar_url": u.avatar_url,
                "income": u_inc,
                "expense": u_exp,
                "contribution_percentage": contrib_pct
            })

        return {
            "year": year,
            "month": month,
            "opening_balance": opening_balance,
            "total_income": income,
            "total_expense": expense,
            "closing_balance": closing_balance,
            "savings": savings,
            "savings_rate": savings_rate,
            "average_daily_expense": avg_daily_expense,
            "partner_contributions": partner_contributions,
            "status": ledger.status
        }
