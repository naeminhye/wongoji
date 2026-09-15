import { useEffect, useRef } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal xác nhận dùng chung — thay cho window.confirm() (native dialog chặn
 * toàn bộ JS và khó style/test). Dùng cho cảnh báo "đổi đề giữa chừng đang
 * viết dở" ở mục 5c.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel = "Xác nhận", cancelLabel = "Huỷ", danger, onConfirm, onCancel }: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    confirmRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="no-print wg-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div role="alertdialog" aria-modal="true" aria-labelledby="wg-confirm-title" className="wg-modal-dialog" style={{ maxWidth: 420 }}>
        <div style={{ padding: "18px 20px 6px" }}>
          <h2 id="wg-confirm-title" style={{ margin: 0, fontSize: 18 }}>
            {title}
          </h2>
          <p style={{ margin: "10px 0 0", fontSize: 15, color: "var(--dim)", lineHeight: 1.6 }}>{message}</p>
        </div>
        <div style={{ display: "flex", gap: 8, padding: "16px 20px 20px", justifyContent: "flex-end" }}>
          <button className="wg-btn" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button ref={confirmRef} className={`wg-btn ${danger ? "danger" : "on"}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
