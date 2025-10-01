from __future__ import annotations

import pytest


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
async def test_cart_checkout_flow(client, sample_catalog):
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
    response = await client.post("/api/webhooks/mock-payments", json=webhook_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "paid"

    response = await client.post("/api/webhooks/mock-payments", json=webhook_payload)
    assert response.status_code == 200
    assert response.json()["status"] == "paid"

    response = await client.get(f"/api/orders/{order_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "paid"
