# RevenueCat Assets plugin

Version 0.2.2 targets Codex and Claude Code. Both hosts use one skill, one component library and the same renderer. Source distribution: [pixel-point/rc-assets-generation](https://github.com/pixel-point/rc-assets-generation). Runtime validation and native host activation are recorded separately in [VALIDATION.md](VALIDATION.md).

The employee describes the result in a chat. The agent finds the requested components, creates or revises a scene, renders it, reviews the output and returns the files. No website checkout, Figma access or manual Remotion Studio work is required.

## What is included

| Capability | Current implementation |
| --- | --- |
| Find a specific component | Search by name, exact ID, source, family or variant; inspect supported fields and motion targets. |
| Handle missing components | Check related entries and parts, explain the gap, and offer a named component in the style of inspected references. After acceptance, the agent implements and validates it in the user's project. |
| Browse the library | Generate a searchable local gallery with previews and component IDs. |
| Create illustrations | Compose approved illustrations, reusable parts, native data components, text and groups; export PNG, including transparent backgrounds. |
| Create animations and short videos | Compose deterministic 30 fps scenes; export MP4; control scene timing and the still image's poster frame. |
| Animate internal elements | Use declared targets for individual native elements, text counters, charts, rows and cells. Each instance has its own timeline. |
| Edit component appearance | Change declared text, palette colors, visibility and logo slots. Fields vary by component. |
| Change table/chart data | Edit declared native or embedded data slots, including supported row/column/point counts; layout adapts within the component's usable region. |
| Revise existing work | Reuse the saved scene JSON, exact component IDs and copied project to make focused changes. |
| Preview and export | Produce a review page, PNG/MP4, scene JSON and generation manifest. Studio is an optional developer preview. |
| Validate and review | Check schema, component IDs, supported props and motion before export; the agent inspects the actual output. |

The current catalog has **610 entries**: 291 illustrations, 267 reusable parts, 24 storyboard states and 28 standalone native data presets. These counts include source variants and asset-backed components; they do not describe 610 unique fully native widgets.

Native data is also embedded in **76 imported components** through **98 public slots**. Tables support structural datasets with stable row and column IDs; charts support declared values and point IDs. Each adapter enforces its own density and range limits. More elements must remain readable inside the source design.

The bundled catalog is the starting library and does not claim complete coverage of the original design collections. New objects can be authored in a generated project. They need a working local implementation and registration before generation can use them; there is no universal arbitrary-component layer.

When the requested component or internal behavior is missing, the agent tells the user what is unavailable and proposes its appearance, editable fields and motion using specific existing components as style references. It waits for acceptance unless creation was already authorized, then builds and reviews the addition. New components stay in that project; publishing them to the shared library is a separate request. See [new component authoring](catalog/new-components.md).

## How a request becomes an asset

1. The agent reads the shared skill and resolves the requested component's contract.
   If required functionality is missing, it explains the gap and offers a concrete new component before implementing it.
2. On first use, it creates an independent project and installs the pinned dependencies and rendering browser.
3. It writes a scene JSON using the bundled library, local artwork and fonts.
4. It runs validation and PNG/MP4 generation.
5. It inspects the still image and plays the video when motion changed, fixes problems and returns the finished artifacts.

The scene JSON describes composition, data and timing. React and TypeScript build the visual elements; Remotion renders the frames and encodes the video. The agent operates this workflow through bundled commands. This release does not expose MCP tools or run a background service.

The installed plugin is a template. Creative work happens in a separate writable project, preserving the installed cache. Updating the plugin does not silently change existing projects or their assets.

## Example requests

> Create a RevenueCat illustration using “Support subscription phone.” Change its heading to “Annual subscription,” add a settings panel and export a transparent PNG.

> Use component selected-3252-80334 with a six-row, six-column table and selected-3252-74933 with ten chart points. Animate the table rows and the chart line, keeping the surrounding artwork still. Export a six-second MP4 and a PNG.

> In the previous scene, change the chart values, replace the central logo in the integration orbit and keep the existing composition and timing.

The agent must resolve each named component and its current contract. A requested edit that is not exposed requires a reviewed local implementation change; it is not an invented prop.

## Boundaries of this release

- Imported SVG/raster fragments remain fixed where no native replacement or editable field exists. Internal motion does not imply that every path inside an image can be edited.
- Default chart shapes are illustrative when Figma supplied no underlying dataset. They are not measured product results.
- PNG and MP4 are implemented. Composite SVG, GIF, Lottie, audio generation, a hosted editor and remote rendering are not included.
- A successful render is distinct from visual approval and from a successful native plugin installation.
- Plugin-owned UI and documentation use English. Conversation language can follow the user.

Read [INSTALL.md](INSTALL.md) for host setup, [CLOUD.md](CLOUD.md) for cloud options and [catalog/composition.md](catalog/composition.md) for the scene contract.
