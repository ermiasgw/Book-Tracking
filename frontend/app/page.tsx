"use client"
import Board from '@/components/board'
import AddBook from '@/components/addbook'
import { UUID } from 'crypto'
import { useState, useEffect } from 'react'


export interface book {
  id: UUID;
  title: string;
  file_url: string;
  status: string;
}

export default function Home() {

  const [books, setBooks]: [Array<book>, Function] = useState([])
  const [sync, setSync] = useState(0)
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")

  async function getbooks() {
    setError('')
    try {
      const response = await fetch('http://localhost:8000/api/v1/books')
      if (response.status === 200) {
        const data = await response.json()
        setBooks(data)
      }
      else{
        const error = await response.json()
        setError(error.detail)
      }
    } catch (error) {
     setError("server error fetching data")
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {

    getbooks();
    
  }, [])

  
  let syncing = <div
    className="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-success align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
    role="status">
  </div>
  
  
  return (
    <main className='h-full flex flex-col'>
      <div className="shadow-sm shadow- p-5 py-3 text-center">
          <h1 className='text-2xl inline-block text-gray-900 font-semibold'>Book Tracking</h1> 
          {(sync) ? (syncing): ''}
      </div>
      <AddBook setBooks={setBooks} error={error} setError={setError} />
      <Board setSync={setSync} books={books} setBooks={setBooks} isLoading={isLoading} setError={setError}   />
    </main>
  )
}
