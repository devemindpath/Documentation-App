import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const Header: React.FC = () => {
  const { user, signOut } = useUser();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close popup on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleProfile = () => {
    setOpen(false);
    navigate("/profile");
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
    navigate("/signin");
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">
                Documentation App
              </h1>
            </div>
          </div>
          {user && (
            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => setOpen((v) => !v)}
                aria-label="User menu"
              >
                {/* User Icon SVG */}
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                    onClick={handleProfile}
                  >
                    Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 border-t border-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;
