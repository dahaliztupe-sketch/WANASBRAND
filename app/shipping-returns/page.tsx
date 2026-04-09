export default function ShippingReturnsPage() {
  return (
    <div className="min-h-screen bg-primary py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-5xl text-primary mb-12">Shipping & Returns</h1>
        
        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">Reservation & Deposit Process</h2>
          <p className="text-primary/70 leading-relaxed">
            Once your reservation is confirmed, our concierge will contact you to finalize your order. A deposit is required to secure your selection.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">Shipping</h2>
          <p className="text-primary/70 leading-relaxed">
            We offer white-glove delivery services for all our delicate fabric selections.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="font-serif text-2xl text-primary mb-4">Returns & Exchanges</h2>
          <p className="text-primary/70 leading-relaxed">
            Due to the delicate nature of our fabrics, returns are accepted within 14 days of receipt, provided items are in their original condition.
          </p>
        </section>
      </div>
    </div>
  );
}
