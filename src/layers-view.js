/* layers-view.js — "Signal vs accretion": how much of each epic is the early
 * recoverable core, and how much was added later. A stacked bar per epic
 * (segment width = share of the text), coloured by scholarly confidence, with a
 * per-segment breakdown on click. A map of confidence, NOT a verdict on truth —
 * and the tradition's own (single-author) view is kept separate, not blurred. */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));

const CONF_COLOR = {
  core:     "var(--stance-scholarship)",   // early core — the cool, grounded blue
  grew:     "#6f8f6a",                      // grew with the text — muted green
  added:    "var(--accent)",               // later addition — the gold accent
  regional: "var(--gupta-rose, #d98a6a)",  // regional accretion — warm rose
  unknown:  "var(--muted-foreground)",     // unknowable — grey
};

export function renderLayers(root, data) {
  const scale = data.meta.confidenceScale;
  const colorOf = (k) => CONF_COLOR[k] || "var(--muted-foreground)";

  const epics = data.epics.map((ep) => {
    const segs = ep.layers.map((l) => `
      <button class="lay-seg" style="flex:${l.share};--c:${colorOf(l.confidence)}"
        data-epic="${esc(ep.epic)}" data-id="${esc(l.id)}"
        title="${esc(l.name)} — ${esc(l.share)}%">
        <span class="lay-seg-fill"></span>
        <span class="lay-seg-label">${esc(l.name)}<em>${esc(l.share)}%</em></span>
      </button>`).join("");
    return `<section class="lay-epic" data-epic="${esc(ep.epic)}">
      <div class="lay-epic-head">
        <h3>${esc(ep.title)}</h3><span class="lay-whole">${esc(ep.whole)}</span>
      </div>
      <div class="lay-bar">${segs}</div>
    </section>`;
  }).join("");

  const legend = scale.map((s) =>
    `<span class="lay-key"><span class="lay-key-dot" style="background:${colorOf(s.key)}"></span>${esc(s.label)}</span>`).join("");

  root.innerHTML = `
    <div class="layers-view">
      <div class="lay-head">
        <h2>How much is early — and how much was added</h2>
        <p>${esc(data.meta.note)}</p>
      </div>
      ${epics}
      <p class="lay-legend">${legend}</p>
      <div class="lay-detail" id="lay-detail" hidden></div>
    </div>`;

  const detail = root.querySelector("#lay-detail");
  const byId = (epic, id) => {
    const e = data.epics.find((x) => x.epic === epic);
    return e && e.layers.find((l) => l.id === id);
  };
  root.querySelectorAll(".lay-seg").forEach((el) => {
    el.addEventListener("click", () => {
      const l = byId(el.dataset.epic, el.dataset.id);
      if (!l) return;
      root.querySelectorAll(".lay-seg").forEach((s) => s.classList.toggle("is-active", s === el));
      const conf = scale.find((s) => s.key === l.confidence);
      detail.hidden = false;
      detail.innerHTML = `
        <div class="lay-detail-tag" style="--c:${colorOf(l.confidence)}">${esc(conf ? conf.label : l.confidence)} · ${esc(l.share)}% of the text</div>
        <h4>${esc(l.name)}</h4>
        <p class="lay-what">${esc(l.what)}</p>
        <p class="lay-why"><strong>Why placed here:</strong> ${esc(l.why)}</p>
        <p class="lay-src">${esc(l.source)}</p>`;
      detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });
}
