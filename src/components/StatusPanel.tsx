/**
 * Bộ đếm 자 tổng DUY NHẤT (mục 3 của spec) — thay hoàn toàn cho kiểu đánh số
 * tích lũy theo từng dòng trong lưới cũ. Không phụ thuộc số cột đang render:
 * `counted` truyền vào đây phải luôn đến từ `countWongoji()`, không phải
 * `.counted` của một layout ở cols hiện tại.
 */
export interface StatusPanelProps {
  counted: number;
  min: number;
  max: number;
  rowsUsed: number;
}

export default function StatusPanel({ counted, min, max, rowsUsed }: StatusPanelProps) {
  const hasRange = max > 0;
  const inRange = hasRange ? counted >= min && counted <= max : true;
  const overMax = hasRange ? counted > max : false;
  const pct = hasRange ? Math.min(counted / max, 1) : 0;
  const minMarkerPct = hasRange ? (min / max) * 100 : 0;

  return (
    <section className="wg-panel">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span
          style={{
            fontSize: 38,
            fontWeight: 700,
            color: overMax ? "var(--accent)" : inRange && hasRange ? "var(--grid)" : "var(--text)",
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {counted}
        </span>
        <span style={{ fontSize: 15, color: "var(--dim)" }}>자 {hasRange ? `/ ${min}~${max}` : ""}</span>
      </div>

      {hasRange && (
        <div style={{ height: 4, background: "var(--line)", marginTop: 12, position: "relative" }}>
          <div style={{ width: `${pct * 100}%`, height: "100%", background: overMax ? "var(--accent)" : "var(--grid)" }} />
          <div
            title={`Tối thiểu ${min}자`}
            style={{ position: "absolute", left: `${minMarkerPct}%`, top: -3, width: 1, height: 10, background: "var(--dim)" }}
          />
        </div>
      )}

      <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--dim)", lineHeight: 1.6 }}>
        {!hasRange
          ? `Đã dùng ${rowsUsed} dòng`
          : overMax
            ? `Vượt ${counted - max}자 — TOPIK trừ điểm khi ra ngoài khoảng.`
            : counted < min
              ? `Còn thiếu ${min - counted}자.`
              : "Nằm trong khoảng yêu cầu."}
      </p>
    </section>
  );
}
