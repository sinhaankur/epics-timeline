/* tree-view.js — the influence / family tree: how the story descends.
 *
 * Vālmīki's Rāmāyaṇa at the root; every retelling that points back to it (via a
 * `retells` / `parallels` / `influenced-by` / `framed-as` link) hangs beneath,
 * arranged left→right by date. A pure-SVG dendrogram with curved connectors, so
 * you can see the LINEAGE — one Sanskrit source flowering into Tamil, Javanese,
 * Khmer, Thai, Lao, Chinese, Japanese and Hindi retellings. Original; cited in
 * the nodes. */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
const midYear = (n) => {
  if (!n.date || typeof n.date.startYear !== "number") return 3000;
  return typeof n.date.endYear === "number" ? (n.date.startYear + n.date.endYear) / 2 : n.date.startYear;
};
const fmtYear = (y) => y < 0 ? `${Math.abs(Math.round(y))} BCE` : `${Math.round(y)} CE`;

// which link relations count as "descends from"
const DESCENT = /retells|parallels|influenced-by|framed-as|retold|derived/;

export function renderTree(root, nodes, onOpen) {
  const byId = (id) => nodes.find((n) => n.id === id);
  const ROOT = "ram-valmiki-composition";
  const rootNode = byId(ROOT);
  if (!rootNode) { root.innerHTML = `<p class="empty">Root text not found.</p>`; return; }

  // children = any node that links (by a descent relation) to the root, OR to a
  // node already in the tree (so Laos→Dāśaratha-Jātaka→root chains work).
  const inTree = new Set([ROOT]);
  const childrenOf = new Map();          // parentId → [childNode]
  let changed = true;
  while (changed) {
    changed = false;
    for (const n of nodes) {
      if (inTree.has(n.id) || !n.links) continue;
      for (const l of n.links) {
        if (DESCENT.test(l.rel) && inTree.has(l.to)) {
          inTree.add(n.id); changed = true;
          if (!childrenOf.has(l.to)) childrenOf.set(l.to, []);
          childrenOf.get(l.to).push(n);
          break;
        }
      }
    }
  }

  // flatten to rows by depth (root=0). Within a depth, sort by date.
  const rows = [];                       // rows[depth] = [nodes]
  const place = (id, depth) => {
    (rows[depth] ||= []).push(byId(id));
    (childrenOf.get(id) || []).sort((a, b) => midYear(a) - midYear(b)).forEach((c) => place(c.id, depth + 1));
  };
  place(ROOT, 0);

  const maxCols = Math.max(...rows.map((r) => r.length));
  const COLW = 220, ROWH = 96, PADX = 30, PADY = 40;
  const VW = Math.max(720, maxCols * COLW + PADX * 2);
  const VH = rows.length * ROWH + PADY * 2;

  // assign x,y per node id
  const posOf = new Map();
  rows.forEach((r, depth) => {
    const total = r.length;
    r.forEach((n, i) => {
      const x = PADX + ((i + 0.5) / total) * (VW - PADX * 2);
      const y = PADY + depth * ROWH;
      posOf.set(n.id, { x, y });
    });
  });

  // connectors: from each child up to its parent (curved)
  const links = [];
  childrenOf.forEach((kids, parentId) => {
    const p = posOf.get(parentId);
    kids.forEach((c) => {
      const q = posOf.get(c.id);
      if (!p || !q) return;
      const my = (p.y + q.y) / 2;
      links.push(`<path d="M ${p.x} ${p.y + 18} C ${p.x} ${my}, ${q.x} ${my}, ${q.x} ${q.y - 18}" class="tree-link"/>`);
    });
  });

  const cardW = 180, cardH = 44;
  const cards = [...posOf.entries()].map(([id, p]) => {
    const n = byId(id);
    const isRoot = id === ROOT;
    const region = n.region ? esc(n.region.split(/[(,]/)[0].trim()) : "";
    const fid = n.fidelity ? `${n.fidelity.value}%` : (isRoot ? "source" : "");
    return `<g class="tree-node${isRoot ? " is-root" : ""}" data-id="${esc(id)}" transform="translate(${p.x - cardW / 2},${p.y - cardH / 2})">
      <rect width="${cardW}" height="${cardH}" rx="8" class="tree-card"/>
      <text x="10" y="18" class="tree-title">${esc(n.title.split(/[—(]/)[0].trim()).slice(0, 26)}</text>
      <text x="10" y="34" class="tree-meta">${fmtYear(midYear(n))}${region ? " · " + region : ""}</text>
      ${fid ? `<text x="${cardW - 10}" y="34" class="tree-fid">${fid}</text>` : ""}
    </g>`;
  }).join("");

  root.innerHTML = `
    <div class="tree-view">
      <div class="tree-head">
        <h2>The family tree — one source, many retellings</h2>
        <p>Vālmīki's Sanskrit Rāmāyaṇa at the root; every retelling that descends from it branches below, by date. The % is each version's rough closeness to Vālmīki. This is lineage, not a claim that later poets copied — many reworked freely.</p>
      </div>
      <div class="tree-scroll">
        <svg class="tree-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Influence tree of the Ramayana">
          <g class="tree-links">${links.join("")}</g>
          <g class="tree-nodes">${cards}</g>
        </svg>
      </div>
    </div>`;

  root.querySelectorAll(".tree-node").forEach((el) =>
    el.addEventListener("click", () => onOpen(el.dataset.id)));
}
