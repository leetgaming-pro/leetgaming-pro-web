import React from "react";

function LeetGamingIcon() {
  return (
    <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Crown Element */}
      <path 
        d="M55 10 L60 20 L65 10 H55" 
        fill="none" 
        stroke="url(#gradient)" 
        strokeWidth="2" 
      />

      {/* Wing Elements */}
      <path 
        d="M30 25 L50 10 L70 25" 
        fill="none" 
        stroke="url(#gradient)" 
        strokeWidth="2" 
      />

      {/* Text Element */}
      <text x="35" y="35" fill="currentColor" fontSize="18" fontWeight="bold">
        LeetGaming.PRO
      </text> 
    </svg>
  );
}

export default LeetGamingIcon;
