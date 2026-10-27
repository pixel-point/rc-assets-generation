import {
  parseNativeRegistry,
  getNativeDefinition,
  validateNativeMotion,
} from "../native/schema.mjs";
import { z } from "zod";
import { validateEmbeddedData } from "../embedded/runtime.mjs";
import {
  internalMotionSchema,
  validateInternalMotion,
} from "./internal-motion.mjs";
export { validateInternalMotion } from "./internal-motion.mjs";

export const BRAND_COLORS = [
  "transparent",
  "#FFFFFF",
  "#F9F9FB",
  "#1F1F47",
  "#3D3D5C",
  "#94979E",
  "#B8C2E0",
  "#D5D9DD",
  "#F2545B",
  "#576CDB",
  "#11D483",
  "#E4E5E7",
  "#EDF0F2",
  "#E3E5E8",
];

export const BRAND_FONTS = {
  heading: { fontFamily: "Object Sans", fontWeight: 500 },
  body: { fontFamily: "Helvetica Neue", fontWeight: 400 },
  "body-light": { fontFamily: "Helvetica Neue", fontWeight: 300 },
};

/** Validate sparse per-instance changes against the selected component's own contract. */
export function validateComponentProps(contracts, componentId, input = {}) {
  if (!input || Array.isArray(input) || typeof input !== "object") {
    throw new Error(`Props for ${componentId} must be an object.`);
  }
  const entries = Object.entries(input);
  if (!entries.length) return {};
  const contract =
    contracts?.components && Object.hasOwn(contracts.components, componentId)
      ? contracts.components[componentId]
      : undefined;
  if (!contract)
    throw new Error(
      `No editable contract for ${componentId}. Inspect the component catalog.`,
    );
  const output = {};
  const assignments = new Map();
  for (const [key, value] of entries) {
    if (!Object.hasOwn(contract.fields, key)) {
      throw new Error(
        `Unknown prop ${JSON.stringify(key)} for ${componentId}. Use catalog -- --id ${componentId} --describe.`,
      );
    }
    const field = contract.fields[key];
    if (field.type === "text") {
      if (
        typeof value !== "string" ||
        value.length > (field.maxLength ?? 500)
      ) {
        throw new Error(
          `${componentId}.${key} must be text up to ${field.maxLength ?? 500} characters.`,
        );
      }
    } else if (field.type === "color") {
      const allowed =
        typeof value === "string" &&
        (BRAND_COLORS.some(
          (color) => color.toLowerCase() === value.toLowerCase(),
        ) ||
          String(field.default).toLowerCase() === value.toLowerCase());
      if (!allowed)
        throw new Error(
          `${componentId}.${key} must use an approved brand color or its original color.`,
        );
    } else if (field.type === "image") {
      if (
        typeof value !== "string" ||
        (value !== "" &&
          (value.length > 512 ||
            !/^[a-zA-Z0-9][a-zA-Z0-9._ /-]*\.(svg|png|jpe?g|webp)$/i.test(
              value,
            ) ||
            value
              .split("/")
              .some((part) => !part || part === "." || part === "..")))
      )
        throw new Error(
          `${componentId}.${key} must be a local public-relative SVG, PNG, JPEG or WebP path; omit it or use an empty string for the original artwork.`,
        );
    } else if (field.type === "boolean") {
      if (typeof value !== "boolean")
        throw new Error(`${componentId}.${key} must be true or false.`);
    } else {
      throw new Error(
        `Unsupported field type in the contract for ${componentId}.${key}.`,
      );
    }
    for (const target of field.targets) {
      const identity = JSON.stringify([
        target.componentId,
        target.nodeId,
        target.property,
      ]);
      if (assignments.has(identity) && assignments.get(identity) !== value) {
        throw new Error(
          `Conflicting props target the same field in ${componentId}: ${key}.`,
        );
      }
      assignments.set(identity, value);
    }
    Object.defineProperty(output, key, {
      value,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return output;
}

const frames = z.number().int().min(1).max(1800);
const coordinate = z.number().finite().min(-7680).max(7680);
const identifier = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const dimension = z.number().int().min(2).max(3840).multipleOf(2);

const assetSchema = z
  .object({
    id: identifier,
    name: z.string().min(1),
    src: z
      .string()
      .regex(/^[a-zA-Z0-9][a-zA-Z0-9._ /-]*\.(svg|png|jpe?g|webp)$/i)
      .refine(
        (src) => !src.split("/").includes(".."),
        "Assets must use local public-relative paths.",
      ),
    width: z.number().finite().positive().max(50000),
    height: z.number().finite().positive().max(50000),
  })
  .passthrough();

export function parseAssetCatalog(catalog) {
  const assets = z.array(assetSchema).min(1).max(10000).parse(catalog);
  if (new Set(assets.map((asset) => asset.id)).size !== assets.length) {
    throw new Error("The asset catalog contains duplicate IDs.");
  }
  return assets;
}

export function parseIllustrationCatalog(catalog) {
  const illustrations = z
    .array(
      z
        .object({
          id: identifier,
          name: z.string().min(1),
          width: z.number().finite().positive().max(50000),
          height: z.number().finite().positive().max(50000),
        })
        .passthrough(),
    )
    .max(10000)
    .parse(catalog);
  if (
    new Set(illustrations.map((item) => item.id)).size !== illustrations.length
  ) {
    throw new Error("The illustration catalog contains duplicate IDs.");
  }
  return illustrations;
}

const easing = z.enum(["ease-out", "ease-in-out"]).default("ease-out");

const enterSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("fade"),
    durationFrames: frames.max(300).default(18),
    easing,
  }),
  z.strictObject({
    type: z.literal("slide"),
    durationFrames: frames.max(300).default(18),
    easing,
    x: coordinate.default(0),
    y: coordinate.default(24),
  }),
  z.strictObject({
    type: z.literal("scale"),
    durationFrames: frames.max(300).default(18),
    easing,
    from: z.number().min(0.01).max(4).default(0.95),
  }),
]);

const common = {
  id: identifier,
  x: coordinate.default(0),
  y: coordinate.default(0),
  scale: z.number().positive().max(16).default(1),
  rotation: z.number().min(-3600).max(3600).default(0),
  opacity: z.number().min(0).max(1).default(1),
  zIndex: z.number().int().min(-10000).max(10000).default(0),
  startFrame: z.number().int().min(0).max(1799).default(0),
  durationFrames: frames.optional(),
  enter: enterSchema.optional(),
  float: z
    .strictObject({
      amplitudeX: z.number().min(0).max(200).default(0),
      amplitudeY: z.number().min(0).max(200).default(4),
      periodFrames: z.number().int().min(2).max(1800).default(180),
      phaseDegrees: z.number().min(0).max(360).default(0),
    })
    .optional(),
};

/** The same validator runs in Node before export and in the browser before drawing. */
export function createSceneSchema(
  catalog,
  illustrationCatalog = [],
  componentContracts = { schemaVersion: 1, components: {} },
  nativeCatalog = [],
  embeddedRegistry = { definitions: {}, components: {} },
) {
  const natives = parseNativeRegistry(nativeCatalog);
  const nativeIds = new Set(natives.map((item) => item.id));
  const assets = parseAssetCatalog(catalog);
  const assetIds = new Set(assets.map((asset) => asset.id));
  const illustrationIds = new Set(
    parseIllustrationCatalog(illustrationCatalog).map((item) => item.id),
  );
  for (const id of nativeIds)
    if (illustrationIds.has(id))
      throw new Error(
        `Native and imported component IDs must be distinct: ${id}`,
      );
  // Validate through calculateMetadata, not Remotion's optional schema prop:
  // Remotion serializes that prop, while recursive Zod schemas cache cycles.
  const layerSchema = z.lazy(() =>
    z.discriminatedUnion("type", [
      z.strictObject({
        ...common,
        type: z.literal("asset"),
        assetId: identifier.refine(
          (id) => assetIds.has(id),
          "Unknown asset ID. Choose an ID from src/library/assets.json or src/figma/assets.json.",
        ),
      }),
      z.strictObject({
        ...common,
        type: z.literal("illustration"),
        illustrationId: identifier.refine(
          (id) => illustrationIds.has(id),
          "Unknown illustration ID. Choose an ID from src/figma/illustrations.json.",
        ),
        internalMotion: internalMotionSchema.optional(),
        data: z.record(z.string(), z.strictObject({
          props: z.record(z.string(), z.unknown()).optional(),
          internalMotion: internalMotionSchema.optional(),
        })).optional(),
        props: z
          .record(z.string(), z.union([z.string(), z.boolean()]))
          .optional(),
      }),
      z.strictObject({
        ...common,
        type: z.literal("native"),
        componentId: identifier.refine(
          (id) => nativeIds.has(id),
          "Unknown native component ID. Choose an exact native catalog entry.",
        ),
        props: z.record(z.string(), z.unknown()).optional(),
        internalMotion: internalMotionSchema.optional(),
      }),
      z.strictObject({
        ...common,
        type: z.literal("text"),
        text: z.string().min(1).max(500),
        width: z.number().positive().max(3840),
        font: z.enum(["heading", "body", "body-light"]).default("body"),
        fontSize: z.number().min(8).max(240).default(32),
        lineHeight: z.number().min(0.8).max(2).default(1.2),
        color: z.enum(BRAND_COLORS).default("#1F1F47"),
        align: z.enum(["left", "center", "right"]).default("left"),
      }),
      z.strictObject({
        ...common,
        type: z.literal("group"),
        layers: z.array(layerSchema).min(1).max(200),
      }),
    ]),
  );

  return z
    .strictObject({
      title: z.string().min(1).max(160).default("RevenueCat illustration"),
      width: dimension,
      height: dimension,
      fps: z.literal(30),
      durationFrames: frames,
      posterFrame: z.number().int().min(0).optional(),
      background: z.enum(BRAND_COLORS).default("#FFFFFF"),
      layers: z.array(layerSchema).min(1).max(200),
    })
    .superRefine((scene, context) => {
      const issue = (path, message) =>
        context.addIssue({ code: "custom", path, message });
      if (
        scene.posterFrame !== undefined &&
        scene.posterFrame >= scene.durationFrames
      ) {
        issue(
          ["posterFrame"],
          "posterFrame must be within the scene duration.",
        );
      }
      const ids = new Set();
      let count = 0;
      function checkLayers(layers, parentDuration, path, depth) {
        if (depth > 8) {
          issue(path, "Use at most 8 nested group levels.");
          return;
        }
        layers.forEach((layer, index) => {
          const current = [...path, index];
          count += 1;
          if (ids.has(layer.id))
            issue(
              [...current, "id"],
              "Layer IDs must be unique throughout a scene.",
            );
          ids.add(layer.id);
          if (layer.type === "illustration" && layer.props) {
            try {
              validateComponentProps(
                componentContracts,
                layer.illustrationId,
                layer.props,
              );
            } catch (error) {
              issue([...current, "props"], error.message);
            }
          }
          const duration =
            layer.durationFrames ?? parentDuration - layer.startFrame;
          if (layer.type === "illustration") {
            try {
              validateEmbeddedData(embeddedRegistry, layer.illustrationId,
                layer.data, duration, layer.props, layer.internalMotion,
                componentContracts.components[layer.illustrationId]);
            } catch (error) {
              issue([...current, "data"], error.message);
            }
          }
          if (layer.type === "native") {
            try {
              validateNativeMotion(
                getNativeDefinition(natives, layer.componentId),
                layer.props,
                layer.internalMotion,
                duration,
              );
            } catch (error) {
              issue([...current, "props"], error.message);
            }
          }
          if (layer.type === "illustration" && layer.internalMotion) {
            try {
              validateInternalMotion(
                componentContracts,
                layer.illustrationId,
                layer.internalMotion,
                duration,
                layer.props,
              );
            } catch (error) {
              issue([...current, "internalMotion"], error.message);
            }
          }
          if (
            layer.startFrame >= parentDuration ||
            layer.startFrame + duration > parentDuration
          ) {
            issue(
              [...current, "durationFrames"],
              "Layer timing must fit inside its parent; startFrame is relative to the parent.",
            );
          }
          if (layer.enter && layer.enter.durationFrames > duration) {
            issue(
              [...current, "enter", "durationFrames"],
              "The entrance must fit within the layer duration.",
            );
          }
          if (layer.type === "group")
            checkLayers(
              layer.layers,
              duration,
              [...current, "layers"],
              depth + 1,
            );
        });
      }
      checkLayers(scene.layers, scene.durationFrames, ["layers"], 0);
      if (count > 200)
        issue(["layers"], "Use at most 200 layers including nested layers.");
    });
}

function easeProgress(progress, easingName) {
  if (easingName === "ease-in-out") {
    return progress < 0.5
      ? 4 * progress ** 3
      : 1 - (-2 * progress + 2) ** 3 / 2;
  }
  return 1 - (1 - progress) ** 3;
}

/** Pure frame math: independent of clocks, browser animation state and render order. */
export function layerStateAtFrame(layer, parentFrame, parentDuration) {
  const start = layer.startFrame ?? 0;
  const durationFrames = layer.durationFrames ?? parentDuration - start;
  const frame = parentFrame - start;
  if (frame < 0 || frame >= durationFrames) return null;
  const progress =
    !layer.enter || layer.enter.durationFrames === 1
      ? 1
      : easeProgress(
          Math.min(1, frame / (layer.enter.durationFrames - 1)),
          layer.enter.easing,
        );
  const wave = layer.float
    ? Math.sin(
        2 *
          Math.PI *
          (frame / layer.float.periodFrames + layer.float.phaseDegrees / 360),
      )
    : 0;
  return {
    frame,
    durationFrames,
    x:
      (layer.x ?? 0) +
      (layer.enter?.type === "slide" ? layer.enter.x * (1 - progress) : 0) +
      (layer.float?.amplitudeX ?? 0) * wave,
    y:
      (layer.y ?? 0) +
      (layer.enter?.type === "slide" ? layer.enter.y * (1 - progress) : 0) +
      (layer.float?.amplitudeY ?? 0) * wave,
    scale:
      (layer.scale ?? 1) *
      (layer.enter?.type === "scale"
        ? layer.enter.from + (1 - layer.enter.from) * progress
        : 1),
    rotation: layer.rotation ?? 0,
    opacity: (layer.opacity ?? 1) * progress,
    zIndex: layer.zIndex ?? 0,
  };
}
