import { typeColor, textOn } from "@/lib/types";

export default function TypeBadge({ type, className = "" }) {
  const bg = typeColor(type);
  return (
    <span className={`type-badge ${className}`} style={{ background: bg, color: textOn(bg) }}>
      {type}
    </span>
  );
}
