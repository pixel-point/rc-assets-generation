# Missing components and new component authoring

Use this workflow when a requested object, variant or internal behavior cannot be supplied by the current project library. It applies to the installed skill and to work continued directly in a generated project.

## Establish the gap

Search the main catalog with related terms and synonyms, then inspect promising exact IDs with `--describe --json` and `--motion --json`. Search `--assets --json` when a reusable fragment could help. Search terms are matched against metadata, not visual meaning, so use the gallery or relevant source/preview to resolve uncertain matches. A new scene made from existing parts is ordinary composition, even if that complete scene has never existed before.

Distinguish three outcomes:

- An existing component or composition satisfies the request: use it and its supported controls.
- A close reference exists, but the required object or behavior is missing: explain the specific gap and offer a new component or native reconstruction. A flat image of an object does not satisfy a request to animate its internal parts.
- Coverage cannot be checked because loading, dependencies or tools failed: fix or report the inspection problem. Do not call it an absent component.

If an exact name or ID fails, check related names before declaring absence; do not silently switch to a nearby ID. Describe a gap as a limitation of the current installed/project library, not proof that no such design exists anywhere.

## Offer a concrete addition

Respond in the conversation language. Keep plugin-owned names, metadata, documentation and review UI in English. Briefly state:

1. What is missing and what the closest usable references can already do.
2. A proposed English component name and a project-local ID, explicitly labeled as proposed, with its appearance and the existing references that will guide it.
3. The useful editable fields and internal elements to animate, plus the requested PNG/MP4 preview.
4. An offer to implement it in the user's project. Wait for acceptance before creating the missing component. An earlier explicit instruction such as "create anything that is missing" already grants this permission; do not ask again.

For example, after actually checking the library:

> I could not find a reusable warehouse conveyor in the current library. I can create a new "Warehouse conveyor" component, using [verified reference name and ID] for its shapes and shadows and [verified reference name and ID] for its palette. It would expose parcel count and label text, with separate motion for the belt and parcels. Would you like me to build it and show a preview?

Replace the bracketed references with inspected entries; never present these placeholders as real IDs. A relevant alternative may be offered, but it is not an automatic substitution. If the user declines, keep the gap explicit and ask for an acceptable alternative only when it blocks the requested result. Independent work on available scene elements can continue while a decision is pending.

## Build after acceptance

Work in the independent generated project, preserving the installed plugin cache and original imported assets. Record a meaningful name, unique project-local ID (for example, `custom-warehouse-conveyor`), purpose, props, defaults, limits, supported motion and the actual reference IDs. Mark the provenance as newly authored; do not fabricate Figma file keys, node IDs or designer approval. Keep an example and a short local usage entry so a later agent can reuse it.

Inspect a small set of relevant library previews and their implementation. Derive proportions, corner radii, stroke treatment, spacing, shadows and depth from those references. Reuse the approved palette and font definitions in `src/composition/schema.mjs`, the local font loading in `src/fonts.ts`, and [motion guidance](motion.md). Reuse existing parts where appropriate. Style matching needs visual comparison; using brand colors alone does not establish it.

Choose an implementation that supports the accepted controls:

- A reusable arrangement of existing parts can be authored with the current scene/group contract and saved as a documented scene fragment or a TSX composition helper.
- A new static vector can live in `public/custom/` and be registered in `src/library/assets.json` with an ID, name, `src`, intrinsic width/height, tags and a distinct family such as `authored`. Use the existing `asset` layer and `catalog --assets` to find it. This route supports asset/group motion, not editable props or independent paths, and it does not add a main-gallery illustration registration.
- For editable objects or internal animation, implement a reusable React/SVG component with separate semantic elements and deterministic frame-driven controls. Keep text/data native. Integrate and validate the required project renderer, contract and discovery path before using its ID in a scene. The shipped `native` layer only handles table/chart presets and the `illustration` layer uses the imported registry; neither accepts arbitrary TSX just because a file was added. If a new registry/layer is needed, implementing its schema, runtime lookup, CLI validation/catalog and preview/export support is part of the accepted coding work. Do not weaken existing ID validation or place fake Figma identities into the imported registry to bypass it.

Use layer-local frame values, declare only motion properties the renderer implements, and include new component/resource files in preview-cache fingerprints. The proposal is an agent coding workflow, not an already installed universal component factory. The current export helper only accepts `Scene` and `Benchmarks`; custom integration must remain compatible with these or explicitly implement and check any extended export path. Do not promise `generate` support before it actually works.

Validate default props, requested overrides and independent instances. After code changes, run typecheck and lint, check relevant schema/contract behavior, render the requested media and inspect the result alongside the chosen references. Play the MP4 when motion is requested and inspect consecutive frames of small moving details. Fix clipping, overflow, inconsistent styling and motion artifacts before delivery. Return the reusable source, local name/ID, usage example, editable scene and checked PNG/MP4/review files, distinguishing any remaining limitations.

Creation in a project does not update the installed cache or publish the component to the shared public library. Offer shared-library promotion separately when useful; it requires an explicit request and its own review.
