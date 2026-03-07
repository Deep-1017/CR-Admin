import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye } from 'lucide-react';

export default function Orders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/v1/orders';

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(API_URL);
            setOrders(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            await axios.put(`${API_URL}/${id}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'Completed': return <span className="badge badge-success">Completed</span>;
            case 'Processing': return <span className="badge badge-primary">Processing</span>;
            case 'Cancelled': return <span className="badge badge-error">Cancelled</span>;
            case 'Pending':
            default: return <span className="badge badge-warning">Pending</span>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Orders</h2>
            </div>

            <div className="mantis-card">
                <div className="mantis-card-header">
                    <h3 className="mantis-card-title">Recent Instrument Orders</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading orders...</div>
                ) : (
                    <div className="mantis-table-wrapper" style={{ border: 'none' }}>
                        <table className="mantis-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-secondary)' }}>No instrument orders found</td>
                                    </tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order._id}>
                                            <td style={{ fontWeight: 500 }}>#{order._id.substring(0, 8).toUpperCase()}</td>
                                            <td>{order.customer?.firstName} {order.customer?.lastName}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td style={{ fontWeight: 600 }}>${order.totalAmount?.toFixed(2)}</td>
                                            <td>
                                                <select 
                                                    value={order.status} 
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    style={{ border: '1px solid var(--border-light)', borderRadius: '4px', padding: '4px' }}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Completed">Completed</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                                &nbsp; {getStatusBadge(order.status)}
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="icon-btn" style={{ color: 'var(--primary-main)' }}>
                                                        <Eye size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
