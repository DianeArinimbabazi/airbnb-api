import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";
import { generalLimiter } from "./middlewares/rateLimiter";
import { deprecateV1 } from "./middlewares/deprecation.middleware";
import v1Router from "./routes/v1/index";
import { userUploadRouter, listingUploadRouter } from "./routes/upload.routes";

const app = express();

app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(generalLimiter);

// Health check — before swagger and routes
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

setupSwagger(app);

app.use("/api/v1", deprecateV1, v1Router);
app.use("/api/v1/users", userUploadRouter);
app.use("/api/v1/listings", listingUploadRouter);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Airbnb API running 🚀" });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

const PORT = Number(process.env["PORT"]) || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});