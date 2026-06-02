// Brand logo SVG components — inline, no external URLs

interface LogoProps {
  className?: string;
  size?: number;
}

export function SuiLogo({ className, size = 32 }: LogoProps) {
  return (
    <img
      src="/sui-logo.svg"
      alt="Sui"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function WalrusLogo({ className, size = 32 }: LogoProps) {
  return (
    <img
      src="/walrus-logo.svg"
      alt="Walrus"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function WiseLogo({ className, size = 32 }: LogoProps) {
  return (
    <img
      src="/wise-logo.svg"
      alt="Wise"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function StripeLogo({ className, size = 32 }: LogoProps) {
  return (
    <img
      src="/stripe-logo.svg"
      alt="Stripe"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}

export function AirwallexLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="Airwallex">
      <rect width="100" height="100" rx="16" fill="#1D2D5B" />
      <path d="M50 18 L20 75 L35 75 L50 45 L65 75 L80 75Z" fill="#0066FF" />
      <path d="M50 18 L35 45 L50 45 L65 45 L50 18Z" fill="#4DA6FF" />
      <path d="M22 75 L40 75 L31 58Z" fill="#0066FF" fillOpacity="0.6" />
      <path d="M78 75 L60 75 L69 58Z" fill="#0066FF" fillOpacity="0.6" />
    </svg>
  );
}

export function SumsubLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="Sumsub">
      <rect width="100" height="100" rx="16" fill="#0A2540" />
      <circle cx="50" cy="38" r="16" fill="#1570EF" />
      <ellipse cx="50" cy="72" rx="24" ry="14" fill="#1570EF" />
      <path d="M38 38 L46 46 L62 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MemWalLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="MemWal">
      <rect width="100" height="100" rx="16" fill="#1E1B4B" />
      <circle cx="50" cy="50" r="14" fill="#7C3AED" />
      <circle cx="22" cy="30" r="8" fill="#5B21B6" />
      <circle cx="78" cy="30" r="8" fill="#5B21B6" />
      <circle cx="22" cy="70" r="8" fill="#5B21B6" />
      <circle cx="78" cy="70" r="8" fill="#5B21B6" />
      <line x1="36" y1="50" x2="22" y2="30" stroke="#7C3AED" strokeWidth="2" />
      <line x1="36" y1="50" x2="22" y2="70" stroke="#7C3AED" strokeWidth="2" />
      <line x1="64" y1="50" x2="78" y2="30" stroke="#7C3AED" strokeWidth="2" />
      <line x1="64" y1="50" x2="78" y2="70" stroke="#7C3AED" strokeWidth="2" />
      <circle cx="22" cy="30" r="4" fill="#A78BFA" />
      <circle cx="78" cy="30" r="4" fill="#A78BFA" />
      <circle cx="22" cy="70" r="4" fill="#A78BFA" />
      <circle cx="78" cy="70" r="4" fill="#A78BFA" />
    </svg>
  );
}

export function PythLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="Pyth">
      <rect width="100" height="100" rx="16" fill="#1A1A2E" />
      <circle cx="50" cy="50" r="28" fill="#E6461E" fillOpacity="0.15" />
      <circle cx="50" cy="50" r="18" fill="#E6461E" fillOpacity="0.3" />
      <circle cx="50" cy="50" r="10" fill="#E6461E" />
      <path d="M50 22 L50 30 M50 70 L50 78 M22 50 L30 50 M70 50 L78 50" stroke="#E6461E" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 32 L38 38 M62 62 L68 68 M32 68 L38 62 M62 38 L68 32" stroke="#E6461E" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BankNegaraLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="Bank Negara">
      <rect width="100" height="100" rx="16" fill="#1a3a5c" />
      <rect x="15" y="70" width="70" height="8" rx="2" fill="#C8A020" />
      <rect x="15" y="28" width="70" height="6" rx="2" fill="#C8A020" />
      <rect x="22" y="34" width="8" height="36" rx="1" fill="#C8A020" fillOpacity="0.8" />
      <rect x="36" y="34" width="8" height="36" rx="1" fill="#C8A020" fillOpacity="0.8" />
      <rect x="50" y="34" width="8" height="36" rx="1" fill="#C8A020" fillOpacity="0.8" />
      <rect x="64" y="34" width="8" height="36" rx="1" fill="#C8A020" fillOpacity="0.8" />
      <path d="M20 28 L50 12 L80 28Z" fill="#C8A020" />
    </svg>
  );
}

export function SealLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" className={className} aria-label="Seal">
      <rect width="100" height="100" rx="16" fill="#0F172A" />
      <path d="M50 15 L58 35 L80 35 L63 48 L70 68 L50 55 L30 68 L37 48 L20 35 L42 35Z" fill="#F59E0B" />
      <circle cx="50" cy="46" r="12" fill="#0F172A" />
      <path d="M43 46 L48 51 L58 41" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
