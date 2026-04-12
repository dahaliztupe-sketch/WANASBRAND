import { Template } from "@pdfme/common";

export const passportPdfTemplate: Template = {
  basePdf: "BLANK_A5_PORTRAIT",
  schemas: [
    {
      customerName: { type: "text", position: { x: 20, y: 50 }, width: 100, height: 10, fontSize: 14, fontName: "Playfair" },
      productName: { type: "text", position: { x: 20, y: 65 }, width: 100, height: 15, fontSize: 20, fontName: "Playfair" },
      certificateNumber: { type: "text", position: { x: 20, y: 85 }, width: 100, height: 10, fontSize: 10, fontName: "Courier" },
      qrCode: { type: "image", position: { x: 100, y: 150 }, width: 30, height: 30 },
    }
  ]
};
