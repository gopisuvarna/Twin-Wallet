import pytest


@pytest.mark.asyncio
async def test_budgets_and_savings_lifecycle(client):
    # Step 1: Register Gopi & Ananya
    res1 = await client.post("/api/v1/auth/register", json={
        "full_name": "Venkata Sai Gopi",
        "email": "gopi_bs@twinwallet.com",
        "password": "SecurePassword123!"
    })
    assert res1.status_code == 201
    gopi_token = res1.json()["access_token"]
    gopi_headers = {"Authorization": f"Bearer {gopi_token}"}

    res2 = await client.post("/api/v1/auth/register", json={
        "full_name": "Ananya",
        "email": "ananya_bs@twinwallet.com",
        "password": "SecurePassword123!"
    })
    assert res2.status_code == 201

    # Step 2: Create Budget Cap for Food
    b_res = await client.post("/api/v1/budgets/", json={
        "category": "Food",
        "amount_limit": 10000.0,
        "year": 2026,
        "month": 8
    }, headers=gopi_headers)
    assert b_res.status_code == 201
    b_data = b_res.json()
    assert b_data["category"] == "Food"
    assert b_data["amount_limit"] == 10000.0
    assert b_data["is_exceeded"] is False

    # Step 3: Log expense of 12,000 under Food -> Budget exceeded
    await client.post("/api/v1/expenses/", json={
        "amount": 12000,
        "category": "Food",
        "description": "Dining out & food delivery",
        "transaction_date": "2026-08-02"
    }, headers=gopi_headers)

    b_list_res = await client.get("/api/v1/budgets/?year=2026&month=8", headers=gopi_headers)
    assert b_list_res.status_code == 200
    budgets = b_list_res.json()
    assert len(budgets) == 1
    assert budgets[0]["spent_amount"] == 12000.0
    assert budgets[0]["is_exceeded"] is True

    # Step 4: Create Savings Goal
    s_res = await client.post("/api/v1/savings/", json={
        "goal_name": "Emergency Fund",
        "target_amount": 500000.0,
        "target_date": "2026-12-31"
    }, headers=gopi_headers)
    assert s_res.status_code == 201
    s_data = s_res.json()
    assert s_data["goal_name"] == "Emergency Fund"
    assert s_data["target_amount"] == 500000.0

    # Step 5: List Savings Goals
    s_list_res = await client.get("/api/v1/savings/", headers=gopi_headers)
    assert s_list_res.status_code == 200
    assert len(s_list_res.json()) == 1
