import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions for using the WANAS platform.',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-5xl font-serif font-light mb-16 tracking-tight text-foreground">Terms of Service</h1>
      <div className="space-y-12 text-lg font-light leading-loose text-foreground/80">
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">I. The Agreement</h2>
          <p>
            By accessing the WANAS platform, you enter into an agreement of elegance and mutual respect. 
            These terms govern your use of our services and the reservation of our handcrafted pieces.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">II. Reservations</h2>
          <p>
            A reservation at WANAS is an invitation to own a piece of handcrafted history. While we 
            strive to fulfill every request, all reservations are subject to artisan availability 
            and final confirmation.
          </p>
        </section>
        <section>
          <h2 className="text-2xl font-serif text-foreground mb-6">III. Intellectual Property</h2>
          <p>
            The designs, imagery, and essence of WANAS are protected intellectual property. Any 
            unauthorized reproduction is a violation of the craft.
          </p>
        </section>
      </div>
    </main>
  );
}
