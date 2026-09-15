import type { WongojiPrompt } from "../data/prompts";

export interface ActivePromptCardProps {
  prompt: WongojiPrompt | null;
}

/**
 * Đề bài đang active — hiển thị cố định phía trên trang giấy trong lúc viết.
 * KHÔNG mang class "no-print": với đề dạng ảnh đặc biệt, người viết cần nhìn
 * lại đề ngay trên bản in (mục yêu cầu "hiển thị hình trên web và lúc in ra
 * luôn"), nên thẻ này in ra cùng bài viết/giấy trống.
 */
export default function ActivePromptCard({ prompt }: ActivePromptCardProps) {
  if (!prompt) return null;

  return (
    <section className="wg-panel" style={{ background: "var(--bg-soft)" }}>
      {prompt.title && <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 600, color: "var(--dim)" }}>{prompt.title}</h3>}

      {prompt.imageDataUrls && prompt.imageDataUrls.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {prompt.imageDataUrls.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${prompt.title || "Đề bài"} — ảnh ${i + 1}/${prompt.imageDataUrls!.length}`}
              style={{ maxWidth: "100%", borderRadius: "var(--radius-sm)", display: "block" }}
            />
          ))}
        </div>
      ) : (
        prompt.body && (
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.7, fontFamily: "inherit", color: "var(--text)" }}>
            {prompt.body}
          </pre>
        )
      )}

      {prompt.vn && (
        <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--dim)", borderTop: "1px solid var(--line)", paddingTop: 8 }}>{prompt.vn}</p>
      )}
    </section>
  );
}
