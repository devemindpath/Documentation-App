import React from 'react';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import { useLocation } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const location = useLocation();
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup' || location.pathname === '/ai-assistant';

    if (isAuthPage) {
        return (
            <div className="h-screen bg-gray-50">
                {children}
            </div>
        );
    }

    return (
        <UserProvider>
            <div className="flex flex-col h-screen bg-gray-50">
                {user && <Header />}
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </UserProvider>
    );
};

export default Layout; 