import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import compression from "compression";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger";
import { generalLimiter } from "./middlewares/rateLimiter";
import { deprecateV1 } from "./middlewares/deprecation.middleware";
import v1Router from "./routes/v1/index";

import cors from "cors";
const app = express();
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:4173"], credentials: true }));
app.set("trust proxy", 1);

app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));
app.use(compression());
app.use(express.json());
app.use(generalLimiter);

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

setupSwagger(app);

app.use("/api/v1", deprecateV1, v1Router);

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
