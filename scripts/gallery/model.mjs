export function roleLabel(role) {
  return (
    {
      illustration: "Illustration",
      part: "Reusable part",
      "storyboard-state": "Storyboard state",
    }[role] ?? "Unclassified"
  );
}

export function countRoles(components) {
  const counts = {
    all: components.length,
    illustration: 0,
    part: 0,
    "storyboard-state": 0,
    unclassified: 0,
  };
  for (const component of components) {
    const role = ["illustration", "part", "storyboard-state"].includes(
      component.role,
    )
      ? component.role
      : "unclassified";
    counts[role]++;
  }
  return counts;
}

export function filterComponents(
  components,
  {
    query = "",
    role = "all",
    family = "",
    group = "",
    implementation = "",
  } = {},
) {
  const normalized = query.trim().toLowerCase();
  // A pasted stable ID selects that component, not similarly prefixed IDs.
  const exactId = components.find(
    (component) => component.id.toLowerCase() === normalized,
  )?.id;
  const terms = normalized.split(/\s+/).filter(Boolean);
  return components.filter((component) => {
    const componentRole = ["illustration", "part", "storyboard-state"].includes(
      component.role,
    )
      ? component.role
      : "unclassified";
    if (role !== "all" && componentRole !== role) return false;
    if (family && component.family !== family) return false;
    if (group && component.group !== group) return false;
    if (
      implementation &&
      (component.implementation?.classification ?? "unclassified") !==
        implementation
    )
      return false;
    if (exactId) return component.id === exactId;
    const searchable = [
      component.id,
      component.name,
      component.nodeId,
      component.family,
      component.group,
      component.variantFamily,
      component.variant,
      ...(component.tags ?? []),
      ...Object.values(component.embeddedDataSlots ?? {}).flatMap((slot) => [
        slot.id,
        slot.name,
        slot.kind,
      ]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return terms.every((term) => searchable.includes(term));
  });
}
