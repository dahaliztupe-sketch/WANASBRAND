import { GoogleGenAI } from '@google/genai';

/**
 * Base Agent for WANAS Atelier.
 * All agents use gemini-2.0-flash-lite (free tier) for cost efficiency.
 * Upgrade to gemini-1.5-pro for premium reasoning tasks.
 */

export type AgentModel =
  | 'gemini-2.0-flash-lite'   // Free tier — fast, efficient
  | 'gemini-1.5-flash'         // Low-cost — balanced
  | 'gemini-1.5-pro'           // Premium — complex reasoning
  | 'gemini-2.5-flash-preview-04-17'; // Latest preview

export interface AgentMessage {
  role: 'user' | 'agent';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentResponse<T = string> {
  success: boolean;
  data?: T;
  raw?: string;
  error?: string;
  model: AgentModel;
  tokensUsed?: number;
}

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error('[BaseAgent] GEMINI_API_KEY not set');
  return new GoogleGenAI({ apiKey });
}

export async function runAgent<T = string>({
  systemPrompt,
  userPrompt,
  model = 'gemini-2.0-flash-lite',
  temperature = 0.7,
  maxOutputTokens = 2048,
  parseJSON = false,
}: {
  systemPrompt: string;
  userPrompt: string;
  model?: AgentModel;
  temperature?: number;
  maxOutputTokens?: number;
  parseJSON?: boolean;
}): Promise<AgentResponse<T>> {
  try {
    const ai = getAI();

    const response = await ai.models.generateContent({
      model,
      contents: [
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      config: {
        systemInstruction: systemPrompt,
        temperature,
        maxOutputTokens,
      },
    });

    const raw = response.text ?? '';

    if (parseJSON) {
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      const jsonStr = jsonMatch?.[1] ?? raw;
      try {
        const data = JSON.parse(jsonStr) as T;
        return { success: true, data, raw, model };
      } catch {
        return { success: false, raw, error: 'Failed to parse JSON response', model };
      }
    }

    return { success: true, data: raw as T, raw, model };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[BaseAgent] Error (${model}):`, message);
    return { success: false, error: message, model };
  }
}
