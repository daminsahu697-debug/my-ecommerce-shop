import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function UserDashboard({ user }) {
    const [ orders, setOrders ] = useState([]);
    const [ loading, setLoading ] = useState(true);

    useEffect(() => {
        async function getOrders() {
            const { data } = await supabase.from('orders')
                .select('*')
                .eq('customer_email', user.email)
                .order('created_at', { ascending: false });
            if (data) setOrders(data);
            setLoading(false);
        }
        getOrders();

        const channel = supabase.channel('live-tracker')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_email=eq.${user.email}` },
                (payload) => {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
                }).subscribe();

        return () => supabase.removeChannel(channel);
    }, [ user ]);

    // Derived arrays separating Active Routing Pipings from Final Archives
    const activeShipments = orders.filter(o => o.status !== 'Delivered Securely');
    const completedHistory = orders.filter(o => o.status === 'Delivered Securely');

    const getStepLevel = (status) => {
        if (status === 'In Warehouse Pipeline') return 1;
        if (status === 'Dispatched with Courier') return 2;
        if (status === 'Out for Delivery') return 3;
        if (status === 'Delivered Securely') return 4;
        return 1;
    };

    if (loading) return <div className="text-center py-20 text-slate-400 text-xs font-bold animate-pulse">Connecting Shipping Feeds...</div>;

    return (
        <div className="space-y-10">

            {/* SECTION A: ONGOING ACTIVE TRANSIT TRACKER */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>📦 Active Shipments</span>
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-full">{activeShipments.length} Transit Logs</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Live telemetry pipeline data streaming directly from dispatch agents.</p>
                </div>

                {activeShipments.length === 0 ? (
                    <div className="bg-white border border-dashed rounded-xl p-8 text-center font-bold text-slate-400 text-xs">
                        No items currently routed inside the transit pipelines.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeShipments.map(order => {
                            const step = getStepLevel(order.status);
                            return (
                                <div key={order.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
                                    <div className="flex justify-between items-center pb-2 border-b text-xs font-bold">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono text-slate-700">#NXT-{order.id}</span>
                                            <span className="bg-amber-50 text-amber-600 border border-amber-100 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                                <span className="inline-block w-1 h-1 bg-amber-500 rounded-full"></span>
                                                Pending Warehouse Dispatched
                                            </span>
                                        </div>
                                        <span className="text-indigo-600 font-black">${order.total_amount}</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase text-slate-400 mb-2 tracking-wider">Current Pipeline Layer: <span className="text-indigo-600 normal-case">{order.status}</span></p>
                                        <div className="grid grid-cols-4 gap-1 text-center text-[9px] font-extrabold text-slate-400">
                                            <div className={`pb-1.5 border-b-4 ${step >= 1 ? 'border-indigo-600 text-indigo-600' : 'border-slate-100'}`}>1. Packaged</div>
                                            <div className={`pb-1.5 border-b-4 ${step >= 2 ? 'border-indigo-600 text-indigo-600' : 'border-slate-100'}`}>2. Dispatched</div>
                                            <div className={`pb-1.5 border-b-4 ${step >= 3 ? 'border-indigo-600 text-indigo-600' : 'border-slate-100'}`}>3. Out for Delivery</div>
                                            <div className={`pb-1.5 border-b-4 ${step >= 4 ? 'border-emerald-500 text-emerald-500' : 'border-slate-100'}`}>4. Arrived</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* SECTION B: UNIFIED SECURE ORDER HISTORY SECTION */}
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <span>📜 Historical Order Log Archive</span>
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded-full">{completedHistory.length} Settled Transactions</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">Permanent immutable cryptographic records of successfully delivered product assets.</p>
                </div>

                {completedHistory.length === 0 ? (
                    <div className="bg-white border rounded-xl p-8 text-center font-bold text-slate-400 text-xs shadow-sm">
                        No completed transaction logs archived under this identity key.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {completedHistory.map(order => (
                            <div key={order.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-semibold">
                                <div className="space-y-1">
                                    <p className="font-mono text-slate-900 font-bold">Log Record Hash: #NXT-{order.id}</p>
                                    <p className="text-slate-400 text-[11px]">Timestamp: {new Date(order.created_at).toLocaleDateString()}</p>
                                    <p className="text-emerald-600 font-bold flex items-center gap-1">✓ Delivered Securely to {order.customer_name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-400 text-[11px]">Amount Settled</p>
                                    <p className="text-sm font-black text-slate-900">${order.total_amount}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}