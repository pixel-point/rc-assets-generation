import type { ReactNode } from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import "../fonts";
import { NativeComponent } from "../native/NativeComponent";
import { FigmaIllustration } from "../figma";
import type { EmbeddedInput } from "../embedded/runtime.mjs";
import { getAsset, getIllustration, sceneSchema } from "./catalog";
import { BRAND_FONTS, layerStateAtFrame } from "./schema.mjs";
import type {
  ComponentProps,
  InternalMotionTrack,
  SceneLayer,
  SceneProps,
} from "./schema.mjs";

type TransformProps = {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  zIndex?: number;
  composite?: boolean;
};

/** Composite animated artwork as a whole to preserve subpixel motion. */
export function Group({
  children,
  x = 0,
  y = 0,
  scale = 1,
  rotation = 0,
  opacity = 1,
  zIndex = 0,
  composite = false,
}: TransformProps & { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        left: composite ? 0 : x,
        top: composite ? 0 : y,
        transform: `${composite ? `translate3d(${x}px, ${y}px, 0) ` : ""}rotate(${rotation}deg) scale(${scale})`,
        transformOrigin: "0 0",
        willChange: composite ? "transform" : undefined,
        opacity,
        zIndex,
      }}
    >
      {children}
    </div>
  );
}

/** Approved artwork retains its SVG/image dimensions; the wrapper scales the complete asset. */
export function Asset({
  assetId,
  ...transform
}: TransformProps & { assetId: string }) {
  const asset = getAsset(assetId);
  return (
    <Group {...transform}>
      <Img
        alt=""
        src={staticFile(asset.src)}
        width={asset.width}
        height={asset.height}
        style={{
          display: "block",
          width: asset.width,
          height: asset.height,
          maxWidth: "none",
        }}
      />
    </Group>
  );
}

/** Complete Figma assemblies remain native React layers, including their local assets. */
export function Illustration({
  illustrationId,
  props,
  data,
  internalMotion,
  frame = 0,
  durationFrames = 1800,
  ...transform
}: TransformProps & {
  illustrationId: string;
  props?: ComponentProps;
  data?: EmbeddedInput;
  internalMotion?: InternalMotionTrack[];
  frame?: number;
  durationFrames?: number;
}) {
  const illustration = getIllustration(illustrationId);
  return (
    <Group {...transform}>
      <div style={{ width: illustration.width, height: illustration.height }}>
        <FigmaIllustration
          id={illustrationId}
          props={props}
          data={data}
          internalMotion={internalMotion}
          frame={frame}
          durationFrames={durationFrames}
        />
      </div>
    </Group>
  );
}

function Layer({
  layer,
  frame,
  durationFrames,
}: {
  layer: SceneLayer;
  frame: number;
  durationFrames: number;
}) {
  const state = layerStateAtFrame(layer, frame, durationFrames);
  if (!state) return null;
  return (
    <Group
      x={state.x}
      y={state.y}
      scale={state.scale}
      rotation={state.rotation}
      opacity={state.opacity}
      zIndex={state.zIndex}
      composite={Boolean(layer.enter || layer.float)}
    >
      {layer.type === "asset" ? <Asset assetId={layer.assetId} /> : null}
      {layer.type === "illustration" ? (
        <Illustration
          illustrationId={layer.illustrationId}
          props={layer.props}
          data={layer.data}
          internalMotion={layer.internalMotion}
          frame={state.frame}
          durationFrames={state.durationFrames}
        />
      ) : null}
      {layer.type === "native" ? (
        <NativeComponent
          componentId={layer.componentId}
          props={layer.props}
          internalMotion={layer.internalMotion}
          frame={state.frame}
          durationFrames={state.durationFrames}
        />
      ) : null}
      {layer.type === "text" ? (
        <div
          style={{
            ...BRAND_FONTS[layer.font],
            width: layer.width,
            fontSize: layer.fontSize,
            lineHeight: layer.lineHeight,
            color: layer.color,
            textAlign: layer.align,
            whiteSpace: "pre-wrap",
            overflowWrap: "break-word",
          }}
        >
          {layer.text}
        </div>
      ) : null}
      {layer.type === "group"
        ? layer.layers.map((child) => (
            <Layer
              key={child.id}
              layer={child}
              frame={state.frame}
              durationFrames={state.durationFrames}
            />
          ))
        : null}
    </Group>
  );
}

/** Explicit frame input also supports browser players and deterministic static previews. */
export function SceneArtwork({
  frame,
  ...input
}: SceneProps & { frame: number }) {
  const props = sceneSchema.parse(input);
  return (
    <AbsoluteFill
      role="img"
      aria-label={props.title}
      style={{
        background: props.background,
        overflow: "hidden",
        isolation: "isolate",
      }}
    >
      {props.layers.map((layer) => (
        <Layer
          key={layer.id}
          layer={layer}
          frame={frame}
          durationFrames={props.durationFrames}
        />
      ))}
    </AbsoluteFill>
  );
}

export function Scene(props: SceneProps) {
  return <SceneArtwork {...props} frame={useCurrentFrame()} />;
}

export function SceneStill(props: SceneProps) {
  return (
    <SceneArtwork
      {...props}
      frame={props.posterFrame ?? props.durationFrames - 1}
    />
  );
}

export function getSceneMetadata({ props: input }: { props: unknown }) {
  const props = sceneSchema.parse(input);
  return {
    width: props.width,
    height: props.height,
    fps: props.fps,
    durationInFrames: props.durationFrames,
    props,
  };
}

export function getSceneStillMetadata({ props: input }: { props: unknown }) {
  const props = sceneSchema.parse(input);
  return { width: props.width, height: props.height, props };
}
