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
    <aside className="w-64 bg-black text-white h-full flex flex-col justify-between p-0 hidden md:flex">
      <div>
        <div className="flex items-center justify-center h-16 bg-white p-4 border-b border-gray-200">
          {/* GSS-style Demo Logo */}
          <svg width="90" height="32" viewBox="0 0 90 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="90" height="32" rx="8" fill="#fff"/>
            <text x="50%" y="55%" textAnchor="middle" fill="#23272F" fontSize="22" fontFamily="Arial" dy=".3em">GSS</text>
          </svg>
        </div>
        <nav className="mt-6">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`block px-8 py-3 rounded-none text-base font-medium transition-colors text-left ${
                    location.pathname === link.to ? 'bg-[#23272F] text-white' : 'text-white hover:bg-[#23272F]'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex items-center gap-3 bg-[#23272F] p-4">
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold">A</div>
        <div>
          <div className="font-semibold text-sm">Adam Jacobs</div>
          <div className="text-xs text-gray-300">Profile Settings</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
