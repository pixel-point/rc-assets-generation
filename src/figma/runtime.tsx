import {Fragment, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode} from "react";
import {Img, cancelRender, continueRender, delayRender, staticFile} from "remotion";
import assets from "./assets.json";

type FigmaAsset = (typeof assets)[number] & {
  backdrop?: {blur: number; clipPathId: string};
};
const bySource = new Map<string, FigmaAsset>(assets.map(asset => [staticFile(asset.src), asset]));

/** Keeps SVG root dimensions intact. Only the containing layer scales the original
 * image to the measured Figma slot; no paths are edited and no screenshot is used.
 * Computed layout sizes are independent of the outer scene's preview/export scale.
 */
export function FigmaImage({src, alt = "", style}: {
  src: string;
  alt?: string;
  style?: CSSProperties;
}) {
  const asset = bySource.get(src);
  if (!asset) throw new Error(`Unregistered Figma asset: ${src}`);
  const ref = useRef<HTMLSpanElement>(null);
  const [slot, setSlot] = useState({width: asset.width, height: asset.height});
  const [handle] = useState(() => delayRender(`Measure ${asset.id}`));
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const computed = getComputedStyle(el);
      const width = parseFloat(computed.width), height = parseFloat(computed.height);
      if (!Number.isFinite(width) || !Number.isFinite(height)) {
        cancelRender(new Error(`Invalid layout for Figma asset ${asset.id}`));
        return;
      }
      setSlot(previous => previous.width === width && previous.height === height ? previous : {width, height});
      continueRender(handle);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {observer.disconnect(); continueRender(handle);};
  }, [asset.id, handle]);
  const cover = style?.objectFit === "cover";
  const scaleX = slot.width / asset.width;
  const scaleY = slot.height / asset.height;
  const scale = Math.max(scaleX, scaleY);
  return <span ref={ref} data-figma-asset={asset.id} style={{...style, display: "block", position: style?.position ?? "relative", overflow: cover || style?.borderRadius ? "hidden" : style?.overflow}}>
    {asset.backdrop ? <div aria-hidden="true" style={{
      position: "absolute", display: "block", pointerEvents: "none",
      width: asset.width, height: asset.height,
      left: cover ? (slot.width - asset.width * scale) / 2 : 0,
      top: cover ? (slot.height - asset.height * scale) * (style?.objectPosition === "bottom" ? 1 : 0.5) : 0,
      transformOrigin: "0 0", transform: `scale(${cover ? scale : scaleX}, ${cover ? scale : scaleY})`,
      backdropFilter: `blur(${asset.backdrop.blur}px)`,
      clipPath: `url("${src}#${asset.backdrop.clipPathId}")`,
    }} /> : null}
    <Img src={src} alt={alt} style={{
      position: "absolute", display: "block", maxWidth: "none",
      left: cover ? (slot.width - asset.width * scale) / 2 : 0,
      top: cover ? (slot.height - asset.height * scale) * (style?.objectPosition === "bottom" ? 1 : 0.5) : 0,
      transformOrigin: "0 0", transform: `scale(${cover ? scale : scaleX}, ${cover ? scale : scaleY})`,
    }} />
  </span>;
}

/** Wait for CSS masks and the source's inline SVG gradient images before capture.
 * Remotion cannot discover background/mask images by itself. Image tags keep those
 * sources in its normal readiness pipeline without changing their visible layers.
 */
export function FigmaPreload({sources}: {sources:string[]}) {
  return <>{sources.map((source,index)=><Img key={index} src={source.startsWith("data:")?source:staticFile(source)} alt="" style={{display:"none"}} />)}</>;
}

export type FigmaEffect = {
  type: "DROP_SHADOW" | "INNER_SHADOW";
  radius: number;
  offset: {x:number; y:number};
  color: {r:number; g:number; b:number; a:number};
};

/** Restore group effects omitted on Figma's display:contents wrappers. Each
 * shadow uses the original alpha independently; shadows never blur one another.
 * Native Figma SVG exports confirm Gaussian sigma = effect radius / 2.
 */
export function FigmaEffects({effects, children, style, ...attributes}: {
  effects:FigmaEffect[];
  children:ReactNode;
  style?:CSSProperties;
  "data-node-id"?:string;
  "data-name"?:string;
}) {
  const id=`figma-effects-${useId().replace(/[^a-zA-Z0-9_-]/g,"")}`;
  const outer=effects.map((e,i)=>e.type==="DROP_SHADOW"?i:-1).filter(i=>i>=0);
  const inner=effects.map((e,i)=>e.type==="INNER_SHADOW"?i:-1).filter(i=>i>=0);
  return <div {...attributes} style={{...style,filter:`url(#${id})`}}>
    <svg width="0" height="0" style={{position:"absolute",pointerEvents:"none"}} aria-hidden="true">
      <defs><filter id={id} x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
        {effects.map((effect,i)=><Fragment key={i}>
          {effect.type==="INNER_SHADOW"?<feComponentTransfer in="SourceAlpha" result={`input-${i}`}><feFuncA type="table" tableValues="1 0" /></feComponentTransfer>:null}
          <feOffset in={effect.type==="INNER_SHADOW"?`input-${i}`:"SourceAlpha"} dx={effect.offset.x} dy={effect.offset.y} result={`offset-${i}`} />
          <feGaussianBlur in={`offset-${i}`} stdDeviation={effect.radius/2} result={`blur-${i}`} />
          <feFlood floodColor={`rgb(${effect.color.r*255},${effect.color.g*255},${effect.color.b*255})`} floodOpacity={effect.color.a} result={`color-${i}`} />
          <feComposite in={`color-${i}`} in2={`blur-${i}`} operator="in" result={`colored-${i}`} />
          {effect.type==="INNER_SHADOW"?<feComposite in={`colored-${i}`} in2="SourceAlpha" operator="in" result={`shadow-${i}`} />:null}
        </Fragment>)}
        <feMerge>
          {[...outer].reverse().map(i=><feMergeNode key={i} in={`colored-${i}`} />)}
          <feMergeNode in="SourceGraphic" />
          {[...inner].reverse().map(i=><feMergeNode key={i} in={`shadow-${i}`} />)}
        </feMerge>
      </filter></defs>
    </svg>
    {children}
  </div>;
}
