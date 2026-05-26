/**
 * BrandMark — placeholder logo composed of four ARM-accent dots.
 * Drop an official SVG into this slot later without changing call sites.
 */
export function BrandMark({ size = 24 }: { size?: number }) {
  const dot = size / 2 - 1;
  return (
    <div
      aria-hidden
      className="grid grid-cols-2 grid-rows-2 gap-[2px] shrink-0"
      style={{ width: size, height: size }}
    >
      <span className="rounded-[3px] bg-arm-cyan" style={{ width: dot, height: dot }} />
      <span className="rounded-[3px] bg-arm-yellow" style={{ width: dot, height: dot }} />
      <span className="rounded-[3px] bg-arm-magenta" style={{ width: dot, height: dot }} />
      <span className="rounded-[3px] bg-arm-lime" style={{ width: dot, height: dot }} />
    </div>
  );
}
