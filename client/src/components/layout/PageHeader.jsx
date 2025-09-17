import { motion } from 'framer-motion';
import Container from './Container';

export default function PageHeader({ title, description, actions, className, bgImage }) {
  const headerStyle = bgImage ? {
    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${bgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: 'white'
  } : {};

  return (
    <div
      className={`bg-white border-b border-gray-200 ${className || ''}`}
      style={headerStyle}
    >
      <Container>
        <motion.div
          className="py-12"  // 增加一些高度，讓背景圖片效果更明顯
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className={`text-3xl font-bold ${bgImage ? 'text-white' : 'text-gray-900'}`}>{title}</h1>
          {description && (
            <p className={`mt-2 text-lg ${bgImage ? 'text-gray-200' : 'text-gray-600'}`}>{description}</p>
          )}
          {actions && (
            <div className="mt-4 flex items-center space-x-3">
              {actions}
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
