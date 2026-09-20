/* geo-map.js — the geographic view: where the story lived and where it spread.
 *
 * A pure-SVG map of South & Southeast Asia (no external tiles). Every node with a
 * place is plotted; diffusion ARCS fan out from the undivided-India heartland
 * (the epics' homeland — today's India, Pakistan, Nepal, Bangladesh & Sri Lanka)
 * to each place the story travelled, coloured by track. Original; all sites cited
 * in their nodes. Equirectangular projection over an Asia bounding box. */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

// bounding box of the view (lon/lat) — India west edge to Japan, Java to Himalaya
const BOX = { lonMin: 66, lonMax: 142, latMin: -10, latMax: 42 };
const VW = 1000, VH = Math.round(VW * (BOX.latMax - BOX.latMin) / (BOX.lonMax - BOX.lonMin));

const proj = (lat, lon) => ({
  x: ((lon - BOX.lonMin) / (BOX.lonMax - BOX.lonMin)) * VW,
  y: (1 - (lat - BOX.latMin) / (BOX.latMax - BOX.latMin)) * VH,
});

// the epics' heartland — undivided India (the subcontinent). Origin of the arcs.
const HEARTLAND = { name: "Undivided India (the subcontinent) — the story's homeland", lat: 24.5, lon: 80 };

const TRACK_HUE = { proof: "var(--stance-scholarship)", reception: "var(--accent)", text: "var(--stance-scholarship)", tradition: "var(--stance-tradition)", story: "var(--accent)" };

// a very lightweight landmass hint: a few filled blobs so places sit on "land"
// rather than a void. Not a precise coastline — an evocative backdrop.
const LAND = [
  // Indian subcontinent
  "M 90 250 Q 250 180 330 210 Q 360 280 320 360 Q 280 430 250 470 Q 200 400 170 340 Q 120 300 90 250 Z",
  // Sri Lanka
  "M 250 480 q 18 6 14 30 q -14 10 -22 -6 q -4 -18 8 -24 Z",
  // SE Asia mainland (Indochina)
  "M 470 250 Q 560 230 600 280 Q 620 360 580 420 Q 540 380 520 340 Q 480 300 470 250 Z",
  // Malay/Java arc
  "M 520 470 Q 600 450 700 475 Q 760 495 690 520 Q 590 515 520 500 Z",
  // China landmass
  "M 560 120 Q 720 90 860 140 Q 900 210 840 250 Q 720 230 640 220 Q 580 190 560 120 Z",
  // Japan
  "M 900 170 q 30 -20 40 10 q 6 40 -18 60 q -26 -10 -30 -40 q -2 -22 8 -30 Z",
];

export function renderGeoMap(root, nodes, onOpen) {
  const placed = nodes.filter((n) => n.place && typeof n.place.lat === "number");
  const origin = proj(HEARTLAND.lat, HEARTLAND.lon);

  // diffusion arcs from the heartland to each place (quadratic, bowed outward)
  const arcs = placed.map((n, i) => {
    const p = proj(n.place.lat, n.place.lon);
    const mx = (origin.x + p.x) / 2, my = (origin.y + p.y) / 2 - Math.hypot(p.x - origin.x, p.y - origin.y) * 0.18;
    return `<path d="M ${origin.x} ${origin.y} Q ${mx} ${my} ${p.x} ${p.y}" class="geo-arc" style="--i:${i};stroke:${TRACK_HUE[n.track] || "var(--accent)"}"/>`;
  }).join("");

  const pins = placed.map((n, i) => {
    const p = proj(n.place.lat, n.place.lon);
    const contested = n.date && n.date.confidence === "contested";
    return `<g class="geo-pin${contested ? " is-contested" : ""}" data-id="${esc(n.id)}" style="--i:${i}" transform="translate(${p.x},${p.y})">
      <circle class="geo-halo" r="16"/>
      <circle class="geo-dot" r="5" style="fill:${TRACK_HUE[n.track] || "var(--accent)"}"/>
      <text class="geo-label" y="-12">${esc((n.place.name || n.title).split(/[,(]/)[0])}</text>
    </g>`;
  }).join("");

  const land = LAND.map((d) => `<path d="${d}" class="geo-land"/>`).join("");

  root.innerHTML = `
    <div class="geo-map">
      <div class="geo-head">
        <h2>Where the story lived — and where it travelled</h2>
        <p>From <strong>undivided India</strong> (the subcontinent — the epics' homeland) the Rāmāyaṇa spread across Asia with trade and Buddhism. Each pin is a place cited in a node; arcs fan out from the heartland. Colour = track (gold reception · blue evidence/text). Tap a pin to open it.</p>
      </div>
      <svg class="geo-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Map of the Ramayana's spread across Asia">
        <rect x="0" y="0" width="${VW}" height="${VH}" class="geo-sea"/>
        <g class="geo-graticule">
          ${[70,90,110,130].map(lon => { const x = proj(0,lon).x; return `<line x1="${x}" y1="0" x2="${x}" y2="${VH}"/>`; }).join("")}
          ${[0,15,30].map(lat => { const y = proj(lat,0).y; return `<line x1="0" y1="${y}" x2="${VW}" y2="${y}"/>`; }).join("")}
        </g>
        ${land}
        <g class="geo-arcs">${arcs}</g>
        <g class="geo-origin" transform="translate(${origin.x},${origin.y})">
          <circle r="26" class="geo-origin-halo"/>
          <circle r="7" class="geo-origin-dot"/>
          <text y="30" class="geo-origin-label">Undivided India — homeland</text>
        </g>
        <g class="geo-pins">${pins}</g>
      </svg>
      <p class="geo-legend">
        <span class="lg" style="background:var(--accent)"></span> reception / retelling
        <span class="lg" style="background:var(--stance-scholarship)"></span> proof / textual
        <span class="lg is-contested"></span> contested
        &nbsp;·&nbsp; the heartland is <em>undivided India</em> (India · Pakistan · Nepal · Bangladesh · Sri Lanka); modern borders are not drawn.
      </p>
    </div>`;

  root.querySelectorAll(".geo-pin").forEach((el) =>
    el.addEventListener("click", () => onOpen(el.dataset.id)));
}
