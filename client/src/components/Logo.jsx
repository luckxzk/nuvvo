export default function Logo({ size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={`nuvvo-logo ${className}`}
      aria-label="NUVVO"
      role="img"
      fill="none"
    >
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="21.5" />
        <line x1="4.3" y1="7.25" x2="19.7" y2="16.75" />
        <line x1="19.7" y1="7.25" x2="4.3" y2="16.75" />
      </g>
    </svg>
  );
}
