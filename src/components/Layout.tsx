import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="admin-layout">
            <Sidebar isOpen={sidebarOpen} />
            
            <div 
                className="main-wrapper" 
                style={{ marginLeft: sidebarOpen ? '260px' : '0' }}
            >
                <Header toggleSidebar={toggleSidebar} />
                
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
