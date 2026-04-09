import ShoppableLookbook from '@/components/ShoppableLookbook';

export default function LookbookPage() {
  return (
    <main className="min-h-screen bg-primary pt-24">
      <header className="px-6 max-w-7xl mx-auto mb-16">
        <h1 className="font-serif text-5xl text-primary mb-4 italic">The Curated Silhouette</h1>
        <p className="text-primary/60 text-sm uppercase tracking-widest">Explore our latest seasonal curation</p>
      </header>
      <ShoppableLookbook />
    </main>
  );
}
