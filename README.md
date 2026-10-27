# RevenueCat assets generation

A standalone agent plugin for creating branded illustrations, animations and short videos from the bundled RevenueCat library. The agent selects components, applies supported changes, renders and reviews the files. The employee works through prompts; Remotion Studio is optional.

Version **0.2.1** targets Codex and Claude Code. Distribution repository: [pixel-point/rc-assets-generation](https://github.com/pixel-point/rc-assets-generation). See [validation](VALIDATION.md) for verified runtime checks and remaining host-installation checks.

- [Plugin capabilities and examples](PLUGIN.md)
- [Installation and updates](INSTALL.md)
- [Cloud execution options and service design](CLOUD.md)


Once the repository contains the plugin files, install with your agent or run:

```sh
# Codex
codex plugin marketplace add pixel-point/rc-assets-generation
codex plugin add revenuecat-assets-generation@revenuecat-assets-local

# Claude Code
claude plugin install revenuecat-assets-generation --marketplace pixel-point/rc-assets-generation --scope user
```

In a Claude Code session, the equivalent is `/plugin install revenuecat-assets-generation --marketplace pixel-point/rc-assets-generation`. Host confirmation or a new session may be required. See [INSTALL.md](INSTALL.md) for requirements and verification status.

Supported imported illustrations expose native table/chart slots through `data`, keeping their exact component IDs and surrounding artwork. Ask the agent to inspect `--describe --json` for the available slots, then change values, add or remove table rows/columns, change chart point counts, or animate individual data elements. Tables and plots lay out the new data within their original usable area and reject excessive density. Separate `native-*` presets remain available for new layouts. See [native data components](catalog/native-data.md).

The embedded controls cover 76 original registrations, with 31 direct table adapters, 66 direct chart adapters and one inherited table slot. [The complete embedded-data example](examples/embedded-data-components.json) animates the cohort forecast table `selected-3252-80334` and MRR chart `selected-3252-74933`; the agent can generate it with `npm run generate -- --props examples/embedded-data-components.json --output out/embedded-data-review`.

[The adaptive-data example](examples/embedded-adaptive-data.json) uses six table rows, six columns and ten chart points. The agent authors and generates these changes; Studio remains an optional preview.

A shared skill packages the workflow for Codex and Claude Code. The same runtime serves composed scenes, imported artwork and the original Benchmarks scene.

The bundled library is the available renderable set. It preserves the supplied artwork's geometry and local assets; small antialiasing and shadow-softness differences can occur between design tools and browser rendering. This package does not claim to contain every illustration in the original design collections.

The imported library has 582 registered components: 291 illustrations, 267 reusable parts and 24 storyboard states. Registrations include source variants and decorative parts; they are not 582 distinct native UI primitives. The combined catalog also contains 28 native data presets (11 tables and 17 charts), for 610 entries. Use `npm run catalog` for the available set and [variant families](catalog/variants.md) for related components. Every component retains its exact ID. Inspect the artwork used in each final composition.

The plugin interface, catalog pages, review pages, documentation and metadata use English. Designer-supplied artwork retains its original copy unless a composition explicitly overrides it.

Generated projects need neither website repository access nor a Figma connection. The package is marked `UNLICENSED` pending release terms. Repository availability does not grant additional artwork/font rights or imply a plugin-directory listing.

## Create a project

Prerequisites: Node.js 22 or newer and npm, a writable destination, and network access for dependency/browser downloads. The plugin does not install Node.js itself.

The agent runs the commands in this guide. In an already generated project, skip the creator and plugin-install steps and run generation from that folder. Generated projects contain render source, local assets, examples and component contracts. They omit publisher-only tests, host metadata, acquisition files in `source-designs/`, the importer and the project creator.

From the plugin root, create an independent project (replace the destination with a new absolute path in the user workspace):

```sh
node scripts/create-project.mjs /absolute/new/revenuecat-assets-example --install
cd /absolute/new/revenuecat-assets-example
```

Choose a new destination if that example folder already exists. The creator copies the starter and local assets, then installs pinned dependencies when `--install` is supplied. It does not require a separately installed Remotion skill or plugin. Run setup after native plugin installation and any required new agent session; installation itself is not a bootstrap hook.

For visual browsing, the agent runs `npm run gallery` and opens `out/library/index.html`. This complete catalog includes every registered illustration, reusable part and storyboard state, with search, filters and exact component IDs. The `selected-batch-*` pages are import review subsets; their counters do not represent the full library. PNG thumbnails are preview renders of the underlying components. [Implementation coverage](catalog/implementation.md) explains native layers and fixed asset limits.

For optional inspection, the agent can open `npm run preview`. Studio contains the library and bundled examples: `SelectedShowcase` plays “Build, connect, grow,” and `SelectedOverview` browses the selected artwork separately from `LibraryOverview`. The imported UI illustrations are creative components, not functioning product screens.

## Compose an illustration or video

Search for full illustrations, phones, panels and badges, or search the underlying SVG/image fragments with `--assets`:

```sh
npm run catalog -- paywall
npm run catalog -- --name "Support subscription phone" --describe --json
npm run catalog -- --id appearance-settings-panel --describe --json
npm run catalog -- refund --assets --json
```

The agent resolves a requested component to its exact ID, reads its described fields, and authors a separate scene JSON using `illustration`, `asset`, `text` and nested `group` layers. An illustration layer's optional `data` controls its declared embedded table/chart slots; `props` changes supported native text, scalar CSS colors, visibility and declared image slots for that instance. Fields differ by component; the description gives their keys, defaults and limits. Colors accept the approved palette or that field's original color. Omitted fields preserve the artwork. Outside declared data/image slots, embedded SVG/raster content, gradients and mixed styled text are not universal editable fields; the agent must make a reviewed local variation when the requested change is unsupported. Original asset files remain untouched. The integration orbit `selected-3252-41868` exposes `centralLogo`, a public-relative SVG/PNG/JPEG/WebP path. It replaces only the central logo and keeps the pedestal, shadow and surrounding artwork. See `examples/central-logo-variants.json` and the composition guide.

For motion inside an illustration, query `npm run catalog -- --id selected-3252-72881 --motion --json`. Add `internalMotion` keyframes using exact targets such as `graphLine`, `mrrValue` and `phoneButton`. The complete example `examples/internal-elements.json` keeps the illustration stationary while its line reveals, value counts up and button responds. [Internal motion](catalog/internal-motion.md) explains eligible native boxes, independent instance timelines and fixed SVG-path limits.

The five independently reusable UI blocks are listed in [implementation coverage](catalog/implementation.md). For example, resolve `Dashboard metric card` by name to find its `metricLabel`, `metricValue` and `metricNote` fields. `examples/native-ui-parts.json` demonstrates edited copy/colors, native counters and an inner button response across the extracted parts. Small original SVG icons remain fixed where present.

[The composition guide](catalog/composition.md) documents the schema and component API. [Motion guidance](catalog/motion.md) packages Emil-based choreography and render checks for both agent hosts. No separate Emil skill installation is needed.

```sh
npm run motion:check -- --props examples/scene.json
npm run generate -- --props examples/scene.json --output out/scene
```

`generate` requires a new or empty output directory. Its default `--format both` produces `scene.json`, `image.png`, `video.mp4`, `review.html` and `manifest.json`. Use `--format png` for an image-only request, or `--format mp4` for video only; media files follow the selected format. The agent inspects the PNG and plays the exported video, fixes issues and returns the actual files plus the review page and editable scene. Generation alone does not prove visual approval.

PNG uses the scene's canvas dimensions and `posterFrame`; MP4 uses its duration at 30 fps and needs an opaque background. Motion is deterministic and frame driven. Exports automatically report advisory motion warnings; `motion:check` can also use `--context ui`. Preserve PNG frame capture with concurrency 1 for fractional movement. For optional preview, run `npm run preview -- --composition Scene --props examples/scene.json` and restart it after changing JSON. Remotion may download its render browser on first use.

The bundled `examples/paywall-workflow.json` and `examples/customer-center.json` demonstrate transitions between Figma storyboard states. Their timings are authored examples; no original Figma motion timeline was imported.

`examples/selected-scene.json` composes the new artwork into “Build, connect, grow.” Studio exposes it as `SelectedShowcase`; generation uses the same scene runtime:

```sh
npm run generate -- --props examples/selected-scene.json --output out/selected-scene
```

Example prompt after the skill is available:

> Create a new RevenueCat project. Use “Support subscription phone” with the heading “Annual subscription,” plus the appearance settings panel. Compose a branded 1600 × 900 illustration with a short entrance animation. Generate and check a PNG and an eight-second MP4, and show me the finished files.

## Use the original Benchmarks scene

The existing export defaults remain Benchmarks. `npm run export:png` creates `out/benchmarks.png`; `npm run export:mp4` creates `out/benchmarks.mp4`, a six-second video at 30 fps. The base canvas is 592 × 562; exports are 1184 × 1124.

The default fixture is `examples/benchmarks.json`. Its props are `title`, `description`, `summary`, `category`, and `labels`, an array of exactly six strings. Values supplied by `--props` take priority over Studio's default-props inspector:

```sh
npm run preview -- --composition Benchmarks --props examples/benchmarks.json
npm run export:png -- --props examples/benchmarks.json --output out/custom.png
npm run export:mp4 -- --props examples/benchmarks.json --output out/custom.mp4
```

The agent authors a separate props JSON and runs these legacy Benchmarks export commands directly. The scene-generation command expects a layered scene JSON, not the Benchmarks copy fixture. In optional Studio preview, `Benchmarks` is the animation and `BenchmarksStill` is the readable completed state.

Chart artwork, values and row count are fixed. Copy changes do not make the charts represent supplied data. The source's `5/7 metrics above median` summary is intentionally preserved even though six rows are visible; the summary is editable illustration copy, not a computed statistic. See [the catalog](catalog/benchmarks.json) and [material provenance](THIRD_PARTY_NOTICES.md).

The kit exports PNG/MP4 and supports local Studio playback. It does not include a standalone hosted Player application, a remote rendering service, or a composite SVG export command.

## Install the plugin

Both hosts use `skills/revenuecat-assets-generation/SKILL.md` and the same starter. OpenAI uses root `plugin.json` and `.agents/plugins/marketplace.json`; Claude uses `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`. The package has no MCP server, service login, install hook or remote renderer.

[INSTALL.md](INSTALL.md) contains local development loading, persistent Codex/Claude installation, repository installation, the employee's install prompt, and update behavior. Commands change host settings only when actually run. A fresh session may be required before skill activation.

[CLOUD.md](CLOUD.md) distinguishes a project running in a prepared cloud environment from a shared hosted renderer. Cloud execution is not yet verified for this kit; installing the local plugin does not deploy a service.

## Prepare a distribution

From the publisher checkout, run `npm run package:plugin -- /absolute/new/release-output`. Choose a new or empty output directory outside the publisher. The packager creates a portable plugin directory, a compressed archive and checksums with an inventory. It preserves the runtime, shared skill and both host manifests; publisher acquisition files, generated outputs, dependencies and tests are omitted.

This command only prepares files. It does not publish a repository, register a marketplace, install the plugin or select release terms. The package remains private and `UNLICENSED` until those release decisions are completed. The distribution itself omits the packaging command; its project creator remains available to agents.

## Verify the package

From a generated project:

```sh
npm run typecheck
npm run lint
npm run generate -- --props examples/scene.json --output out/verification
```

Inspect the PNG and play the actual exported video after a visual change. For small moving UI/text also inspect consecutive native-size frames; check the seam for requested loops. Static warnings do not prove visual smoothness. From the publisher's development checkout, also run `npm test` for bootstrap, schema and catalog integrity checks. Generated projects omit publisher-only tests and import tooling.

Use Claude's native manifest validator separately:

```sh
claude plugin validate .claude-plugin/plugin.json
claude plugin validate .claude-plugin/marketplace.json
```

Manifest validation verifies package metadata, not authenticated host installation, skill discovery, project creation or rendering from a fresh agent session. A real host test must install/load the package, discover the skill, create a new project through that skill, revise copy, render the outputs and inspect them. Record these checks separately; do not treat runtime exports as proof of a native plugin test.

See [VALIDATION.md](VALIDATION.md) for checks actually performed and remaining limitations.

## Source and release boundaries

The library is derived from RevenueCat designer-supplied artwork. Private design URLs, acquisition inventories, transfer logs and local verification history are omitted from the distribution. Stable component IDs and source identity needed by runtime lookups remain. They are identifiers, not credentials. Normal creation uses bundled files without access to the design source.

Bundled contact examples use fictional names and reserved `example.com` addresses. The packaging workflow applies the public metadata policy before checksums and archive creation. This repository contains the prepared distribution. Maintainer acquisition records and private validation history are kept separately.

Before public distribution, choose code/artwork license terms, verify font redistribution rights and Remotion licensing, use reviewed versioned releases, and run fresh-user installation tests for each host. The repository location and installation commands are in [INSTALL.md](INSTALL.md). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

`examples/component-variants.json` demonstrates two instances of `support-subscription-phone` with independent text/color props, editable settings swatches, and descendant text/visibility in a composed card. The agent can generate it with `npm run generate -- --props examples/component-variants.json --output out/component-variants`.
