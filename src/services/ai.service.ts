import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";
import { model, filterModel } from "../config/ai.js";

export const AIService = {
  async extractSearchFilters(query: string) {
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
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  },

  async generateDescription(listing: any, tone: string) {
    const toneMap: Record<string, string> = {
      professional: "Write in a formal, clear, business-like tone.",
      casual: "Write in a friendly, relaxed, conversational tone.",
      luxury: "Write in an elegant, premium, aspirational tone.",
    };

    const prompt = `Generate a compelling listing description:
Title: ${listing.title}
Location: ${listing.location}
Type: ${listing.type}
Price: $${listing.pricePerNight}/night
Guests: ${listing.guests}
Amenities: ${listing.amenities}

${toneMap[tone] || toneMap["professional"]}
Write 2-3 sentences only.`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    return response.content as string;
  },

  async chat(systemPrompt: string, messages: { role: string; content: string }[]) {
    const langchainMessages = [
      new SystemMessage(systemPrompt),
      ...messages.map((m) =>
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      ),
    ];

    const response = await model.invoke(langchainMessages);
    return response.content as string;
  },

  async recommendFromHistory(history: string) {
    const prompt = `Based on this booking history:
${history}

Return ONLY a JSON object:
{
  "preferences": "string describing what the user likes",
  "searchFilters": {
    "location": string or null,
    "type": "APARTMENT" | "HOUSE" | "VILLA" | "CABIN" | null,
    "maxPrice": number or null,
    "guests": number or null
  },
  "reason": "string explaining the recommendation"
}`;

    const response = await filterModel.invoke([new HumanMessage(prompt)]);
    const text = response.content as string;
    const clean = text.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  },

  async summarizeReviews(text: string) {
    const prompt = `Summarize these guest reviews:
${text}

Return ONLY a JSON object:
{
  "summary": "2-3 sentence overall summary",
  "positives": ["thing1", "thing2", "thing3"],
  "negatives": ["thing1"] or []
}`;

    const response = await model.invoke([new HumanMessage(prompt)]);
    const raw = response.content as string;
    const clean = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(clean);
  },
};