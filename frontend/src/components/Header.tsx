import React from 'react';

const Header: React.FC = () => {
    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-xl font-bold text-blue-600">
                                Documentation App
                            </h1>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Header;
