from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

connection_string = 'postgresql://admin:admin123@db:5432/watchlist'

engine = create_engine(connection_string)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()