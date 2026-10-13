import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import BookCard from "./BookCard.jsx";

const authState = vi.hoisted(() => ({
  currentUser: { userCode: "U1", role: "user" }
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    currentUser: authState.currentUser,
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
  afterEach(() => {
    authState.currentUser = { userCode: "U1", role: "user" };
    delete globalThis.Swal;
  });

  it("renders the book title", () => {
    renderCard();
    expect(screen.getByText("הספר של הבדיקות")).toBeInTheDocument();
  });

  it("asks a guest to log in when tapping like", async () => {
    authState.currentUser = null;
    const fire = vi.fn().mockResolvedValue({ isConfirmed: false });
    globalThis.Swal = { fire };
    const user = userEvent.setup();
    renderCard();
    await user.click(screen.getByRole("button", { name: "התחברו כדי לסמן לייק" }));
    expect(fire).toHaveBeenCalled();
    expect(fire.mock.calls[0][0].title).toBe("התחברו כדי לסמן לייק");
  });
});
