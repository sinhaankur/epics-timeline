# Data model — the multi-track epics timeline

Every entry in this project is a **node**. A node is one dated (or datable) claim
about the *Rāmāyaṇa* or *Mahābhārata*, placed on one of five **tracks**. The whole
point of the model is that **scholarship and tradition never blur**: each node
declares which track it belongs to, and every node carries its **sources** and, where
it exists, its **proof/evidence**.

Nothing here is presented as settled fact. Academic datings are given as ranges with
the scholars who argue them; traditional/astronomical datings are given as *what the
tradition holds*, labelled as such. The reader is trusted to see both.

## The five tracks

| track | key | what it holds |
|---|---|---|
| Textual / manuscript history | `text` | How the *text itself* came to be: oral composition, layers, recensions, dated manuscripts, critical editions, translations. |
| In-story chronology | `story` | The internal narrative order of events *within* the epic (exile, war, the 18 days of Kurukṣetra…). Not a historical claim — a map of the story. |
| Reception / mentions over time | `reception` | Later works that quote, retell, adapt, or are shaped by the epic — Purāṇas, Kālidāsa, Tulsīdās, Kambaṉ, modern retellings, film. An influence graph through history. |
| Traditional dating | `tradition` | Datings from within the tradition — Yuga chronology, traditional authorship (Vālmīki, Vyāsa), archaeoastronomy claims. **Always labelled as tradition, never as academic consensus.** |
| Proofs / evidence | `proof` | The physical/archaeological/philological anchors people cite as evidence — inscriptions, a dated manuscript, an archaeological site, an astronomical retro-calculation. Each proof states *what it does and does not establish.* |

## Node shape (JSON)

```jsonc
{
  "id": "mbh-critical-edition",           // stable slug, unique across the file
  "epic": "mahabharata",                  // "ramayana" | "mahabharata" | "both"
  "track": "text",                        // one of the five track keys above
  "stance": "scholarship",                // "scholarship" | "tradition" — the honesty flag
  "title": "Bhandarkar critical edition",
  "summary": "One or two neutral sentences. No adjectives that take a side.",

  // Dating. Any of these may be null. Academic datings are RANGES.
  "date": { "kind": "range",              // "range" | "point" | "relative" | "traditional"
            "startYear": 1919,            // negative = BCE
            "endYear": 1966,
            "display": "1919–1966 CE",
            "confidence": "documented",   // "documented" | "scholarly-estimate" | "contested" | "traditional-belief"
            "note": "Publication span of the Poona critical edition." },

  // For the in-story track, order within the narrative instead of a real date.
  "storyOrder": null,                     // integer | null

  // SOURCES — required. At least one. What a claim rests on.
  "sources": [
    { "cite": "Sukthankar, V. S. (ed.), The Mahābhārata (BORI, 1933–66)",
      "kind": "critical-edition",         // book | paper | inscription | manuscript | site | edition | ...
      "url": null }                       // link if it is genuinely public-domain / open
  ],

  // PROOF — optional. Concrete evidence + an honest note on its limits.
  "proof": {
    "what": "A reconstructed archetype from ~1,259 manuscripts collated at BORI, Pune.",
    "establishes": "The oldest recoverable common text — not the 'original' composition.",
    "doesNotEstablish": "That the events happened, nor an absolute composition date."
  },

  // Cross-links to other nodes (influence, supersedes, evidence-for, retells…).
  "links": [ { "to": "mbh-oral-tradition", "rel": "reconstructs" } ],

  "tags": ["recension", "philology"]
}
```

## Rules the data must obey

1. **Every node has ≥1 source.** No source, no node.
2. **`stance` is mandatory** and drives the UI colour/label. A `tradition` node may cite
   a scholarly *study of* the tradition, but the stance stays `tradition`.
3. **Academic dates are ranges** with a `confidence` and the arguing scholars in `sources`.
   Single-year academic "facts" are only for documented events (a publication, an
   inscription's find-date).
4. **Traditional datings** use `"kind": "traditional"` and `"confidence": "traditional-belief"`,
   and their `display` says so (e.g. "Tretā Yuga (traditional)").
5. **A proof states its limits.** `doesNotEstablish` is not optional editorializing —
   it is what keeps the project honest.
6. **Neutral prose.** Summaries describe; they do not argue for a side.

See `nodes.json` for the seed data built to this schema.
