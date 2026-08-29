import React from "react";

export interface VeloraLogoProps {
  className?: string;
  size?: number | string;
  variant?: "bloom" | "lotus" | "minimal" | "ring";
}

/**
 * Premium Velora Brand Mark / Logo
 * Designed in brand primary #FF788D with layered organic curves,
 * dynamic gradient shading, and precision biological harmony symbolism.
 */
export const VeloraAppLogo: React.FC<VeloraLogoProps> = ({
  className = "w-16 h-16",
  size = 64,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Glowing Aura Ring */}
        <radialGradient id="velora-aura" cx="60" cy="60" r="55" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF0F3" stopOpacity="0.8" />
          <stop offset="0.7" stopColor="#FFE0E6" stopOpacity="0.3" />
          <stop offset="1" stopColor="#FF788D" stopOpacity="0" />
        </radialGradient>

        {/* Central Core Petal Gradient */}
        <linearGradient id="velora-core-grad" x1="60" y1="20" x2="60" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFA0B0" />
          <stop offset="0.45" stopColor="#FF788D" />
          <stop offset="1" stopColor="#E04862" />
        </linearGradient>

        {/* Outer Left Wing Gradient */}
        <linearGradient id="velora-wing-left" x1="16" y1="30" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFCCD5" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FF788D" stopOpacity="0.85" />
          <stop offset="1" stopColor="#D93B55" stopOpacity="0.9" />
        </linearGradient>

        {/* Outer Right Wing Gradient */}
        <linearGradient id="velora-wing-right" x1="104" y1="30" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFCCD5" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#FF788D" stopOpacity="0.85" />
          <stop offset="1" stopColor="#D93B55" stopOpacity="0.9" />
        </linearGradient>

        {/* Far Left Petal Gradient */}
        <linearGradient id="velora-far-left" x1="10" y1="44" x2="52" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE8ED" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#FF94A4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FF788D" stopOpacity="0.6" />
        </linearGradient>

        {/* Far Right Petal Gradient */}
        <linearGradient id="velora-far-right" x1="110" y1="44" x2="68" y2="96" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE8ED" stopOpacity="0.9" />
          <stop offset="0.5" stopColor="#FF94A4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#FF788D" stopOpacity="0.6" />
        </linearGradient>

        {/* Inner Heart Sparkle Gradient */}
        <linearGradient id="velora-inner-heart" x1="60" y1="38" x2="60" y2="88" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#FFE6EB" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FF788D" stopOpacity="0.9" />
        </linearGradient>

        {/* Soft Drop Filter */}
        <filter id="velora-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#FF788D" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Subtle Halo / Biological Cycle Ring */}
      <circle cx="60" cy="60" r="54" fill="url(#velora-aura)" />
      <circle cx="60" cy="60" r="50" stroke="#FFD8E0" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />

      {/* Group with slight glow */}
      <g filter="url(#velora-glow)">
        {/* Far Left Petal Flare */}
        <path
          d="M60 96 C42 94 22 84 15 68 C9 54 18 42 30 38 C31 54 44 80 60 96 Z"
          fill="url(#velora-far-left)"
        />

        {/* Far Right Petal Flare */}
        <path
          d="M60 96 C78 94 98 84 105 68 C111 54 102 42 90 38 C89 54 76 80 60 96 Z"
          fill="url(#velora-far-right)"
        />

        {/* Outer Left Mid Petal */}
        <path
          d="M60 98 C46 96 28 84 25 64 C23 48 34 32 48 26 C47 46 51 74 60 98 Z"
          fill="url(#velora-wing-left)"
        />

        {/* Outer Right Mid Petal */}
        <path
          d="M60 98 C74 96 92 84 95 64 C97 48 86 32 72 26 C73 46 69 74 60 98 Z"
          fill="url(#velora-wing-right)"
        />

        {/* Central Crown Petal */}
        <path
          d="M60 18 C48 38 38 58 38 74 C38 88 48 98 60 98 C72 98 82 88 82 74 C82 58 72 38 60 18 Z"
          fill="url(#velora-core-grad)"
        />

        {/* Inner Heart Vessel / Life Spark */}
        <path
          d="M60 38 C53 52 48 66 48 76 C48 84 53 90 60 90 C67 90 72 84 72 76 C72 66 67 52 60 38 Z"
          fill="url(#velora-inner-heart)"
          opacity="0.85"
        />

        {/* Center Dewdrop / Vitality Point */}
        <circle cx="60" cy="74" r="3.5" fill="#FFFFFF" opacity="0.9" />
      </g>
    </svg>
  );
};

export const VeloraEmblem: React.FC<{ size?: "sm" | "md" | "lg" | "xl"; className?: string }> = ({
  size = "md",
  className = "",
}) => {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
    xl: "w-20 h-20",
  };
  return <VeloraAppLogo className={`${sizeMap[size]} ${className}`} />;
};
