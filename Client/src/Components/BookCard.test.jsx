import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BookCard from "./BookCard.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    currentUser: { userCode: "U1", role: "user" },
    authReady: true
  })
}));

vi.mock("../services/bookLikeApi", () => ({
  getBookLikeState: vi.fn().mockResolvedValue({ count: 0, likedByUser: false }),
  toggleBookLike: vi.fn()
}));

vi.mock("../services/markedBookApi", () => ({
  addMarkedBook: vi.fn(),
  getAllMarkedBook: vi.fn().mockResolvedValue([]),
  deleteMarkedBook: vi.fn()
}));

vi.mock("../services/apiBase", () => ({
  resolveMediaUrl: (url) => url || ""
}));

describe("BookCard", () => {
  it("renders the book title", () => {
    render(
      <MemoryRouter>
        <BookCard
          book={{
            bookCode: "B1",
            title: "הספר של הבדיקות",
            author: "מחברת",
            summary: "תקציר קצר"
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("הספר של הבדיקות")).toBeInTheDocument();
  });
});
