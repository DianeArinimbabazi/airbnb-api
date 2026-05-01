import { Router } from "express";
import { getAllBookings, getBookingById, createBooking, deleteBooking } from "../controllers/bookings.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { strictLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/", authenticate, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.post("/", authenticate, strictLimiter, createBooking);
router.delete("/:id", authenticate, deleteBooking);

export default router;
