import { motion } from 'framer-motion';
import Container from './Container';

export default function PageHeader({ title, description, actions, className }) {
  return (
    <div className={`bg-white border-b border-gray-200 ${className || ''}`}>
      <Container>
        <motion.div
          className="py-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-2 text-lg text-gray-600">{description}</p>
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
