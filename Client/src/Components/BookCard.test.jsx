import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

function renderCard() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return render(
    <QueryClientProvider client={client}>
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
    </QueryClientProvider>
  );
}

describe("BookCard", () => {
  it("renders the book title", () => {
    renderCard();
    expect(screen.getByText("הספר של הבדיקות")).toBeInTheDocument();
  });
});
