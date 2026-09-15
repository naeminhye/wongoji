/* ────────────────────────────────────────────────────────────────────────────
   Số đánh dấu ở gutter (cột phụ bên cạnh lưới, ghi số ô tích luỹ) — giống
   thước đo trên giấy trả lời TOPIK thật: luôn hiện đúng bội số 50 (50, 100,
   150, 200...), bất kể `cols` đang render là bao nhiêu.

   Không thể chỉ "cứ mỗi N dòng lại đánh dấu" như trước (N cố định) vì cột
   tích luỹ mỗi dòng là `cols` ô — nếu 50 không chia hết cho `cols` (VD 20),
   mốc 50/100/150 sẽ không bao giờ rơi đúng vào một ranh giới dòng. Thay vào
   đó, mỗi dòng được đánh dấu bằng bội số 50 LỚN NHẤT mà dòng đó "vượt qua"
   (nếu có) — tự nhiên bám sát đúng thứ tự 50/100/150/... mà vẫn luôn nằm ở
   một ranh giới dòng thật, dùng được với mọi `cols`.
   ──────────────────────────────────────────────────────────────────────────── */

export const GUTTER_MARK_INTERVAL = 50;

/**
 * Trả về số cần hiện ở gutter cho dòng thứ `rowIndex` (0-based), hoặc `null`
 * nếu dòng đó không phải là dòng "vượt qua" một mốc bội số của `interval`.
 * Hàm thuần, không cần biết trạng thái các dòng trước — chỉ cần so sánh mốc
 * bội số đã đạt được ở cuối dòng này với cuối dòng trước.
 */
export function gutterMarkAt(rowIndex: number, cols: number, interval: number = GUTTER_MARK_INTERVAL): number | null {
  if (cols <= 0 || interval <= 0) return null;
  const cum = cols * (rowIndex + 1);
  const prevCum = cols * rowIndex;
  const step = Math.floor(cum / interval);
  if (step > 0 && step > Math.floor(prevCum / interval)) {
    return step * interval;
  }
  return null;
}
