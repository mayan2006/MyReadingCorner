import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const SingleBook = () => {
  const { bookCode } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/books/code/${bookCode}`
        );

        setBook(res.data); 
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookCode]);

  if (loading) return <p>Loading book...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!book) return <p>No book found</p>;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        padding: "40px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          backgroundColor: "white",
          color: "black",
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }}
      >
        <h2 style={{ marginBottom: "20px" }}>{book.title}</h2>
        <p style={{ lineHeight: "1.6", fontSize: "18px" }}>
          {book.content}
        </p>
      </div>
    </div>
  );
};

export default SingleBook;