import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute.jsx";
import { useAuth } from "../context/AuthContext.jsx";

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: vi.fn()
}));

function renderProtected() {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <Routes>
        <Route path="/login" element={<div>מסך כניסה</div>} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>תוכן מוגן</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuth.mockReset();
  });

  it("redirects guests to the login page", () => {
    useAuth.mockReturnValue({ currentUser: null, authReady: true });
    renderProtected();
    expect(screen.getByText("מסך כניסה")).toBeInTheDocument();
    expect(screen.queryByText("תוכן מוגן")).not.toBeInTheDocument();
  });

  it("renders protected content for an authenticated user", () => {
    useAuth.mockReturnValue({
      currentUser: { userCode: "U1", role: "user" },
      authReady: true
    });
    renderProtected();
    expect(screen.getByText("תוכן מוגן")).toBeInTheDocument();
  });
});
