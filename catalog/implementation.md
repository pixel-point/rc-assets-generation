# Implementation coverage

## Browse the complete library

Run `npm run gallery` and open `out/library/index.html`. The gallery is built from `src/figma/illustrations.json`, the same registry used for rendering. Import-review pages named `selected-batch-*` show only one batch. Their illustration and part counters are not library totals.

A registration is an exact selectable component with a stable ID. Registrations include full illustrations, reusable parts and storyboard states. Similar source variants keep separate identities. Native nodes inside a component are animation targets, not additional component registrations. SVG/image asset counts are separate again.

The gallery's PNGs are rendered previews. They do not replace the underlying React components. Search by the exact name or ID, choose a role or source collection, and inspect the card's fields and internal targets. The corresponding command is:

```sh
npm run catalog -- --id <component-id> --describe --json
```

## What can be edited and animated

The library contains three implementation types:

- **Native elements:** HTML/CSS/text with no external image dependencies. This includes small text/fill fragments as well as larger code panels and native UI blocks. Image-free does not mean a component is a general-purpose widget.
- **Native + assets:** Native text/CSS combined with imported SVG or raster fragments. Declared text, color and visibility fields can change independently; eligible native boxes have internal-motion targets. The paths inside an imported fragment remain fixed.
- **Asset-backed:** An asset wrapper without editable native text. This may contain one flattened illustration or several source fragments. Whole-wrapper motion and visibility do not imply editable chart data, table cells or independent SVG paths.

`catalog/implementation.json` records the audited classification and source hashes. The visual gallery hides stale classification if its source files change. A missing/stale classification is not evidence that a component is native.

Supported properties are always determined by the exact component contract. Native color fields are scoped to their source node, and text length is constrained by the original geometry. A component can be positioned independently using an illustration layer; `internalMotion` changes eligible inner boxes while the surrounding component stays still. Use `catalog/internal-motion.md` for the motion contract.

## Native parts extracted from existing illustrations

These blocks have independent registrations and preserve their original source nodes and typography. They reuse native markup from their parent illustration, including editable text and CSS geometry. Small source SVG icons remain local assets where present; no screenshot replaces the native block. The generated contracts expose their actual editable fields and eligible inner-motion targets.

| Component ID | Purpose |
| --- | --- |
| `selected-3252-73135` | Dashboard metric card |
| `selected-3252-73192` | Dashboard navigation tab |
| `selected-3252-72984` | Three-metric summary strip |
| `selected-3252-73023` | Paywall price and action button |
| `selected-3252-73260` | Trial event pill |

Resolve each exact display name and field alias through `npm run catalog` before authoring. Omitted edits retain the original design. These source-derived parts are not a claim that every illustration has been converted into a data-driven UI system.

## Remaining native work

The audit distinguishes available source markup from artwork that arrived flattened. The baseline audit records the source implementation before embedded data adapters. For current table/chart editability, inspect `embeddedDataSlots` on the exact component: a reviewed adapter can replace a fixed source fragment with native data geometry while retaining the original host artwork. A React wrapper alone does not provide those capabilities. The gallery shows **Native data inside** separately from the baseline implementation classification.

Prioritize meaningful native blocks such as metric cards, tables, tabs, buttons and event rows over exposing decorative rectangles as separate components. Maintain stable IDs, source provenance and visual comparisons. The installed catalog is authoritative for available components; private acquisition and implementation backlogs are not part of this distribution.

## Native data components

The source classification above covers the 582 imported registrations. The combined catalog also includes 28 explicit `native-*` table/chart presets rendered entirely from React/SVG primitives. They are shown as **Native data** and expose structured datasets and data-dependent motion targets. See [native data](native-data.md) and [source family coverage](native-data-coverage.json). These are native reconstructions, not additional Figma imports or silent replacements of source artwork.

Embedded data slots retain the original registration ID and do not increase the 610-entry combined catalog. Slot counts, scalar field counts and internal motion targets are separate measures. Default slot contracts live in `src/embedded/contracts.json`; stale snapshots are not treated as evidence of current capabilities.
