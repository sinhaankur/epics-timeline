# Rāmāyaṇa & Mahābhārata — a cited, multi-track timeline

An open, interactive timeline of the two great Sanskrit epics that keeps **five
things apart on purpose**:

1. **Textual & manuscript history** — how the *text itself* grew: oral roots, layers,
   recensions, dated manuscripts, critical editions.
2. **In-story chronology** — the order of events *within* the narrative (a story map,
   not a historical claim).
3. **Reception over time** — who retold, quoted, or was shaped by the epics down the
   centuries (Purāṇas, Kālidāsa, Kambaṉ, Tulsīdās, and on).
4. **Traditional dating** — what the *tradition* holds (Yuga chronology, traditional
   authorship), always **labelled as tradition**.
5. **Proofs & evidence** — the concrete anchors people cite (a dated manuscript, a
   relief, an inscription) — each with an honest note on **what it does and does not
   establish**.

## The one rule: scholarship and belief never blur

Every node declares a **stance** — `scholarship` or `tradition` — shown in a distinct
colour, and **every node carries at least one source**. Academic datings are given as
**ranges** with the scholars who argue them; traditional and archaeoastronomical
datings are given as *what is claimed*, clearly marked (and, where relevant, as
*contested*). **Nothing here is presented as settled fact.** The reader is trusted to
see both frames side by side.

This is a respectful, non-polemical project. It is not trying to prove or disprove the
historicity of the epics — it is trying to show, honestly, what we know, what the
tradition holds, and how the two relate.

## Run it

No build step — it's a static site (vanilla HTML/CSS/JS + JSON data).

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Serve over http rather than opening `index.html` directly, so the browser can
`fetch` the data file.)

## The data

All content lives in [`data/nodes.json`](data/nodes.json), built to
[`data/SCHEMA.md`](data/SCHEMA.md). One node = one dated (or datable) claim, on one
track, with a stance and its sources.

## Contributing

The most valuable contributions are **better citations, corrections, and new
well-sourced nodes**. The bar is simple:

- **No source, no node.** Every node needs at least one real, checkable source.
- **State the stance.** `scholarship` or `tradition` — and don't dress one as the
  other.
- **Academic dates are ranges** with the arguing scholars named.
- **A proof states its limits.** The `doesNotEstablish` field is required for proofs;
  it's what keeps the project honest.

See `data/SCHEMA.md` for the full node shape.

## Sources the seed data draws on

Mainstream Sanskrit philology and standard reference works, including:

- John Brockington, *The Sanskrit Epics* (Brill, 1998)
- Robert P. Goldman (gen. ed.), *The Rāmāyaṇa of Vālmīki* (Princeton, 1984–2017)
- V. S. Sukthankar et al. (eds.), *The Mahābhārata* (BORI critical edition, 1933–1966)
- Alf Hiltebeitel, *Rethinking the Mahābhārata* (Chicago, 2001)
- Ludo Rocher, *The Purāṇas* (Harrassowitz, 1986)

Traditional datings (Yuga chronology, traditional authorship) are presented as the
tradition's own account, with archaeoastronomy claims marked as contested.

---

© Ankur Sinha. Open for contribution. The scholarship cited belongs to its authors and
is credited in the data; the tradition is presented as tradition.
