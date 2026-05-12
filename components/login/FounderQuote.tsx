'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Quote } from 'lucide-react';

export default function FounderQuote() {
  const [imageOk, setImageOk] = useState(true);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/85 backdrop-blur">
      <div className="flex items-start gap-2.5">
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-[#E39774]/40 bg-[#1F4452]">
          {imageOk ? (
            <Image
              src="/sky-fh.png"
              alt="Sky FH"
              fill
              sizes="48px"
              className="object-cover"
              onError={() => setImageOk(false)}
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#5C9EAD] to-[#E39774] text-xs font-extrabold text-white">
              SF
            </div>
          )}
        </div>
        <div className="min-w-0">
          <Quote className="mb-0.5 h-3 w-3 text-[#E39774]" />
          <p className="text-xs font-semibold leading-snug text-white">
            “Make Money Move, Don&apos;t Let It Rust.”
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-white/55">
            <span className="font-bold text-[#E39774]">Sky FH</span>
            <span className="h-px w-2 bg-white/20" />
            <span>Founder, Splash</span>
          </div>
        </div>
      </div>
    </div>
  );
}
