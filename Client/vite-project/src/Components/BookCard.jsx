import { Link } from "react-router-dom";

const BookCard = ({ book }) => {
  return (
    <Link 
      to={`/books/${book.bookCode}`} 
      style={{ textDecoration: "none", color: "black" }}
    >
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          borderRadius: "8px",
          maxWidth: "400px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          backgroundColor: "white",
          cursor: "pointer"
        }}
      >
        <img
          src={book.img}
          alt={book.title}
          style={{ width: "100%", borderRadius: "4px" }}
        />
        <h2>{book.title}</h2>
        <h4>Author: {book.author}</h4>
        <p>
          <strong>Summary:</strong> {book.summary}
        </p>
        <p>
          <strong>Points:</strong> {book.points}
        </p>
      </div>
    </Link>
  );
};

export default BookCard;