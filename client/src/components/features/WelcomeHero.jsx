import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';

export default function WelcomeHero() {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-blue-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <motion.div
            className="lg:w-1/2 mb-10 lg:mb-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              PCB瑕疵檢測
              <span className="block text-blue-400">高效率、高精準度</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-xl mb-8">
              運用先進的AI技術，自動識別PCB板上各種瑕疵，提升產品品質，降低人工檢測成本。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/detection">
                <Button size="lg" variant="primary" className="flex items-center">
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  開始檢測
                </Button>
              </Link>
              <Link to="/about">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:bg-opacity-10">
                  了解更多
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            className="lg:w-1/2 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative w-full max-w-md">
              <svg className="w-full h-auto" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* 簡化的PCB板圖形 */}
                <rect width="360" height="240" x="20" y="30" rx="8" fill="#1e293b" stroke="#3B82F6" strokeWidth="2" />
                <circle cx="50" cy="60" r="10" fill="#3B82F6" />
                <circle cx="350" cy="60" r="10" fill="#3B82F6" />
                <circle cx="50" cy="240" r="10" fill="#3B82F6" />
                <circle cx="350" cy="240" r="10" fill="#3B82F6" />

                {/* PCB線路 */}
                <path d="M80 80 H320 V220 H80 Z" stroke="#4ADE80" strokeWidth="2" fill="none" />
                <path d="M120 120 H280 V180 H120 Z" stroke="#4ADE80" strokeWidth="2" fill="none" />
                <rect x="150" y="140" width="100" height="20" fill="#4ADE80" />

                {/* 瑕疵標記 */}
                <circle cx="250" cy="120" r="15" stroke="#DC2626" strokeWidth="3" fill="none">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                </circle>
                <path d="M240 110 L260 130 M260 110 L240 130" stroke="#DC2626" strokeWidth="3">
                  <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
                </path>
              </svg>

              {/* 掃描效果 */}
              <motion.div
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                initial={{ y: 30 }}
                animate={{ y: 270 }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  repeatType: "reverse",
                }}
              >
                <div className="w-full h-1 bg-blue-400 opacity-80"></div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
