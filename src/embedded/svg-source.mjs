const decode = (text) =>
  text.replace(
    /&(?:#x([\da-f]+)|#(\d+)|(amp|lt|gt|quot|apos));/gi,
    (_, hex, decimal, named) =>
      hex
        ? String.fromCodePoint(parseInt(hex, 16))
        : decimal
          ? String.fromCodePoint(Number(decimal))
          : { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" }[named],
  );

/** Parse saved, trusted Figma SVG exports into serializable native elements. */
export function parseSourceSvg(source) {
  const stack = [],
    roots = [];
  const tokens = source.match(/<!--[\s\S]*?-->|<[^>]+>|[^<]+/g) ?? [];
  for (const token of tokens) {
    if (token.startsWith("<?") || token.startsWith("<!")) continue;
    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      if (stack.pop()?.tag !== name)
        throw new Error(`Unbalanced source SVG ${name}.`);
      continue;
    }
    if (token.startsWith("<")) {
      const match = /^<([\w:-]+)\b([\s\S]*?)\/?>$/.exec(token);
      if (!match) throw new Error("Malformed source SVG element.");
      const tag = match[1];
      if (["script", "foreignObject", "iframe", "image"].includes(tag))
        throw new Error(`Unsupported embedded SVG element ${tag}.`);
      const attrs = {};
      for (const attribute of match[2].matchAll(
        /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g,
      )) {
        const key = attribute[1],
          value = decode(attribute[2] ?? attribute[3]);
        if (/^on/i.test(key) || (/href$/.test(key) && !value.startsWith("#")))
          throw new Error(`Unsupported source SVG attribute ${key}.`);
        attrs[key] = value;
      }
      const node = { tag, attrs, children: [] };
      if (stack.length) stack.at(-1).children.push(node);
      else roots.push(node);
      if (!token.endsWith("/>")) stack.push(node);
    } else if (token.trim() && stack.length)
      stack.at(-1).children.push(decode(token));
  }
  if (stack.length || roots.length !== 1 || roots[0].tag !== "svg")
    throw new Error("Expected one complete source SVG.");
  return roots[0];
}

export function sourceSvgNodes(tree) {
  const result = [];
  const visit = (node) => {
    if (typeof node !== "string") {
      result.push(node);
      node.children.forEach(visit);
    }
  };
  visit(tree);
  return result;
}
