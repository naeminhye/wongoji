/**
 * Kiểu ô của trang giấy — "Chuẩn TOPIK" (mặc định, giữ nguyên hành vi cũ) vs
 * "Thông thường" (mỗi dòng tách rời, chừa khoảng trống ở giữa để ghi chú/sửa
 * bài — tham khảo mẫu giấy luyện viết phổ thông, không phải 원고지 thi thật).
 */
export type CellStyle = "topik" | "plain";

export interface CellStyleOption {
  id: CellStyle;
  label: string;
  desc: string;
}

export const CELL_STYLE_OPTIONS: CellStyleOption[] = [
  {
    id: "topik",
    label: "Chuẩn TOPIK",
    desc: "Viền đậm cứ mỗi 4 dòng / 5 cột, đúng khổ giấy thi thật — các dòng liền sát nhau.",
  },
  {
    id: "plain",
    label: "Thông thường",
    desc: "Mỗi dòng tách rời nhau, chừa khoảng trống ở giữa để ghi chú hoặc sửa bài nếu cần.",
  },
];

export const DEFAULT_CELL_STYLE: CellStyle = "topik";
