import { motion } from 'framer-motion';
import { DEFAULT_TEAM_IMAGE } from '../constants/aboutConstants';

// 容器動畫變數
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// 子項目動畫變數
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function TeamSection({ teamMembers = [] }) {
  if (!teamMembers || teamMembers.length === 0) {
    return <div className="text-center py-12">載入團隊成員資料中...</div>;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-800 mb-4"
          >
            我們的團隊
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis mx-auto"
          >
            由經驗豐富的專業人員組成，致力於開發尖端的PCB瑕疵檢測解決方案，結合人工智慧與工程專業，讓品質控制更簡單、更精確。
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-wrap justify-center gap-8"
        >
          {teamMembers.map((member) => (
            <motion.div
              key={member.id}
              variants={itemVariants}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 w-full md:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] max-w-sm"
            >
              <div className="h-48 overflow-hidden bg-gray-100 flex items-center justify-center">
                <img
                  src={member.image}
                  alt={`${member.name} 照片`}
                  className="w-auto h-auto max-w-full max-h-full object-contain hover:scale-102 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = DEFAULT_TEAM_IMAGE;
                  }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{member.name}</h3>
                <p className="text-sm text-blue-600 font-medium mb-3">{member.title}</p>
                <p className="text-gray-600 mb-4 text-sm">{member.bio}</p>

                {/* 顯示聯絡資訊 */}
                <div className="flex items-center mt-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a
                    href={`mailto:${member.contactEmail}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {member.contactEmail}
                  </a>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {member.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                {/* 社交媒體連結 */}
                {member.socialLinks && (
                  <div className="flex space-x-3 mt-3">
                    {member.socialLinks.linkedin && (
                      <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
                        </svg>
                      </a>
                    )}
                    {member.socialLinks.github && (
                      <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
