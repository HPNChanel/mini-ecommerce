from __future__ import annotations

import pytest

from app.core.security import get_password_hash
from app.models.user import User, UserRole


async def create_user_and_login(client):
    await client.post(
        "/api/auth/register",
        json={"email": "buyer@example.com", "password": "Password123", "name": "Buyer"},
    )
    response = await client.post(
        "/api/auth/login", json={"email": "buyer@example.com", "password": "Password123"}
    )
    data = response.json()
    return data["tokens"]["access_token"], data["user"]["id"]


@pytest.mark.asyncio
async def test_cart_checkout_flow(client, sample_catalog, session):
    token, _ = await create_user_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/cart", headers=headers)
    assert response.status_code == 200
    cart_id = response.json()["id"]

    product_resp = await client.get("/api/products", params={"page": 1, "page_size": 10})
    product_id = product_resp.json()["items"][0]["id"]

    response = await client.post(
        "/api/cart/items",
        headers=headers,
        json={"product_id": product_id, "qty": 2},
    )
    assert response.status_code == 201
    item_id = response.json()["id"]

    response = await client.patch(
        f"/api/cart/items/{item_id}",
        headers=headers,
        json={"qty": 3},
    )
    assert response.status_code == 200
    assert response.json()["qty"] == 3

    response = await client.post(
        "/api/checkout",
        headers=headers,
        json={"cart_id": cart_id},
    )
    assert response.status_code == 201
    checkout_data = response.json()
    assert checkout_data["payment_ref"]

    response = await client.get("/api/orders", headers=headers)
    assert response.status_code == 200
    orders = response.json()
    assert orders["total"] == 1
    order_id = orders["items"][0]["id"]

    webhook_payload = {"payment_ref": checkout_data["payment_ref"]}
    response = await client.post(
        "/api/webhooks/mock-payments",
        json=webhook_payload,
        headers={"x-mockpay-signature": "test-shared-secret"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "paid"
    paid_at = response.json()["paid_at"]
    assert paid_at is not None

    response = await client.post(
        "/api/webhooks/mock-payments",
        json=webhook_payload,
        headers={"x-mockpay-signature": "test-shared-secret"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "paid"
    assert response.json()["paid_at"] == paid_at

    response = await client.get(f"/api/orders/{order_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "paid"
    assert response.json()["paid_at"] == paid_at

    admin = User(
        email="admin@example.com",
        full_name="Admin",
        hashed_password=get_password_hash("AdminPass123!"),
        role=UserRole.admin,
    )
    session.add(admin)
    await session.commit()

    admin_login = await client.post(
        "/api/auth/login", json={"email": "admin@example.com", "password": "AdminPass123!"}
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["tokens"]["access_token"]

    replay_response = await client.post(
        f"/api/admin/payments/replay/{checkout_data['payment_ref']}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert replay_response.status_code == 200
    assert replay_response.json()["status"] == "paid"
    assert replay_response.json()["paid_at"] == paid_at


@pytest.mark.asyncio
async def test_mock_payment_requires_signature(client):
    response = await client.post(
        "/api/webhooks/mock-payments",
        json={"payment_ref": "pay_missing"},
    )
    assert response.status_code == 422  # Missing header

    response = await client.post(
        "/api/webhooks/mock-payments",
        json={"payment_ref": "pay_missing"},
        headers={"x-mockpay-signature": "wrong"},
    )
    assert response.status_code == 401
