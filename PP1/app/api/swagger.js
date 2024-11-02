// app/api/swagger.js
import swaggerJSDoc from "swagger-jsdoc";

// Swagger definition
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Next.js API Documentation",
    version: "1.0.0",
    description: "API documentation for Next.js routes",
  },
  servers: [
    {
      url: "http://localhost:3000", // Change it according to your server URL
      description: "Local server",
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ["./**/route.js"], // Adjust this to match the location of your API files
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
