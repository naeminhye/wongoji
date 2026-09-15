/* ────────────────────────────────────────────────────────────────────────────
   원고지 layout engine — pure logic, no DOM.

   Rules implemented (nguồn: 쓰기 100점 받자 — chương 문장부호 & 원고지 사용법,
   xem wongoji-prompt.md mục 1):

    1. Mỗi âm tiết Hangul / Hanja hoàn chỉnh = 1 ô.
    2. Số Ả Rập & chữ Latin thường: 2 ký tự / ô, ghép trái→phải.
       Chữ Latin HOA: 1 ký tự / ô.
    3. Dấu cách = 1 ô; nếu rơi đúng ô đầu dòng thì BỎ, viết tiếp không lùi dòng.
    4. Dòng đầu bài & mỗi đoạn mới (sau \n): chừa trống ô đầu tiên (들여쓰기).
    5. . , : ; → 1 ô, KHÔNG chừa ô trống phía sau.
       ! ? → 1 ô, BẮT BUỘC chừa đúng 1 ô trống phía sau (tự chèn nếu thiếu).
       Dấu câu không được đứng ở ô đầu dòng mới → viết tràn ra lề, cạnh ký tự
       cuối dòng trên.
    6. 말줄임표 ……(hoặc ... 3 dấu trở lên) chiếm 2 ô; nếu có `.` theo ngay sau,
       dấu chấm nhập chung vào ô cuối của ……
    7. Ngoặc kép/ngoặc đơn: viết lệch về góc ô; nếu ngoặc đóng đi liền sau
       `.`/`,` thì dùng chung 1 ô. Ngoặc mở không được đứng ô cuối dòng →
       đẩy xuống đầu dòng sau.
    8. Q53/Q54 không có tiêu đề — việc này là quy ước ở tầng nội dung/UI,
       không phải của layout engine (engine chỉ layout chuỗi đưa vào).

   Engine nhận `cols` làm tham số (không hard-code) để hỗ trợ lưới responsive:
   re-layout lại toàn bộ theo đúng quy tắc trên mỗi khi cols thay đổi, không
   chỉ CSS-wrap.
   ──────────────────────────────────────────────────────────────────────────── */

export type CellKind = "char" | "latin" | "punc" | "quote-open" | "quote-close";

export interface WongojiCell {
  t: string;
  kind: CellKind;
  /** narrow glyph rendered at ~half size (digit pair / lowercase latin pair) */
  narrow?: boolean;
  /** negative letter-spacing, used when two glyphs share one cell (".", ellipsis+period) */
  tight?: boolean;
  /** punctuation overflowed onto the previous line's last cell, rendered in the margin */
  side?: string;
  /** index into the source string this cell's content started at */
  start: number;
}

export interface CaretMapEntry {
  /** index into the source string */
  src: number;
  /** linear cell position (row * cols + col) this source index maps to */
  pos: number;
}

export interface WongojiLayout {
  cols: number;
  cells: Map<number, WongojiCell>;
  caretMap: CaretMapEntry[];
  /** linear position one past the last cell used */
  endPos: number;
  /** TOPIK 자 count: chars + spaces, indent cells excluded */
  counted: number;
  rowsUsed: number;
  /** label -> number of times that auto-correction was applied */
  fixes: Record<string, number>;
}

/**
 * Cột chuẩn dùng riêng để tính 자 (KHÔNG dùng để render).
 *
 * Rule 3 (dấu cách rơi đúng ô đầu dòng thì bị bỏ, không tính 자) vốn là một
 * quy tắc về *cách viết tay lên giấy* — trên giấy 원고지 thật, số cột luôn cố
 * định. Lưới luyện tập của app này lại responsive (10/20/25/30/50 cột tùy màn
 * hình, xem mục 2), nên nếu tính 자 trực tiếp trên cols đang render, cùng một
 * bài viết sẽ ra số 자 khác nhau khi resize cửa sổ — trái với yêu cầu ở mục 3
 * ("một bộ đếm tổng duy nhất... không phụ thuộc số cột đang render").
 *
 * Giải pháp: 자-count luôn được tính trên một layout ảo ở cột chuẩn (20 —
 * đúng khổ 원고지 tiêu chuẩn dùng trong tài liệu luyện thi & wongoji.com),
 * tách biệt hoàn toàn khỏi cols dùng để vẽ lưới thật trên màn hình. Xem
 * `countWongoji`.
 */
export const REFERENCE_COLS = 20;

const OPENERS = new Set(["“", "‘", "(", "[", "{", "「", "『", "《", "〈", "〔"]);
const CLOSERS = new Set(["”", "’", ")", "]", "}", "」", "』", "》", "〉", "〕"]);

type Atom =
  | { k: "nl"; start: number; end: number }
  | { k: "sp"; start: number; end: number; eaten?: boolean; auto?: boolean }
  | { k: "ell"; start: number; end: number }
  | { k: "tail"; t: string; start: number; end: number }
  | { k: "mark"; t: string; start: number; end: number }
  | { k: "open"; t: string; start: number; end: number }
  | { k: "close"; t: string; start: number; end: number }
  | { k: "cell"; t: string; start: number; end: number; narrow?: boolean; latin?: boolean };

function tokenize(src: string): Atom[] {
  const atoms: Atom[] = [];
  let i = 0;
  let dq = false;
  let sq = false;

  const prevReal = () => atoms[atoms.length - 1];

  while (i < src.length) {
    const c = src[i];
    const start = i;

    if (c === "\n") {
      atoms.push({ k: "nl", start, end: i + 1 });
      i++;
      continue;
    }

    if (c === " " || c === "\t" || c === "　") {
      let j = i;
      while (j < src.length && (src[j] === " " || src[j] === "\t" || src[j] === "　")) j++;
      const p = prevReal();
      atoms.push({ k: "sp", start, end: j, eaten: !!(p && p.k === "tail") });
      i = j;
      continue;
    }

    // 말줄임표: … hoặc ... (3 dấu chấm trở lên)
    const ell = /^(?:…+|\.{3,})/.exec(src.slice(i));
    if (ell) {
      atoms.push({ k: "ell", start, end: i + ell[0].length });
      i += ell[0].length;
      continue;
    }

    if (c === "." || c === "," || c === ":" || c === ";") {
      atoms.push({ k: "tail", t: c, start, end: i + 1 });
      i++;
      continue;
    }

    if (c === "!" || c === "?") {
      atoms.push({ k: "mark", t: c, start, end: i + 1 });
      i++;
      // 느낌표/물음표 뒤 한 칸 띄기 — tự chèn nếu người viết quên
      const nx = src[i];
      if (nx && !/[\s.,!?:;"'"')\]}』」]/.test(nx)) {
        atoms.push({ k: "sp", start: i, end: i, auto: true });
      }
      continue;
    }

    if (/[0-9]/.test(c)) {
      const run = /^[0-9]+/.exec(src.slice(i))![0];
      for (let p = 0; p < run.length; p += 2) {
        const t = run.slice(p, p + 2);
        atoms.push({ k: "cell", t, start: i + p, end: i + p + t.length, narrow: true });
      }
      i += run.length;
      continue;
    }

    if (/[A-Za-z]/.test(c)) {
      const run = /^[A-Za-z]+/.exec(src.slice(i))![0];
      let p = 0;
      while (p < run.length) {
        if (/[A-Z]/.test(run[p])) {
          atoms.push({ k: "cell", t: run[p], start: i + p, end: i + p + 1, latin: true });
          p += 1;
        } else {
          const two = /[a-z]/.test(run[p + 1] || "") ? run.slice(p, p + 2) : run[p];
          atoms.push({ k: "cell", t: two, start: i + p, end: i + p + two.length, narrow: true, latin: true });
          p += two.length;
        }
      }
      i += run.length;
      continue;
    }

    if (c === '"') {
      const open = !dq;
      dq = !dq;
      atoms.push({ k: open ? "open" : "close", t: open ? "“" : "”", start, end: i + 1 });
      i++;
      continue;
    }
    if (c === "'") {
      const open = !sq;
      sq = !sq;
      atoms.push({ k: open ? "open" : "close", t: open ? "‘" : "’", start, end: i + 1 });
      i++;
      continue;
    }
    if (OPENERS.has(c)) {
      atoms.push({ k: "open", t: c, start, end: i + 1 });
      i++;
      continue;
    }
    if (CLOSERS.has(c)) {
      atoms.push({ k: "close", t: c, start, end: i + 1 });
      i++;
      continue;
    }

    atoms.push({ k: "cell", t: c, start, end: i + 1 });
    i++;
  }
  return atoms;
}

/**
 * Layout a source string onto a 원고지 grid with the given column count.
 * Pure function — no DOM access — safe to call from tests, workers, or a
 * print/export pipeline.
 */
export function layoutWongoji(src: string, cols: number): WongojiLayout {
  if (!Number.isFinite(cols) || cols < 1) {
    throw new Error(`layoutWongoji: cols must be a positive integer, got ${cols}`);
  }

  const atoms = tokenize(src);
  const cells = new Map<number, WongojiCell>();
  const caretMap: CaretMapEntry[] = [];
  const fixes: Record<string, number> = {};
  const note = (key: string) => {
    fixes[key] = (fixes[key] || 0) + 1;
  };

  let pos = 1; // 들여쓰기: ô đầu tiên của dòng đầu để trống
  let lastPos: number | null = null; // ô vừa đặt (để gắn dấu tràn lề)
  let counted = 0; // 자 tính theo TOPIK (ký tự + dấu cách, không tính ô thụt đầu dòng)

  const rowOf = (p: number) => Math.floor(p / cols);
  const colOf = (p: number) => p % cols;
  const put = (p: number, cell: WongojiCell) => {
    cells.set(p, cell);
    lastPos = p;
  };
  const attach = (mark: string) => {
    if (lastPos === null) return;
    const c = cells.get(lastPos)!;
    c.side = (c.side || "") + mark;
  };

  for (let idx = 0; idx < atoms.length; idx++) {
    const a = atoms[idx];
    const prev = atoms[idx - 1];
    caretMap.push({ src: a.start, pos });
    const col = colOf(pos);

    switch (a.k) {
      case "nl": {
        pos = (rowOf(pos) + 1) * cols + 1; // xuống dòng + thụt đầu đoạn mới
        lastPos = null;
        break;
      }

      case "sp": {
        if (a.eaten) break; // sau . , : ; — không chừa ô
        if (col === 0) {
          note("Bỏ dấu cách rơi vào ô đầu dòng");
          break;
        }
        if (a.auto) note("Chèn ô trống sau ! hoặc ?");
        pos++;
        counted++;
        break;
      }

      case "ell": {
        put(pos, { t: "…", kind: "punc", start: a.start });
        pos++;
        put(pos, { t: "…", kind: "punc", start: a.start });
        pos++;
        counted += 2;
        break;
      }

      case "tail": {
        // dấu chấm ngay sau … → nhập chung ô với … cuối
        if (prev && prev.k === "ell" && a.t === "." && lastPos !== null) {
          const c = cells.get(lastPos)!;
          c.t = "…" + a.t;
          c.tight = true;
          note("Gộp dấu chấm vào ô 말줄임표");
          break;
        }
        if (col === 0 && lastPos !== null) {
          attach(a.t);
          note("Dấu câu đầu dòng → đưa ra ngoài ô cuối dòng trên");
          break;
        }
        put(pos, { t: a.t, kind: "punc", start: a.start });
        pos++;
        counted++;
        break;
      }

      case "mark": {
        if (col === 0 && lastPos !== null) {
          attach(a.t);
          note("Dấu câu đầu dòng → đưa ra ngoài ô cuối dòng trên");
          break;
        }
        put(pos, { t: a.t, kind: "punc", start: a.start });
        pos++;
        counted++;
        break;
      }

      case "close": {
        // ." hoặc ,' dùng chung một ô
        if (prev && prev.k === "tail" && lastPos !== null) {
          const c = cells.get(lastPos)!;
          if (c.side) {
            c.side += a.t;
          } else {
            c.t = c.t + a.t;
            c.tight = true;
          }
          note("Dấu chấm + ngoặc đóng dùng chung một ô");
          break;
        }
        if (col === 0 && lastPos !== null) {
          attach(a.t);
          note("Dấu câu đầu dòng → đưa ra ngoài ô cuối dòng trên");
          break;
        }
        put(pos, { t: a.t, kind: "quote-close", start: a.start });
        pos++;
        counted++;
        break;
      }

      case "open": {
        if (col === cols - 1) {
          // ngoặc mở không được đứng ô cuối dòng
          pos = (rowOf(pos) + 1) * cols;
          note("Ngoặc mở cuối dòng → đẩy xuống dòng dưới");
        }
        put(pos, { t: a.t, kind: "quote-open", start: a.start });
        pos++;
        counted++;
        break;
      }

      default: {
        put(pos, { t: a.t, kind: a.latin ? "latin" : "char", narrow: a.narrow, start: a.start });
        pos++;
        counted++;
      }
    }
  }

  caretMap.push({ src: src.length, pos });

  return {
    cols,
    cells,
    caretMap,
    endPos: pos,
    counted,
    rowsUsed: Math.floor(Math.max(pos - 1, 0) / cols) + 1,
    fixes,
  };
}

/**
 * Đếm 자 theo đúng quy ước TOPIK, ỔN ĐỊNH bất kể lưới đang render bao nhiêu
 * cột — dùng cho bộ đếm tổng ở mục 3 của spec (không được nhảy số khi resize
 * màn hình). Tính bằng cách layout trên `REFERENCE_COLS` cố định rồi lấy
 * `counted`, hoàn toàn tách biệt khỏi `cols` dùng để vẽ lưới luyện viết thật.
 */
export function countWongoji(src: string): number {
  return layoutWongoji(src, REFERENCE_COLS).counted;
}

/** Tìm vị trí nguồn gần nhất khi bấm vào một ô trống trong lưới. */
export function nearestSrc(L: WongojiLayout, pos: number, fallback: number): number {
  let best: { p: number; c: WongojiCell } | null = null;
  for (const [p, c] of L.cells) {
    if (p <= pos && (best === null || p > best.p)) best = { p, c };
  }
  return best ? best.c.start + String(best.c.t).length : fallback;
}
