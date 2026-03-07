import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign, Download } from 'lucide-react';
import SalesChart from '../components/SalesChart';

export default function Dashboard() {
    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                 <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Dashboard</h2>
            </div>
            
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: '24px' }}>
                <StatCard 
                    title="Total Page Views" 
                    value="4,42,236" 
                    icon={<TrendingUp size={20} />} 
                    trend="+59.3%" 
                    trendUp={true} 
                />
                <StatCard 
                    title="Total Users" 
                    value="78,250" 
                    icon={<Users size={20} />} 
                    trend="+70.5%" 
                    trendUp={true} 
                />
                <StatCard 
                    title="Total Order" 
                    value="18,800" 
                    icon={<ShoppingBag size={20} />} 
                    trend="-27.4%" 
                    trendUp={false} 
                />
                <StatCard 
                    title="Total Sales" 
                    value="$35,078" 
                    icon={<DollarSign size={20} />} 
                    trend="+27.4%" 
                    trendUp={true} 
                />
            </div>

            <div className="grid grid-cols-3 gap-4" style={{ marginBottom: '24px' }}>
                <div className="mantis-card" style={{ gridColumn: 'span 2' }}>
                    <div className="mantis-card-header">
                        <h3 className="mantis-card-title">Income Overview</h3>
                    </div>
                    <div className="mantis-card-body">
                         <SalesChart />
                    </div>
                </div>
                <div className="mantis-card">
                    <div className="mantis-card-header">
                        <h3 className="mantis-card-title">Analytics Report</h3>
                    </div>
                    <div className="mantis-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                         <div>
                             <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                                 <span style={{ fontWeight: '500' }}>Company Finance Growth</span>
                                 <span className="badge badge-success">+45.14%</span>
                             </div>
                             <div style={{ color: 'var(--text-secondary)' }}>You made an extra 35k this year.</div>
                         </div>
                         <div>
                            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                                 <span style={{ fontWeight: '500' }}>Company Expenses Ratio</span>
                                 <span className="badge badge-error">-0.5%</span>
                             </div>
                             <div style={{ color: 'var(--text-secondary)' }}>You spend an extra 10k this year.</div>
                         </div>
                         <div>
                            <div className="flex justify-between items-center" style={{ marginBottom: '8px' }}>
                                 <span style={{ fontWeight: '500' }}>Business Risk Cases</span>
                                 <span className="badge badge-primary">Low</span>
                             </div>
                             <div style={{ color: 'var(--text-secondary)' }}>You have 2 less cases this year.</div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1" style={{ gap: '24px' }}>
                <div className="mantis-card" style={{ gridColumn: 'span 2' }}>
                    <div className="mantis-card-header">
                        <h3 className="mantis-card-title">Recent Orders</h3>
                    </div>
                    <div className="mantis-card-body" style={{ padding: '0' }}>
                        <div className="mantis-table-wrapper" style={{ border: 'none', borderRadius: '0' }}>
                            <table className="mantis-table">
                                <thead>
                                    <tr>
                                        <th>Tracking No.</th>
                                        <th>Product Name</th>
                                        <th>Total Order</th>
                                        <th>Status</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#84564564</td>
                                        <td>Camera Lens</td>
                                        <td>40</td>
                                        <td><span className="badge badge-error">Rejected</span></td>
                                        <td>$40,570</td>
                                    </tr>
                                    <tr>
                                        <td>#84564564</td>
                                        <td>Laptop</td>
                                        <td>300</td>
                                        <td><span className="badge badge-warning">Pending</span></td>
                                        <td>$180,139</td>
                                    </tr>
                                    <tr>
                                        <td>#84564564</td>
                                        <td>Mobile</td>
                                        <td>355</td>
                                        <td><span className="badge badge-success">Approved</span></td>
                                        <td>$90,989</td>
                                    </tr>
                                    <tr>
                                        <td>#84564564</td>
                                        <td>Macbook</td>
                                        <td>16</td>
                                        <td><span className="badge badge-success">Approved</span></td>
                                        <td>$10,800</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
    return (
        <div className="mantis-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
            <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: '500' }}>{title}</span>
                <div style={{ color: 'white', background: 'var(--primary-main)', borderRadius: '8px', padding: '8px', display: 'flex' }}>
                    {icon}
                </div>
            </div>
            
            <div style={{ fontSize: '24px', fontWeight: '700' }}>{value}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <span className={`badge ${trendUp ? 'badge-primary' : 'badge-warning'}`}>{trend}</span>
                <span style={{ color: 'var(--text-secondary)' }}>You made an extra {trend} this year</span>
            </div>
        </div>
    );
}
