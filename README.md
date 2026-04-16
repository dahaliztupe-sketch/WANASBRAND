# WANAS Atelier

WANAS is a luxury fashion house dedicated to handcrafted excellence and timeless elegance. Based in Egypt, serving the world. This repository contains the source code for the WANAS e-commerce platform, built with a focus on performance, security, and a bespoke user experience.

## Features

*   **Luxury UI/UX:** A refined, minimalist design with subtle micro-interactions, custom cursors, and elegant page transitions.
*   **Arabic RTL Perfection:** Full support for Arabic right-to-left layouts, including optimized typography (Tajawal) and dynamic motion direction flipping.
*   **AI Concierge:** An integrated AI styling assistant powered by Gemini 2.0 Flash, capable of recommending products, checking inventory, and analyzing user-uploaded images for style matching.
*   **Digital Product Passport (DPP):** A unique digital certificate for each handcrafted piece, detailing its provenance, materials, and care instructions, accessible via QR code.
*   **Exclusive Checkout Flow:** A streamlined WhatsApp + Cash on Delivery (COD) reservation system, ensuring a personalized and secure purchasing experience.
*   **Performance & Scalability:** Built on Next.js 15.5 App Router, utilizing React 19 features, Upstash Redis for rate limiting, and optimized Firestore queries.
*   **Security & Stability:** Advanced security measures including IP-based rate limiting, comprehensive audit logging for administrative actions, and a "Safe Mode" architecture that ensures platform stability even when backend services are partially unavailable.
*   **Audio Branding:** A sophisticated, user-controlled audio experience that respects browser autoplay policies.

## Tech Stack

*   **Framework:** Next.js 15.5 (App Router, React 19)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4, Motion (Framer Motion)
*   **Backend/Database:** Firebase (Firestore, Authentication)
*   **AI:** Google Generative AI (Gemini 2.0 Flash)
*   **Rate Limiting:** Upstash Redis
*   **Email:** Resend / React Email
*   **State Management:** Zustand
*   **Icons:** Lucide React

## Getting Started

### Prerequisites

*   Node.js 20.x or later
*   npm or yarn
*   A Firebase project
*   An Upstash Redis database
*   A Resend account (for emails)
*   A Google Gemini API key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-org/wanas.git
    cd wanas
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Copy the `.env.example` file to `.env.local` and fill in the required values.
    ```bash
    cp .env.example .env.local
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

*   `app/`: Next.js App Router pages and API routes.
*   `components/`: Reusable React components (UI, layout, features).
*   `lib/`: Utility functions, Firebase configuration, hooks, and schemas.
*   `store/`: Zustand state management stores.
*   `types/`: TypeScript type definitions.
*   `emails/`: React Email templates.
*   `public/`: Static assets (fonts, images).

## License

This project is proprietary and confidential. All rights reserved by WANAS Atelier.
