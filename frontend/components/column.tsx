import { UUID } from "crypto";
import { book } from '@/app/page';
import Book from "./book";
import { useDrop } from 'react-dnd';

type columnProps = {
  status: string;
  books: Array<book>;
  setBooks: Function;
  setSync: Function;
  setError: Function;
}

export default function Column({status, books, setBooks, setSync, setError}: columnProps) {


    const [{isOver}, drop] = useDrop(() => ({
        accept: "book",
        drop: (item: {[key: string]: UUID}) => (addItemToColumn(item.id)),
        collect: monitor => ({
          isOver: !!monitor.isOver(),
        }),
      }))

    const syncDatabase = async (id: UUID) => {
      setError('')
      setSync((prev: number) => (prev+1));
      try {
        const response = await fetch(`http://localhost:8000/api/v1/books/${id}/?status=${status}`, {
          method: 'PUT',
        })
        if (response.status !== 202) {
          const error = await response.json()
          setError(error.detail)
        }
        
      } catch (error) {
       setError("server error updating status")
      } finally {
        setSync((prev: number) => (prev-1));
      }
    }
    const addItemToColumn = (id: UUID) => {
        
        setBooks((prev: Array<book>) => {
            const data = prev.map((book) => {
              if (book.id === id){
                return {...book, status: status}
              }
              return book
            });
            return data
          });
        syncDatabase(id);
    };
    let text = "to-read";
    let bg = "text-blue-800";
    const toRead = books.filter((book) => (book.status === "to-read"));
    const inProgress = books.filter((book) => (book.status === "in-progress"));
    const completed = books.filter((book) => (book.status === "completed"));

    let comp = toRead.map((book) => (<Book key={book.id} book={book} setBooks={setBooks} setSync={setSync} setError={setError}  />) )

    if (status === "in-progress"){
        text = "in-progress";
        bg = "text-yellow-800";
        comp = inProgress.map((book) => (<Book key={book.id} book={book} setBooks={setBooks} setSync={setSync} setError={setError}  />) )
    }

    if (status === "completed"){
        text = "completed";
        bg = "text-green-800";
        comp = completed.map((book) => (<Book key={book.id} book={book} setBooks={setBooks} setSync={setSync} setError={setError}/>) )
    }

  return (
    <div ref={drop} className={`w-1/3 flex flex-col p-4 pt-2 ${isOver ? "bg-slate-100": "bg-white border" }  border-gray-200 rounded-lg shadow h-full `}>
          <span className={`bg-blue-100 mb-5 ${bg} text-sm font-medium mr-2 px-2.5 py-0.5 rounded `}>{text}</span>
          {comp}
    </div>
  );
}