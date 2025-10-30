import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumb = ({ items = [], className = '' }) => {
  // Default home item if not provided
  const breadcrumbItems = [
    { label: 'Home', href: '/', icon: Home },
    ...items
  ];

  return (
    <div className={`bg-white/60 backdrop-blur-sm border-b border-white/20 relative z-10 hidden md:block ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center space-x-2 text-sm"
          aria-label="Breadcrumb"
        >
          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;
            const isDisabled = item.disabled || !item.href;
            const Icon = item.icon;

            return (
              <div key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRight
                    size={16}
                    className="text-slate-400 mx-2 flex-shrink-0"
                  />
                )}

                {isLast || isDisabled ? (
                  <span className={`flex items-center gap-2 ${isLast
                    ? 'text-[#1e7a8c] font-medium'
                    : 'text-slate-400 cursor-not-allowed'
                    }`}>
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="flex items-center gap-2 text-slate-500 hover:text-[#1e7a8c] transition-colors"
                  >
                    {Icon && <Icon size={16} />}
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </motion.nav>
      </div>
    </div>
  );
};

export default Breadcrumb;