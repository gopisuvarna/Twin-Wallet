import pytest


@pytest.mark.asyncio
async def test_register_users_and_strict_twin_limit(client):
    # 1. Register User 1 (Gopi)
    res1 = await client.post("/api/v1/auth/register", json={
        "full_name": "Venkata Sai Gopi",
        "email": "gopi@twinwallet.com",
        "password": "Password123!"
    })
    assert res1.status_code == 201
    data1 = res1.json()
    assert data1["user"]["full_name"] == "Venkata Sai Gopi"
    assert "access_token" in data1

    # 2. Register User 2 (Ananya)
    res2 = await client.post("/api/v1/auth/register", json={
        "full_name": "Ananya",
        "email": "ananya@twinwallet.com",
        "password": "Password123!"
    })
    assert res2.status_code == 201
    data2 = res2.json()
    assert data2["user"]["full_name"] == "Ananya"

    # 3. Attempt Register User 3 (Should fail with 403 Forbidden - Twin limit exceeded)
    res3 = await client.post("/api/v1/auth/register", json={
        "full_name": "Third Person",
        "email": "third@twinwallet.com",
        "password": "Password123!"
    })
    assert res3.status_code == 403
    assert "Maximum limit of 2 users reached" in res3.json()["detail"]


@pytest.mark.asyncio
async def test_login_success(client):
    # Register user
    await client.post("/api/v1/auth/register", json={
        "full_name": "Venkata Sai Gopi",
        "email": "gopi_login@twinwallet.com",
        "password": "Password123!"
    })

    # Login
    res = await client.post("/api/v1/auth/login", json={
        "email": "gopi_login@twinwallet.com",
        "password": "Password123!"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
