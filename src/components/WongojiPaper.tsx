import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type WongojiLayout, layoutWongoji, nearestSrc } from "../lib/wongojiLayout";
import { computeCols, groupSizeForCols } from "../lib/responsiveCols";
import { gutterMarkAt } from "../lib/gutterMarks";
import { computeRows } from "../lib/pageRows";
import CellGlyph from "./CellGlyph";

/** Đường kẻ đậm NGANG cứ mỗi N dòng — khác nhịp với đường kẻ đậm dọc (bó 5
 * cột, xem groupSizeForCols): bó dòng dùng 4 để khối ô ngắn hơn theo chiều
 * cao, dễ đếm dòng hơn khi viết. */
const ROW_GROUP_SIZE = 4;

export interface WongojiPaperProps {
  text: string;
  onChange: (text: string) => void;
  /** số ô tối thiểu hiển thị khi chưa viết gì (theo mode) — tính ra số dòng
   * dựa trên cols đang render, nên luôn đúng khi resize. */
  minCells: number;
  /** trần tuyệt đối số ô của cả trang — vd 300 cho câu 53, 700 cho câu 54,
   * mô phỏng đúng khổ giấy 원고지 thi thật (không tự thêm dòng vượt quá).
   * Bỏ trống (Viết tự do) = không giới hạn, tự thêm dòng khi viết tới cuối. */
  maxCells?: number;
  /** CSS font-family đầy đủ (đã kèm fallback) — xem data/fonts.ts */
  fontFamily: string;
  /** khoá trang giấy — dùng cho mục 5c (chưa chọn đề ở mode 53/54) */
  disabled?: boolean;
  lockedMessage?: string;
  /** báo layout mới nhất lên component cha (dùng cho fix-list, v.v.) */
  onLayout?: (layout: WongojiLayout) => void;
  className?: string;
}

/**
 * Lưới tương tác trên MÀN HÌNH — responsive, dùng để gõ bài. KHÔNG dùng để
 * in: bản in dùng `PrintPaper` (cỡ ô mm cố định) để tránh lỗi ô bị kéo dài
 * khi trình duyệt tự co giãn theo khổ giấy. Vì vậy component này luôn mang
 * class "no-print".
 */
export default function WongojiPaper({ text, onChange, minCells, maxCells, fontFamily, disabled, lockedMessage, onLayout, className }: WongojiPaperProps) {
  const [caretSrc, setCaretSrc] = useState(0);
  const [focused, setFocused] = useState(false);
  const [fit, setFit] = useState({ cols: 20, cellSize: 38 });

  const taRef = useRef<HTMLTextAreaElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** đo đúng độ rộng khả dụng của lưới (không tính padding riêng của .paper) */
  const gridRef = useRef<HTMLDivElement>(null);

  const cols = fit.cols;
  const cell = fit.cellSize;
  const groupSize = groupSizeForCols(cols);

  const L = useMemo(() => layoutWongoji(text, cols), [text, cols]);

  useEffect(() => {
    onLayout?.(L);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [L]);

  // số dòng cần render — xem lib/pageRows.ts (dùng chung với PrintPaper để 2
  // nơi không lệch nhau): tối thiểu đủ `minCells` khi trang còn trống, tự
  // thêm dòng khi viết tới cuối, và nếu có `maxCells` (câu 53/54) thì trần đó
  // chỉ được cắt bớt dòng TRỐNG thừa — không bao giờ cắt mất nội dung đã gõ.
  const rows = computeRows({ cols, endPos: L.endPos, minCells, maxCells });

  /* responsive cols/cell size — đo thật, re-layout thật (không phải CSS wrap) */
  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      setFit(computeCols(w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const syncCaret = useCallback(() => {
    const el = taRef.current;
    if (el) setCaretSrc(el.selectionStart ?? 0);
  }, []);

  const caretPos = useMemo(() => {
    const hit = L.caretMap.find((e) => e.src >= caretSrc);
    return hit ? hit.pos : L.endPos;
  }, [caretSrc, L]);

  const focusAt = (srcIndex: number) => {
    const el = taRef.current;
    if (!el || disabled) return;
    el.focus();
    const i = Math.min(srcIndex, text.length);
    el.setSelectionRange(i, i);
    setCaretSrc(i);
  };

  return (
    <div
      ref={wrapRef}
      className={`no-print${className ? ` ${className}` : ""}`}
      style={{
        position: "relative",
        background: "var(--paper)",
        padding: "18px 12px 18px 16px",
        borderRadius: "var(--radius-md)",
        cursor: disabled ? "not-allowed" : "text",
      }}
      onMouseDown={(e) => {
        if (disabled) return;
        if (e.target === e.currentTarget) focusAt(text.length);
      }}
    >
      <div style={{ display: "flex" }}>
        {/* Wrapper đo độ rộng khả dụng — flex-grow để lấp hết chỗ trống cho
            ResizeObserver đo đúng, nhưng KHÔNG có viền/nền riêng. Nếu đặt
            viền lưới trực tiếp lên chính div này, phần dư ra giữa
            cols*cell (nội dung thật) và độ rộng đã bị kéo giãn sẽ nằm LỌT
            VÀO trong viền — trông như ô cuối cùng bị kéo dài, không vuông.
            Lưới thật (có viền) vì vậy là một div con, rộng ĐÚNG BẰNG
            cols*cell, không hơn không kém. */}
        <div ref={gridRef} style={{ flex: "1 1 auto", minWidth: 0 }}>
          <div
            style={{
              width: cols * cell,
              fontFamily,
              borderLeft: "1px solid var(--grid)",
              borderRight: "1px solid var(--grid)",
              background: "var(--paper)",
              opacity: disabled ? 0.55 : 1,
            }}
          >
            {Array.from({ length: rows }, (_, r) => {
              // đường kẻ đậm ngang cứ mỗi `ROW_GROUP_SIZE` dòng (4 — khác
              // nhịp với bó cột 5) để dễ đếm dòng hơn. Dòng cuối cùng cũng
              // luôn đậm (đối xứng với viền trên cùng), tạo viền đáy rõ
              // ràng cho cả trang.
              const isRowGroupMark = (r + 1) % ROW_GROUP_SIZE === 0 || r === rows - 1;
              return (
                <div
                  key={r}
                  style={{
                    display: "flex",
                    borderBottom: `1px solid ${isRowGroupMark ? "var(--grid)" : "var(--grid-soft)"}`,
                    borderTop: r === 0 ? "1px solid var(--grid)" : undefined,
                  }}
                >
                {Array.from({ length: cols }, (_, c) => {
                  const p = r * cols + c;
                  const cl = L.cells.get(p);
                  const isCaret = focused && !disabled && caretPos === p;
                  // đường kẻ đậm cứ mỗi `groupSize` ô — đúng quy ước 원고지
                  // (thường là bó 10); nếu cols không chia hết cho 10 (VD 25)
                  // thì hạ xuống bó 5 để các bó đều nhau, tránh kiểu 10:10:5 lệch.
                  const isGroupMark = (c + 1) % groupSize === 0 && c !== cols - 1;
                  return (
                    <div
                      key={c}
                      style={{
                        position: "relative",
                        boxSizing: "border-box",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: c === cols - 1 ? undefined : `1px solid ${isGroupMark ? "var(--grid)" : "var(--grid-soft)"}`,
                        color: "var(--ink)",
                        lineHeight: 1,
                        width: cell,
                        height: cell,
                      }}
                      onMouseDown={(e) => {
                        if (disabled) return;
                        e.preventDefault();
                        focusAt(cl ? cl.start : nearestSrc(L, p, text.length));
                      }}
                    >
                      <CellGlyph cell={cl} fontSize={cl?.narrow ? cell * 0.42 : cell * 0.66} />
                      {isCaret && (
                        <span
                          className="wg-caret"
                          style={{ position: "absolute", left: 1, top: cell * 0.14, height: cell * 0.72, width: 2, background: "var(--accent)" }}
                        />
                      )}
                    </div>
                  );
                })}
                </div>
              );
            })}
          </div>
        </div>

        {/* gutter: số ô tích luỹ — luôn hiện đúng bội số 50 (50, 100, 150...)
            như thước trên giấy trả lời TOPIK thật, bất kể cols đang render
            (xem lib/gutterMarks.ts), tính lại theo cols hiện tại nên luôn
            đúng khi resize. Số neo ở mép dưới (bottom:0) của dòng nó đại
            diện, với line-height bằng đúng font-size để không có khoảng đệm
            trên/dưới dòng chữ (font có leading mặc định) — nhờ vậy mép dưới
            của chữ khớp thẳng luôn với bottom:0, không cần mẹo translateY.

            Mỗi dòng ở đây phải mượn ĐÚNG border (trong suốt, cùng độ dày)
            với dòng lưới bên trái: dòng lưới có borderBottom 1px (+ borderTop
            1px riêng dòng đầu) nên cao hơn `cell` đúng 1-2px — border CỘNG
            THÊM vào content chứ không nằm trong đó, vì đây là chiều cao auto
            theo children (cell con), không phải height khai báo trên chính
            dòng lưới. Nên dòng gutter cũng phải "content: cell + border"
            (content-box), KHÔNG được box-sizing:border-box (mặc định toàn
            cục ở index.css) — nếu không, border sẽ ăn ngược vào 34px đã khai
            báo thay vì cộng thêm, tổng vẫn chỉ ra 34px thay vì 34+1, lại lệch
            y như cũ. */}
        <div style={{ marginLeft: 6, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          {Array.from({ length: rows }, (_, r) => {
            const mark = gutterMarkAt(r, cols);
            return (
              <div
                key={r}
                style={{
                  height: cell,
                  boxSizing: "content-box",
                  position: "relative",
                  fontSize: 10,
                  color: "var(--dim)",
                  borderBottom: "1px solid transparent",
                  borderTop: r === 0 ? "1px solid transparent" : undefined,
                }}
              >
                {mark !== null && (
                  <span style={{ position: "absolute", left: 0, bottom: 0, fontSize: 10, lineHeight: "10px", whiteSpace: "nowrap" }}>{mark}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* invisible input surface — IME gõ ngay trên trang giấy */}
      <textarea
        ref={taRef}
        value={text}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          requestAnimationFrame(syncCaret);
        }}
        onKeyUp={syncCaret}
        onClick={syncCaret}
        onSelect={syncCaret}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        spellCheck={false}
        aria-label="Ô nhập 원고지"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          pointerEvents: "none",
          border: 0,
          resize: "none",
          background: "transparent",
          color: "transparent",
          caretColor: "transparent",
        }}
      />

      {disabled && lockedMessage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(20,25,27,0.28)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div
            style={{
              background: "var(--bg-soft)",
              border: "1px solid var(--line)",
              color: "var(--text)",
              padding: "12px 18px",
              fontSize: 15,
              borderRadius: "var(--radius-sm)",
              maxWidth: 320,
              textAlign: "center",
            }}
          >
            {lockedMessage}
          </div>
        </div>
      )}
    </div>
  );
}
