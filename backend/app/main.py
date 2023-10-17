import uuid

from fastapi import FastAPI, Form, HTTPException, UploadFile, status as s
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response

from . import database

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/books", status_code=s.HTTP_200_OK)
async def read_books():
    try:
        return database.BookRepository().find_all()
    except Exception as e:
        raise HTTPException(
            status_code=s.HTTP_400_BAD_REQUEST, detail="eror fetching data"
        )


@app.put("/api/v1/books/{id}", status_code=s.HTTP_202_ACCEPTED)
async def update_book(id: uuid.UUID, status: database.Status):
    result = database.BookRepository().update_book_by_status(id, status)
    if not result:
        raise HTTPException(
            status_code=s.HTTP_204_NO_CONTENT, detail="book not found"
        )
    return result


@app.get("/api/v1/books/{id}")
async def read_book(id: uuid.UUID):
    book = database.BookRepository().find_by_id(id)
    if book:
        return FileResponse(book.file_url)
    else:
        raise HTTPException(
            status_code=s.HTTP_204_NO_CONTENT, detail="book not found"
        )


@app.post("/api/v1/books", status_code=s.HTTP_201_CREATED)
async def create_book(file: UploadFile, title: str = Form(None)):
    file_path = "/backend/books/"
    with open(file_path + file.filename, "wb") as f:
        f.write(file.file.read())
    book = database.Book
    book.id = uuid.uuid4()

    if not title:
        book.title = file.filename
    else:
        book.title = title
    book.file_url = file_path + file.filename
    book = database.BookRepository().save(book)

    if not book:
        raise HTTPException(
            status_code=s.HTTP_409_CONFLICT, detail="book exists"
        )
    return book


@app.delete("/api/v1/books/{book_id}")
async def delete_book(book_id: uuid.UUID):
    result = database.BookRepository().delete_book_by_id(book_id)
    if not result:
        raise HTTPException(
            status_code=s.HTTP_204_NO_CONTENT, detail="book not found"
        )
    return result
