import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export const generateStyleRecommendations = async (userPreferences: any) => {
  const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Analyze these preferences: ${JSON.stringify(userPreferences)} and suggest WANAS products. Return JSON only.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
};
