class AboutModel {
  // 獲取團隊成員資料
  static async getTeamMembers() {
    // 靜態模擬數據，實際應用中應從數據庫獲取
    return {
      teamMembers: [
        {
          id: 1,
          name: '吳傢澂',
          title: '專案負責人 / 前端開發',
          image: '/assets/about/member1.png',
          bio: '專注於前端架構與使用者體驗設計，擁有5年React開發經驗。主導多個大型企業專案，致力於創造流暢且直覺的使用者介面。',
          skills: ['React', 'Next.js', 'UI/UX', 'Tailwind CSS'],
          contactEmail: 'charlie930320@gmail.com',
          socialLinks: {
            linkedin: 'https://www.linkedin.com/in/jia-cheng-wu-5b70762a3/',
            github: 'https://github.com/calculusfkyou'
          }
        },
        {
          id: 2,
          name: '李小華',
          title: '機器學習工程師',
          image: '/assets/team/member2.jpg',
          bio: '專精於計算機視覺與深度學習領域，研發多種瑕疵檢測演算法。曾參與多項研究專案，專注於提升模型準確度與效能。',
          skills: ['Computer Vision', 'PyTorch', 'TensorFlow', 'OpenCV'],
          contactEmail: 'li@example.com',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/lixiaohua',
            github: 'https://github.com/lixh'
          }
        },
        {
          id: 3,
          name: '張小美',
          title: '後端開發工程師',
          image: '/assets/team/member3.jpg',
          bio: '負責系統後端架構與資料庫設計，擅長建構高效能且可擴展的API。專長於Node.js生態系統與雲端服務整合。',
          skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
          contactEmail: 'zhang@example.com',
          socialLinks: {
            linkedin: 'https://linkedin.com/in/zhangxiaomei',
            github: 'https://github.com/zhangxm'
          }
        }
      ]
    };
  }

  // 獲取使命願景資訊
  static async getMissionVision() {
    return {
      mission: {
        title: "我們的使命",
        content: "透過先進的AI技術，提供精確、高效的PCB瑕疵檢測解決方案，協助電子製造業提高產品質量，降低生產成本，加速產品上市時間。",
        image: "/assets/about/mission.jpg"
      },
      vision: {
        title: "我們的願景",
        content: "成為全球領先的PCB瑕疵檢測解決方案提供者，推動電子製造業進入智慧製造新時代，讓品質控制流程更精準、高效且可靠。",
        image: "/assets/about/vision.jpg"
      },
      values: [
        {
          id: 1,
          title: "創新",
          description: "持續研發尖端技術，不斷突破瑕疵檢測的精確度與效能極限。",
          icon: "lightbulb"
        },
        {
          id: 2,
          title: "品質",
          description: "對卓越品質的堅持，確保客戶獲得最精準可靠的檢測結果。",
          icon: "shield-check"
        },
        {
          id: 3,
          title: "合作",
          description: "與客戶、合作夥伴建立長期互惠關係，共同成長進步。",
          icon: "users"
        },
        {
          id: 4,
          title: "可持續發展",
          description: "致力開發對環境友善的解決方案，支持製造業可持續發展。",
          icon: "leaf"
        }
      ]
    };
  }

  // 獲取技術堆疊資訊
  static async getTechStack() {
    return {
      sections: [
        {
          title: "程式語言",
          items: [
            { name: "JavaScript", description: "前端與後端開發", icon: "javascript" },
            { name: "Python", description: "AI模型與機器學習", icon: "python" },
          ]
        },
        {
          title: "前端技術",
          items: [
            { name: "React", description: "用戶界面構建", icon: "react" },
            { name: "Vite", description: "快速開發與構建工具", icon: "vite" },
            { name: "Tailwind CSS", description: "響應式設計", icon: "tailwind" },
            { name: "Framer Motion", description: "動畫效果", icon: "framer" },
            { name: "SWR", description: "數據請求與緩存", icon: "swr" },
          ]
        },
        {
          title: "後端技術",
          items: [
            { name: "Node.js", description: "伺服器環境", icon: "node" },
            { name: "Express", description: "API開發框架", icon: "express" },
            { name: "MySQL", description: "資料庫", icon: "mysql" },
            { name: "JWT", description: "安全認證", icon: "jwt" }
          ]
        },
        {
          title: "AI與機器學習",
          items: [
            { name: "OpenCV", description: "計算機視覺庫", icon: "opencv" },
            { name: "YOLO", description: "物件檢測演算法", icon: "yolo" },
            // { name: "TensorFlow", description: "深度學習框架", icon: "tensorflow" },
            // { name: "PyTorch", description: "模型訓練與推理", icon: "pytorch" }
          ]
        },
        {
          title: "開發工具與流程",
          items: [
            { name: "Git", description: "版本控制系統", icon: "git" },
            { name: "GitHub", description: "程式碼託管平台", icon: "github" },
            { name: "VSCode", description: "程式碼編輯器", icon: "vscode" },
            { name: "ESLint", description: "程式碼品質檢查", icon: "eslint" }
          ]
        },
        {
          title: "雲服務與部署",
          items: [
            { name: "AWS", description: "雲端基礎設施", icon: "aws" },
            { name: "Docker", description: "容器化部署", icon: "docker" },
            { name: "CI/CD", description: "持續集成與部署", icon: "cicd" },
            { name: "Kubernetes", description: "容器編排", icon: "kubernetes" }
          ]
        }
      ]
    };
  }

  // 獲取專案時間線
  static async getProjectTimeline() {
    return {
      milestones: [
        {
          id: 1,
          date: "2023年1月",
          title: "項目啟動",
          description: "PCB瑕疵檢測系統概念形成，團隊組建與初步規劃",
          icon: "flag"
        },
        {
          id: 2,
          date: "2023年4月",
          title: "演算法研發",
          description: "基於深度學習的PCB瑕疵檢測模型開發與初步訓練",
          icon: "code"
        },
        {
          id: 3,
          date: "2023年8月",
          title: "原型發布",
          description: "系統第一個可用原型完成，支持基本的瑕疵檢測功能",
          icon: "rocket"
        },
        {
          id: 4,
          date: "2023年11月",
          title: "模型優化",
          description: "使用更大的數據集重新訓練模型，顯著提高檢測準確率",
          icon: "chart-line"
        },
        {
          id: 5,
          date: "2024年2月",
          title: "平台整合",
          description: "完成網頁平台開發，整合檢測、報告和數據分析功能",
          icon: "puzzle-piece"
        },
        {
          id: 6,
          date: "2024年5月",
          title: "Beta測試",
          description: "與選定合作夥伴開始beta測試，收集實際使用數據和反饋",
          icon: "flask"
        },
        {
          id: 7,
          date: "2024年9月",
          title: "正式發布",
          description: "系統v1.0正式發布，支持多種PCB類型的高精度瑕疵檢測",
          icon: "star"
        }
      ]
    };
  }

  // 獲取聯絡資訊
  static async getContactInfo() {
    return {
      company: {
        name: "PCB瑕疵檢測科技有限公司",
        address: "台灣台北市信義區信義路五段7號",
        email: "contact@pcb-defect-detection.com",
        phone: "+886-2-1234-5678",
        website: "www.pcb-defect-detection.com"
      },
      socialMedia: [
        { name: "LinkedIn", url: "https://linkedin.com/company/pcb-defect-detection", icon: "linkedin" },
        { name: "GitHub", url: "https://github.com/pcb-defect-detection", icon: "github" },
        { name: "Facebook", url: "https://facebook.com/pcbdefectdetection", icon: "facebook" },
        { name: "Twitter", url: "https://twitter.com/pcbdefecttech", icon: "twitter" }
      ],
      officeHours: "週一至週五 09:00-18:00",
      supportEmail: "support@pcb-defect-detection.com"
    };
  }

  // 獲取所有關於頁面數據 (一次性取得所有數據)
  static async getAllAboutData() {
    const teamMembers = await this.getTeamMembers();
    const missionVision = await this.getMissionVision();
    const techStack = await this.getTechStack();
    const projectTimeline = await this.getProjectTimeline();
    const contactInfo = await this.getContactInfo();

    return {
      teamMembers,
      missionVision,
      techStack,
      projectTimeline,
      contactInfo
    };
  }
}

export default AboutModel;
