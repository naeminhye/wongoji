/* ────────────────────────────────────────────────────────────────────────────
   Chọn số cột responsive cho lưới 원고지 (xem wongoji-prompt.md mục 2).

   Không hard-code breakpoint theo clientWidth — tính bằng phép chia thực tế:
   với mỗi mốc cột trong COL_STEPS, cỡ ô tối thiểu (MIN_CELL) phải vẫn vừa
   trong độ rộng khả dụng. Chọn mốc LỚN NHẤT còn vừa, để hiển thị được nhiều
   nội dung nhất trên mỗi dòng mà ô vẫn không nhỏ hơn ngưỡng dễ đọc.

   Số cột tối đa CHẶN ở 25/dòng — màn hình rộng hơn mức cần cho 25 cột không
   được thêm cột nữa (sẽ khiến ô co lại, khó nhìn), mà thay vào đó phóng to ô
   (và theo đó là cỡ chữ, vốn luôn tính theo tỉ lệ % của cell — xem CellGlyph)
   lên tới MAX_CELL.
   ──────────────────────────────────────────────────────────────────────────── */

/** Các mốc số cột được phép — tối đa 25 cột/dòng theo yêu cầu. */
export const COL_STEPS = [10, 20, 25] as const;

/** Cỡ ô mong muốn (px) — nâng lên theo yêu cầu để chữ trong ô to, dễ đọc hơn. */
export const MIN_CELL = 28;
/** Trần cỡ ô — nâng so với trước để màn hình rộng có ô (và chữ) to hơn thay
 * vì thêm cột. */
export const MAX_CELL = 64;

/** Sàn tuyệt đối cho cỡ ô khi màn hình cực hẹp (dưới cả 10 cột * MIN_CELL). */
const ABSOLUTE_FLOOR_CELL = 18;

export interface ColsFit {
  cols: number;
  cellSize: number;
}

/**
 * `availWidth`: độ rộng (px) khu vực hiển thị lưới, đã trừ sẵn padding/viền.
 * Trả về mốc cột phù hợp nhất + cỡ ô tương ứng để render.
 */
export function computeCols(availWidth: number): ColsFit {
  if (!Number.isFinite(availWidth) || availWidth <= 0) {
    return { cols: COL_STEPS[0], cellSize: ABSOLUTE_FLOOR_CELL };
  }

  // Đi từ mốc nhỏ nhất lên, giữ lại mốc lớn nhất mà tại đó mỗi ô vẫn có thể
  // rộng ít nhất MIN_CELL — tức là mốc "gần nhất mà không vượt quá độ rộng
  // khả dụng" theo đúng yêu cầu, ưu tiên phép chia thực tế.
  let chosen: number = COL_STEPS[0];
  for (const step of COL_STEPS) {
    if (step * MIN_CELL <= availWidth) {
      chosen = step;
    } else {
      break;
    }
  }

  const rawCell = availWidth / chosen;
  const cellSize = Math.max(ABSOLUTE_FLOOR_CELL, Math.min(MAX_CELL, Math.floor(rawCell)));

  return { cols: chosen, cellSize };
}

/**
 * Số ô mỗi "bó" giữa 2 đường kẻ đậm trong lưới — LUÔN là 5, theo đúng quy ước
 * 원고지 chuẩn (200자 원고지 chia mỗi dòng 20 ô thành 4 bó × 5 ô), áp dụng
 * đồng nhất cho mọi mốc cột (10, 20, 25 đều chia hết cho 5) thay vì đổi giữa
 * bó 10/bó 5 tuỳ cols như trước.
 */
export function groupSizeForCols(_cols: number): number {
  return 5;
}
