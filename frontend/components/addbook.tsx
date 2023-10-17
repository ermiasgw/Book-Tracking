import React, { useState, FormEvent } from 'react'

type props = {
  setBooks: Function;
  error: String;
  setError: Function;
}

export default function AddBook({setBooks, error, setError}: props) {

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [success, setSuccess] = useState<string>('')
 
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true) 
    setSuccess('')
    setError('')
    
    try {
      const formData = new FormData(event.currentTarget);
      const response = await fetch('http://localhost:8000/api/v1/books', {
        method: 'POST',
        body: formData,
      })
      if (response.status === 201) {
        const data = await response.json()
        setBooks(data)
        setSuccess("book added")
      }
      else{
        const error = await response.json()
        setError(error.detail)
      }
    } catch (error) {
     setError("server error fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  const successJsx = <div className="text-sm font-normal text-center text-green-500">* {success}</div>
  const errorJsx = <div className="text-sm font-normal text-center text-red-500">* {error}</div>

    return (
        <div className='mx-auto p-5'>
          <form method='POST' onSubmit={onSubmit} className=' flex flex-row items-center justify-center space-x-2'>
            <input name='title' className=' text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none placeholder-gray-400 focus:shadow focus:shadow-slate-700' type="text" placeholder='Book Title' />
            <input name='file' className="inline  text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none " id="file_input" type="file" accept="application/pdf" required />
            <button type='submit' className='text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center whitespace-nowrap'  disabled={isLoading}>{isLoading ? 'Loading...' : 'Add Book'}</button>
          </form>
          {(error) ? (errorJsx): ''}
          {(success) ? (successJsx): ''}
      </div>
    );
}