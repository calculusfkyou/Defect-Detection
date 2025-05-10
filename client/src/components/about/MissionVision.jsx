import { motion } from 'framer-motion';
import { ICON_MAP } from '../constants/aboutConstants';

export default function MissionVision({ mission, vision, values = [] }) {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* 使命願景 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16"
        >
          {/* 使命 */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-blue-50 rounded-xl p-8 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full -translate-y-1/2 translate-x-1/2 z-0" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{mission?.title || "使命"}</h3>
              <p className="text-gray-700">{mission?.content || "載入中..."}</p>
            </div>
          </motion.div>

          {/* 願景 */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-green-50 rounded-xl p-8 shadow-lg relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-green-100 rounded-full -translate-y-1/2 translate-x-1/2 z-0" />

            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{vision?.title || "願景"}</h3>
              <p className="text-gray-700">{vision?.content || "載入中..."}</p>
            </div>
          </motion.div>
        </motion.div>

        {/* 企業價值觀 */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            我們的核心價值
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            這些價值觀指導我們的決策與行動，確保我們始終為客戶提供最佳的解決方案。
          </motion.p>
        </div>

        {/* 價值觀卡片 */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {values.map((value) => (
            <motion.div
              key={value.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: {
                  y: 0,
                  opacity: 1,
                  transition: { type: "spring", stiffness: 100 }
                }
              }}
              className="bg-white rounded-lg p-6 border border-gray-100 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="bg-blue-100 p-3 rounded-full w-14 h-14 flex items-center justify-center text-blue-600 mb-5">
                {ICON_MAP[value.icon] || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                )}
              </div>
              <h4 className="text-xl font-semibold text-gray-800 mb-2">{value.title}</h4>
              <p className="text-gray-600">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
