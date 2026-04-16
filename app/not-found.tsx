import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <Image
          src="https://picsum.photos/seed/wanas-logo/200/200"
          alt="WANAS"
          width={120}
          height={120}
          className="opacity-80"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-serif text-[#2C2C2C] mb-4 tracking-tight">
        Page Not Found
      </h1>
      
      <p className="text-lg text-[#666666] max-w-md mb-10 font-light leading-relaxed">
        The sanctuary you are looking for does not exist or has been moved to a new location.
      </p>
      
      <Link 
        href="/"
        className="px-8 py-3 bg-[#2C2C2C] text-white text-sm tracking-[0.2em] uppercase hover:bg-black transition-colors duration-300"
      >
        Back to Home
      </Link>
      
      <div className="mt-20 text-[10px] tracking-[0.3em] uppercase text-[#999999] font-light">
        © WANAS PLATFORM
      </div>
    </div>
  );
}
