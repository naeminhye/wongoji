import { describe, expect, it } from "vitest";
import { GUTTER_MARK_INTERVAL, gutterMarkAt } from "./gutterMarks";

function collectMarks(rows: number, cols: number): (number | null)[] {
  return Array.from({ length: rows }, (_, r) => gutterMarkAt(r, cols));
}

describe("gutterMarkAt", () => {
  it("cols chia hết interval (10, 25) → mốc rơi đúng ranh giới dòng, tăng dần đúng bội số 50", () => {
    // cols=10: mỗi 5 dòng cộng dồn đúng 50
    expect(collectMarks(20, 10).filter((v) => v !== null)).toEqual([50, 100, 150, 200]);
    // cols=25: mỗi 2 dòng cộng dồn đúng 50
    expect(collectMarks(14, 25).filter((v) => v !== null)).toEqual([50, 100, 150, 200, 250, 300, 350]);
  });

  it("cols không chia hết interval (20) vẫn ra đúng dãy 50/100/150/... không lệch, không lặp, không bỏ sót", () => {
    const marks = collectMarks(20, 20).filter((v) => v !== null);
    expect(marks).toEqual([50, 100, 150, 200, 250, 300, 350, 400]);
  });

  it("luôn tăng dần đúng interval, không có mốc trùng hay giảm", () => {
    for (const cols of [7, 10, 20, 25, 30]) {
      const marks = collectMarks(40, cols).filter((v): v is number => v !== null);
      for (let i = 1; i < marks.length; i++) {
        expect(marks[i]).toBe(marks[i - 1] + GUTTER_MARK_INTERVAL);
      }
    }
  });

  it("mốc trả về luôn là bội số của interval và <= tổng ô tích luỹ tại dòng đó", () => {
    for (const cols of [10, 20, 25]) {
      for (let r = 0; r < 30; r++) {
        const mark = gutterMarkAt(r, cols);
        if (mark !== null) {
          expect(mark % GUTTER_MARK_INTERVAL).toBe(0);
          expect(mark).toBeLessThanOrEqual(cols * (r + 1));
        }
      }
    }
  });

  it("trả về null khi cols hoặc interval không hợp lệ", () => {
    expect(gutterMarkAt(0, 0)).toBeNull();
    expect(gutterMarkAt(0, -5)).toBeNull();
    expect(gutterMarkAt(0, 20, 0)).toBeNull();
  });

  it("dòng đầu tiên (rowIndex 0) không đánh dấu khi cols < interval", () => {
    expect(gutterMarkAt(0, 20)).toBeNull();
    expect(gutterMarkAt(0, 10)).toBeNull();
  });
});
