import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { BenchmarkProps } from "./schema";
import "./fonts";

const heading: CSSProperties = {
  fontFamily: "Object Sans",
  fontWeight: 500,
  color: "#1F1F47",
};
const body: CSSProperties = { fontFamily: "Helvetica Neue", fontWeight: 400 };

function Artwork({ file, style }: { file: string; style: CSSProperties }) {
  return (
    <Img
      src={staticFile(`figma/benchmarks/${file}.svg`)}
      style={{ position: "absolute", ...style }}
    />
  );
}

function reveal(frame: number, from: number, duration = 20) {
  return interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
}

/** A reusable row built from the designer's original vector artwork. */
export function MetricRow({
  label,
  asset,
  index,
  progress = 1,
}: {
  label: string;
  asset: string;
  index: number;
  progress?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 20,
        top: 93 + index * 43,
        width: 504,
        height: 15,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 6}px)`,
      }}
    >
      <span style={{ ...body, fontSize: 13, lineHeight: "15px" }}>{label}</span>
      <div
        style={{
          position: "absolute",
          left: 180,
          top: 2.5,
          width: 324,
          height: 10,
          clipPath: `inset(0 ${(1 - progress) * 100}% 0 0)`,
        }}
      >
        <Artwork file={asset} style={{ left: 0, top: 0 }} />
      </div>
    </div>
  );
}

export function BenchmarkPanel({
  children,
  progress = 1,
}: {
  children: ReactNode;
  progress?: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 24,
        top: 159,
        width: 544,
        height: 379,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 12}px)`,
      }}
    >
      <Artwork file="c3dec" style={{ left: -17.764, top: -12.204 }} />
      {children}
    </div>
  );
}

const barAssets = ["bb928", "74b9c", "bb928", "ec62c", "e774e", "bcdce"];

export function BenchmarkArtwork({
  title,
  description,
  summary,
  category,
  labels,
  frame,
}: BenchmarkProps & { frame: number }) {
  return (
    <AbsoluteFill style={{ background: "white" }}>
      <AbsoluteFill
        style={{
          background: "#F9F9FB",
          borderRadius: 16,
          boxShadow: "inset 0 0 0 1px #B8C2E0",
          color: "#3D3D5C",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            ...heading,
            position: "absolute",
            left: 24,
            top: 24,
            fontSize: 24,
            lineHeight: "33px",
            letterSpacing: -0.96,
            opacity: reveal(frame, 0, 14),
          }}
        >
          {title}
        </div>
        <div
          style={{
            ...body,
            fontWeight: 300,
            position: "absolute",
            left: 24,
            top: 65,
            width: 544,
            fontSize: 16,
            lineHeight: "22px",
            opacity: reveal(frame, 4, 14),
          }}
        >
          {description}
        </div>
        <BenchmarkPanel progress={reveal(frame, 10, 24)}>
          <div
            style={{
              ...heading,
              position: "absolute",
              left: 20,
              top: 20,
              fontSize: 18,
              lineHeight: "18px",
              letterSpacing: -0.36,
            }}
          >
            {summary}
          </div>
          <div
            style={{
              ...body,
              position: "absolute",
              left: 402,
              top: 17,
              width: 124,
              height: 24,
              border: "1px solid #D5D9DD",
              borderRadius: 104,
              background: "white",
              boxSizing: "border-box",
              paddingLeft: 12,
              display: "flex",
              alignItems: "center",
              fontSize: 13,
            }}
          >
            {category}
            <Artwork file="2362c" style={{ right: 7, top: 5 }} />
          </div>
          <Artwork
            file="ba117"
            style={{ left: 20, top: 57, transform: "scaleY(-1)" }}
          />
          <Artwork
            file="0f231"
            style={{ left: 360.5, top: 82, opacity: reveal(frame, 25, 15) }}
          />
          {labels.map((label, index) => (
            <MetricRow
              key={index}
              label={label}
              asset={barAssets[index]}
              index={index}
              progress={reveal(frame, 32 + index * 7, 24)}
            />
          ))}
          <div
            style={{
              ...body,
              position: "absolute",
              left: 343,
              top: 348,
              width: 37,
              textAlign: "center",
              color: "#94979E",
              fontSize: 11,
              lineHeight: "13px",
              opacity: reveal(frame, 25, 15),
            }}
          >
            Median
          </div>
        </BenchmarkPanel>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

export const Benchmarks = (props: BenchmarkProps) => (
  <BenchmarkArtwork {...props} frame={useCurrentFrame()} />
);

export const BenchmarksStill = (props: BenchmarkProps) => (
  <BenchmarkArtwork {...props} frame={179} />
);
