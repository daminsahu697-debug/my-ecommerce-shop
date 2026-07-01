import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function AdminDashboard() {
    const [ products, setProducts ] = useState([]);
    const [ orders, setOrders ] = useState([]);
    const [ name, setName ] = useState('');
    const [ price, setPrice ] = useState('');
    const [ category, setCategory ] = useState('');
    const [ stock, setStock ] = useState('');
    const [ imageUrl, setImageUrl ] = useState('');
    const [ loading, setLoading ] = useState(false);
    const [ fetching, setFetching ] = useState(true);

    async function fetchData() {
        setFetching(true);
        const { data: pData } = await supabase.from('products').select('*').order('id', { ascending: false });
        const { data: oData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (pData) setProducts(pData);
        if (oData) setOrders(oData);
        setFetching(false);
    }

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !price) return alert('Please enter at least a name and price.');
        setLoading(true);
        await supabase.from('products').insert([ { name, price: parseFloat(price), category: category || 'General', stock: parseInt(stock) || 10, image_url: imageUrl } ]);
        setLoading(false);
        setName(''); setPrice(''); setCategory(''); setStock(''); setImageUrl('');
        fetchData();
    };

    const handleDelete = async (productId) => {
        if (window.confirm('Remove this item?')) {
            await supabase.from('products').delete().eq('id', productId);
            fetchData();
        }
    };

    // Operation: Update Logistic Status String
    const handleStatusChange = async (orderId, newStatus) => {
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (!error) {
            alert("Shipment status updated!");
            fetchData();
        }
    };

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Operations Control</h1>
                <p className="text-slate-500 mt-1">Manage infrastructure, products, and fulfillment dispatch updates.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Creation Form */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-1">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Insert New Inventory Record</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Product Title</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Price ($)</label>
                                <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-600" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Stock</label>
                                <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-600" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Category</label>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-600" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Image URL</label>
                            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-indigo-600" />
                        </div>
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-indigo-600 transition-colors">
                            Insert into Cloud System
                        </button>
                    </form>
                </div>

                {/* Product Inventory Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Active System Inventory</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b text-xs font-bold uppercase text-slate-400">
                                    <th className="pb-2">Product Name</th>
                                    <th className="pb-2">Price</th>
                                    <th className="pb-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-slate-700 font-medium">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-50">
                                        <td className="py-3 font-bold text-slate-900">{p.name}</td>
                                        <td className="py-3 text-indigo-600">${p.price}</td>
                                        <td className="py-3 text-right">
                                            <button onClick={() => handleDelete(p.id)} className="text-red-600 bg-red-50 px-2 py-1 rounded-md text-xs">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* NEW SECTION: GLOBAL ORDERS & LOGISTICS DISPATCH TRACKER */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Incoming Logistic Orders Fulfillment</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b text-xs font-bold uppercase text-slate-400">
                                <th className="pb-2">Order Reference</th>
                                <th className="pb-2">Customer</th>
                                <th className="pb-2">Amount Paid</th>
                                <th className="pb-2">Delivery Progress Control</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-slate-700 font-medium">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="py-4 font-mono text-xs">#NXT-{order.id}</td>
                                    <td className="py-4 font-bold text-slate-900">{order.customer_name}</td>
                                    <td className="py-4 text-indigo-600 font-bold">${order.total_amount}</td>
                                    <td className="py-4">
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            className="border border-slate-200 rounded-lg p-1.5 text-xs focus:outline-indigo-600 font-semibold bg-slate-50"
                                        >
                                            <option value="In Warehouse Pipeline">1. In Warehouse Pipeline</option>
                                            <option value="Dispatched with Courier">2. Dispatched with Courier</option>
                                            <option value="Out for Delivery">3. Out for Delivery</option>
                                            <option value="Delivered Securely">4. Delivered Securely</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}