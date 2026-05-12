'use client';

import { motion } from 'framer-motion';

type Landmark = {
  id: string;
  code: string;
  name: string;
  cx: number;
  cy: number;
  build: (x: number, y: number) => React.ReactNode;
  islandRx?: number;
  islandRy?: number;
};

const HQ = { cx: 720, cy: 470 } as const;

const palette = {
  building: '#F6F0ED',
  buildingShade: '#d8c8be',
  accent: '#E39774',
  windows: '#5C9EAD',
  spire: '#E39774',
  green: '#1c4a3a',
};

function MarinaBaySands(x: number, y: number) {
  return (
    <g>
      {/* Three towers */}
      <rect x={x - 32} y={y - 78} width="12" height="78" fill={palette.building} />
      <rect x={x - 6} y={y - 86} width="12" height="86" fill={palette.building} />
      <rect x={x + 20} y={y - 78} width="12" height="78" fill={palette.building} />
      {/* Boat-shaped roof (Skypark) */}
      <path d={`M ${x - 38} ${y - 86} Q ${x} ${y - 110} ${x + 38} ${y - 86} L ${x + 36} ${y - 80} Q ${x} ${y - 104} ${x - 36} ${y - 80} Z`} fill={palette.accent} />
      {/* Windows */}
      <g fill={palette.windows} opacity="0.85">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row}>
            <rect x={x - 30} y={y - 72 + row * 12} width="8" height="6" />
            <rect x={x - 4} y={y - 80 + row * 12} width="8" height="6" />
            <rect x={x + 22} y={y - 72 + row * 12} width="8" height="6" />
          </g>
        ))}
      </g>
    </g>
  );
}

function ManilaSkyline(x: number, y: number) {
  return (
    <g>
      {/* SM Mall / BGC tower (right) */}
      <rect x={x + 4} y={y - 80} width="22" height="80" fill={palette.building} />
      <polygon points={`${x + 4},${y - 80} ${x + 15},${y - 96} ${x + 26},${y - 80}`} fill={palette.accent} />
      {/* Side tower */}
      <rect x={x - 24} y={y - 58} width="20" height="58" fill={palette.building} />
      <polygon points={`${x - 24},${y - 58} ${x - 14},${y - 70} ${x - 4},${y - 58}`} fill={palette.accent} />
      <g fill={palette.windows} opacity="0.8">
        {[0, 1, 2, 3, 4, 5].map((row) => (
          <g key={row}>
            <rect x={x + 8} y={y - 72 + row * 12} width="6" height="6" />
            <rect x={x + 16} y={y - 72 + row * 12} width="6" height="6" />
            <rect x={x - 20} y={y - 50 + row * 9} width="5" height="5" />
            <rect x={x - 12} y={y - 50 + row * 9} width="5" height="5" />
          </g>
        ))}
      </g>
      {/* Antenna */}
      <line x1={x + 15} y1={y - 96} x2={x + 15} y2={y - 112} stroke={palette.spire} strokeWidth="2" />
      <motion.circle
        cx={x + 15}
        cy={y - 114}
        r="2.5"
        fill={palette.spire}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
    </g>
  );
}

function MonasJakarta(x: number, y: number) {
  return (
    <g>
      {/* Square base */}
      <rect x={x - 22} y={y - 16} width="44" height="16" fill={palette.building} />
      {/* Stepped pedestal */}
      <rect x={x - 14} y={y - 28} width="28" height="12" fill={palette.buildingShade} />
      {/* Tall obelisk */}
      <rect x={x - 5} y={y - 90} width="10" height="62" fill={palette.building} />
      {/* Cup at top */}
      <ellipse cx={x} cy={y - 92} rx="9" ry="4" fill={palette.buildingShade} />
      {/* Flame */}
      <path d={`M ${x - 5} ${y - 92} Q ${x - 8} ${y - 104} ${x} ${y - 116} Q ${x + 8} ${y - 104} ${x + 5} ${y - 92} Z`} fill={palette.accent} />
      <motion.path
        d={`M ${x - 3} ${y - 96} Q ${x - 5} ${y - 105} ${x} ${y - 112} Q ${x + 5} ${y - 105} ${x + 3} ${y - 96} Z`}
        fill="#F6E0C9"
        animate={{ opacity: [0.4, 1, 0.4], y: [0, -1, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </g>
  );
}

function WatArunBangkok(x: number, y: number) {
  return (
    <g>
      {/* Tiered pagoda base */}
      <polygon points={`${x - 38},${y} ${x + 38},${y} ${x + 30},${y - 18} ${x - 30},${y - 18}`} fill={palette.building} />
      <polygon points={`${x - 28},${y - 18} ${x + 28},${y - 18} ${x + 22},${y - 38} ${x - 22},${y - 38}`} fill={palette.buildingShade} />
      <polygon points={`${x - 20},${y - 38} ${x + 20},${y - 38} ${x + 14},${y - 60} ${x - 14},${y - 60}`} fill={palette.building} />
      {/* Central spire (prang) */}
      <path d={`M ${x - 12} ${y - 60} Q ${x} ${y - 110} ${x + 12} ${y - 60} Z`} fill={palette.accent} />
      <line x1={x} y1={y - 110} x2={x} y2={y - 124} stroke={palette.spire} strokeWidth="1.5" />
      <circle cx={x} cy={y - 124} r="2" fill={palette.spire} />
      {/* Side spires */}
      <path d={`M ${x - 28} ${y - 38} Q ${x - 22} ${y - 60} ${x - 16} ${y - 38} Z`} fill={palette.accent} opacity="0.85" />
      <path d={`M ${x + 16} ${y - 38} Q ${x + 22} ${y - 60} ${x + 28} ${y - 38} Z`} fill={palette.accent} opacity="0.85" />
      {/* Decorative dots */}
      <g fill={palette.windows} opacity="0.7">
        <circle cx={x} cy={y - 8} r="1.8" />
        <circle cx={x - 12} cy={y - 8} r="1.5" />
        <circle cx={x + 12} cy={y - 8} r="1.5" />
      </g>
    </g>
  );
}

function TokyoTower(x: number, y: number) {
  return (
    <g>
      {/* Triangular lattice tower */}
      <polygon points={`${x - 30},${y} ${x + 30},${y} ${x + 6},${y - 88} ${x - 6},${y - 88}`} fill={palette.accent} />
      {/* Lattice lines */}
      <g stroke={palette.building} strokeWidth="0.8" opacity="0.7">
        <line x1={x - 24} y1={y - 14} x2={x + 24} y2={y - 14} />
        <line x1={x - 18} y1={y - 36} x2={x + 18} y2={y - 36} />
        <line x1={x - 12} y1={y - 58} x2={x + 12} y2={y - 58} />
        <line x1={x - 28} y1={y - 2} x2={x + 4} y2={y - 88} />
        <line x1={x + 28} y1={y - 2} x2={x - 4} y2={y - 88} />
      </g>
      {/* Observation deck */}
      <rect x={x - 10} y={y - 58} width="20" height="8" fill={palette.building} />
      {/* Antenna */}
      <line x1={x} y1={y - 88} x2={x} y2={y - 108} stroke={palette.building} strokeWidth="1.5" />
      <motion.circle
        cx={x}
        cy={y - 110}
        r="2"
        fill={palette.spire}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
      />
    </g>
  );
}

function HanoiTower(x: number, y: number) {
  // Stylized Lotte Center Hanoi-style skyscraper with crown
  return (
    <g>
      <rect x={x - 14} y={y - 88} width="28" height="88" fill={palette.building} />
      <polygon points={`${x - 14},${y - 88} ${x},${y - 108} ${x + 14},${y - 88}`} fill={palette.accent} />
      <g fill={palette.windows} opacity="0.85">
        {[0, 1, 2, 3, 4, 5, 6].map((row) => (
          <g key={row}>
            <rect x={x - 10} y={y - 80 + row * 11} width="6" height="6" />
            <rect x={x + 4} y={y - 80 + row * 11} width="6" height="6" />
          </g>
        ))}
      </g>
    </g>
  );
}

const landmarks: Landmark[] = [
  { id: 'sg', code: 'SG', name: 'Marina Bay Sands', cx: 240, cy: 280, build: MarinaBaySands, islandRx: 90, islandRy: 22 },
  { id: 'mnl', code: 'PH', name: 'Manila', cx: 1180, cy: 290, build: ManilaSkyline, islandRx: 90, islandRy: 22 },
  { id: 'jkt', code: 'ID', name: 'Monas', cx: 1230, cy: 720, build: MonasJakarta, islandRx: 90, islandRy: 24 },
  { id: 'bkk', code: 'TH', name: 'Wat Arun', cx: 260, cy: 720, build: WatArunBangkok, islandRx: 96, islandRy: 24 },
  { id: 'tko', code: 'JP', name: 'Tokyo Tower', cx: 1380, cy: 480, build: TokyoTower, islandRx: 90, islandRy: 22 },
  { id: 'hni', code: 'VN', name: 'Hanoi', cx: 90, cy: 480, build: HanoiTower, islandRx: 90, islandRy: 22 },
];

const flowTargets = landmarks.map((landmark) => ({ id: landmark.id, cx: landmark.cx, cy: landmark.cy }));

export default function LoginSeaBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#dceef4_0%,#a9d2dd_38%,#5C9EAD_82%,#3d7d8c_100%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 920"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(246,224,201,0.65)" />
            <stop offset="60%" stopColor="rgba(246,224,201,0)" />
          </radialGradient>
          <linearGradient id="islandFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1F4452" />
            <stop offset="60%" stopColor="#143442" />
            <stop offset="100%" stopColor="#0c2632" />
          </linearGradient>
          <linearGradient id="hqIslandFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#26586a" />
            <stop offset="55%" stopColor="#173b49" />
            <stop offset="100%" stopColor="#0a2330" />
          </linearGradient>
          <radialGradient id="islandGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="rgba(227,151,116,0.55)" />
            <stop offset="100%" stopColor="rgba(227,151,116,0)" />
          </radialGradient>
        </defs>

        <ellipse cx="720" cy="280" rx="900" ry="260" fill="url(#sunGlow)" opacity="0.7" />

        <g opacity="0.55">
          <motion.path
            d="M0 360 C 240 320 480 400 720 360 C 960 320 1200 400 1440 360 L 1440 920 L 0 920 Z"
            fill="rgba(246,240,237,0.06)"
            animate={{ d: [
              'M0 360 C 240 320 480 400 720 360 C 960 320 1200 400 1440 360 L 1440 920 L 0 920 Z',
              'M0 380 C 240 360 480 320 720 380 C 960 420 1200 320 1440 380 L 1440 920 L 0 920 Z',
              'M0 360 C 240 320 480 400 720 360 C 960 320 1200 400 1440 360 L 1440 920 L 0 920 Z',
            ] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M0 460 C 280 420 540 500 820 460 C 1080 420 1240 500 1440 460 L 1440 920 L 0 920 Z"
            fill="rgba(246,240,237,0.05)"
            animate={{ d: [
              'M0 460 C 280 420 540 500 820 460 C 1080 420 1240 500 1440 460 L 1440 920 L 0 920 Z',
              'M0 480 C 280 460 540 420 820 480 C 1080 520 1240 420 1440 480 L 1440 920 L 0 920 Z',
              'M0 460 C 280 420 540 500 820 460 C 1080 420 1240 500 1440 460 L 1440 920 L 0 920 Z',
            ] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </g>

        <g stroke="rgba(246,240,237,0.08)" strokeWidth="1">
          {[0, 1, 2, 3, 4].map((index) => (
            <line key={index} x1="0" y1={180 + index * 160} x2="1440" y2={180 + index * 160} />
          ))}
        </g>

        <g>
          {Array.from({ length: 30 }).map((_, index) => {
            const cx = (index * 73) % 1440;
            const cy = 360 + ((index * 41) % 480);
            return (
              <motion.circle
                key={index}
                cx={cx}
                cy={cy}
                r="1.2"
                fill="rgba(246,240,237,0.55)"
                animate={{ opacity: [0.1, 0.85, 0.1] }}
                transition={{ duration: 3 + ((index * 7) % 4), repeat: Infinity, ease: 'easeInOut', delay: (index % 5) * 0.4 }}
              />
            );
          })}
        </g>

        {/* Flow lines from HQ to each landmark */}
        {flowTargets.map((target, index) => (
          <line
            key={`line-${target.id}`}
            x1={HQ.cx}
            y1={HQ.cy - 90}
            x2={target.cx}
            y2={target.cy - 30}
            stroke="rgba(246,240,237,0.2)"
            strokeWidth="1"
            strokeDasharray="3 8"
            style={{ animation: `splashLineDash 18s linear infinite`, animationDelay: `${index * 0.4}s` }}
          />
        ))}

        {/* Outer landmarks */}
        {landmarks.map((landmark) => (
          <g key={landmark.id}>
            <ellipse
              cx={landmark.cx}
              cy={landmark.cy + 16}
              rx={(landmark.islandRx ?? 80) + 16}
              ry={(landmark.islandRy ?? 22) + 8}
              fill="url(#islandGlow)"
              opacity="0.6"
            />
            <ellipse cx={landmark.cx} cy={landmark.cy} rx={landmark.islandRx ?? 80} ry={landmark.islandRy ?? 22} fill="url(#islandFill)" />
            <ellipse cx={landmark.cx} cy={landmark.cy - (landmark.islandRy ?? 22) * 0.4} rx={(landmark.islandRx ?? 80) * 0.8} ry={(landmark.islandRy ?? 22) * 0.6} fill="rgba(92,158,173,0.22)" />
            {landmark.build(landmark.cx, landmark.cy)}
            <text
              x={landmark.cx}
              y={landmark.cy + (landmark.islandRy ?? 22) + 18}
              fontFamily="'Geist Mono', monospace"
              fontSize="10"
              fill="rgba(246,240,237,0.62)"
              textAnchor="middle"
              fontWeight="700"
              letterSpacing="2"
            >
              {landmark.code} · {landmark.name.toUpperCase()}
            </text>
          </g>
        ))}

        {/* HQ — Petronas Twin Towers, Kuala Lumpur */}
        <g>
          <ellipse cx={HQ.cx} cy={HQ.cy + 34} rx="240" ry="46" fill="url(#islandGlow)" opacity="0.7" />
          <ellipse cx={HQ.cx} cy={HQ.cy + 12} rx="200" ry="40" fill="url(#hqIslandFill)" />
          <ellipse cx={HQ.cx} cy={HQ.cy - 6} rx="170" ry="30" fill="rgba(92,158,173,0.22)" />

          {/* Twin towers */}
          <PetronasTwinTowers cx={HQ.cx} baseY={HQ.cy + 4} />

          <text
            x={HQ.cx}
            y={HQ.cy + 70}
            fontFamily="'Geist Mono', monospace"
            fontSize="12"
            fill="#F6F0ED"
            textAnchor="middle"
            fontWeight="700"
            letterSpacing="3"
          >
            MY · SPLASH HQ · KUALA LUMPUR
          </text>

          <g stroke="#0a2530" strokeLinecap="round">
            <line x1={HQ.cx - 150} y1={HQ.cy + 4} x2={HQ.cx - 162} y2={HQ.cy - 16} strokeWidth="2" />
            <line x1={HQ.cx + 150} y1={HQ.cy + 4} x2={HQ.cx + 164} y2={HQ.cy - 18} strokeWidth="2" />
          </g>
          <g fill="#1c4a3a">
            <ellipse cx={HQ.cx - 162} cy={HQ.cy - 24} rx="14" ry="6" />
            <ellipse cx={HQ.cx + 164} cy={HQ.cy - 26} rx="14" ry="6" />
          </g>
        </g>

        {/* Money packets traveling from HQ to landmarks */}
        {flowTargets.map((target, index) => (
          <g key={`packet-${target.id}`}>
            <motion.circle
              r="5"
              fill="#E39774"
              initial={{ cx: HQ.cx, cy: HQ.cy - 90, opacity: 0 }}
              animate={{
                cx: [HQ.cx, target.cx],
                cy: [HQ.cy - 90, target.cy - 30],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1, 1, 0.4],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.55,
                times: [0, 0.1, 0.85, 1],
              }}
            />
            <motion.circle
              r="3"
              fill="rgba(246,240,237,0.95)"
              initial={{ cx: HQ.cx, cy: HQ.cy - 90, opacity: 0 }}
              animate={{
                cx: [HQ.cx, target.cx],
                cy: [HQ.cy - 90, target.cy - 30],
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: index * 0.55 + 0.18,
                times: [0, 0.1, 0.85, 1],
              }}
            />
          </g>
        ))}
      </svg>

      <style>{`
        @keyframes splashLineDash {
          to { stroke-dashoffset: -200; }
        }
      `}</style>
    </div>
  );
}

function PetronasTower({ x, baseY }: { x: number; baseY: number }) {
  return (
    <g>
      {/* Tower body — tapered */}
      <polygon
        points={`${x - 14},${baseY} ${x + 14},${baseY} ${x + 11},${baseY - 110} ${x - 11},${baseY - 110}`}
        fill={palette.building}
      />
      {/* Top rings */}
      <rect x={x - 11} y={baseY - 116} width="22" height="6" fill={palette.buildingShade} />
      <rect x={x - 7} y={baseY - 130} width="14" height="14" fill={palette.building} />
      {/* Spire */}
      <line x1={x} y1={baseY - 130} x2={x} y2={baseY - 158} stroke={palette.spire} strokeWidth="2" />
      <motion.circle
        cx={x}
        cy={baseY - 160}
        r="3"
        fill={palette.spire}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Windows */}
      <g fill={palette.windows} opacity="0.85">
        {Array.from({ length: 9 }).map((_, row) => (
          <g key={row}>
            <rect x={x - 9} y={baseY - 102 + row * 11} width="6" height="6" />
            <rect x={x + 3} y={baseY - 102 + row * 11} width="6" height="6" />
          </g>
        ))}
      </g>
    </g>
  );
}

function PetronasTwinTowers({ cx, baseY }: { cx: number; baseY: number }) {
  return (
    <g>
      <PetronasTower x={cx - 26} baseY={baseY} />
      <PetronasTower x={cx + 26} baseY={baseY} />
      {/* Sky bridge */}
      <rect x={cx - 18} y={baseY - 64} width="36" height="6" fill={palette.accent} />
      <line x1={cx - 12} y1={baseY - 58} x2={cx - 12} y2={baseY - 30} stroke={palette.buildingShade} strokeWidth="1.5" />
      <line x1={cx + 12} y1={baseY - 58} x2={cx + 12} y2={baseY - 30} stroke={palette.buildingShade} strokeWidth="1.5" />
      {/* Logo plaque */}
      <g transform={`translate(${cx - 26} ${baseY - 12})`}>
        <rect width="52" height="14" rx="3" fill="#1F4452" />
        <text x="26" y="10" fontSize="8" fontWeight="700" fill={palette.accent} textAnchor="middle" letterSpacing="2">SPLASH</text>
      </g>
    </g>
  );
}
