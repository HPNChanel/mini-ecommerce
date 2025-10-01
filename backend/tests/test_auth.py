from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_auth_flow(client):
    register_payload = {
        "email": "user@example.com",
        "password": "Password123",
        "name": "Test User",
    }
    response = await client.post("/api/auth/register", json=register_payload)
    assert response.status_code == 201
    login_payload = {"email": register_payload["email"], "password": register_payload["password"]}
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    tokens = response.json()["tokens"]
    assert "access_token" in tokens

    refresh_payload = {"refresh_token": tokens["refresh_token"]}
    response = await client.post("/api/auth/refresh", json=refresh_payload)
    assert response.status_code == 200
    new_access = response.json()["access_token"]
    assert new_access

    response = await client.post("/api/auth/logout", json=refresh_payload)
    assert response.status_code == 204

    response = await client.post("/api/auth/refresh", json=refresh_payload)
    assert response.status_code == 401
