import { useState } from "react";
import { DRAFT_PLACEHOLDER } from "../data/draftTemplates";

export interface DraftPadProps {
  mode: "q53" | "q54" | "free";
  value: string;
  onChange: (value: string) => void;
}

/**
 * Khu vực brainstorm/viết nháp (mục 5b) — tách biệt hoàn toàn khỏi trang
 * giấy 원고지 chính thức: không đếm 자, không áp quy tắc 원고지, nội dung
 * KHÔNG tự động chảy vào bài viết chính (người học tự đọc rồi viết lại, để
 * rèn phản xạ viết thật). Có thể ẩn/hiện để không chiếm diện tích.
 *
 * Một ô nhập tự do duy nhất, không chia thành nhiều field cố định — đề bài
 * có thể thay đổi bất cứ lúc nào nên một khung cứng theo mode dễ không khớp
 * với đề thực tế; cấu trúc gợi ý chỉ nằm trong placeholder.
 */
export default function DraftPad({ mode, value, onChange }: DraftPadProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="wg-panel no-print" style={{ padding: 0, overflow: "hidden" }}>
      <button
        className="wg-btn"
        style={{ width: "100%", border: 0, borderRadius: 0, textAlign: "left", padding: "14px 16px", fontSize: 14, fontWeight: 600 }}
        onClick={() => setOpen((v) => !v)}
      >
        Nháp & dàn ý {open ? "−" : "+"}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ margin: "0 0 8px", fontSize: 13, color: "var(--dim)", lineHeight: 1.6 }}>
            Ghi ý tưởng/dàn ý tự do — không tính 자, không tự động chảy vào bài viết chính.
          </p>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={DRAFT_PLACEHOLDER[mode]}
            style={{
              width: "100%",
              minHeight: 140,
              padding: 10,
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--line)",
              borderRadius: "var(--radius-sm)",
              fontSize: 14,
              lineHeight: 1.6,
              resize: "vertical",
              boxSizing: "border-box",
              fontFamily: "inherit",
            }}
          />
        </div>
      )}
    </section>
  );
}
