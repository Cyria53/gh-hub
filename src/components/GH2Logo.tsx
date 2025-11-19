export function GH2Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <div className={`font-bold text-2xl ${className}`}>
      <span className="text-primary">GH</span>
      <span className="text-xs align-sub text-primary">₂</span>
    </div>
  );
}
