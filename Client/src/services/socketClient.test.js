import { afterEach, describe, expect, it, vi } from "vitest";

describe("socketClient URL helpers", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("./apiBase");
  });

  it("uses the real API origin and default path in production", async () => {
    vi.resetModules();
    vi.doMock("./apiBase", () => ({
      API_BASE_URL: "https://myreadingcornerserver.onrender.com"
    }));
    const { getSocketOrigin, getSocketPath } = await import("./socketClient.js");
    expect(getSocketOrigin()).toBe("https://myreadingcornerserver.onrender.com");
    expect(getSocketPath()).toBe("/socket.io");
  });

  it("uses the Vite origin and /api/socket.io locally", async () => {
    vi.resetModules();
    vi.doMock("./apiBase", () => ({
      API_BASE_URL: "/api"
    }));
    const { getSocketOrigin, getSocketPath } = await import("./socketClient.js");
    expect(getSocketOrigin()).toBe(window.location.origin);
    expect(getSocketPath()).toBe("/api/socket.io");
  });
});
