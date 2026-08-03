import pytest


@pytest.mark.asyncio
async def test_full_twin_wallet_lifecycle_integration(client):
    # Step 1: Register Gopi & Ananya
    res1 = await client.post("/api/v1/auth/register", json={
        "full_name": "Venkata Sai Gopi",
        "email": "gopi_e2e@twinwallet.com",
        "password": "SecurePassword123!"
    })
    assert res1.status_code == 201
    gopi_token = res1.json()["access_token"]
    gopi_headers = {"Authorization": f"Bearer {gopi_token}"}

    res2 = await client.post("/api/v1/auth/register", json={
        "full_name": "Ananya",
        "email": "ananya_e2e@twinwallet.com",
        "password": "SecurePassword123!"
    })
    assert res2.status_code == 201
    ananya_token = res2.json()["access_token"]
    ananya_headers = {"Authorization": f"Bearer {ananya_token}"}

    # Step 2: Attempt 3rd registration -> Must fail (Strict 2-user enforcement)
    res3 = await client.post("/api/v1/auth/register", json={
        "full_name": "Unauthorized User",
        "email": "unauthorized@twinwallet.com",
        "password": "SecurePassword123!"
    })
    assert res3.status_code == 403

    # Step 3: Gopi logs Salary: ₹80,000
    inc_res = await client.post("/api/v1/incomes/", json={
        "amount": 80000,
        "source": "Salary",
        "description": "July Monthly Salary",
        "transaction_date": "2026-07-01"
    }, headers=gopi_headers)
    assert inc_res.status_code == 201

    # Step 4: Ananya logs Rent: ₹30,000
    exp_res1 = await client.post("/api/v1/expenses/", json={
        "amount": 30000,
        "category": "Rent",
        "description": "July House Rent",
        "transaction_date": "2026-07-03"
    }, headers=ananya_headers)
    assert exp_res1.status_code == 201
    rent_id = exp_res1.json()["id"]

    # Step 5: Gopi logs Groceries: ₹15,000
    exp_res2 = await client.post("/api/v1/expenses/", json={
        "amount": 15000,
        "category": "Food",
        "description": "Supermarket Groceries",
        "transaction_date": "2026-07-05"
    }, headers=gopi_headers)
    assert exp_res2.status_code == 201

    # Step 6: Verify Summary Calculations (SSOT)
    summary_res = await client.get("/api/v1/ledger/summary?year=2026&month=7", headers=gopi_headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()

    assert summary["total_income"] == 80000.0
    assert summary["total_expense"] == 45000.0
    assert summary["closing_balance"] == 35000.0
    assert summary["savings"] == 35000.0
    assert summary["savings_rate"] == 43.75

    # Step 6b: Verify Dashboard Analytics & Partner Category Breakdown
    analytics_res = await client.get("/api/v1/analytics/dashboard?year=2026&month=7", headers=gopi_headers)
    assert analytics_res.status_code == 200
    analytics_data = analytics_res.json()
    assert "partner_analytics" in analytics_data
    assert len(analytics_data["partner_analytics"]) == 2

    # Verify each partner has their individual category breakdown list present
    for partner in analytics_data["partner_analytics"]:
        assert "category_breakdown" in partner
        if partner["user_name"] == "Ananya":
            assert len(partner["category_breakdown"]) == 1
            assert partner["category_breakdown"][0]["category"] == "Rent"
            assert partner["category_breakdown"][0]["amount"] == 30000.0
        elif partner["user_name"] == "Venkata Sai Gopi":
            assert len(partner["category_breakdown"]) == 1
            assert partner["category_breakdown"][0]["category"] == "Food"
            assert partner["category_breakdown"][0]["amount"] == 15000.0

    # Step 7: Verify PDF Report Generation
    pdf_res = await client.get("/api/v1/reports/pdf?year=2026&month=7", headers=gopi_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 100

    # Step 8: Delete Rent expense and verify dynamic recalculation SSOT
    del_res = await client.delete(f"/api/v1/expenses/{rent_id}", headers=ananya_headers)
    assert del_res.status_code == 204

    updated_summary_res = await client.get("/api/v1/ledger/summary?year=2026&month=7", headers=gopi_headers)
    updated_summary = updated_summary_res.json()
    assert updated_summary["total_expense"] == 15000.0
    assert updated_summary["closing_balance"] == 65000.0
