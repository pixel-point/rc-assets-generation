# Animate inside an illustration

An imported illustration retains its native text, layout and source image fragments. `internalMotion` animates supported native elements without extracting, redrawing or repositioning the whole illustration. The agent authors these tracks and exports the PNG/MP4; Studio is optional viewing.

## Discover exact targets

```sh
npm run catalog -- --id selected-3252-72881 --motion --json
```

The result lists `motionTargets`: labels, exact source node IDs, supported properties and optional friendly aliases. Select by an alias such as `graphLine` or by its canonical `node:3252:72975` key. Names are component-specific. Every imported native component is scanned for eligible targets; only selected semantic targets have curated short aliases. Never infer a target from a similarly named component.

`selected-3252-72881` includes `codeCard`, `graph`, `graphPlot`, `graphLine`, `subscriberCount`, `trialCount`, `mrrValue`, `phone`, `phoneImage`, `phoneHeadline`, and `phoneButton`. The graph and phone can stay fixed while their contents change. Query the current contract to see which properties each supports.

```json
{
  "id": "paywall-story",
  "type": "illustration",
  "illustrationId": "selected-3252-72881",
  "x": 220,
  "y": 170,
  "scale": 1.6,
  "internalMotion": [
    {"target":"graphLine","property":"revealX","easing":"ease-in-out","keyframes":[{"frame":15,"value":0},{"frame":75,"value":1}]},
    {"target":"phoneButton","property":"scale","easing":"ease-in-out","keyframes":[{"frame":84,"value":1},{"frame":89,"value":0.96},{"frame":95,"value":1}]}
  ]
}
```

This illustration layer has no whole-component entrance or float. It must last at least 96 frames. `examples/internal-elements.json` is the complete authored demonstration.

## Properties and timing

| Property | Value |
| --- | --- |
| `translateX`, `translateY` | Fractional pixels in the element's parent coordinate space |
| `rotate` | Degrees relative to the authored transform |
| `scale` | Relative scale, `1` preserves the source |
| `opacity` | Multiplier, `0…1`, preserving source opacity |
| `revealX`, `revealY` | `0…1` clipping reveal from left/top, only for eligible boxes |
| `counter` | Number interpolated into a fixed-width literal-text field |

Only properties listed on the target are accepted. Tracks need 2–100 keyframes with strictly increasing integer frame numbers. Frames are local to the illustration layer: frame 0 starts at its `startFrame`, including within nested groups. Every keyframe must be before the end of that layer. Each track holds its first value before its first keyframe and its last value afterward. A track-level easing defaults to `ease-out`; choose `linear` or `ease-in-out` where appropriate. A destination keyframe's optional `easing` overrides that incoming segment. Do not assign easing to the first keyframe, which has no incoming segment.

Counter tracks optionally accept `format: {"decimals":0,"prefix":"$","suffix":""}`. They use tabular numbers and keep the existing text box. Inspect the longest displayed number for overflow. A counter and a static text prop cannot both control the same node; the validator rejects that conflict. Using a counter does not make the original chart's SVG curve reflect those numbers.

Multiple properties may target one node, but duplicate tracks for the same resolved node/property are rejected even when aliases differ. Each scene instance has independent bindings. A parent's motion naturally affects descendants; avoid unintentionally doubling movement or opacity on both. Assemblies prefix target keys with the child component ID and aliases with `childId.`; a repeated identical child binding intentionally affects every occurrence of that child inside that assembly. Use separate scene instances when they need independent tracks.

## Source fidelity and limits

Transforms prepend to the authored transform, retaining its pivot and original rotation. Thus rotated parents rotate the local movement direction too. Reveals clip the target's box, including its shadow; keep a shadow outside the revealed target when the source already separates it. The API never replaces an authored clip-path.

`display: contents` has no rendered box; ordinary inline text cannot transform. Those nodes are not advertised as movable targets. A maintainer can materialize a source group using measured Figma geometry and compensate child coordinates, then verify static parity. The agent must not guess a box or invent a target. Declared embedded data slots have their own validated geometry and motion targets; inspect `embeddedDataSlots` and read [native data](native-data.md). Outside those adapters, image/SVG interiors remain the original source fragments: a flattened image is not a collection of editable paths. Internal movement can target a fragment or a native child, not arbitrary pixels within it.

Omitting animation tracks preserves the original DOM styles and visual layout. All interpolation derives from the requested frame; seeks and out-of-order exports produce the same result. Do not add CSS transitions, timers or browser reduced-motion logic. The installed plugin includes this capability without requiring Figma access.

For embedded table/chart data, targets follow the current dataset. After adding or removing table rows/columns or changing chart point counts, query `--motion --data <embedded-data.json> --json`. Keep explicit row, column and point IDs stable; tracks targeting removed IDs must be updated. A structural table dataset replaces the source cell/grid nodes, so legacy edits or illustration-level tracks on those nodes fail preflight. Use the new slot targets while keeping surrounding artwork controls. See [native data](native-data.md) for the data shapes.

After authoring, run `motion:check`, generate files, inspect the PNG and play the MP4. Check neighboring frames for small moving labels. Verify a still region stays stationary and the selected internal region changes; a whole-illustration fade is not evidence of internal motion.
