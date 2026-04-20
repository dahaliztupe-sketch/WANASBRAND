import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

interface StylePreferences {
  category?: string;
  priceRange?: { min: number; max: number };
  preferredColors?: string[];
  preferredSilhouettes?: string[];
  occasion?: string;
  recentlyViewed?: string[];
}

interface StyleRecommendation {
  productSlug: string;
  reasoning: string;
  confidence: number;
}

export const generateStyleRecommendations = async (
  userPreferences: StylePreferences
): Promise<StyleRecommendation[]> => {
  try {
    const prompt = `You are the WANAS Atelier style concierge — a luxury Egyptian fashion house specializing in handcrafted, timeless pieces.

Based on these customer preferences:
${JSON.stringify(userPreferences, null, 2)}

Return a JSON array of up to 3 product recommendation objects. Each object must have exactly these keys:
- "productSlug": a URL-safe slug string (e.g. "classic-linen-abaya")
- "reasoning": a 1-sentence luxury-tone explanation in the same language the customer uses
- "confidence": a number between 0 and 1

Return ONLY the JSON array, no markdown, no commentary.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    const text = response.text ?? "";
    const cleanText = text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "");
    return JSON.parse(cleanText) as StyleRecommendation[];
  } catch (error) {
    console.error("[AI Recommendations] Error:", error);
    return [];
  }
};

export const generateProductDescription = async (
  productName: string,
  materials: string,
  language: "en" | "ar" = "en"
): Promise<string> => {
  try {
    const langInstruction =
      language === "ar"
        ? "Write the description in Arabic (Egyptian). Use elegant, literary Arabic."
        : "Write the description in English. Use luxury, evocative language.";

    const prompt = `You are a luxury fashion copywriter for WANAS Atelier, an Egyptian handcrafted fashion house.

Write a single evocative paragraph (3–4 sentences) describing this garment:
- Name: ${productName}
- Materials: ${materials}

${langInstruction}
Return ONLY the paragraph, no labels or extra text.`;

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        temperature: 0.85,
        maxOutputTokens: 256,
      },
    });

    return response.text?.trim() ?? "";
  } catch (error) {
    console.error("[AI Description] Error:", error);
    return "";
  }
};
