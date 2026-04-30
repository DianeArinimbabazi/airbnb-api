import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Airbnb API",
      version: "1.0.0",
      description: "REST API for Airbnb Clone — handles auth, listings, bookings, and file uploads",
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {

        /* ========================= CORE MODELS ========================= */

        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "Alice Mugisha" },
            email: { type: "string", example: "alice@example.com" },
            username: { type: "string", example: "alice_m" },
            phone: { type: "string", example: "+250788000001" },
            role: { type: "string", enum: ["HOST", "GUEST"], example: "GUEST" },
            avatar: { type: "string", nullable: true, example: "https://cdn.example.com/avatars/alice.jpg" },
            bio: { type: "string", nullable: true, example: "Love traveling and exploring new places." },
            createdAt: { type: "string", format: "date-time", example: "2024-01-15T08:30:00.000Z" },
          },
        },

        Listing: {
          type: "object",
          properties: {
            id: { type: "integer", example: 10 },
            title: { type: "string", example: "Cozy Apartment in Kigali Heights" },
            description: { type: "string", example: "A bright and modern apartment with a stunning city view." },
            location: { type: "string", example: "Kigali, Rwanda" },
            pricePerNight: { type: "number", example: 85.00 },
            guests: { type: "integer", example: 4 },
            type: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "CABIN"], example: "APARTMENT" },
            amenities: {
              type: "array",
              items: { type: "string" },
              example: ["WiFi", "Air Conditioning", "Pool", "Parking"],
            },
            images: {
              type: "array",
              nullable: true,
              items: { type: "string" },
              example: ["https://cdn.example.com/listings/10/photo1.jpg"],
            },
            rating: { type: "number", nullable: true, example: 4.7 },
            hostId: { type: "integer", example: 1 },
            host: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time", example: "2024-02-10T10:00:00.000Z" },
          },
        },

        Booking: {
          type: "object",
          properties: {
            id: { type: "integer", example: 100 },
            checkIn: { type: "string", format: "date-time", example: "2025-06-01T14:00:00.000Z" },
            checkOut: { type: "string", format: "date-time", example: "2025-06-07T11:00:00.000Z" },
            total: { type: "number", example: 510.00 },
            status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED"], example: "CONFIRMED" },
            guestId: { type: "integer", example: 2 },
            listingId: { type: "integer", example: 10 },
            guest: { $ref: "#/components/schemas/User" },
            listing: { $ref: "#/components/schemas/Listing" },
            createdAt: { type: "string", format: "date-time", example: "2024-05-20T09:15:00.000Z" },
          },
        },

        Review: {
          type: "object",
          properties: {
            id: { type: "integer", example: 55 },
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Amazing stay, host was very welcoming!" },
            listingId: { type: "integer", example: 10 },
            reviewer: {
              type: "object",
              properties: {
                name: { type: "string", example: "Alice Mugisha" },
                avatar: { type: "string", nullable: true, example: "https://cdn.example.com/avatars/alice.jpg" },
              },
            },
            createdAt: { type: "string", format: "date-time", example: "2024-06-10T12:00:00.000Z" },
          },
        },

        /* ========================= INPUT SCHEMAS ========================= */

        RegisterInput: {
          type: "object",
          required: ["name", "email", "username", "phone", "password", "role"],
          properties: {
            name: { type: "string", example: "Alice Mugisha" },
            email: { type: "string", example: "alice@example.com" },
            username: { type: "string", example: "alice_m" },
            phone: { type: "string", example: "+250788000001" },
            password: { type: "string", example: "SecurePass123!" },
            role: { type: "string", enum: ["HOST", "GUEST"], example: "GUEST" },
          },
        },

        LoginInput: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", example: "alice@example.com" },
            password: { type: "string", example: "SecurePass123!" },
          },
        },

        CreateListingInput: {
          type: "object",
          required: ["title", "description", "location", "pricePerNight", "guests", "type"],
          properties: {
            title: { type: "string", example: "Cozy Apartment in Kigali Heights" },
            description: { type: "string", example: "A bright and modern apartment with a stunning city view." },
            location: { type: "string", example: "Kigali, Rwanda" },
            pricePerNight: { type: "number", example: 85.00 },
            guests: { type: "integer", example: 4 },
            type: { type: "string", enum: ["APARTMENT", "HOUSE", "VILLA", "CABIN"], example: "APARTMENT" },
            amenities: {
              type: "array",
              nullable: true,
              items: { type: "string" },
              example: ["WiFi", "Air Conditioning", "Pool"],
            },
          },
        },

        CreateBookingInput: {
          type: "object",
          required: ["listingId", "checkIn", "checkOut"],
          properties: {
            listingId: { type: "integer", example: 10 },
            checkIn: { type: "string", format: "date-time", example: "2025-06-01T14:00:00.000Z" },
            checkOut: { type: "string", format: "date-time", example: "2025-06-07T11:00:00.000Z" },
          },
        },

        CreateReviewInput: {
          type: "object",
          required: ["rating", "comment"],
          properties: {
            rating: { type: "integer", minimum: 1, maximum: 5, example: 5 },
            comment: { type: "string", example: "Amazing stay, host was very welcoming!" },
          },
        },

        /* ========================= RESPONSE SCHEMAS ========================= */

        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string", example: "Resource not found" },
          },
        },

        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            user: { $ref: "#/components/schemas/User" },
          },
        },

        PaginatedListings: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Listing" },
            },
            meta: {
              type: "object",
              properties: {
                total: { type: "integer", example: 84 },
                page: { type: "integer", example: 1 },
                limit: { type: "integer", example: 10 },
                totalPages: { type: "integer", example: 9 },
              },
            },
          },
        },

        ListingStats: {
          type: "object",
          properties: {
            totalListings: { type: "integer", example: 84 },
            averagePrice: { type: "number", example: 92.50 },
            byLocation: {
              type: "object",
              additionalProperties: { type: "integer" },
              example: { "Kigali, Rwanda": 34, "Nairobi, Kenya": 20 },
            },
            byType: {
              type: "object",
              additionalProperties: { type: "integer" },
              example: { APARTMENT: 40, VILLA: 18, HOUSE: 16, CABIN: 10 },
            },
          },
        },

      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./src/routes/v1/*.ts"],
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app: Express): void {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(spec);
  });
  console.log("📚 Swagger docs at http://localhost:3000/api-docs");
}