'use client';

import { Facebook, Instagram, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title: _title }: ShareButtonsProps) {
  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const message = encodeURIComponent(`شاهدي هذا المنتج من WANAS: ${url}`);

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${message}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'instagram':
        // Instagram doesn't have a direct web share intent for links, so we copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
          toast.success('Link copied to clipboard! You can now paste it in Instagram.');
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-primary/10">
      <span className="text-xs uppercase tracking-widest text-primary/60">Share</span>
      <div className="flex gap-3">
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80 hover:text-primary"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare('instagram')}
          className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80 hover:text-primary"
          aria-label="Share on Instagram"
        >
          <Instagram className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-2 rounded-full hover:bg-primary/5 transition-colors text-primary/80 hover:text-primary"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
