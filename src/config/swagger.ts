import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express, Request, Response } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb API",
      version: "1.0.0",
      description:
        "A full-featured Airbnb-like REST API with authentication, listings, bookings, reviews, file uploads, and AI-powered features.",
    },
    servers: [
      {
        url: "https://airbnb-api-3mnx.onrender.com/api/v1",
        description: "API Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d" },
            name: { type: "string", example: "Alice Johnson" },
            email: { type: "string", example: "alice@example.com" },
            username: { type: "string", example: "alice_host" },
            phone: { type: "string", example: "+1234567890" },
            role: { type: "string", enum: ["HOST", "GUEST", "ADMIN"], example: "HOST" },
            avatar: { type: "string", nullable: true, example: "https://res.cloudinary.com/..." },
            bio: { type: "string", nullable: true, example: "Love hosting guests" },
            createdAt: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
          },
        },
        Listing: {
          type: "object",
          properties: {
            id: { type: "string", example: "b4g9d3e2-5c6f-5g7b-9d0e-2f3g4b5c6d7e" },
            title: { type: "string", example: "Cozy Studio in Kigali" },
            description: { type: "string", example: "A beautiful studio with city views" },
            location: { type: "string", example: "Kigali, Rwanda" },
            pricePerNight: { type: "number", example: 85 },
            guests: { type: "integer", example: 2 },
            type: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "CABIN"], example: "APARTMENT" },
            amenities: { type: "array", items: { type: "string" }, example: ["WiFi", "Kitchen", "AC"] },
            rating: { type: "number", nullable: true, example: 4.5 },
            hostId: { type: "string", example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d" },
            createdAt: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
          },
        },
        Booking: {
          type: "object",
          properties: {
            id: { type: "string", example: "c5h0e4f3-6d7g-6h8c-0e1f-3g4h5c6d7e8f" },
            checkIn: { type: "string", format: "date-time", example: "2024-06-01T00:00:00Z" },
            checkOut: { type: "string", format: "date-time", example: "2024-06-07T00:00:00Z" },
            totalPrice: { type: "number", example: 595 },
            status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED"], example: "CONFIRMED" },
            guestId: { type: "string", example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d" },
            listingId: { type: "string", example: "b4g9d3e2-5c6f-5g7b-9d0e-2f3g4b5c6d7e" },
            createdAt: { type: "string", format: "date-time", example: "2024-01-15T10:30:00Z" },
          },
        },
        Review: {
          type: "object",
          properties: {
            id: { type: "string", example: "d6i1f5g4-7e8h-7i9d-1f2g-4h5i6d7e8f9g" },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment: { type: "string", example: "Amazing place, very clean!" },
            userId: { type: "string", example: "a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d" },
            listingId: { type: "string", example: "b4g9d3e2-5c6f-5g7b-9d0e-2f3g4b5c6d7e" },
            createdAt: { type: "string", format: "date-time", example: "2024-02-10T08:00:00Z" },
          },
        },
        RegisterInput: {
          type: "object",
          required: ["name", "email", "username", "phone", "password"],
          properties: {
            name: { type: "string", example: "Alice Johnson" },
            email: { type: "string", example: "alice@example.com" },
            username: { type: "string", example: "alice_host" },
            phone: { type: "string", example: "+1234567890" },
            password: { type: "string", minLength: 8, example: "securePass123" },
            role: { type: "string", enum: ["HOST", "GUEST"], example: "HOST" },
          },
        },
        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "alice@example.com" },
            password: { type: "string", example: "securePass123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        CreateListingInput: {
          type: "object",
          required: ["title", "description", "location", "pricePerNight", "guests", "type", "amenities"],
          properties: {
            title: { type: "string", example: "Cozy Studio in Kigali" },
            description: { type: "string", example: "A beautiful studio with city views" },
            location: { type: "string", example: "Kigali, Rwanda" },
            pricePerNight: { type: "number", example: 85 },
            guests: { type: "integer", example: 2 },
            type: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "CABIN"], example: "APARTMENT" },
            amenities: { type: "array", items: { type: "string" }, example: ["WiFi", "Kitchen"] },
          },
        },
        CreateBookingInput: {
          type: "object",
          required: ["listingId", "checkIn", "checkOut"],
          properties: {
            listingId: { type: "string", example: "b4g9d3e2-5c6f-5g7b-9d0e-2f3g4b5c6d7e" },
            checkIn: { type: "string", format: "date-time", example: "2024-06-01T00:00:00Z" },
            checkOut: { type: "string", format: "date-time", example: "2024-06-07T00:00:00Z" },
          },
        },
        CreateReviewInput: {
          type: "object",
          required: ["rating", "comment"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 4 },
            comment: { type: "string", example: "Amazing place, very clean!" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Resource not found" },
          },
        },
        PaginationMeta: {
          type: "object",
          properties: {
            total: { type: "integer", example: 42 },
            page: { type: "integer", example: 1 },
            limit: { type: "integer", example: 10 },
            totalPages: { type: "integer", example: 5 },
          },
        },
      },
    },
  },
  apis: ["./src/routes/v1/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  console.log("📚 Swagger docs available at /api-docs");
}