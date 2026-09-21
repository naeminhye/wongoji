# 원고지 · TOPIK II Writing Practice

A Korean writing practice page that mimics the 원고지 (manuscript grid paper)
format for questions 53 and 54 of the TOPIK II exam. React + TypeScript + Vite.

## Running the project

```bash
npm install
npm run dev      # dev server
npm run build    # production build (runs tsc -b first)
npx vitest run    # run the full unit test suite
```

## Structure

```
src/
  lib/
    wongojiLayout.ts       # PURE LOGIC layout engine, no DOM dependency
    wongojiLayout.test.ts
    responsiveCols.ts      # picks column count/cell size based on available width
    responsiveCols.test.ts
    gutterMarks.ts          # gutter tick numbers — always multiples of 50, regardless of cols
    gutterMarks.test.ts
  data/
    prompts.ts              # sample prompts for 53/54 + mode config (min/max자, min/maxCells, timer)
    rules.ts                 # 원고지 rules table shown in the modal
    draftTemplates.ts       # placeholder hints for the brainstorming area
    fonts.ts                 # font list for the paper (Gowun Batang default + other choices)
    trainingStages.ts       # 4 stages + time presets for 🎯 Training mode
    trainingStages.test.ts
  components/
    WongojiPaper.tsx        # responsive INTERACTIVE grid on screen (no-print)
    PrintPaper.tsx           # PRINT grid — fixed cell size in mm, separate from the screen grid
    CellGlyph.tsx             # renders a single cell, shared by both grids above
    ActivePromptCard.tsx    # the active prompt — shown while writing AND while printing
    StatusPanel.tsx         # the single, stable 자 (character) counter
    TimerPanel.tsx           # simple countdown — used for Free writing
    PracticeModeToggle.tsx  # switches between 🎯 Training mode / ⏱ Test mode (questions 53/54)
    TrainingTimeline.tsx    # multi-stage timeline for 🎯 Training mode
    TestTimerPanel.tsx       # single, non-pausable countdown for ⏱ Test mode
    TestResultCard.tsx       # results screen shown after submitting in Test mode
    FixList.tsx              # list of auto-corrections applied
    RulesModal.tsx
    ConfirmDialog.tsx        # shared confirmation modal (replaces window.confirm)
    PromptPanel.tsx          # paste a prompt / upload images / pick from the sample library
    DraftPad.tsx
  App.tsx
```

## Notable design decisions

**1. `countWongoji()` is decoupled from the currently rendered `cols`.** The
rule "a space that lands exactly at the start of a line is dropped and not
counted as 자" is a handwriting-on-paper rule that assumes a *fixed* number of
columns. Because the practice grid here is responsive (10/20/25 columns
depending on screen width, capped at 25/row — a wider screen enlarges the
cells/text instead of adding columns), counting 자 directly against the
currently rendered `cols` would make the count jump every time the window is
resized — which breaks the requirement of "a single, stable total counter...
independent of the number of columns currently rendered." The fix: the 자
count is always computed against a virtual layout at `REFERENCE_COLS = 20`
(the standard 원고지 size), fully decoupled from the `cols` used to draw the
actual grid. See the comment in `src/lib/wongojiLayout.ts`.

Note: the on-screen grid additionally shows a running tally in the gutter (an
extra column to the right of the grid), like the ruler printed on a real
TOPIK answer sheet — it is ALWAYS a multiple of 50 (50, 100, 150, 200...)
regardless of the currently rendered `cols`, even when 50 doesn't divide
evenly into `cols` (e.g. 20 — see the pure function `gutterMarkAt` in
`lib/gutterMarks.ts`, which has its own tests). The number sits exactly on the
horizontal rule it represents (the bottom edge of that row), not floating
mid-row; the gutter column has to declare `box-sizing: content-box` plus a
transparent border of the same thickness as the real border on the grid to
its left, so the two columns stay the same height row by row — otherwise tiny
mismatches (from borders accumulating at a different pace) drift further and
further apart toward the bottom of the page. This gutter number is **purely a
visual, per-row reference** and not an authoritative figure — the stable total
자 counter in StatusPanel is the number that should be compared against the
200~300 / 600~700자 target.

**2. The print grid is fully separate from the screen grid (`PrintPaper.tsx`).**
Printing the responsive grid directly at first caused cells to stretch and
lose their square shape — because when the grid's actual width (in on-screen
px) exceeds the printable page size, the browser's "fit to page" shrinks the
width but not the height to match. `PrintPaper` re-renders the entire content
at a fixed `PRINT_COLS = 25` (matching the screen grid's max column count —
see point 1 — but **fully decoupled** from the `REFERENCE_COLS = 20` used
solely for counting 자; changing the column count used for printing must never
affect how 자 is counted) with cells sized in **absolute mm** (not px) — the
grid's total width is fixed at 160mm (verified to fit snugly within the
~186mm printable area of A4), split evenly into 25 columns of 6.4mm × 6.4mm
each, with no further scaling needed from the browser, so cells stay square
and the same size on every print. `WongojiPaper` (the screen grid) therefore
always carries the `no-print` class; `App.tsx` renders a separate
`<PrintPaper text={...} />` (hidden on screen via the `.print-only` class,
shown only under `@media print`) and passes `text=""` for the "Print blank
paper" button. `.print-only` also needs `display:flex; justify-content:center`
when printing — the print grid is narrower than the printable page, so with
plain `display:block` it would hug the left margin instead of being centered.

The `@media print` CSS also forces the color palette to black ink on white
paper (`index.css`, end of file) regardless of whether light/dark theme is
active — otherwise printing in dark theme would produce near-white text on
white paper.

**3. No more OCR / retyping the prompt from an image — and multiple images are
allowed at once.** There used to be a mandatory field to retype the prompt
when uploading an image (since no real OCR was wired up) — this was removed
per requirements because it was error-prone and hard to use. The prompt image
is now **shown as-is**, both while writing and while printing
(`ActivePromptCard.tsx`, without the `no-print` class), with no retyping
needed. For a quick Vietnamese translation, the user types it into the note
field themselves (not machine translation).

`WongojiPrompt.imageDataUrls` is an **array**, not a single image.
`PromptPanel.tsx` has 2 tabs: **"Paste prompt"** (the default on entry) and
**"Sample library"**.

The "Paste prompt" tab combines a single place for both pasting text AND
uploading images — no longer split into separate "Paste text"/"Image" tabs
like before, since a real prompt can have both a text lead-in and an attached
illustrative image (a photographed data table, etc.) at the same time. Images
are accepted via file picker (`multiple`), drag-and-drop of multiple files, or
pasting (Ctrl/Cmd+V) multiple images from the clipboard, appended to the list
(never overwritten), and each image can be removed individually. When
displayed (`ActivePromptCard.tsx`) and when the locked state is saved, the
order is always **text first, then images** — no more mutually-exclusive
if/else between the two content types. After clicking "Use this prompt to
write", the input form is hidden (locked, local state in the component,
unrelated to the active prompt in App.tsx) and replaced with a read-only
confirmation block plus a "Reset" button — only clicking it clears the form to
compose a different prompt. `PromptPanel` is keyed with `key={mode}` in
`App.tsx` so the locked/input state doesn't get mixed up when switching
between questions 53 ⇄ 54.

The "Sample library" tab picks an existing prompt via a **dropdown** (instead
of clicking ←/→ arrows through each prompt like before) — necessary now that
the library holds dozens of sample prompts.

**4. Prompts no longer force a rigid draft structure.** `DraftPad` used to be
split into several fixed fields per mode (수치/원인/결론 for question 53;
서론/본론1/본론2/결론 for question 54). Since a real prompt may not match that
framework, it's now a SINGLE free-text field; the suggested framework only
lives in the placeholder.

**5. Light/dark theme.** The "🌙 Dark / ☀️ Light" header button toggles the
`data-theme` attribute on `<html>`; the initial value prefers a saved choice
(`localStorage`), falling back to the system's `prefers-color-scheme` if none
is saved. The CSS variables for both themes live at the top of `index.css`.

**6. The rules modal no longer auto-opens on page load.** It used to pop open
the "원고지 Rules" modal automatically on first visit; now it only opens when
the "원고지 Rules" button in the header is clicked — no more automatic
behavior on page load.

**7. Confirmation before losing data uses a custom modal, not
`window.confirm`/`alert`.** The browser's native dialog blocks all JS and is
hard to test; `ConfirmDialog.tsx` is a hand-rolled modal used for both cases:
switching prompts mid-write, and clicking "Clear" while there's content.

**8. `layoutWongoji(text, cols)` is a pure function** — it never touches the
DOM and takes `cols` as a parameter instead of hardcoding it, so changing
`cols` re-lays out everything according to the rules in `wongoji-prompt.md`
section 1 (not CSS wrapping). The tests in `wongojiLayout.test.ts` cover each
rule individually. `PrintPaper` reuses this exact function at a fixed
`PRINT_COLS`.

**9. 🎯 Training mode / ⏱ Test mode (questions 53/54 — inspired by the
behavior of wongoji.com's 훈련 모드, without copying its UI).** Free writing
has no concept of test/training, so the mode toggle isn't shown for it (the
same way wongoji.com keeps its "no prompt, no limits" mode separate).

- **🎯 Training mode** (default): an independent MULTI-STAGE timeline
  (`TrainingTimeline.tsx`) — Brainstorm / Outline / Write / Review, each stage
  with its own start/pause/reset, with presets based on the question's
  official time allowance plus a "Quick" preset for short practice runs
  (`data/trainingStages.ts`). The draft pad (`DraftPad`) and auto-correction
  hints (`FixList`) stay visible throughout to support learning.
- **⏱ Test mode**: a SINGLE countdown that runs continuously — it cannot be
  paused once "Start" is clicked (`TestTimerPanel.tsx`), simulating real exam
  conditions. The paper is locked until started, and locks again immediately
  after submission/time-up. The draft pad is fully hidden; the auto-correction
  list is also hidden while the test is in progress, only reappearing AFTER
  submission as a Results screen (`TestResultCard.tsx`: 자 count against the
  required range, time used, and the corrections that were applied) — so that
  no direct assistance is available during the test.

Switching content mode (question 53 ⇄ 54 ⇄ Free writing) or changing the
active prompt resets the test state (`testStarted`/`testFinished`) and the
timer back to their initial values — an in-progress test on the old prompt is
never carried over to a new one.

**10. Fixed page size for questions 53/54, but content that has already been
typed is NEVER cut off.** `ModeConfig` (`data/prompts.ts`) has
`minCells`/`maxCells` (a number of cells, not rows — `WongojiPaper` derives
the row count itself from the currently rendered responsive `cols`): question
53 is fixed at 300 cells, question 54 at 700 cells, Free writing shows 700
cells by default (`minCells: 700`) and then keeps adding rows without limit as
the user writes past the end (no `maxCells`).

A pitfall that came up: the number of cells **physically needed** on the grid
is always ≥ the counted 자, because legitimate 원고지 rules (indenting each new
paragraph after `\n`, leaving a row blank on consecutive `\n\n`, pushing an
opening bracket down to the next line, etc.) all consume cells without
counting toward 자 — a valid 676자 essay with a few blank lines between
paragraphs can genuinely need more than 700 cells to display in full. Hard-
capping the row count at exactly `maxCells/cols` would **silently hide the
tail end of the text** even though the essay is still valid. So `maxCells` in
`WongojiPaper.tsx` is only ever allowed to trim EXCESS BLANK ROWS that haven't
been written into yet, and must never cut below `contentRows` (the minimum
number of rows needed to display all the content already typed).

**11. Horizontal/vertical border groupings are intentionally out of sync.**
Bold vertical borders (by column) always group every **5** columns
(`groupSizeForCols` in `responsiveCols.ts` returns the constant 5 regardless
of `cols`, matching the standard 200자 원고지 layout of 4 groups × 5 cells per
row); bold horizontal borders (by row) group every **4** rows
(`ROW_GROUP_SIZE`/`PRINT_ROW_GROUP_SIZE` — a separate constant, which does NOT
share `groupSizeForCols`). The very last row of the page is also always bold
(mirroring the top border), giving a clear bottom edge.

**12. A CSS note on keeping two columns the same height row by row (gutter vs.
grid).** The grid column doesn't declare `height` directly — each row's
height is auto, based on the child cell (`cell`px/mm) PLUS its border (the
border isn't included in `cell` since this box auto-sizes rather than using a
declared height). The gutter column next to it therefore also needs
`box-sizing: content-box` (overriding the global `* { box-sizing: border-box }`
in `index.css`) plus a transparent border of the same thickness, so that
`height: cell` + the added border sums to exactly the grid row's total — if
left as `border-box`, the border eats into the declared `cell` instead, the
total still comes out to just `cell`, and the two columns drift apart row by
row (more and more toward the bottom).

## Not done yet / known limitations

- Prompt image OCR: none — images are shown as-is, the user reads them directly.
- Automatic 원문 → Vietnamese translation: none, replaced by a manually-typed
  note field.
- Not yet tested directly in a real browser during recent work sessions (the
  Chrome extension couldn't connect) — verified via `tsc -b`, `vitest run`,
  and `npm run build`, all of which pass; in particular, print behavior (cell
  size, dark-theme colors) has only been inferred from CSS/DOM, not checked
  against an actual printout — so run `npm run dev` yourself and try "Print
  essay"/"Print blank paper" through the browser's print preview before
  treating it as final.
