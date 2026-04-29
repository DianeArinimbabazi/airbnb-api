import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { setupSwagger } from "./config/swagger";

import authRoutes from "./routes/auth.routes";
import usersRoutes from "./routes/users.routes";
import listingsRoutes from "./routes/listings.routes";
import bookingsRoutes from "./routes/bookings.routes";
import { userUploadRouter, listingUploadRouter } from "./routes/upload.routes";

const app = express();

app.use(express.json());

setupSwagger(app);

/* =========================
   ROUTES
========================= */
app.use("/auth", authRoutes);
app.use("/users", userUploadRouter);
app.use("/users", usersRoutes);
app.use("/listings", listingUploadRouter);
app.use("/listings", listingsRoutes);
app.use("/bookings", bookingsRoutes);

/* =========================
   HEALTH CHECK
========================= */
app.get("/", (req, res) => {
  res.json({ message: "Airbnb API running 🚀" });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});