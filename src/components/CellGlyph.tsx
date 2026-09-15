import type { WongojiCell } from "../lib/wongojiLayout";

export interface CellGlyphProps {
  cell?: WongojiCell;
  /** cỡ chữ đã tính sẵn theo đơn vị của nơi gọi (px cho lưới màn hình, mm/pt cho lưới in) */
  fontSize: number | string;
  sideFontSize?: number | string;
}

/**
 * Nội dung bên trong một ô 원고지 — tách riêng để lưới tương tác
 * (WongojiPaper) và lưới in (PrintPaper) render Y HỆT nhau, tránh lệch style
 * giữa hai nơi.
 */
export default function CellGlyph({ cell, fontSize, sideFontSize = "0.9em" }: CellGlyphProps) {
  return (
    <>
      <span
        style={{
          letterSpacing: cell?.tight ? "-0.06em" : "normal",
          fontSize,
          transform:
            cell?.kind === "quote-open"
              ? "translate(0.16em,-0.12em)"
              : cell?.kind === "quote-close"
                ? "translate(-0.16em,-0.12em)"
                : "none",
        }}
      >
        {cell?.t}
      </span>
      {cell?.side && (
        <span style={{ position: "absolute", right: "-0.62em", bottom: "0.06em", fontSize: sideFontSize, color: "var(--ink)" }}>{cell.side}</span>
      )}
    </>
  );
}
