import { motion } from 'framer-motion';

import { iconMap } from '../constants/techIcons';

function TechIcon({ name }) {
  return (
    <div className="flex items-center justify-center">
      {iconMap[name.toLowerCase()] ||
        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
          {name.charAt(0).toUpperCase()}
        </div>
      }
    </div>
  );
}

export default function TechStack({ sections = [] }) {
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
            我們的技術棧
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            我們運用最新的技術，從前端到後端，從雲端到AI，打造高效、可靠的PCB瑕疵檢測系統。
          </motion.p>
        </div>

        {sections.map((section, index) => (
          <div key={index} className="mb-12 last:mb-0">
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold text-gray-800 mb-6 border-l-4 border-blue-500 pl-4"
            >
              {section.title}
            </motion.h3>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5"
            >
              {section.items.map((item, itemIndex) => (
                <motion.div
                  key={itemIndex}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 100 }
                    }
                  }}
                  className="bg-white rounded-lg p-5 shadow hover:shadow-md transition-shadow flex items-center"
                >
                  <div className="bg-gray-100 p-3 rounded-lg mr-4">
                    <TechIcon name={item.name} />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{item.name}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
