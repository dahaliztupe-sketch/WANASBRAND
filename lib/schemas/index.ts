import { z } from 'zod';

export const ReservationSchema = z.object({
  customerData: z.object({
    fullName: z.string().min(2),
    phone: z.string().min(10),
    city: z.string().min(2),
    address: z.string().min(5),
    email: z.string().email().optional(),
    giftingDetails: z.object({
      isGift: z.boolean(),
      recipientName: z.string().optional(),
      handwrittenNote: z.string().optional(),
    }).optional(),
  }),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    variant: z.object({
      sku: z.string(),
      size: z.string(),
      color: z.string(),
    }),
    quantity: z.number().min(1),
    priceAtPurchase: z.number(),
    coverImageURL: z.string().optional(),
  })),
  subtotal: z.number().min(0),
  shippingFee: z.number().min(0),
  totalAmount: z.number().min(0),
  userId: z.string().optional(),
});

export const ProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  price: z.number().min(0),
  category: z.string(),
  images: z.array(z.string()),
  blurDataURL: z.string().optional(),
  variants: z.array(z.object({
    sku: z.string(),
    size: z.string(),
    color: z.string(),
    stock: z.number().min(0),
  })),
  status: z.enum(['Draft', 'Published', 'Archived']),
  isArchived: z.boolean().optional(),
});
