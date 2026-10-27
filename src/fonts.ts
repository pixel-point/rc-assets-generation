import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

loadFont({
  family: "Object Sans",
  url: staticFile("fonts/object-sans-regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Helvetica Neue",
  url: staticFile("fonts/helvetica-neue-medium.woff2"),
  weight: "500",
});
loadFont({
  family: "Inter",
  url: staticFile("fonts/inter-bold.woff2"),
  weight: "700",
});
loadFont({
  family: "IBM Plex Mono",
  url: staticFile("fonts/ibm-plex-mono-regular.woff2"),
  weight: "400",
});
loadFont({
  family: "IBM Plex Mono",
  url: staticFile("fonts/ibm-plex-mono-medium.woff2"),
  weight: "500",
});
loadFont({
  family: "IBM Plex Mono",
  url: staticFile("fonts/ibm-plex-mono-semibold.ttf"),
  weight: "600",
});
loadFont({
  family: "Geist Mono",
  url: staticFile("fonts/geist-mono.ttf"),
  weight: "400",
});
loadFont({
  family: "Noto Serif",
  url: staticFile("fonts/noto-serif.ttf"),
  weight: "600",
});

// Local fonts keep preview and exports independent of Figma and font CDNs.
loadFont({
  family: "Object Sans",
  url: staticFile("fonts/object-sans-medium.woff2"),
  weight: "500",
});
loadFont({
  family: "Helvetica Neue",
  url: staticFile("fonts/helvetica-neue-light.woff2"),
  weight: "300",
});
loadFont({
  family: "Helvetica Neue",
  url: staticFile("fonts/helvetica-neue-regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Inter",
  url: staticFile("fonts/inter-regular.woff2"),
  weight: "400",
});
loadFont({
  family: "Inter",
  url: staticFile("fonts/inter-medium.woff2"),
  weight: "500",
});
loadFont({
  family: "Inter",
  url: staticFile("fonts/inter-semibold.woff2"),
  weight: "600",
});

loadFont({
  family: "Geist",
  url: staticFile("fonts/geist-medium.woff2"),
  weight: "500",
});

loadFont({
  family: "Noto Sans",
  url: staticFile("fonts/noto-sans.ttf"),
  weight: "400",
});
