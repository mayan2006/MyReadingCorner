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

    const { container } = render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText(/אימייל/), "wrong@test.com");
    await user.type(container.querySelector('input[name="password"]'), "bad-password");
    await user.click(screen.getByRole("button", { name: "כניסה" }));

    expect(await screen.findByText("אימייל או סיסמה שגויים")).toBeInTheDocument();
  });

  it("reveals the typed password when the eye button is clicked", async () => {
    const user = userEvent.setup();

    const { container } = render(
      <MemoryRouter>
        <Login onLogin={vi.fn()} />
      </MemoryRouter>
    );

    const passwordInput = container.querySelector('input[name="password"]');
    expect(passwordInput).toHaveAttribute("type", "password");

    await user.type(passwordInput, "Secret1");
    await user.click(screen.getByRole("button", { name: "הצג סיסמה" }));

    expect(passwordInput).toHaveAttribute("type", "text");
    expect(passwordInput).toHaveValue("Secret1");
  });
});
