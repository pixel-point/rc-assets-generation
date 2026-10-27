# Native tables and charts

Use native components when values must change cells, plotted geometry, or individual elements. They render local React and SVG primitives, with no flattened chart/table image. Imported illustrations retain their exact IDs. Supported tables/charts inside them use reviewed embedded adapters that preserve the source layout and surrounding artwork. Separate native alternatives have explicit `native-*` IDs for new compositions.

## Inside an existing illustration

Resolve the exact source component, then inspect its `embeddedDataSlots`:

```sh
npm run catalog -- --id selected-3252-80334 --describe --json
npm run catalog -- --id selected-3252-80334 --motion --data embedded-data.json --json
```

The second command reads a file containing the illustration layer's `data` object, not a complete scene. For this cohort forecast table, save the following as `embedded-data.json`:

```json
{
  "table": {
    "props": {
      "cells": {
        "jan": {"cohort": "Jan’26"}
      }
    },
    "internalMotion": [{
      "target": "cell:jan:month-2",
      "property": "value",
      "easing": "ease-in-out",
      "keyframes": [
        {"frame": 45, "value": 13313},
        {"frame": 105, "value": 21300}
      ]
    }]
  }
}
```

Use `type: "illustration"`, keep the original `illustrationId`, and put this object in that layer's `data`. The slot's defaults, props schema and motion target map are authoritative. Sparse edits keep the authored structure. To change row/column counts, use a table dataset; chart series accept new point counts as described below. Layout stays within the original usable table or plot area, with density limits. Omitted input preserves the source data geometry except documented grid-boundary corrections; numerical values reconstructed from designer shapes are illustrative rather than recovered measurements.

The forecast-table family containing `selected-3252-80334` has corrected grid bounds so its grid and tinted cells stay inside the card.

The slot timeline uses the same local frames as its illustration. Ordinary component `props` and illustration-level `internalMotion` remain available. Avoid assigning a legacy text/counter and a data-cell update to the same source value; conflicting inputs fail preflight. Review typography, axis labels, clipping and all animated geometry after edits.

The current source catalog exposes 98 data slots across 76 component registrations: 31 direct table adapters, 66 direct chart adapters and one inherited table slot. These are controls inside existing artwork, not new acquisitions or additional component registrations. See `embedded-data-coverage.json` for exact host and slot IDs.

The MRR illustration `selected-3252-74933` exposes `mrr-trend-chart`. Its declared `series:revenue` target supports `draw`, and targets such as `point:revenue:p1` support numerical `value` animation. Inspect the contract against the actual point IDs after changing data. Its default numbers are reconstructed from the authored chart geometry and axis, not recovered measurements.

`examples/embedded-data-components.json` combines these two original illustrations, animating table rows, columns, cells and MRR line geometry. The agent generates both formats and reviews them:

```sh
npm run generate -- --props examples/embedded-data-components.json --output out/embedded-data-review
```

### Change table structure

Supply a complete `props.dataset` to add, remove or reorder rows and columns. It replaces the table's cells and grid within its existing usable area; the surrounding card, title and masks remain. Do not combine `dataset` with sparse `props.cells` or `props.columns`.

```json
{
  "table": {
    "props": {
      "dataset": {
        "columns": [
          {"id": "cohort", "label": "Cohort", "weight": 1.3},
          {"id": "customers", "label": "Customers", "align": "right"},
          {"id": "revenue", "label": "Revenue", "align": "right",
           "format": {"prefix": "$", "grouping": true}}
        ],
        "rows": [
          {"id": "jan", "cells": {"cohort": "Jan’26", "customers": 9133, "revenue": 21300}},
          {"id": "feb", "cells": {"cohort": "Feb’26", "customers": 1332, "revenue": 1800}}
        ]
      }
    }
  }
}
```

Use stable, unique IDs and supply every declared column in each row. A cell is a string, number, or `null` for an intentional blank. Columns support relative `weight`, alignment, number formatting and `display: "text" | "bar" | "avatar"`. The maximums are 10 columns and 16 rows; a smaller source area can reject a dataset earlier to keep it readable. Shorten labels or reduce density when validation reports a fit problem. Do not enlarge or crop the outer illustration to hide overflow.

The contract's `datasetTemplate` lists source-derived starting data. Cropped or compact source tables may need fewer rows, shorter labels or adjusted column weights before that template fits. For a validated dataset, the returned `defaults` can be reused as props; they contain the dataset without the internal derived cell maps.

Run `--motion --data <embedded-data.json> --json` again after structural changes. Targets derive from the current dataset, for example `row:jan`, `column:revenue` and `cell:jan:revenue`; only numeric cells expose `value`. Tracks for removed IDs fail validation. Legacy fields or illustration-level motion on replaced table nodes also fail preflight; use the new data targets. Controls on the surrounding artwork remain available.

### Change chart point counts

Pass numeric arrays in `props.values`, and optionally stable IDs in `props.pointIds`. Series IDs come from the source contract. Each series accepts 1–128 points. When resizing a chart with multiple series, provide matching counts and the same ordered point IDs across those series. Unchanged source layouts can retain their authored unequal spans. The original plot area and numeric range remain authoritative: embedded charts do not automatically rescale the Y axis. Values and animated keyframes must stay within the declared source ranges.

```json
{
  "mrr-trend-chart": {
    "props": {
      "values": {
        "revenue": [1200000, 2400000, 3800000],
        "comparison": [900000, 1800000, 3000000]
      },
      "pointIds": {
        "revenue": ["jan", "feb", "mar"],
        "comparison": ["jan", "feb", "mar"]
      }
    },
    "internalMotion": [{
      "target": "point:revenue:mar",
      "property": "value",
      "keyframes": [{"frame": 0, "value": 3000000}, {"frame": 45, "value": 3800000}]
    }]
  }
}
```

Point IDs must be unique within a series and match its value count. Omitted IDs default to `p1` through `pN`; use explicit IDs when identity should survive reordering. Bar and donut targets use the same IDs, for example `bar:<seriesId>:<pointId>` and `slice:<seriesId>:<pointId>`. Unknown, removed or duplicate IDs fail validation. Query the actual contract after changing data rather than reusing the default target list.

Source-specific historical and forecast series can retain separate X spans even when resized. For `selected-3252-93395`, use the same value at the last conversion point and first forecast point when those lines should connect; the renderer does not invent a join. Read each slot's limitations before changing its data.

`examples/embedded-adaptive-data.json` demonstrates six table rows and six columns in `selected-3252-80334`, plus ten chart points in `selected-3252-74933`. The agent generates and reviews the complete scene with `npm run generate -- --props examples/embedded-adaptive-data.json --output out/embedded-adaptive-review`.

## Standalone native presets

The catalog includes source defaults and the JSON schema for each native component:

```sh
npm run catalog -- native
npm run catalog -- --id native-trial-rate-chart --describe --json
npm run catalog -- --id native-trial-rate-chart --motion --json
```

Native data uses `type: "native"` and `componentId`, alongside existing illustration, asset, text and group layers. Sparse top-level props override defaults. Arrays replace the complete array. Row/column/category/series IDs identify data objects; labels can change freely. Do not use array positions as target IDs.

```json
{
  "id": "growth",
  "type": "native",
  "componentId": "native-trial-rate-chart",
  "x": 80,
  "y": 80,
  "props": {
    "title": "Subscribers",
    "metrics": [],
    "showAxes": true,
    "showPoints": true,
    "categories": [
      {"id": "jan", "label": "Jan"},
      {"id": "feb", "label": "Feb"},
      {"id": "mar", "label": "Mar"}
    ],
    "series": [
      {"id": "subscribers", "label": "Subscribers", "color": "#576CDB", "values": [12, 30, 64]}
    ],
    "domain": {"min": 0, "max": 100}
  },
  "internalMotion": [
    {"target": "series:subscribers", "property": "draw",
      "keyframes": [{"frame": 0, "value": 0}, {"frame": 45, "value": 1}]},
    {"target": "point:subscribers:mar", "property": "value", "easing": "ease-in-out",
      "keyframes": [{"frame": 60, "value": 64}, {"frame": 100, "value": 86}]}
  ]
}
```

This is one layer, not a complete scene. Place it inside the usual scene envelope. `examples/native-data-components.json` is a complete agent-authored example.

## Tables

Each column declares `id`, `label`, optional relative `width`, alignment, display type and number format. A row contains `id` and a `cells` object keyed by **every** column ID. Use `null` for an intentionally empty cell. Cells accept strings, numbers, or an object with `value`, optional display `label`, `tone`, `avatar` initials and number `format`.

Display types include `text`, `heatmap`, `bar`, `badge` and `avatar`. Heatmaps and embedded bars use the fixed `heatmap` domain. Preserve the numeric value when animation should update both the text and fill.

| Target | Purpose |
| --- | --- |
| `table`, `title`, `header` | Table frame, title, header |
| `row:<rowId>` | One row including all its cells |
| `column:<columnId>` | Header and every cell in a column |
| `cell:<rowId>:<columnId>` | One cell; numeric cells also accept `value` |

Rows and columns can move independently. Their transforms combine at intersecting cells. Keep movements purposeful and brief; motion does not reorder the input data. Change the rows/columns array for a static reorder.

## Charts

Supported kinds: `line`, `area`, `bar`, `stacked-bar`, `diverging-bar`, `donut`. Each series supplies one numeric value per category. An overlaid `renderAs: "line"` series supports MRR diagrams with positive/negative bars and a net line. Calculated business metrics, including a net series, are supplied explicitly by the agent; the renderer does not infer business rules.

| Target/property | Behavior |
| --- | --- |
| `series:<id>` / `draw` | Draw a line or reveal an area |
| `series:<id>` / `progress` | Grow a bar series or donut |
| `point:<seriesId>:<categoryId>` / `value` | Change numeric data and resulting geometry |
| `bar:<seriesId>:<categoryId>` / `progress` | Grow one bar from zero |
| `slice:<seriesId>:<categoryId>` / `progress` | Reveal one donut segment |
| `metric:<id>` / `value` | Update a header metric |
| `annotation`, `legend`, `title` | Animate independent labels |

Where declared, `translateX`, `translateY`, `rotate`, `scale` and `opacity` work on native elements. Point transforms affect the visible marker; use `value` to move the actual plotted point and its connected line. A marker has transform controls only when `showPoints` is enabled.

`draw` and `progress` run from 0 to 1. `value` uses data units; display formatting comes from the cell, column, chart or metric, not a cosmetic counter string. All tracks use deterministic local frames, including nested groups and multiple instances.

An explicit domain must include every data value and animated keyframe, plus zero for bars/areas and signed stack totals. Invalid domains fail preflight. If omitted, the scale covers the complete animation and remains fixed across frames. Donuts require nonnegative data. Geometry supports zero values without divisions by zero.

## Source fidelity and verification

Source links indicate the Figma family used for the native reconstruction. Many original chart SVGs contain only designed paths, not numeric datasets. Their defaults are explicitly illustrative reconstructions, not recovered measurements. Source numeric table copy is transcribed where available; every preset records its data provenance.

The native components preserve the source visual vocabulary—white cards, restrained borders, local fonts and RevenueCat colors. They are reusable reconstructions, not pixel-identical replicas of every embedded source variant. Declared embedded slots are separate source-specific adapters: they keep the original illustration and expose only reviewed data units. A standalone preset is still a separate design choice and does not replace an entire parent illustration.

The original `Benchmarks` composition keeps its existing copy-only contract. Use the native chart/table families for new numerical data.

Generate automatically with `npm run generate -- --props examples/native-data-components.json --output out/native-data-review`. Use `--format png` for a static illustration; both PNG/MP4 are the default. Inspect changed data for text fit and geometry, play the MP4, and inspect consecutive frames for small element motion. No manual Studio assembly is needed.
