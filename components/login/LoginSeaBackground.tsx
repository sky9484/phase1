'use client';

import { motion } from 'framer-motion';

/**
 * LoginSeaBackground — a premium, bankex-style ambient backdrop for the auth pages.
 *
 * Keeps Splash's global-corridors story and brand palette (slate · teal · orange,
 * with the deep-indigo accent for depth) but trades the literal landmark skyline
 * for an abstract treatment: a deep ocean gradient, slow-drifting aurora light,
 * and a glowing corridor network where light pulses travel along arcs from the
 * Kuala Lumpur hub out to each market node.
 *
 * All motion is transform/opacity or stroke-dashoffset based, so it stays smooth,
 * and it collapses to a static gradient under prefers-reduced-motion.
 */

const HUB = { x: 720, y: 548, code: 'KL', label: 'SPLASH HQ · KUALA LUMPUR' } as const;

// Market nodes arranged as a constellation around the hub. `bow` curves the arc.
const NODES = [
  { id: 'sg', code: 'SG', label: 'Singapore', x: 792, y: 672, bow: 70, accent: '#5C9EAD' },
  { id: 'ph', code: 'PH', label: 'Manila', x: 1024, y: 432, bow: -90, accent: '#E39774' },
  { id: 'id', code: 'ID', label: 'Jakarta', x: 900, y: 742, bow: -80, accent: '#5C9EAD' },
  { id: 'vn', code: 'VN', label: 'Hanoi', x: 716, y: 320, bow: 60, accent: '#E39774' },
  { id: 'th', code: 'TH', label: 'Bangkok', x: 520, y: 404, bow: 90, accent: '#5C9EAD' },
  { id: 'jp', code: 'JP', label: 'Tokyo', x: 1148, y: 286, bow: -120, accent: '#E39774' },
  { id: 'in', code: 'IN', label: 'Mumbai', x: 326, y: 520, bow: 70, accent: '#6FB4A0' },
  { id: 'eu', code: 'EU', label: 'Amsterdam', x: 388, y: 268, bow: 130, accent: '#6FB4A0' },
] as const;

// Quadratic arc from hub to a node, bowed perpendicular to the chord.
function arcPath(x: number, y: number, bow: number) {
  const mx = (HUB.x + x) / 2;
  const my = (HUB.y + y) / 2;
  const dx = x - HUB.x;
  const dy = y - HUB.y;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular unit vector × bow.
  const cx = mx + (-dy / len) * bow;
  const cy = my + (dx / len) * bow;
  return `M ${HUB.x} ${HUB.y} Q ${cx} ${cy} ${x} ${y}`;
}

export default function LoginSeaBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base ocean gradient — indigo depth → slate → teal shallows */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#1b2b4a_0%,#1f4452_40%,#2c5a6b_74%,#326273_100%)]" />

      {/* Drifting aurora light (CSS orbs reused from the section ambient system) */}
      <div
        className="splash-orb"
        style={{
          width: 'min(70vw, 820px)', height: 'min(70vw, 820px)', top: '-22%', left: '-12%',
          background: 'radial-gradient(circle, #5C9EAD 0%, transparent 66%)',
          opacity: 0.28, animation: 'splashOrbA 21s ease-in-out infinite',
        }}
      />
      <div
        className="splash-orb"
        style={{
          width: 'min(60vw, 680px)', height: 'min(60vw, 680px)', top: '28%', left: '64%',
          background: 'radial-gradient(circle, #E39774 0%, transparent 66%)',
          opacity: 0.20, animation: 'splashOrbB 26s ease-in-out infinite', animationDelay: '-6s',
        }}
      />
      <div
        className="splash-orb"
        style={{
          width: 'min(52vw, 560px)', height: 'min(52vw, 560px)', top: '52%', left: '14%',
          background: 'radial-gradient(circle, #2B3A67 0%, transparent 68%)',
          opacity: 0.4, animation: 'splashOrbC 30s ease-in-out infinite', animationDelay: '-11s',
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 920"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="loginSun" cx="0.5" cy="0.42" r="0.6">
            <stop offset="0%" stopColor="rgba(246,224,201,0.5)" />
            <stop offset="55%" stopColor="rgba(246,224,201,0)" />
          </radialGradient>
          <radialGradient id="loginHubGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(227,151,116,0.6)" />
            <stop offset="100%" stopColor="rgba(227,151,116,0)" />
          </radialGradient>
          <linearGradient id="loginVignette" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(15,28,42,0.55)" />
            <stop offset="34%" stopColor="rgba(15,28,42,0)" />
            <stop offset="78%" stopColor="rgba(15,28,42,0)" />
            <stop offset="100%" stopColor="rgba(10,20,30,0.6)" />
          </linearGradient>
        </defs>

        {/* Soft overhead glow */}
        <ellipse cx="720" cy="300" rx="980" ry="300" fill="url(#loginSun)" opacity="0.55" />

        {/* Faint latitude lines for depth */}
        <g stroke="rgba(246,240,237,0.06)" strokeWidth="1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <line key={i} x1="0" y1={150 + i * 140} x2="1440" y2={150 + i * 140} />
          ))}
        </g>

        {/* Drifting particles */}
        <g>
          {Array.from({ length: 36 }).map((_, i) => {
            const cx = (i * 79) % 1440;
            const cy = 120 + ((i * 53) % 720);
            return (
              <motion.circle
                key={i}
                cx={cx}
                cy={cy}
                r={i % 7 === 0 ? 1.8 : 1.1}
                fill="rgba(246,240,237,0.6)"
                animate={{ opacity: [0.08, 0.8, 0.08] }}
                transition={{ duration: 3 + ((i * 7) % 5), repeat: Infinity, ease: 'easeInOut', delay: (i % 6) * 0.4 }}
              />
            );
          })}
        </g>

        {/* Corridor arcs — base strand + a travelling light segment */}
        {NODES.map((n, i) => {
          const d = arcPath(n.x, n.y, n.bow);
          return (
            <g key={n.id}>
              <path d={d} fill="none" stroke="rgba(246,240,237,0.14)" strokeWidth="1" />
              <path
                d={d}
                fill="none"
                stroke={n.accent}
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={1000}
                strokeDasharray="10 990"
                style={{ animation: `loginFlow ${5 + (i % 4)}s linear infinite`, animationDelay: `${i * 0.5}s` }}
                opacity="0.9"
              />
            </g>
          );
        })}

        {/* Market nodes */}
        {NODES.map((n, i) => (
          <g key={`node-${n.id}`}>
            <motion.circle
              cx={n.x}
              cy={n.y}
              r="11"
              fill={n.accent}
              opacity="0.18"
              animate={{ r: [9, 16, 9], opacity: [0.22, 0, 0.22] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeOut', delay: i * 0.35 }}
            />
            <circle cx={n.x} cy={n.y} r="3.4" fill="#F6F0ED" />
            <circle cx={n.x} cy={n.y} r="3.4" fill="none" stroke={n.accent} strokeWidth="1.5" />
            <text
              x={n.x}
              y={n.y - 12}
              fontFamily="'Geist Mono', monospace"
              fontSize="10"
              fill="rgba(246,240,237,0.66)"
              textAnchor="middle"
              fontWeight="700"
              letterSpacing="1.5"
            >
              {n.code}
            </text>
          </g>
        ))}

        {/* Hub — Kuala Lumpur */}
        <g>
          <ellipse cx={HUB.x} cy={HUB.y} rx="120" ry="120" fill="url(#loginHubGlow)" opacity="0.7" />
          <motion.circle
            cx={HUB.x}
            cy={HUB.y}
            r="14"
            fill="none"
            stroke="#E39774"
            strokeWidth="1.5"
            animate={{ r: [14, 34, 14], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeOut' }}
          />
          <circle cx={HUB.x} cy={HUB.y} r="7" fill="#E39774" />
          <circle cx={HUB.x} cy={HUB.y} r="3" fill="#F6F0ED" />
          <text
            x={HUB.x}
            y={HUB.y + 30}
            fontFamily="'Geist Mono', monospace"
            fontSize="11"
            fill="#F6F0ED"
            textAnchor="middle"
            fontWeight="700"
            letterSpacing="2.5"
          >
            {HUB.label}
          </text>
        </g>

        {/* Depth vignette to ground the sign-in card */}
        <rect x="0" y="0" width="1440" height="920" fill="url(#loginVignette)" />
      </svg>

      <style>{`
        @keyframes loginFlow {
          to { stroke-dashoffset: -1000; }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="loginFlow"] { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
