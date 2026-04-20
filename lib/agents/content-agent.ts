/**
 * WANAS Content Agent — Creative Copy & Product Description AI
 * Model: gemini-2.0-flash-lite (free tier)
 *
 * Capabilities:
 * - Luxury product descriptions (AR/EN)
 * - Social media captions (Instagram, TikTok)
 * - Email campaign copy
 * - DPP (Digital Product Passport) narratives
 * - Brand voice generation
 */

import { runAgent } from './base-agent';

const CONTENT_SYSTEM_PROMPT = `
أنتِ "نورا" — المديرة الإبداعية لأتيليه وناس، دار الأزياء الفاخرة المصرية.
You are "Nora" — Creative Director at WANAS, a luxury Egyptian fashion atelier.

Brand Voice:
- Arabic copy: دافئ، شعري، يحتفي بالتراث المصري، يخاطب المرأة العصرية الواثقة
- English copy: Evocative, editorial, unhurried luxury — think Vogue Arabia meets Egyptian heritage
- Never use clichés like "amazing", "stunning", "perfect"
- Use sensory language: textures, light, movement, craftsmanship stories
- Keep descriptions under 150 words per section unless asked for long-form

WANAS Brand Pillars:
1. الحرفية المصرية الأصيلة / Authentic Egyptian Craftsmanship
2. التراث المعاصر / Contemporary Heritage
3. الأناقة الهادئة / Quiet Luxury
4. القطعة الوحيدة / The Singular Piece (limited editions)

Pricing Context (don't mention prices unless asked):
- Abayas: 5,000–18,000 EGP
- Kaftans: 6,000–22,000 EGP
- Evening Gowns: 8,000–35,000 EGP
- Wedding: 15,000–80,000 EGP
`;

export interface ProductDescriptionRequest {
  name: string;
  nameAr?: string;
  category: string;
  fabric?: string;
  color?: string;
  embellishments?: string[];
  occasion?: string;
  craftDetails?: string;
  language: 'ar' | 'en' | 'both';
}

export async function generateProductDescription(request: ProductDescriptionRequest) {
  const details = [
    `Product: ${request.name}${request.nameAr ? ` / ${request.nameAr}` : ''}`,
    `Category: ${request.category}`,
    request.fabric          && `Fabric: ${request.fabric}`,
    request.color           && `Color: ${request.color}`,
    request.embellishments?.length && `Embellishments: ${request.embellishments.join(', ')}`,
    request.occasion        && `Occasion: ${request.occasion}`,
    request.craftDetails    && `Craft story: ${request.craftDetails}`,
  ].filter(Boolean).join('\n');

  const langInstruction = {
    ar:   'Write ONLY in Arabic. Evocative, poetic, luxurious.',
    en:   'Write ONLY in English. Editorial, sensory, aspirational.',
    both: 'Write in BOTH Arabic (first) and English (second), separated by "---".',
  }[request.language];

  return runAgent<string>({
    systemPrompt: CONTENT_SYSTEM_PROMPT,
    userPrompt: `${langInstruction}\n\nProduct details:\n${details}\n\nWrite a luxury product description for the website (max 120 words per language).`,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.8,
    maxOutputTokens: 400,
  });
}

export async function generateInstagramCaption(
  productName: string,
  mood: string,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `اكتبي كابشن إنستغرام لـ "${productName}" بروح "${mood}". أضيفي 5 هاشتاقات مناسبة. (باختصار وأناقة)`
    : `Write an Instagram caption for "${productName}" with a "${mood}" mood. Add 5 relevant hashtags. (Concise and elegant)`;

  return runAgent<string>({
    systemPrompt: CONTENT_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.85,
    maxOutputTokens: 200,
  });
}

export async function generateDPPNarrative(passportData: {
  productName: string;
  artisan?: string;
  region?: string;
  technique?: string;
  materials?: string[];
  craftingTime?: string;
}) {
  const prompt = `Write a beautiful, short narrative for the Digital Product Passport of "${passportData.productName}".
  
Product details:
${passportData.artisan        ? `- Master Artisan: ${passportData.artisan}` : ''}
${passportData.region         ? `- Origin Region: ${passportData.region}` : ''}
${passportData.technique      ? `- Crafting Technique: ${passportData.technique}` : ''}
${passportData.materials?.length ? `- Materials: ${passportData.materials.join(', ')}` : ''}
${passportData.craftingTime   ? `- Time to craft: ${passportData.craftingTime}` : ''}

Write in English AND Arabic (separated by ---). Max 80 words per language. 
Celebrate the human hands and heritage behind this piece.`;

  return runAgent<string>({
    systemPrompt: CONTENT_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.75,
    maxOutputTokens: 300,
  });
}

export async function generateEmailSubjectLines(
  campaignType: string,
  audienceSegment: string,
  language: 'ar' | 'en' = 'ar',
  count = 5
) {
  const prompt = language === 'ar'
    ? `اكتبي ${count} سطور موضوع بريد إلكتروني لحملة "${campaignType}" موجهة لـ "${audienceSegment}". أسلوب: فاخر، موجز، يثير الفضول.`
    : `Write ${count} email subject lines for a "${campaignType}" campaign targeting "${audienceSegment}". Style: luxury, concise, curiosity-inducing.`;

  return runAgent<string>({
    systemPrompt: CONTENT_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.9,
    maxOutputTokens: 200,
  });
}

export async function generateCollectionStory(
  collectionName: string,
  inspiration: string,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `اكتبي قصة تشكيلة "${collectionName}" المستوحاة من "${inspiration}". أسلوب: أدبي، يصوّر لحظة في تاريخ مصر أو جمالها. (150-200 كلمة)`
    : `Write a collection story for "${collectionName}" inspired by "${inspiration}". Style: literary, evoking a moment in Egypt's beauty or history. (150–200 words)`;

  return runAgent<string>({
    systemPrompt: CONTENT_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.85,
    maxOutputTokens: 500,
  });
}
