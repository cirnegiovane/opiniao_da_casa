import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


connection_string = os.getenv("DATABASE_URL")

engine = create_engine(connection_string)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()