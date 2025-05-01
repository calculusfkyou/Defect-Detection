import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  const baseStyle = "font-medium rounded-md focus:outline-none transition-all";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-5 py-2.5 text-lg"
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${disabledStyle} ${className}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
