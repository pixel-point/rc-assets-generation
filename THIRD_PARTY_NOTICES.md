# Third-party materials and release status

This v0.2.2 package is marked `UNLICENSED`. Public code and RevenueCat artwork release terms have not been selected. Bundled third-party materials retain their own licenses, including Inter's SIL Open Font License below. Making the repository readable does not grant additional rights to the bundled artwork or third-party materials.

## RevenueCat artwork

Illustrations and exported SVG/image fragments are derived from designer-supplied RevenueCat artwork. The runtime retains stable component and asset identity; private design URLs and acquisition evidence are excluded from this distribution. Generated projects use local assets and do not need access to the design files.

The catalog includes product imagery, logos, badges and UI illustrations present in the supplied artwork. Importing them does not grant separate trademark or third-party redistribution rights. Source screenshots remain maintainer QA references. Animation timing in the bundled examples is authored for this kit from static storyboard states; it is not an exported Figma motion timeline.

The illustration is not a dataset or evidence of product results. Its default `5/7 metrics above median` summary preserves source copy even though six rows are visible.

## Fonts

The brand fonts in `public/fonts/` are included for visual fidelity: Helvetica Neue Light, Regular and Medium (`helvetica-neue-{light,regular,medium}.woff2`) and Object Sans Regular and Medium (`object-sans-{regular,medium}.woff2`). Their inclusion does not establish a right to redistribute them as part of a public creative kit. Verify their original licenses and retain required notices, or replace them with redistributable alternatives before publication.

The imported UI artwork also uses Inter. `public/fonts/inter-{regular,medium,semibold,bold}.woff2` were downloaded from the Inter project's official [font files](https://github.com/rsms/inter/tree/master/docs/font-files), respectively `Inter-Regular.woff2`, `Inter-Medium.woff2`, `Inter-SemiBold.woff2` and `Inter-Bold.woff2`. Copyright belongs to The Inter Project Authors. Inter is distributed under the SIL Open Font License 1.1; the complete notice and license from the project's [LICENSE.txt](https://github.com/rsms/inter/blob/master/LICENSE.txt) are retained in [public/fonts/Inter-LICENSE.txt](public/fonts/Inter-LICENSE.txt).

Additional typefaces used by imported original illustrations:

- IBM Plex Mono Regular and Medium (`ibm-plex-mono-regular.woff2`, `ibm-plex-mono-medium.woff2`) were supplied with the project artwork. SemiBold (`ibm-plex-mono-semibold.ttf`) came from the [Google Fonts IBM Plex Mono directory](https://github.com/google/fonts/tree/main/ofl/ibmplexmono). The bundled [IBMPlexMono-LICENSE.txt](public/fonts/IBMPlexMono-LICENSE.txt) identifies IBM Corp. as copyright holder and licenses the fonts under SIL OFL 1.1, with the reserved font name Plex.
- Geist Mono (`geist-mono.ttf`) was supplied with the project artwork. Its [upstream license](https://github.com/vercel/geist-font/blob/main/LICENSE.txt), retained as [Geist-LICENSE.txt](public/fonts/Geist-LICENSE.txt), identifies Vercel in collaboration with basement.studio and uses SIL OFL 1.1.
- Geist Medium (`geist-medium.woff2`) was downloaded from the [official Geist webfont directory](https://github.com/vercel/geist-font/tree/main/fonts/Geist/webfonts), retaining the same SIL OFL 1.1 [Geist license](public/fonts/Geist-LICENSE.txt).
- Noto Serif (`noto-serif.ttf`) is the variable `NotoSerif[wdth,wght].ttf` from the [Google Fonts Noto Serif directory](https://github.com/google/fonts/tree/main/ofl/notoserif). Its [NotoSerif-LICENSE.txt](public/fonts/NotoSerif-LICENSE.txt) identifies The Noto Project Authors and uses SIL OFL 1.1.

- Noto Sans (`noto-sans.ttf`) is `NotoSans[wdth,wght].ttf` from the [Google Fonts Noto Sans directory](https://github.com/google/fonts/tree/main/ofl/notosans), used at weight 400 for source paywall text. The bundled [NotoSans-LICENSE.txt](public/fonts/NotoSans-LICENSE.txt) retains The Noto Project Authors’ SIL OFL 1.1 notice.

Keep these full notices with their bundled font files. No exact upstream release tags are asserted for files acquired from `master` or `main`. Artwork that requires an unavailable font must remain pending instead of silently substituting an unrelated face.

## Remotion and dependencies

Remotion is pinned to 4.0.535 in this prototype. Remotion has its own usage and licensing terms; this repository does not grant a Remotion license. Review the [Remotion license information](https://www.remotion.dev/docs/license) for the intended users and distribution model.

Other JavaScript dependencies retain their respective licenses. `package-lock.json` identifies the versions used. Preserve upstream notices where required when distributing dependencies or generated bundles.

## Host formats

OpenAI/Codex and Claude plugin metadata target their respective documented host formats. Inclusion of these manifests does not imply endorsement, directory publication, account authentication or successful end-to-end host installation.
