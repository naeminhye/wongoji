/**
 * Quy trình 4 bước cho 🎯 Chế độ luyện (Training Mode) — tham khảo hành vi
 * của 훈련 모드 trên wongoji.com (브레인스토밍 → 개요 작성 → 쓰기 → 검토, mỗi
 * bước có đồng hồ riêng, start/pause độc lập), không sao chép giao diện.
 */
export type StageKey = "brainstorm" | "outline" | "write" | "review";

export interface StageDef {
  key: StageKey;
  label: string;
  /** tỉ lệ thời gian gợi ý trong tổng ngân sách — cộng lại = 1 */
  ratio: number;
}

export const TRAINING_STAGES: StageDef[] = [
  { key: "brainstorm", label: "Lên ý tưởng", ratio: 0.15 },
  { key: "outline", label: "Lập dàn ý", ratio: 0.15 },
  { key: "write", label: "Viết bài", ratio: 0.6 },
  { key: "review", label: "Rà soát", ratio: 0.1 },
];

/** Chia tổng thời gian thành 4 mốc theo tỉ lệ ở trên, làm tròn 30 giây cho dễ nhìn. */
export function splitStageSeconds(totalSecs: number): Record<StageKey, number> {
  const out = {} as Record<StageKey, number>;
  for (const s of TRAINING_STAGES) {
    out[s.key] = Math.max(30, Math.round((totalSecs * s.ratio) / 30) * 30);
  }
  return out;
}

export interface TrainingPreset {
  label: string;
  totalSecs: number;
}

/** Mốc thời gian gợi ý — theo đúng thời lượng làm bài chính thức của mỗi câu, cộng thêm một mốc "Nhanh" để luyện ngắn. */
export const TRAINING_PRESETS: Record<"q53" | "q54", TrainingPreset[]> = {
  q53: [
    { label: "Câu 53 — 12 phút", totalSecs: 12 * 60 },
    { label: "Nhanh — 5 phút", totalSecs: 5 * 60 },
  ],
  q54: [
    { label: "Câu 54 — 40 phút", totalSecs: 40 * 60 },
    { label: "Nhanh — 10 phút", totalSecs: 10 * 60 },
  ],
};
