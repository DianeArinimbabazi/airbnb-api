import { Router } from "express";
import {
  getAllListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  searchListings,
  getListingStats,
} from "../../controllers/listings.controller";
import { getListingReviews, createReview } from "../../controllers/reviews.controller";
import { authenticate, requireHost } from "../../middlewares/auth.middleware";
import { strictLimiter } from "../../middlewares/rateLimiter";

const router = Router();

router.get("/stats", getListingStats);
router.get("/search", searchListings);
router.get("/", getAllListings);
router.get("/:id/reviews", getListingReviews);
router.post("/:id/reviews", authenticate, strictLimiter, createReview);
router.get("/:id", getListingById);
router.post("/", authenticate, requireHost, createListing);
router.put("/:id", authenticate, updateListing);
router.delete("/:id", authenticate, deleteListing);

export default router;
