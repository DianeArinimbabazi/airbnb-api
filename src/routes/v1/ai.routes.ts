import { Router } from "express";
import {
  aiSearch,
  generateDescription,
  chat,
  recommend,
  reviewSummary,
} from "../../controllers/ai.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

/**
 * @openapi
 * /api/v1/ai/search:
 *   post:
 *     summary: Smart AI listing search
 *     tags:
 *       - AI
 */
router.post("/search", aiSearch);

/**
 * @openapi
 * /api/v1/ai/listings/{id}/generate-description:
 *   post:
 *     summary: Generate AI listing description
 *     tags:
 *       - AI
 */
router.post("/listings/:id/generate-description", authenticate, generateDescription);

/**
 * @openapi
 * /api/v1/ai/chat:
 *   post:
 *     summary: Guest support chatbot
 *     tags:
 *       - AI
 */
router.post("/chat", chat);

/**
 * @openapi
 * /api/v1/ai/recommend:
 *   post:
 *     summary: AI booking recommendations
 *     tags:
 *       - AI
 */
router.post("/recommend", authenticate, recommend);

/**
 * @openapi
 * /api/v1/ai/listings/{id}/review-summary:
 *   get:
 *     summary: AI review summarizer
 *     tags:
 *       - AI
 */
router.get("/listings/:id/review-summary", reviewSummary);

export default router;