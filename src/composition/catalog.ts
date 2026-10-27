import { nativeCatalog } from "../native/catalog";
import { embeddedRegistry } from "../embedded/catalog";
export { nativeCatalog } from "../native/catalog";
import assets from "../library/assets.json";
import figmaAssets from "../figma/assets.json";
import illustrations from "../figma/illustrations.json";
import contractData from "../figma/component-contracts.json";
import type { ComponentContracts } from "./schema.mjs";
import {
  createSceneSchema,
  parseAssetCatalog,
  parseIllustrationCatalog,
} from "./schema.mjs";

export const assetCatalog = parseAssetCatalog([...assets, ...figmaAssets]);
export const illustrationCatalog = parseIllustrationCatalog(illustrations);
export const componentContracts = contractData as unknown as ComponentContracts;
export const sceneSchema = createSceneSchema(
  assetCatalog,
  illustrationCatalog,
  componentContracts,
  nativeCatalog,
  embeddedRegistry,
);

const assetsById = new Map(assetCatalog.map((asset) => [asset.id, asset]));
const illustrationsById = new Map(
  illustrationCatalog.map((item) => [item.id, item]),
);

export function getAsset(id: string) {
  const asset = assetsById.get(id);
  if (!asset)
    throw new Error(
      `Unknown asset ID: ${id}. Choose from src/library/assets.json or src/figma/assets.json.`,
    );
  return asset;
}

export function getIllustration(id: string) {
  const illustration = illustrationsById.get(id);
  if (!illustration)
    throw new Error(
      `Unknown illustration ID: ${id}. Choose from src/figma/illustrations.json.`,
    );
  return illustration;
}
