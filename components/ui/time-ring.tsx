"use client";

interface TimeRingProps {
  elapsedSeconds: number;
  limitMinutes: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function TimeRing({
  elapsedSeconds,
  limitMinutes,
  size = 32,
  strokeWidth = 3,
  className,
}: TimeRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(elapsedSeconds / (limitMinutes * 60), 1);
  const dashOffset = circumference * (1 - progress);

  const color =
    progress >= 1
      ? "#ef4444" // red-500
      : progress >= 0.7
        ? "#f59e0b" // amber-400
        : "#0ea5e9"; // sky-500

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const ariaLabel = `Time used: ${elapsedMinutes} minute${elapsedMinutes !== 1 ? "s" : ""} of ${limitMinutes} minute limit`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={ariaLabel}
      role="img"
      className={className}
    >
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          transition: "stroke-dashoffset 0.5s ease, stroke 0.5s ease",
        }}
      />
    </svg>
  );
}
