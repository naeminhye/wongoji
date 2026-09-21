import { useState } from "react";
import { PHRASE_BANK } from "../data/phraseBank";

export interface PhraseBankPanelProps {
  mode: "q53" | "q54";
  onInsert: (phraseKr: string) => void;
}

/**
 * Ngân hàng cụm từ theo dạng đề — câu 53 (mô tả số liệu) và câu 54 (nghị
 * luận) có bộ cụm từ khác nhau (xem data/phraseBank.ts). Bấm "Chèn" nối cụm
 * từ vào cuối ô Nháp (không đụng tới bài viết chính ở trang 원고지) để người
 * học tự đọc rồi viết lại, không copy-paste thẳng vào bài.
 */
export default function PhraseBankPanel({ mode, onInsert }: PhraseBankPanelProps) {
  const [open, setOpen] = useState(false);
  const categories = PHRASE_BANK[mode];

  return (
    <section className="wg-panel no-print" style={{ padding: 0, overflow: "hidden" }}>
      <button
        className="wg-btn"
        style={{ width: "100%", border: 0, borderRadius: 0, textAlign: "left", padding: "14px 16px", fontSize: 14, fontWeight: 600 }}
        onClick={() => setOpen((v) => !v)}
      >
        Cụm từ gợi ý {open ? "−" : "+"}
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px", maxHeight: 360, overflowY: "auto" }}>
          {categories.map((cat) => (
            <div key={cat.id} style={{ marginTop: 14 }}>
              <h3 style={{ margin: "0 0 6px", fontSize: 13, fontWeight: 600, color: "var(--dim)" }}>{cat.label}</h3>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {cat.phrases.map((p) => (
                  <li
                    key={p.kr}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      background: "var(--bg)",
                      border: "1px solid var(--line)",
                      borderRadius: "var(--radius-sm)",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14 }}>{p.kr}</div>
                      <div style={{ fontSize: 12.5, color: "var(--dim)" }}>{p.vn}</div>
                    </div>
                    <button className="wg-btn" style={{ padding: "4px 10px", fontSize: 12.5, flexShrink: 0 }} onClick={() => onInsert(p.kr)}>
                      Chèn
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
