# PCB 瑕疵檢測系統

PCB 瑕疵檢測系統是一個以 React、Express 與 FastAPI 組成的三層式網頁應用，結合 YOLO 影像偵測模型與 MySQL 資料庫，協助產線快速完成電路板影像上傳、瑕疵定位、結果分析與歷史追蹤。

## 目錄
- [專案簡介](#專案簡介)
- [核心特色](#核心特色)
- [系統架構](#系統架構)
- [技術棧](#技術棧)
- [先決條件](#先決條件)
- [安裝與執行](#安裝與執行)
- [環境變數](#環境變數)
- [主要功能流程](#主要功能流程)
- [REST API 概覽](#rest-api-概覽)
- [前端模組概覽](#前端模組概覽)
- [Python 檢測服務](#python-檢測服務)
- [資料庫實體](#資料庫實體)
- [維運腳本](#維運腳本)
- [文件與協作](#文件與協作)
- [品質檢查](#品質檢查)

## 專案簡介
- **前端**：以 React Router 佈局多個頁面，透過 Context 管理 cookie-based 認證狀態並串接 REST API。
- **後端**：Express 伺服器提供認證、檢測、歷史、公告、指南與關於資訊等路由，並與 Sequelize/MySQL 互動。
- **推論服務**：獨立的 FastAPI 服務載入 `server/model/best.onnx` YOLO 模型執行推論並產出縮圖、統計與結果影像，Node.js 以 Axios 呼叫該服務。

## 核心特色
- **影像上傳與 AI 檢測**：支援前端拖放影像、設定置信度並呼叫後端 `POST /api/detection`，後端會將檔案轉送至 YOLO 模型並回傳缺陷細節與標註圖。
- **檢測歷史、搜尋與批次動作**：提供分頁、篩選、排序、批次匯出/刪除與詳細頁面，對應 `GET /api/detection/history`、`/details/:id`、`/export` 等路由。
- **統計儀表板**：首頁與歷史頁顯示系統與個人統計（總檢測、瑕疵率、趨勢、缺陷分布），資料來源為 `GET /api/detection/system-stats` 與 `GET /api/detection/stats`。
- **個人資料中心**：使用者可更新姓名、密碼、頭像、查閱活動紀錄並刪除帳號，均透過受保護的 `/api/profile` 系列端點完成。
- **公告、使用指南與關於頁面**：系統提供靜態公告內容、線上說明文件與團隊介紹，方便展示或填充樣板資料。
- **訪客與登入者的最新檢測清單**：首頁的小工具會依登入狀態顯示最近檢測紀錄或引導使用者登入/開始檢測。
- **Cookie JWT 認證**：登入/註冊會設定 httpOnly cookie，前端的 Axios 自動帶入 cookie，並在 401 狀態時導向登入頁。

## 系統架構
- **Monorepo**：根目錄包含 `client/`、`server/`、`docs/` 與 `dev-runner.mjs` 等資料夾，方便集中管理前後端與文件。
- **前端**：React + Vite + Tailwind CSS，透過多個頁面與功能元件提供檢測、歷史、公告、說明與個人化體驗。
- **後端**：Express 服務器註冊多個模組化路由，整合認證、檢測、公告、指南、關於與個人資料功能，並以 Sequelize 連接 MySQL。
- **機器學習推論**：`server/python_service` 內的 FastAPI 應用使用 YOLO ONNX 模型進行推論、縮圖與報表產出，Node.js 透過 Axios 呼叫。
- **資料庫模型**：`DetectionHistory`、`DefectDetail` 與 `DetectionModel` 管理檢測主檔、瑕疵明細與模型資訊；`User` 儲存使用者資料與頭像。

## 技術棧
- **前端**：React 19、React Router 7、Axios、Framer Motion、Tailwind CSS、react-hot-toast 等。
- **後端**：Node.js/Express、Sequelize、MySQL2、JWT、Multer、Sharp、Archiver 等套件。
- **AI 與 Python**：FastAPI、Uvicorn、Ultralytics YOLO、OpenCV、Pillow、NumPy、ONNX Runtime GPU 等。

## 先決條件
- Node.js（建議 18 版以上，以支援 Vite 6 與 React 19 開發流程）。
- npm 或相容的套件管理工具。
- Python 3.10+（滿足 Ultralytics 與 ONNX 相關套件需求）。
- MySQL 8 或相容版本（後端透過 Sequelize 連線）。
- 可用的 YOLO ONNX 模型檔 `best.onnx`。

## 安裝與執行
1. **取得程式碼**
   ```bash
   git clone <repo-url>
   cd Defect-Detection
   ```
2. **建立資料庫與環境變數**
   - 新增 MySQL 資料庫與使用者，並於 `server/.env` 設定 `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `NODE_ENV` 等參數。
   - 設定 `JWT_SECRET`、`JWT_EXPIRES_IN` 與 `PYTHON_API_URL`（預設 `http://localhost:8000`）。
3. **安裝後端依賴**
   ```bash
   cd server
   npm install
   ```
   
4. **安裝前端依賴**
   ```bash
   cd ../client
   npm install
   ```
   
5. **設定 Python 虛擬環境並安裝套件**
   ```bash
   cd ../server/python_service
   python -m venv .venv
   source .venv/bin/activate  # Windows 使用 .venv\Scripts\activate
   pip install -r requirements.txt
   ```
   【F:server/python_service/requirements.txt†L1-L15】
6. **放置 YOLO 模型**：將 `best.onnx` 複製到 `server/model/best.onnx`，FastAPI 與初始化腳本會從此路徑載入模型。
7. **啟動 Python 檢測服務**
   ```bash
   cd server/python_service
   uvicorn detection_api:app --host 0.0.0.0 --port 8000
   ```
   
8. **啟動後端伺服器**
   ```bash
   cd ../../server
   npm run dev
   ```
   預設會在 5000 連接埠啟動，並允許來自 `http://localhost:5173` 的跨域請求。
9. **啟動前端開發伺服器**
   ```bash
   cd ../client
   npm run dev
   ```
   Vite 預設提供 `http://localhost:5173`，與後端 CORS 設定一致。
10. **同時啟動前後端（選用）**
    ```bash
    cd ..
    node dev-runner.mjs
    ```
    `dev-runner.mjs` 會以子行程啟動 `server` 與 `client` 的 `npm run dev`。

## 環境變數
| 變數 | 說明 | 
| --- | --- | --- |
| `PORT` | Express 監聽埠，預設 5000 |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | MySQL 連線資訊 |
| `NODE_ENV` | 控制 Sequelize 日誌輸出與 Cookie secure 設定 | 【F:server/config/database.js†L17-L31】
| `JWT_SECRET`, `JWT_EXPIRES_IN` | JWT 簽章與存活時間 |
| `PYTHON_API_URL` | Node.js 呼叫 FastAPI 的位址，預設 `http://localhost:8000` |

## 主要功能流程
### 帳號與權限
- `POST /api/auth/register`、`/login`、`/logout` 進行註冊、登入與登出；登入成功後後端會把 JWT 寫入 httpOnly Cookie。
- `GET /api/auth/me` 取得登入者資料，前端 Context 會在初始化與登入後更新全域狀態；若回傳 401 則導向登入頁。

### 瑕疵檢測流程
1. 使用者在檢測頁上傳影像，設定置信度後觸發 `detectDefects` Hook。
2. 前端呼叫 `POST /api/detection`，後端驗證檔案格式與大小後轉交 Python 服務推論。
3. Python 服務以 YOLO 模型產生結果圖、瑕疵列表與縮圖，再回傳給 Node.js。
4. 若使用者已登入，檢測結果會被寫入 `DetectionHistory` 與 `DefectDetail`，以供歷史查詢與統計使用。

### 檢測歷史與報告
- `GET /api/detection/history` 支援分頁、關鍵字、日期範圍、瑕疵類型與是否有瑕疵等篩選；結果可在前端進行批次選取、匯出或刪除。
- `POST /api/detection/export` 與 `/export/batch` 會產生 ZIP 檔，包含標註後影像、瑕疵 JSON 與摘要報告；匯出完畢會清除臨時資料夾。

### 統計與儀表板
- 使用者統計 `GET /api/detection/stats` 提供月度檢測次數、瑕疵總數、平均置信度、品質通過率與最近檢測等資訊。
- 全系統統計 `GET /api/detection/system-stats` 匯整總檢測量、瑕疵率、活躍用戶、缺陷分布與近七日趨勢，首頁元件會定時重新整理資料。

### 個人資料中心
- `GET/PUT /api/profile` 更新姓名與基本資料、`PUT /api/profile/password` 更改密碼、`POST /api/profile/avatar` 上傳頭像、`GET /api/profile/activity` 查詢活動紀錄、`DELETE /api/profile` 進行帳號刪除
- Hook 會在操作成功時刷新全域使用者資料並回饋 toast 提示。
### 公告、指南與關於頁面
- 公告清單來自後端靜態模型，可測試版面與分頁效果；前端顯示最新四則於首頁並提供完整列表頁。
- 使用手冊與快速指南透過 `/api/guides` 與其子路由提供分類、文章與搜尋資料。
- 關於頁面含團隊、使命願景、技術堆疊、時間線與聯絡資訊資料模型，可作為介紹或展示使用。
  
### 最近檢測資訊
- `GET /api/detection/recent` 支援訪客（顯示全站最新）與登入者（顯示個人最新），並提供是否還有更多資料與提示訊息；首頁元件支援重新整理與空狀態處理。

## REST API 概覽
| Method | Path | 功能 | 認證 |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | 註冊新使用者 | 否 |
| POST | `/api/auth/login` | 使用者登入 | 否 
| POST | `/api/auth/logout` | 清除登入 Cookie | 否 |
| GET | `/api/auth/me` | 取得當前登入者 | 是 |
| POST | `/api/detection` | 上傳影像進行檢測 | 可選 |
| GET | `/api/detection/history` | 取得使用者檢測歷史 | 是 |
| GET | `/api/detection/stats` | 個人統計資料 | 是 |
| GET | `/api/detection/system-stats` | 系統統計（首頁/管理） | 可選 / 管理員 |
| GET | `/api/detection/recent` | 最近檢測清單 | 可選 |
| POST | `/api/detection/export` | 匯出單筆檢測 ZIP | 否 |
| POST | `/api/detection/export/batch` | 批次匯出 ZIP | 是 |
| DELETE | `/api/detection/:id` | 刪除單筆檢測 | 是 | 
| GET | `/api/profile` | 取得個人資料 | 是 |
| GET | `/api/announcements` | 取得公告列表 | 否 |
| GET | `/api/guides` | 取得快速指南資料 | 否 | 
| GET | `/api/about` | 取得關於頁面資料 | 否 |

> **提示**：完整路由與參數請參考 `server/routes/` 與 `server/controllers/` 內對應檔案。

## 前端模組概覽
- `pages/DetectionPage.jsx`：影像上傳、參數調整、檢測結果顯示與重新檢測控制。
- `pages/HistoryPage.jsx` + `hooks/useHistory.js`：歷史清單、搜尋、篩選、批次操作與詳情導覽。
- `components/features/DashboardStats.jsx`：儀表板卡片與缺陷分布快覽。
- `components/features/RecentDetectionsList.jsx`：最新檢測小工具，包含動畫、空狀態與引導按鈕。
- `pages/ProfilePage.jsx` + `hooks/useProfile.js`：個人資料頁簽、頭像上傳、活動日誌與安全設定。
- `components/features/LatestAnnouncements.jsx`：公告卡片與連結整合。
- `components/contexts/AuthContext.jsx`：管理登入狀態、錯誤、Remember Me 與資料刷新流程。

## Python 檢測服務
- FastAPI 啟動後會在 `/health` 回報模型狀態與路徑，`/detect` 接收影像與置信度並回傳標註結果、瑕疵列表、縮圖與統計資訊。
- 服務啟動時會從 `server/model/best.onnx` 載入 YOLO 模型，若檔案不存在會輸出錯誤訊息；請確認該檔案與權限無誤。
- Node.js 透過 `runDetection` 檢查健康狀態、送出 multipart 請求、處理縮圖與結果影像，並回傳供前端使用的結構化資料。

## 資料庫實體
- **User**：包含姓名、email、bcrypt 雜湊密碼、角色、頭像 BLOB 與狀態欄位，並提供方法取得頭像 data URL。
- **DetectionHistory**：儲存原始圖、結果圖、瑕疵數、平均置信度、耗時與時間戳記。
- **DefectDetail**：每筆瑕疵的類型、位置、置信度與縮圖，與 `DetectionHistory` 互相關聯。
- **DetectionModel**：記錄可用的 ONNX 模型名稱、版本、檔案路徑與啟用狀態，支援管理端上傳或初始化模型。

## 維運腳本
- `server/scripts/cleanData.js`：清空檢測主檔與細項、重置 AUTO_INCREMENT 並調整索引，適合測試前重置資料。
- `server/scripts/cleanIndex.js`：清除 User 表多餘 email 索引並保留單一唯一索引，以改善資料庫效能。
- `server/scripts/resetDetectionIds.js`：重新排序檢測與瑕疵記錄 ID，維持編號連續性並處理外鍵依賴。

## 品質檢查
- 前端提供 `npm run lint`、`npm run build`、`npm run preview` 等腳本。
- 後端以 `npm run dev` 監聽程式變更；測試腳本尚未實作，可依需求擴充。
- Python 服務建議使用虛擬環境與 `pip install -r requirements.txt` 維持套件一致性。【

> 若需新增功能或修正，請參考 `docs/` 內的開發指南與 Git 提交流程，並確保在送出 PR 前完成必要的 lint 與手動測試。
