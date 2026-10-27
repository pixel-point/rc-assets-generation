---
name: revenuecat-assets-generation
description: Create RevenueCat brand illustrations and animations from bundled named components, editable native tables/charts, supported text/color/logo props, internal-element motion and custom scene composition. Generate and review finished PNG or MP4 assets in a coding-agent workspace.
---

# RevenueCat assets generation

The plugin bundles local artwork, fonts, a React/Remotion composer, and examples. Creating assets needs no website repository or Figma connection. The installed catalog is the available renderable set. Query `npm run catalog -- --json`; never suggest that unregistered source artwork is installed. Private acquisition inventories are not included.

Handle the complete creative workflow: author the scene, apply supported edits, generate files and inspect the result. Studio is optional preview only. Do not hand assembly, prop editing or export steps back to the user.

Use English for plugin-owned interfaces, catalog labels, search and clipboard messages, review pages, documentation and metadata, regardless of the conversation language. Set generated HTML to `lang="en"`. Preserve designer-supplied artwork copy unless the user requests a copy change.

## Workspace

Resolve the kit root two directories above this skill directory. Create an independent writable project:

```text
node <absolute-kit-root>/scripts/create-project.mjs <absolute-new-project-directory> --install
```

Use a new destination requested by the user or a clearly named folder in their workspace. The script refuses nonempty destinations. Do not edit the installed plugin cache; revise an existing generated project in its own directory. Node.js 22+ and npm are prerequisites. Setup downloads pinned dependencies and the render browser; the plugin does not install a system runtime.

## Choose and compose

Read the generated project's `catalog/composition.md` for the layer contract and [motion guidance](../../catalog/motion.md) before animating. The copied project also contains `catalog/motion.md`; it adapts Emil Design Engineering to this renderer without requiring another skill. Search before choosing IDs:

```sh
npm run catalog -- paywall
npm run catalog -- --name "Support subscription phone" --describe --json
npm run catalog -- --id appearance-settings-panel --describe --json
npm run catalog -- phone --json
npm run catalog -- refund --assets --json
```

The default catalog contains registered React illustrations, storyboard states and reusable parts. Implementations vary: native text/CSS, combinations of native layers and imported assets, or asset-backed wrappers. A registration count is not a count of unique native UI primitives. `--assets` lists SVG/raster fragments. Prefer semantic parts for a new composition: phones, settings panels, badges, prompt cards and charts can have separate positioning and timing. Complete illustrations also retain addressable internal nodes; inspect `--motion --json` before deciding how to animate them. Combine pieces purposefully, preserve proportions and palette, and keep a clear visual hierarchy.

For visual browsing, run `npm run gallery` and open `out/library/index.html`. This is the complete runtime catalog; a `selected-batch-*` gallery covers only one import batch. Gallery PNGs are previews, not implementation layers. Inspect each card's declared fields and internal-motion targets before promising editability. Read `catalog/implementation.md` when distinguishing native parts from fixed artwork.

When the user names a component, resolve its exact ID with `--name` or `--id` and inspect `--describe --json`. Keep that ID in `illustrationId`; never silently substitute similar artwork. Some names occur in both source collections: use the requested source or preview to disambiguate instead of taking the first result. Similar components may expose `variantFamily` and `variant` in catalog metadata. Match the requested platform, language or state; consult `catalog/variants.md` when comparing these families. These are selection metadata, not editable props.

Use the component's declared `props` for native text, scalar CSS colors and visibility. Copy exact keys and observe their scope: a swatch field recolors a swatch, not the whole illustration. Values are sparse and instance-specific; omitted fields preserve the source. Colors accept approved palette values or the field's original color. Embedded SVG/raster content, gradients and mixed styled text are not universal props. When the requested edit lacks a field, inspect and create a local variation that preserves the original assets; do not invent a prop or replace the selected component. Read the composition guide for examples and constraints.

For numerical tables and charts, read `catalog/native-data.md`. First inspect the requested source component’s `embeddedDataSlots` using `--describe --json`. Keep its exact `illustrationId` and author `data[slotId]` with declared `props` and slot-local `internalMotion`; the original surrounding artwork stays in place. Use `--data <embedded-data.json> --motion --json` to inspect targets against the actual slot input. Do not replace the full illustration with a standalone chart. For a new layout, explicit `native-*` alternatives use a `native` layer with `componentId`; inspect their custom data with `--props <component-props.json>`. Animate only declared targets/properties, using `value` for actual numerical geometry and `draw`/`progress` where supported. Keep data IDs stable. Source chart defaults are illustrative when Figma supplies only designed path geometry, not measurements. An unsupported slot remains an explicit gap; never invent a field or silently substitute another component.

Use `examples/embedded-data-components.json` as a complete source-preserving example: `selected-3252-80334` exposes `table`, while `selected-3252-74933` exposes `mrr-trend-chart`. Resolve their current contracts, author the requested scene and run `generate`; do not ask the user to assemble the example in Studio.

When the user changes table structure, author a complete `props.dataset` with stable row/column IDs; do not mix it with sparse `cells`/`columns`. For chart point counts, supply `props.values` and optional stable `props.pointIds`, preserving required parallel-series alignment. Layout adapts within the original usable table/plot area; obey density and range errors instead of hiding overflow. Resolve `--motion --data <embedded-data.json> --json` again so tracks use the current IDs. Remove tracks for deleted IDs and legacy controls on replaced table nodes. Use `examples/embedded-adaptive-data.json` for a complete structural example, then generate, inspect the PNG and play the MP4 yourself.

For a logo replacement, inspect the exact component's image fields. `selected-3252-41868` exposes `centralLogo`: copy the supplied image into the generated project's `public/` directory and pass its relative path in `props`. SVG, PNG, JPEG and WebP fit proportionally in the source logo area; the pedestal and shadow stay intact. Omitted or empty values preserve the original. Use `examples/central-logo-variants.json` and the composition guide; other components have no image slot unless their contract declares one.

Copy `examples/scene.json` to a new props file, preserving bundled examples unless asked to change them. Add `native`, `illustration`, `asset`, `text` or nested `group` layers. Use only catalog IDs and approved colors/fonts. Choose the focal action, related groups and readable holds before assigning motion. Use frame-based entrances; continuous float is opt-in. Group attached parts under one motion rather than animating each independently. Distinguish short UI responses from marketing storytelling. Fixed chart shapes do not represent newly supplied data.

For movement inside an illustration, run `npm run catalog -- --id <exact-id> --motion --json`, choose an existing target alias or canonical key, and author `internalMotion` tracks on that illustration layer. Read `catalog/internal-motion.md` for properties, local timing and examples. Animate a purposeful sequence such as a chart reveal followed by button feedback, keeping the overall illustration still when appropriate. An entrance/exit of the whole illustration does not satisfy a request to animate its contents. Do not invent aliases, treat `display: contents` groups as movable boxes, or treat undeclared SVG fragments as editable chart data. Use declared embedded slots for data-driven geometry. Distinct scene instances can have independent tracks. Check the exported frames to verify that the intended internal targets actually move.

For an image-only request, compose the same layers without motion and generate with `--format png`; a video is optional. Use a transparent canvas when requested. Do not add reduced-motion modes or browser preference handling to generated assets.

For an ordered sequence, adapt `examples/paywall-workflow.json` or `examples/customer-center.json`. Their choreography is authored from Figma storyboard states, not an extracted Figma animation timeline. All scenes run at 30 fps; `posterFrame` picks the static PNG moment.

## Generate and review

Run generation yourself, using a new or empty output directory:

```sh
npm run motion:check -- --props examples/custom.json
npm run generate -- --props examples/custom.json --output out/custom
```

The default `--format both` produces `scene.json`, `image.png`, `video.mp4`, `review.html` and `manifest.json`. Use `--format png` or `--format mp4` for one media type. A manifest records generation, not visual approval. PNG uses exact canvas dimensions and supports transparency; MP4 requires an opaque background.

Open the review page to inspect the requested deliverable. If live preview helps, run `npm run preview -- --composition Scene --props examples/custom.json` yourself and restart it after editing JSON. Bare preview opens the full gallery and examples. Studio is not the author's required editing or export interface.

Resolve unexpected motion warnings or explain intentional choices; use `--context ui` for actual UI transitions. Export also runs marketing checks automatically. Preserve the bundled PNG frame capture and single-page rendering settings, including when using alternate render APIs.

Inspect the PNG for overlaps, clipping, image proportions and text overflow; text length validation does not prove that new copy fits. Play the exported MP4 after motion changes. For small moving UI/text, also inspect consecutive frames at native size for pixel stepping or alternating shifts; check requested loop seams. A clean preflight or a few distant stills cannot prove smoothness. Fix visual issues and regenerate into a new output directory. After TS/TSX changes, run `npm run typecheck` and `npm run lint`. Return the finished media, review page and editable scene/project paths, and state which outputs were checked.

## Benchmarks

For the original six-row Benchmarks feature, use `examples/benchmarks.json`, `catalog/benchmarks.json`, and [the scene reference](references/benchmarks.md). Its editable fields are title, description, summary, category and six row labels. Run the existing `--composition Benchmarks` preview/export commands yourself; `generate` accepts layered scene JSON, not that copy fixture. The default summary says `5/7 metrics above median` despite six rows; it is illustrative copy, not a computed measurement.

## Maintainer boundaries

Normal creation uses installed assets. Design acquisition is a separate maintainer operation outside the installed package. The kit remains a local `UNLICENSED` prototype with host manifests; do not claim public availability or tested native host activation merely because rendering succeeds. Publishing and global host configuration are separate from creating a local asset.
