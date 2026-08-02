import pytest


@pytest.mark.asyncio
async def test_income_and_expense_flow_and_ssot_calculations(client):
    # Register Gopi
    res1 = await client.post("/api/v1/auth/register", json={
        "full_name": "Gopi",
        "email": "gopi_tx@twinwallet.com",
        "password": "Password123!"
    })
    token1 = res1.json()["access_token"]

    # Register Ananya
    res2 = await client.post("/api/v1/auth/register", json={
        "full_name": "Ananya",
        "email": "ananya_tx@twinwallet.com",
        "password": "Password123!"
    })
    token2 = res2.json()["access_token"]

    headers1 = {"Authorization": f"Bearer {token1}"}
    headers2 = {"Authorization": f"Bearer {token2}"}

    # Gopi logs Income: ₹80,000
    inc_res = await client.post("/api/v1/incomes/", json={
        "amount": 80000,
        "source": "Salary",
        "description": "Monthly Salary",
        "transaction_date": "2026-07-01"
    }, headers=headers1)
    assert inc_res.status_code == 201

    # Ananya logs Expense: ₹30,000
    exp_res1 = await client.post("/api/v1/expenses/", json={
        "amount": 30000,
        "category": "Rent",
        "description": "House Rent",
        "transaction_date": "2026-07-05"
    }, headers=headers2)
    assert exp_res1.status_code == 201

    # Gopi logs Expense: ₹20,000
    exp_res2 = await client.post("/api/v1/expenses/", json={
        "amount": 20000,
        "category": "Food",
        "description": "Groceries & Dining",
        "transaction_date": "2026-07-10"
    }, headers=headers1)
    assert exp_res2.status_code == 201

    # Fetch wallet summary for July 2026
    summary_res = await client.get("/api/v1/ledger/summary?year=2026&month=7", headers=headers1)
    assert summary_res.status_code == 200
    summary = summary_res.json()

    # Calculations Check:
    # Opening: 0
    # Income: 80,000
    # Expenses: 50,000 (30,000 + 20,000)
    # Closing Balance: 30,000
    # Savings: 30,000
    # Savings Rate: 37.5% (30000 / 80000 * 100)
    assert summary["total_income"] == 80000.0
    assert summary["total_expense"] == 50000.0
    assert summary["closing_balance"] == 30000.0
    assert summary["savings"] == 30000.0
    assert summary["savings_rate"] == 37.5

    # Check partner contributions (MUST display real names Gopi & Ananya)
    contributions = summary["partner_contributions"]
    names = [c["user_name"] for c in contributions]
    assert "Gopi" in names
    assert "Ananya" in names
