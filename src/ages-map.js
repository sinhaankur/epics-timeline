/* ages-map.js — the deep-time "Ages" map: the flagship creative view.
 *
 * A horizontal time axis with archaeological era bands (Bronze Age, Iron Age,
 * Classical, …). Every DATED node is plotted at its real position, so you can SEE
 * where each text-layer, story-event, retelling and — prominently — each PROOF sits
 * in deep time, and which dating METHOD anchors it. "A question of how real things
 * are." Time is compressed with a signed-log scale so 3000 BCE and 2000 CE both fit
 * legibly. Renders from the same nodes.json + ages.json; all cited. */

const LANES = [
  { key: "proof",     label: "Proofs & evidence", marker: "diamond" },
  { key: "text",      label: "Textual history",   marker: "dot" },
  { key: "story",     label: "In-story",          marker: "dot" },
  { key: "reception", label: "Reception",         marker: "dot" },
  { key: "tradition", label: "Traditional",       marker: "ring" },
];

const METHOD_LABEL = {
  archaeology: "Archaeology",
  palaeography: "Palaeography",
  radiocarbon: "Radiocarbon",
  epigraphy: "Epigraphy",
  philology: "Philology",
  archaeoastronomy: "Archaeoastronomy",
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

// signed-log time compression so both deep-BCE and CE fit; returns 0..1
function makeScale(minYear, maxYear) {
  const f = (y) => Math.sign(y) * Math.log10(1 + Math.abs(y));
  const a = f(minYear), b = f(maxYear);
  return (y) => (f(y) - a) / (b - a);
}

function yearOf(n) {
  if (!n.date || typeof n.date.startYear !== "number") return null;
  if (typeof n.date.endYear === "number") return (n.date.startYear + n.date.endYear) / 2;
  return n.date.startYear;
}
const fmtYear = (y) => y < 0 ? `${Math.abs(Math.round(y))} BCE` : `${Math.round(y)} CE`;

export function renderAgesMap(root, nodes, ages, onOpen) {
  const dated = nodes.filter((n) => yearOf(n) !== null);
  const minY = Math.min(-3400, ...ages.map(a => a.startYear), ...dated.map(yearOf));
  const maxY = Math.max(2026, ...ages.map(a => a.endYear), ...dated.map(yearOf));
  const scale = makeScale(minY, maxY);

  // era band strip
  const bands = ages.map((a) => {
    const x0 = scale(a.startYear) * 100, x1 = scale(a.endYear) * 100;
    return `<div class="age-band" style="left:${x0}%;width:${x1 - x0}%;--tint:${a.tint}" title="${esc(a.note)}">
      <span class="age-name">${esc(a.name)}</span>
      <span class="age-range">${fmtYear(a.startYear)} – ${fmtYear(a.endYear)}</span>
    </div>`;
  }).join("");

  // axis ticks at round powers / notable years
  const ticks = [-3000, -2000, -1000, -500, 0, 500, 1000, 1500, 2000]
    .filter((y) => y >= minY && y <= maxY)
    .map((y) => `<span class="axis-tick" style="left:${scale(y) * 100}%">${fmtYear(y)}</span>`).join("");

  // lanes with plotted markers
  const lanesHtml = LANES.map((lane) => {
    const items = dated.filter((n) => n.track === lane.key).sort((a, b) => yearOf(a) - yearOf(b));
    const markers = items.map((n) => {
      const y = yearOf(n);
      const x = scale(y) * 100;
      const contested = n.date && n.date.confidence === "contested";
      const method = n.proof && n.proof.method ? METHOD_LABEL[n.proof.methodKind] || "Method" : null;
      const cls = `map-marker mk-${lane.marker} stance-${n.stance}${contested ? " is-contested" : ""}`;
      // span the range if it's a range
      const range = (n.date.kind === "range" && typeof n.date.endYear === "number")
        ? `<span class="marker-range" style="left:${scale(n.date.startYear) * 100}%;width:${(scale(n.date.endYear) - scale(n.date.startYear)) * 100}%"></span>` : "";
      return `${range}<button class="${cls}" style="left:${x}%" data-id="${esc(n.id)}"
        title="${esc(n.title)} · ${esc(n.date.display)}${method ? " · " + method : ""}">
        <span class="marker-flag">${esc(n.title)}${method ? `<em class="mk-method">${esc(method)}</em>` : ""}</span>
      </button>`;
    }).join("");
    return `<div class="map-lane" data-lane="${lane.key}">
      <div class="lane-label">${esc(lane.label)}</div>
      <div class="lane-track">${markers || '<span class="lane-empty">— undated on this axis —</span>'}</div>
    </div>`;
  }).join("");

  root.innerHTML = `
    <div class="ages-map">
      <div class="age-strip">${bands}</div>
      <div class="axis">${ticks}</div>
      <div class="map-lanes">${lanesHtml}</div>
      <p class="map-legend">
        <span class="lg mk-diamond"></span> proof / evidence
        <span class="lg mk-dot"></span> text · story · reception
        <span class="lg mk-ring"></span> tradition
        <span class="lg is-contested"></span> contested
        &nbsp;·&nbsp; bars show a dated <em>range</em> · hover a marker for its dating method
        &nbsp;·&nbsp; time is signed-log compressed so deep-BCE and CE both fit
      </p>
    </div>`;

  root.querySelectorAll(".map-marker").forEach((el) =>
    el.addEventListener("click", () => onOpen(el.dataset.id)));
}
