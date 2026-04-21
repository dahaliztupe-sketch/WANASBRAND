/**
 * AI Size Recommendation for WANAS Atelier.
 * Uses Gemini Flash (free) to recommend sizes based on measurements.
 * Like Net-a-Porter's "Find My Size" or Farfetch's AI sizing.
 */

import { runAgent } from '@/lib/agents/base-agent';

export interface BodyMeasurements {
  bust?: number;      // cm
  waist?: number;     // cm
  hips?: number;      // cm
  height?: number;    // cm
  weight?: number;    // kg
  shoulderWidth?: number; // cm
  bodyType?: 'straight' | 'hourglass' | 'pear' | 'apple' | 'athletic';
  usualSize?: string; // 'S', 'M', 'L', 'XL', '38', '40', '42' etc
}

export interface SizeRecommendation {
  recommendedSize: string;
  confidence: 'high' | 'medium' | 'low';
  fitNote: string;
  fitNoteAr: string;
  alterationsNeeded?: string;
}

export type ProductCategory = 'abaya' | 'kaftan' | 'evening_gown' | 'wedding' | 'casual';

const WANAS_SIZE_CHART: Record<ProductCategory, Record<string, { bust: [number, number]; waist: [number, number]; hips: [number, number] }>> = {
  abaya: {
    'S':   { bust: [80, 88],   waist: [64, 72],   hips: [88, 96]  },
    'M':   { bust: [88, 96],   waist: [72, 80],   hips: [96, 104] },
    'L':   { bust: [96, 104],  waist: [80, 88],   hips: [104, 112]},
    'XL':  { bust: [104, 112], waist: [88, 96],   hips: [112, 120]},
    'XXL': { bust: [112, 120], waist: [96, 104],  hips: [120, 128]},
  },
  kaftan: {
    'S':   { bust: [82, 90],   waist: [66, 74],   hips: [90, 98]  },
    'M':   { bust: [90, 98],   waist: [74, 82],   hips: [98, 106] },
    'L':   { bust: [98, 106],  waist: [82, 90],   hips: [106, 114]},
    'XL':  { bust: [106, 114], waist: [90, 98],   hips: [114, 122]},
    'XXL': { bust: [114, 122], waist: [98, 106],  hips: [122, 130]},
  },
  evening_gown: {
    '36':  { bust: [80, 84],   waist: [62, 66],   hips: [88, 92]  },
    '38':  { bust: [84, 88],   waist: [66, 70],   hips: [92, 96]  },
    '40':  { bust: [88, 92],   waist: [70, 74],   hips: [96, 100] },
    '42':  { bust: [92, 96],   waist: [74, 78],   hips: [100, 104]},
    '44':  { bust: [96, 100],  waist: [78, 82],   hips: [104, 108]},
    '46':  { bust: [100, 106], waist: [82, 88],   hips: [108, 114]},
  },
  wedding: {
    '36':  { bust: [80, 84],   waist: [62, 66],   hips: [88, 92]  },
    '38':  { bust: [84, 88],   waist: [66, 70],   hips: [92, 96]  },
    '40':  { bust: [88, 92],   waist: [70, 74],   hips: [96, 100] },
    '42':  { bust: [92, 96],   waist: [74, 78],   hips: [100, 104]},
    '44':  { bust: [96, 100],  waist: [78, 82],   hips: [104, 108]},
    '46':  { bust: [100, 106], waist: [82, 88],   hips: [108, 114]},
  },
  casual: {
    'XS':  { bust: [76, 82],   waist: [60, 66],   hips: [84, 90]  },
    'S':   { bust: [82, 88],   waist: [66, 72],   hips: [90, 96]  },
    'M':   { bust: [88, 94],   waist: [72, 78],   hips: [96, 102] },
    'L':   { bust: [94, 100],  waist: [78, 84],   hips: [102, 108]},
    'XL':  { bust: [100, 108], waist: [84, 92],   hips: [108, 116]},
  },
};

function algorithmicRecommend(measurements: BodyMeasurements, category: ProductCategory): SizeRecommendation | null {
  const chart = WANAS_SIZE_CHART[category];
  if (!chart || (!measurements.bust && !measurements.waist && !measurements.hips)) return null;

  let bestSize: string | null = null;
  let bestScore = Infinity;

  for (const [size, ranges] of Object.entries(chart)) {
    let score = 0;
    let count = 0;

    if (measurements.bust) {
      const mid = (ranges.bust[0] + ranges.bust[1]) / 2;
      score += Math.abs(measurements.bust - mid);
      count++;
    }
    if (measurements.waist) {
      const mid = (ranges.waist[0] + ranges.waist[1]) / 2;
      score += Math.abs(measurements.waist - mid);
      count++;
    }
    if (measurements.hips) {
      const mid = (ranges.hips[0] + ranges.hips[1]) / 2;
      score += Math.abs(measurements.hips - mid);
      count++;
    }

    if (count > 0 && score / count < bestScore) {
      bestScore = score / count;
      bestSize = size;
    }
  }

  if (!bestSize) return null;

  const confidence: SizeRecommendation['confidence'] = bestScore < 3 ? 'high' : bestScore < 6 ? 'medium' : 'low';

  return {
    recommendedSize: bestSize,
    confidence,
    fitNote: 'Based on your measurements',
    fitNoteAr: 'بناءً على مقاساتكِ',
  };
}

export const getAISizeRecommendation = async (
  measurements: BodyMeasurements,
  category: ProductCategory,
  productName: string,
  language: 'ar' | 'en' = 'ar'
): Promise<SizeRecommendation> => {
  const algorithmic = algorithmicRecommend(measurements, category);
  const chart = WANAS_SIZE_CHART[category];

  const prompt = language === 'ar'
    ? `أنتِ خبيرة مقاسات في أتيليه وناس الفاخر.

المنتج: ${productName} (${category})
مقاسات العميلة: ${JSON.stringify(measurements)}
جدول مقاسات المنتج: ${JSON.stringify(chart)}
${algorithmic ? `التوصية الأولية بالخوارزمية: ${algorithmic.recommendedSize}` : ''}

قدّمي توصية المقاس مع ملاحظة التفصيل (هل يحتاج تعديلاً؟ أي الجزء؟). رديّ بـ JSON فقط:
{"recommendedSize":"M","confidence":"high","fitNoteAr":"يناسبكِ تماماً مع القصة المفصّلة","fitNote":"Perfect fit for your measurements","alterationsNeeded":"تضييق الخصر 2 سم"}`
    : `You are a size expert at WANAS luxury atelier.

Product: ${productName} (${category})
Client measurements: ${JSON.stringify(measurements)}
Size chart: ${JSON.stringify(chart)}
${algorithmic ? `Algorithmic recommendation: ${algorithmic.recommendedSize}` : ''}

Recommend a size with a fit note. Reply with JSON only:
{"recommendedSize":"M","confidence":"high","fitNote":"Perfect fit","fitNoteAr":"يناسبكِ تماماً","alterationsNeeded":null}`;

  const result = await runAgent<SizeRecommendation>({
    systemPrompt: 'You are a luxury fashion sizing expert. Reply ONLY with valid JSON.',
    userPrompt: prompt,
    model: 'gemini-2.0-flash-lite',
    temperature: 0.2,
    maxOutputTokens: 200,
    parseJSON: true,
  });

  return result.data ?? (algorithmic ?? {
    recommendedSize: 'M',
    confidence: 'low',
    fitNote: 'Please visit our atelier for a fitting',
    fitNoteAr: 'نرجو زيارة الأتيليه للقياس',
  });
};

export const getSizeChartForProduct = (category: ProductCategory) => {
  return WANAS_SIZE_CHART[category] ?? WANAS_SIZE_CHART.casual;
};
