const swaggerUi = require("swagger-ui-express");
const { openapiSpec } = require("./openapi");

/** דף תיעוד אינטראקטיבי + JSON גולמי למראיינים / כלים. */
function mountSwagger(app) {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openapiSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapiSpec, {
      customSiteTitle: "פינת הקריאה שלי — API",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true
      }
    })
  );
}

module.exports = { mountSwagger };
