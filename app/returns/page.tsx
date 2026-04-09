import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns Policy',
  description: 'Our policy on returns and exchanges.',
};

export default function ReturnsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-foreground">Returns & Exchanges</h1>
      <div className="space-y-12 text-lg font-light leading-loose text-foreground/80">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">I. Our Philosophy</h2>
          <p>
            We believe in the longevity of our pieces. If a selection does not meet your expectations 
            of perfection, we offer a refined return and exchange process.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">II. Delicate Fabric Policy</h2>
          <p>
            Given the exquisite nature of our fabrics, we require that all returns be in their original, 
            unworn state, with original atelier tags securely attached. Items showing signs of wear or 
            handling that compromise the integrity of the fabric will not be accepted.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">III. Deposit & Refunds</h2>
          <p>
            For reservations requiring a deposit, refunds will be processed to the original payment 
            method upon successful inspection of the returned garment. Please allow 5-7 business days 
            for the transaction to reflect in your account.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">IV. Custom Orders</h2>
          <p>
            Please note that bespoke and custom-tailored pieces are created specifically for you 
            and are therefore not eligible for return.
          </p>
        </section>
      </div>
    </main>
  );
}
