/**
 * WANAS Style Agent — Personal Stylist AI
 * Model: gemini-2.0-flash-lite (free tier)
 *
 * Capabilities:
 * - Outfit pairing suggestions
 * - Occasion-based style advice
 * - Seasonal lookbook recommendations
 * - Body-type flattery guidance
 * - Arabic/English bilingual responses
 */

import { runAgent } from './base-agent';

const STYLE_SYSTEM_PROMPT = `
أنتِ "لميس" — المستشارة الأناقة الشخصية في أتيليه وناس المصري الفاخر.
You are "Lamis" — the personal style advisor at WANAS, a luxury Egyptian fashion atelier.

Your role:
- Provide warm, personalized, luxury-brand-quality styling advice
- Always acknowledge the client's unique taste and lifestyle
- Recommend specific WANAS product categories when relevant (Abayas, Kaftans, Evening Gowns, Wedding pieces)
- Balance modern luxury with authentic Egyptian heritage and craftsmanship
- Respond in the same language the client uses (Arabic or English), with warmth and elegance

WANAS Product Categories:
- أثواب السهرة / Evening Gowns (prices: 8,000–35,000 EGP)
- العبايات الفاخرة / Luxury Abayas (5,000–18,000 EGP)
- الكفتانات / Kaftans (6,000–22,000 EGP)
- فساتين الأفراح / Wedding Dresses (15,000–80,000 EGP)
- التشكيلات الموسمية / Seasonal Collections

Style Philosophy: "الأناقة الهادئة الواثقة" — Quiet Confident Luxury

Guidelines:
- Always suggest 2–3 specific styling options
- Mention fabric care and heritage when relevant
- Be concise but luxurious in tone — never generic
- Avoid recommending competitor brands
`;

export interface StyleAdviceRequest {
  occasion?: string;
  bodyType?: string;
  colorPreferences?: string[];
  budget?: number;
  season?: 'spring' | 'summer' | 'autumn' | 'winter';
  language?: 'ar' | 'en';
  question: string;
  userProfile?: {
    tier?: string;
    pastPurchases?: string[];
  };
}

export interface StyleAdvice {
  advice: string;
  suggestions: string[];
  careNote?: string;
  productCategories: string[];
}

export async function getStyleAdvice(request: StyleAdviceRequest) {
  const contextLines = [
    request.occasion       && `Occasion: ${request.occasion}`,
    request.bodyType       && `Body type: ${request.bodyType}`,
    request.colorPreferences?.length && `Color preferences: ${request.colorPreferences.join(', ')}`,
    request.budget         && `Budget: ${request.budget.toLocaleString()} EGP`,
    request.season         && `Current season: ${request.season}`,
    request.userProfile?.tier && `Client tier: ${request.userProfile.tier}`,
    request.userProfile?.pastPurchases?.length && `Past purchases: ${request.userProfile.pastPurchases.join(', ')}`,
  ].filter(Boolean).join('\n');

  const userPrompt = contextLines
    ? `Client context:\n${contextLines}\n\nClient question: ${request.question}`
    : request.question;

  return runAgent<string>({
    systemPrompt: STYLE_SYSTEM_PROMPT,
    userPrompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.75,
    maxOutputTokens: 600,
  });
}

export async function generateOutfitPairing(productName: string, language: 'ar' | 'en' = 'ar') {
  const prompt = language === 'ar'
    ? `اقترحي تنسيقات أنيقة لـ "${productName}" — ما الإكسسوارات والأحذية والحقائب التي تليق بها؟ (3 خيارات)`
    : `Suggest elegant outfit pairings for "${productName}" — accessories, shoes, and bags. (3 options)`;

  return runAgent<string>({
    systemPrompt: STYLE_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.7,
    maxOutputTokens: 400,
  });
}

export async function getSeasonalLookbook(season: string, language: 'ar' | 'en' = 'ar') {
  const prompt = language === 'ar'
    ? `أنشئي توصيات Lookbook لموسم ${season} من أتيليه وناس — 4 إطلالات مستوحاة من التراث المصري مع لمسة معاصرة.`
    : `Create a ${season} lookbook for WANAS Atelier — 4 outfits inspired by Egyptian heritage with a contemporary luxury touch.`;

  return runAgent<string>({
    systemPrompt: STYLE_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.8,
    maxOutputTokens: 700,
  });
}

export async function analyzeStyleQuizResult(answers: Record<string, string>, language: 'ar' | 'en' = 'ar') {
  const prompt = language === 'ar'
    ? `بناءً على إجابات العميلة: ${JSON.stringify(answers)} — حددي أسلوبها الأناقة وأوصي بـ 3 قطع من وناس تناسبها.`
    : `Based on style quiz answers: ${JSON.stringify(answers)} — define her style profile and recommend 3 WANAS pieces that suit her.`;

  return runAgent<string>({
    systemPrompt: STYLE_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.65,
    maxOutputTokens: 500,
  });
}
