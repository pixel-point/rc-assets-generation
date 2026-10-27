# Distribution validation

Version 0.2.1. Runtime checks were completed on 20 October 2026; repository preparation followed on 27 October 2026. These are local validation results, not evidence of a fresh native host installation.

## Completed runtime checks

- All 244 publisher tests, type checking and lint passed.
- Independent archive extraction verified all payload hashes and created a separate project.
- The copied project exposed 610 catalog entries and 610 available previews; both Claude manifests validated.
- PNG and five-second MP4 exports from the extracted project were byte-identical to the visually reviewed outputs. Browser playback and consecutive moving frames were checked.
- Public payload scans found no personal paths, private Figma URLs, known credential patterns or non-placeholder contact examples. OCR covered 608 readable previews; two 2x2 decorative dots were ineligible. Original artwork, font bytes and component identities were preserved.

## Repository payload

The repository uses the cleaned distribution with actual installation URLs and stronger local-file ignore rules. It omits private acquisition inventories, transfer logs, publisher tests and import tooling. `release-manifest.json` inventories the files in this repository, excluding Git metadata and the inventory itself. Its preparation status is a snapshot, not a live remote-publication check.

The original 0.2.1 archive remains an immutable validation baseline. The repository inventory is refreshed after documentation changes; it does not claim the repository has the original archive's hash.

## Separate acceptance steps

Fresh Codex/Claude session installation and activation, fresh dependency installation and cloud execution have not been verified. A clean static scan or OCR result cannot prove the absence of every possible confidential visual detail.

The npm package remains `private: true` to prevent accidental npm publication and `UNLICENSED` pending release terms; this setting does not control GitHub repository visibility. Existing artwork, font and dependency notices remain in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Cleanup does not resolve redistribution rights.
