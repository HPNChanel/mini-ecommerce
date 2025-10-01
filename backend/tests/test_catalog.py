from __future__ import annotations

import pytest


@pytest.mark.asyncio
async def test_product_search(client, sample_catalog):
    response = await client.get("/api/products", params={"page": 1, "page_size": 10})
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["slug"] == "test-product"

    response = await client.get("/api/products/test-product")
    assert response.status_code == 200
    product = response.json()
    assert product["sku"] == "SKU100"
