export default function Logo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <rect x="2" y="2" width="36" height="36" rx="10" fill="#4f46e5" />
      <path
        d="M12 21.5l5 5 11-12"
        stroke="#fff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="30.5" cy="9.5" r="4.5" fill="#22d3ee" stroke="#fafafa" strokeWidth="1.5" />
    </svg>
  );
}
