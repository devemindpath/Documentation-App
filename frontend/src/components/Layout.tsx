import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import { UserProvider } from '../context/UserContext';

const Layout: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

    if (isAuthPage) {
        return (
            <div className="h-screen bg-gray-50">
                <Outlet />
            </div>
        );
    }
    return (
        <UserProvider>
            <div className="flex h-screen bg-gray-50">
                {user && <Sidebar />}
                <div className="flex flex-col flex-1">
                    {user && <Header />}
                    <main className="flex-1 overflow-y-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </UserProvider>
    );
};

export default Layout;