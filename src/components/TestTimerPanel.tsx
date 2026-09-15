function fmt(s: number) {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export interface TestTimerPanelProps {
  secs: number;
  totalSecs: number;
  started: boolean;
  finished: boolean;
  onStart: () => void;
  onSubmit: () => void;
  onRetry: () => void;
}

/**
 * Đồng hồ ⏱ Chế độ thi — mô phỏng điều kiện thi thật: một mốc thời gian duy
 * nhất, chạy liên tục KHÔNG tạm dừng được sau khi bắt đầu (khác hẳn đồng hồ
 * nhiều chặng của 🎯 Chế độ luyện). Bài viết bị khoá cho tới khi bấm "Bắt đầu
 * làm bài", và khoá lại sau khi nộp bài/hết giờ — xem TestResultCard cho màn
 * hình kết quả hiện ra sau đó.
 */
export default function TestTimerPanel({ secs, totalSecs, started, finished, onStart, onSubmit, onRetry }: TestTimerPanelProps) {
  return (
    <section className="wg-panel">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, color: "var(--dim)" }}>{finished ? "Đã nộp bài" : "Thời gian làm bài"}</span>
        <span style={{ fontSize: 28, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: secs === 0 ? "var(--accent)" : "var(--text)" }}>
          {fmt(secs)}
        </span>
      </div>

      {!started && !finished && (
        <>
          <p style={{ margin: "10px 0 0", fontSize: 13, color: "var(--dim)", lineHeight: 1.6 }}>
            Đồng hồ chạy liên tục {fmt(totalSecs)}, không tạm dừng được — mô phỏng điều kiện thi thật.
          </p>
          <button className="wg-btn on" style={{ width: "100%", marginTop: 10 }} onClick={onStart}>
            Bắt đầu làm bài
          </button>
        </>
      )}

      {started && !finished && (
        <button className="wg-btn danger" style={{ width: "100%", marginTop: 12 }} onClick={onSubmit}>
          Nộp bài
        </button>
      )}

      {finished && (
        <button className="wg-btn" style={{ width: "100%", marginTop: 12 }} onClick={onRetry}>
          Làm lại
        </button>
      )}
    </section>
  );
}
