import { Router } from "express";
import { getAllBookings, getBookingById, createBooking, cancelBooking } from "../../controllers/bookings.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { strictLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/", authenticate, getAllBookings);
router.get("/:id", authenticate, getBookingById);
router.post("/", authenticate, strictLimiter, createBooking);
router.delete("/:id", authenticate, cancelBooking);

export default router;
