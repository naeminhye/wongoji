import { useEffect, useMemo, useState } from "react";
import { MODES, SAMPLE_PROMPTS, type WongojiPrompt } from "./data/prompts";
import { DEFAULT_FONT_ID, FONT_OPTIONS, resolveFontFamily } from "./data/fonts";
import { countWongoji, type WongojiLayout } from "./lib/wongojiLayout";
import WongojiPaper from "./components/WongojiPaper";
import PrintPaper from "./components/PrintPaper";
import ActivePromptCard from "./components/ActivePromptCard";
import StatusPanel from "./components/StatusPanel";
import TimerPanel from "./components/TimerPanel";
import TrainingTimeline from "./components/TrainingTimeline";
import TestTimerPanel from "./components/TestTimerPanel";
import TestResultCard from "./components/TestResultCard";
import PracticeModeToggle, { type PracticeMode } from "./components/PracticeModeToggle";
import FixList from "./components/FixList";
import RulesModal from "./components/RulesModal";
import ConfirmDialog from "./components/ConfirmDialog";
import PromptPanel from "./components/PromptPanel";
import DraftPad from "./components/DraftPad";

type Mode = "q53" | "q54" | "free";
type Theme = "light" | "dark";
const MODE_KEYS: Mode[] = ["q53", "q54", "free"];

const THEME_KEY = "wg-theme";

type ConfirmState = { kind: "switch"; prompt: WongojiPrompt } | { kind: "clear" } | null;
type PrintMode = "content" | "blank";

function resolveInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export default function App() {
  const [mode, setMode] = useState<Mode>("q53");
  const [textByMode, setTextByMode] = useState<Record<Mode, string>>({ q53: "", q54: "", free: "" });
  const [activePromptByMode, setActivePromptByMode] = useState<Record<"q53" | "q54", WongojiPrompt | null>>({ q53: null, q54: null });
  const [draftByMode, setDraftByMode] = useState<Record<Mode, string>>({ q53: "", q54: "", free: "" });

  const [theme, setTheme] = useState<Theme>(resolveInitialTheme);
  const [fontId, setFontId] = useState<string>(DEFAULT_FONT_ID);
  const [showRaw, setShowRaw] = useState(false);
  const [printMode, setPrintMode] = useState<PrintMode>("content");
  const [lastLayout, setLastLayout] = useState<WongojiLayout | null>(null);

  const [secs, setSecs] = useState(MODES.q53.timer);
  const [running, setRunning] = useState(false);

  /* ⏱ Chế độ thi / 🎯 Chế độ luyện — chỉ có ý nghĩa ở câu 53/54 (Viết tự do
     "no prompt, no limits" nên bỏ qua, giống cách wongoji.com tách 2 mode
     thi/luyện ra khỏi chế độ viết tự do). */
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("training");
  const [testStarted, setTestStarted] = useState(false);
  const [testFinished, setTestFinished] = useState(false);

  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const cfg = MODES[mode];
  const text = textByMode[mode];
  const activePrompt = mode === "free" ? null : activePromptByMode[mode];
  const isTest = mode !== "free" && practiceMode === "test";
  const locked = (cfg.requiresPrompt && !activePrompt) || (isTest && (!testStarted || testFinished));

  /* áp theme lên <html> + lưu lựa chọn — không tự mở popup gì khi load trang */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  /* đồng hồ đếm ngược — dùng chung cho Viết tự do và ⏱ Chế độ thi (🎯 Chế độ
     luyện có đồng hồ riêng nhiều chặng trong TrainingTimeline) */
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (secs === 0) setRunning(false);
  }, [secs]);
  /* hết giờ khi đang thi → tự nộp bài, không cần bấm tay */
  useEffect(() => {
    if (isTest && testStarted && !testFinished && secs === 0) setTestFinished(true);
  }, [isTest, testStarted, testFinished, secs]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setRunning(false);
    setSecs(MODES[m].timer);
    setTestStarted(false);
    setTestFinished(false);
  };

  const changePracticeMode = (m: PracticeMode) => {
    setPracticeMode(m);
    setRunning(false);
    setSecs(cfg.timer);
    setTestStarted(false);
    setTestFinished(false);
  };

  const setText = (t: string) => setTextByMode((prev) => ({ ...prev, [mode]: t }));

  const doActivatePrompt = (prompt: WongojiPrompt) => {
    if (mode === "free") return;
    setActivePromptByMode((prev) => ({ ...prev, [mode]: prompt }));
    setTextByMode((prev) => ({ ...prev, [mode]: "" }));
    setRunning(false);
    setSecs(cfg.timer);
    setTestStarted(false);
    setTestFinished(false);
  };

  const startTest = () => {
    setTestStarted(true);
    setRunning(true);
  };
  const submitTest = () => {
    setRunning(false);
    setTestFinished(true);
  };
  const retryTest = () => {
    setTestStarted(false);
    setTestFinished(false);
    setRunning(false);
    setSecs(cfg.timer);
    setText("");
  };

  const requestActivatePrompt = (prompt: WongojiPrompt) => {
    if (mode === "free") return;
    const current = activePromptByMode[mode];
    if (current?.id === prompt.id) return; // đã active sẵn, không làm gì
    if (current && textByMode[mode].trim().length > 0) {
      setConfirmState({ kind: "switch", prompt });
    } else {
      doActivatePrompt(prompt);
    }
  };

  const requestClear = () => {
    if (text.trim().length > 0) {
      setConfirmState({ kind: "clear" });
    } else {
      setText("");
    }
  };

  const runConfirm = () => {
    if (!confirmState) return;
    if (confirmState.kind === "switch") doActivatePrompt(confirmState.prompt);
    if (confirmState.kind === "clear") setText("");
    setConfirmState(null);
  };

  const counted = useMemo(() => countWongoji(text), [text]);

  const printContent = () => {
    setPrintMode("content");
    requestAnimationFrame(() => window.print());
  };
  const printBlank = () => {
    setPrintMode("blank");
    requestAnimationFrame(() => window.print());
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", padding: "0 20px 64px" }}>
        {/* header */}
        <header className="no-print" style={{ display: "flex", alignItems: "baseline", gap: 16, padding: "26px 0 14px", flexWrap: "wrap" }}>
          <h1 style={{ margin: 0, fontSize: 24, letterSpacing: "-0.01em", fontWeight: 700 }}>
            원고지 <span style={{ color: "var(--dim)", fontWeight: 400 }}>· luyện viết TOPIK II</span>
          </h1>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="wg-btn" onClick={() => setRulesOpen(true)}>
              Quy tắc 원고지
            </button>
            <select className="wg-select" value={fontId} onChange={(e) => setFontId(e.target.value)} aria-label="Chọn font viết">
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label}
                </option>
              ))}
            </select>
            <button className={`wg-btn ${showRaw ? "on" : ""}`} onClick={() => setShowRaw((v) => !v)}>
              Ô nhập thô
            </button>
            <button className="wg-btn" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? "☀️ Sáng" : "🌙 Tối"}
            </button>
            <button className="wg-btn" onClick={printContent}>
              In bài viết
            </button>
            <button className="wg-btn" onClick={printBlank}>
              In giấy trống
            </button>
          </div>
        </header>

        {/* mode tabs */}
        <nav className="no-print" style={{ borderBottom: "1px solid var(--line)", marginBottom: 20, display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
          {MODE_KEYS.map((k) => (
            <button key={k} className={`wg-tab ${mode === k ? "on" : ""}`} onClick={() => switchMode(k)}>
              {MODES[k].label}
            </button>
          ))}
          {mode !== "free" && <PracticeModeToggle value={practiceMode} onChange={changePracticeMode} />}
          <span style={{ marginLeft: "auto", fontSize: 13.5, color: "var(--dim)", paddingBottom: 8 }}>{cfg.desc}</span>
        </nav>

        <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* ── left: prompt / draft / paper ── */}
          <main style={{ flex: "1 1 560px", minWidth: 320, display: "flex", flexDirection: "column", gap: 16 }}>
            {cfg.requiresPrompt ? (
              <PromptPanel key={mode} samples={SAMPLE_PROMPTS[mode as "q53" | "q54"]} active={activePrompt} onActivate={requestActivatePrompt} />
            ) : (
              <section className="wg-panel no-print">
                <p style={{ margin: 0, fontSize: 14, color: "var(--dim)" }}>Viết tự do — không có đề bài, vào là viết được ngay.</p>
              </section>
            )}

            <ActivePromptCard prompt={activePrompt} />

            {/* Ẩn nháp ở ⏱ Chế độ thi — mô phỏng điều kiện thi thật, không có trợ giúp */}
            {!isTest && (
              <DraftPad mode={mode} value={draftByMode[mode]} onChange={(value) => setDraftByMode((prev) => ({ ...prev, [mode]: value }))} />
            )}

            <WongojiPaper
              text={text}
              onChange={setText}
              minCells={cfg.minCells}
              maxCells={cfg.maxCells}
              fontFamily={resolveFontFamily(fontId)}
              disabled={locked}
              lockedMessage={
                cfg.requiresPrompt && !activePrompt
                  ? "Chọn đề bài để bắt đầu viết (mở tab Đề mẫu / Dán văn bản / Hình ảnh ở trên)."
                  : testFinished
                    ? "Đã nộp bài — bấm \"Làm lại\" ở sidebar để làm bài mới."
                    : "Bấm \"Bắt đầu làm bài\" ở sidebar để bắt đầu tính giờ."
              }
              onLayout={setLastLayout}
            />

            {showRaw && (
              <textarea
                className="no-print"
                value={text}
                disabled={locked}
                onChange={(e) => setText(e.target.value)}
                placeholder="Gõ tiếng Hàn ở đây — nội dung sẽ hiện trong ô ở trên."
                style={{
                  width: "100%",
                  minHeight: 120,
                  padding: 12,
                  background: "var(--bg-soft)",
                  color: "var(--text)",
                  border: "1px solid var(--line)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "'Apple SD Gothic Neo','Malgun Gothic','Noto Sans KR',sans-serif",
                }}
              />
            )}
          </main>

          {/* ── right: status ── */}
          <aside className="no-print" style={{ flex: "0 1 300px", minWidth: 260, display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 18 }}>
            <StatusPanel counted={counted} min={cfg.min} max={cfg.max} rowsUsed={lastLayout?.rowsUsed ?? 1} />

            {mode === "free" ? (
              <TimerPanel secs={secs} running={running} onToggle={() => setRunning((v) => !v)} onReset={() => setSecs(cfg.timer)} />
            ) : practiceMode === "training" ? (
              <TrainingTimeline key={`${mode}-${activePrompt?.id ?? "none"}`} mode={mode} />
            ) : (
              <TestTimerPanel
                secs={secs}
                totalSecs={cfg.timer}
                started={testStarted}
                finished={testFinished}
                onStart={startTest}
                onSubmit={submitTest}
                onRetry={retryTest}
              />
            )}

            {/* Chế độ thi: ẩn gợi ý tự động chỉnh cho tới khi nộp bài, mô
                phỏng điều kiện thi thật; nộp xong thì hiện thẳng Kết quả
                (đã gồm cả các chỗ tự động chỉnh) thay cho FixList thường. */}
            {isTest && testFinished ? (
              <TestResultCard counted={counted} min={cfg.min} max={cfg.max} timeUsedSecs={cfg.timer - secs} fixes={lastLayout?.fixes ?? {}} />
            ) : (
              !(isTest && !testFinished) && <FixList fixes={lastLayout?.fixes ?? {}} />
            )}

            <div style={{ display: "flex", gap: 8 }}>
              <button className="wg-btn" style={{ flex: 1 }} onClick={() => navigator.clipboard?.writeText(text)}>
                Sao chép
              </button>
              <button className="wg-btn danger" style={{ flex: 1 }} onClick={requestClear}>
                Xoá
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Bản in — lưới cỡ mm cố định, tách khỏi lưới responsive trên màn hình.
          ActivePromptCard ở trên (trong <main>) không mang class no-print nên
          tự in kèm; không cần render thêm một bản nữa ở đây. */}
      <PrintPaper
        text={printMode === "blank" ? "" : text}
        fontFamily={resolveFontFamily(fontId)}
        minCells={cfg.minCells}
        maxCells={cfg.maxCells}
      />

      <RulesModal open={rulesOpen} onClose={() => setRulesOpen(false)} />

      <ConfirmDialog
        open={confirmState !== null}
        title={confirmState?.kind === "clear" ? "Xoá nội dung" : "Chuyển sang đề khác"}
        message={
          confirmState?.kind === "clear"
            ? "Toàn bộ nội dung đang viết sẽ bị xoá. Bạn có chắc chắn không?"
            : "Bạn đang viết dở nội dung hiện tại. Chuyển sang đề khác sẽ xoá nội dung đang viết. Tiếp tục?"
        }
        confirmLabel={confirmState?.kind === "clear" ? "Xoá" : "Chuyển"}
        danger
        onConfirm={runConfirm}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
