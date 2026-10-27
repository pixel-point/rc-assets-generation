(() => {
  const components = JSON.parse(
    document.getElementById("catalog-data").textContent,
  );
  const search = document.getElementById("search");
  const family = document.getElementById("family");
  const group = document.getElementById("group");
  const implementation = document.getElementById("implementation");
  const cards = [...document.querySelectorAll(".card")];
  const roleButtons = [...document.querySelectorAll("[data-role]")];
  const params = new URLSearchParams(location.search);
  let role = roleButtons.some(
    (button) => button.dataset.role === params.get("role"),
  )
    ? params.get("role")
    : "all";
  search.value = params.get("q") ?? "";
  family.value = params.get("family") ?? "";
  group.value = params.get("group") ?? "";
  implementation.value = params.get("implementation") ?? "";
  function update() {
    const visible = filterComponents(components, {
      query: search.value,
      role,
      family: family.value,
      group: group.value,
      implementation: implementation.value,
    });
    const ids = new Set(visible.map((component) => component.id));
    for (const card of cards) card.hidden = !ids.has(card.dataset.id);
    for (const button of roleButtons)
      button.setAttribute("aria-pressed", String(button.dataset.role === role));
    document.getElementById("shown").textContent =
      visible.length.toLocaleString("en-US");
    document.getElementById("empty").hidden = visible.length !== 0;
    document.getElementById("reset").hidden = !(
      search.value ||
      role !== "all" ||
      family.value ||
      group.value ||
      implementation.value
    );
    const next = new URLSearchParams();
    if (search.value) next.set("q", search.value);
    if (role !== "all") next.set("role", role);
    if (family.value) next.set("family", family.value);
    if (group.value) next.set("group", group.value);
    if (implementation.value) next.set("implementation", implementation.value);
    // file:// viewers can restrict history; filtering still works there.
    try {
      history.replaceState(
        null,
        "",
        `${location.pathname}${next.size ? `?${next}` : ""}${location.hash}`,
      );
    } catch {}
  }
  search.addEventListener("input", update);
  family.addEventListener("change", update);
  group.addEventListener("change", update);
  implementation.addEventListener("change", update);
  for (const button of roleButtons)
    button.addEventListener("click", () => {
      role = button.dataset.role;
      update();
    });
  document.getElementById("reset").addEventListener("click", () => {
    search.value = "";
    family.value = "";
    group.value = "";
    implementation.value = "";
    role = "all";
    update();
    search.focus();
  });
  document.getElementById("background").addEventListener("change", (event) => {
    document.documentElement.dataset.previewBackground = event.target.value;
  });
  const toast = document.getElementById("toast");
  let timer;
  document.addEventListener("click", async (event) => {
    const componentLink = event.target.closest("[data-component-link]");
    if (componentLink) {
      search.value = componentLink.dataset.componentLink;
      family.value = "";
      group.value = "";
      implementation.value = "";
      role = "all";
      update();
      return;
    }
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const value = button.dataset.copy;
    try {
      if (navigator.clipboard?.writeText)
        await navigator.clipboard.writeText(value);
      else throw new Error("Clipboard unavailable");
      toast.textContent = "Copied to clipboard";
    } catch {
      const text = document.createElement("textarea");
      text.value = value;
      text.setAttribute("aria-label", "Text to copy");
      text.style.cssText =
        "position:fixed;left:16px;bottom:16px;width:calc(100% - 32px);z-index:50";
      document.body.append(text);
      text.select();
      const copied = document.execCommand("copy");
      if (copied) {
        text.remove();
        button.focus();
        toast.textContent = "Copied to clipboard";
      } else {
        toast.textContent =
          "Press Command+C or Ctrl+C to copy the selected text";
        text.addEventListener("blur", () => text.remove(), { once: true });
      }
    }
    toast.hidden = false;
    clearTimeout(timer);
    timer = setTimeout(() => {
      toast.hidden = true;
    }, 4000);
  });
  for (const image of document.querySelectorAll(".preview img"))
    image.addEventListener("error", () => {
      const holder = image.closest(".preview");
      const message = document.createElement("span");
      message.className = "missing-message";
      message.textContent =
        "Preview unavailable. Rebuild the catalog to restore this local image.";
      holder.replaceChildren(message);
      holder.removeAttribute("href");
    });
  update();
})();
