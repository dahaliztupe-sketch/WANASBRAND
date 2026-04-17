import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)! });

export const enhancedConciergeChat = async (userId: string, messages: { text: string; role: string }[], userProfile: Record<string, unknown>) => {
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: `You are WANAS Concierge. Context: ${JSON.stringify(userProfile)}`
  });
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));
  const chat = model.startChat({ history });
  return await chat.sendMessage(messages[messages.length - 1].text);
};
