/**
 * Bảng màu đường kẻ / màu chữ cho phép chọn (mục "Thêm tính năng chọn màu
 * đường kẻ và màu chữ") — CHỈ giới hạn ở vài màu đậm thông dụng khi viết tay
 * (bút bi/bút mực), không cho chọn tuỳ ý để tránh màu nhạt khó đọc/khó in.
 */
export type ColorId = "green" | "blue" | "black" | "brown" | "red";

export interface ColorOption {
  id: ColorId;
  label: string;
  /** dùng cho chữ, khung ngoài, và đường kẻ đậm (bó dòng/cột — kiểu Chuẩn
   * TOPIK) hoặc TOÀN BỘ đường kẻ (kiểu Thông thường, không phân biệt đậm/nhạt). */
  bold: string;
  /** đường kẻ mảnh giữa các ô thường — chỉ dùng cho viền ở kiểu Chuẩn TOPIK,
   * không dùng cho chữ. */
  soft: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: "green", label: "Xanh lá cây đậm", bold: "#3f7a5c", soft: "#a9c2ae" },
  { id: "blue", label: "Xanh lam", bold: "#1f4e8c", soft: "#a9bfdb" },
  { id: "black", label: "Đen", bold: "#1b1a15", soft: "#b3b0a8" },
  { id: "brown", label: "Nâu", bold: "#6b4226", soft: "#cbb08e" },
  { id: "red", label: "Đỏ đậm", bold: "#8c2f2f", soft: "#d9a8a8" },
];

export const DEFAULT_LINE_COLOR: ColorId = "green";
export const DEFAULT_INK_COLOR: ColorId = "black";

export function resolveColor(id: ColorId): ColorOption {
  return COLOR_OPTIONS.find((c) => c.id === id) ?? COLOR_OPTIONS[0];
}
