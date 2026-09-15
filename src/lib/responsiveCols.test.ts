import { describe, expect, it } from "vitest";
import { COL_STEPS, MAX_CELL, MIN_CELL, computeCols, groupSizeForCols } from "./responsiveCols";

describe("computeCols", () => {
  it("trả về mốc nhỏ nhất khi độ rộng <= 0 hoặc không hợp lệ", () => {
    expect(computeCols(0).cols).toBe(COL_STEPS[0]);
    expect(computeCols(-100).cols).toBe(COL_STEPS[0]);
    expect(computeCols(NaN).cols).toBe(COL_STEPS[0]);
  });

  it("mọi mốc trả về đều nằm trong COL_STEPS", () => {
    for (const w of [50, 150, 300, 480, 600, 768, 900, 1024, 1200, 1280, 1600, 2400]) {
      expect(COL_STEPS).toContain(computeCols(w).cols);
    }
  });

  it("chọn mốc lớn nhất mà cỡ ô vẫn >= MIN_CELL", () => {
    // 10 cols cần >= 10*MIN_CELL px; 20 cols cần >= 20*MIN_CELL px
    const fit = computeCols(300); // đủ cho 10 cột nhưng không đủ cho 20
    expect(fit.cols).toBe(10);
    expect(fit.cellSize).toBeGreaterThanOrEqual(MIN_CELL);
  });

  it("màn hình rất rộng vẫn chặn ở mốc 25 (tối đa), ô phóng to nhưng không vượt MAX_CELL", () => {
    const fit = computeCols(4000);
    expect(fit.cols).toBe(25);
    expect(fit.cellSize).toBeLessThanOrEqual(MAX_CELL);
  });

  it("màn hình cực hẹp (dưới cả 10*MIN_CELL) vẫn trả về mốc nhỏ nhất, cell không âm", () => {
    const fit = computeCols(150); // < 10*22=220
    expect(fit.cols).toBe(10);
    expect(fit.cellSize).toBeGreaterThan(0);
  });

  it("tăng dần độ rộng không bao giờ làm giảm số cột (đơn điệu không giảm)", () => {
    const widths = [100, 200, 300, 400, 500, 700, 900, 1100, 1300, 1600, 2000];
    let prevCols = 0;
    for (const w of widths) {
      const { cols } = computeCols(w);
      expect(cols).toBeGreaterThanOrEqual(prevCols);
      prevCols = cols;
    }
  });

  it("không có bước nhảy đột ngột không hợp lý ngay tại ranh giới đủ/thiếu của một mốc", () => {
    const justUnder = computeCols(20 * MIN_CELL - 1);
    const justOver = computeCols(20 * MIN_CELL);
    expect(justUnder.cols).toBe(10);
    expect(justOver.cols).toBe(20);
  });
});

describe("groupSizeForCols", () => {
  it("luôn trả về bó 5 — mọi mốc trong COL_STEPS đều chia hết", () => {
    for (const cols of COL_STEPS) {
      const group = groupSizeForCols(cols);
      expect(group).toBe(5);
      expect(cols % group).toBe(0);
    }
  });

  it("bó 5 áp dụng đồng nhất, không phụ thuộc cols truyền vào", () => {
    expect(groupSizeForCols(20)).toBe(5);
    expect(groupSizeForCols(10)).toBe(5);
    expect(groupSizeForCols(25)).toBe(5);
    expect(groupSizeForCols(7)).toBe(5);
  });
});
