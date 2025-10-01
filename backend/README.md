# Mini E-commerce Backend

## Getting Started

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

## Tests

```bash
poetry run pytest
```

## Database Migrations

```bash
poetry run alembic upgrade head
poetry run python -m app.db.seed
```
