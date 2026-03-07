import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function Products() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/api/products'; // Assuming default, to be checked with .env

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(API_URL);
            setProducts(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Products</h2>
                <button className="btn btn-primary">
                    <Plus size={16} /> 
                    <span>Add Product</span>
                </button>
            </div>

            <div className="mantis-card">
                <div className="mantis-card-header">
                    <h3 className="mantis-card-title">All Products</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading products...</div>
                ) : (
                    <div className="mantis-table-wrapper" style={{ border: 'none' }}>
                        <table className="mantis-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Price</th>
                                    <th>Brand</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No products found</td>
                                    </tr>
                                ) : (
                                    products.map(product => (
                                        <tr key={product.id}>
                                            <td>
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name} 
                                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} 
                                                />
                                            </td>
                                            <td style={{ fontWeight: 500 }}>{product.name}</td>
                                            <td><span className="badge badge-secondary">{product.category}</span></td>
                                            <td>${product.price?.toFixed(2)}</td>
                                            <td>{product.brand}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="icon-btn" style={{ color: 'var(--primary-main)' }}>
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="icon-btn" style={{ color: 'var(--error-main)' }} onClick={() => handleDelete(product.id)}>
                                                        <Trash2 size={16} />
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
