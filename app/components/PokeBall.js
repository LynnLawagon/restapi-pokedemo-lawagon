export default function PokeBall({ size = 24, className = "" }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <circle cx="50" cy="50" r="46" fill="#fff" stroke="#1b1b1f" strokeWidth="6" />
      <path d="M4 50 A46 46 0 0 1 96 50 Z" fill="#ee1515" stroke="#1b1b1f" strokeWidth="6" strokeLinejoin="round" />
      <rect x="4" y="47" width="92" height="6" fill="#1b1b1f" />
      <circle cx="50" cy="50" r="15" fill="#fff" stroke="#1b1b1f" strokeWidth="6" />
      <circle cx="50" cy="50" r="6" fill="#f6f3ea" stroke="#1b1b1f" strokeWidth="2" />
    </svg>
  );
}
