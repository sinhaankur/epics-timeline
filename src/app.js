/* Rāmāyaṇa & Mahābhārata — a cited, multi-track timeline.
 * ES module, no build step. Loads data/nodes.json (+ ages.json) and renders it
 * two ways: the TRACK LIST (grouped by track) and the AGES MAP (deep-time
 * horizontal map), toggled in the header. Scholarship vs tradition stay visibly
 * distinct; every detail view shows sources and the proof + its limits.
 * All original; the scholarship is cited to its authors in the data. */

import { renderAgesMap } from "./ages-map.js";
import { renderGeoMap } from "./geo-map.js";
import { renderTree } from "./tree-view.js";
import { lotus, chakra, divider, illuminate } from "./ornament.js";
import { SCENES, mountScene } from "./story-scene.js";

// mount the illuminated hero ornament. The centrepiece is a REAL Blender-baked
// carved lotus/chakra relief (public/img/art/lotus-medallion.png — our own
// geometry + Cycles lighting), flanked by the original SVG chakras.
function mountOrnament() {
  const crown = document.getElementById("hero-crown");
  if (crown) crown.innerHTML =
    `${chakra(30)}<img class="crown-medallion" src="public/img/art/lotus-medallion.png" alt="Carved lotus-chakra medallion (baked relief)" width="120" height="120" />${chakra(30)}`;
  const legend = document.querySelector(".honesty-legend");
  if (legend) legend.insertAdjacentHTML("afterend", divider());
  illuminate(document.querySelector(".ed-hero.illum"));
}

const TRACKS = [
  { key: "text",       title: "Textual & manuscript history", desc: "How the text itself grew — oral roots, layers, recensions, critical editions." },
  { key: "story",      title: "In-story chronology",          desc: "The order of events within the narrative. A story map, not a history claim." },
  { key: "reception",  title: "Reception over time",          desc: "Who retold, quoted, or was shaped by the epic, down the centuries." },
  { key: "tradition",  title: "Traditional dating",           desc: "What the tradition holds — Yuga chronology, traditional authorship. Labelled as tradition." },
  { key: "proof",      title: "Proofs & evidence",            desc: "The concrete anchors people cite — with an honest note on what each does and does not establish." },
];

const state = { epic: "all", track: "all", stance: "all", view: "map", nodes: [], ages: [] };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

async function load() {
  try {
    const [nres, ares] = await Promise.all([fetch("data/nodes.json"), fetch("data/ages.json")]);
    const data = await nres.json();
    state.nodes = data.nodes || [];
    state.ages = (await ares.json()).ages || [];
  } catch (e) {
    document.getElementById("timeline").innerHTML =
      `<p class="empty">Could not load the data. Serve this folder over http (e.g. <code>python3 -m http.server</code>) rather than opening the file directly.</p>`;
    return;
  }
  mountOrnament();
  wireFilters();
  wireViewToggle();
  render();
}

function passes(n) {
  if (state.epic !== "all" && n.epic !== state.epic && n.epic !== "both") return false;
  if (state.track !== "all" && n.track !== state.track) return false;
  if (state.stance !== "all" && n.stance !== state.stance) return false;
  return true;
}

/* sort: story track by narrative order; everything else by start year ascending
 * (undated / traditional-without-year sink to the end). */
function sortNodes(list, trackKey) {
  const yr = (n) => (n.date && typeof n.date.startYear === "number") ? n.date.startYear : Infinity;
  return [...list].sort((a, b) => {
    if (trackKey === "story") return (a.storyOrder ?? 1e9) - (b.storyOrder ?? 1e9);
    return yr(a) - yr(b);
  });
}

function render() {
  const root = document.getElementById("timeline");
  const shown = state.nodes.filter(passes);
  if (!shown.length) { root.innerHTML = `<p class="empty">No nodes match these filters.</p>`; return; }

  if (state.view === "map") { renderAgesMap(root, shown, state.ages, openSheet); return; }
  if (state.view === "geo") { renderGeoMap(root, shown, openSheet); return; }
  if (state.view === "tree") { renderTree(root, state.nodes, openSheet); return; }

  const tracksToShow = state.track === "all" ? TRACKS : TRACKS.filter((t) => t.key === state.track);
  let html = "";
  for (const tr of tracksToShow) {
    const inTrack = sortNodes(shown.filter((n) => n.track === tr.key), tr.key);
    if (!inTrack.length) continue;
    html += `<section class="track-block">
      <div class="track-head"><h2>${esc(tr.title)}</h2><span class="track-desc">${esc(tr.desc)}</span></div>
      <div class="track-rail">${inTrack.map(nodeCard).join("")}</div>
    </section>`;
  }
  root.innerHTML = html || `<p class="empty">No nodes match these filters.</p>`;
  root.querySelectorAll(".node").forEach((el) =>
    el.addEventListener("click", () => openSheet(el.dataset.id)));
}

function nodeCard(n) {
  const conf = n.date && n.date.confidence;
  const dateStr = n.date ? esc(n.date.display) : "";
  const order = (n.track === "story" && n.storyOrder != null) ? `<span class="node-order">step ${n.storyOrder}</span>` : "";
  const stanceTag = n.stance === "tradition"
    ? `<span class="stance-tag stance-tradition">tradition</span>`
    : `<span class="stance-tag stance-scholarship">scholarship</span>`;
  const contested = conf === "contested" ? `<span class="stance-tag conf-contested">contested</span>` : "";
  const proof = n.proof
    ? `<span class="has-proof">◆ <b>proof:</b> ${esc(n.proof.establishes)}</span>` : "";
  const thumb = n.image
    ? `<div class="node-art"><img src="${esc(n.image.src)}" alt="${esc(n.image.alt)}" loading="lazy" /></div>` : "";
  return `<article class="node${n.image ? " has-art" : ""}" data-id="${esc(n.id)}" data-stance="${esc(n.stance)}" data-confidence="${esc(conf||"")}">
    ${thumb}
    <div class="node-textcol">
      <div class="node-top">
        ${dateStr ? `<span class="node-date">${dateStr}</span>` : ""}
        ${order} ${stanceTag} ${contested}
      </div>
      <h3>${esc(n.title)}</h3>
      <p>${esc(n.summary)}</p>
      ${proof}
    </div>
  </article>`;
}

/* ---------- detail sheet ---------- */
function openSheet(id) {
  const n = state.nodes.find((x) => x.id === id);
  if (!n) return;
  const byId = (x) => state.nodes.find((y) => y.id === x);

  const sources = n.sources.map((s) =>
    `<p class="src">${s.url ? `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.cite)}</a>` : esc(s.cite)}
      <span class="kind">${esc(s.kind || "source")}</span></p>`).join("");

  const proof = n.proof ? `
    <section>
      <h4>Proof — and its limits</h4>
      <p class="proof-row"><span class="k">what it is</span>${esc(n.proof.what)}</p>
      <p class="proof-row"><span class="k">establishes</span>${esc(n.proof.establishes)}</p>
      <p class="proof-row limit"><span class="k">does <em>not</em> establish</span>${esc(n.proof.doesNotEstablish)}</p>
    </section>` : "";

  const links = (n.links && n.links.length) ? `
    <section class="links">
      <h4>Connections</h4>
      ${n.links.map((l) => { const t = byId(l.to); return t
        ? `<a href="#" data-goto="${esc(l.to)}"><span class="rel">${esc(l.rel)} →</span> ${esc(t.title)}</a>` : ""; }).join("")}
    </section>` : "";

  const fidelity = n.fidelity ? `
    <section>
      <h4>Closeness to Vālmīki${n.region ? ` · ${esc(n.region)}` : ""}</h4>
      <div class="fidbar" title="${esc(n.fidelity.note)}">
        <div class="fidbar-fill" style="width:${Math.max(0, Math.min(100, n.fidelity.value))}%"></div>
        <span class="fidbar-num">${n.fidelity.value}%</span>
      </div>
      <p class="note">${esc(n.fidelity.note)}</p>
    </section>` : "";

  // the actual ŚLOKA (verse) — Devanagari + IAST + translation + exact reference,
  // so a claim is verifiable at the verse level ("we need to be sure").
  const verse = n.verse ? `
    <section class="verse-sec">
      <h4>The verse · ${esc(n.verse.ref)}</h4>
      <p class="verse-dev">${esc(n.verse.devanagari).replace(/\n/g, "<br/>")}</p>
      <p class="verse-iast">${esc(n.verse.iast)}</p>
      <p class="verse-tr">“${esc(n.verse.translation)}”</p>
      <p class="verse-src">${esc(n.verse.source)}</p>
    </section>` : "";

  const dateNote = (n.date && n.date.note) ? `<p class="note">${esc(n.date.note)}</p>` : "";
  const stanceLabel = n.stance === "tradition"
    ? `<span class="chip chip-tradition">tradition</span>`
    : `<span class="chip chip-scholarship">scholarship</span>`;

  // an ANIMATED story scene plays as the hero for in-story beats (Phase 3) — in
  // the reverent spirit of the 1992 film. Falls back to the static painting.
  const hasScene = !!SCENES[n.id];
  const scene = hasScene ? `
    <figure class="sheet-scene">
      <canvas class="scene-canvas" data-scene="${esc(n.id)}"></canvas>
      <figcaption>An original animation of this moment — art in the spirit of classical Indian painting.</figcaption>
    </figure>` : "";

  const art = (!hasScene && n.image) ? `
    <figure class="sheet-art">
      <img src="${esc(n.image.src)}" alt="${esc(n.image.alt)}" />
      <figcaption>${esc(n.image.credit)}${n.image.sourceUrl ? ` · <a href="${esc(n.image.sourceUrl)}" target="_blank" rel="noopener">source</a>` : ""}</figcaption>
    </figure>` : "";

  const sheet = document.getElementById("sheet");
  sheet.innerHTML = `
    <button class="close" aria-label="Close">×</button>
    <div>${stanceLabel}</div>
    <h3>${esc(n.title)}</h3>
    ${n.date ? `<p class="sheet-date">${esc(n.date.display)}</p>` : ""}
    ${dateNote}
    ${scene}
    ${art}
    <p class="sheet-summary">${esc(n.summary)}</p>
    ${verse}
    ${fidelity}
    <section>
      <h4>Sources</h4>
      ${sources}
    </section>
    ${proof}
    ${links}
  `;
  sheet.hidden = false;
  document.getElementById("scrim").hidden = false;
  sheet.querySelector(".close").onclick = closeSheet;
  sheet.querySelectorAll("[data-goto]").forEach((a) =>
    a.addEventListener("click", (e) => { e.preventDefault(); openSheet(a.dataset.goto); }));
  // bring the animated scene to life (once the canvas has a measured size)
  const cv = sheet.querySelector(".scene-canvas");
  if (cv && SCENES[cv.dataset.scene]) {
    requestAnimationFrame(() => mountScene(cv, SCENES[cv.dataset.scene]));
  }
}
function closeSheet() {
  document.getElementById("sheet").hidden = true;
  document.getElementById("scrim").hidden = true;
}

/* ---------- filters ---------- */
function wireFilters() {
  document.querySelectorAll(".filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dim = btn.dataset.filter, val = btn.dataset.value;
      state[dim] = val;
      document.querySelectorAll(`.filter[data-filter="${dim}"]`).forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      render();
    });
  });
  document.getElementById("scrim").addEventListener("click", closeSheet);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); });
}

/* ---------- view toggle (Ages map ⇄ track list) ---------- */
function wireViewToggle() {
  document.querySelectorAll(".view-toggle button").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.view = btn.dataset.view;
      document.querySelectorAll(".view-toggle button").forEach((b) => b.classList.toggle("is-on", b === btn));
      // the track filter only applies to the list view; show a hint by leaving it
      render();
    });
  });
}

load();
