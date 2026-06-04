'use client';

/**
 * AmbientBackground — a living, bankex-style backdrop for landing sections.
 *
 * Renders large blurred orbs that slowly drift, an optional parallax dot grid,
 * and an optional scanning sheen. Everything animates via CSS transform/opacity
 * (see globals.css → "Ambient section motion") so it stays GPU-cheap and honors
 * prefers-reduced-motion.
 *
 * Sits at `-z-10` inside the host `relative` section, so it paints behind the
 * section's in-flow content without any wrapper changes.
 */

type Variant = 'teal' | 'gold' | 'mint' | 'indigo' | 'sunset';

interface AmbientBackgroundProps {
  variant?: Variant;
  /** Faint drifting dot grid. */
  grid?: boolean;
  /** Slow light sweep across the section. */
  sheen?: boolean;
  /** Overall intensity multiplier (0–1). Defaults to 1. */
  intensity?: number;
  className?: string;
}

// [orb1, orb2, orb3] colours per mood.
const PALETTES: Record<Variant, [string, string, string]> = {
  teal: ['#5C9EAD', '#E39774', '#D9A441'],
  gold: ['#D9A441', '#E39774', '#5C9EAD'],
  mint: ['#6FB4A0', '#5C9EAD', '#D9A441'],
  indigo: ['#2B3A67', '#5C9EAD', '#E39774'],
  sunset: ['#E39774', '#D9A441', '#6FB4A0'],
};

const ORBS = [
  { anim: 'splashOrbA', dur: '19s', delay: '0s', size: 'min(48vw, 580px)', top: '-16%', left: '-12%', op: 0.1 },
  { anim: 'splashOrbB', dur: '23s', delay: '-4s', size: 'min(40vw, 500px)', top: '22%', left: '68%', op: 0.08 },
  { anim: 'splashOrbC', dur: '27s', delay: '-9s', size: 'min(32vw, 400px)', top: '62%', left: '18%', op: 0.07 },
] as const;

export default function AmbientBackground({
  variant = 'teal',
  grid = false,
  sheen = false,
  intensity = 1,
  className = '',
}: AmbientBackgroundProps) {
  const colors = PALETTES[variant];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className}`}
    >
      {ORBS.map((orb, i) => (
        <div
          key={orb.anim}
          className="splash-orb"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: `radial-gradient(circle, ${colors[i]} 0%, transparent 68%)`,
            opacity: orb.op * intensity,
            animation: `${orb.anim} ${orb.dur} ease-in-out infinite`,
            animationDelay: orb.delay,
          }}
        />
      ))}

      {grid && <div className="splash-grid" style={{ opacity: 0.28 * intensity }} />}
      {sheen && <div className="splash-sheen" style={{ left: '-20%' }} />}
    </div>
  );
}
