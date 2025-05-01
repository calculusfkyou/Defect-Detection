import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Card from '../ui/Card.jsx';

export default function FeatureCard({
  title,
  description,
  icon,
  to,
  requiresAuth = false,
  isAuthenticated = false
}) {
  const isDisabled = requiresAuth && !isAuthenticated;

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${isDisabled ? 'opacity-60' : ''}`}
    >
      <Link to={isDisabled ? "#" : to} className={isDisabled ? 'cursor-not-allowed' : ''}>
        <Card className="h-full">
          <div className="p-6">
            <div className="text-blue-600 mb-4">
              {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>

            {isDisabled && (
              <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-2 rounded-md flex items-center">
                <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                需要登入才能使用此功能
              </div>
            )}
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
