import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY! });

export const enhancedConciergeChat = async (userId: string, messages: any[], userProfile: any) => {
  const model = ai.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: `You are WANAS Concierge. Context: ${JSON.stringify(userProfile)}`
  });
  const chat = model.startChat({ history: messages });
  return await chat.sendMessage(messages[messages.length - 1].text);
};
