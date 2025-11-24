import pytest
from httpx import AsyncClient, ASGITransport

from api.routes import router
from core.engine import engine
from fastapi import FastAPI


@pytest.fixture(scope="module")
def test_app():
    app = FastAPI()
    app.include_router(router, prefix="/api")
    return app


@pytest.mark.anyio
async def test_process_endpoint_returns_result(test_app):
    payload = {
        "text": "test",
        "pipeline": {
            "blocks": [
                {
                    "id": "1",
                    "type": "base64",
                    "params": {},
                    "isEnabled": True,
                }
            ]
        },
    }

    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver") as client:
        response = await client.post("/api/process", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["result"] == "dGVzdA=="


@pytest.mark.anyio
async def test_process_endpoint_rejects_unknown_transform(test_app):
    payload = {
        "text": "hello",
        "pipeline": {
            "blocks": [
                {
                    "id": "1",
                    "type": "not_real",
                    "params": {},
                    "isEnabled": True,
                }
            ]
        },
    }

    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver") as client:
        response = await client.post("/api/process", json=payload)

    assert response.status_code == 422 or response.status_code == 400


@pytest.mark.anyio
async def test_tokenize_endpoint(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver") as client:
        response = await client.post("/api/tokenize", json={"text": "hello"})

    assert response.status_code == 200
    body = response.json()
    assert "count" in body


@pytest.mark.anyio
async def test_fuzz_endpoint(test_app):
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver") as client:
        response = await client.post(
            "/api/fuzz",
            json={"text": "sample", "count": 2, "strategies": []},
        )

    assert response.status_code == 200
    body = response.json()
    assert len(body["results"]) == 2
