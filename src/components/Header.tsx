import React from 'react';
import { Menu, Search, Bell, Settings } from 'lucide-react';

interface HeaderProps {
    toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
    return (
        <header className="header">
            <div className="flex items-center gap-4">
                <button 
                    onClick={toggleSidebar}
                    className="icon-btn"
                >
                    <Menu size={20} />
                </button>
                
                <div className="flex items-center" style={{ 
                    position: 'relative', 
                    background: 'var(--bg-default)', 
                    borderRadius: '8px',
                    padding: '8px 16px',
                    width: '300px'
                }}>
                    <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute' }} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        style={{ background: 'transparent', border: 'none', marginLeft: '24px', width: '100%', outline: 'none' }}
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="icon-btn">
                    <Bell size={20} />
                </button>
                <div style={{ padding: '4px', borderRadius: '24px', background: 'var(--bg-default)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-main)' }}>
                        <Settings size={18} />
                    </div>
                </div>
            </div>
        </header>
    );
}
