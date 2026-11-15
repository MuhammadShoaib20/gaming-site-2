// Fixed, decorative-only 3D background for the public site.
// Pure CSS (no canvas/WebGL, no animation loop) so it stays fast and cheap to
// paint: a perspective "arena floor" grid plus a couple of slow-drifting glow
// orbs in the brand colors. aria-hidden + pointer-events:none so it never
// affects layout, SEO, or interaction, and it freezes under
// prefers-reduced-motion.
export default function BackgroundDecor() {
  return (
    <div className="bg-decor-3d" aria-hidden="true">
      <span className="bg-decor-orb bg-decor-orb-a" />
      <span className="bg-decor-orb bg-decor-orb-b" />
      <span className="bg-decor-orb bg-decor-orb-c" />
      <div className="bg-decor-grid-wrap">
        <div className="bg-decor-grid" />
      </div>
    </div>
  );
}
