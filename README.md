# PCB 瑕疵檢測網站
PCB瑕疵檢測系統是一個先進的AI驅動平台，專為電子製造業設計，能夠自動識別和分析印刷電路板上的各種缺陷和異常。本系統整合了計算機視覺與深度學習技術，提供了直觀的網頁界面，讓用戶可以輕鬆上傳PCB圖像或使用攝影機實時檢測，系統會立即標記出可能的瑕疵位置並生成詳細報告，支援品質控制團隊做出精確的生產決策。

## 🚀 專案目的
本系統旨在革新傳統PCB質量檢測流程，解決以下關鍵挑戰：

提高檢測效率：將人工目視檢測轉變為自動化流程，將檢測時間從分鐘縮短至秒級，並支援批量處理。

提升檢測準確率：透過先進的AI演算法識別微小至0.01mm的缺陷，包括開路、短路、針孔、銅箔缺損等多種瑕疵類型。

降低生產成本：減少人工檢測的人力資源投入，同時降低因未檢出瑕疵而導致的後續損失。

數據分析與優化：收集並分析檢測數據，識別生產流程中的系統性問題，支援製程持續改善。

客製化解決方案：針對不同產業需求（如醫療設備、航空電子等）提供專門的檢測模型和標準。

---

## 📁 專案架構

```
Defect-Detection/
├── client/                    # 前端 (使用 React + Vite)
│   ├── public/                # 靜態資源 (logo, favicon, 全域 CSS)
│       ├── assets/            # 圖片、影片等資源
│   └── src/
│       ├── components/        # 可重用UI元件
|           ├── announcements/ # 最新公告頁面元件
│           ├── constants/     # 定義全域常量（如 API 路徑、靜態資料）
|           ├── contexts/      # React Context，用於全域狀態管理（如用戶驗證、主題設定）
│           ├── features/      # 核心功能元件（如影像上傳、檢測結果顯示）
|           ├── help/          # 使用手冊相關元件（如目錄、內容顯示）
│           ├── layout/        # 頁面布局元件 (Navbar, Footer)
│           |── services/      # API 請求與外部接口的封裝
│           └── ui/            # 基礎UI元件 (Button, Card, Badge)
│       ├── pages/             # 頁面組件
│           |── api/           # API相關頁面
│           └── auth/          # 帳號驗證相關頁面
│       ├── hooks/             # 自定義 React Hooks，封裝業務邏輯（如公告、幫助內容的資料處理）
│       ├── utils/             # 工具函數 (日期格式化, 檔案處理)
│       ├── tests/             # 單元與整合測試
│       ├── App.jsx            # 應用主入口
│       └── index.jsx          # React渲染入口
│
├── server/                    # 後端 (Express)
│   ├── config/                # 環境變數與資料庫設定
│       └── database.js        # 資料庫連線與設定。
│   ├── controllers/           # API 邏輯控制層
│   ├── middlewares/           # 驗證、錯誤處理等中介層
│   ├── model/                 # 資料模型 (會員、公告、檢測記錄)
│   ├── routes/                # API 路由設定
│   ├── utils/                 # JWT、hash、工具類
│   ├── app.js                 # Express 主入口
│   └── package.json           # 後端依賴項
│
├── docs/                      # 系統設計文檔 (架構圖、流程圖、規格)
│   └── architecture.md        # 系統架構說明
│
├── .env                       # 環境變數設定檔
├── .gitignore                 # Git忽略清單
├── dev-runner.mjs             # 開發環境啟動腳本
├── CHANGELOG.md               # 版本變更記錄
└── README.md                  # 專案說明文件
```

前端架構說明
* components/: 組件化設計，分為布局、UI基礎元件、功能元件等
* pages/: 頁面組件，包含主要功能頁面如檢測、歷史記錄、報告等
* hooks/: 自定義Hook封裝業務邏輯，提高代碼複用性
* utils/: 工具函數，處理日期、檔案、驗證等通用功能

後端架構說明
* controllers/: API邏輯控制層，處理業務邏輯
* model/: 資料模型，管理資料的結構和操作
* routes/: API路由設定，定義API端點和HTTP方法
* middlewares/: 中間件層，處理認證、日誌、錯誤等橫切關注點

開發工具與方法
* dev-runner.mjs: 並行啟動前後端服務的開發環境腳本
* docs/: 包含系統設計文檔，方便團隊協作和開發參考
* .env: 環境變數設定，用於區分開發、測試和生產環境

---

## 🔧 開發方式

1. **Clone 專案**
```bash
git clone https://github.com/calculusfkyou/Defect-Detection
cd Defect-Detection
```

2. **安裝前後端套件**
```bash
cd client
npm install
cd ../server
npm install
```

3. **啟動開發環境 (於根目錄下)**
```bash
node dev-runner.mjs
```
---

## 📦 使用技術

### 前端：
- React / Next.js
- Tailwind CSS / Shadcn UI
- Axios / SWR
- React Router / Next Router

### 後端：
- Node.js + Express
- MySQL
- JWT 驗證、bcrypt 密碼加密
- RESTful API 架構

---

## 📌 功能模組（規劃中）

| 功能             | 說明                                 |
|------------------|--------------------------------------|
| 影像檢測 |	上傳或拍攝PCB影像進行瑕疵檢測 |
| 檢測歷史 |	查看過去的檢測記錄與報告 |
| 瑕疵分析 | 自動分析並標記瑕疵類型與嚴重程度 |
| 報告生成 | 產生詳細的檢測報告，支援多種匯出格式 |
| 數據統計 | 檢測數據視覺化與趨勢分析 |
| 模型訓練 | 企業可使用自有數據訓練專屬檢測模型 |
| 系統公告 | 查看系統更新、功能新增等重要通知 |
| 用戶管理 | 管理不同權限的系統使用者 |

---

## 🤝 貢獻方式

1. Fork 專案並建立新分支
2. 開發功能並提 PR
3. 依照開發規範命名分支：`feature/[功能名]`、`fix/[修正名]` 等

---

## 🧪 其他

- 環境變數請參考 `.env.example`
- 資料庫結構詳見 `docs/architecture.md` (尚在規劃中)

---
