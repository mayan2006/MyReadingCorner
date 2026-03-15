import { useEffect, useState } from "react";
import axios from "axios";
import BookCard from "../Components/BookCard";

const BooksPage = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/books");
        setBooks(res.data); 
      } catch (error) {
        console.error("Failed to fetch books:", error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        padding: "40px"
      }}
    >
      {books.map((book) => (
        <BookCard key={book.bookCode} book={book} />
      ))}
    </div>
  );
};

export default BooksPage;