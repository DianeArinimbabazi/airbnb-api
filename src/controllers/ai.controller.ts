import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { AIService } from "../services/ai.service.js";
import { getCache, setCache } from "../config/cache.js";

/* =========================
   PART 1 — AI SEARCH
========================= */
export async function aiSearch(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    if (!query) return res.status(400).json({ error: "Query is required" });

    const filters = await AIService.extractSearchFilters(query);

    const allNull = Object.values(filters).every((v) => v === null);
    if (allNull) {
      return res.status(400).json({
        error: "Could not extract any filters from your query, please be more specific",
      });
    }

    const where: any = {};
    if (filters.location)
      where.location = { contains: filters.location, mode: "insensitive" };
    if (filters.type) where.type = filters.type;
    if (filters.maxPrice) where.pricePerNight = { lte: filters.maxPrice };
    if (filters.guests) where.guests = { gte: filters.guests };

    const [data, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { host: { select: { name: true, email: true } } },
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      filters,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: "AI search failed" });
  }
}

/* =========================
   PART 2 — DESCRIPTION
========================= */
export async function generateDescription(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string;
    const { tone = "professional" } = req.body;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    if (listing.hostId !== req.userId)
      return res.status(403).json({ error: "Forbidden" });

    const description = await AIService.generateDescription(listing, tone);

    const updated = await prisma.listing.update({
      where: { id },
      data: { description },
    });

    res.json({ description, listing: updated });
  } catch {
    res.status(500).json({ error: "AI generation failed" });
  }
}

/* =========================
   PART 3 — CHAT
========================= */
const chatSessions = new Map<string, any[]>();

export async function chat(req: Request, res: Response) {
  try {
    const { sessionId, message, listingId } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message required" });
    }

    let systemPrompt =
      "You are a helpful Airbnb guest support assistant.";

    if (listingId) {
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
      });

      if (listing) {
        systemPrompt = `
You are a helpful Airbnb assistant.

Listing:
Title: ${listing.title}
Location: ${listing.location}
Price: ${listing.pricePerNight}
Guests: ${listing.guests}
Type: ${listing.type}
Amenities: ${listing.amenities}
Description: ${listing.description}
        `;
      }
    }

    const history = chatSessions.get(sessionId) || [];
    const trimmed = history.slice(-20);

    const messages = trimmed.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    messages.push({ role: "user", content: message });

    const reply = await AIService.chat(systemPrompt, messages);

    trimmed.push({ role: "user", content: message });
    trimmed.push({ role: "assistant", content: reply });

    chatSessions.set(sessionId, trimmed);

    res.json({
      response: reply,
      sessionId,
      messageCount: trimmed.length,
    });
  } catch {
    res.status(500).json({ error: "Chat failed" });
  }
}

/* =========================
   PART 4 — RECOMMENDATION
========================= */
export async function recommend(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const bookings = await prisma.booking.findMany({
      where: { guestId: userId },
      take: 5,
      include: { listing: true },
      orderBy: { createdAt: "desc" },
    });

    if (bookings.length === 0) {
      return res.status(400).json({
        error: "No booking history found",
      });
    }

    const history = bookings
      .map(
        (b) =>
          `${b.listing.type} in ${b.listing.location} $${b.listing.pricePerNight}`
      )
      .join("\n");

    const result = await AIService.recommendFromHistory(history);

    const bookedIds = bookings.map((b) => b.listingId);

    const recommendations = await prisma.listing.findMany({
      where: {
        id: { notIn: bookedIds },
      },
      take: 5,
    });

    res.json({ ...result, recommendations });
  } catch {
    res.status(500).json({ error: "Recommendation failed" });
  }
}

/* =========================
   PART 5 — REVIEW SUMMARY
========================= */
export async function reviewSummary(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const cacheKey = `review-summary-${id}`;

    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const reviews = await prisma.review.findMany({
      where: { listingId: id },
      include: { user: { select: { name: true } } },
    });

    if (reviews.length < 3) {
      return res.status(400).json({
        error: "Minimum 3 reviews required",
      });
    }

    const text = reviews
      .map((r) => `${r.user.name}: ${r.rating}/5 - ${r.comment}`)
      .join("\n");

    const result = await AIService.summarizeReviews(text);

    const average =
      reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

    const final = {
      ...result,
      averageRating: Number(average.toFixed(1)),
      totalReviews: reviews.length,
    };

    setCache(cacheKey, final, 600);

    res.json(final);
  } catch {
    res.status(500).json({ error: "Review summary failed" });
  }
}