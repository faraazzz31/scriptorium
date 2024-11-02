import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../swagger";
import { NextResponse } from "next/server";

/**
 * Route for serving the Swagger JSON specification and the Swagger UI.
 */

// Serve Swagger JSON Spec
export async function GET() {
  console.log(swaggerSpec);
  return NextResponse.json(swaggerSpec, { status: 200 });
}

// Swagger UI page setup (for visual documentation)
export const swaggerUiHandler = swaggerUi.setup(swaggerSpec);
