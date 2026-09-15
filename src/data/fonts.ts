/**
 * Font cho nội dung trang giấy 원고지 — nạp qua Google Fonts trong
 * index.html. Gowun Batang là mặc định (nét bút thư pháp nhẹ, dễ đọc khi
 * luyện thi); các font còn lại người dùng có thể tự đổi qua dropdown trên
 * header, gồm cả vài font kiểu viết tay để luyện cho vui.
 */
export interface FontOption {
  id: string;
  label: string;
  /** family CSS đầy đủ kèm fallback */
  family: string;
}

export const FONT_OPTIONS: FontOption[] = [
  { id: "gowun-batang", label: "Gowun Batang", family: "'Gowun Batang', 'Nanum Myeongjo', serif" },
  { id: "noto-serif-kr", label: "Noto Serif KR", family: "'Noto Serif KR', serif" },
  { id: "gothic-a1", label: "Gothic A1", family: "'Gothic A1', 'Apple SD Gothic Neo', sans-serif" },
  { id: "nanum-pen-script", label: "Nanum Pen Script", family: "'Nanum Pen Script', cursive" },
  { id: "dongle", label: "Dongle", family: "'Dongle', sans-serif" },
  { id: "gamja-flower", label: "Gamja Flower", family: "'Gamja Flower', cursive" },
  { id: "hi-melody", label: "Hi Melody", family: "'Hi Melody', cursive" },
  { id: "cute-font", label: "Cute Font", family: "'Cute Font', cursive" },
];

export const DEFAULT_FONT_ID = "gowun-batang";

export function resolveFontFamily(id: string): string {
  return FONT_OPTIONS.find((f) => f.id === id)?.family ?? FONT_OPTIONS[0].family;
}
