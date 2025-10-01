.PHONY: install-backend install-frontend backend-dev frontend-dev test lint typecheck docker-up docker-down seed

install-backend:
	cd backend && poetry install

install-frontend:
	cd frontend && npm install

backend-dev:
	cd backend && poetry run uvicorn app.main:app --reload

frontend-dev:
	cd frontend && npm run dev

lint:
	cd backend && poetry run ruff check .

typecheck:
	cd backend && poetry run mypy app

test:
	cd backend && poetry run pytest --cov=app --cov-report=term-missing

seed:
	cd backend && poetry run python -m app.db.seed

docker-up:
	cd deploy && docker compose up --build

docker-down:
	cd deploy && docker compose down
