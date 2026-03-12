import { memo } from "react";

interface AnimatedCheckProps {
  size?: number;
  className?: string;
}

const AnimatedCheck = memo(({ size = 16, className = "" }: AnimatedCheckProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeDasharray="63"
      strokeDashoffset="0"
      style={{
        animation: "draw-circle 2s ease-in-out infinite",
      }}
    />
    <path
      d="M8 12.5L11 15.5L16 9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray="20"
      strokeDashoffset="20"
      style={{
        animation: "draw-tick 2s ease-in-out infinite",
      }}
    />
  </svg>
));

AnimatedCheck.displayName = "AnimatedCheck";

export default AnimatedCheck;
