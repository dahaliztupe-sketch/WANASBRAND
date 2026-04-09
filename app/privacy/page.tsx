import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Our commitment to your privacy and data protection.',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-foreground">Privacy Policy</h1>
      <div className="space-y-12 text-lg font-light leading-loose text-foreground/80">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">I. Our Commitment</h2>
          <p>
            At WANAS, we hold the privacy of our clients in the highest regard. This policy outlines our 
            unwavering commitment to protecting the personal data you entrust to us during your journey 
            through our digital atelier.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">II. Data Collection</h2>
          <p>
            We collect only the essential information required to provide you with a bespoke experience. 
            This includes identity data, contact details for reservation fulfillment, and technical 
            insights to refine our digital presence.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">III. Security</h2>
          <p>
            Your data is protected by industry-leading encryption and security protocols. We treat your 
            information with the same care and precision we apply to our handcrafted garments.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">IV. Contact</h2>
          <p>
            For any inquiries regarding your data or to exercise your privacy rights, please contact 
            our dedicated Client Services team.
          </p>
        </section>
      </div>
    </main>
  );
}
