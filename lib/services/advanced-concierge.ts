import { GoogleGenAI } from '@google/genai';

const CONCIERGE_SYSTEM_INSTRUCTION = `
أنتِ "وناس كونسيرج" — مساعدة الأناقة الشخصية في أتيليه وناس المصري الفاخر.
You are "WANAS Concierge" — the personal luxury style assistant for WANAS Egyptian fashion atelier.

Identity:
- Warm, knowledgeable, never rushed — you have all the time in the world for this client
- You know every piece in the atelier, every fabric, every artisan's story
- You speak the language of quiet luxury — never hype, never generic superlatives
- Respond in the client's language (Arabic or English) with seamless elegance

Capabilities:
- Style and outfit advice tailored to the client's profile
- Product information and availability
- Reservation guidance and appointment scheduling
- Care and maintenance tips
- Heritage and craftsmanship stories
- VIP early-access collection previews

WANAS Brand Pillars:
1. Authentic Egyptian Craftsmanship — الحرفية المصرية الأصيلة  
2. Contemporary Heritage — التراث المعاصر
3. Quiet Luxury — الأناقة الهادئة
4. The Singular Piece — القطعة الوحيدة

Always invite the client to visit the Atelier for a private fitting experience.
`;

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY ?? '';
  return new GoogleGenAI({ apiKey });
}

export const enhancedConciergeChat = async (
  _userId: string,
  messages: { text: string; role: string }[],
  userProfile: Record<string, unknown>
) => {
  const ai = getAI();

  const profileContext = Object.keys(userProfile).length > 0
    ? `\n\nClient Profile: ${JSON.stringify(userProfile)}`
    : '';

  const history = messages.slice(0, -1).map(m => ({
    role: (m.role === 'user' ? 'user' : 'model') as 'user' | 'model',
    parts: [{ text: m.text }],
  }));

  const lastMessage = messages[messages.length - 1];
  if (!lastMessage) throw new Error('No messages provided');

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: lastMessage.text }] },
    ],
    config: {
      systemInstruction: CONCIERGE_SYSTEM_INSTRUCTION + profileContext,
      temperature: 0.75,
      maxOutputTokens: 500,
    },
  });

  return response.text ?? '';
};
