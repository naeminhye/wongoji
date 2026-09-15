import { useEffect, useRef } from "react";
import { WONGOJI_RULES } from "../data/rules";

export interface RulesModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Modal "Quy tắc 원고지" (mục 4). Đóng bằng nút đóng, click overlay, hoặc Esc.
 * Không tự mở khi vào trang — chỉ mở khi người dùng bấm nút trên header.
 * Responsive: bottom-sheet gần full màn hình trên mobile, dialog căn giữa
 * trên desktop (xử lý qua class .wg-modal-* trong index.css).
 */
export default function RulesModal({ open, onClose }: RulesModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    closeBtnRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="no-print wg-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="wg-rules-title" className="wg-modal-dialog">
        <div style={{ display: "flex", alignItems: "center", padding: "16px 18px", borderBottom: "1px solid var(--line)", gap: 10 }}>
          <h2 id="wg-rules-title" style={{ margin: 0, fontSize: 18 }}>
            Quy tắc 원고지
          </h2>
          <span style={{ fontSize: 13.5, color: "var(--dim)" }}>Cách trình bày 원고지 chuẩn TOPIK II</span>
          <button ref={closeBtnRef} className="wg-btn" style={{ marginLeft: "auto", padding: "4px 10px" }} onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <dl style={{ margin: 0, padding: "14px 18px", overflowY: "auto", fontSize: 15, lineHeight: 1.65 }}>
          {WONGOJI_RULES.map((r) => (
            <div key={r.title} style={{ marginBottom: 14 }}>
              <dt style={{ fontWeight: 600 }}>{r.title}</dt>
              <dd style={{ margin: "3px 0 0", color: "var(--dim)" }}>{r.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
