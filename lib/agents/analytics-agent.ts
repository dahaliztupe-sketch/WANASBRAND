/**
 * WANAS Analytics Agent — Business Intelligence AI
 * Model: gemini-2.0-flash-lite (free tier)
 *
 * Capabilities:
 * - Revenue trend analysis
 * - Customer behavior insights
 * - Inventory optimization recommendations
 * - Seasonal demand forecasting
 * - Actionable business reports (Arabic/English)
 */

import { runAgent } from './base-agent';

const ANALYTICS_SYSTEM_PROMPT = `
You are the Business Intelligence AI for WANAS Atelier, a luxury Egyptian fashion brand.
Your role is to analyze business data and provide clear, actionable insights for the management team.

Guidelines:
- Be data-driven and specific — always reference the numbers provided
- Frame insights in the context of luxury fashion retail
- Prioritize revenue-impacting recommendations
- Use Arabic business terminology when responding in Arabic
- Structure your response clearly: Insight → Trend → Recommendation
- Consider the Egyptian luxury market context (pricing in EGP, cultural seasons: Ramadan, Eid, Wedding season)

Key Business Metrics to analyze:
- Revenue, AOV (Average Order Value), CLV (Customer Lifetime Value)
- Conversion rate, Churn rate
- Top-performing products and categories
- Customer tier distribution (Silver/Gold/Platinum/Diamond)
- Reservation completion rate
`;

export interface BusinessMetrics {
  revenue?: number;
  recentRevenue?: number;
  averageOrderValue?: number;
  totalReservations?: number;
  confirmedReservations?: number;
  totalCustomers?: number;
  conversionRate?: number;
  churnRate?: number;
  clv?: number;
  topProducts?: Array<{ name: string; revenue: number; count: number }>;
  period?: string;
}

export async function generateBusinessReport(metrics: BusinessMetrics, language: 'ar' | 'en' = 'ar') {
  const metricsText = JSON.stringify(metrics, null, 2);

  const prompt = language === 'ar'
    ? `بيانات الأعمال لأتيليه وناس:\n${metricsText}\n\nقدّم تقريراً تنفيذياً شاملاً: أبرز الإنجازات، التحديات، والتوصيات لزيادة الإيرادات.`
    : `WANAS Atelier Business Data:\n${metricsText}\n\nProvide a comprehensive executive report: highlights, challenges, and revenue-growth recommendations.`;

  return runAgent<string>({
    systemPrompt: ANALYTICS_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.3,
    maxOutputTokens: 800,
  });
}

export async function analyzeTrend(
  trendData: Array<{ date: string; revenue: number }>,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `بيانات الإيرادات اليومية: ${JSON.stringify(trendData)}\n\nحلّل الاتجاه، حدد أيام الذروة والركود، واقترح استراتيجية تسعير وتسويق.`
    : `Daily revenue data: ${JSON.stringify(trendData)}\n\nAnalyze the trend, identify peak/slow days, and suggest pricing and marketing strategies.`;

  return runAgent<string>({
    systemPrompt: ANALYTICS_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.4,
    maxOutputTokens: 500,
  });
}

export async function forecastDemand(
  historicalData: BusinessMetrics[],
  upcomingEvent: string,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `استناداً إلى بيانات الأداء التاريخية: ${JSON.stringify(historicalData)}\n\nالحدث القادم: ${upcomingEvent}\n\nتوقّع الطلب والإيرادات المحتملة وأعط توصيات للمخزون.`
    : `Based on historical data: ${JSON.stringify(historicalData)}\n\nUpcoming event: ${upcomingEvent}\n\nForecast demand, potential revenue, and provide inventory recommendations.`;

  return runAgent<string>({
    systemPrompt: ANALYTICS_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.5,
    maxOutputTokens: 600,
  });
}

export async function getInventoryRecommendations(
  products: Array<{ name: string; stock: number; sold: number; category: string }>,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `بيانات المخزون: ${JSON.stringify(products)}\n\nأي القطع في خطر نفاد؟ وأيها يحتاج ترويجاً؟ قدّم خطة مخزون للشهر القادم.`
    : `Inventory data: ${JSON.stringify(products)}\n\nWhich items are at risk of stockout? Which need promotions? Provide a monthly inventory plan.`;

  return runAgent<string>({
    systemPrompt: ANALYTICS_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.3,
    maxOutputTokens: 500,
  });
}
