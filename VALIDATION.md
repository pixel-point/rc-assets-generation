# Distribution validation

Version 0.2.2 updates agent guidance and package metadata only; runtime and artwork are unchanged from 0.2.1. Runtime checks were completed on 20 October 2026; repository preparation followed on 27 October 2026. These are local validation results, not evidence of a fresh native host installation.

## Completed runtime checks

- All 244 publisher tests, type checking and lint passed.
- Independent archive extraction verified all payload hashes and created a separate project.
- The copied project exposed 610 catalog entries and 610 available previews; both Claude manifests validated.
- PNG and five-second MP4 exports from the extracted project were byte-identical to the visually reviewed outputs. Browser playback and consecutive moving frames were checked.
- Public payload scans found no personal paths, private Figma URLs, known credential patterns or non-placeholder contact examples. OCR covered 608 readable previews; two 2x2 decorative dots were ineligible. Original artwork, font bytes and component identities were preserved.

## Repository payload

The 0.2.2 update adds the missing-component decision and authoring workflow to the shared skill, copied project guidance and capability documentation. Skill frontmatter validation and both Claude manifest validators passed. A copied-project smoke check confirmed the new guide and its instructions are available without the installed skill. Catalog output still contains 610 entries; renderer, scripts, assets and dependency versions are unchanged.

An independent read-only agent trial searched the real catalog for a warehouse conveyor, inspected actual style references, reported the gap and offered creation before implementation. Two further read-only trials proceeded without extra approval for an ordinary composition of existing parts and for a missing component whose creation was explicitly authorized. These check decision behavior, not new-component rendering or native host activation. Publication checks and prior runtime validation remain separate.

The repository uses the cleaned distribution with actual installation URLs and stronger local-file ignore rules. It omits private acquisition inventories, transfer logs, publisher tests and import tooling. `release-manifest.json` inventories the files in this repository, excluding Git metadata and the inventory itself. Its preparation status is a snapshot, not a live remote-publication check.

The original 0.2.1 archive remains an immutable validation baseline. The repository inventory is refreshed after documentation changes; it does not claim the repository has the original archive's hash.

## Separate acceptance steps

Fresh Codex/Claude session installation and activation, fresh dependency installation and cloud execution have not been verified. A clean static scan or OCR result cannot prove the absence of every possible confidential visual detail.

The npm package remains `private: true` to prevent accidental npm publication and `UNLICENSED` pending release terms; this setting does not control GitHub repository visibility. Existing artwork, font and dependency notices remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Cleanup does not resolve redistribution rights.
