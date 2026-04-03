from sqlalchemy import Column, Integer, String, SmallInteger, ForeignKey, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Genre(Base):
    __tablename__ = 'genres'
    id = Column(Integer, primary_key=True)
    name = Column(String,nullable=False,unique=True)
    items = relationship('Items', secondary='item_genres', back_populates='genres')



class Items(Base):
    __tablename__ = 'items'
    __table_args__ = (
        CheckConstraint("type IN ('filme', 'livro', 'jogo', 'serie')", name='items_type_check'),
        CheckConstraint("status IN ('quero', 'em andamento', 'concluido', 'dropei')", name='items_status_check'),
        CheckConstraint("rating BETWEEN 1 AND 10", name='items_rating_check'),
    )
    id = Column(Integer, primary_key=True)
    title = Column(String,nullable=False)
    type = Column(String,nullable=False)
    status = Column(String,nullable=False)
    rating = Column(SmallInteger)
    created_at = Column(DateTime,server_default=func.now())


    genres = relationship('Genre', secondary='item_genres', back_populates='items')



class ItemGenre(Base):
    __tablename__ = 'item_genres'

    item_id = Column(ForeignKey('items.id'), primary_key=True)
    genre_id = Column(ForeignKey('genres.id'), primary_key=True)