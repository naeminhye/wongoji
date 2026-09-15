import { useRef, useState, type CSSProperties, type ClipboardEvent } from "react";
import type { WongojiPrompt } from "../data/prompts";

export interface PromptPanelProps {
  samples: WongojiPrompt[];
  active: WongojiPrompt | null;
  onActivate: (prompt: WongojiPrompt) => void;
}

type Tab = "sample" | "text" | "image";

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
 *  - Đề mẫu: carousel qua lại giữa các đề mẫu kèm bản dịch VN.
 *  - Dán văn bản: paste/gõ trực tiếp 원문 vào ô nhập.
 *  - Hình ảnh: dán (Ctrl/Cmd+V) hoặc chọn NHIỀU ảnh đề bài cùng lúc — hiển thị
 *    NGUYÊN ẢNH (không chạy OCR) cả khi viết lẫn khi in, người dùng đọc đề
 *    trực tiếp từ ảnh thay vì phải gõ lại.
 *
 * Sau khi bấm "Dùng đề này để viết" ở tab Dán văn bản/Hình ảnh, phần nhập
 * liệu được ẩn đi (khoá lại) để tránh sửa nhầm giữa lúc đang viết — người
 * dùng bấm "Đặt lại" mới mở lại form nhập để soạn đề khác.
 */
export default function PromptPanel({ samples, active, onActivate }: PromptPanelProps) {
  const [tab, setTab] = useState<Tab>("sample");
  const [sampleIdx, setSampleIdx] = useState(0);

  const [customText, setCustomText] = useState("");
  const [customTextTitle, setCustomTextTitle] = useState("");
  const [customTextVn, setCustomTextVn] = useState("");
  const [textLocked, setTextLocked] = useState(false);

  const [imageDataUrls, setImageDataUrls] = useState<string[]>([]);
  const [imageTitle, setImageTitle] = useState("");
  const [imageVn, setImageVn] = useState("");
  const [imageDragOver, setImageDragOver] = useState(false);
  const [imageLocked, setImageLocked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sample = samples.length > 0 ? samples[sampleIdx % samples.length] : null;

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const imgFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (imgFiles.length === 0) return;
    const dataUrls = await Promise.all(imgFiles.map(readFileAsDataUrl));
    setImageDataUrls((prev) => [...prev, ...dataUrls]);
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
    setImageDataUrls((prev) => [...prev, ...dataUrls]);
  };

  const resetTextTab = () => {
    setCustomText("");
    setCustomTextTitle("");
    setCustomTextVn("");
    setTextLocked(false);
  };

  const resetImageTab = () => {
    setImageDataUrls([]);
    setImageTitle("");
    setImageVn("");
    setImageLocked(false);
  };

  return (
    <section className="wg-panel no-print">
      <div style={{ display: "flex", gap: 4, marginBottom: 12, borderBottom: "1px solid var(--line)" }}>
        {(
          [
            ["sample", "Đề mẫu"],
            ["text", "Dán văn bản"],
            ["image", "Hình ảnh"],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} className={`wg-tab ${tab === k ? "on" : ""}`} style={{ fontSize: 14, marginRight: 14, padding: "8px 2px" }} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "sample" &&
        (sample ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 13.5, color: "var(--dim)" }}>{sample.title}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                <button className="wg-btn" style={{ padding: "2px 9px" }} onClick={() => setSampleIdx((i) => (i - 1 + samples.length) % samples.length)}>
                  ←
                </button>
                <span style={{ fontSize: 12, color: "var(--dim)" }}>
                  {(sampleIdx % samples.length) + 1}/{samples.length}
                </span>
                <button className="wg-btn" style={{ padding: "2px 9px" }} onClick={() => setSampleIdx((i) => (i + 1) % samples.length)}>
                  →
                </button>
              </div>
            </div>
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

      {tab === "text" &&
        (textLocked ? (
          <div>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 12 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--dim)" }}>✓ Đã dùng đề văn bản này để viết.</p>
              {customTextTitle.trim() && <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600 }}>{customTextTitle.trim()}</p>}
              <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, fontFamily: "inherit", color: "var(--text)" }}>
                {customText}
              </pre>
            </div>
            <button className="wg-btn" style={{ marginTop: 10, width: "100%" }} onClick={resetTextTab}>
              Đặt lại
            </button>
          </div>
        ) : (
          <div>
            <input value={customTextTitle} onChange={(e) => setCustomTextTitle(e.target.value)} placeholder="Tiêu đề (không bắt buộc)" style={inputStyle} />
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Dán hoặc gõ đề bài (원문) vào đây."
              style={{ ...inputStyle, minHeight: 110, marginTop: 8, resize: "vertical", fontFamily: "inherit", lineHeight: 1.6 }}
            />
            <textarea
              value={customTextVn}
              onChange={(e) => setCustomTextVn(e.target.value)}
              placeholder="Ghi chú dịch (tự nhập, không tự động dịch)"
              style={{ ...inputStyle, minHeight: 56, marginTop: 8, resize: "vertical" }}
            />
            <button
              className="wg-btn on"
              style={{ marginTop: 10, width: "100%" }}
              disabled={!customText.trim()}
              onClick={() => {
                onActivate({
                  id: `custom-text-${Date.now()}`,
                  source: "text",
                  title: customTextTitle.trim() || "Đề tự nhập",
                  body: customText.trim(),
                  vn: customTextVn.trim(),
                });
                setTextLocked(true);
              }}
            >
              Dùng đề này để viết
            </button>
          </div>
        ))}

      {tab === "image" &&
        (imageLocked ? (
          <div>
            <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius-md)", padding: 12 }}>
              <p style={{ margin: 0, fontSize: 13.5, color: "var(--dim)" }}>
                ✓ Đã dùng {imageDataUrls.length} ảnh này để viết.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {imageDataUrls.map((src, i) => (
                  <img key={i} src={src} alt={`Đề bài ${i + 1}`} style={{ maxWidth: 100, maxHeight: 100, borderRadius: "var(--radius-sm)", objectFit: "cover" }} />
                ))}
              </div>
            </div>
            <button className="wg-btn" style={{ marginTop: 10, width: "100%" }} onClick={resetImageTab}>
              Đặt lại
            </button>
          </div>
        ) : (
          <div>
            <div
              tabIndex={0}
              onPaste={handlePaste}
              onDrop={(e) => {
                e.preventDefault();
                setImageDragOver(false);
                void handleFiles(e.dataTransfer.files);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setImageDragOver(true);
              }}
              onDragLeave={() => setImageDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `1px dashed ${imageDragOver ? "var(--accent)" : "var(--line)"}`,
                borderRadius: "var(--radius-md)",
                padding: 16,
                textAlign: "center",
                cursor: "pointer",
                fontSize: 13.5,
                color: "var(--dim)",
              }}
            >
              {imageDataUrls.length > 0 ? (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                    {imageDataUrls.map((src, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img src={src} alt={`Đề bài ${i + 1}`} style={{ maxWidth: 140, maxHeight: 140, borderRadius: "var(--radius-sm)", display: "block" }} />
                        <button
                          type="button"
                          aria-label={`Xoá ảnh ${i + 1}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageDataUrls((prev) => prev.filter((_, idx) => idx !== i));
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
                <>Nhấn để chọn tệp (chọn được nhiều ảnh) · Kéo-thả ảnh vào đây · Hoặc bấm vào đây rồi dán ảnh bằng Ctrl/Cmd+V</>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={(e) => void handleFiles(e.target.files)} />
            </div>

            {imageDataUrls.length > 0 && (
              <>
                <input value={imageTitle} onChange={(e) => setImageTitle(e.target.value)} placeholder="Tiêu đề (không bắt buộc)" style={{ ...inputStyle, marginTop: 10 }} />
                <textarea
                  value={imageVn}
                  onChange={(e) => setImageVn(e.target.value)}
                  placeholder="Ghi chú dịch (tự nhập, không tự động dịch)"
                  style={{ ...inputStyle, minHeight: 56, marginTop: 8, resize: "vertical" }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button
                    className="wg-btn on"
                    style={{ flex: 1 }}
                    onClick={() => {
                      onActivate({
                        id: `custom-image-${Date.now()}`,
                        source: "image",
                        title: imageTitle.trim() || "Đề bài (ảnh)",
                        body: "",
                        vn: imageVn.trim(),
                        imageDataUrls,
                      });
                      setImageLocked(true);
                    }}
                  >
                    Dùng đề này để viết
                  </button>
                  <button className="wg-btn" onClick={() => setImageDataUrls([])}>
                    Xoá hết ảnh
                  </button>
                </div>
              </>
            )}
          </div>
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
