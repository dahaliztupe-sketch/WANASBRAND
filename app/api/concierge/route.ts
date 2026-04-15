import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

import { db } from '@/lib/firebase/server';
import { checkInventoryServer, addToWaitlistServer } from '@/lib/services/product.server';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const ConciergeSchema = z.object({
  message: z.string().optional(),
  userId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  contactMethod: z.enum(['whatsapp', 'phone']).optional(),
  vibe: z.enum(['styling', 'sizing']).optional(),
  consent: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = ConciergeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    const { message, userId, fullName, phone, contactMethod, vibe, consent } = validation.data;

    // Handle traditional form submission if all fields are present
    if (fullName && phone && contactMethod && vibe && consent) {
      const conciergeRef = db.collection('concierge_requests').doc();
      await conciergeRef.set({
        fullName,
        phone,
        contactMethod,
        vibe,
        consent,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, id: conciergeRef.id });
    }

    // Handle AI Chat
    if (message) {
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are the WANAS AI Concierge, a luxury fashion expert. 
        Your goal is to assist customers with inventory inquiries and waitlist management.
        Be sophisticated, helpful, and professional.
        If a user asks about a product's availability, use 'checkInventory'.
        If a product is out of stock and the user wants to be notified, use 'addToWaitlist'.`,
        tools: [{
          functionDeclarations: [
            {
              name: 'checkInventory',
              description: 'Checks the stock level of a product by its SKU.',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  sku: { type: SchemaType.STRING, description: 'The SKU of the product variant.' }
                },
                required: ['sku']
              }
            },
            {
              name: 'addToWaitlist',
              description: 'Adds a user to the waitlist for a specific product SKU.',
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  sku: { type: SchemaType.STRING, description: 'The SKU of the product variant.' },
                  userId: { type: SchemaType.STRING, description: 'The ID of the user.' }
                },
                required: ['sku', 'userId']
              }
            }
          ]
        }]
      });

      const chat = model.startChat();
      const result = await chat.sendMessage(message);
      const response = await result.response;
      const functionCalls = response.functionCalls();

      if (functionCalls && functionCalls.length > 0) {
        const call = functionCalls[0];
        if (call.name === 'checkInventory') {
          const { sku } = call.args as { sku: string };
          const inventory = await checkInventoryServer(sku);
          
          const toolResponse = inventory 
            ? `The ${inventory.productName} (Size: ${inventory.size}) has ${inventory.stock} units in stock.`
            : `I couldn't find any stock for SKU ${sku}.`;
            
          const finalResult = await chat.sendMessage([{
            functionResponse: {
              name: 'checkInventory',
              response: { content: toolResponse }
            }
          }]);
          return NextResponse.json({ reply: finalResult.response.text() });
        }

        if (call.name === 'addToWaitlist') {
          const { sku, userId: callUserId } = call.args as { sku: string, userId: string };
          const success = await addToWaitlistServer(callUserId || userId || 'guest', sku);
          
          const toolResponse = success 
            ? `Successfully added to the waitlist for SKU ${sku}.`
            : `Failed to add to the waitlist. Please try again later.`;
            
          const finalResult = await chat.sendMessage([{
            functionResponse: {
              name: 'addToWaitlist',
              response: { content: toolResponse }
            }
          }]);
          return NextResponse.json({ reply: finalResult.response.text() });
        }
      }

      return NextResponse.json({ reply: response.text() });
    }

    return NextResponse.json({ error: 'No message or form data provided' }, { status: 400 });
  } catch (error) {
    console.error('Concierge API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
