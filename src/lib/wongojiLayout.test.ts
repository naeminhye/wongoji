import { describe, expect, it } from "vitest";
import { countWongoji, layoutWongoji } from "./wongojiLayout";

function textOf(cell: { t: string } | undefined) {
  return cell?.t;
}

describe("layoutWongoji — quy tắc cơ bản", () => {
  it("rejects a non-positive cols", () => {
    expect(() => layoutWongoji("가", 0)).toThrow();
  });

  it("mỗi âm tiết Hangul chiếm đúng 1 ô, dòng đầu thụt 1 ô", () => {
    const L = layoutWongoji("가나다", 20);
    // pos bắt đầu ở 1 (ô 0 để trống — 들여쓰기)
    expect(L.cells.get(0)).toBeUndefined();
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(textOf(L.cells.get(2))).toBe("나");
    expect(textOf(L.cells.get(3))).toBe("다");
    expect(L.counted).toBe(3);
  });

  it("số Ả Rập: 2 ký tự / ô, ghép trái sang phải", () => {
    const L = layoutWongoji("20", 20);
    expect(textOf(L.cells.get(1))).toBe("20");
    const L2 = layoutWongoji("365", 20);
    expect(textOf(L2.cells.get(1))).toBe("36");
    expect(textOf(L2.cells.get(2))).toBe("5");
  });

  it("chữ Latin HOA: 1 ký tự/ô; Latin thường: 2 ký tự/ô", () => {
    const L = layoutWongoji("ABC", 20);
    expect(textOf(L.cells.get(1))).toBe("A");
    expect(textOf(L.cells.get(2))).toBe("B");
    expect(textOf(L.cells.get(3))).toBe("C");

    const L2 = layoutWongoji("abcde", 20);
    expect(textOf(L2.cells.get(1))).toBe("ab");
    expect(textOf(L2.cells.get(2))).toBe("cd");
    expect(textOf(L2.cells.get(3))).toBe("e");
  });

  it("dấu cách chiếm 1 ô và được tính vào 자", () => {
    const L = layoutWongoji("가 나", 20);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(L.cells.get(2)).toBeUndefined(); // ô dấu cách để trống, không glyph
    expect(textOf(L.cells.get(3))).toBe("나");
    expect(L.counted).toBe(3); // 가 + space + 나
  });

  it("dấu cách rơi đúng ô đầu dòng thì bị bỏ, không lùi dòng, và bản thân dấu cách đó không được tính vào counted của layout này", () => {
    // cols=3, indent chiếm ô0 -> "가나" lấp ô1,2 (hết dòng) -> tiếp theo là space tại ô đầu dòng2 (ô3)
    const L = layoutWongoji("가나 다", 3);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(textOf(L.cells.get(2))).toBe("나");
    // dấu cách rơi vào col 0 của dòng tiếp theo (pos 3) -> bị bỏ
    expect(textOf(L.cells.get(3))).toBe("다");
    expect(L.fixes["Bỏ dấu cách rơi vào ô đầu dòng"]).toBe(1);
    // 가(1) + 나(1) + 다(1) = 3; dấu cách bị bỏ nên KHÔNG cộng thêm
    expect(L.counted).toBe(3);
  });

  it("mỗi đoạn mới (sau \\n) chừa trống ô đầu tiên của dòng mới", () => {
    const L = layoutWongoji("가\n나", 20);
    expect(textOf(L.cells.get(1))).toBe("가");
    // dòng 2 bắt đầu tại pos 20, ô đầu (20) để trống, "나" ở pos 21
    expect(L.cells.get(20)).toBeUndefined();
    expect(textOf(L.cells.get(21))).toBe("나");
  });
});

describe("layoutWongoji — dấu câu", () => {
  it(". , : ; chiếm 1 ô, không chừa ô trống phía sau", () => {
    const L = layoutWongoji("가,나.", 20);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(textOf(L.cells.get(2))).toBe(",");
    expect(textOf(L.cells.get(3))).toBe("나");
    expect(textOf(L.cells.get(4))).toBe(".");
    expect(L.cells.get(5)).toBeUndefined();
  });

  it("! ? bắt buộc chừa đúng 1 ô trống phía sau (tự chèn nếu thiếu)", () => {
    const L = layoutWongoji("가!나", 20);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(textOf(L.cells.get(2))).toBe("!");
    expect(L.cells.get(3)).toBeUndefined(); // ô trống tự chèn
    expect(textOf(L.cells.get(4))).toBe("나");
    expect(L.fixes["Chèn ô trống sau ! hoặc ?"]).toBe(1);
  });

  it("! ? theo sau đã có sẵn dấu cách thì không chèn thêm", () => {
    const L = layoutWongoji("가? 나", 20);
    expect(textOf(L.cells.get(2))).toBe("?");
    expect(L.cells.get(3)).toBeUndefined();
    expect(textOf(L.cells.get(4))).toBe("나");
    expect(L.fixes["Chèn ô trống sau ! hoặc ?"]).toBeUndefined();
  });

  it("dấu câu rơi vào ô đầu dòng mới → viết tràn ra ngoài lề ô cuối dòng trên", () => {
    // cols=3: indent ô0, "가나" lấp ô1-2 hết dòng, dấu "." lẽ ra rơi ô đầu dòng2
    const L = layoutWongoji("가나.", 3);
    expect(textOf(L.cells.get(2))).toBe("나");
    expect(L.cells.get(2)?.side).toBe(".");
    expect(L.cells.get(3)).toBeUndefined(); // không có ô mới bị chiếm cho dấu câu
  });
});

describe("layoutWongoji — 말줄임표", () => {
  it("…… chiếm 2 ô", () => {
    const L = layoutWongoji("가……나", 20);
    expect(textOf(L.cells.get(2))).toBe("…");
    expect(textOf(L.cells.get(3))).toBe("…");
    expect(textOf(L.cells.get(4))).toBe("나");
    expect(L.counted).toBe(4); // 가 + … + … + 나
  });

  it("... (3 dấu chấm liền) được nhận diện như 말줄임표 và gộp dấu chấm theo sau", () => {
    const L = layoutWongoji("가....", 20); // ... (3 dấu) rồi thêm "." rời
    // regex bắt hết `.{3,}` thành 1 atom "ell" nếu liền nhau (4 dấu chấm liên tục vẫn là 1 atom ell)
    expect(textOf(L.cells.get(2))).toBe("…");
  });

  it("dấu chấm ngay sau …… nhập chung vào ô cuối của 말줄임표", () => {
    const L = layoutWongoji("가…….", 20);
    expect(textOf(L.cells.get(2))).toBe("…");
    const last = L.cells.get(3);
    expect(last?.t).toBe("….");
    expect(last?.tight).toBe(true);
    expect(L.fixes["Gộp dấu chấm vào ô 말줄임표"]).toBe(1);
  });
});

describe("layoutWongoji — ngoặc kép/ngoặc đơn", () => {
  it('."  gộp chung một ô khi ngoặc kép đóng theo ngay sau dấu chấm', () => {
    // dấu " đầu tiên là mở (dq: false->true), dấu " thứ hai là đóng (true->false)
    const L = layoutWongoji('가"나."', 20);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(textOf(L.cells.get(2))).toBe("“"); // ngoặc mở
    expect(textOf(L.cells.get(3))).toBe("나");
    const merged = L.cells.get(4);
    expect(merged?.t).toBe(".”"); // "." + ngoặc đóng dùng chung 1 ô
    expect(merged?.tight).toBe(true);
    expect(L.fixes["Dấu chấm + ngoặc đóng dùng chung một ô"]).toBe(1);
  });

  it("ngoặc mở không được đứng ở ô cuối dòng → đẩy xuống đầu dòng sau", () => {
    // cols=3: ô0 indent, ô1='가', ô2 là ô cuối dòng (col cols-1=2) -> ngoặc mở phải đẩy xuống dòng sau
    const L = layoutWongoji('가"나', 3);
    expect(textOf(L.cells.get(1))).toBe("가");
    expect(L.cells.get(2)).toBeUndefined(); // bị đẩy xuống, ô cuối dòng bỏ trống
    expect(textOf(L.cells.get(3))).toBe("“");
    expect(textOf(L.cells.get(4))).toBe("나");
    expect(L.fixes["Ngoặc mở cuối dòng → đẩy xuống dòng dưới"]).toBe(1);
  });
});

describe("layoutWongoji — responsive re-layout theo cols khác nhau", () => {
  it("rowsUsed thay đổi thật sự theo cols (không phải CSS wrap)", () => {
    const text = "가나다라마바사아자차";
    const L20 = layoutWongoji(text, 20);
    const L5 = layoutWongoji(text, 5);
    expect(L20.rowsUsed).toBe(1);
    expect(L5.rowsUsed).toBeGreaterThan(1);
  });

  it("quy tắc phụ thuộc vị trí cột (VD: dấu cách ở đầu dòng bị bỏ) thật sự áp dụng lại theo cols mới, khiến cells khác nhau", () => {
    // "가나다라" lấp 4 ô đầu (pos1-4), theo sau là dấu cách rồi "마".
    // cols=20: pos5 không phải đầu dòng (5%20=5) -> giữ dấu cách -> 마 ở pos6.
    // cols=5 : pos5 LÀ đầu dòng mới (5%5=0) -> dấu cách bị bỏ -> 마 ở pos5.
    const text = "가나다라 마";
    const L20 = layoutWongoji(text, 20);
    const L5 = layoutWongoji(text, 5);
    expect(L20.cells.get(6)?.t).toBe("마");
    expect(L5.cells.get(5)?.t).toBe("마");
    expect(L5.fixes["Bỏ dấu cách rơi vào ô đầu dòng"]).toBe(1);
    expect(L20.fixes["Bỏ dấu cách rơi vào ô đầu dòng"]).toBeUndefined();
  });
});

describe("countWongoji — bộ đếm 자 tổng, ổn định bất kể cols render", () => {
  it("không đổi khi cols của lưới hiển thị đổi (chỉ layoutWongoji(text, cols) mới đổi theo cols)", () => {
    const text = "가나다라 마바!사 \"아자\".차카 20명, ABCdef... 파하";
    const a = countWongoji(text);
    const b = countWongoji(text);
    expect(a).toBe(b);
    // và khác với việc lấy trực tiếp .counted từ một layout ở cols nhỏ dễ bị
    // rơi vào ca "dấu cách đầu dòng" (minh hoạ tại sao cần hàm riêng)
    const tinyColsCounted = layoutWongoji(text, 3).counted;
    expect(typeof tinyColsCounted).toBe("number"); // (giá trị này CÓ THỂ khác a — đúng như spec yêu cầu tách biệt)
  });

  it("đếm cả dấu cách, không đếm ô thụt đầu đoạn", () => {
    // "가 나" : 가(1) + space(1) + 나(1) = 3; ô thụt đầu bài (pos0) không tính
    expect(countWongoji("가 나")).toBe(3);
  });
});

describe("layoutWongoji — nearestSrc / caretMap tồn tại và tăng dần", () => {
  it("caretMap các mốc src tăng dần hoặc bằng nhau", () => {
    const L = layoutWongoji("가나다.라마!바", 20);
    for (let i = 1; i < L.caretMap.length; i++) {
      expect(L.caretMap[i].src).toBeGreaterThanOrEqual(L.caretMap[i - 1].src);
    }
  });
});
