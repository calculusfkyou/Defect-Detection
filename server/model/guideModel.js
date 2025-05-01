class GuideModel {
  // 實際應用中，這些數據應該從數據庫獲取
  static async getGuides() {
    // 前端首頁不變，保留原有的簡短指南
    return {
      // 核心功能
      features: [
        {
          id: 1,
          title: "影像檢測",
          description: "上傳或拍攝PCB影像進行瑕疵檢測",
          icon: "detection",
          to: "/detection",
          requiresAuth: false
        },
        {
          id: 2,
          title: "檢測歷史",
          description: "查看過去的檢測記錄與報告",
          icon: "history",
          to: "/history",
          requiresAuth: true
        },
        {
          id: 3,
          title: "生成報告",
          description: "產生詳細的檢測報告",
          icon: "report",
          to: "/reports",
          requiresAuth: true
        }
      ],

      // 首頁簡短使用步驟
      guides: [
        {
          id: 1,
          title: '開始檢測',
          steps: [
            '點擊「影像檢測」按鈕進入檢測頁面',
            '上傳PCB板照片或使用攝影機拍攝',
            '系統自動分析並標記瑕疵'
          ],
          icon: 'camera'
        },
        {
          id: 2,
          title: '解讀檢測結果',
          steps: [
            '紅色標記表示瑕疵位置',
            '點擊瑕疵區域可查看詳細描述',
            '使用縮放功能檢視細節'
          ],
          icon: 'search'
        },
        {
          id: 3,
          title: '生成檢測報告',
          steps: [
            '檢測完成後點擊「生成報告」',
            '選擇報告格式（PDF或Excel）',
            '報告將包含所有瑕疵詳情與統計數據'
          ],
          icon: 'chart'
        }
      ]
    };
  }

  // 獲取所有使用手冊分類
  static async getHelpCategories() {
    // 修改：擴充模擬數據，確保每個父標題都有子標題
    return {
      categories: [
        {
          id: 'about-system',
          title: '系統概述',
          description: 'PCB瑕疵檢測系統的介紹與概述',
          icon: '🔍',
          // 此分類沒有子文章，而是單獨的內容頁面
          standalone: true
        },
        {
          id: 'getting-started',
          title: '入門指南',
          description: '幫助您快速開始使用PCB瑕疵檢測系統',
          icon: '📚',
          articles: [
            { id: 'welcome', title: '歡迎使用', excerpt: '歡迎使用PCB瑕疵檢測系統，本文將幫助您了解系統整體功能' },
            { id: 'system-requirements', title: '系統需求', excerpt: '了解使用PCB瑕疵檢測系統所需的硬體和軟體配置' },
            { id: 'account-setup', title: '帳號設置', excerpt: '學習如何設置和管理您的使用者帳號' },
            { id: 'quick-tour', title: '系統導覽', excerpt: '快速瀏覽系統各主要功能區域與操作界面' }
          ]
        },
        {
          id: 'detection',
          title: '檢測功能',
          description: '學習如何使用系統檢測PCB瑕疵',
          icon: '🔍',
          articles: [
            { id: 'upload-images', title: '上傳影像', excerpt: '如何上傳PCB影像進行檢測' },
            { id: 'camera-capture', title: '相機拍攝', excerpt: '使用攝影機即時檢測PCB板' },
            { id: 'batch-processing', title: '批次處理', excerpt: '同時處理多張PCB影像以提高效率' },
            { id: 'detection-settings', title: '檢測設置', excerpt: '調整檢測參數以獲得最佳結果' }
          ]
        },
        {
          id: 'analysis',
          title: '結果分析',
          description: '了解如何解讀和分析檢測結果',
          icon: '📊',
          articles: [
            { id: 'defect-types', title: '瑕疵類型', excerpt: '了解系統可識別的各種PCB瑕疵類型和特徵' },
            { id: 'result-interpretation', title: '結果解讀', excerpt: '如何解讀檢測結果和系統標記' },
            { id: 'accuracy-settings', title: '準確度設置', excerpt: '調整檢測靈敏度和準確度參數' },
            { id: 'result-filtering', title: '結果篩選', excerpt: '使用篩選功能找出特定類型的瑕疵' }
          ]
        },
        {
          id: 'reports',
          title: '報告功能',
          description: '生成和管理檢測報告',
          icon: '📝',
          articles: [
            { id: 'generate-reports', title: '生成報告', excerpt: '如何生成各種格式的檢測報告' },
            { id: 'customize-reports', title: '自訂報告', excerpt: '根據需求自訂檢測報告的內容和格式' },
            { id: 'export-options', title: '匯出選項', excerpt: '將檢測結果匯出為不同格式' },
            { id: 'report-sharing', title: '報告分享', excerpt: '與團隊成員分享檢測報告的方式' }
          ]
        },
        {
          id: 'advanced',
          title: '進階功能',
          description: '探索系統的進階功能與設定',
          icon: '⚙️',
          articles: [
            { id: 'model-training', title: '模型訓練', excerpt: '如何使用自己的資料訓練專屬檢測模型' },
            { id: 'api-integration', title: 'API整合', excerpt: '與其他系統整合的API使用指南' },
            { id: 'automation', title: '自動化工作流', excerpt: '設置自動化檢測工作流程' },
            { id: 'advanced-settings', title: '進階設置', excerpt: '系統進階設置與優化選項' }
          ]
        },
        {
          id: 'troubleshooting',
          title: '故障排除',
          description: '解決使用過程中可能遇到的問題',
          icon: '🔧',
          articles: [
            { id: 'common-issues', title: '常見問題', excerpt: '解決最常見的使用問題' },
            { id: 'error-codes', title: '錯誤代碼', excerpt: '了解系統錯誤代碼及其解決方法' },
            { id: 'contact-support', title: '聯繫支援', excerpt: '如何獲取技術支援與協助' },
            { id: 'troubleshooting-guides', title: '疑難排解指南', excerpt: '常見問題的步驟式解決方案' }
          ]
        },
        {
          id: 'account-management',
          title: '帳戶管理',
          description: '管理您的帳戶設置與權限',
          icon: '👤',
          articles: [
            { id: 'profile-settings', title: '個人資料設置', excerpt: '管理您的個人資料與偏好設定' },
            { id: 'team-management', title: '團隊管理', excerpt: '邀請和管理團隊成員' },
            { id: 'subscription-plans', title: '訂閱方案', excerpt: '了解不同的訂閱方案及其功能' },
            { id: 'billing-info', title: '帳單資訊', excerpt: '管理帳單資訊與付款方式' }
          ]
        },
        {
          id: 'integrations',
          title: '系統整合',
          description: '與其他系統和服務整合',
          icon: '🔌',
          articles: [
            { id: 'supported-integrations', title: '支援的整合', excerpt: '了解系統支援的整合選項' },
            { id: 'erp-integration', title: 'ERP系統整合', excerpt: '與企業資源規劃系統整合' },
            { id: 'mes-integration', title: 'MES系統整合', excerpt: '與製造執行系統整合' },
            { id: 'custom-integration', title: '自訂整合', excerpt: '使用API建立自訂整合' }
          ]
        },
        {
          id: 'data-management',
          title: '資料管理',
          description: '管理和保護您的資料',
          icon: '💾',
          articles: [
            { id: 'data-storage', title: '資料儲存', excerpt: '了解系統如何儲存和管理您的資料' },
            { id: 'data-backup', title: '資料備份', excerpt: '備份和恢復您的檢測資料' },
            { id: 'data-security', title: '資料安全', excerpt: '資料加密和安全措施' },
            { id: 'data-retention', title: '資料保留策略', excerpt: '了解系統的資料保留和清理政策' }
          ]
        },
        {
          id: 'updates',
          title: '系統更新',
          description: '了解系統更新和功能變更',
          icon: '🔄',
          articles: [
            { id: 'release-notes', title: '版本說明', excerpt: '查看各版本的功能與改進' },
            { id: 'update-schedule', title: '更新計劃', excerpt: '了解系統更新的頻率和計劃' },
            { id: 'beta-features', title: '測試功能', excerpt: '嘗試最新的測試功能' },
            { id: 'feature-requests', title: '功能請求', excerpt: '如何提交和投票支持新功能' }
          ]
        },
        {
          id: 'mobile-usage',
          title: '行動裝置使用',
          description: '在行動裝置上使用系統',
          icon: '📱',
          articles: [
            { id: 'mobile-app', title: '行動應用程式', excerpt: '下載和安裝行動應用程式' },
            { id: 'mobile-features', title: '行動功能', excerpt: '了解行動版支援的功能' },
            { id: 'offline-mode', title: '離線模式', excerpt: '如何在沒有網絡連接的情況下使用' },
            { id: 'mobile-troubleshooting', title: '行動裝置疑難排解', excerpt: '解決行動裝置上的常見問題' }
          ]
        },
        {
          id: 'best-practices',
          title: '最佳實踐',
          description: '提升使用效率的建議',
          icon: '💡',
          articles: [
            { id: 'optimal-setup', title: '最佳設置', excerpt: '設置最佳的工作環境' },
            { id: 'workflow-tips', title: '工作流程建議', excerpt: '優化您的檢測工作流程' },
            { id: 'image-quality', title: '影像品質指南', excerpt: '獲取高品質PCB影像的技巧' },
            { id: 'productivity-tips', title: '生產力提升技巧', excerpt: '提高工作效率的進階技巧' }
          ]
        }
      ]
    };
  }

  // 獲取特定分類下的文章列表
  static async getCategoryArticles(categoryId) {
    const { categories } = await this.getHelpCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      return { articles: [] };
    }

    return { articles: category.articles || [] };
  }

  // 獲取特定文章的詳細內容
  static async getArticle(articleId) {
    // 模擬資料庫查詢 - 根據ID獲取文章詳情
    // 以下僅為部分範例，實際應用中應對所有文章ID實現
    const articleDetails = {
      'about-system': {
        id: 'about-system',
        categoryId: 'about-system',
        title: 'PCB瑕疵檢測系統概述',
        excerpt: '了解PCB瑕疵檢測系統的核心功能與價值',
        lastUpdated: '2025-04-15',
        tags: ['系統介紹', '概述'],
        content: `
          <h2>PCB瑕疵檢測系統概述</h2>
          <p>PCB瑕疵檢測系統是一個先進的人工智慧驅動平台，專為電子製造業設計，能夠自動識別、分析和追蹤印刷電路板上的各種缺陷和異常。本系統結合了最新的電腦視覺技術和深度學習算法，為製造商提供高效且準確的品質控制解決方案。</p>

          <h3>系統核心價值</h3>
          <ul>
            <li><strong>提高檢測準確率：</strong>相較於人工檢測，自動化系統可達到更高的準確率，減少誤判和漏檢</li>
            <li><strong>提升生產效率：</strong>實時檢測可立即發現問題，減少生產線停機時間</li>
            <li><strong>降低成本：</strong>降低人力成本，減少因品質問題導致的返工和浪費</li>
            <li><strong>數據追蹤：</strong>提供完整的檢測歷史記錄，有助於製程優化和品質管理</li>
          </ul>

          <h3>主要功能模塊</h3>
          <ol>
            <li><strong>影像檢測：</strong>上傳或拍攝PCB影像進行自動瑕疵檢測</li>
            <li><strong>檢測歷史：</strong>查看和管理過去的檢測記錄</li>
            <li><strong>報告生成：</strong>產生詳細的檢測報告，支持多種格式匯出</li>
            <li><strong>數據分析：</strong>提供瑕疵趨勢和統計分析</li>
            <li><strong>系統管理：</strong>用戶管理、權限設定和系統配置</li>
          </ol>

          <h3>技術特點</h3>
          <ul>
            <li><strong>深度學習模型：</strong>使用先進的深度學習模型識別多種PCB瑕疵類型</li>
            <li><strong>高精度檢測：</strong>能夠識別微小的瑕疵，檢測精度可達微米級別</li>
            <li><strong>快速處理：</strong>高效的圖像處理算法確保快速獲得檢測結果</li>
            <li><strong>自動分類：</strong>瑕疵自動分類和嚴重度評估</li>
            <li><strong>可擴展性：</strong>支持模型再訓練，適應不同PCB類型和製造需求</li>
          </ul>
        `
      },
      // 入門指南類別的文章
      'welcome': {
        id: 'welcome',
        categoryId: 'getting-started',
        title: '歡迎使用PCB瑕疵檢測系統',
        excerpt: '歡迎使用PCB瑕疵檢測系統，本文將幫助您了解系統整體功能',
        lastUpdated: '2025-03-15',
        tags: ['入門', '概述'],
        content: '<h2>歡迎使用PCB瑕疵檢測系統</h2><p>這是一個簡短的歡迎說明，介紹系統的主要功能和使用方式。</p>'
      },
      'system-requirements': {
        id: 'system-requirements',
        categoryId: 'getting-started',
        title: '系統需求',
        excerpt: '了解使用PCB瑕疵檢測系統所需的硬體和軟體配置',
        lastUpdated: '2025-03-10',
        tags: ['入門', '技術規格'],
        content: '<h2>系統需求</h2><p>這裡描述運行PCB瑕疵檢測系統所需的最低硬體和軟體配置。</p>'
      },
      'account-setup': {
        id: 'account-setup',
        categoryId: 'getting-started',
        title: '帳號設置',
        excerpt: '學習如何設置和管理您的使用者帳號',
        lastUpdated: '2025-03-05',
        tags: ['入門', '帳號'],
        content: '<h2>帳號設置</h2><p>此文章說明如何註冊帳號、設定個人資料和管理帳號安全。</p>'
      },
      'quick-tour': {
        id: 'quick-tour',
        categoryId: 'getting-started',
        title: '系統導覽',
        excerpt: '快速瀏覽系統各主要功能區域與操作界面',
        lastUpdated: '2025-03-01',
        tags: ['入門', '導覽'],
        content: '<h2>系統導覽</h2><p>本文提供系統界面的基本導覽，幫助您快速熟悉各功能區塊。</p>'
      },

      // 檢測功能類別的文章
      'upload-images': {
        id: 'upload-images',
        categoryId: 'detection',
        title: '上傳影像',
        excerpt: '如何上傳PCB影像進行檢測',
        lastUpdated: '2025-03-15',
        tags: ['檢測', '上傳'],
        content: '<h2>上傳影像</h2><p>此文章說明如何上傳PCB影像檔案到系統進行檢測分析。</p>'
      },
      'camera-capture': {
        id: 'camera-capture',
        categoryId: 'detection',
        title: '相機拍攝',
        excerpt: '使用攝影機即時檢測PCB板',
        lastUpdated: '2025-03-10',
        tags: ['檢測', '攝影機'],
        content: '<h2>相機拍攝</h2><p>本文說明如何連接攝影機並進行即時PCB檢測。</p>'
      },
      'batch-processing': {
        id: 'batch-processing',
        categoryId: 'detection',
        title: '批次處理',
        excerpt: '同時處理多張PCB影像以提高效率',
        lastUpdated: '2025-03-05',
        tags: ['檢測', '批次'],
        content: '<h2>批次處理</h2><p>此文章介紹如何同時上傳和處理多張PCB影像，提高工作效率。</p>'
      },
      'detection-settings': {
        id: 'detection-settings',
        categoryId: 'detection',
        title: '檢測設置',
        excerpt: '調整檢測參數以獲得最佳結果',
        lastUpdated: '2025-03-01',
        tags: ['檢測', '設置'],
        content: '<h2>檢測設置</h2><p>本文說明如何調整各種檢測參數以獲得最準確的檢測結果。</p>'
      },

      // 結果分析類別的文章
      'defect-types': {
        id: 'defect-types',
        categoryId: 'analysis',
        title: '瑕疵類型',
        excerpt: '了解系統可識別的各種PCB瑕疵類型和特徵',
        lastUpdated: '2025-03-15',
        tags: ['分析', '瑕疵分類'],
        content: '<h2>瑕疵類型</h2><p>此文章介紹系統能夠識別的各種PCB瑕疵類型及其特徵。</p>'
      },

      // 預設模擬資料 (用於其他所有文章)
      'default': {
        title: '文章標題',
        excerpt: '這是文章的簡短描述',
        lastUpdated: '2025-03-15',
        tags: ['標籤1', '標籤2'],
        content: '<h2>文章標題</h2><p>這是文章的內容，提供有關該主題的詳細說明。</p>'
      }
    };

    // 如果找不到特定文章，使用預設模擬資料
    if (!articleDetails[articleId]) {
      // 查找文章所屬的分類
      const { categories } = await this.getHelpCategories();
      let foundCategory = null;
      let foundArticle = null;

      // 尋找文章所屬的分類和文章本身
      for (const category of categories) {
        // 檢查分類是否有 articles 屬性
        if (category.articles) {
          const article = category.articles.find(a => a.id === articleId);
          if (article) {
            foundCategory = category;
            foundArticle = article;
            break;
          }
        }
      }

      if (foundArticle && foundCategory) {
        // 使用找到的文章信息和預設模板生成文章內容
        return {
          article: {
            id: articleId,
            categoryId: foundCategory.id,
            title: foundArticle.title,
            excerpt: foundArticle.excerpt,
            lastUpdated: '2025-03-15',
            tags: [foundCategory.title.split(' ')[0]],
            content: `<h2>${foundArticle.title}</h2><p>${foundArticle.excerpt} 此處將提供更詳細的說明和操作指導。</p>`
          },
          relatedArticles: this.getRelatedArticles(foundCategory, articleId)
        };
      }

      return { article: null, relatedArticles: [] };
    }

    // 模擬獲取相關文章
    const { categories } = await this.getHelpCategories();
    const article = articleDetails[articleId];

    if (!article) {
      return { article: null, relatedArticles: [] };
    }

    const category = categories.find(c => c.id === article.categoryId);

    if (!category || category.standalone || !category.articles) {
      return { article, relatedArticles: [] };
    }

    const relatedArticles = category.articles
      .filter(a => a.id !== articleId)
      .slice(0, 3);

    return {
      article: articleDetails[articleId],
      relatedArticles
    };
  }

  // 輔助方法：獲取相關文章
  static getRelatedArticles(category, currentArticleId) {
    // 檢查分類是否存在、是否為獨立目錄、是否有articles屬性
    if (!category || category.standalone || !category.articles) {
      return [];
    }

    return category.articles
      .filter(article => article.id !== currentArticleId)
      .slice(0, 3);
  }

  // 搜尋幫助內容
  static async searchHelpContent(query) {
    if (!query) {
      return { results: [] };
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    // 從所有文章中搜尋相符內容
    const { categories } = await this.getHelpCategories();

    for (const category of categories) {
      // 獨立目錄特殊處理 - 直接從articleDetails中尋找
      if (category.standalone) {
        // 取得獨立頁面的內容
        const { article } = await this.getArticle(category.id);
        if (article && (
          article.title.toLowerCase().includes(lowerQuery) ||
          article.excerpt.toLowerCase().includes(lowerQuery)
        )) {
          results.push({
            ...article,
            category: category.title,
            categoryId: category.id
          });
        }
        continue;  // 處理完獨立目錄後跳過下面的代碼
      }

      // 一般目錄處理
      if (category.articles) {
        for (const article of category.articles) {
          // 檢查標題和摘要是否包含搜尋詞
          if (
            article.title.toLowerCase().includes(lowerQuery) ||
            article.excerpt.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              ...article,
              category: category.title,
              categoryId: category.id
            });
          }
        }
      }
    }

    return { results };
  }
}

export default GuideModel;
