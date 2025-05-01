import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hoverEffect = true,
  ...props
}) {
  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${hoverEffect ? 'hover:shadow-lg transition-shadow' : ''} ${className}`}
      whileHover={hoverEffect ? { y: -5 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
