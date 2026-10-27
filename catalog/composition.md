# Compose a RevenueCat scene

Search the installed catalog with `npm run catalog -- paywall` or `npm run catalog -- refund --assets --json`. The default lists native React illustrations and semantic parts. `--assets` lists original SVG/raster fragments. Only IDs actually present in these catalogs can render; unregistered source artwork is not installed.

Every component has a human-readable name and a unique stable ID. For example, `Support subscription phone` maps to `support-subscription-phone`, `Appearance settings panel` to `appearance-settings-panel`, and `Purchases badge` to `purchases-badge`. Resolve the requested component and inspect its editable fields:

```sh
npm run catalog -- --name "Support subscription phone" --describe --json
npm run catalog -- --id appearance-settings-panel --describe --json
```

Use that exact ID in `illustrationId`. Exact selectors fail on missing or ambiguous results; never silently substitute similar artwork. Similar names across source collections do not mean the same component. The description includes supported field keys, types, defaults and limitations from `src/figma/component-contracts.json`.

If the requested object or behavior is absent after checking related entries and parts, explain the gap and offer to build a new reusable component in the style of inspected references. Follow [new component authoring](new-components.md); wait for acceptance unless creation is already explicitly authorized. A new arrangement of existing components can proceed as ordinary composition. Never treat a lookup error as proof that an object is missing.

Catalog metadata `variantFamily` and `variant` distinguish related artwork by platform, language or state. Search `npm run catalog -- sdk-paywall-integration` or `npm run catalog -- sdk-code-example`, then select the exact member ID. They are metadata, not `props`; see [variant notes](variants.md) for the imported families and near-identical source pairs.

The agent authors and renders the complete scene. Studio is optional preview; the user does not assemble layers, fill in props or export files there.

Copy `examples/scene.json` to a new JSON file. The canvas uses pixels; all clips run at 30 fps. `durationFrames: 240` is eight seconds. `posterFrame` selects the PNG's frame. PNG exports at the exact canvas dimensions; MP4 requires an opaque background. Text, positions, layer order and motion are editable independently.

```json
{
  "title": "A new RevenueCat illustration",
  "width": 1200,
  "height": 800,
  "fps": 30,
  "durationFrames": 180,
  "posterFrame": 150,
  "background": "#FFFFFF",
  "layers": [
    {"id": "title", "type": "text", "text": "Make it yours", "x": 64, "y": 54, "width": 1000, "font": "heading", "fontSize": 54},
    {"id": "phone", "type": "illustration", "illustrationId": "support-subscription-phone", "props": {"title": "Annual subscription"}, "x": 220, "y": 220, "scale": 1, "startFrame": 12, "enter": {"type": "slide", "durationFrames": 24, "y": 24}},
    {"id": "controls", "type": "illustration", "illustrationId": "appearance-settings-panel", "props": {"accentColor": "#576CDB"}, "x": 550, "y": 300, "startFrame": 32, "enter": {"type": "scale", "durationFrames": 24, "from": 0.95}}
  ]
}
```

Layer types:

- `native`: `componentId` from `src/native/catalog.ts`; a data-driven native table/chart with structured `props` and dynamic `internalMotion` targets. Read [native data components](native-data.md).

- `illustration`: `illustrationId` from `src/figma/illustrations.json`; full artwork or a semantic component such as a phone, panel, icon or badge. Optional `props` uses that component's declared editable fields.
- `asset`: `assetId` from `src/figma/assets.json` or `src/library/assets.json`; untouched local designer SVG/image.
- `text`: `text`, `width`, optional `font` (`heading`, `body`, `body-light`), `fontSize`, `lineHeight`, `color`, `align`.
- `group`: nested `layers`, sharing a transform and timeline.

Every layer has a unique `id`, optional `x`, `y`, `scale`, `rotation` (degrees), `opacity`, `zIndex`, `startFrame`, `durationFrames`, `enter`, and `float`. Scale/rotation pivot at top left. Children use their group's local coordinates and frame zero. Later layers paint on top unless `zIndex` changes that order. Scale the wrapper uniformly to preserve artwork proportions.

An illustration's optional `data` object controls only declared `embeddedDataSlots`. Keep its exact `illustrationId` and copy slot IDs, props schema and motion targets from `--describe --json`. Inspect actual overrides using `--data embedded-data.json`; the file contains the `data` object only. Slot `internalMotion` belongs inside the slot, separately from illustration-level motion. See [native data](native-data.md).

`examples/embedded-data-components.json` is a complete scene using the `table` slot in `selected-3252-80334` and the `mrr-trend-chart` slot in `selected-3252-74933`. It changes table copy and animates rows, columns, numerical cells and chart points while preserving each surrounding illustration.

For structural changes, table slots accept complete `props.dataset.columns` and `props.dataset.rows`; chart slots accept new-length `props.values` arrays and optional stable `props.pointIds`. The renderer fits data inside the original usable region and validates density, ranges and current IDs. Query `--motion --data <embedded-data.json> --json` after changes. Do not combine a table dataset with sparse cell/column edits, or retain legacy controls targeting removed source table nodes. `examples/embedded-adaptive-data.json` demonstrates automatic layout with changed row, column and point counts.

Component props are sparse: omitted fields retain the source, and two instances may use different props. Native text fields accept strings; scalar CSS color fields accept an approved brand color or their original color; visibility fields accept booleans, with `false` hiding the authored node while retaining layout. Unknown fields, invalid values and conflicting aliases are rejected before rendering. Text length limits do not guarantee fit: typography and layout stay fixed, so inspect the final PNG.

Friendly aliases are component-specific. The phone exposes `title`, `helpText` and action labels; its `accentColor` changes the help-text color. The settings panel's `textColor`, `accentColor` and `buttonColor` change the corresponding swatches, not the entire artwork. The prompt card exposes `title` and `prompt`. Other native fields have generated keys reported by `--describe`; copy those exact keys instead of guessing.

Embedded SVG/raster text and colors, gradients and mixed styled text containers are not universal props. Use supported child fields where available. If an unsupported edit requires a new component or native reconstruction, explain the gap and follow the new-component workflow before implementation unless already authorized. Preserve shared original assets and the requested identity. Visibility and native CSS recoloring do not rewrite SVG paths or make fixed charts represent supplied data.

The integration orbit component `selected-3252-41868` exposes `centralLogo` (type `image`). Put a supplied logo inside the generated project's `public/` directory, then pass a public-relative path such as `"props": {"centralLogo": "brand/client-logo.svg"}`. SVG, PNG, JPEG and WebP are supported. The renderer fits the image proportionally inside the original 71.296 × 71.296 logo area and preserves the white circular pedestal, shadow and surrounding elements. Omit the field or pass an empty string to restore the original logo. Only components with a declared image field support this operation; do not invent image fields for other artwork. Preview and generation reject missing files and paths outside `public/` before rendering. `examples/central-logo-variants.json` demonstrates two independent instances with the original and an existing imported Android mark.

Internal elements of an `illustration` can have independent `internalMotion` tracks. Discover exact targets with `npm run catalog -- --id <id> --motion --json`; use [internal motion](internal-motion.md) for the keyframe API and constraints. No manual Studio assembly is required.

Entrances: `fade`, `slide` (optional x/y travel), or `scale` (`from` defaults to 0.95). Each takes `durationFrames` (default 18) and optional `easing` (`ease-out` by default, or `ease-in-out`). All entrance types also fade in. Floating motion is opt-in and accepts `amplitudeX` (default 0), `amplitudeY` (4), `periodFrames` (180), `phaseDegrees` (0). Movement is deterministic and frame-driven. Hard cuts or overlapping fades between states use `startFrame`/`durationFrames`; see `examples/paywall-workflow.json` and `examples/customer-center.json`. These timings are authored examples; Figma supplied the artwork/storyboard states, not a measured motion timeline.

Read [motion guidance](motion.md) before animating: group related parts, select timings for the medium, preserve subpixel transforms and verify real playback. Static illustrations use PNG export. A scene without `enter`, `float` or `internalMotion` renders directly as a still composition; no video export is required.

```sh
npm run motion:check -- --props examples/custom.json
npm run generate -- --props examples/custom.json --output out/custom
```

`generate` requires a new or empty directory. Its default `--format both` writes `scene.json`, `image.png`, `video.mp4`, `review.html` and `manifest.json`. Use `--format png` for a still image or `--format mp4` for video only; only the requested media files are included. The agent opens the review page, inspects the PNG and plays the MP4, then returns the checked artifacts and editable scene. Use a new output directory for a revision rather than overwriting an existing delivery.

For optional Studio preview, the agent runs `npm run preview -- --composition Scene --props examples/custom.json` and restarts after changing JSON. Bare preview opens the library and bundled examples; external custom JSON does not change that gallery. Recursive scene and component-prop validation runs in the CLI, metadata calculation and renderer. There is no need for the user to operate a Studio field form.

`Scene`, `SceneStill`, `Asset`, `Illustration`, and `Group` are also exported from `src/composition` for authored TSX. Set `composite` on authored `Group`, `Asset` or `Illustration` wrappers whose positions change so movement uses fractional transforms. Static inner artwork does not need it. `FigmaIllustration` accepts `id`, optional validated `props`, `data`, `internalMotion`, `frame` and `durationFrames`; `Illustration` uses `illustrationId` with the same motion inputs. Scene JSON supplies the layer-local frame automatically. Authored TSX must pass its current frame explicitly for motion. Source artwork remains native text/layout plus local original images. Do not claim fixed charts reflect measured data.

Limits: even canvas dimensions from 2 to 3840, 1–1800 frames, at most 200 layers and 8 nested groups. Frames and entrances must fit inside their parent. See `src/composition/schema.mjs` for exact approved color/font choices. Keep generous margins; inspect a PNG and representative early/middle/final frames after composition changes.

`examples/component-variants.json` demonstrates two instances of `support-subscription-phone` with independent text/color props, editable settings swatches, and descendant text/visibility in a composed card. The agent can generate it with `npm run generate -- --props examples/component-variants.json --output out/component-variants`.
