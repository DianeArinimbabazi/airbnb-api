 import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  aiSearch,
  generateDescription,
  chat,
  recommend,
  reviewSummary,
} from "../../controllers/ai.controller.js";

const aiRouter = Router();

aiRouter.post("/search", aiSearch);
aiRouter.post("/listings/:id/generate-description", authenticate, generateDescription);
aiRouter.post("/chat", chat);
aiRouter.post("/recommend", authenticate, recommend);
aiRouter.get("/listings/:id/review-summary", reviewSummary);

export default aiRouter;
