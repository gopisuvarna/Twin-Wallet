import calendar
from datetime import date
from typing import Dict, Any, List
from sqlalchemy import select, func, and_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Income, Expense, User
from app.services.calculation_service import CalculationService


class AnalyticsService:
    @staticmethod
    async def get_dashboard_analytics(db: AsyncSession, wallet_id: str, year: int, month: int) -> Dict[str, Any]:
        summary = await CalculationService.calculate_wallet_summary(db, wallet_id, year, month)

        # Joint Expense by category
        cat_stmt = select(
            Expense.category,
            func.sum(Expense.amount).label("total")
        ).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        ).group_by(Expense.category).order_by(desc("total"))
        
        cat_result = await db.execute(cat_stmt)
        cat_rows = cat_result.all()

        total_exp = summary["total_expense"]
        category_breakdown = []
        top_cat = None
        least_cat = None

        if cat_rows:
            top_cat = cat_rows[0][0]
            least_cat = cat_rows[-1][0]
            for row in cat_rows:
                c_name, c_amt = row[0], float(row[1])
                pct = (c_amt / total_exp * 100) if total_exp > 0 else 0.0
                category_breakdown.append({
                    "category": c_name,
                    "amount": c_amt,
                    "percentage": round(pct, 2)
                })

        # Daily spending
        daily_stmt = select(
            Expense.transaction_date,
            func.sum(Expense.amount).label("total")
        ).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        ).group_by(Expense.transaction_date).order_by(asc(Expense.transaction_date))

        daily_result = await db.execute(daily_stmt)
        daily_rows = daily_result.all()
        daily_spending = [{"date": str(r[0]), "amount": float(r[1])} for r in daily_rows]

        # Transaction stats
        stats_stmt = select(
            func.max(Expense.amount).label("max_exp"),
            func.min(Expense.amount).label("min_exp"),
            func.avg(Expense.amount).label("avg_exp"),
            func.count(Expense.id).label("count_exp")
        ).where(
            and_(
                Expense.wallet_id == wallet_id,
                func.extract("year", Expense.transaction_date) == year,
                func.extract("month", Expense.transaction_date) == month
            )
        )
        stats_res = await db.execute(stats_stmt)
        stats_row = stats_res.one()

        highest_exp = float(stats_row.max_exp) if stats_row.max_exp else 0.0
        lowest_exp = float(stats_row.min_exp) if stats_row.min_exp else 0.0
        avg_exp = float(stats_row.avg_exp) if stats_row.avg_exp else 0.0
        tx_count = int(stats_row.count_exp or 0)

        # Partner analytics (Individual Category Breakdown for Partner 1 & Partner 2)
        users_res = await db.execute(select(User))
        users = users_res.scalars().all()
        partner_analytics = []
        for u in users:
            u_inc = await CalculationService.get_total_income(db, wallet_id, year, month, user_id=u.id)
            u_exp = await CalculationService.get_total_expense(db, wallet_id, year, month, user_id=u.id)
            u_sav_contrib = u_inc - u_exp

            u_cat_stmt = select(
                Expense.category,
                func.sum(Expense.amount).label("total")
            ).where(
                and_(
                    Expense.wallet_id == wallet_id,
                    Expense.user_id == u.id,
                    func.extract("year", Expense.transaction_date) == year,
                    func.extract("month", Expense.transaction_date) == month
                )
            ).group_by(Expense.category).order_by(desc("total"))

            u_cat_rows = (await db.execute(u_cat_stmt)).all()
            u_cat_breakdown = []
            for row in u_cat_rows:
                c_name, c_amt = row[0], float(row[1])
                pct = (c_amt / u_exp * 100) if u_exp > 0 else 0.0
                u_cat_breakdown.append({
                    "category": c_name,
                    "amount": c_amt,
                    "percentage": round(pct, 2)
                })

            partner_analytics.append({
                "user_id": u.id,
                "user_name": u.full_name,
                "avatar_url": u.avatar_url,
                "income": u_inc,
                "expense": u_exp,
                "savings_contribution": u_sav_contrib,
                "category_breakdown": u_cat_breakdown
            })

        return {
            "current_balance": summary["closing_balance"],
            "total_income": summary["total_income"],
            "total_expense": summary["total_expense"],
            "savings": summary["savings"],
            "savings_rate": summary["savings_rate"],
            "average_daily_expense": summary["average_daily_expense"],
            "category_breakdown": category_breakdown,
            "daily_spending": daily_spending,
            "partner_analytics": partner_analytics,
            "top_category": top_cat,
            "least_used_category": least_cat,
            "highest_expense": highest_exp,
            "lowest_expense": lowest_exp,
            "average_expense": round(avg_exp, 2),
            "total_transactions_count": tx_count
        }
