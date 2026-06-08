/** Forest brand tint at 40% — matches Figma hero / sourcing sections. */
export const HERO_OVERLAY_COLOR = 'rgba(23, 68, 56, 0.4)';

export function HomeHeroOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[2]"
      style={{ backgroundColor: HERO_OVERLAY_COLOR }}
      aria-hidden
    />
  );
}
