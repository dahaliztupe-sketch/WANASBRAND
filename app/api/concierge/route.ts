import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';

import { db } from '@/lib/firebase/server';

const ai = new GoogleGenAI({ apiKey: (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)! });

const ConciergeSchema = z.object({
  message: z.string().optional(),
  userId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  contactMethod: z.enum(['whatsapp', 'phone']).optional(),
  vibe: z.enum(['styling', 'sizing']).optional(),
  consent: z.boolean().optional(),
});

const tools = [
  {
    functionDeclarations: [
      {
        name: "checkInventory",
        description: "Check available stock for a product variant",
        parameters: {
          type: "object",
          properties: {
            productId: { type: "string" },
            size: { type: "string" },
            color: { type: "string" }
          },
          required: ["productId"]
        }
      },
      {
        name: "addToWaitlist",
        description: "Add customer to waitlist for out-of-stock product",
        parameters: {
          type: "object",
          properties: {
            productId: { type: "string" },
            size: { type: "string" },
            color: { type: "string" },
            email: { type: "string" }
          },
          required: ["productId", "email"]
        }
      },
      {
        name: "getProductDetails",
        description: "Get detailed information about a product",
        parameters: {
          type: "object",
          properties: {
            productId: { type: "string" }
          },
          required: ["productId"]
        }
      }
    ]
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = ConciergeSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.errors }, { status: 400 });
    }

    const { message, fullName, phone, contactMethod, vibe, consent } = validation.data;

    // Handle traditional form submission if all fields are present
    if (fullName && phone && contactMethod && vibe && consent) {
      if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
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
      const model = ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: `You are the WANAS AI Concierge, a luxury fashion expert. 
        Your goal is to assist customers with inventory inquiries, product details, and waitlist management.
        Be sophisticated, helpful, and professional.
        Use tools when necessary to fetch real-time data.`,
        tools
      });

      const chat = model.startChat();
      let response = await chat.sendMessage(message);

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        let toolResponseContent = "";

        if (!db) {
          toolResponseContent = "Database is currently offline.";
        } else {
          if (call.name === 'checkInventory') {
            const { productId, size, color } = call.args as Record<string, string>;
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
              toolResponseContent = "Product not found.";
            } else {
              const product = doc.data();
              let variants = product?.variants || [];
              if (size) variants = variants.filter((v: Record<string, string>) => v.size === size);
              if (color) variants = variants.filter((v: Record<string, string>) => v.color === color);
              
              if (variants.length === 0) {
                toolResponseContent = "No matching variants found.";
              } else {
                toolResponseContent = variants.map((v: Record<string, string>) => `Size: ${v.size}, Color: ${v.color || 'N/A'}, Stock: ${v.stock}`).join('\n');
              }
            }
          } else if (call.name === 'addToWaitlist') {
            const { productId, email, size, color } = call.args as Record<string, string>;
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
              toolResponseContent = "Product not found.";
            } else {
              const product = doc.data();
              await db.collection('waitlist').add({
                productId,
                productName: product?.name || 'Unknown',
                variantId: `${size || 'any'}-${color || 'any'}`,
                variantName: `${size || 'any'} ${color || 'any'}`,
                contactInfo: email,
                status: 'pending',
                createdAt: new Date().toISOString(),
              });
              toolResponseContent = "Successfully added to waitlist.";
            }
          } else if (call.name === 'getProductDetails') {
            const { productId } = call.args as Record<string, string>;
            const doc = await db.collection('products').doc(productId).get();
            if (!doc.exists) {
              toolResponseContent = "Product not found.";
            } else {
              const product = doc.data();
              toolResponseContent = `Name: ${product?.name}\nDescription: ${product?.description}\nPrice: EGP ${product?.price}\nMaterials: ${product?.materials?.join(', ')}`;
            }
          }
        }

        response = await chat.sendMessage([{
          functionResponse: {
            name: call.name,
            response: { content: toolResponseContent }
          }
        }]);
      }

      return NextResponse.json({ reply: response.text });
    }

    return NextResponse.json({ error: 'No message or form data provided' }, { status: 400 });
  } catch (error) {
    console.error('Concierge API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
