import { useEffect, useState } from "react";
import { TRAINING_PRESETS, TRAINING_STAGES, splitStageSeconds, type StageKey } from "../data/trainingStages";

export interface TrainingTimelineProps {
  mode: "q53" | "q54";
}

function fmt(s: number) {
  const m = Math.floor(Math.max(s, 0) / 60);
  const r = Math.max(s, 0) % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

/**
 * Đồng hồ nhiều chặng cho 🎯 Chế độ luyện — mỗi bước (lên ý tưởng/dàn ý/viết/
 * rà soát) có đồng hồ start/pause riêng, không ép buộc thứ tự hay khoá bài
 * viết khi hết giờ một chặng (chỉ mang tính gợi ý nhịp độ, không phải thi).
 * Component tự chứa state — App.tsx remount nó bằng `key` mỗi khi đổi
 * mode/đề bài để tự động reset về preset mặc định.
 */
export default function TrainingTimeline({ mode }: TrainingTimelineProps) {
  const presets = TRAINING_PRESETS[mode];
  const [presetIdx, setPresetIdx] = useState(0);
  const [secsByStage, setSecsByStage] = useState<Record<StageKey, number>>(() => splitStageSeconds(presets[0].totalSecs));
  const [runningStage, setRunningStage] = useState<StageKey | null>(null);

  useEffect(() => {
    if (!runningStage) return;
    const id = setInterval(() => {
      setSecsByStage((prev) => ({ ...prev, [runningStage]: Math.max(0, prev[runningStage] - 1) }));
    }, 1000);
    return () => clearInterval(id);
  }, [runningStage]);

  useEffect(() => {
    if (runningStage && secsByStage[runningStage] === 0) setRunningStage(null);
  }, [secsByStage, runningStage]);

  const applyPreset = (idx: number) => {
    setPresetIdx(idx);
    setRunningStage(null);
    setSecsByStage(splitStageSeconds(presets[idx].totalSecs));
  };

  return (
    <section className="wg-panel">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, gap: 8 }}>
        <span style={{ fontSize: 14, color: "var(--dim)" }}>Quy trình luyện tập</span>
        <div style={{ display: "flex", gap: 6 }}>
          <select
            className="wg-select"
            value={presetIdx}
            onChange={(e) => applyPreset(Number(e.target.value))}
            style={{ fontSize: 12.5, padding: "4px 8px" }}
            aria-label="Mốc thời gian luyện tập"
          >
            {presets.map((p, i) => (
              <option key={p.label} value={i}>
                {p.label}
              </option>
            ))}
          </select>
          <button className="wg-btn" style={{ fontSize: 12.5, padding: "4px 10px" }} onClick={() => applyPreset(presetIdx)}>
            Đặt lại
          </button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {TRAINING_STAGES.map((s) => {
          const secs = secsByStage[s.key];
          const isRunning = runningStage === s.key;
          const isDone = secs === 0;
          return (
            <div
              key={s.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 8px",
                borderRadius: "var(--radius-sm)",
                background: isRunning ? "var(--bg)" : "transparent",
              }}
            >
              <span style={{ flex: 1, fontSize: 13.5, color: isDone ? "var(--dim)" : "var(--text)" }}>{s.label}</span>
              <span style={{ fontSize: 14, fontVariantNumeric: "tabular-nums", color: isDone ? "var(--accent)" : "var(--text)" }}>{fmt(secs)}</span>
              <button
                className={`wg-btn ${isRunning ? "on" : ""}`}
                style={{ padding: "4px 10px", fontSize: 12.5 }}
                onClick={() => setRunningStage(isRunning ? null : s.key)}
              >
                {isRunning ? "Dừng" : "Bắt đầu"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
