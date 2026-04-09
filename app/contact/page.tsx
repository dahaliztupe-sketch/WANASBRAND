'use client';

import { RevealOnScroll } from '@/components/RevealOnScroll';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-primary text-primary pt-20 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        <RevealOnScroll>
          <h1 className="text-5xl font-serif mb-12 tracking-tight">Client Services</h1>
          <div className="space-y-8">
            <p className="text-lg leading-relaxed text-primary/80">
              For personalized styling advice, sizing inquiries, or any other assistance, our client services team is here to help.
            </p>
            <div className="bg-primary/5 p-8 space-y-4">
              <p className="text-sm uppercase tracking-[0.2em] font-medium">WhatsApp</p>
              <a href="https://wa.me/1234567890" className="text-xl hover:text-accent-primary transition-colors">+1 (234) 567-890</a>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <input type="text" placeholder="Name" className="w-full bg-primary border border-primary/10 px-4 py-3 outline-none focus:border-accent-primary" />
              <input type="email" placeholder="Email" className="w-full bg-primary border border-primary/10 px-4 py-3 outline-none focus:border-accent-primary" />
              <textarea placeholder="Message" className="w-full bg-primary border border-primary/10 px-4 py-3 h-32 outline-none focus:border-accent-primary"></textarea>
              <button type="submit" className="bg-inverted text-inverted px-8 py-3 uppercase tracking-[0.2em] text-[10px] hover:bg-accent-primary transition-colors">Send Message</button>
            </form>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
}
