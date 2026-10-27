import {
  AbsoluteFill,
  Composition,
  Folder,
  Still,
  useCurrentFrame,
} from "remotion";
import { FigmaIllustration } from "./figma";
import illustrations from "./figma/illustrations.json";
import { Scene, getSceneMetadata, sceneSchema } from "./composition";
import selectedSceneInput from "../examples/selected-scene.json";
import "./fonts";

const selectedScene = sceneSchema.parse(selectedSceneInput);

type VisualBounds = { x: number; y: number; width: number; height: number };
function artworkBounds(item: (typeof illustrations)[number]): VisualBounds {
  return (
    (item as typeof item & { visualBounds?: VisualBounds }).visualBounds ?? {
      x: 0,
      y: 0,
      width: item.width,
      height: item.height,
    }
  );
}

function LibraryIllustration({ id }: { id: string }) {
  const item = illustrations.find((entry) => entry.id === id)!;
  const bounds = artworkBounds(item);
  return (
    <div
      style={{
        position: "absolute",
        left: -bounds.x,
        top: -bounds.y,
        width: item.width,
        height: item.height,
      }}
    >
      <FigmaIllustration id={id} />
    </div>
  );
}

function LibraryOverview({ selectedOnly = false }: { selectedOnly?: boolean }) {
  const page = Math.floor(useCurrentFrame() / 90);
  const library = selectedOnly
    ? illustrations
        .filter((item) => item.family === "selected" && item.role !== "part")
        .sort(
          (a, b) =>
            ((a as typeof a & { selectionOrder?: number }).selectionOrder ??
              0) -
            ((b as typeof b & { selectionOrder?: number }).selectionOrder ?? 0),
        )
    : illustrations;
  const items = library.slice(page * 12, page * 12 + 12);
  return (
    <AbsoluteFill
      style={{
        background: "#F9F9FB",
        padding: 48,
        fontFamily: "Object Sans",
        color: "#1F1F47",
      }}
    >
      <div style={{ fontSize: 42 }}>
        {selectedOnly ? "New Figma selections" : "RevenueCat artwork library"}
      </div>
      <div
        style={{
          fontFamily: "Helvetica Neue",
          fontSize: 22,
          marginTop: 10,
          color: "#3D3D5C",
        }}
      >
        {library.length} reusable illustrations and parts · page {page + 1}/
        {Math.ceil(library.length / 12)}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 20,
          marginTop: 32,
        }}
      >
        {items.map((item) => {
          const bounds = artworkBounds(item);
          const scale = Math.min(326 / bounds.width, 180 / bounds.height, 1);
          return (
            <div
              key={item.id}
              style={{
                boxSizing: "border-box",
                height: 280,
                background: "white",
                borderRadius: 16,
                padding: 14,
                overflow: "hidden",
              }}
            >
              <div style={{ position: "relative", height: 192 }}>
                <div
                  style={{
                    position: "absolute",
                    left: (326 - bounds.width * scale) / 2 - bounds.x * scale,
                    top: (180 - bounds.height * scale) / 2 - bounds.y * scale,
                    width: item.width,
                    height: item.height,
                    scale,
                    transformOrigin: "0 0",
                  }}
                >
                  <FigmaIllustration id={item.id} />
                </div>
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.3,
                  height: 37,
                  overflow: "hidden",
                }}
              >
                {item.name}
              </div>
              <div
                style={{
                  fontFamily: "Helvetica Neue",
                  fontSize: 11,
                  color: "#94979E",
                  marginTop: 4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {item.id}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}

/** Generated registrations intentionally share one source template; compose/edit copies through Scene JSON. */
export function LibraryRoot() {
  return (
    <>
      <Composition
        id="SelectedShowcase"
        component={Scene}
        width={selectedScene.width}
        height={selectedScene.height}
        fps={selectedScene.fps}
        durationInFrames={selectedScene.durationFrames}
        defaultProps={selectedScene}
        calculateMetadata={getSceneMetadata}
      />
      <Composition
        id="SelectedOverview"
        component={LibraryOverview}
        width={1600}
        height={1060}
        fps={30}
        durationInFrames={Math.max(
          90,
          Math.ceil(
            illustrations.filter(
              (item) => item.family === "selected" && item.role !== "part",
            ).length / 12,
          ) * 90,
        )}
        defaultProps={{ selectedOnly: true }}
      />
      <Composition
        id="LibraryOverview"
        component={LibraryOverview}
        width={1600}
        height={1060}
        fps={30}
        durationInFrames={Math.max(
          90,
          Math.ceil(illustrations.length / 12) * 90,
        )}
      />
      <Composition
        id="PaywallWorkflow"
        component={Scene}
        width={992}
        height={704}
        fps={30}
        durationInFrames={300}
        defaultProps={{
          title: "paywall-workflow",
          width: 992,
          height: 704,
          fps: 30,
          durationFrames: 300,
          posterFrame: 285,
          background: "#FFFFFF",
          layers: [
            {
              id: "state-1",
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 0,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "ai-paywall-start",
            },
            {
              id: "state-2",
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 60,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "ai-paywall-upload",
            },
            {
              id: "state-3",
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 120,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "ai-paywall-prompt",
            },
            {
              id: "state-4",
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 180,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "ai-paywall-generating",
            },
            {
              id: "state-5",
              x: 0,
              y: 0,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 240,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "ai-paywall-complete",
            },
          ],
        }}
        calculateMetadata={getSceneMetadata}
      />
      <Composition
        id="CustomerCenter"
        component={Scene}
        width={600}
        height={600}
        fps={30}
        durationInFrames={240}
        defaultProps={{
          title: "customer-center",
          width: 600,
          height: 600,
          fps: 30,
          durationFrames: 240,
          posterFrame: 225,
          background: "#FFFFFF",
          layers: [
            {
              id: "state-1",
              x: 51,
              y: 61,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 0,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "customer-center-subscription",
            },
            {
              id: "state-2",
              x: 51,
              y: 61,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 60,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "customer-center-cancel-reason",
            },
            {
              id: "state-3",
              x: 51,
              y: 61,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 120,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "customer-center-retention-offer",
            },
            {
              id: "state-4",
              x: 51,
              y: 61,
              scale: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0,
              startFrame: 180,
              durationFrames: 60,
              enter: {
                type: "fade",
                durationFrames: 10,
              },
              type: "illustration",
              illustrationId: "customer-center-app-settings",
            },
          ],
        }}
        calculateMetadata={getSceneMetadata}
      />
      <Folder name="Illustrations">
        {illustrations.map((item) => (
          <Still
            key={item.id}
            id={item.id}
            component={LibraryIllustration}
            width={Math.ceil(artworkBounds(item).width)}
            height={Math.ceil(artworkBounds(item).height)}
            defaultProps={{ id: item.id }}
          />
        ))}
      </Folder>
    </>
  );
}
