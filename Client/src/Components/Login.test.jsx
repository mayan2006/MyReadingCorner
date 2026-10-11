import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Login from "./Login.jsx";
import { loginUser } from "../services/UserAPI";

vi.mock("../services/UserAPI", () => ({
  loginUser: vi.fn()
}));

describe("Login", () => {
  beforeEach(() => {
    loginUser.mockReset();
  });

  it("shows the server error when login fails", async () => {
    loginUser.mockRejectedValue(new Error("אימייל או סיסמה שגויים"));
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/אימייל/), "wrong@test.com");
    await user.type(screen.getByLabelText(/סיסמה/), "bad-password");
    await user.click(screen.getByRole("button", { name: "כניסה" }));

    expect(await screen.findByText("אימייל או סיסמה שגויים")).toBeInTheDocument();
  });
});
