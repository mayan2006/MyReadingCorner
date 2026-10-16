const { request, app } = require("./helpers");

describe("Swagger", () => {
  it("serves the OpenAPI JSON spec", async () => {
    const res = await request(app).get("/api-docs.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(res.body.info.title).toContain("פינת הקריאה");
    expect(res.body.paths["/user/login"].post).toBeDefined();
    expect(res.body.paths["/books"].get).toBeDefined();
  });

  it("serves the Swagger UI", async () => {
    const res = await request(app).get("/api-docs/");
    expect(res.status).toBe(200);
    expect(String(res.text)).toMatch(/swagger/i);
  });
});
