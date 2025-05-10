import { motion } from 'framer-motion';
import { ICON_MAP } from '../constants/aboutConstants';

export default function ProjectTimeline({ milestones = [] }) {
  if (!milestones || milestones.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            專案發展歷程
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            從概念構思到正式發布，我們的PCB瑕疵檢測系統經歷了這些關鍵里程碑。
          </motion.p>
        </div>

        {/* 時間線 */}
        <div className="relative max-w-4xl mx-auto">
          {/* 中心線 */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 hidden md:block"></div>

          {/* 移動版單列垂直線 */}
          <div className="absolute left-6 top-0 h-full w-1 bg-blue-200 md:hidden"></div>

          {milestones.map((milestone, index) => (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative mb-12 last:mb-0"
            >
              {/* 桌面版左右交錯 */}
              <div className="hidden md:flex items-center">
                {/* 左側內容 (偶數項目) */}
                <div className={`w-1/2 pr-12 text-right ${index % 2 !== 0 ? 'opacity-0' : ''}`}>
                  {index % 2 === 0 && (
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100 inline-block">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-2">
                        {milestone.date}
                      </span>
                      <h4 className="text-xl font-semibold text-gray-800">{milestone.title}</h4>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  )}
                </div>

                {/* 中心時間點 */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center z-10">
                  <div className="text-blue-500">
                    {ICON_MAP[milestone.icon] || (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* 右側內容 (奇數項目) */}
                <div className={`w-1/2 pl-12 ${index % 2 === 0 ? 'opacity-0' : ''}`}>
                  {index % 2 !== 0 && (
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-100">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-2">
                        {milestone.date}
                      </span>
                      <h4 className="text-xl font-semibold text-gray-800">{milestone.title}</h4>
                      <p className="text-gray-600 mt-2">{milestone.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 移動版單列垂直 */}
              <div className="md:hidden flex">
                {/* 時間點 */}
                <div className="absolute left-6 transform -translate-x-1/2 w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  {ICON_MAP[milestone.icon] || (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>

                {/* 內容 */}
                <div className="ml-16 bg-white p-5 rounded-lg shadow-md border border-gray-100">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-2">
                    {milestone.date}
                  </span>
                  <h4 className="text-xl font-semibold text-gray-800">{milestone.title}</h4>
                  <p className="text-gray-600 mt-2">{milestone.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
