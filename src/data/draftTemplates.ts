/**
 * Gợi ý cấu trúc cho khu vực brainstorm/viết nháp (mục 5b) — chỉ là PLACEHOLDER
 * trong một ô nhập tự do duy nhất, không tách thành nhiều field cố định.
 * Lý do: đề bài (프롬프트) có thể thay đổi bất cứ lúc nào và không phải đề nào
 * cũng khớp với đúng khung 3-4 phần cứng nhắc, nên khung chỉ mang tính gợi ý.
 */
export const DRAFT_PLACEHOLDER: Record<"q53" | "q54" | "free", string> = {
  q53: "Gợi ý khung: mô tả số liệu/xu hướng → nguyên nhân → kết luận/dự báo.\n\nGhi ý tưởng, số liệu, từ vựng định dùng...",
  q54: "Gợi ý khung: 서론 (mở bài) – 본론 (thân bài, 2 luận điểm) – 결론 (kết luận).\n\nGhi ý tưởng, dàn ý, từ vựng/ngữ pháp định dùng...",
  free: "Ghi ý tưởng, từ vựng, ngữ pháp định dùng...",
};
