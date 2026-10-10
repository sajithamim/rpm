
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_search_pricing_records():
    response = client.get(
        "/api/v1/pricing",
        params={"store_id": "STORE001"},
    )

    assert response.status_code == 200
    body = response.json()

    assert "items" in body
    assert "total" in body
    assert body["page"] == 1


def test_invalid_record_id_returns_404():
    response = client.get("/api/v1/pricing/999999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Pricing record not found"