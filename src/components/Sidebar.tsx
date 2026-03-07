import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
    const location = useLocation();
    if (!isOpen) return null;

    return (
        <aside className="sidebar">
            <div className="logo-container">
                <div style={{ width: '32px', height: '32px', background: 'var(--primary-main)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    M
                </div>
                <span className="logo-text">Mantis</span>
            </div>
            
            <nav style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ padding: '8px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>
                    Dashboard
                </span>
                <NavLink 
                    to="/dashboard"
                    className={({ isActive }) => `nav-item ${isActive || location.pathname === '/' ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>

                <div style={{ marginTop: '16px' }}></div>
                <span style={{ padding: '8px 24px', fontSize: '12px', fontWeight: '600', color: 'var(--text-disabled)', textTransform: 'uppercase' }}>
                    Management
                </span>
                
                <NavLink 
                    to="/products"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <Package size={20} />
                    <span>Products</span>
                </NavLink>
                
                <NavLink 
                    to="/orders"
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                    <ShoppingCart size={20} />
                    <span>Orders</span>
                </NavLink>
            </nav>
        </aside>
    );
}
