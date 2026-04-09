"use client";

import { useState, useEffect } from "react";

interface AnimatedLogoProps {
  size?: number;
  className?: string;
}

export default function AnimatedLogo({ size = 32, className = "" }: AnimatedLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Icon 1 — fades in/out */}
      <img
        src="/icon-1.png"
        alt=""
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-[2000ms] ease-in-out ${
          mounted ? "opacity-100" : "opacity-100"
        }`}
        style={{
          animation: mounted ? "morph-icon 6s ease-in-out infinite" : "none",
        }}
      />

      {/* Icon 2 — fades in/out, offset phase */}
      <img
        src="/icon-2.png"
        alt=""
        className="absolute inset-0 w-full h-full object-contain"
        style={{
          animation: mounted ? "morph-icon-alt 6s ease-in-out infinite" : "none",
        }}
      />

      {/* Subtle glow pulse */}
      <div
        className="absolute inset-0 rounded-full blur-md opacity-20"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          animation: mounted ? "glow-pulse 6s ease-in-out infinite" : "none",
        }}
      />
    </div>
  );
}
