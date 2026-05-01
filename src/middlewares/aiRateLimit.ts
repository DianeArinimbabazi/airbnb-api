 
import rateLimit from "express-rate-limit";

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // limit per IP
  message: {
    error: "Too many AI requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});