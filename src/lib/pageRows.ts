/* ────────────────────────────────────────────────────────────────────────────
   Tính số DÒNG cần render cho một trang 원고지 (dùng chung cho lưới tương tác
   trên màn hình và lưới in) — tách ra một hàm thuần để 2 nơi không lặp lại
   cùng một logic dễ lệch nhau khi sửa (chính là nguyên nhân bug: lưới in
   từng dùng một hằng số PRINT_ROWS_MIN cố định, không liên quan gì tới khổ
   trang thật minCells/maxCells của câu 53/54, nên hay phình thêm dòng trống
   thừa không cần thiết — có khi tràn sang cả trang in thứ 2 gần như trống).
   ──────────────────────────────────────────────────────────────────────────── */

export interface ComputeRowsParams {
  /** số cột đang render (responsive trên màn hình, hoặc cố định khi in) */
  cols: number;
  /** `WongojiLayout.endPos` — vị trí liền sau ô cuối cùng đã dùng */
  endPos: number;
  /** số ô tối thiểu hiển thị khi trang còn trống */
  minCells: number;
  /** trần tuyệt đối số ô của cả trang (câu 53/54: 300/700) — bỏ trống = không
   * giới hạn (Viết tự do). */
  maxCells?: number;
}

/**
 * Trả về số dòng cần render. Trần (`maxCells`) chỉ được phép cắt bớt DÒNG
 * TRỐNG THỪA chưa viết tới — tuyệt đối không cắt xuống dưới mức cần để hiển
 * thị đủ nội dung đã gõ, nếu không nội dung hợp lệ (vẫn trong hạn mức 자) sẽ
 * âm thầm biến mất khỏi trang (xem lib/pageRows.test.ts).
 */
export function computeRows({ cols, endPos, minCells, maxCells }: ComputeRowsParams): number {
  const minRows = Math.max(1, Math.ceil(minCells / cols));
  // số dòng TỐI THIỂU để không che mất ô đã gõ — không đệm thêm. Đoạn văn có
  // dòng trống giữa các đoạn (\n\n) hoặc ngoặc mở bị đẩy xuống dòng dưới sẽ
  // "lãng phí" một số ô trống không tính vào 자 (counted) nhưng vẫn chiếm chỗ
  // thật trên lưới, nên số ô vật lý cần dùng có thể vượt quá 자-count.
  const contentRows = Math.floor(Math.max(endPos - 1, 0) / cols) + 1;
  const grownRows = contentRows + 1; // tự thêm dòng khi viết tới cuối
  let rows = Math.max(minRows, grownRows);
  if (maxCells != null) {
    const capRows = Math.max(1, Math.floor(maxCells / cols));
    rows = Math.max(contentRows, Math.min(rows, capRows));
  }
  return rows;
}
