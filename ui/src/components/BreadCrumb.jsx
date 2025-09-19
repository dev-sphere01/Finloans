// src/components/Breadcrumb.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// Optional: human-friendly label map
const routeLabelMap = {
  'dashboard': 'Dashboard',
  'settings': 'Settings',
  'profile': 'Profile'
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = segments.map((segment, index) => {
    const to = '/' + segments.slice(0, index + 1).join('/');
    const label = routeLabelMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const isLast = index === segments.length - 1;

    return (
      <div className="flex items-center" key={to}>
        {!isLast ? (
          <>
            <Link to={to} className="text-sm text-slate-600 hover:underline capitalize">
              {label}
            </Link>
            <ChevronRight className="mx- h-4 w-4 text-gray-400" />
          </>
        ) : (
          <span className="text-md text-gray-500 capitalize">{label}</span>
        )}
      </div>
    );
  });

  return (
    <nav className="mt-0.5 ml- flex items-center space-x-1 text-md">
      {crumbs}
    </nav>
  );
};

export default Breadcrumb;
