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
 * @swagger
 * tags:
 *   name: AI
 *   description: AI-powered features
 */

/**
 * @swagger
 * /ai/search:
 *   post:
 *     summary: Smart listing search using AI
 *     tags: [AI]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Results per page
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [query]
 *             properties:
 *               query:
 *                 type: string
 *                 example: apartment in Kigali under $100 for 2 guests
 *     responses:
 *       200:
 *         description: Search results with extracted filters and pagination
 *       400:
 *         description: Could not extract filters or query missing
 *       500:
 *         description: Something went wrong
 */
router.post("/search", aiSearch);

/**
 * @swagger
 * /ai/listings/{id}/generate-description:
 *   post:
 *     summary: Generate AI description for a listing
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tone:
 *                 type: string
 *                 enum: [professional, casual, luxury]
 *                 example: luxury
 *     responses:
 *       200:
 *         description: Generated description and updated listing
 *       403:
 *         description: Forbidden - not the listing owner
 *       404:
 *         description: Listing not found
 *       500:
 *         description: Something went wrong
 */
router.post("/listings/:id/generate-description", authenticate, generateDescription);

/**
 * @swagger
 * /ai/chat:
 *   post:
 *     summary: Guest support chatbot with optional listing context
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId, message]
 *             properties:
 *               sessionId:
 *                 type: string
 *                 example: user-123-session-1
 *               message:
 *                 type: string
 *                 example: Does this place have WiFi?
 *               listingId:
 *                 type: string
 *                 example: a3f8c2d1-4b5e-4f6a-8c9d-1e2f3a4b5c6d
 *     responses:
 *       200:
 *         description: AI response with session info
 *       400:
 *         description: Missing sessionId or message
 *       500:
 *         description: Something went wrong
 */
router.post("/chat", chat);

/**
 * @swagger
 * /ai/recommend:
 *   post:
 *     summary: Get AI listing recommendations based on booking history
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommended listings based on booking history
 *       400:
 *         description: No booking history found
 *       500:
 *         description: Something went wrong
 */
router.post("/recommend", authenticate, recommend);

/**
 * @swagger
 * /ai/listings/{id}/review-summary:
 *   get:
 *     summary: Get AI-generated review summary for a listing
 *     tags: [AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Listing ID
 *     responses:
 *       200:
 *         description: AI summary with positives, negatives and average rating
 *       400:
 *         description: Not enough reviews (minimum 3 required)
 *       404:
 *         description: Listing not found
 *       500:
 *         description: Something went wrong
 */
router.get("/listings/:id/review-summary", reviewSummary);

export default router;