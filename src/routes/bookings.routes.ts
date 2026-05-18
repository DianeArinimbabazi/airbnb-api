import { Router } from "express";
import { getAllBookings, getBookingById, createBooking, deleteBooking, updateBookingStatus } from "../controllers/bookings.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { strictLimiter } from "../middlewares/rateLimiter";

const router = Router();

router.get("/all", authenticate, requireAdmin, getAllBookings);
router.get("/", authenticate, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.post("/", authenticate, strictLimiter, createBooking);
router.patch("/:id/status", authenticate, requireAdmin, updateBookingStatus);
router.delete("/:id", authenticate, deleteBooking);

export default router;
