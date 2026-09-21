import { useRef, useState, type CSSProperties, type ClipboardEvent } from "react";
import type { WongojiPrompt } from "../data/prompts";

export interface PromptPanelProps {
  samples: WongojiPrompt[];
  active: WongojiPrompt | null;
  onActivate: (prompt: WongojiPrompt) => void;
}

type Tab = "input" | "sample";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Panel chọn/nhập đề bài (mục 5 & 5a):
 *  - Dán đề bài (mặc định khi vào): MỘT chỗ vừa dán/gõ văn bản (원문) vừa
 *    upload/kéo-thả/dán nhiều ảnh CÙNG LÚC — không tách 2 tab riêng như
 *    trước, vì đề thật có thể vừa có chữ dẫn vừa có ảnh minh hoạ đính kèm.
 *    Hiển thị/lưu theo thứ tự CHỮ TRƯỚC, ẢNH SAU (khớp ActivePromptCard).
 *  - Kho đề mẫu: chọn qua dropdown thay vì bấm mũi tên qua từng đề — tiện khi
 *    thư viện có hàng chục đề.
 *
 * Sau khi bấm "Dùng đề này để viết" ở tab Dán đề bài, phần nhập liệu bị ẩn đi
 * (khoá lại) để tránh sửa nhầm giữa lúc đang viết — bấm "Đặt lại" mới mở lại
 * form nhập để soạn đề khác.
 */
export default function PromptPanel({ samples, active, onActivate }: PromptPanelProps) {
  const [tab, setTab] = useState<Tab>("input");

  const [inputTitle, setInputTitle] = useState("");
  const [inputText, setInputText] = useState("");
  const [inputVn, setInputVn] = useState("");
  const [inputImageDataUrls, setInputImageDataUrls] = useState<string[]>([]);
  const [inputDragOver, setInputDragOver] = useState(false);
  const [inputLocked, setInputLocked] = useState(false);

  const [sampleIdx, setSampleIdx] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sample = samples.length > 0 ? samples[sampleIdx % samples.length] : null;
  const canActivateInput = inputText.trim().length > 0 || inputImageDataUrls.length > 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imgFiles.length === 0) return;
    const dataUrls = await Promise.all(imgFiles.map(readFileAsDataUrl));
    setInputImageDataUrls((prev) => [...prev, ...dataUrls]);
  };

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length === 0) return;
    const dataUrls = await Promise.all(files.map(readFileAsDataUrl));
    setInputImageDataUrls((prev) => [...prev, ...dataUrls]);
  };

  const resetInputTab = () => {
    setInputTitle("");
    setInputText("");
    setInputVn("");
    setInputImageDataUrls([]);
    setInputLocked(false);
  };

  return (
    <section className="wg-panel no-print">
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--line)" }}>
        {(
          [
            ["input", "Dán đề bài"],
            ["sample", "Kho đề mẫu"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} className={`wg-tab ${tab === k ? "on" : ""}`} style={{ fontSize: 14, marginRight: 14, padding: "8px 2px" }} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "input" &&
        (inputLocked ? (
          <div>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 12 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--dim)" }}>✓ Đã dùng đề này để viết.</p>
              {inputTitle.trim() && <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600 }}>{inputTitle.trim()}</p>}
              {inputText.trim() && (
                <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, fontFamily: "inherit", color: "var(--text)" }}>
                  {inputText}
                </pre>
              )}
              {inputImageDataUrls.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: inputText.trim() ? 8 : 0 }}>
                  {inputImageDataUrls.map((src, i) => (
                    <img key={i} src={src} alt={`Đề bài ${i + 1}`} style={{ maxWidth: 100, maxHeight: 100, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
                  ))}
                </div>
              )}
            </div>
            <button className="wg-btn" style={{ marginTop: 10, width: "100%" }} onClick={resetInputTab}>
              Đặt lại
            </button>
          </div>
        ) : (
          <div>
            <input value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} placeholder="Tiêu đề (không bắt buộc)" style={inputStyle} />
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Dán hoặc gõ đề bài (원문) vào đây — có thể để trống nếu chỉ dùng ảnh bên dưới."
              style={{ ...inputStyle, minHeight: 110, marginTop: 8, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            />

            <div
              tabIndex={0}
              onPaste={handlePaste}
              onDrop={(e) => {
                e.preventDefault();
                setInputDragOver(false);
                void handleFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setInputDragOver(true);
              }}
              onDragLeave={() => setInputDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 8,
                border: `1px dashed ${inputDragOver ? "var(--accent)" : "var(--line)"}`,
                borderRadius: "var(--radius-md)",
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                fontSize: 13.5,
                color: "var(--dim)",
              }}
            >
              {inputImageDataUrls.length > 0 ? (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {inputImageDataUrls.map((src, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={src} alt={`Đề bài ${i + 1}`} style={{ maxWidth: 140, maxHeight: 140, borderRadius: "var(--radius-sm)", display: "block" }} />
                        <button
                          type="button"
                          aria-label={`Xoá ảnh ${i + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInputImageDataUrls((prev) => prev.filter((_, idx) => idx !== i));
                          }}
                          style={removeBtnStyle}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: "10px 0 0" }}>Nhấn · kéo-thả · hoặc dán (Ctrl/Cmd+V) để thêm ảnh khác</p>
                </>
              ) : (
                <>Nhấn để chọn ảnh (chọn được nhiều ảnh) · Kéo-thả ảnh vào đây · Hoặc bấm vào đây rồi dán bằng Ctrl/Cmd+V — không bắt buộc nếu đã có văn bản ở trên</>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
            </div>

            <textarea
              value={inputVn}
              onChange={(e) => setInputVn(e.target.value)}
              placeholder="Ghi chú dịch (tự nhập, không tự động dịch)"
              style={{ ...inputStyle, minHeight: 56, marginTop: 8, resize: "vertical" }}
            />

            <button
              className="wg-btn on"
              style={{ marginTop: 10, width: "100%" }}
              disabled={!canActivateInput}
              onClick={() => {
                const hasText = inputText.trim().length > 0;
                const hasImages = inputImageDataUrls.length > 0;
                onActivate({
                  id: `custom-${Date.now()}`,
                  source: hasText && hasImages ? "mixed" : hasImages ? "image" : "text",
                  title: inputTitle.trim() || "Đề tự nhập",
                  body: inputText.trim(),
                  vn: inputVn.trim(),
                  imageDataUrls: hasImages ? inputImageDataUrls : undefined,
                });
                setInputLocked(true);
              }}
            >
              Dùng đề này để viết
            </button>
          </div>
        ))}

      {tab === "sample" &&
        (sample ? (
          <div>
            <label htmlFor="wg-sample-select" style={{ display: "block", fontSize: 12.5, color: "var(--dim)", marginBottom: 4 }}>
              Chọn đề mẫu ({samples.length} đề)
            </label>
            <select
              id="wg-sample-select"
              className="wg-select"
              style={{ width: "100%", marginBottom: 10 }}
              value={sampleIdx % samples.length}
              onChange={(e) => setSampleIdx(Number(e.target.value))}
            >
              {samples.map((s, i) => (
                <option key={s.id} value={i}>
                  {s.title}
                </option>
              ))}
            </select>
            <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 15, lineHeight: 1.7, fontFamily: "inherit", color: "var(--text)" }}>{sample.body}</pre>
            <p style={{ margin: "10px 0 0", fontSize: 13.5, color: "var(--dim)", borderTop: "1px solid var(--line)", paddingTop: 8 }}>{sample.vn}</p>
            <button
              className={`wg-btn ${active?.id === sample.id ? "on" : ""}`}
              style={{ marginTop: 10, width: "100%" }}
              onClick={() => onActivate(sample)}
            >
              {active?.id === sample.id ? "✓ Đang dùng đề này" : "Dùng đề này để viết"}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 14, color: "var(--dim)" }}>Chế độ này không có đề mẫu.</p>
        ))}
    </section>
  );
}

const inputStyle: CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  background: "var(--bg)",
  color: "var(--text)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-sm)",
  fontSize: 14,
  boxSizing: "border-box",
};

const removeBtnStyle: CSSProperties = {
  position: "absolute",
  top: -7,
  right: -7,
  width: 20,
  height: 20,
  lineHeight: "18px",
  padding: 0,
  borderRadius: "50%",
  border: "1px solid var(--line)",
  background: "var(--bg)",
  color: "var(--text)",
  fontSize: 13,
  cursor: "pointer",
};
