import { Router } from "express";
import {
  aiSearch,
  generateDescription,
  chat,
  recommend,
  reviewSummary,
} from "../controllers/ai.controller.js";

const router = Router();

/**
 * AI ROUTES (Production structure)
 */

// Part 1 - Smart search
router.post("/search", aiSearch);

// Part 2 - Description generator
router.post("/listings/:id/generate-description", generateDescription);

// Part 3 - Chatbot
router.post("/chat", chat);

// Part 4 - Recommendations
router.post("/recommend", recommend);

// Part 5 - Review summary
router.get("/listings/:id/review-summary", reviewSummary);

export default router;