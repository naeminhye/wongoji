import { describe, expect, it } from "vitest";
import { TRAINING_STAGES, splitStageSeconds } from "./trainingStages";

describe("splitStageSeconds", () => {
  it("chia đủ 4 mốc, mỗi mốc >= 30s", () => {
    const out = splitStageSeconds(12 * 60);
    for (const s of TRAINING_STAGES) {
      expect(out[s.key]).toBeGreaterThanOrEqual(30);
    }
  });

  it("tổng các mốc xấp xỉ tổng thời gian gốc (sai số do làm tròn 30s)", () => {
    const total = 40 * 60;
    const out = splitStageSeconds(total);
    const sum = Object.values(out).reduce((a, b) => a + b, 0);
    expect(Math.abs(sum - total)).toBeLessThanOrEqual(30 * TRAINING_STAGES.length);
  });

  it("mốc thời gian rất ngắn vẫn không ra số âm hay 0", () => {
    const out = splitStageSeconds(60);
    for (const s of TRAINING_STAGES) {
      expect(out[s.key]).toBeGreaterThan(0);
    }
  });
});
