import { countRoles, filterComponents, roleLabel } from "./model.mjs";

export const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );
export const shellQuote = (value) =>
  "'" + String(value).replace(/'/g, "'\\''") + "'";

const safeJson = (value) =>
  JSON.stringify(value).replace(
    /[<>&\u2028\u2029]/g,
    (character) =>
      `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
const collectionLabel = (value) =>
  ({
    original: "Original illustrations",
    redrawing: "Redrawings",
    selected: "Selected artwork",
    native: "Native data components",
  })[value] ?? value;
const option = (value, label) =>
  `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`;
const number = (value) => Number(value).toLocaleString("en-US");
const implementationLabels = {
  "data-driven-native": "Native data",
  "native-no-image-dependency": "Native elements",
  "hybrid-native-text-plus-assets": "Native + assets",
  "asset-backed-no-native-text": "Asset-backed",
  unclassified: "Not classified",
};

function card(component) {
  const e = escapeHtml;
  const preview = component.preview;
  const image = preview
    ? `<a class="preview" href="${e(preview.path)}" target="_blank" rel="noopener" aria-label="Open rendered PNG: ${e(component.name)}"><img src="${e(preview.path)}" width="${preview.width}" height="${preview.height}" alt="${e(component.name)}" loading="lazy" decoding="async"><span class="open">Open PNG</span></a>`
    : `<div class="preview"><span class="missing-message"><strong>Preview not rendered yet</strong>This component is available in the library. Ask your agent to render its preview.</span></div>`;
  const fields = component.editableFields;
  const command = `npm run catalog -- --id ${shellQuote(component.id)} --describe --json`;
  const native = component.family === "native";
  const embedded = Object.values(component.embeddedDataSlots ?? {});
  const embeddedDetails = embedded
    .map(
      (slot) =>
        `<code>${e(slot.id)}</code> · ${e(slot.kind)} · ${e(slot.name)}`,
    )
    .join("<br>");
  const alternatives = (component.nativeAlternatives ?? [])
    .map(
      (entry) =>
        `<a href="#${e(entry.id)}" data-component-link="${e(entry.id)}">${e(entry.name)} <code>${e(entry.id)}</code></a>`,
    )
    .join("<br>");
  const sourceUnits = (component.sources ?? [])
    .map(
      (entry) =>
        `<a href="#${e(entry.componentId)}" data-component-link="${e(entry.componentId)}"><code>${e(entry.componentId)}</code></a>`,
    )
    .join(", ");
  const source = /^https:\/\//.test(component.source ?? "")
    ? `<a href="${e(component.source)}" target="_blank" rel="noopener noreferrer">Figma source</a>`
    : "";
  return `<article class="card" data-id="${e(component.id)}" id="${e(component.id)}">
${image}<div class="card-body"><div class="eyebrow"><span>${roleLabel(component.role)}</span><span>${preview ? "Rendered preview" : "Preview unavailable"}</span></div>
<h2>${e(component.name)}</h2><span class="implementation" title="${e(component.implementation?.label ?? "Implementation audit is unavailable for the current source")}">${e(implementationLabels[component.implementation?.classification] ?? "Not classified")}</span>${embedded.length ? '<span class="implementation">Native data inside</span>' : ""}<div class="tags">${(
    component.tags ?? []
  )
    .slice(0, 4)
    .map((tag) => `<span>${e(tag)}</span>`)
    .join("")}</div>
<div class="identity"><code>${e(component.id)}</code><button class="copy" type="button" data-copy="${e(component.id)}" aria-label="Copy ID ${e(component.id)}">Copy ID</button></div>
${component.variant ? `<p class="variant">${e(component.variantFamily)} · ${e(component.variant)}</p>` : ""}
<details class="details"><summary>Details &amp; agent data</summary><dl><dt>Collection</dt><dd>${e(collectionLabel(component.family))}</dd><dt>Group</dt><dd>${e(component.group || "Not assigned")}</dd><dt>Native size</dt><dd>${number(Math.round(component.width * 100) / 100)} × ${number(Math.round(component.height * 100) / 100)}</dd>${component.implementation ? `<dt>Implementation</dt><dd>${e(component.implementation.label)}</dd>` : ""}<dt>${native ? "Editable data" : "Editable fields"}</dt><dd>${native ? `Structured ${e(component.kind)} props; inspect the agent JSON schema` : `${fields.text ?? 0} text · ${fields.color ?? 0} color · ${fields.boolean ?? 0} visibility · ${fields.image ?? 0} image`}</dd><dt>Motion targets</dt><dd>${component.motionTargetCount === null ? "Query the current data contract" : `${number(component.motionTargetCount)} ${native ? "default-data" : "internal"} targets`}${component.motionAliases.length ? `<br>${e(component.motionAliases.join(", "))}` : ""}</dd>${embedded.length ? `<dt>Native data inside</dt><dd>${number(embedded.length)} slots · ${component.embeddedDataMotionTargetCount === null ? "inspect current contract" : `${number(component.embeddedDataMotionTargetCount)} data motion targets`}<br>${embeddedDetails}</dd>` : ""}${alternatives ? `<dt>Native alternatives</dt><dd>${alternatives}</dd>` : ""}${native && sourceUnits ? `<dt>Related source artwork</dt><dd>${sourceUnits}</dd>` : ""}</dl>
<p>${native ? "Rows, columns, points and series use stable data IDs. Ask your agent to inspect --motion with --props for custom data. Defaults are illustrative; this component replaces a data unit, not its entire source illustration." : "Fields and animation targets belong inside this component. They are not additional reusable parts."}</p>
${embedded.length ? `<p>Keep this exact illustration ID. Ask your agent to edit its declared <code>data</code> slots; the surrounding artwork stays in place. Inspect custom data with <code>--data embedded-data.json</code>.</p>` : ""}
${alternatives ? "<p>Standalone native alternatives are separate layout choices for the related table or chart.</p>" : ""}
<div class="agent-command"><code>${e(command)}</code><button class="copy" type="button" data-copy="${e(command)}" aria-label="Copy catalog command for ${e(component.id)}">Copy</button></div>
<div class="detail-links"><a href="${e(component.agentData)}" download>Agent JSON</a>${preview ? `<a href="${e(preview.path)}" download="${e(component.id)}.png">Rendered PNG</a>` : ""}${source}</div></details></div></article>`;
}

export function renderPage(manifest, clientScript) {
  const counts = countRoles(manifest.components);
  const roleNames = {
    all: "All",
    illustration: "Illustrations",
    part: "Reusable parts",
    "storyboard-state": "Storyboard states",
    unclassified: "Unclassified",
  };
  const families = [
    ...new Set(manifest.components.map((row) => row.family).filter(Boolean)),
  ].sort();
  const groups = [
    ...new Set(manifest.components.map((row) => row.group).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, "en"));
  const searchData = manifest.components.map(
    ({
      id,
      name,
      nodeId,
      role,
      family,
      group,
      variantFamily,
      variant,
      tags,
      implementation,
      embeddedDataSlots,
    }) => ({
      id,
      name,
      nodeId,
      role,
      family,
      group,
      variantFamily,
      variant,
      tags,
      embeddedDataSlots: Object.values(embeddedDataSlots ?? {}).map(
        ({ id, name, kind }) => ({ id, name, kind }),
      ),
      implementation: implementation
        ? { classification: implementation.classification }
        : null,
    }),
  );
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>Complete asset library · RevenueCat</title><link rel="stylesheet" href="styles.css"></head><body>
<a class="skip" href="#catalog">Skip to catalog</a><header class="topbar"><div class="wrap"><a class="brand" href="#top">RevenueCat</a><nav class="top-links" aria-label="Catalog resources"><a href="manifest.json">Catalog JSON</a>${manifest.guides?.composition ? `<a href="${escapeHtml(manifest.guides.composition)}">Agent guide</a>` : ""}</nav></div></header>
<main class="wrap" id="top"><section class="intro"><div><h1>Complete asset library</h1><p>Browse every illustration, reusable part, storyboard state, and native data component. Copy an exact ID and ask your agent to build an image or animation.</p>${manifest.collectionCounts?.native ? `<p>${number(manifest.collectionCounts.source)} source artwork registrations + ${number(manifest.collectionCounts.native)} native data presets. Native presets are explicit alternatives for the related chart or table unit.</p>` : ""}${manifest.embeddedDataCounts?.components ? `<p>${number(manifest.embeddedDataCounts.components)} source components include editable tables or charts inside their original artwork. These slots do not add component registrations.</p>` : ""}</div><aside class="total"><strong>${number(counts.all)}</strong><p>components in this library<br>${number(manifest.previewCounts.rendered)} rendered previews${manifest.previewCounts.missing ? ` · ${number(manifest.previewCounts.missing)} unavailable` : ""}</p></aside></section>
<nav class="tabs" aria-label="Component type">${Object.entries(roleNames)
    .filter(([key]) => key !== "unclassified" || counts[key])
    .map(
      ([key, label]) =>
        `<button type="button" data-role="${key}" aria-pressed="${key === "all"}">${label}<span>${number(counts[key])}</span></button>`,
    )
    .join("")}</nav>
<section aria-label="Catalog filters"><div class="filters"><label class="search-label" for="search">Search name, exact ID, or tags<input id="search" type="search" placeholder="Try phone, chart, or paste a component ID" autocomplete="off"></label><label for="implementation">Implementation<select id="implementation">${option("", "All types")}${Object.entries(
    implementationLabels,
  )
    .map(([value, label]) => option(value, label))
    .join(
      "",
    )}</select></label><label for="family">Collection<select id="family">${option("", "All collections")}${families.map((family) => option(family, collectionLabel(family))).join("")}</select></label><label for="group">Group<select id="group">${option("", "All groups")}${groups.map((group) => option(group, group)).join("")}</select></label></div><p class="filter-note">Native elements use DOM/CSS or inline vector code. Native + assets includes editable native text. Asset-backed components may still contain native geometry; external SVG artwork remains vector. ${manifest.guides?.implementation ? `<a href="${escapeHtml(manifest.guides.implementation)}">About implementation types</a>` : ""}</p>
<div class="results"><div class="results-left"><span role="status" aria-live="polite"><strong id="shown">${number(counts.all)}</strong> visible of ${number(counts.all)} total</span><button class="reset" id="reset" type="button" hidden>Reset filters</button></div><label class="background" for="background">Preview background<select id="background"><option value="light">Light</option><option value="dark">Dark</option></select></label></div></section>
<section class="grid" id="catalog" aria-label="Components">${manifest.components.map(card).join("\n")}</section><section class="empty" id="empty" hidden><h2>No matching components</h2><p>Try a shorter search or reset the filters.</p></section></main>
<footer class="footer"><div class="wrap"><p>This is the complete runtime catalog. Batch galleries are historical subsets. Previews are rendered from the local components; implementation uses the bundled native elements and artwork fragments. Internal fields and animation targets are counted separately from reusable parts.</p><p><a href="manifest.json">Machine-readable catalog</a> · <a href="component.schema.json">Agent data schema</a> · <a href="missing-previews.json">Missing previews</a></p></div></footer><div class="toast" id="toast" role="status" hidden></div>
<script type="application/json" id="catalog-data">${safeJson(searchData)}</script><script>${filterComponents.toString()}\n${clientScript}</script></body></html>\n`;
}

export function historicalBanner(total, href = "../library/index.html") {
  return `<!-- complete-library-banner:start --><aside aria-label="Historical batch gallery" style="padding:17px 24px;background:#1f1f47;color:#fff;font:14px/1.5 ObjectSans,system-ui,sans-serif;display:flex;gap:16px;justify-content:center;flex-wrap:wrap"><strong>Historical batch · this page shows only a subset</strong><a style="color:#fff;text-underline-offset:4px" href="${escapeHtml(href)}">Open the complete library (${number(total)} components) →</a></aside><!-- complete-library-banner:end -->`;
}
