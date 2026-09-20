/* ornament.js — original hand-drawn SVG ornament in the SPIRIT of classical
 * Indian illumination (and the reverence of the 1992 "Ramayana: Legend of Prince
 * Rama" art direction) — NOT copied from any film or artwork. Every path here is
 * my own geometry: a lotus, a chakra, a foliate corner, a divider. Used for the
 * illuminated hero border, section plates and rules. Strokes use currentColor so
 * they inherit the gold-leaf accent. */

// an eight-petal lotus (padma) — the seat of the divine in Indian iconography
export const lotus = (size = 44) => `
<svg class="orn orn-lotus" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
    ${Array.from({ length: 8 }, (_, i) => {
      const a = (i * Math.PI) / 4;
      const c = Math.cos(a), s = Math.sin(a);
      // a petal: two arcs meeting at the tip, rooted at centre
      const tx = 50 + c * 40, ty = 50 + s * 40;
      const lx = 50 + Math.cos(a - 0.32) * 22, ly = 50 + Math.sin(a - 0.32) * 22;
      const rx = 50 + Math.cos(a + 0.32) * 22, ry = 50 + Math.sin(a + 0.32) * 22;
      return `<path d="M50 50 Q ${lx} ${ly} ${tx} ${ty} Q ${rx} ${ry} 50 50 Z" ${i % 2 ? 'opacity="0.55"' : ''}/>`;
    }).join("")}
    <circle cx="50" cy="50" r="6.5"/>
    <circle cx="50" cy="50" r="2.4" fill="currentColor"/>
  </g>
</svg>`;

// a chakra / dharma-wheel — spoked ring
export const chakra = (size = 40) => `
<svg class="orn orn-chakra" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round">
    <circle cx="50" cy="50" r="42"/>
    <circle cx="50" cy="50" r="9"/>
    ${Array.from({ length: 16 }, (_, i) => {
      const a = (i * Math.PI) / 8, c = Math.cos(a), s = Math.sin(a);
      return `<line x1="${50 + c * 9}" y1="${50 + s * 9}" x2="${50 + c * 42}" y2="${50 + s * 42}"/>`;
    }).join("")}
    <circle cx="50" cy="50" r="2.6" fill="currentColor"/>
  </g>
</svg>`;

// a foliate corner flourish (place at each corner of an illuminated frame)
export const corner = (size = 64) => `
<svg class="orn orn-corner" width="${size}" height="${size}" viewBox="0 0 100 100" fill="none" aria-hidden="true">
  <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M4 4 L4 40 Q4 4 40 4 Z" opacity="0.35"/>
    <path d="M4 4 C 34 6 46 18 48 48"/>
    <path d="M12 6 C 26 12 30 22 30 34 Q 20 24 10 22"/>
    <path d="M6 12 C 12 26 22 30 34 30 Q 24 20 22 10"/>
    <circle cx="48" cy="48" r="3" fill="currentColor"/>
    <path d="M40 4 q 8 2 10 10" opacity="0.6"/>
    <path d="M4 40 q 2 8 10 10" opacity="0.6"/>
  </g>
</svg>`;

// a horizontal divider: a centred lotus-bud flanked by tapering vines
export const divider = () => `
<div class="orn-divider" aria-hidden="true">
  <svg width="220" height="24" viewBox="0 0 220 24" fill="none">
    <g stroke="currentColor" stroke-width="1.3" stroke-linecap="round" fill="none">
      <path d="M2 12 H 84 M136 12 H 218"/>
      <path d="M84 12 q 8 -9 18 0 q -8 9 -18 0"/>
      <path d="M136 12 q -8 -9 -18 0 q 8 9 18 0"/>
      <path d="M110 3 C 104 8 104 16 110 21 C 116 16 116 8 110 3 Z"/>
      <circle cx="110" cy="12" r="1.8" fill="currentColor"/>
      <path d="M70 12 l -6 -4 M70 12 l -6 4" opacity="0.6"/>
      <path d="M150 12 l 6 -4 M150 12 l 6 4" opacity="0.6"/>
    </g>
  </svg>
</div>`;

// mount an illuminated frame's four corners into a container
export function illuminate(el) {
  if (!el) return;
  const frame = document.createElement("div");
  frame.className = "illum-frame";
  frame.innerHTML = `
    <span class="illum-c tl">${corner()}</span>
    <span class="illum-c tr">${corner()}</span>
    <span class="illum-c bl">${corner()}</span>
    <span class="illum-c br">${corner()}</span>`;
  el.appendChild(frame);
}
