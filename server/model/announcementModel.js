class AnnouncementModel {
  // 實際應用中，這些數據應該從數據庫獲取
  static async getAnnouncements(page = 1, limit = 10) {
    const allAnnouncements = [
      {
        id: 1,
        title: '系統更新: 新增PCB特殊類型檢測',
        summary: '最新版本加入了對多層PCB板的檢測支援，提高特殊元件識別準確率。',
        content: `<p>我們很高興地宣布，PCB檢測系統現已支援多層PCB板的檢測功能。此次更新包含以下重要改進：</p>
        <ul>
          <li>多層板檢測：新增演算法可辨識不同層間的連接問題</li>
          <li>特殊元件識別：提高對BGA、QFN等特殊封裝元件的識別率</li>
          <li>邊緣檢測優化：改善對板邊及角落缺陷的檢測精確度</li>
        </ul>
        <p>建議所有用戶更新至最新版本以獲得這些功能。如有任何問題，請聯繫技術支援團隊。</p>
        <p>感謝您持續使用我們的PCB檢測系統！</p>`,
        date: '2025-04-25',
        author: '系統管理員',
        important: true,
        iconType: 'warning',
        tags: ['系統更新', '功能新增', '檢測優化']
      },
      {
        id: 2,
        title: '維護通知: 系統升級',
        summary: '系統將於2025/05/10進行維護升級，期間服務可能短暫中斷。',
        content: `<p>為了提供更好的服務，我們將於<strong>2025年5月10日 23:00-24:00</strong>進行系統維護升級。</p>
        <p>維護期間，以下功能可能無法使用：</p>
        <ul>
          <li>影像上傳及檢測</li>
          <li>報告生成</li>
          <li>歷史記錄查詢</li>
        </ul>
        <p>請於維護前完成重要工作，並妥善保存資料。維護完成後，系統將有更快的響應速度和更穩定的檢測效能。</p>
        <p>如有疑問，請聯繫客戶服務部門。</p>`,
        date: '2025-04-20',
        author: '系統管理員',
        important: false,
        iconType: 'calendar',
        tags: ['系統維護', '服務中斷']
      },
      {
        id: 3,
        title: '新功能: AI訓練模式',
        summary: '用戶現可自行上傳標記資料，訓練專屬的檢測模型。',
        content: `<p>我們很興奮地宣布推出全新的AI訓練模式！</p>
        <p>此功能允許企業用戶使用自己的檢測數據訓練專屬模型，更準確地識別特定PCB類型的瑕疵。主要功能包含：</p>
        <ul>
          <li>資料標記工具：高效標記PCB板瑕疵位置</li>
          <li>模型訓練儀表板：監控訓練進度與效能指標</li>
          <li>專屬模型部署：一鍵將訓練完成的模型應用於生產環境</li>
        </ul>
        <p>此功能目前處於測試階段，僅向企業會員開放。如果您有興趣參與測試，請填寫<a href="#">申請表單</a>。</p>
        <p>我們將持續改進此功能，期待您的寶貴意見！</p>`,
        date: '2025-04-15',
        author: '研發部門',
        important: false,
        iconType: 'lightbulb',
        tags: ['新功能', 'AI', '模型訓練']
      },
      {
        id: 4,
        title: '研討會邀請',
        summary: '誠摯邀請您參加5月15日的PCB品質控制研討會。',
        content: `<p>我們誠摯邀請您參加即將於2025年5月15日舉行的「PCB品質控制與自動檢測技術」研討會。</p>
        <h4>研討會信息：</h4>
        <ul>
          <li>日期：2025年5月15日（星期四）</li>
          <li>時間：10:00 - 16:00</li>
          <li>地點：台北國際會議中心</li>
        </ul>
        <h4>研討會內容：</h4>
        <ul>
          <li>PCB製造趨勢與品質控制挑戰</li>
          <li>AI在檢測領域的應用案例分析</li>
          <li>我司新一代檢測系統展示與實機操作</li>
          <li>產業專家圓桌討論</li>
        </ul>
        <p>參加研討會可免費獲得一個月系統高級功能試用。名額有限，請<a href="#">點此報名</a>。</p>`,
        date: '2025-04-10',
        author: '市場部',
        important: false,
        iconType: 'users',
        tags: ['研討會', '活動', '產業交流']
      },
      {
        id: 5,
        title: '安全更新: 加強系統保護措施',
        summary: '本次更新強化了系統安全性，建議所有用戶立即更新。',
        content: `<p>為確保您的資料安全，我們發布了重要的安全更新。此更新包含：</p>
        <ul>
          <li>增強用戶身份驗證流程</li>
          <li>改進資料加密方式，確保檢測數據安全</li>
          <li>修復多個可能影響系統穩定性的漏洞</li>
        </ul>
        <p><strong>重要提醒：</strong> 請所有用戶在登入後，前往「設定」頁面更新密碼。</p>
        <p>我們一直致力於提供安全可靠的服務環境。如發現任何安全問題，請立即聯繫技術支援團隊。</p>`,
        date: '2025-04-05',
        author: '安全團隊',
        important: true,
        iconType: 'shield',
        tags: ['安全更新', '系統更新', '重要通知']
      },
      // 繼續添加更多測試數據，至少 12 條以測試分頁功能
      {
        id: 6,
        title: '客戶案例: 鴻海精密如何提高PCB檢測效率',
        summary: '鴻海精密透過我們的系統將檢測效率提升40%。',
        content: `<p>我們很榮幸分享鴻海精密導入本系統後的成功案例。</p>
        <p>在導入我司PCB檢測系統前，鴻海精密面臨以下挑戰：</p>
        <ul>
          <li>人工檢測成本高，效率低</li>
          <li>高階PCB板瑕疵檢出率不穩定</li>
          <li>檢測數據難以集中管理和分析</li>
        </ul>
        <p>導入系統後6個月，鴻海精密實現了：</p>
        <ul>
          <li>檢測效率提升40%</li>
          <li>瑕疵檢出率提高至99.2%</li>
          <li>減少人力成本約25%</li>
        </ul>
        <p>查看完整<a href="#">案例研究報告</a>，了解更多企業如何透過我們的解決方案優化檢測流程。</p>`,
        date: '2025-04-01',
        author: '業務團隊',
        important: false,
        iconType: 'chart',
        tags: ['客戶案例', '企業應用', '效益分析']
      },
      {
        id: 7,
        title: '合作夥伴計畫啟動',
        summary: '邀請軟體開發商加入我們的合作夥伴生態系統。',
        content: `<p>我們很高興宣布PCB檢測系統合作夥伴計畫正式啟動！</p>
        <p>我們開放API接口，邀請軟體開發商、系統整合商以及相關領域專家一起擴展PCB檢測系統的應用範圍。</p>
        <h4>合作類型：</h4>
        <ul>
          <li>技術整合：將您的解決方案與我們的平台整合</li>
          <li>解決方案提供：為特定行業開發專屬檢測模組</li>
          <li>顧問服務：提供專業諮詢與導入服務</li>
        </ul>
        <h4>合作好處：</h4>
        <ul>
          <li>優先獲取技術支援和培訓資源</li>
          <li>共同行銷與推廣機會</li>
          <li>分享平台增長紅利</li>
        </ul>
        <p>有興趣成為我們的合作夥伴嗎？請<a href="#">填寫申請表</a>或直接聯繫我們的合作夥伴經理。</p>`,
        date: '2025-03-28',
        author: '業務拓展部',
        important: false,
        iconType: 'handshake',
        tags: ['合作夥伴', '業務發展', 'API']
      },
      {
        id: 8,
        title: '新產業解決方案: 醫療設備PCB檢測',
        summary: '專為醫療電子設備PCB開發的高精度檢測模組現已上線。',
        content: `<p>為滿足醫療電子設備製造商的嚴格品質要求，我們推出了專門的醫療設備PCB檢測解決方案。</p>
        <p>醫療設備PCB具有以下特點，需要特殊的檢測技術：</p>
        <ul>
          <li>高密度微小元件排列</li>
          <li>特殊塗層與特殊材料</li>
          <li>零容忍的品質標準</li>
        </ul>
        <p>我們的醫療設備PCB檢測模組具備：</p>
        <ul>
          <li>符合ISO 13485醫療器材品質管理標準</li>
          <li>超高解析度成像技術，可檢測微小至0.01mm的缺陷</li>
          <li>完整檢測報告，支援醫療器材法規認證需求</li>
        </ul>
        <p>現已有多家醫療設備製造商成功導入此解決方案。若您有需求，請聯繫我們的產業專家顧問。</p>`,
        date: '2025-03-25',
        author: '產品部門',
        important: false,
        iconType: 'medical',
        tags: ['產業解決方案', '醫療設備', '高精度檢測']
      },
      {
        id: 9,
        title: '年度用戶滿意度調查',
        summary: '請參與我們的年度調查，協助我們持續改進服務品質。',
        content: `<p>親愛的用戶，</p>
        <p>您的意見對我們至關重要！我們誠摯邀請您花幾分鐘時間，參與本年度的用戶滿意度調查。</p>
        <p>透過此調查，我們希望了解：</p>
        <ul>
          <li>您最常使用的功能與特性</li>
          <li>系統哪些方面表現良好</li>
          <li>哪些領域需要改進</li>
          <li>您希望在未來版本中看到的新功能</li>
        </ul>
        <p>完成調查的用戶將獲得：</p>
        <ul>
          <li>一個月高級功能免費使用</li>
          <li>專屬技術顧問一對一諮詢機會</li>
        </ul>
        <p><a href="#">點此開始調查</a>，預計只需5-10分鐘。</p>
        <p>感謝您的寶貴意見與持續支持！</p>`,
        date: '2025-03-20',
        author: '客戶成功團隊',
        important: false,
        iconType: 'survey',
        tags: ['用戶調查', '意見回饋', '服務改進']
      },
      {
        id: 10,
        title: '教育訓練課程: PCB檢測專家班',
        summary: '報名5月份專業訓練課程，成為PCB檢測專家。',
        content: `<p>我們很高興宣布即將舉辦的「PCB檢測專家班」培訓課程。</p>
        <h4>課程資訊：</h4>
        <ul>
          <li>日期：2025年5月20-22日（共三天）</li>
          <li>時間：每日9:00-17:00</li>
          <li>地點：台北教育訓練中心 / 線上同步</li>
          <li>人數：實體限20人，線上不限</li>
        </ul>
        <h4>課程內容：</h4>
        <ul>
          <li>第一天：PCB瑕疵類型解析與檢測基礎</li>
          <li>第二天：系統進階操作與客製化設定</li>
          <li>第三天：數據分析與品質改進策略</li>
        </ul>
        <h4>課程特色：</h4>
        <ul>
          <li>實機操作，專家指導</li>
          <li>實際案例分析與討論</li>
          <li>結業證書與能力認證</li>
        </ul>
        <p>課程費用：每人NT$15,000（三人以上團報享85折優惠）</p>
        <p>報名請<a href="#">點此填表</a>，或聯繫教育訓練部門。</p>`,
        date: '2025-03-15',
        author: '教育訓練部',
        important: false,
        iconType: 'education',
        tags: ['教育訓練', '專業課程', '能力認證']
      },
      {
        id: 11,
        title: '系統版本更新: 4.5.0版本發布',
        summary: '全新4.5.0版本帶來性能提升與界面優化。',
        content: `<p>我們很高興宣布PCB檢測系統4.5.0版本已正式發布！此版本包含多項重要更新：</p>
        <h4>效能提升：</h4>
        <ul>
          <li>檢測速度提高30%</li>
          <li>影像處理引擎優化，記憶體使用減少25%</li>
          <li>大型檔案處理能力增強</li>
        </ul>
        <h4>界面更新：</h4>
        <ul>
          <li>全新儀表板設計，資訊一目了然</li>
          <li>暗色模式支援，減輕眼睛疲勞</li>
          <li>自定義工具列，提高工作效率</li>
        </ul>
        <h4>新增功能：</h4>
        <ul>
          <li>批次處理功能升級，支援同時檢測多達50張影像</li>
          <li>瑕疵分類系統改進，識別準確率提升15%</li>
          <li>全新協作功能，團隊成員可即時查看檢測進度</li>
        </ul>
        <p>如何更新：進入系統後點擊「設定」>「系統更新」，或<a href="#">點此下載</a>最新版本。</p>
        <p>查看完整<a href="#">更新說明</a>了解詳細變更。</p>`,
        date: '2025-03-10',
        author: '產品團隊',
        important: false,
        iconType: 'update',
        tags: ['版本更新', '效能優化', '功能強化']
      },
      {
        id: 12,
        title: '重要通知: 資料庫結構變更',
        summary: '系統資料庫將於下月進行結構優化，可能影響自訂報表。',
        content: `<p><strong>重要通知：</strong>為提升系統效能與資料管理能力，我們將於2025年5月1日進行資料庫結構優化。</p>
        <h4>變更影響：</h4>
        <ul>
          <li>系統服務不會中斷</li>
          <li>歷史數據將自動遷移，無需用戶操作</li>
          <li><strong>重要：</strong>自定義報表及API整合可能需要調整</li>
        </ul>
        <h4>需要用戶注意：</h4>
        <ul>
          <li>若您使用自定義SQL查詢或報表，請在5月1日前更新相關程式</li>
          <li>使用我們API的整合應用需要更新至最新版本</li>
          <li>若您有特殊需求，請提前聯繫技術支援團隊</li>
        </ul>
        <h4>準備事項：</h4>
        <ul>
          <li>備份重要的自定義報表與查詢</li>
          <li>查看<a href="#">資料庫變更說明文件</a></li>
          <li>參加4月25日的<a href="#">線上說明會</a></li>
        </ul>
        <p>如有任何疑問，請聯繫技術支援或客戶服務團隊。我們將全力協助您順利過渡。</p>`,
        date: '2025-05-01',
        author: '技術架構部',
        important: true,
        iconType: 'database',
        tags: ['重要通知', '資料庫', '系統變更']
      }
    ];

    // 按日期從新到舊排序
    allAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 計算總頁數
    const totalItems = allAnnouncements.length;
    const totalPages = Math.ceil(totalItems / limit);

    // 處理分頁
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedAnnouncements = allAnnouncements.slice(start, end);

    return {
      announcements: paginatedAnnouncements,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  // 獲取單一公告
  static async getAnnouncementById(id) {
    const allAnnouncements = await this.getAnnouncements(1, 100);
    const announcement = allAnnouncements.announcements.find(a => a.id === parseInt(id));
    return announcement || null;
  }
}

export default AnnouncementModel;
