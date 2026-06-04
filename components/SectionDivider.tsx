'use client';

import { motion } from 'framer-motion';

type Variant = 'wave' | 'dots' | 'pulse' | 'splash';

interface SectionDividerProps {
  variant?: Variant;
  label?: string;
}

export default function SectionDivider({ variant = 'wave', label }: SectionDividerProps) {
  if (variant === 'wave') {
    return (
      <div aria-hidden="true" className="relative flex items-center justify-center py-4">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-[#326273]/15 to-transparent" />
        <svg
          width="120"
          height="20"
          viewBox="0 0 120 20"
          fill="none"
          className="relative bg-[var(--splash-page-bg)] px-4"
        >
          <motion.path
            d="M2 10 Q 15 2, 30 10 T 60 10 T 90 10 T 118 10"
            stroke="#5C9EAD"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        {label && (
          <span className="ml-3 rounded-full border border-[#326273]/15 bg-white/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6E8A95] backdrop-blur">
            {label}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'dots') {
    return (
      <div aria-hidden="true" className="relative flex items-center justify-center py-4">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-[#326273]/12 to-transparent" />
        <div className="relative flex items-center gap-2 bg-[var(--splash-page-bg)] px-5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[#E39774]"
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.8, delay: i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div aria-hidden="true" className="relative flex items-center justify-center py-5">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-[#326273]/15 to-transparent" />
        <div className="relative flex items-center gap-3 bg-[var(--splash-page-bg)] px-5">
          <span className="h-px w-8 bg-[#326273]/20" />
          <motion.span
            className="relative flex h-2.5 w-2.5"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5C9EAD] opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#5C9EAD]" />
          </motion.span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#6E8A95]">{label ?? 'next'}</span>
          <motion.span
            className="relative flex h-2.5 w-2.5"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E39774] opacity-50" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E39774]" />
          </motion.span>
          <span className="h-px w-8 bg-[#326273]/20" />
        </div>
      </div>
    );
  }

  // splash variant
  return (
    <div aria-hidden="true" className="relative flex items-center justify-center py-5">
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-linear-to-r from-transparent via-[#326273]/15 to-transparent" />
      <motion.div
        className="relative flex items-center gap-2 bg-[var(--splash-page-bg)] px-5"
        initial={{ opacity: 0, y: 6 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <motion.circle
            cx="14"
            cy="14"
            r="3"
            fill="#5C9EAD"
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.circle
            cx="14"
            cy="14"
            r="8"
            stroke="#5C9EAD"
            strokeWidth="0.8"
            fill="none"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.4], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx="14"
            cy="14"
            r="12"
            stroke="#E39774"
            strokeWidth="0.6"
            fill="none"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.4], opacity: [0.5, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
          />
        </svg>
      </motion.div>
    </div>
  );
}
