import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.4em] text-accent-primary font-bold mb-8">
        404
      </p>

      <h1 className="text-5xl md:text-7xl font-serif text-primary mb-6 tracking-tight">
        Page Not Found
      </h1>

      <div className="w-16 h-px bg-accent-primary/40 mb-8" />

      <p className="text-base text-secondary max-w-sm mb-12 leading-relaxed font-light">
        The sanctuary you are looking for does not exist or has been moved. Allow us to guide you back.
      </p>

      <Link
        href="/"
        className="px-10 py-3.5 bg-primary text-inverted text-[10px] tracking-[0.3em] uppercase hover:bg-accent-primary transition-colors duration-300"
      >
        Return to Atelier
      </Link>

      <div className="mt-24 text-[9px] tracking-[0.4em] uppercase text-primary/30 font-light">
        © WANAS Atelier
      </div>
    </div>
  );
}
