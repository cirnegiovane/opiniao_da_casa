from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime


class GenreCreate(BaseModel):
    name: str


class GenreResponse(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)


class ItemCreate(BaseModel):
    title: str
    type: Literal['filme', 'livro', 'jogo', 'serie']
    status: Literal['quero', 'em andamento', 'concluido', 'dropei']
    rating: Optional[int] = None
    genres: Optional[list[int]] = None


class ItemResponse(BaseModel):
    id: int
    title: str
    type: Literal['filme', 'livro', 'jogo', 'serie']
    status: Literal['quero', 'em andamento', 'concluido', 'dropei']
    rating: Optional[int] = None
    genres: Optional[list[GenreResponse]] = []
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)