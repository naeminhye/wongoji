export interface FixListProps {
  fixes: Record<string, number>;
}

/**
 * Danh sách các chỗ đã được tự động chỉnh theo quy tắc 원고지 (mục 5c) — để
 * người học biết mình đang gõ sai chỗ nào nếu gõ liền không để ý quy tắc.
 */
export default function FixList({ fixes }: FixListProps) {
  const entries = Object.entries(fixes);
  return (
    <section className="wg-panel">
      <h2 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 600, color: "var(--dim)" }}>Tự động chỉnh</h2>
      {entries.length === 0 ? (
        <p style={{ margin: 0, fontSize: 14, color: "var(--dim)" }}>Chưa có chỗ nào phải chỉnh theo quy tắc 원고지.</p>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 14, lineHeight: 1.75 }}>
          {entries.map(([k, n]) => (
            <li key={k}>
              {k} <span style={{ color: "var(--accent)" }}>×{n}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
