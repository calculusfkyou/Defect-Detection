import { FaReact, FaNodeJs, FaAws, FaDocker, FaGitAlt, FaGithub, FaPython } from 'react-icons/fa';
import { SiExpress, SiTailwindcss, SiMysql, SiTensorflow, SiPytorch, SiOpencv, SiKubernetes, SiVite, SiEslint, SiJavascript, SiJsonwebtokens } from 'react-icons/si';

// 所有技術圖標集中管理
export const iconMap = {
  // 程式語言
  react: <FaReact className="w-6 h-6 text-blue-500" />,
  // node: <FaNodeJs className="w-6 h-6 text-green-500" />,
  express: <SiExpress className="w-6 h-6 text-gray-600" />,
  mysql: <SiMysql className="w-6 h-6 text-blue-600" />,
  eslint: <SiEslint className="w-6 h-6 text-purple-700" />,
  tensorflow: <SiTensorflow className="w-6 h-6 text-orange-500" />,
  pytorch: <SiPytorch className="w-6 h-6 text-orange-600" />,
  opencv: <SiOpencv className="w-6 h-6 text-blue-700" />,
  aws: <FaAws className="w-6 h-6 text-orange-400" />,
  docker: <FaDocker className="w-6 h-6 text-blue-600" />,
  kubernetes: <SiKubernetes className="w-6 h-6 text-blue-600" />,
  vite: <SiVite className="w-6 h-6 text-purple-600" />,
  git: <FaGitAlt className="w-6 h-6 text-red-500" />,
  github: <FaGithub className="w-6 h-6 text-gray-800" />,
  jwt: <SiJsonwebtokens className="w-6 h-6 text-pink-500" />,
  javascript: <SiJavascript className="w-6 h-6 text-yellow-400" />,
  python: <FaPython className="w-6 h-6 text-blue-500" />,

  // 使用圖片替換的圖標
  swr: <img src="/assets/about/tech-icons/swr.png" alt="SWR" className="w-6 h-6" />,
  node: (
    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="currentColor" />
    </svg>
  ),
  framer: <img src="/assets/about/tech-icons/framer-motion.png" alt="Framer Motion" className="w-6 h-6" />,
  tailwind: (
    <svg className="w-6 h-6" viewBox="0 0 54 33" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" clipRule="evenodd" d="M27 0C19.8 0 15.3 3.6 13.5 10.8C16.2 7.2 19.35 5.85 23.1 6.75C25.2 7.2 26.7 8.73 28.35 10.44C31.05 13.26 34.2 16.5 41.4 16.5C48.6 16.5 53.1 12.9 54.9 5.7C52.2 9.3 49.05 10.65 45.3 9.75C43.2 9.3 41.7 7.77 40.05 6.06C37.35 3.24 34.2 0 27 0ZM13.5 16.5C6.3 16.5 1.8 20.1 0 27.3C2.7 23.7 5.85 22.35 9.6 23.25C11.7 23.7 13.2 25.23 14.85 26.94C17.55 29.76 20.7 33 27.9 33C35.1 33 39.6 29.4 41.4 22.2C38.7 25.8 35.55 27.15 31.8 26.25C29.7 25.8 28.2 24.27 26.55 22.56C23.85 19.74 20.7 16.5 13.5 16.5Z" fill="#38BDF8" />
    </svg>
  ),
  cicd: <img src="/assets/about/tech-icons/cicd.png" alt="CI/CD" className="w-6 h-6" />,
  yolo: <img src="/assets/about/tech-icons/yolo.jpg" alt="YOLO" className="w-6 h-6" />,

  // VS Code 圖標
  vscode: (
    <svg className="w-6 h-6 text-blue-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z" fill="currentColor" />
    </svg>
  )
};

// 優化: 支援不同尺寸的圖標生成
export function getTechIcon(name, size = "w-6 h-6") {
  const icon = iconMap[name.toLowerCase()];

  if (!icon) {
    return (
      <div className={`${size} rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  // 克隆元素並更新尺寸類 (如果是 React 元素)
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, {
      className: icon.props.className
        .replace(/w-\d+/, size.split(' ')[0])
        .replace(/h-\d+/, size.split(' ')[1])
    });
  }

  return icon;
}
