/**
 * WANAS Inventory Agent — Smart Stock Management AI
 * Model: gemini-2.0-flash-lite (free tier)
 *
 * Capabilities:
 * - Low-stock alerts with reorder recommendations
 * - Seasonal demand prediction
 * - Slow-moving inventory detection
 * - Collection release timing advice
 * - Pricing optimization suggestions
 */

import { runAgent } from './base-agent';

const INVENTORY_SYSTEM_PROMPT = `
You are the Inventory Intelligence AI for WANAS Atelier, a luxury Egyptian fashion brand.
Your role is to help the operations team manage inventory optimally for a luxury, limited-edition fashion brand.

Context:
- WANAS produces limited quantities (usually 3–15 pieces per style)
- Scarcity is a luxury signal — avoid over-ordering
- Key seasons: Ramadan/Eid (March-May), Wedding Season (Oct-Feb), Summer collection (June-Aug)
- VIP clients often pre-order before public release
- Lead time for new pieces: 4–12 weeks depending on embellishment complexity

Guidelines:
- Flag anything below 2 pieces as "Critical Low Stock"
- Flag anything unsold for 3+ months as "Slow Moving — Consider Promotion"
- Always suggest whether to reorder, promote, or retire a style
- Consider seasonal timing in all recommendations
`;

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  reserved: number;
  sold: number;
  daysInInventory: number;
  price: number;
  season?: string;
}

export async function analyzeInventoryHealth(
  items: InventoryItem[],
  language: 'ar' | 'en' = 'ar'
) {
  const available = items.map(i => ({
    ...i,
    available: Math.max(0, i.stock - i.reserved),
  }));

  const prompt = language === 'ar'
    ? `بيانات المخزون الحالي:\n${JSON.stringify(available, null, 2)}\n\nحلّل حالة المخزون وأعطِ تقريراً عن:\n1. القطع الأقل من الحد الأدنى\n2. القطع البطيئة البيع\n3. توصيات إعادة الطلب\n4. فرص الترويج`
    : `Current inventory data:\n${JSON.stringify(available, null, 2)}\n\nAnalyze inventory health and report on:\n1. Low-stock critical items\n2. Slow-moving pieces\n3. Reorder recommendations\n4. Promotion opportunities`;

  return runAgent<string>({
    systemPrompt: INVENTORY_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.3,
    maxOutputTokens: 600,
  });
}

export async function predictSeasonalDemand(
  category: string,
  upcomingOccasion: string,
  historicalSales: Array<{ month: string; units: number }>,
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `الفئة: ${category}\nالمناسبة القادمة: ${upcomingOccasion}\nالمبيعات التاريخية: ${JSON.stringify(historicalSales)}\n\nتوقّع الطلب للشهر القادم واقترح الكمية المثالية للإنتاج.`
    : `Category: ${category}\nUpcoming occasion: ${upcomingOccasion}\nHistorical sales: ${JSON.stringify(historicalSales)}\n\nForecast demand for the next month and suggest optimal production quantity.`;

  return runAgent<string>({
    systemPrompt: INVENTORY_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.4,
    maxOutputTokens: 400,
  });
}

export async function suggestPricingStrategy(
  product: { name: string; currentPrice: number; cost: number; stock: number; daysInInventory: number },
  marketData?: { competitorAvgPrice?: number; demandLevel?: 'high' | 'medium' | 'low' },
  language: 'ar' | 'en' = 'ar'
) {
  const prompt = language === 'ar'
    ? `المنتج: ${product.name}\nالسعر الحالي: ${product.currentPrice} جنيه\nتكلفة الإنتاج: ${product.cost} جنيه\nالمخزون: ${product.stock} قطعة\nأيام في المخزن: ${product.daysInInventory}\n${marketData ? `بيانات السوق: ${JSON.stringify(marketData)}` : ''}\n\nهل التسعير مثالي؟ ماذا توصين؟`
    : `Product: ${product.name}\nCurrent price: ${product.currentPrice} EGP\nProduction cost: ${product.cost} EGP\nStock: ${product.stock} units\nDays in inventory: ${product.daysInInventory}\n${marketData ? `Market data: ${JSON.stringify(marketData)}` : ''}\n\nIs the pricing optimal? What do you recommend?`;

  return runAgent<string>({
    systemPrompt: INVENTORY_SYSTEM_PROMPT,
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.4,
    maxOutputTokens: 350,
  });
}

export async function generateRestockAlert(
  criticalItems: InventoryItem[],
  language: 'ar' | 'en' = 'ar'
): Promise<string> {
  if (criticalItems.length === 0) {
    return language === 'ar' ? 'لا توجد قطع تحتاج إعادة طلب عاجل.' : 'No items require urgent restocking.';
  }

  const result = await runAgent<string>({
    systemPrompt: INVENTORY_SYSTEM_PROMPT,
    userPrompt: language === 'ar'
      ? `القطع التالية وصلت لمستوى حرج في المخزون:\n${JSON.stringify(criticalItems)}\n\nأنشئ تنبيه إعادة طلب واضح وموجز للإدارة.`
      : `The following items have reached critical stock levels:\n${JSON.stringify(criticalItems)}\n\nGenerate a clear, concise restock alert for management.`,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.3,
    maxOutputTokens: 300,
  });

  return result.data ?? (language === 'ar' ? 'يرجى مراجعة المخزون.' : 'Please review inventory.');
}
