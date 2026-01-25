"use client";
import { useEffect, useState } from "react";

export default function MiniScoreRing({ score }: { score: number }) {
  const radius = 18;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const [value, setValue] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = score / 25;

    const timer = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      setValue(Number(current.toFixed(1)));
    }, 16);

    return () => clearInterval(timer);
  }, [score]);

  const strokeDashoffset =
    circumference - (value / 10) * circumference;

  return (
    <svg width={radius * 2} height={radius * 2}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={score >= 7 ? "#22c55e" : "#f59e0b"}
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fontWeight="600"
        fill="#0f172a"
      >
        {value}
      </text>
    </svg>
  );
}
