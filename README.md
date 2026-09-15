# 원고지 · luyện viết TOPIK II

Trang luyện viết tiếng Hàn theo định dạng 원고지 (giấy kẻ ô) cho câu 53 và 54
của kỳ thi TOPIK II. React + TypeScript + Vite.

## Chạy dự án

```bash
npm install
npm run dev      # dev server
npm run build    # build production (chạy tsc -b trước)
npx vitest run    # chạy toàn bộ unit test
```

## Cấu trúc

```
src/
  lib/
    wongojiLayout.ts       # layout engine THUẦN LOGIC, không phụ thuộc DOM
    wongojiLayout.test.ts
    responsiveCols.ts      # chọn số cột/cỡ ô lưới theo độ rộng khả dụng
    responsiveCols.test.ts
    gutterMarks.ts          # số đánh dấu ở gutter — luôn bội số 50, bất kể cols
    gutterMarks.test.ts
  data/
    prompts.ts              # đề mẫu 53/54 + cấu hình mode (min/max자, min/maxCells, timer)
    rules.ts                 # bảng quy tắc 원고지 hiển thị trong modal
    draftTemplates.ts       # gợi ý placeholder cho khu vực brainstorm
    fonts.ts                 # danh sách font cho trang giấy (Gowun Batang mặc định + lựa chọn khác)
    trainingStages.ts       # 4 chặng + preset thời gian cho 🎯 Chế độ luyện
    trainingStages.test.ts
  components/
    WongojiPaper.tsx        # lưới TƯƠNG TÁC responsive trên màn hình (no-print)
    PrintPaper.tsx           # lưới IN — cỡ ô mm cố định, tách khỏi lưới màn hình
    CellGlyph.tsx             # render 1 ô, dùng chung giữa 2 lưới trên
    ActivePromptCard.tsx    # đề bài đang active — hiện khi viết VÀ khi in
    StatusPanel.tsx         # bộ đếm 자 tổng duy nhất
    TimerPanel.tsx           # đồng hồ đơn giản — dùng cho Viết tự do
    PracticeModeToggle.tsx  # chuyển 🎯 Chế độ luyện / ⏱ Chế độ thi (câu 53/54)
    TrainingTimeline.tsx    # đồng hồ nhiều chặng của 🎯 Chế độ luyện
    TestTimerPanel.tsx       # đồng hồ một mốc, không tạm dừng của ⏱ Chế độ thi
    TestResultCard.tsx       # màn hình kết quả sau khi nộp bài ở Chế độ thi
    FixList.tsx              # danh sách chỗ đã tự động chỉnh
    RulesModal.tsx
    ConfirmDialog.tsx        # modal xác nhận dùng chung (thay window.confirm)
    PromptPanel.tsx          # chọn đề mẫu / dán text / dán-upload ảnh
    DraftPad.tsx
  App.tsx
```

## Quyết định thiết kế đáng chú ý

**1. `countWongoji()` tách khỏi cols đang render.** Rule "dấu cách rơi đúng ô
đầu dòng thì bị bỏ, không tính 자" vốn là quy tắc viết tay trên giấy có số cột
*cố định*. Vì lưới luyện tập ở đây responsive (10/20/25 cột tuỳ màn hình, tối
đa 25/dòng — màn hình rộng hơn thì phóng to ô/chữ thay vì thêm cột), tính 자
trực tiếp trên cols đang render sẽ khiến số 자 nhảy khi resize
cửa sổ — sai với yêu cầu "một bộ đếm tổng... không phụ thuộc số cột đang
render". Giải pháp: 자-count luôn tính trên một layout ảo ở `REFERENCE_COLS =
20` (khổ 원고지 chuẩn), tách biệt hoàn toàn khỏi cols dùng để vẽ lưới thật.
Xem comment trong `src/lib/wongojiLayout.ts`.

Lưu ý: lưới màn hình vẫn hiện **thêm** một dải số cộng dồn ở gutter (cột phụ
bên phải lưới) giống thước trên giấy trả lời TOPIK thật — LUÔN đúng bội số 50
(50, 100, 150, 200...) bất kể `cols` đang render là bao nhiêu, kể cả khi 50
không chia hết cho `cols` (VD 20 — xem `lib/gutterMarks.ts`, hàm thuần
`gutterMarkAt`, có test riêng). Số nằm đè lên đúng đường kẻ ngang nó đại diện
(mép dưới dòng đó) chứ không lửng giữa dòng; dòng gutter phải khai báo
`box-sizing: content-box` + border trong suốt cùng độ dày với border thật của
dòng lưới bên trái để hai cột luôn cao bằng nhau từng dòng một — nếu không,
sai lệch nhỏ (do border cộng dồn khác nhịp) sẽ càng lúc càng lệch nhiều về
cuối trang. Số gutter này **chỉ mang tính tham chiếu trực quan theo dòng**,
không phải nguồn số liệu chính thức — bộ đếm 자 tổng ổn định ở StatusPanel mới
là số dùng để so với khoảng 200~300 / 600~700자.

**2. Lưới in tách hẳn khỏi lưới màn hình (`PrintPaper.tsx`).** Ban đầu in
trực tiếp lưới responsive khiến ô bị kéo dài, không còn vuông — nguyên nhân
là khi bề rộng thật của lưới (tính theo px của màn hình) vượt khổ giấy in,
trình duyệt "fit to page" co bề rộng nhưng không co bề cao tương ứng.
`PrintPaper` render lại toàn bộ nội dung ở `PRINT_COLS = 25` cố định (khớp
mốc tối đa của lưới màn hình — xem mục 1 — nhưng **tách biệt hoàn toàn** khỏi
`REFERENCE_COLS = 20` dùng riêng để tính 자, đổi số cột hiển thị khi in không
được phép ảnh hưởng cách đếm 자) với ô cỡ **mm tuyệt đối** (không phải px) —
tổng bề rộng lưới giữ nguyên 160mm (đã kiểm chứng vừa khít khổ A4 in được
~186mm), chia đều cho 25 cột ra mỗi ô 6.4mm × 6.4mm, mà không cần trình duyệt
co giãn gì thêm nên ô luôn vuông và cùng kích cỡ mỗi lần in. `WongojiPaper`
(lưới màn hình) vì vậy mang class `no-print` cố định; `App.tsx` render riêng
`<PrintPaper text={...} />` (ẩn trên màn hình qua class `.print-only`, chỉ
hiện khi `@media print`) và chọn `text=""` cho nút "In giấy trống". `.print-
only` còn cần `display:flex; justify-content:center` khi in — lưới in hẹp hơn
khổ giấy in được nên nếu chỉ để `display:block` nó dạt sát lề trái thay vì
nằm giữa trang.

CSS `@media print` cũng ép cứng bảng màu về mực đen trên nền trắng
(`index.css`, cuối file) bất kể theme sáng/tối đang bật — nếu không, in ở
theme tối sẽ ra chữ gần trắng trên giấy trắng.

**3. Không còn OCR/gõ lại đề từ ảnh — và cho phép NHIỀU ảnh cùng lúc.** Trước
đây có một ô bắt buộc gõ lại đề khi upload ảnh (do chưa nối OCR thật) — tính
năng này đã bị bỏ theo yêu cầu vì gây lỗi/khó dùng. Giờ ảnh đề bài được
**hiển thị nguyên bản**, cả lúc viết lẫn lúc in (`ActivePromptCard.tsx`,
không mang class `no-print`), không cần gõ lại gì cả. Muốn dịch nhanh sang
tiếng Việt, người dùng tự ghi vào ô ghi chú (không phải dịch máy).

`WongojiPrompt.imageDataUrls` là **mảng**, không phải 1 ảnh — tab "Hình ảnh"
(`PromptPanel.tsx`) nhận nhiều ảnh cùng lúc qua chọn file (`multiple`), kéo-
thả nhiều file, hoặc dán (Ctrl/Cmd+V) nhiều ảnh trong clipboard, gộp dần vào
danh sách (không ghi đè), xoá được từng ảnh riêng lẻ. Sau khi bấm "Dùng đề
này để viết" (tab Dán văn bản hoặc Hình ảnh), form nhập bị ẩn đi (khoá lại,
trạng thái local trong component, không liên quan tới đề đang active ở
App.tsx) và thay bằng khối xác nhận read-only + nút "Đặt lại" — bấm vào mới
xoá trắng form để soạn đề khác. `PromptPanel` được `key={mode}` ở `App.tsx`
để trạng thái khoá/nhập không lẫn lộn khi chuyển qua lại câu 53 ⇄ 54.

**4. Đề bài không còn ép cứng cấu trúc nháp.** `DraftPad` trước đây chia
thành nhiều ô cố định theo mode (수치/원인/결론 cho câu 53; 서론/본론1/본론2/
결론 cho câu 54). Vì đề bài thực tế có thể không khớp khung đó, nay chỉ còn
MỘT ô nhập tự do; khung gợi ý chỉ còn nằm trong placeholder.

**5. Theme sáng/tối.** Nút "🌙 Tối / ☀️ Sáng" trên header đổi thuộc tính
`data-theme` trên `<html>`; giá trị ban đầu ưu tiên lựa chọn đã lưu
(`localStorage`), nếu chưa có thì theo `prefers-color-scheme` của hệ thống.
Biến CSS 2 theme nằm ở đầu `index.css`.

**6. Không còn tự mở modal quy tắc khi load trang.** Trước đây modal
"Quy tắc 원고지" tự bật ở lần vào trang đầu tiên; nay chỉ mở khi bấm nút
"Quy tắc 원고지" trên header — không còn hành vi tự động nào khi tải trang.

**7. Xác nhận trước khi mất dữ liệu dùng modal riêng, không dùng
`window.confirm`/`alert`.** Dialog gốc của trình duyệt chặn toàn bộ JS và khó
kiểm thử; `ConfirmDialog.tsx` là modal tự viết dùng cho cả hai trường hợp: đổi
đề bài giữa chừng đang viết dở, và bấm "Xoá" khi đang có nội dung.

**8. `layoutWongoji(text, cols)` là hàm thuần** — không đụng DOM, nhận `cols`
làm tham số thay vì hard-code, nên đổi cols sẽ re-layout lại toàn bộ theo đúng
quy tắc ở `wongoji-prompt.md` mục 1 (không phải CSS-wrap). Test trong
`wongojiLayout.test.ts` phủ từng quy tắc riêng lẻ. `PrintPaper` dùng lại đúng
hàm này ở `PRINT_COLS` cố định.

**9. 🎯 Chế độ luyện / ⏱ Chế độ thi (câu 53/54 — tham khảo hành vi 훈련 모드
của wongoji.com, không sao chép giao diện).** Viết tự do không có khái niệm
thi/luyện nên không hiện nút chuyển (giống cách wongoji.com tách riêng "no
prompt, no limits").

- **🎯 Chế độ luyện** (mặc định): đồng hồ NHIỀU CHẶNG độc lập
  (`TrainingTimeline.tsx`) — Lên ý tưởng / Lập dàn ý / Viết bài / Rà soát,
  mỗi chặng tự start/pause/reset riêng, có preset theo thời lượng chính thức
  của câu + một mốc "Nhanh" để luyện ngắn (`data/trainingStages.ts`). Nháp
  (`DraftPad`) và gợi ý tự động chỉnh (`FixList`) hiện xuyên suốt để hỗ trợ
  học.
- **⏱ Chế độ thi**: MỘT mốc giờ duy nhất, chạy liên tục — không tạm dừng
  được sau khi bấm "Bắt đầu làm bài" (`TestTimerPanel.tsx`), mô phỏng điều
  kiện thi thật. Trang giấy khoá cho tới khi bắt đầu, và khoá lại ngay sau
  khi nộp bài/hết giờ. Nháp bị ẩn hoàn toàn; danh sách tự động chỉnh cũng ẩn
  trong lúc làm bài, chỉ hiện lại SAU khi nộp dưới dạng màn hình Kết quả
  (`TestResultCard.tsx`: số 자 so với khoảng yêu cầu, thời gian dùng, và các
  chỗ đã tự động chỉnh) — nhằm không cho trợ giúp trực tiếp trong lúc thi.

Chuyển đổi mode nội dung (câu 53 ⇄ 54 ⇄ Viết tự do) hoặc đổi đề bài đang active
sẽ reset trạng thái thi (`testStarted`/`testFinished`) và đồng hồ về ban đầu —
không mang trạng thái thi dở của đề cũ sang đề mới.

**10. Kích thước trang cố định cho câu 53/54, nhưng KHÔNG BAO GIỜ cắt mất nội
dung đã gõ.** `ModeConfig` (`data/prompts.ts`) có `minCells`/`maxCells` (số ô,
không phải số dòng — `WongojiPaper` tự quy ra số dòng theo `cols` responsive
đang render): câu 53 cố định 300 ô, câu 54 cố định 700 ô, Viết tự do mặc định
hiện sẵn 700 ô (`minCells: 700`) rồi tự thêm dòng không giới hạn khi viết tới
cuối (không có `maxCells`).

Cạm bẫy đã gặp: số ô **vật lý cần dùng** trên lưới luôn ≥ số 자 đếm được, vì
các quy tắc 원고지 chính đáng (thụt đầu mỗi đoạn mới sau `\n`, dòng trống bị
bỏ trắng khi có `\n\n` liên tiếp, ngoặc mở bị đẩy xuống dòng dưới...) đều
chiếm ô nhưng không tính vào 자 — một bài 676자 hợp lệ có vài dòng trống giữa
đoạn hoàn toàn có thể cần hơn 700 ô thật để hiển thị hết. Nếu cắt cứng số dòng
xuống đúng `maxCells/cols` sẽ **âm thầm giấu mất phần chữ cuối** dù bài vẫn
hợp lệ. Vì vậy `maxCells` trong `WongojiPaper.tsx` chỉ được phép cắt bớt DÒNG
TRỐNG THỪA chưa viết tới, tuyệt đối không được cắt xuống dưới `contentRows`
(số dòng tối thiểu để hiện đủ nội dung đã gõ).

**11. Nhóm border ngang/dọc lệch nhịp nhau có chủ đích.** Border đậm dọc (theo
cột) luôn bó **5** cột/lần (`groupSizeForCols` trong `responsiveCols.ts`, trả
về hằng số 5 bất kể `cols`, đúng chuẩn 200자 원고지 = 4 bó × 5 ô/dòng); border
đậm ngang (theo dòng) bó **4** dòng/lần (`ROW_GROUP_SIZE`/`PRINT_ROW_GROUP_SIZE`
— hằng số riêng, KHÔNG dùng chung `groupSizeForCols`). Dòng cuối cùng của
trang cũng luôn đậm (đối xứng với viền trên cùng), tạo viền đáy rõ ràng.

**12. Lưu ý CSS khi ghép 2 cột cao bằng nhau theo từng dòng (gutter vs lưới).**
Cột lưới không khai báo `height` trực tiếp — chiều cao mỗi dòng là auto theo ô
con (`cell`px/mm) CỘNG THÊM border (border không nằm trong `cell` vì đây là
box tự auto-size, không phải height khai báo). Cột gutter bên cạnh vì vậy
cũng phải `box-sizing: content-box` (ghi đè `* { box-sizing: border-box }`
toàn cục ở `index.css`) + border trong suốt cùng độ dày, để `height: cell` +
border cộng thêm ra đúng tổng bằng dòng lưới — nếu để `border-box`, border ăn
ngược vào `cell` đã khai báo, tổng vẫn chỉ ra đúng `cell`, hai cột lệch nhau
dần từng dòng (càng xuống dưới càng lệch nhiều).

## Việc chưa làm / giới hạn đã biết

- OCR ảnh đề bài: không có — ảnh hiển thị nguyên bản, người dùng tự đọc.
- Dịch tự động 원문 → tiếng Việt: không có, thay bằng ô ghi chú tự nhập.
- Chưa kiểm thử trực tiếp trên trình duyệt thật trong các phiên làm việc vừa
  qua (Chrome extension không kết nối được) — đã kiểm bằng `tsc -b`,
  `vitest run`, và `npm run build` đều pass; đặc biệt hành vi in (kích cỡ ô,
  màu sắc theme tối) chỉ được suy luận từ CSS/DOM chứ chưa xem bản in thật —
  nên tự `npm run dev`, thử "In bài viết"/"In giấy trống" qua print preview
  của trình duyệt trước khi coi là final.
