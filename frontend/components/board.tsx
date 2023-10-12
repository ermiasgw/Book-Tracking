import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Column from './column'
import { book } from '@/app/page'

type Props = {
  books: Array<book>;
  setBooks: Function;
  setSync: Function;
  isLoading: boolean;
  setError: Function;
}

export default function Board({ books, setBooks, setSync, isLoading, setError}: Props) {


  const book_tags: string[] = ["to-read", "in-progress", "completed"]

  if (isLoading) {
    return <div>loading</div>
  }
      
  return (
    <DndProvider backend={HTML5Backend}>
    <div className='grow flex flex-row flex-nowrap justify-evenly space-x-10 p-20 py-0 pb-50'>
        { book_tags.map((status, index) => ( <Column key={index} status={status} books={books} setBooks={setBooks} setSync={setSync} setError={setError}/>)) }
    </div>
    </DndProvider>
  );
}

