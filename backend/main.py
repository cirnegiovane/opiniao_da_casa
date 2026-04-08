from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Genre, Items, Base
from typing import Optional
import schemas

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "API Opinião da Casa está online!",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get('/genres', response_model=list[schemas.GenreResponse]) 
def list_genres(db: Session = Depends(get_db)):
    return db.query(Genre).order_by(Genre.name).all()  #SELECT * FROM genres


@app.post('/genres',response_model=schemas.GenreResponse)
def create_genre(genre: schemas.GenreCreate, db: Session = Depends(get_db)):

    genre_name = genre.name.strip().capitalize()
    
    exist = db.query(Genre).filter(Genre.name == genre_name).first()
    
    if exist:
        raise HTTPException(status_code=400, detail='Este gênero já está cadastrado.')
    

    novo_genre = Genre(name=genre_name)
    
    #SELECT * FROM items WHERE id == {item_id}
    

    db.add(novo_genre)
    db.commit()
    db.refresh(novo_genre)
    return novo_genre


@app.delete('/genres/{genre_id}')
def delete_genre(genre_id: int, db: Session = Depends(get_db)):
    genre = db.query(Genre).filter(Genre.id == genre_id).first()
    #SELECT * FROM items WHERE id == {item_id}
    
    if not genre:
        raise HTTPException(status_code=404, detail='Gênero não encontrado')

    #id, title, type, status, rating, genre_id,created_at
    db.delete(genre)
    db.commit()
    return {'message':'Gênero deletado.'}


@app.get('/items',response_model=list[schemas.ItemResponse])
def list_items(
    type: Optional[str] = None,
    status: Optional[str] = None,
    genre_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Items)
    if type:
        query = query.filter(Items.type == type)
    if status:
        query = query.filter(Items.status == status)
    if genre_id:
        query = query.filter(Items.genres.any(Genre.id == genre_id))
    return query.order_by(Items.title).all()


@app.post('/items',response_model=schemas.ItemResponse)
def create_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    novo_item = Items(title = item.title, type = item.type, status = item.status, rating = item.rating)

    db.add(novo_item)
    db.flush()

    if item.genres:
        genre_objs = db.query(Genre).filter(Genre.id.in_(item.genres)).order_by(Genre.name).all()
        novo_item.genres = genre_objs
    db.commit()
    db.refresh(novo_item)
    return novo_item



@app.put('/items/{item_id}',response_model=schemas.ItemResponse)
def update_item(item_id: int, item_data: schemas.ItemCreate, db: Session = Depends(get_db)):
    item = db.query(Items).filter(Items.id == item_id).first()
    #SELECT * FROM items WHERE id == {item_id}
    
    if not item:
        raise HTTPException(status_code=404, detail='Item não encontrado')

    #id, title, type, status, rating, genre_id,created_at
    item.title = item_data.title
    item.type = item_data.type
    item.status = item_data.status
    item.rating = item_data.rating
    if item_data.genres is not None:
        genre_objs = db.query(Genre).filter(Genre.id.in_(item_data.genres)).order_by(Genre.name).all()
        item.genres = genre_objs
    db.commit()
    db.refresh(item)
    return item



@app.delete('/items/{item_id}')
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Items).filter(Items.id == item_id).first()
    #SELECT * FROM items WHERE id == {item_id}
    
    if not item:
        raise HTTPException(status_code=404, detail='Item não encontrado')

    #id, title, type, status, rating, genre_id,created_at
    db.delete(item)
    db.commit()
    return {'message':'Item deletado.'}