import time
import uuid
from dataclasses import dataclass
from enum import Enum
from typing import Iterable

import psycopg2


class Database:
    """
    Database context manager
    """

    def __init__(self) -> None:
        self.driver = psycopg2

    def check_for_database(self):
        try:
            conn = self.driver.connect(
                host="db", port="5432", user="root", password="root", dbname="tracking"
            )
            conn.close()
        except psycopg2.Error as e:
            print(f"Error: {e}")

    def connect_to_database(self):
        return self.driver.connect(
            host="db", port="5432", user="root", password="root", database="tracking"
        )

    def __enter__(self):
        self.connection = self.connect_to_database()
        self.cursor = self.connection.cursor()
        return self

    def __exit__(self, exception_type, exc_val, traceback):
        self.cursor.close()
        self.connection.close()


class Status(str, Enum):
    to_read = "to-read"
    in_progress = "in-progress"
    completed = "completed"


@dataclass
class Book:
    id: uuid.UUID
    title: str
    file_url: str
    status: Status


class BookRepository:
    def save(self, book: Book) -> Book:
        if self.exists(book.file_url):
            with Database() as db:
                db.cursor.execute(
                    f"""
                        INSERT INTO book (id, title, file)
                        VALUES('{book.id}', '{book.title}', 
                    '{book.file_url}'
                    ) 
                    RETURNING id;
                        """
                )
                db.connection.commit()

                books = self.find_all()
                return books
        else:
            return None

    def find_by_id(self, id: uuid.UUID) -> Book:
        with Database() as db:
            db.cursor.execute(
                f"""
                SELECT id, title, file, status FROM book
                WHERE id='{id}'"""
            )
            data = db.cursor.fetchone()
            if data is None:
                return None

        return Book(*data)

    def exists(self, file_url: str) -> bool:
        with Database() as db:
            db.cursor.execute(
                f"""
                SELECT id, title, file, status FROM book
                WHERE file=('{file_url}')"""
            )
            data = db.cursor.fetchone()
            if data is None:
                return True
            else:
                return False

    def find_all(
        self,
    ) -> Iterable[Book]:
        with Database() as db:
            db.cursor.execute(
                """
                SELECT id, title, file, status FROM book"""
            )
            books = [
                {
                    "id": data[0],
                    "title": data[1],
                    "file_url": data[2],
                    "status": data[3],
                }
                for data in db.cursor.fetchall()
            ]
        return books

    def find_all_by_status(self, status: Status) -> Iterable[Book]:
        with Database() as db:
            db.cursor.execute(
                f"""
                SELECT id, title, file, status FROM book
                WHERE status='{status}';"""
            )
            books = [
                {
                    "id": data[0],
                    "title": data[1],
                    "file_url": data[2],
                    "status": data[3],
                }
                for data in db.cursor.fetchall()
            ]
        return books

    def delete_book_by_id(self, id: uuid.UUID):
        with Database() as db:
            db.cursor.execute(
                f"""
            DELETE FROM book
            WHERE id='{id}';
                            """
            )
            db.connection.commit()
            res = db.cursor.statusmessage
        if res == "DELETE 1":
            return True
        return False

    def update_book_by_status(self, id: uuid.UUID, status: Status):
        with Database() as db:
            db.cursor.execute(
                f"""
            UPDATE book
            SET status='{status.value}'
            WHERE id='{id}'
            RETURNING id;
                            """
            ) 
            db.connection.commit()
            result = db.cursor.fetchone()
            if not result:
                return None
            updated_id = result[0]
            data = self.find_by_id(updated_id)
        return data
