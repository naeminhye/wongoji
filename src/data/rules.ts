/**
 * Bảng quy tắc 원고지 hiển thị trong modal "원고지 규칙" (mục 4 của spec).
 * Nội dung đối chiếu trực tiếp với mục 1 của wongoji-prompt.md.
 */
export interface WongojiRule {
  title: string;
  detail: string;
}

export const WONGOJI_RULES: WongojiRule[] = [
  {
    title: "한 칸에 한 자 — 1 ô = 1 âm tiết",
    detail: "Mỗi khối âm tiết Hangul/Hanja hoàn chỉnh chiếm đúng 1 ô.",
  },
  {
    title: "숫자 · 로마자 소문자 — Số & chữ Latin thường",
    detail: "2 ký tự / ô, ghép từ trái sang phải (vd: 20 → 1 ô; 365 → 36 + 5).",
  },
  {
    title: "로마자 대문자 — Chữ Latin HOA",
    detail: "1 ký tự / ô.",
  },
  {
    title: "띄어쓰기 — Dấu cách",
    detail: "Chiếm 1 ô; nếu rơi đúng ô đầu dòng thì bỏ, viết tiếp luôn không lùi dòng.",
  },
  {
    title: "들여쓰기 — Thụt đầu dòng",
    detail: "Dòng đầu bài và mỗi đoạn mới (sau khi xuống dòng) đều chừa trống ô đầu tiên.",
  },
  {
    title: "마침표 · 쉼표 · 콜론 · 세미콜론 — . , : ;",
    detail: "Chiếm 1 ô, KHÔNG chừa ô trống phía sau.",
  },
  {
    title: "느낌표 · 물음표 — ! ?",
    detail: "Chiếm 1 ô, bắt buộc chừa đúng 1 ô trống phía sau.",
  },
  {
    title: "줄 첫 칸의 문장부호 — Dấu câu đầu dòng",
    detail: "Không được đứng ở ô đầu dòng mới → viết tràn ra ngoài lề, ngay cạnh ký tự cuối dòng trên.",
  },
  {
    title: "말줄임표 — ……",
    detail: "Chiếm 2 ô; nếu có dấu . theo ngay sau, dấu chấm nhập chung vào ô cuối của ……",
  },
  {
    title: "따옴표 — Ngoặc kép “ ” và ngoặc đơn ‘ ’",
    detail: "Viết lệch về góc ô; nếu ngoặc đóng đi liền sau . hoặc , thì dùng chung 1 ô (vd: .”).",
  },
  {
    title: "줄 끝의 여는 괄호 — Ngoặc mở cuối dòng",
    detail: "Không được đứng ở ô cuối dòng → đẩy xuống đầu dòng sau.",
  },
  {
    title: "제목 금지 — Không viết tiêu đề",
    detail: "53번 / 54번 vào bài trực tiếp, không có dòng tiêu đề.",
  },
];
