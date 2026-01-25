"use client";

type Props = {
  value: number;
  label: string;
};

export default function CircularProgress({ value, label }: Props) {
  const radius = 64;
  const stroke = 10;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const percentage = Math.min(Math.max(value / 10, 0), 1);
  const strokeDashoffset =
    circumference - percentage * circumference;

  const getGradient = () => {
    if (value >= 8) return "url(#greenGradient)";
    if (value >= 5) return "url(#blueGradient)";
    return "url(#orangeGradient)";
  };

  return (
    <div
      style={{
        width: "200px",
        textAlign: "center",
      }}
      className="glass-card"
    >
      <svg width="140" height="140">
        <defs>
          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>

          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx="70"
          cy="70"
        />

        {/* Progress ring */}
        <circle
          stroke={getGradient()}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          r={normalizedRadius}
          cx="70"
          cy="70"
          style={{
            transition: "stroke-dashoffset 1s ease",
            filter: "drop-shadow(0 0 6px rgba(56,189,248,0.4))",
          }}
        />
      </svg>

      {/* Center text */}
      <div
        style={{
          marginTop: "-90px",
          fontSize: "26px",
          fontWeight: 700,
        }}
      >
        {value.toFixed(1)}
        <span style={{ fontSize: "14px", color: "#64748b" }}>
          /10
        </span>
      </div>

      <p
        className="muted"
        style={{ marginTop: "52px", fontSize: "14px" }}
      >
        {label}
      </p>
    </div>
  );
}
