import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { model, filterModel } from "../config/ai.js";

/**
 * AI Service Layer (clean architecture)
 * All AI logic centralized here instead of controllers
 */

export class AIService {
  // -----------------------------
  // PART 1: FILTER EXTRACTION
  // -----------------------------
  static async extractSearchFilters(query: string) {
    const prompt = `
Extract search filters from this query: "${query}"

Return ONLY valid JSON:
{
  "location": string | null,
  "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
  "maxPrice": number | null,
  "guests": number | null
}
`;

    const res = await filterModel.invoke([new HumanMessage(prompt)]);
    return this.safeJSON(res.content as string);
  }

  // -----------------------------
  // PART 2: DESCRIPTION GENERATION
  // -----------------------------
  static async generateDescription(listing: any, tone: string) {
    const tones: Record<string, string> = {
      professional: "formal and business-like",
      casual: "friendly and conversational",
      luxury: "elegant, premium and aspirational",
    };

    const prompt = `
Write a listing description in a ${tones[tone] || tones.professional} tone.

Title: ${listing.title}
Location: ${listing.location}
Type: ${listing.type}
Price: $${listing.pricePerNight}
Guests: ${listing.guests}
Amenities: ${listing.amenities}

Write 2–3 sentences only.
`;

    const res = await model.invoke([new HumanMessage(prompt)]);
    return res.content as string;
  }

  // -----------------------------
  // PART 3: CHATBOT
  // -----------------------------
  static async chat(systemPrompt: string, messages: any[]) {
    const res = await model.invoke([
      new SystemMessage(systemPrompt),
      ...messages,
    ]);

    return res.content as string;
  }

  // -----------------------------
  // PART 4: RECOMMENDATION ENGINE
  // -----------------------------
  static async recommendFromHistory(history: string) {
    const prompt = `
Analyze booking history and return ONLY JSON:

${history}

{
  "preferences": string,
  "searchFilters": {
    "location": string | null,
    "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
    "maxPrice": number | null,
    "guests": number | null
  },
  "reason": string
}
`;

    const res = await filterModel.invoke([new HumanMessage(prompt)]);
    return this.safeJSON(res.content as string);
  }

  // -----------------------------
  // PART 5: REVIEW SUMMARIZER
  // -----------------------------
  static async summarizeReviews(text: string) {
    const prompt = `
Summarize these reviews:

${text}

Return ONLY JSON:
{
  "summary": string,
  "positives": string[],
  "negatives": string[]
}
`;

    const res = await model.invoke([new HumanMessage(prompt)]);
    return this.safeJSON(res.content as string);
  }

  // -----------------------------
  // SAFE JSON PARSER (VERY IMPORTANT)
  // -----------------------------
  static safeJSON(text: string) {
    try {
      const clean = text.replace(/```json|```/g, "").trim();
      return JSON.parse(clean);
    } catch {
      throw new Error("Invalid AI JSON response");
    }
  }
}