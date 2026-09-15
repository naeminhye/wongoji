import { layoutWongoji } from "../lib/wongojiLayout";
import { groupSizeForCols } from "../lib/responsiveCols";
import { gutterMarkAt } from "../lib/gutterMarks";
import { computeRows } from "../lib/pageRows";
import CellGlyph from "./CellGlyph";

/** Số ô/dòng khi in — cố định 25 (khớp mốc tối đa của lưới responsive trên
 * màn hình, xem COL_STEPS trong responsiveCols.ts), KHÔNG theo cols đang
 * render thật trên màn hình lúc bấm in. Tách biệt hoàn toàn khỏi
 * REFERENCE_COLS (20, dùng riêng để tính 자 — xem wongojiLayout.ts): đổi số
 * cột hiển thị khi in không được phép ảnh hưởng tới cách đếm 자, vốn phải ổn
 * định bất kể lưới hiển thị ra sao. */
const PRINT_COLS = 25;
/** Đường kẻ đậm dọc cứ mỗi PRINT_GROUP_SIZE ô (bó cột — luôn 5). */
const PRINT_GROUP_SIZE = groupSizeForCols(PRINT_COLS);
/** Đường kẻ đậm ngang cứ mỗi PRINT_ROW_GROUP_SIZE dòng — khác nhịp với bó
 * cột, bó dòng dùng 4 để dễ đếm dòng hơn, giống lưới màn hình. */
const PRINT_ROW_GROUP_SIZE = 4;
/** Tổng bề rộng lưới in (mm) — giữ nguyên 160mm đã kiểm chứng vừa khít bề
 * rộng in được của A4 (~186mm với @page margin 12mm mỗi bên, còn dư chỗ cho
 * cột gutter) mà không cần trình duyệt tự co giãn gì thêm; chỉ chia lại cho
 * PRINT_COLS mới (25 thay vì 20 trước đây) để suy ra cỡ 1 ô. */
const PRINT_GRID_WIDTH_MM = 160;
/** Cỡ 1 ô khi in (mm) — cùng giá trị cho width & height nên luôn vuông. */
const PRINT_CELL_MM = PRINT_GRID_WIDTH_MM / PRINT_COLS;

export interface PrintPaperProps {
  /** truyền "" để in giấy trống (chỉ khung ô, không chữ) */
  text: string;
  /** CSS font-family đầy đủ (đã kèm fallback) — xem data/fonts.ts */
  fontFamily: string;
  /** số ô tối thiểu hiển thị khi trang còn trống — TRUYỀN TỪ cfg.minCells
   * của mode đang in (câu 53/54/Viết tự do), giống hệt WongojiPaper, để bản
   * in ra đúng khổ trang của câu đang làm thay vì một hằng số chung chung. */
  minCells: number;
  /** trần tuyệt đối số ô của cả trang (câu 53/54: 300/700) — bỏ trống = Viết
   * tự do, không giới hạn. */
  maxCells?: number;
}

/**
 * Lưới in — hoàn toàn tách biệt khỏi WongojiPaper (lưới tương tác responsive
 * trên màn hình). Lý do tách riêng: nếu in trực tiếp lưới responsive (kích
 * thước ô tính bằng px theo độ rộng cửa sổ), khi độ rộng render vượt quá khổ
 * giấy, trình duyệt "fit to page" co giãn bề rộng nhưng không co bề cao
 * tương ứng — ô bị kéo dài, không còn vuông. Lưới in vì vậy luôn dùng
 * PRINT_COLS cố định + ô cỡ mm nhỏ vừa đủ để không bao giờ cần co giãn.
 *
 * Số dòng dùng chung `computeRows` với WongojiPaper (xem lib/pageRows.ts) —
 * trước đây có một hằng số PRINT_ROWS_MIN=32 riêng, không liên quan gì tới
 * khổ trang thật (minCells/maxCells) của câu đang in, nên hay phình thêm
 * dòng trống thừa không cần thiết, có khi tràn sang cả trang in thứ 2 gần
 * như trống dù nội dung đã đủ vừa 1 trang.
 */
export default function PrintPaper({ text, fontFamily, minCells, maxCells }: PrintPaperProps) {
  const L = layoutWongoji(text, PRINT_COLS);
  const rows = computeRows({ cols: PRINT_COLS, endPos: L.endPos, minCells, maxCells });

  return (
    <div className="print-only">
      <div style={{ display: "flex" }}>
        <div
          style={{
            fontFamily,
            borderLeft: "0.3mm solid #3f7a5c",
            borderRight: "0.3mm solid #3f7a5c",
            background: "#fffcf3",
            color: "#1b1a15",
          }}
        >
          {Array.from({ length: rows }, (_, r) => {
            // đường kẻ đậm ngang cứ mỗi PRINT_ROW_GROUP_SIZE dòng (4 — khác
            // nhịp với bó cột 5, giống lưới màn hình). Dòng cuối cùng cũng
            // luôn đậm, đối xứng với viền trên cùng của trang.
            const isRowGroupMark = (r + 1) % PRINT_ROW_GROUP_SIZE === 0 || r === rows - 1;
            return (
              <div
                key={r}
                style={{
                  display: "flex",
                  borderBottom: `0.2mm solid ${isRowGroupMark ? "#3f7a5c" : "#a9c2ae"}`,
                  borderTop: r === 0 ? "0.3mm solid #3f7a5c" : undefined,
                }}
              >
              {Array.from({ length: PRINT_COLS }, (_, c) => {
                const p = r * PRINT_COLS + c;
                const cl = L.cells.get(p);
                // đường kẻ đậm cứ mỗi PRINT_GROUP_SIZE ô — giống lưới màn hình
                const isGroupMark = (c + 1) % PRINT_GROUP_SIZE === 0 && c !== PRINT_COLS - 1;
                return (
                  <div
                    key={c}
                    style={{
                      position: "relative",
                      boxSizing: "border-box",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: c === PRINT_COLS - 1 ? undefined : `0.2mm solid ${isGroupMark ? "#3f7a5c" : "#a9c2ae"}`,
                      width: `${PRINT_CELL_MM}mm`,
                      height: `${PRINT_CELL_MM}mm`,
                      lineHeight: 1,
                    }}
                  >
                    <CellGlyph cell={cl} fontSize={cl?.narrow ? `${PRINT_CELL_MM * 0.42}mm` : `${PRINT_CELL_MM * 0.66}mm`} />
                  </div>
                );
              })}
              </div>
            );
          })}
        </div>

        {/* gutter: số ô tích luỹ — luôn hiện đúng bội số 50 (50, 100, 150...)
            như thước trên giấy trả lời TOPIK thật (xem lib/gutterMarks.ts),
            cùng logic với lưới màn hình: số đè lên đường kẻ ngang phân cách
            (translateY 50%) thay vì nằm giữa dòng.

            Mỗi dòng ở đây phải mượn ĐÚNG border (trong suốt, cùng độ dày)
            với dòng lưới bên trái — dòng lưới cao hơn height khai báo đúng
            bằng độ dày border (0.2mm, dòng đầu +0.3mm nữa) vì border CỘNG
            THÊM vào content (chiều cao đó vốn auto theo ô con, không phải
            height khai báo trên chính dòng lưới). Vì vậy dòng gutter cũng
            phải content-box (không dùng box-sizing:border-box mặc định toàn
            cục ở index.css) để border cộng thêm giống vậy — nếu không, border
            sẽ ăn ngược vào PRINT_CELL_MM đã khai báo, tổng vẫn ra đúng
            PRINT_CELL_MM thay vì +0.2/0.3mm, lại lệch y như cũ. */}
        <div style={{ marginLeft: "1.5mm", display: "flex", flexDirection: "column" }}>
          {Array.from({ length: rows }, (_, r) => {
            const mark = gutterMarkAt(r, PRINT_COLS);
            return (
              <div
                key={r}
                style={{
                  height: `${PRINT_CELL_MM}mm`,
                  boxSizing: "content-box",
                  position: "relative",
                  fontSize: "2.6mm",
                  color: "#756f5c",
                  borderBottom: "0.2mm solid transparent",
                  borderTop: r === 0 ? "0.3mm solid transparent" : undefined,
                }}
              >
                {mark !== null && (
                  <span style={{ position: "absolute", left: 0, bottom: 0, transform: "translateY(50%)", whiteSpace: "nowrap" }}>{mark}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
