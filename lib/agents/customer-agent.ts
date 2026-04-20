/**
 * WANAS Customer Service Agent — Intelligent Support AI
 * Model: gemini-2.0-flash-lite (free tier)
 *
 * Capabilities:
 * - Reservation status handling
 * - Returns & exchange guidance
 * - Sizing & fit questions
 * - Complaint resolution with empathy
 * - VIP escalation detection
 * - Bilingual Arabic/English support
 */

import { runAgent } from './base-agent';

const CUSTOMER_SYSTEM_PROMPT = `
أنتِ "رنا" — مساعدة خدمة العملاء في أتيليه وناس المصري الفاخر.
You are "Rana" — a warm, empathetic customer service specialist at WANAS Luxury Egyptian Fashion Atelier.

Your role:
- Handle inquiries with the warmth and care of a personal stylist, not a call-center agent
- Always acknowledge feelings before providing solutions
- Maintain the luxury brand voice — no rushed or robotic responses
- Escalate complex complaints or VIP clients to a human specialist

WANAS Policies:
- Reservations: Confirmed within 24 hours by phone call
- Try-on sessions: Available at the Atelier by appointment
- Payment: Full payment upon reservation confirmation
- Returns: Within 7 days of delivery if unworn and in original condition
- Exchange: Within 14 days with receipt
- Alterations: Free for 30 days post-purchase
- Shipping: 2–5 business days within Egypt; 7–14 days international
- Care: Dry-clean only for embellished pieces; hand-wash for simple fabrics

Contact Priority:
- VIP/Platinum/Diamond clients → Escalate immediately to human team
- Complaints about quality → Escalate with urgency
- General inquiries → Handle directly

Always end with an offer to help further or invite to visit the Atelier.
Respond in the same language as the customer.
`;

export interface CustomerInquiry {
  question: string;
  customerName?: string;
  loyaltyTier?: string;
  reservationId?: string;
  orderStatus?: string;
  previousMessages?: Array<{ role: string; content: string }>;
}

export interface CustomerResponse {
  reply: string;
  shouldEscalate: boolean;
  escalationReason?: string;
  suggestedActions?: string[];
  sentiment: 'positive' | 'neutral' | 'frustrated' | 'urgent';
}

export async function handleCustomerInquiry(inquiry: CustomerInquiry) {
  const context = [
    inquiry.customerName    && `Customer name: ${inquiry.customerName}`,
    inquiry.loyaltyTier     && `Loyalty tier: ${inquiry.loyaltyTier}`,
    inquiry.reservationId   && `Reservation ID: ${inquiry.reservationId}`,
    inquiry.orderStatus     && `Order status: ${inquiry.orderStatus}`,
    inquiry.previousMessages?.length && `Conversation history:\n${
      inquiry.previousMessages.map(m => `${m.role}: ${m.content}`).join('\n')
    }`,
  ].filter(Boolean).join('\n');

  const prompt = `${context ? `Context:\n${context}\n\n` : ''}Customer question: ${inquiry.question}

Respond naturally and warmly. After your response, on a new line, add a JSON block:
\`\`\`json
{
  "shouldEscalate": false,
  "escalationReason": null,
  "sentiment": "neutral",
  "suggestedActions": ["track order", "contact team"]
}
\`\`\``;

  const result = await runAgent<string>({
    systemPrompt: CUSTOMER_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.6,
    maxOutputTokens: 500,
  });

  if (!result.success || !result.data) {
    return {
      success: false,
      response: {
        reply: 'عذراً، حدث خطأ تقني. تواصلي معنا عبر واتساب وسنكون سعيدات بمساعدتك.',
        shouldEscalate: false,
        sentiment: 'neutral' as const,
        suggestedActions: ['Contact via WhatsApp'],
      },
    };
  }

  const jsonMatch = result.data.match(/```json\n?([\s\S]*?)\n?```/);
  let metadata: Partial<CustomerResponse> = { shouldEscalate: false, sentiment: 'neutral' };

  if (jsonMatch?.[1]) {
    try { metadata = JSON.parse(jsonMatch[1]); } catch { /* use defaults */ }
  }

  const reply = result.data.replace(/```json[\s\S]*?```/, '').trim();

  return {
    success: true,
    response: {
      reply,
      shouldEscalate: metadata.shouldEscalate ?? false,
      escalationReason: metadata.escalationReason,
      sentiment: metadata.sentiment ?? 'neutral',
      suggestedActions: metadata.suggestedActions ?? [],
    } as CustomerResponse,
  };
}

export async function generateAutoReply(
  eventType: 'reservation_received' | 'shipped' | 'delivered' | 'review_requested',
  data: { customerName: string; reservationId?: string; language?: 'ar' | 'en' }
) {
  const templates = {
    reservation_received: {
      ar: `وصل حجزكِ رقم #${data.reservationId} لأتيليه وناس 🌸 سيتواصل معكِ فريقنا خلال 24 ساعة لتأكيد موعد التجربة.`,
      en: `Your reservation #${data.reservationId} at WANAS Atelier has been received 🌸 Our team will contact you within 24 hours to confirm your fitting appointment.`,
    },
    shipped: {
      ar: `طلبكِ في الطريق إليكِ ✨ نأمل أن تحملي قطعتكِ بكل سعادة.`,
      en: `Your order is on its way ✨ We hope this piece brings you as much joy as it was crafted with.`,
    },
    delivered: {
      ar: `وصلت قطعتكِ بسلامة 🌸 يسعدنا سماع رأيكِ — تجربتكِ تهمنا.`,
      en: `Your piece has arrived safely 🌸 We'd love to hear your thoughts — your experience matters to us.`,
    },
    review_requested: {
      ar: `${data.customerName} العزيزة، كيف وجدتِ قطعتكِ من وناس؟ مشاركتكِ تساعدنا نقدم الأفضل دائماً.`,
      en: `Dear ${data.customerName}, how did you find your WANAS piece? Your feedback helps us deliver excellence.`,
    },
  };

  const lang = data.language ?? 'ar';
  return templates[eventType][lang];
}

export async function detectComplaintUrgency(message: string): Promise<{
  isComplaint: boolean;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}> {
  const result = await runAgent({
    systemPrompt: 'You classify customer messages for urgency. Respond ONLY with JSON.',
    userPrompt: `Classify this customer message:\n"${message}"\n\nRespond with JSON only:\n{"isComplaint": true, "urgency": "high", "category": "quality_issue"}`,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.1,
    maxOutputTokens: 100,
    parseJSON: true,
  });

  return (result.data as { isComplaint: boolean; urgency: 'low' | 'medium' | 'high' | 'critical'; category: string }) ?? {
    isComplaint: false,
    urgency: 'low',
    category: 'general',
  };
}
