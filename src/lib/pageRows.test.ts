import { describe, expect, it } from "vitest";
import { computeRows } from "./pageRows";

describe("computeRows", () => {
  it("trang trống hiện đúng minRows suy ra từ minCells", () => {
    expect(computeRows({ cols: 25, endPos: 1, minCells: 700 })).toBe(28); // 700/25
    expect(computeRows({ cols: 20, endPos: 1, minCells: 300 })).toBe(15); // 300/20
  });

  it("không có maxCells (Viết tự do): tự thêm dòng khi viết gần hết trang, không giới hạn", () => {
    // endPos=701 → đã dùng hết 700 ô đầu (25 cột) → cần hiện thêm dòng dù vượt minCells
    const rows = computeRows({ cols: 25, endPos: 701, minCells: 700 });
    expect(rows).toBeGreaterThan(28);
  });

  it("có maxCells: cắt bớt dòng trống thừa về đúng khổ trang cố định khi nội dung còn ít", () => {
    // câu 53: 300 ô cố định, cols=25 → 12 dòng, dù nội dung mới dùng vài ô
    expect(computeRows({ cols: 25, endPos: 10, minCells: 300, maxCells: 300 })).toBe(12);
    // câu 54: 700 ô cố định, cols=25 → 28 dòng
    expect(computeRows({ cols: 25, endPos: 50, minCells: 700, maxCells: 700 })).toBe(28);
  });

  it("có maxCells nhưng nội dung cần nhiều ô vật lý hơn trần (dòng trống giữa đoạn...) — KHÔNG được cắt mất nội dung", () => {
    // 700 ô max, cols=25 (28 dòng danh nghĩa) nhưng nội dung đã lấn tới ô thứ 751
    // (do thụt đầu đoạn / dòng trống ăn thêm ô không tính vào 자) → vẫn phải đủ dòng
    // để hiện hết (floor(750/25)+1 = 31), không được cắt xuống 28.
    const rows = computeRows({ cols: 25, endPos: 751, minCells: 700, maxCells: 700 });
    expect(rows).toBe(31);
    expect(rows * 25).toBeGreaterThanOrEqual(750);
  });

  it("luôn trả về số nguyên dương", () => {
    for (const cols of [10, 20, 25]) {
      for (const endPos of [0, 1, 5, 999]) {
        const rows = computeRows({ cols, endPos, minCells: 300, maxCells: 300 });
        expect(Number.isInteger(rows)).toBe(true);
        expect(rows).toBeGreaterThan(0);
      }
    }
  });
});
