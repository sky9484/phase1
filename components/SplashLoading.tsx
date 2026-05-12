'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function SplashLoading({ label = 'Loading your dashboard' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#F6F0ED]/95 backdrop-blur-sm">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(92,158,173,0.20),transparent_55%),radial-gradient(circle_at_50%_75%,rgba(227,151,116,0.14),transparent_50%)]" />

      <div className="relative flex flex-col items-center gap-7">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-[#5C9EAD]/40"
            animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border-2 border-[#E39774]/40"
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.45 }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-2 rounded-full bg-[radial-gradient(circle,rgba(92,158,173,0.18),transparent_70%)]"
            animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -4, 0, 4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-xl shadow-[#326273]/15"
          >
            <Image
              src="/splash-logo.png"
              alt="Splash"
              width={56}
              height={56}
              className="h-14 w-14 object-contain"
              priority
              unoptimized
            />
          </motion.div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <motion.span
            className="text-xs font-bold uppercase tracking-[0.32em] text-[#326273]/65"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            {label}
          </motion.span>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map((index) => (
              <motion.span
                key={index}
                className="h-1.5 w-1.5 rounded-full bg-[#5C9EAD]"
                animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: index * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
