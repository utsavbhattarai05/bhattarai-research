'use client';

interface LogoProps {
  size?: number;
  variant?: 'full' | 'icon'; // full = seal + name, icon = seal only
}

export function LogoSeal({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Dr. Dhruba Prasad Bhattarai"
    >
      {/* Outer ring */}
      <circle cx="100" cy="100" r="95" fill="#8B1A1A" />
      {/* Inner ring stroke */}
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(243,237,224,0.5)" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="78" fill="none" stroke="rgba(243,237,224,0.3)" strokeWidth="0.8" />

      {/* Initials */}
      <text
        x="100"
        y="118"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="700"
        fontSize="58"
        fill="#F3EDE0"
        letterSpacing="2"
      >
        DPB
      </text>

      {/* Decorative line under initials */}
      <line x1="68" y1="130" x2="132" y2="130" stroke="rgba(243,237,224,0.5)" strokeWidth="1.2" />

      {/* Dots at line ends */}
      <circle cx="68" cy="130" r="2" fill="rgba(243,237,224,0.6)" />
      <circle cx="132" cy="130" r="2" fill="rgba(243,237,224,0.6)" />
    </svg>
  );
}

export default function Logo({ size = 40, variant = 'full' }: LogoProps) {
  if (variant === 'icon') return <LogoSeal size={size} />;

  return (
    <div className="flex items-center gap-2.5">
      <LogoSeal size={size} />
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-maroon-700 dark:text-maroon-400 tracking-wide">
          Dr. Bhattarai
        </span>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-wider uppercase">
          Research
        </span>
      </div>
    </div>
  );
}
