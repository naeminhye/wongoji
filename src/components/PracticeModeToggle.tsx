export type PracticeMode = "training" | "test";

export interface PracticeModeToggleProps {
  value: PracticeMode;
  onChange: (v: PracticeMode) => void;
}

/**
 * Chuyển giữa 🎯 Chế độ luyện (nhiều chặng, có trợ giúp) và ⏱ Chế độ thi
 * (một mốc giờ duy nhất, không trợ giúp cho tới khi nộp bài) — chỉ áp dụng
 * cho câu 53/54; Viết tự do không có khái niệm thi/luyện nên không hiện.
 */
export default function PracticeModeToggle({ value, onChange }: PracticeModeToggleProps) {
  return (
    <div style={{ display: "flex", gap: 6 }} role="group" aria-label="Chọn chế độ luyện hoặc thi">
      <button
        className={`wg-btn ${value === "training" ? "on" : ""}`}
        title="Nhiều chặng (ý tưởng/dàn ý/viết/rà soát), có nháp và gợi ý lỗi trong lúc viết"
        onClick={() => onChange("training")}
      >
        🎯 Chế độ luyện
      </button>
      <button
        className={`wg-btn ${value === "test" ? "on" : ""}`}
        title="Một mốc giờ duy nhất, không tạm dừng — không có nháp/gợi ý cho tới khi nộp bài"
        onClick={() => onChange("test")}
      >
        ⏱ Chế độ thi
      </button>
    </div>
  );
}
