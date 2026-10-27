import { Composition, Still, getInputProps } from "remotion";
import { Benchmarks, BenchmarksStill } from "./Benchmarks";
import { benchmarkSchema } from "./schema";
import {
  Scene,
  SceneStill,
  getSceneMetadata,
  getSceneStillMetadata,
  sceneSchema,
} from "./composition";
import { LibraryRoot } from "./Library";

export const RemotionRoot: React.FC = () => {
  const input = getInputProps();
  const hasInput = Object.keys(input).length > 0;
  const isScene = "layers" in input;
  const customScene = isScene ? sceneSchema.parse(input) : null;
  return (
    <>
      {!hasInput && (
        <>
          <Composition
            id="Scene"
            component={Scene}
            width={1600}
            height={900}
            fps={30}
            durationInFrames={240}
            defaultProps={{
              title: "From idea to loyal subscribers",
              width: 1600,
              height: 900,
              fps: 30,
              durationFrames: 240,
              posterFrame: 180,
              background: "#FFFFFF",
              layers: [
                {
                  id: "heading",
                  x: 80,
                  y: 62,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 0,
                  enter: {
                    type: "slide",
                    durationFrames: 24,
                    x: 0,
                    y: 20,
                  },
                  type: "text",
                  text: "From idea to loyal subscribers",
                  width: 1440,
                  font: "heading",
                  fontSize: 64,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "subtitle",
                  x: 82,
                  y: 156,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 10,
                  enter: {
                    type: "fade",
                    durationFrames: 22,
                  },
                  type: "text",
                  text: "Build a paywall. Make it yours. Keep customers coming back.",
                  width: 1400,
                  font: "body",
                  fontSize: 30,
                  lineHeight: 1.2,
                  color: "#3D3D5C",
                  align: "left",
                },
                {
                  id: "prompt",
                  x: 80,
                  y: 340,
                  scale: 0.85,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 20,
                  enter: {
                    type: "slide",
                    durationFrames: 30,
                    x: 0,
                    y: 30,
                  },
                  float: {
                    amplitudeX: 0,
                    amplitudeY: 4,
                    periodFrames: 120,
                    phaseDegrees: 0,
                  },
                  type: "illustration",
                  illustrationId: "ai-prompt-card",
                },
                {
                  id: "phone",
                  x: 650,
                  y: 280,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 38,
                  enter: {
                    type: "scale",
                    durationFrames: 28,
                    from: 0.9,
                  },
                  type: "illustration",
                  illustrationId: "appearance-subscription-phone",
                },
                {
                  id: "settings",
                  x: 510,
                  y: 485,
                  scale: 0.8,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 58,
                  enter: {
                    type: "slide",
                    durationFrames: 25,
                    x: -20,
                    y: 0,
                  },
                  type: "illustration",
                  illustrationId: "appearance-settings-panel",
                },
                {
                  id: "retention",
                  x: 995,
                  y: 265,
                  scale: 0.95,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 75,
                  enter: {
                    type: "slide",
                    durationFrames: 30,
                    x: 0,
                    y: 28,
                  },
                  type: "illustration",
                  illustrationId: "customer-center-retention-offer",
                },
                {
                  id: "build",
                  x: 80,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 25,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "01  Create",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "customize",
                  x: 570,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 50,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "02  Customize",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "retain",
                  x: 1050,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 80,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "03  Retain",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
              ],
            }}
            calculateMetadata={getSceneMetadata}
          />
          <Still
            id="SceneStill"
            component={SceneStill}
            width={1600}
            height={900}
            defaultProps={{
              title: "From idea to loyal subscribers",
              width: 1600,
              height: 900,
              fps: 30,
              durationFrames: 240,
              posterFrame: 180,
              background: "#FFFFFF",
              layers: [
                {
                  id: "heading",
                  x: 80,
                  y: 62,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 0,
                  enter: {
                    type: "slide",
                    durationFrames: 24,
                    x: 0,
                    y: 20,
                  },
                  type: "text",
                  text: "From idea to loyal subscribers",
                  width: 1440,
                  font: "heading",
                  fontSize: 64,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "subtitle",
                  x: 82,
                  y: 156,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 10,
                  enter: {
                    type: "fade",
                    durationFrames: 22,
                  },
                  type: "text",
                  text: "Build a paywall. Make it yours. Keep customers coming back.",
                  width: 1400,
                  font: "body",
                  fontSize: 30,
                  lineHeight: 1.2,
                  color: "#3D3D5C",
                  align: "left",
                },
                {
                  id: "prompt",
                  x: 80,
                  y: 340,
                  scale: 0.85,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 20,
                  enter: {
                    type: "slide",
                    durationFrames: 30,
                    x: 0,
                    y: 30,
                  },
                  float: {
                    amplitudeX: 0,
                    amplitudeY: 4,
                    periodFrames: 120,
                    phaseDegrees: 0,
                  },
                  type: "illustration",
                  illustrationId: "ai-prompt-card",
                },
                {
                  id: "phone",
                  x: 650,
                  y: 280,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 38,
                  enter: {
                    type: "scale",
                    durationFrames: 28,
                    from: 0.9,
                  },
                  type: "illustration",
                  illustrationId: "appearance-subscription-phone",
                },
                {
                  id: "settings",
                  x: 510,
                  y: 485,
                  scale: 0.8,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 58,
                  enter: {
                    type: "slide",
                    durationFrames: 25,
                    x: -20,
                    y: 0,
                  },
                  type: "illustration",
                  illustrationId: "appearance-settings-panel",
                },
                {
                  id: "retention",
                  x: 995,
                  y: 265,
                  scale: 0.95,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 75,
                  enter: {
                    type: "slide",
                    durationFrames: 30,
                    x: 0,
                    y: 28,
                  },
                  type: "illustration",
                  illustrationId: "customer-center-retention-offer",
                },
                {
                  id: "build",
                  x: 80,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 25,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "01  Create",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "customize",
                  x: 570,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 50,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "02  Customize",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
                {
                  id: "retain",
                  x: 1050,
                  y: 770,
                  scale: 1,
                  rotation: 0,
                  opacity: 1,
                  zIndex: 0,
                  startFrame: 80,
                  enter: {
                    type: "fade",
                    durationFrames: 20,
                  },
                  type: "text",
                  text: "03  Retain",
                  width: 420,
                  font: "heading",
                  fontSize: 28,
                  lineHeight: 1.2,
                  color: "#1F1F47",
                  align: "left",
                },
              ],
            }}
            calculateMetadata={getSceneStillMetadata}
          />
        </>
      )}
      {customScene && (
        <>
          <Composition
            id="Scene"
            component={Scene}
            width={customScene.width}
            height={customScene.height}
            fps={customScene.fps}
            durationInFrames={customScene.durationFrames}
            defaultProps={customScene}
            calculateMetadata={getSceneMetadata}
          />
          <Still
            id="SceneStill"
            component={SceneStill}
            width={customScene.width}
            height={customScene.height}
            defaultProps={customScene}
            calculateMetadata={getSceneStillMetadata}
          />
        </>
      )}
      {!hasInput && <LibraryRoot />}
      {(!hasInput || !isScene) && (
        <>
          <Composition
            id="Benchmarks"
            component={Benchmarks}
            durationInFrames={180}
            fps={30}
            width={592}
            height={562}
            schema={benchmarkSchema}
            defaultProps={{
              title: "Benchmarks",
              description:
                "Compare subscription metrics against percentile benchmarks for similar apps so you can quickly see where conversion, churn, and retention are outperforming or lagging.",
              summary: "5/7 metrics above median",
              category: "Education apps",
              labels: [
                "Initial conversion",
                "Trial conversion",
                "Conversion to paying",
                "Monthly churn rate",
                "Refund rate",
                "Realized LTV per customer",
              ],
            }}
            calculateMetadata={({ props }) => ({
              props: benchmarkSchema.parse(props),
            })}
          />
          <Still
            id="BenchmarksStill"
            component={BenchmarksStill}
            width={592}
            height={562}
            schema={benchmarkSchema}
            defaultProps={{
              title: "Benchmarks",
              description:
                "Compare subscription metrics against percentile benchmarks for similar apps so you can quickly see where conversion, churn, and retention are outperforming or lagging.",
              summary: "5/7 metrics above median",
              category: "Education apps",
              labels: [
                "Initial conversion",
                "Trial conversion",
                "Conversion to paying",
                "Monthly churn rate",
                "Refund rate",
                "Realized LTV per customer",
              ],
            }}
            calculateMetadata={({ props }) => ({
              props: benchmarkSchema.parse(props),
            })}
          />
        </>
      )}
    </>
  );
};
