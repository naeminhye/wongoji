/**
 * Đề mẫu cho mode 53번 và 54번 — nội dung 원문 tiếng Hàn kèm bản dịch/tóm tắt
 * tiếng Việt ngắn để hiểu đề (mục 5 của spec).
 */
export type PromptSource = "sample" | "text" | "image";

export interface WongojiPrompt {
  id: string;
  title: string;
  body: string;
  vn: string;
  source: PromptSource;
  /** chỉ có khi source === "image" — cho phép nhiều ảnh (đề nhiều trang/ảnh chụp nhiều góc) */
  imageDataUrls?: string[];
}

export const SAMPLE_PROMPTS: Record<"q53" | "q54", WongojiPrompt[]> = {
  q53: [
    {
      id: "q53-1",
      source: "sample",
      title: "1인 가구 증가 현황",
      body: `다음을 참고하여 '1인 가구의 증가'에 대한 글을 200~300자로 쓰시오. 단, 글의 제목을 쓰지 마시오.

· 조사 기관: 통계청
· 1인 가구 비율: 2000년 15% → 2010년 24% → 2023년 35%
· 증가 원인: 결혼 연령 상승, 고령화
· 전망: 2035년 40% 이상`,
      vn: "Mô tả biểu đồ tỉ lệ hộ độc thân, nêu nguyên nhân và dự báo.",
    },
    {
      id: "q53-2",
      source: "sample",
      title: "직장인 점심시간 활용",
      body: `다음을 참고하여 '직장인의 점심시간 활용'에 대한 글을 200~300자로 쓰시오. 단, 글의 제목을 쓰지 마시오.

· 조사 대상: 직장인 1,000명
· 활용 방법: 산책 42%, 낮잠 31%, 취미 활동 18%, 기타 9%
· 이유 1위: 오후 업무 능률을 높이기 위해
· 이유 2위: 스트레스를 풀기 위해`,
      vn: "Mô tả kết quả khảo sát cách nhân viên văn phòng sử dụng giờ nghỉ trưa.",
    },
    {
      id: "q53-3",
      source: "sample",
      title: "국내 여행객 변화",
      body: `다음을 참고하여 '국내 여행객 수의 변화'에 대한 글을 200~300자로 쓰시오. 단, 글의 제목을 쓰지 마시오.

· 자료: 한국관광공사
· 국내 여행객: 2019년 3,000만 명 → 2021년 1,200만 명 → 2024년 3,800만 명
· 감소 원인: 감염병 확산
· 증가 원인: 여행 수요 회복, 지역 축제 확대`,
      vn: "Mô tả biến động lượng khách du lịch nội địa và lý do tăng/giảm.",
    },
  ],
  q54: [
    {
      id: "q54-1",
      source: "sample",
      title: "실패의 가치",
      body: `다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰시오. 단, 문제를 그대로 옮겨 쓰지 마시오.

사람은 누구나 실패를 경험한다. 그러나 실패를 대하는 태도에 따라 그 결과는 크게 달라진다. 아래의 내용을 중심으로 '실패의 가치'에 대해 자신의 생각을 쓰라.

· 실패가 주는 긍정적인 영향은 무엇인가?
· 실패를 두려워하는 이유는 무엇인가?
· 실패를 성장으로 바꾸기 위해 필요한 태도는 무엇인가?`,
      vn: "Nghị luận về giá trị của thất bại — ảnh hưởng tích cực, lý do sợ thất bại, thái độ cần có.",
    },
    {
      id: "q54-2",
      source: "sample",
      title: "기술 발전과 인간관계",
      body: `다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰시오. 단, 문제를 그대로 옮겨 쓰지 마시오.

통신 기술의 발전으로 사람들은 언제 어디서나 연결될 수 있게 되었다. 그러나 관계가 더 깊어졌는지에 대해서는 의견이 갈린다. 아래의 내용을 중심으로 자신의 생각을 쓰라.

· 기술 발전이 인간관계에 미친 긍정적인 영향은 무엇인가?
· 부정적인 영향은 무엇인가?
· 바람직한 관계를 위해 어떤 노력이 필요한가?`,
      vn: "Nghị luận về công nghệ và quan hệ con người — mặt tích cực, tiêu cực, giải pháp.",
    },
    {
      id: "q54-3",
      source: "sample",
      title: "칭찬의 양면성",
      body: `다음을 주제로 하여 자신의 생각을 600~700자로 글을 쓰시오. 단, 문제를 그대로 옮겨 쓰지 마시오.

칭찬은 사람을 성장하게 하는 힘이 있지만, 지나친 칭찬은 오히려 부담이 되기도 한다. 아래의 내용을 중심으로 '칭찬의 양면성'에 대해 자신의 생각을 쓰라.

· 칭찬이 필요한 이유는 무엇인가?
· 지나친 칭찬의 문제점은 무엇인가?
· 효과적으로 칭찬하는 방법은 무엇인가?`,
      vn: "Nghị luận về tính hai mặt của lời khen.",
    },
  ],
};

export interface ModeConfig {
  key: "q53" | "q54" | "free";
  label: string;
  desc: string;
  min: number;
  max: number;
  /** số ô tối thiểu hiển thị khi trang còn trống — WongojiPaper tự quy ra số
   * dòng theo cols đang render. */
  minCells: number;
  /** trần tuyệt đối số ô của cả trang, đúng khổ giấy thi thật — câu 53 tối đa
   * 300 ô, câu 54 tối đa 700 ô, không tự phình thêm dòng dù viết vượt quá.
   * Viết tự do không có trần: mặc định hiện sẵn 700 ô rồi tự thêm dòng khi
   * viết tới cuối. */
  maxCells?: number;
  /** thời gian gợi ý, giây */
  timer: number;
  /** có bắt buộc chọn đề trước khi viết không (mục 5c) */
  requiresPrompt: boolean;
}

export const MODES: Record<"q53" | "q54" | "free", ModeConfig> = {
  q53: { key: "q53", label: "Câu 53", desc: "Mô tả số liệu · 200–300자 · 30 điểm", min: 200, max: 300, minCells: 300, maxCells: 300, timer: 12 * 60, requiresPrompt: true },
  q54: { key: "q54", label: "Câu 54", desc: "Nghị luận chủ đề · 600–700자 · 50 điểm", min: 600, max: 700, minCells: 700, maxCells: 700, timer: 40 * 60, requiresPrompt: true },
  free: { key: "free", label: "Viết tự do", desc: "Viết tự do, không giới hạn", min: 0, max: 0, minCells: 700, timer: 20 * 60, requiresPrompt: false },
};
