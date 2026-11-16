import React from 'react';

/**
 * Official Directorate Sovereign Vector Logo
 * وزارة الداخلية - دولة ليبيا | مديرية أمن أوباري
 * Ultra-crisp vector SVG scalable to any size without raster degradation.
 */
export default function OfficialLogo({
  size = 48,
  className = '',
  showTitle = false,
  titleColor = '#0f172a',
  subtitleColor = '#64748b',
  variant = 'full' // 'full' | 'shield-only' | 'icon'
}) {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  const svgContent = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`moi-official-logo-svg ${className}`}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
      aria-label="شعار وزارة الداخلية - مديرية أمن أوباري"
    >
      <defs>
        {/* Official Gold Gradients */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff3b0" />
          <stop offset="25%" stopColor="#d4af37" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="75%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>

        <linearGradient id="goldGradLight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>

        {/* Deep Royal Police Navy Background */}
        <linearGradient id="policeNavyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a192f" />
          <stop offset="50%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>

        {/* Libyan Flag Gradients */}
        <linearGradient id="libyanRed" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e11d48" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="libyanBlack" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="50%" stopColor="#020617" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="libyanGreen" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Subtle Drop Shadow */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.35" />
        </filter>

        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main Shield Outline with Golden Shadow */}
      <g filter="url(#logoShadow)">
        {/* Outer Golden Laurel Circle / Frame */}
        <circle cx="100" cy="100" r="95" fill="url(#goldGrad)" />
        <circle cx="100" cy="100" r="91" fill="#030712" />
        <circle cx="100" cy="100" r="88" fill="url(#policeNavyGrad)" />

        {/* Geometric Police Star Rays (8 Points) */}
        <g opacity="0.18" fill="url(#goldGrad)">
          <path d="M100 16 L108 85 L184 100 L108 115 L100 184 L92 115 L16 100 L92 85 Z" />
          <path d="M100 20 L115 88 L160 40 L125 100 L160 160 L100 125 L40 160 L75 100 L40 40 L88 115 Z" />
        </g>

        {/* Police Shield Body */}
        <path
          d="M100 32 C135 32 165 42 165 65 C165 118 135 152 100 172 C65 152 35 118 35 65 C35 42 65 32 100 32 Z"
          fill="url(#policeNavyGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="3.5"
        />

        {/* Inner Shield Inset */}
        <path
          d="M100 38 C130 38 158 47 158 67 C158 114 130 144 100 163 C70 144 42 114 42 67 C42 47 70 38 100 38 Z"
          fill="none"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
          strokeDasharray="3 2"
          opacity="0.85"
        />

        {/* Sovereign Golden Falcon / Eagle of Quraish (صقر قريش الذهبي المهيب) */}
        {/* Wings Right */}
        <path
          d="M100 62 C115 54 138 52 152 64 C150 78 140 92 128 102 C135 100 144 94 148 88 C144 98 134 108 122 114 C128 113 136 109 140 104 C134 114 120 122 108 126 L100 128 Z"
          fill="url(#goldGradLight)"
          stroke="#78350f"
          strokeWidth="0.8"
        />
        {/* Wings Left (Symmetrical) */}
        <path
          d="M100 62 C85 54 62 52 48 64 C50 78 60 92 72 102 C65 100 56 94 52 88 C56 98 66 108 78 114 C72 113 64 109 60 104 C66 114 80 122 92 126 L100 128 Z"
          fill="url(#goldGradLight)"
          stroke="#78350f"
          strokeWidth="0.8"
        />

        {/* Falcon Head & Crown */}
        <path
          d="M100 44 C95 44 92 48 94 54 C95 57 97 59 100 60 C103 59 105 57 106 54 C108 48 105 44 100 44 Z"
          fill="url(#goldGrad)"
        />
        {/* Beak */}
        <path d="M100 55 L97 59 L100 62 L103 59 Z" fill="#b45309" />
        {/* Crown on Falcon */}
        <path
          d="M94 45 L97 41 L100 44 L103 41 L106 45 Z"
          fill="url(#goldGrad)"
          stroke="#78350f"
          strokeWidth="0.6"
        />

        {/* Falcon Chest Shield with Libyan National Flag */}
        <g filter="url(#goldGlow)">
          {/* Libyan Shield Container */}
          <path
            d="M100 70 C114 70 125 74 125 84 C125 108 114 122 100 130 C86 122 75 108 75 84 C75 74 86 70 100 70 Z"
            fill="#0f172a"
            stroke="url(#goldGrad)"
            strokeWidth="2"
          />

          {/* Clip path for flag stripes inside central shield */}
          <clipPath id="shieldFlagClip">
            <path d="M100 71 C113 71 123 75 123 84 C123 107 113 120 100 128 C87 120 77 107 77 84 C77 75 87 71 100 71 Z" />
          </clipPath>

          <g clipPath="url(#shieldFlagClip)">
            {/* Red Stripe (Top) */}
            <rect x="70" y="70" width="60" height="15" fill="url(#libyanRed)" />
            {/* Black Stripe (Middle - Wide) */}
            <rect x="70" y="85" width="60" height="26" fill="url(#libyanBlack)" />
            {/* Green Stripe (Bottom) */}
            <rect x="70" y="111" width="60" height="25" fill="url(#libyanGreen)" />

            {/* White Crescent and Star (Central Libyan Emblem) */}
            {/* White Crescent */}
            <path
              d="M102 91 C106.5 91 110 94.5 110 98 C110 101.5 106.5 105 102 105 C100 105 98.2 104.3 96.8 103.1 C100 102.5 102.5 99.8 102.5 98 C102.5 96.2 100 93.5 96.8 92.9 C98.2 91.7 100 91 102 91 Z"
              fill="#ffffff"
            />
            {/* White 5-Pointed Star */}
            <path
              d="M106.5 94.5 L107.5 96.8 L110 97.2 L108.2 99 L108.6 101.5 L106.5 100.2 L104.4 101.5 L104.8 99 L103 97.2 L105.5 96.8 Z"
              fill="#ffffff"
            />
          </g>
        </g>

        {/* Golden Scales of Justice (ميزان العدل) Beneath Shield */}
        <g stroke="url(#goldGrad)" strokeWidth="1.5" strokeLinecap="round">
          {/* Balance beam */}
          <line x1="88" y1="138" x2="112" y2="138" />
          {/* Vertical central pillar */}
          <line x1="100" y1="132" x2="100" y2="148" />
          <circle cx="100" cy="132" r="2" fill="url(#goldGrad)" />
          {/* Base */}
          <line x1="94" y1="148" x2="106" y2="148" strokeWidth="2" />

          {/* Left Pan Chains & Pan */}
          <line x1="88" y1="138" x2="84" y2="144" strokeWidth="0.8" />
          <line x1="88" y1="138" x2="92" y2="144" strokeWidth="0.8" />
          <path d="M82 144 C84 147 92 147 94 144 Z" fill="url(#goldGrad)" stroke="none" />

          {/* Right Pan Chains & Pan */}
          <line x1="112" y1="138" x2="108" y2="144" strokeWidth="0.8" />
          <line x1="112" y1="138" x2="116" y2="144" strokeWidth="0.8" />
          <path d="M106 144 C108 147 116 147 118 144 Z" fill="url(#goldGrad)" stroke="none" />
        </g>

        {/* Laurel Wreaths Flanking the Shield (إكليل الغار الذهبي) */}
        <g fill="url(#goldGrad)" opacity="0.9">
          {/* Left Leaves */}
          <path d="M38 95 C33 90 32 82 35 76 C37 83 42 88 43 93 Z" />
          <path d="M35 110 C29 106 28 98 32 92 C33 99 38 104 39 108 Z" />
          <path d="M37 125 C32 122 30 114 34 108 C36 115 40 119 41 123 Z" />
          <path d="M43 140 C38 138 36 130 40 124 C42 131 46 135 48 138 Z" />
          <path d="M53 154 C48 152 46 145 50 139 C53 145 57 149 59 152 Z" />

          {/* Right Leaves */}
          <path d="M162 95 C167 90 168 82 165 76 C163 83 158 88 157 93 Z" />
          <path d="M165 110 C171 106 172 98 168 92 C167 99 162 104 161 108 Z" />
          <path d="M163 125 C168 122 170 114 166 108 C164 115 160 119 159 123 Z" />
          <path d="M157 140 C162 138 164 130 160 124 C158 131 154 135 152 138 Z" />
          <path d="M147 154 C152 152 154 145 150 139 C147 145 143 149 141 152 Z" />
        </g>

        {/* Sovereign Golden Banner Arc Ribbon */}
        <path
          d="M48 164 Q100 188 152 164 Q156 174 148 180 Q100 196 52 180 Q44 174 48 164 Z"
          fill="url(#goldGrad)"
          stroke="#78350f"
          strokeWidth="1"
        />

        {/* Ribbon Inscription */}
        <text
          x="100"
          y="178"
          textAnchor="middle"
          fill="#1e1b4b"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="'Cairo', sans-serif"
          letterSpacing="0.4"
        >
          مديرية أمن أوباري
        </text>

        {/* Top Arc Inscription: وزارة الداخلية */}
        <path id="topArcPath" d="M35 55 Q100 18 165 55" fill="none" />
        <text
          fill="url(#goldGradLight)"
          fontSize="10"
          fontWeight="800"
          fontFamily="'Cairo', sans-serif"
          letterSpacing="1.2"
        >
          <textPath href="#topArcPath" startOffset="50%" textAnchor="middle">
            دولة ليبيا • وزارة الداخلية
          </textPath>
        </text>
      </g>
    </svg>
  );

  if (!showTitle) {
    return svgContent;
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
      {svgContent}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
        <span
          style={{
            fontSize: '15px',
            fontWeight: 800,
            color: titleColor,
            lineHeight: 1.2,
            fontFamily: "'Cairo', sans-serif"
          }}
        >
          وزارة الداخلية
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: subtitleColor,
            fontFamily: "'Cairo', sans-serif"
          }}
        >
          مديرية أمن أوباري
        </span>
      </div>
    </div>
  );
}
