function fmt(s: number) {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export interface TimerPanelProps {
  secs: number;
  running: boolean;
  onToggle: () => void;
  onReset: () => void;
}

/** Đồng hồ đếm ngược theo thời gian gợi ý của từng câu — start/pause/reset. */
export default function TimerPanel({ secs, running, onToggle, onReset }: TimerPanelProps) {
  return (
    <section className="wg-panel">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, color: "var(--dim)" }}>Thời gian còn lại</span>
        <span style={{ fontSize: 28, fontWeight: 600, fontVariantNumeric: "tabular-nums", color: secs === 0 ? "var(--accent)" : "var(--text)" }}>
          {fmt(secs)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button className={`wg-btn ${running ? "on" : ""}`} style={{ flex: 1 }} onClick={onToggle}>
          {running ? "Tạm dừng" : "Bắt đầu"}
        </button>
        <button className="wg-btn" style={{ flex: 1 }} onClick={onReset}>
          Đặt lại
        </button>
      </div>
    </section>
  );
}
