import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/blog', label: 'Blog' },
  { to: '/ai-assistant', label: 'AI Assistant' },
  // { to: '/markdown-demo', label: 'Markdown Demo' },
  { to: '/profile', label: 'Profile' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white border-r h-full p-4 hidden md:block">
      <nav>
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.to}>
              <Link
                to={link.to}
                className={`block px-4 py-2 rounded hover:bg-gray-100 transition-colors ${
                  location.pathname === link.to ? 'bg-gray-200 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
