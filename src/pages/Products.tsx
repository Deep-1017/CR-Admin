import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Music } from 'lucide-react';

const INSTRUMENT_CATEGORIES = [
    'Guitars',
    'Bass',
    'Drums & Percussion',
    'Keyboards & Pianos',
    'Wind Instruments',
    'String Instruments',
    'DJ & Electronics',
    'Studio & Recording',
    'Accessories',
];

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Professional'];
const CONDITIONS = ['New', 'Used - Like New', 'Used - Good', 'Used - Fair'];
const BRANDS = ['Fender', 'Gibson', 'Yamaha', 'Roland', 'Pearl', 'Shure', 'Focusrite', 'Pioneer DJ', 'Music Man', 'Ludwig', 'Selmer', 'Ernie Ball', 'Numark', 'Sony', 'Other'];

export default function Products() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Guitars',
        price: '',
        originalPrice: '',
        onSale: false,
        image: '',
        description: '',
        brand: 'Fender',
        condition: 'New',
        skillLevel: 'Beginner',
        inStock: true,
        stockCount: '',
        specifications: [{ label: '', value: '' }],
    });

    const API_URL = 'http://localhost:5000/api/v1/products';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get(API_URL);
            setProducts(res.data?.products || res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products', error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this instrument?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product', error);
            }
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            category: product.category || 'Guitars',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            onSale: product.onSale || false,
            image: product.image || '',
            description: product.description || '',
            brand: product.brand || 'Fender',
            condition: product.condition || 'New',
            skillLevel: product.skillLevel || 'Beginner',
            inStock: product.inStock !== undefined ? product.inStock : true,
            stockCount: product.stockCount || '',
            specifications: product.specifications?.length > 0 ? product.specifications : [{ label: '', value: '' }],
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...formData,
            price: parseFloat(formData.price as string),
            originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice as string) : undefined,
            stockCount: formData.stockCount ? parseInt(formData.stockCount as string) : 0,
            images: [formData.image],
            rating: 0,
            reviews: 0,
            specifications: formData.specifications.filter(s => s.label && s.value),
            customerReviews: [],
        };
        try {
            if (editingProduct) {
                await axios.put(`${API_URL}/${editingProduct.id}`, payload);
            } else {
                await axios.post(API_URL, payload);
            }
            setShowForm(false);
            setEditingProduct(null);
            resetForm();
            fetchProducts();
        } catch (error) {
            console.error('Error saving product', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            category: 'Guitars',
            price: '',
            originalPrice: '',
            onSale: false,
            image: '',
            description: '',
            brand: 'Fender',
            condition: 'New',
            skillLevel: 'Beginner',
            inStock: true,
            stockCount: '',
            specifications: [{ label: '', value: '' }],
        });
    };

    const addSpecRow = () => {
        setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { label: '', value: '' }] }));
    };

    const updateSpec = (idx: number, field: 'label' | 'value', val: string) => {
        const specs = [...formData.specifications];
        specs[idx][field] = val;
        setFormData(prev => ({ ...prev, specifications: specs }));
    };

    const removeSpec = (idx: number) => {
        setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }));
    };

    const skillLevelBadge = (level: string) => {
        const colors: Record<string, string> = {
            'Beginner': 'badge-success',
            'Intermediate': 'badge-primary',
            'Professional': 'badge badge-secondary',
        };
        return <span className={`badge ${colors[level] || 'badge-secondary'}`}>{level}</span>;
    };

    return (
        <div>
            <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Instruments</h2>
                <button className="btn btn-primary" onClick={() => { resetForm(); setEditingProduct(null); setShowForm(true); }}>
                    <Plus size={16} />
                    <span>Add Instrument</span>
                </button>
            </div>

            {/* Add / Edit Form */}
            {showForm && (
                <div className="mantis-card" style={{ marginBottom: '24px' }}>
                    <div className="mantis-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 className="mantis-card-title">{editingProduct ? 'Edit Instrument' : 'Add New Instrument'}</h3>
                        <button onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-secondary)' }}>×</button>
                    </div>
                    <div className="mantis-card-body">
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                {/* Name */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Instrument Name *</label>
                                    <input className="mantis-input" required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Fender American Professional II Stratocaster" />
                                </div>

                                {/* Category */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Category *</label>
                                    <select className="mantis-input" required value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                                        {INSTRUMENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Brand */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Brand *</label>
                                    <select className="mantis-input" required value={formData.brand} onChange={e => setFormData(p => ({ ...p, brand: e.target.value }))}>
                                        {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                                    </select>
                                </div>

                                {/* Price */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Price ($) *</label>
                                    <input className="mantis-input" type="number" min="0" step="0.01" required value={formData.price} onChange={e => setFormData(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 1499.00" />
                                </div>

                                {/* Original Price */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Original Price ($)</label>
                                    <input className="mantis-input" type="number" min="0" step="0.01" value={formData.originalPrice} onChange={e => setFormData(p => ({ ...p, originalPrice: e.target.value }))} placeholder="Leave blank if not on sale" />
                                </div>

                                {/* Skill Level */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Skill Level *</label>
                                    <select className="mantis-input" required value={formData.skillLevel} onChange={e => setFormData(p => ({ ...p, skillLevel: e.target.value }))}>
                                        {SKILL_LEVELS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Condition *</label>
                                    <select className="mantis-input" required value={formData.condition} onChange={e => setFormData(p => ({ ...p, condition: e.target.value }))}>
                                        {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                {/* Stock Count */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Stock Count</label>
                                    <input className="mantis-input" type="number" min="0" value={formData.stockCount} onChange={e => setFormData(p => ({ ...p, stockCount: e.target.value }))} placeholder="0" />
                                </div>

                                {/* In Stock & On Sale */}
                                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                                        <input type="checkbox" checked={formData.inStock} onChange={e => setFormData(p => ({ ...p, inStock: e.target.checked }))} />
                                        In Stock
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
                                        <input type="checkbox" checked={formData.onSale} onChange={e => setFormData(p => ({ ...p, onSale: e.target.checked }))} />
                                        On Sale
                                    </label>
                                </div>

                                {/* Image URL */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Image URL *</label>
                                    <input className="mantis-input" required value={formData.image} onChange={e => setFormData(p => ({ ...p, image: e.target.value }))} placeholder="https://example.com/image.jpg or /assets/product.jpg" />
                                </div>

                                {/* Description */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Description *</label>
                                    <textarea className="mantis-input" required rows={3} value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Describe the instrument..." style={{ resize: 'vertical' }} />
                                </div>

                                {/* Specifications */}
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={{ fontWeight: '500', fontSize: '14px' }}>Specifications</label>
                                        <button type="button" onClick={addSpecRow} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }}>+ Add Row</button>
                                    </div>
                                    {formData.specifications.map((spec, idx) => (
                                        <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                            <input className="mantis-input" value={spec.label} onChange={e => updateSpec(idx, 'label', e.target.value)} placeholder="Label (e.g. Body Material)" style={{ flex: 1 }} />
                                            <input className="mantis-input" value={spec.value} onChange={e => updateSpec(idx, 'value', e.target.value)} placeholder="Value (e.g. Mahogany)" style={{ flex: 1 }} />
                                            <button type="button" onClick={() => removeSpec(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error-main)', padding: '0 8px' }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" className="btn btn-primary">
                                    {editingProduct ? 'Update Instrument' : 'Add Instrument'}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Products Table */}
            <div className="mantis-card">
                <div className="mantis-card-header">
                    <h3 className="mantis-card-title">All Instruments</h3>
                </div>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>Loading instruments...</div>
                ) : (
                    <div className="mantis-table-wrapper" style={{ border: 'none' }}>
                        <table className="mantis-table">
                            <thead>
                                <tr>
                                    <th>Image</th>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Skill Level</th>
                                    <th>Condition</th>
                                    <th>Price</th>
                                    <th>Stock</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: 'center', padding: '24px' }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                                <Music size={32} />
                                                <span>No instruments found. Add one or run the seeder.</span>
                                            </div>
                                        </td>
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
                                            <td>{product.brand}</td>
                                            <td>{skillLevelBadge(product.skillLevel)}</td>
                                            <td><span className="badge badge-primary" style={{ fontSize: '11px' }}>{product.condition}</span></td>
                                            <td>
                                                ${product.price?.toFixed(2)}
                                                {product.onSale && <span className="badge badge-error" style={{ marginLeft: '6px', fontSize: '10px' }}>Sale</span>}
                                            </td>
                                            <td>
                                                <span style={{ color: product.inStock ? 'var(--success-main)' : 'var(--error-main)', fontWeight: 500 }}>
                                                    {product.inStock ? `✓ ${product.stockCount || 0}` : '✗ Out'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button className="icon-btn" style={{ color: 'var(--primary-main)' }} onClick={() => handleEdit(product)}>
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
