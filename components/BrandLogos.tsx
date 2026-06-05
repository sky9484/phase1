// Brand logo SVG components — inline, no external URLs

interface LogoProps {
  className?: string;
  size?: number;
}

export function SuiLogo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      role="img"
      aria-label="Sui"
      width={size}
      height={size}
      viewBox="0 0 783 1000"
      fill="none"
      className={`text-[#4DA2FF] ${className ?? ''}`}
      style={{ width: size, height: size }}
    >
      <title>Sui</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M626.027 417.029C666.817 468.244 691.209 533.014 691.209 603.469C691.209 673.925 666.076 740.673 624.214 792.176L620.588 796.626L619.641 790.981C618.817 786.201 617.869 781.34 616.757 776.478C595.785 684.349 527.471 605.365 415.03 541.378C339.095 498.28 295.626 446.448 284.213 387.487C276.838 349.375 282.318 311.098 292.907 278.301C303.496 245.545 319.235 218.063 332.626 201.541L376.383 148.06C384.046 138.666 398.426 138.666 406.09 148.06L626.068 417.029H626.027ZM695.206 363.59L402.01 5.12968C396.407 -1.70989 385.942 -1.70989 380.338 5.12968L87.184 363.59L86.2363 364.784C32.3026 431.738 0 516.821 0 609.444C0 825.138 175.151 1000 391.174 1000C607.198 1000 782.349 825.138 782.349 609.444C782.349 516.821 750.046 431.738 696.112 364.826L695.165 363.631L695.206 363.59ZM157.351 415.876L183.556 383.779L184.339 389.712C184.957 394.409 185.74 399.106 186.646 403.844C203.622 492.883 264.23 567.088 365.546 624.565C453.637 674.708 504.934 732.35 519.684 795.554C525.864 821.924 526.936 847.881 524.258 870.584L524.093 871.985L522.816 872.603C483.055 892.009 438.351 902.927 391.133 902.927C225.459 902.927 91.1394 768.855 91.1394 603.428C91.1394 532.396 115.902 467.172 157.269 415.793L157.351 415.876Z"
        fill="currentColor"
      />
    </svg>
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
    <img
      src="/airwallex-logo.png"
      alt="Airwallex"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

export function SumsubLogo({ className, size = 32 }: LogoProps) {
  return (
    <img
      src="/sumsub-logo.png"
      alt="Sumsub"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
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
    <img
      src="/pyth-logo.png"
      alt="Pyth"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
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
