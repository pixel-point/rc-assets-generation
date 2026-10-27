# Motion for RevenueCat artwork

These guidelines adapt Emil Design Engineering's timing, paired-element, performance principles to the kit's deterministic Remotion renderer. They ship with the project; another skill or animation library is not required.

## Choose motion before writing a scene

Give each movement a purpose: introduce a focal object, explain a relationship, or reveal a new state. Keep reading copy still once introduced. An entrance followed by a readable hold is a good starting point. Do not add float to every asset just to make a video feel animated.

Treat a phone and its attached badge, or a chart and its labels, as one `group` when they should move together. Put the entrance/float on the group. Independent entrances on both a parent and its children multiply opacity and can make attached parts drift. Children have local timelines, so matching float parameters on separately delayed layers do not guarantee matching phases.

Use `ease-out` for entrances (the default). `ease-in-out` is available for a deliberately slower start and symmetric finish. For movement of already visible objects, use ease-in-out with internal keyframes; the JSON `enter` API always fades in and is not a substitute for internal motion. Avoid spring overshoot unless the brief calls for a playful treatment.

## Starting values, not universal limits

All JSON scenes run at 30 fps. Choose timing for the actual deliverable. A marketing video showing a UI mockup is still a marketing video.

| Context | Useful starting duration |
| --- | --- |
| Frequent product interaction | Often no animation |
| Small UI feedback | 3–5 frames |
| Standard UI entrance | 5–8 frames |
| Large UI transition | 9–12 frames |
| Marketing illustration entrance | 18–30 frames, longer when the story needs it |

Start with 12–32px slide travel and scale from `0.95`, rather than scaling from zero. Preserve source proportions. Reserve time to read text; stagger related groups to direct attention rather than staggering every fragment.

Float is opt-in. When useful, try 2–8px amplitude and 120–240 frames per cycle. An empty `float: {}` uses 4px vertical amplitude over 180 frames. Do not add it to headings or body copy. Small text inside a moving imported UI panel also needs visual review even though the checker cannot inspect that component's internals.

## Rendering invariants

- Derive every animated value from the frame, props and seeded inputs. Use `useCurrentFrame()` and pure interpolation; avoid CSS animations/transitions, wall clocks, timers, requestAnimationFrame and unseeded random values. Preview, seeking and out-of-order rendering must agree.
- Animate transforms and opacity while keeping layout dimensions stable. The JSON composer uses fractional `translate3d` on the animated group. Do not round coordinates or animate layout `left`, `top`, width, height, margins or padding. Native chart SVG geometry is the deliberate exception: numerical values update SVG coordinates and paths inside a fixed layout. Static positioning may use left/top.
- For authored TSX, set `composite` on each `Group`, `Illustration` or `Asset` whose position changes. Leave static inner artwork alone. Avoid promoting every nested asset or masking jitter with blur.
- Use the bundled local fonts and intrinsic image dimensions. Changing font metrics or rerasterizing text between renderer pages can make smooth coordinates look like pixel jumps.
- Keep PNG frame capture and renderer concurrency 1. Both the export helper and Studio config use these defaults. For direct Node rendering APIs, pass `imageFormat: "png"` and `concurrency: 1` explicitly; Remotion's config file does not configure those APIs.

Native data components additionally support numerical `value`, line/area `draw`, and bar/donut `progress` tracks. Their geometry changes from data while axes remain fixed across the full timeline. See [native data components](native-data.md).

For an internal source-artwork chart reveal, the declared `revealX`/`revealY` capability clips the existing artwork without changing its layout. It does not morph paths or make static chart shapes data-driven. Use this only on a verified target with a real box and no authored clip-path. See [internal motion](internal-motion.md). Keep axes and labels visible while the line reveals; hold the finished graph long enough to read it. Button feedback can use a small scale pulse. Avoid applying a separate float loop to every internal node.

## Output scope

This kit generates PNG illustrations and MP4 videos. Motion guidance applies to the content and rendering quality of those files. Browser interaction/accessibility rules from Emil's web skill are outside this workflow; do not add reduced-motion variants or website preference handling to an asset request.

For an image-only request, omit entrance, float and internal motion and export PNG directly. `posterFrame` can also select a still from an existing animation; choose a readable moment with the required layers visible. No MP4 needs to be rendered to obtain the PNG.

## Check the result

```sh
npm run motion:check -- --props examples/custom.json
npm run motion:check -- --props examples/custom.json --context ui --json
```

The checker validates the scene and reports advisory warnings for large scale changes, slide travel over 100px, float cycles under 60 frames, amplitude over 12px, continuously floating text, more than three independent float loops, and entrances over 45 frames (marketing) or 12 frames (UI). Scale from below 0.85 is flagged. Internal tracks also flag combined XY travel spans over 100px (including ancestor and illustration scale), scale values outside 0.85–1.15, and more than six distinct target selector strings in one illustration. These advisory counts do not resolve aliases. Long chart reveals and counters are allowed. Entrance and float distances include ancestor scale. Warnings are prompts to review a choice, not a ban on an intentional style. Malformed scenes/options fail; style warnings leave exit code 0. Scene exports also run the marketing checks automatically.

Review the actual PNG and play the actual exported MP4. Inspect entrances, scene boundaries and final holds. For small moving UI or typography, inspect 15–30 consecutive frames at native size; three distant screenshots cannot reveal alternating raster shifts or pixel stepping. If a loop was requested, check its end-to-start seam. Resolve unexpected warnings or explain why a flagged choice serves the brief. A clean checker report does not certify visual smoothness.

Use the same props for preview and exports, restart a props-file preview after edits, and report what you actually checked. After renderer/TSX changes, run typecheck, lint and the relevant publisher tests. Preserve PNG capture and single-page rendering while debugging; compare neighboring frames before adding effects or increasing frame rate.
