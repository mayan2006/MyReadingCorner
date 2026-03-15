import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import SingleBook from './Components/SingleBook'
import BooksPage from './Components/BooksPage'

function App() {
  const [count, setCount] = useState(0)
 const bookId ='69b1b9a268c0763527f6e300'
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<BooksPage />} />

        <Route path="/books/:bookCode" element={<SingleBook />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
