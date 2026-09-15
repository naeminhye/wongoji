function fmt(s: number) {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export interface TestResultCardProps {
  counted: number;
  min: number;
  max: number;
  timeUsedSecs: number;
  fixes: Record<string, number>;
}

/**
 * Màn hình kết quả sau khi nộp bài ở ⏱ Chế độ thi — chỉ hiện SAU khi nộp
 * (trong lúc làm bài, danh sách tự động chỉnh bị ẩn hoàn toàn để mô phỏng
 * đúng điều kiện thi thật, không có trợ giúp trực tiếp).
 */
export default function TestResultCard({ counted, min, max, timeUsedSecs, fixes }: TestResultCardProps) {
  const inRange = counted >= min && counted <= max;
  const fixEntries = Object.entries(fixes);

  return (
    <section className="wg-panel" style={{ borderColor: inRange ? "var(--grid)" : "var(--accent)" }}>
      <h2 style={{ margin: "0 0 10px", fontSize: 16 }}>Kết quả</h2>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
        <span style={{ color: "var(--dim)" }}>Số 자</span>
        <span style={{ fontWeight: 600, color: inRange ? "var(--grid)" : "var(--accent)" }}>
          {counted} / {min}~{max}자
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 10 }}>
        <span style={{ color: "var(--dim)" }}>Thời gian dùng</span>
        <span style={{ fontWeight: 600 }}>{fmt(timeUsedSecs)}</span>
      </div>
      <p style={{ margin: 0, fontSize: 14, color: inRange ? "var(--grid)" : "var(--accent)" }}>
        {inRange ? "Đạt yêu cầu độ dài." : "Chưa đạt khoảng 자 yêu cầu."}
      </p>

      {fixEntries.length > 0 && (
        <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 10 }}>
          <h3 style={{ margin: "0 0 6px", fontSize: 13, color: "var(--dim)" }}>Chỗ đã tự động chỉnh khi làm bài</h3>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 13.5, lineHeight: 1.7 }}>
            {fixEntries.map(([k, n]) => (
              <li key={k}>
                {k} <span style={{ color: "var(--accent)" }}>×{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
