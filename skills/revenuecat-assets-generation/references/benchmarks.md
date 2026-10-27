# Benchmarks scene

Read `../../../catalog/benchmarks.json` relative to this reference file for provenance, canvas/export dimensions and the editable API. The default copy lives at `../../../examples/benchmarks.json`; these paths resolve within the kit when installed, or within a generated project after copying.

Use this scene to illustrate comparing subscription metrics against a category. It combines an editorial heading and paragraph with a metrics card and six chart rows. The exported chart artwork is fixed. The scene does not calculate medians, ranks, conversion rates or chart geometry from props.

| Field | What changes | Length limit |
| --- | --- | --- |
| `title` | Heading, initially Benchmarks | 1–32 characters |
| `description` | Supporting copy | 1–210 characters |
| `summary` | Metrics card summary, initially 5/7 metrics above median | 1–28 characters |
| `category` | Comparison label, initially Education apps | 1–16 characters |
| `labels` | Six row labels, in order | 1–28 characters each |

Default row order: Initial conversion; Trial conversion; Conversion to paying; Monthly churn rate; Refund rate; Realized LTV per customer.

Keep changed copy close to the source length. If a request needs longer copy, first shorten it while preserving meaning; make layout changes in the generated source only when needed and inspect the result. Preserve the supplied fonts, palette, chart shapes and aspect ratio for a copy-only variation.

The base canvas is 592 × 562. Default PNG and MP4 exports are 1184 × 1124. The animation is 180 frames at 30 fps, or six seconds. `BenchmarksStill` displays a readable final state; `Benchmarks` supplies the animation.

Example supported request: “Make a Benchmarks illustration for fitness apps, keeping the existing chart artwork and updating the category copy. Export a PNG and the six-second MP4.”

For requests involving new branded motifs, different quantitative charts or unrelated illustration families, explain which part needs a new library component. Do not misrepresent a copy change as newly designed or measured chart artwork.
