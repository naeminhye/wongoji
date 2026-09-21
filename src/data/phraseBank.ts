/**
 * Ngân hàng cụm từ theo dạng đề — câu 53 (mô tả số liệu) và câu 54 (nghị
 * luận) dùng hai bộ cụm từ hoàn toàn khác nhau nên tách theo mode, giống
 * cách MODES/DRAFT_PLACEHOLDER đang tách. Chỉ là gợi ý cụm từ hay dùng
 * trong văn viết TOPIK, không phải bản dịch máy theo câu.
 */
export interface Phrase {
  kr: string;
  vn: string;
}

export interface PhraseCategory {
  id: string;
  label: string;
  phrases: Phrase[];
}

export const PHRASE_BANK: Record<"q53" | "q54", PhraseCategory[]> = {
  q53: [
    {
      id: "intro",
      label: "Mở đầu giới thiệu số liệu",
      phrases: [
        { kr: "~에 대해 조사한 결과", vn: "kết quả khảo sát về ~" },
        { kr: "~에 따르면", vn: "theo ~ (nguồn số liệu)" },
        { kr: "~을/를 살펴보면 다음과 같다", vn: "nhìn vào ~ ta thấy như sau" },
      ],
    },
    {
      id: "trend-up",
      label: "Xu hướng tăng",
      phrases: [
        { kr: "~이/가 증가한 것으로 나타났다", vn: "~ được cho thấy là đã tăng" },
        { kr: "~년에 비해 크게 늘어났다", vn: "so với năm ~, đã tăng lên đáng kể" },
        { kr: "꾸준히 증가하는 추세를 보이고 있다", vn: "có xu hướng tăng đều đặn" },
      ],
    },
    {
      id: "trend-down",
      label: "Xu hướng giảm",
      phrases: [
        { kr: "~이/가 감소한 것으로 나타났다", vn: "~ được cho thấy là đã giảm" },
        { kr: "~로 줄어들었다", vn: "đã giảm xuống còn ~" },
        { kr: "점차 감소하는 양상을 보였다", vn: "có xu hướng giảm dần" },
      ],
    },
    {
      id: "compare",
      label: "So sánh / tương phản",
      phrases: [
        { kr: "반면에", vn: "mặt khác / ngược lại" },
        { kr: "이와 달리", vn: "khác với điều này" },
        { kr: "~에 비해 상대적으로 낮은 수치를 보였다", vn: "so với ~ thì cho thấy con số tương đối thấp" },
      ],
    },
    {
      id: "cause",
      label: "Nêu nguyên nhân",
      phrases: [
        { kr: "그 원인으로는 ~을/를 들 수 있다", vn: "có thể kể đến nguyên nhân là ~" },
        { kr: "이러한 현상이 나타난 이유는 ~ 때문이다", vn: "lý do xuất hiện hiện tượng này là do ~" },
        { kr: "~이/가 주요 원인으로 작용한 것으로 보인다", vn: "~ được cho là đã đóng vai trò nguyên nhân chính" },
      ],
    },
    {
      id: "forecast",
      label: "Dự báo / kết luận",
      phrases: [
        { kr: "앞으로도 이러한 추세는 계속될 것으로 보인다", vn: "xu hướng này dự kiến sẽ tiếp tục trong tương lai" },
        { kr: "~ㄹ/을 것으로 전망된다", vn: "được dự báo sẽ ~" },
        { kr: "~ㄹ/을 것으로 예상된다", vn: "dự kiến sẽ ~" },
      ],
    },
  ],
  q54: [
    {
      id: "intro",
      label: "Mở bài nêu vấn đề",
      phrases: [
        { kr: "오늘날 ~이/가 중요한 화두로 떠오르고 있다", vn: "ngày nay ~ đang nổi lên như một chủ đề quan trọng" },
        { kr: "현대 사회에서 ~은/는 큰 관심을 받고 있다", vn: "trong xã hội hiện đại, ~ đang nhận được nhiều sự quan tâm" },
        { kr: "최근 ~에 대한 논의가 활발히 이루어지고 있다", vn: "gần đây việc thảo luận về ~ đang diễn ra sôi nổi" },
      ],
    },
    {
      id: "opinion",
      label: "Nêu quan điểm",
      phrases: [
        { kr: "나는 ~라고 생각한다", vn: "tôi nghĩ rằng ~" },
        { kr: "개인적으로 ~라는 입장이다", vn: "cá nhân tôi có quan điểm rằng ~" },
        { kr: "~에 대해 다음과 같이 생각한다", vn: "về vấn đề này tôi nghĩ như sau" },
      ],
    },
    {
      id: "reason",
      label: "Lý do thứ nhất / thứ hai",
      phrases: [
        { kr: "첫째, ~", vn: "thứ nhất, ~" },
        { kr: "둘째, ~", vn: "thứ hai, ~" },
        { kr: "또한", vn: "hơn nữa / ngoài ra" },
        { kr: "게다가", vn: "thêm vào đó" },
      ],
    },
    {
      id: "example",
      label: "Ví dụ / dẫn chứng",
      phrases: [
        { kr: "예를 들어", vn: "ví dụ như" },
        { kr: "실제로", vn: "thực tế là" },
        { kr: "~을/를 그 예로 들 수 있다", vn: "có thể lấy ~ làm ví dụ" },
      ],
    },
    {
      id: "counter",
      label: "Nhượng bộ / phản biện",
      phrases: [
        { kr: "물론 ~라는 의견도 있다", vn: "tất nhiên cũng có ý kiến cho rằng ~" },
        { kr: "그러나 ~", vn: "tuy nhiên ~" },
        { kr: "~라는 반론도 제기될 수 있다", vn: "cũng có thể có phản biện rằng ~" },
      ],
    },
    {
      id: "conclusion",
      label: "Kết luận",
      phrases: [
        { kr: "따라서 ~", vn: "vì vậy ~" },
        { kr: "결론적으로 ~ㄴ/는다고 생각한다", vn: "kết luận lại, tôi nghĩ rằng ~" },
        { kr: "이러한 이유로 ~이/가 필요하다고 본다", vn: "vì những lý do này, tôi cho rằng cần phải ~" },
      ],
    },
  ],
};
