import { useDrag } from 'react-dnd'
import React from 'react'
import { book } from '@/app/page'
import { UUID } from 'crypto';

type Bookprops = {
  book: book;
  setBooks: Function;
  setSync: Function;
  setError: Function;
}

export default function Book({book, setBooks, setSync, setError}: Bookprops) {
    const [{isDragging}, drag] = useDrag(() => ({
        type: "book",
        item: {id: book.id},
        collect: monitor => ({
          isDragging: !!monitor.isDragging(),
        }),
      }));


    const showBook = async () => {
      setError('')
      try {
        const response = await fetch(`http://localhost:8000/api/v1/books/${book.id}`, {
          method: 'GET',
        })
        if (response.status === 200) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const iframe = document.createElement('iframe');
          iframe.src = url;
          iframe.width = "100%";
          iframe.height = "600";
          document.body.appendChild(iframe);
        }
        else {
          const error = await response.json()
          setError(error.detail)
        }
        
      } catch (error) {
       setError("server error updatong data")
      } 
    }


    const handleClick = () => {
      setBooks((prev: Array<book>) => (prev.filter((books: book) => (books.id != book.id))));
      deleteBook(book.id)
    }

    const deleteBook = async (id: UUID) => {
      setError('')
      setSync((prev: number) => (prev+1));
      try {
        const response = await fetch(`http://localhost:8000/api/v1/books/${id}`, {
          method: 'DELETE',
        })
        if (response.status != 200) {
          const error = await response.json()
          setError(error.detail)
        }
        
      } catch (error) {
       setError("server error deleting book")
      } finally {
        setSync((prev: number) => (prev-1));
      }
      
    }

  return (
    <div ref={drag} className="flex items-center mt-0 m-2 p-3 text-base font-medium text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow cursor-move">
      <button onClick={showBook} className="flex-1 ml-3 mr-12 whitespace-nowrap">{book.title}</button>
      <button onClick={handleClick} className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-red-300 rounded">delete </button>
    </div>
  );
}


