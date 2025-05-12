import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

    if (isAuthPage) {
        return (
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {user && <Header />}
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
};

export default Layout; 