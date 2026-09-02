import { motion } from "framer-motion";
import { useId } from "react";

export default function PourGlass({ fill = 62, color = "#f0c75e", size = 88, pouring = false }) {
  const uid = useId().replace(/:/g, "");
  const liquidH = Math.max(8, (fill / 100) * 92);
  const foamY = 110 - liquidH;
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 88 118.8"
      className={`pour-glass ${pouring ? "is-pouring" : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`beer-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#fff6d6" />
          <stop offset="18%" stopColor={color} />
          <stop offset="100%" stopColor="#7a4a08" />
        </linearGradient>
        <clipPath id={`glass-clip-${uid}`}>
          <path d="M22 18 L28 108 Q44 118 60 108 L66 18 Z" />
        </clipPath>
      </defs>
      <path
        d="M18 12 H70 L62 112 Q44 126 26 112 Z"
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="2"
      />
      <g clipPath={`url(#glass-clip-${uid})`}>
        <motion.rect
          x="20"
          width="48"
          fill={`url(#beer-${uid})`}
          initial={{ y: 110, height: 0 }}
          animate={{ y: foamY, height: liquidH }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
        <ellipse cx="44" cy={foamY} rx="20" ry="6" fill="#fff7ea" />
        {pouring && (
          <>
            <circle className="bubble b1" cx="36" cy="88" r="2.2" fill="rgba(255,255,255,0.55)" />
            <circle className="bubble b2" cx="44" cy="96" r="2.2" fill="rgba(255,255,255,0.55)" />
            <circle className="bubble b3" cx="52" cy="84" r="2.2" fill="rgba(255,255,255,0.55)" />
          </>
        )}
      </g>
      <path d="M70 28 Q86 40 78 70" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    </svg>
  );
}
