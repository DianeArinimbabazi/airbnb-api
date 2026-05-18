import { Router } from "express";
import { getListingReviews, createReview, deleteReview, getAllReviews, createReviewByBooking } from "../controllers/reviews.controller";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import { strictLimiter } from "../middlewares/rateLimiter";

const router = Router({ mergeParams: true });

router.get("/all", authenticate, requireAdmin, getAllReviews);
router.get("/listings/:id/reviews", getListingReviews);
router.post("/listings/:id/reviews", authenticate, strictLimiter, createReview);
router.post("/reviews", authenticate, strictLimiter, createReviewByBooking);
router.delete("/reviews/:id", authenticate, deleteReview);

export default router;
