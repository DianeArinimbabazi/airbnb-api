 import type { Request, Response } from "express";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model, filterModel } from "../config/ai.js";
import prisma from "../config/prisma.js";
import type { AuthRequest } from "../middlewares/auth.middleware.js";
import { getCache, setCache } from "../config/cache.js";

const chatSessions = new Map<string, { role: string; content: string }[]>();

// Part 1 — Smart Listing Search
export async function aiSearch(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const page = parseInt(req.query["page"] as string) || 1;
    const limit = parseInt(req.query["limit"] as string) || 10;

    if (!query) return res.status(400).json({ error: "Query is required" });

    const prompt = `Extract search filters from this query: "${query}"
Return ONLY a JSON object with these fields (use null if not mentioned):
{
  "location": string or null,
  "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
  "maxPrice": number or null,
  "guests": number or null
}
Return only the JSON, no explanation.`;

    const response = await filterModel.invoke([new HumanMessage(prompt)]);
    const text = response.content as string;

    let filters: any;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      filters = JSON.parse(clean);
    } catch {
      return res.status(400).json({ error: "Could not parse filters from query" });
    }

    const allNull = Object.values(filters).every((v) => v === null);
    if (allNull) {
      return res.status(400).json({
        error: "Could not extract any filters from your query, please be more specific",
      });
    }

    const where: any = {};
    if (filters.location) where.location = { contains: filters.location, mode: "insensitive" };
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
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Part 2 — Description Generator
export async function generateDescription(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { tone = "professional" } = req.body;

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    if (listing.hostId !== req.userId) return res.status(403).json({ error: "Forbidden" });

    const toneInstructions: Record<string, string> = {
      professional: "Write in a formal, clear, business-like tone.",
      casual: "Write in a friendly, relaxed, conversational tone.",
      luxury: "Write in an elegant, premium, aspirational tone.",
    };

    const prompt = `Generate a compelling listing description for this property:
Title: ${listing.title}
Location: ${listing.location}
Type: ${listing.type}
Price per night: $${listing.pricePerNight}
Max guests: ${listing.guests}
Amenities: ${listing.amenities}

${toneInstructions[tone] || toneInstructions["professional"]}
Write 2-3 sentences only.`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const description = response.content as string;

    const updated = await prisma.listing.update({
      where: { id },
      data: { description },
    });

    res.json({ description, listing: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Part 3 — Guest Support Chatbot
export async function chat(req: Request, res: Response) {
  try {
    const { sessionId, message, listingId } = req.body;
    if (!sessionId || !message) {
      return res.status(400).json({ error: "sessionId and message are required" });
    }

    let systemPrompt = "You are a helpful guest support assistant for an Airbnb-like platform.";

    if (listingId) {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      if (listing) {
        systemPrompt = `You are a helpful guest support assistant for an Airbnb-like platform.
You are currently helping a guest with questions about this specific listing:
Title: ${listing.title}
Location: ${listing.location}
Price per night: $${listing.pricePerNight}
Max guests: ${listing.guests}
Type: ${listing.type}
Amenities: ${listing.amenities}
Description: ${listing.description}
Answer questions about this listing accurately. If asked something not covered, say you don't have that information.`;
      }
    }

    const history = chatSessions.get(sessionId) || [];
    history.push({ role: "user", content: message });

    const trimmed = history.slice(-20);

    const messages = [
      new SystemMessage(systemPrompt),
      ...trimmed.map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new SystemMessage(m.content)
      ),
    ];

    const response = await model.invoke(messages);
    const reply = response.content as string;

    trimmed.push({ role: "assistant", content: reply });
    chatSessions.set(sessionId, trimmed);

    res.json({ response: reply, sessionId, messageCount: trimmed.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Part 4 — Booking Recommendation
export async function recommend(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const bookings = await prisma.booking.findMany({
      where: { guestId: userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { listing: true },
    });
    if (bookings.length === 0) {
      return res.status(400).json({
        error: "No booking history found. Make some bookings first to get recommendations.",
      });
    }

    const summary = bookings
      .map((b) => `- ${b.listing.type} in ${b.listing.location} at $${b.listing.pricePerNight}/night for ${b.listing.guests} guests`)
      .join("\n");

    const prompt = `Based on this user's booking history:
${summary}

Return ONLY a JSON object:
{
  "preferences": "string describing what the user likes",
  "searchFilters": {
    "location": "string or null",
    "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
    "maxPrice": number or null,
    "guests": number or null
  },
  "reason": "string explaining the recommendation"
}`;

    const response = await filterModel.invoke([new HumanMessage(prompt)]);
    const text = response.content as string;

    let result: any;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned invalid response" });
    }

    const bookedIds = bookings.map((b) => b.listingId);
    const where: any = { id: { notIn: bookedIds } };
    if (result.searchFilters?.location) where.location = { contains: result.searchFilters.location, mode: "insensitive" };
    if (result.searchFilters?.type) where.type = result.searchFilters.type;
    if (result.searchFilters?.maxPrice) where.pricePerNight = { lte: result.searchFilters.maxPrice };
    if (result.searchFilters?.guests) where.guests = { gte: result.searchFilters.guests };

    const recommendations = await prisma.listing.findMany({ where, take: 5 });

    res.json({ ...result, recommendations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}

// Part 5 — Review Summarizer
export async function reviewSummary(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const cacheKey = `review-summary-${id}`;
    const cached = getCache(cacheKey);
    if (cached) return res.json(cached);

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const reviews = await prisma.review.findMany({
      where: { listingId: id },
      include: { user: { select: { name: true } } },
    });

    if (reviews.length < 3) {
      return res.status(400).json({
        error: "Not enough reviews to generate a summary (minimum 3 required)",
      });
    }

    const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const reviewText = reviews
      .map((r) => `${r.user.name} (${r.rating}/5): ${r.comment}`)
      .join("\n");

    const prompt = `Summarize these guest reviews:
${reviewText}

Return ONLY a JSON object:
{
  "summary": "2-3 sentence overall summary",
  "positives": ["thing1", "thing2", "thing3"],
  "negatives": ["thing1"] or []
}`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const text = response.content as string;

    let result: any;
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      result = JSON.parse(clean);
    } catch {
      return res.status(500).json({ error: "AI returned invalid response" });
    }

    const final = {
      ...result,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    };

    setCache(cacheKey, final, 600);
    res.json(final);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
