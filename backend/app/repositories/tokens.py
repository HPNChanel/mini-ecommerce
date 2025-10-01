"""Token repository."""
from __future__ import annotations

import datetime as dt

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.token import Token, TokenType
from .base import SQLAlchemyRepository


class TokenRepository(SQLAlchemyRepository[Token]):
    def __init__(self, session: AsyncSession) -> None:
        super().__init__(session, Token)

    async def create_refresh_token(self, *, user_id: int, jti: str, expires_at: dt.datetime) -> Token:
        token = Token(user_id=user_id, token_type=TokenType.refresh, jti=jti, expires_at=expires_at)
        await self.add(token)
        return token

    async def revoke_by_jti(self, jti: str) -> None:
        await self.session.execute(update(Token).where(Token.jti == jti).values(revoked=True))

    async def is_jti_revoked(self, jti: str) -> bool:
        result = await self.session.execute(select(Token.revoked).where(Token.jti == jti))
        row = result.first()
        return bool(row and row[0])

    async def prune_expired(self) -> None:
        await self.session.execute(
            update(Token).where(Token.expires_at < dt.datetime.utcnow()).values(revoked=True)
        )
