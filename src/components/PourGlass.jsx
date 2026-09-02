import { motion } from "framer-motion";
import { useId } from "react";

export default function PourGlass({ fill = 62, color = "#f0c75e", size = 88, pouring = false }) {
  const uid = useId().replace(/:/g, "");
  const h = size * 1.35;
  const liquidH = (fill / 100) * (h - 18);
  return (
    <svg
      width={size}
      height={h}
      viewBox={`0 0 88 ${88 * 1.35}`}
      className="pour-glass"
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
          initial={{ y: 118, height: 0 }}
          animate={{ y: 118 - liquidH, height: liquidH }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
        <motion.ellipse
          cx="44"
          rx="20"
          ry="6"
          fill="#fff7ea"
          animate={{
            cy: 118 - liquidH,
            scaleX: pouring ? [1, 1.08, 1] : 1,
          }}
          transition={{ duration: 1.4, repeat: pouring ? Infinity : 0 }}
        />
        {pouring &&
          [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={34 + i * 8}
              r="2.2"
              fill="rgba(255,255,255,0.55)"
              animate={{ cy: [90, 40], opacity: [0, 1, 0] }}
              transition={{ duration: 1.1, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
      </g>
      <path d="M70 28 Q86 40 78 70" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" />
    </svg>
  );
}
