import { z } from "zod";

// These limits protect the fixed Figma layout; the bars are authored artwork.
const label = z.string().min(1).max(28);
export const benchmarkSchema = z.strictObject({
  title: z.string().min(1).max(32),
  description: z.string().min(1).max(210),
  summary: z.string().min(1).max(28),
  category: z.string().min(1).max(16),
  labels: z.array(label).length(6),
});
export type BenchmarkProps = z.infer<typeof benchmarkSchema>;
