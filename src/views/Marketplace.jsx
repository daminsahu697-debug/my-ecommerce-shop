import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

export default function Marketplace({ user }) {
    const [ products, setProducts ] = useState([]);
    const [ filteredProducts, setFilteredProducts ] = useState([]);
    const [ loading, setLoading ] = useState(true);
    const { cart, totalPrice, addToCart, removeFromCart } = useCart();

    // Interface layout states
    const [ isCartOpen, setIsCartOpen ] = useState(false);
    const [ selectedProduct, setSelectedProduct ] = useState(null);
    const [ selectedCategory, setSelectedCategory ] = useState('All');
    const [ sortBy, setSortBy ] = useState('popular');
    const [ customerName, setCustomerName ] = useState('');

    // SEARCH STATES
    const [ searchQuery, setSearchQuery ] = useState('');
    const [ isListening, setIsListening ] = useState(false);
    const [ imageSearchUrl, setImageSearchUrl ] = useState('');
    const [ isImageSearchOpen, setIsImageSearchOpen ] = useState(false);

    // INSTANT ADD TO CART NOTIFICATION STATE
    const [ alertNotification, setAlertNotification ] = useState({ visible: false, productName: '' });

    // DYNAMIC CATEGORY STATE
    const [ dynamicCategories, setDynamicCategories ] = useState([ 'All' ]);

    // REVIEWS STATE
    const [ reviews, setReviews ] = useState([]);
    const [ newRating, setNewRating ] = useState(5);
    const [ newComment, setNewComment ] = useState('');
    const [ newImgUrl, setNewImgUrl ] = useState('');

    useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase.from('products').select('*');
            if (!error && data) {
                setProducts(data);
                setFilteredProducts(data);

                // AUTONOMOUS CATEGORY COMPILER
                // Extracts unique values directly from whatever is inside the database column
                const uniqueCategories = [ 'All', ...new Set(data.map(item => item.category).filter(Boolean)) ];
                setDynamicCategories(uniqueCategories);
            }
            setLoading(false);
        }
        fetchProducts();
    }, []);

    // MASTER FILTER ENGINE (Combines Category + Text + Voice + Image + Sort)
    useEffect(() => {
        let result = [ ...products ];

        // 1. Dynamic Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category?.toLowerCase() === selectedCategory.toLowerCase());
        }

        // 2. Text & Voice String Search Filter
        if (searchQuery.trim() !== '') {
            result = result.filter(p =>
                p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // 3. Image Search Simulation Filter (Extracts mock tags from filename/URL string match)
        if (imageSearchUrl.trim() !== '') {
            const urlKeywords = imageSearchUrl.toLowerCase();
            result = result.filter(p =>
                urlKeywords.includes(p.name?.toLowerCase()) ||
                urlKeywords.includes(p.category?.toLowerCase()) ||
                p.category?.toLowerCase().includes('gadgets') ||
                p.category?.toLowerCase().includes('electronics')
            );
        }

        // 4. Sorting Algorithms
        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
        else if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setFilteredProducts(result);
    }, [ selectedCategory, sortBy, searchQuery, imageSearchUrl, products ]);

    // INSTANT TRIGGER HOOK WITH VISUAL FLASH AFFIRMATION
    const triggerAddToCartWithFeedback = (product) => {
        addToCart(product);

        // Fire up the notification box immediately
        setAlertNotification({ visible: true, productName: product.name });

        // Automatically fade it away after 2.5 seconds
        setTimeout(() => {
            setAlertNotification({ visible: false, productName: '' });
        }, 2500);
    };

    // NATIVE VOICE RECOGNITION PIPELINE ENGINE
    const handleVoiceSearch = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice API is not supported in this environment browser view framework. Try Chrome!");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onerror = (e) => {
            console.error(e);
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[ 0 ][ 0 ].transcript;
            setSearchQuery(transcript);
        };

        recognition.start();
    };

    const loadProductDetails = async (product) => {
        setSelectedProduct(product);
        const { data } = await supabase.from('reviews').select('*').eq('product_id', product.id).order('created_at', { ascending: false });
        if (data) setReviews(data);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const reviewPayload = {
            product_id: selectedProduct.id,
            user_email: user?.email || 'shopper@test.com',
            rating: newRating,
            comment: newComment,
            image_url: newImgUrl
        };

        const { error } = await supabase.from('reviews').insert([ reviewPayload ]);
        if (!error) {
            setNewComment('');
            setNewImgUrl('');
            const { data } = await supabase.from('reviews').select('*').eq('product_id', selectedProduct.id).order('created_at', { ascending: false });
            if (data) setReviews(data);
        }
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return alert("Your basket is empty.");
        if (!customerName.trim()) return alert("Please specify a Recipient Delivery Name.");

        try {
            const response = await fetch('http://localhost:4000/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cartItems: cart, customerName, customerEmail: user.email }),
            });
            const data = await response.json();
            if (data.url) window.location.href = data.url;
        } catch (err) {
            alert("Gateway error: " + err.message);
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading Connected Cluster Store...</div>;

    return (
        <div className="space-y-6 relative">

            {/* INSTANT FLOATING INTERACTIVE TOAST SYSTEM */}
            {alertNotification.visible && (
                <div className="fixed bottom-10 left-10 z-50 max-w-sm bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl border border-slate-700 animate-bounce flex items-center space-x-3">
                    <div className="bg-emerald-500 text-white rounded-full p-1 text-xs font-black">✓</div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Added to Cart Session</p>
                        <p className="text-sm font-extrabold line-clamp-1 text-emerald-400">{alertNotification.productName}</p>
                    </div>
                </div>
            )}

            {/* SEARCH CONSOLE BAR CONTAINER */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3">
                <div className="flex flex-col md:flex-row gap-3">

                    {/* Main search processing block */}
                    <div className="relative grow flex items-center">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search high-performance specifications, tech items or categories..."
                            className="w-full pl-10 pr-12 py-3 text-sm font-semibold border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
                        />
                        <span className="absolute left-3.5 text-slate-400 font-bold text-sm">🔍</span>

                        {/* Native Microphone Action Toggle */}
                        <button
                            onClick={handleVoiceSearch}
                            className={`absolute right-3 p-1.5 rounded-lg text-xs transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-ping' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                            title="Search with your voice"
                        >
                            {isListening ? '🎙️ Rec...' : '🎙️'}
                        </button>
                    </div>

                    {/* Image Search Panel Trigger */}
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsImageSearchOpen(!isImageSearchOpen)}
                            className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${imageSearchUrl ? 'bg-emerald-50 border-emerald-300 text-emerald-600' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            📷 {imageSearchUrl ? 'Image Input Mapped' : 'Search by Image'}
                        </button>
                        {imageSearchUrl && (
                            <button onClick={() => setImageSearchUrl('')} className="text-xs font-bold text-red-500 hover:underline">Reset</button>
                        )}
                    </div>

                </div>

                {/* Expandable Image File URL Entry Panel */}
                {isImageSearchOpen && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-fadeIn">
                        <p className="text-xs font-bold uppercase text-slate-400 mb-1.5 tracking-wider">Image Search</p>
                        <input
                            type="text"
                            value={imageSearchUrl}
                            onChange={(e) => setImageSearchUrl(e.target.value)}
                            placeholder="Paste any product image URL address here to match design taxonomy tags..."
                            className="w-full bg-white px-3 py-2 border rounded-lg text-xs font-medium focus:outline-indigo-600"
                        />
                        <p className="text-[10px] text-slate-400 font-medium mt-1">Our engine filters target categories when a image matches the source image metadata string.</p>
                    </div>
                )}
            </div>

            {/* AUTONOMOUSLY CONFIGURED CATEGORY BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex gap-2 overflow-x-auto scrollbar-hide">
                {dynamicCategories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2 rounded-full font-bold text-xs transition-all tracking-wide capitalize whitespace-nowrap ${selectedCategory === cat
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* FILTER/SORT TOOLBAR CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-sm font-bold text-slate-500">Showing <span className="text-slate-800">{filteredProducts.length}</span> luxury assets</p>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort By:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold bg-slate-50 text-slate-700 outline-none focus:border-indigo-500"
                    >
                        <option value="popular">Popularity Mapped</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="rating">Top Rated ⭐</option>
                    </select>
                    <button onClick={() => setIsCartOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm">
                        🛒 Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                    </button>
                </div>
            </div>

            {/* RE-ENGINEERED PRODUCT INTERFACE GRID */}
            {filteredProducts.length === 0 ? (
                <div className="bg-white rounded-xl border p-12 text-center text-slate-400 font-bold text-sm shadow-sm">
                    No inventory clusters match your current voice, category, or search string metrics.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProducts.map(p => (
                        <div
                            key={p.id}
                            onClick={() => loadProductDetails(p)}
                            className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col group"
                        >
                            <div className="relative overflow-hidden bg-slate-50 h-52">
                                <img src={p.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-extrabold capitalize' px-2 py-0.5 rounded tracking-widest capitalize">{p.category}</span>
                            </div>
                            <div className="p-4 flex flex-col grow">
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                                <div className="flex items-center space-x-1.5 mt-1.5 mb-3">
                                    <span className="bg-emerald-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        {p.rating || '4.2'} ★
                                    </span>
                                    <span className="text-slate-400 font-bold text-[11px]">({p.review_count || '14'} log reviews)</span>
                                </div>
                                <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-50" onClick={e => e.stopPropagation()}>
                                    <span className="text-lg font-black text-slate-900">${p.price}</span>

                                    {/* BUTTON TRIGGER CALLS INTERACTIVE FEEDBACK NOTIFICATION BOX */}
                                    <button
                                        onClick={() => triggerAddToCartWithFeedback(p)}
                                        className="bg-indigo-600 text-white hover:bg-slate-900 font-bold text-xs px-3 py-1.5 rounded-lg transition-all shadow-sm"
                                    >
                                        + Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EXPANDED DETAILS & FEEDBACK MODAL OVERLAY */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative grid grid-cols-1 md:grid-cols-2">
                        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs z-10">✕</button>
                        <div className="p-6 border-r border-slate-100 space-y-4">
                            <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-64 object-cover rounded-xl shadow-inner bg-slate-50" />
                            <div>
                                <h2 className="text-xl font-extrabold text-slate-900">{selectedProduct.name}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="bg-emerald-600 text-white font-bold text-xs px-2 py-0.5 rounded">{selectedProduct.rating} ★</span>
                                    <p className="text-xs text-slate-400 font-bold">In Stock: {selectedProduct.stock} units</p>
                                </div>
                                <p className="text-2xl font-black text-indigo-600 mt-3">${selectedProduct.price}</p>
                            </div>
                            <button onClick={() => triggerAddToCartWithFeedback(selectedProduct)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md">
                                Add To Shopping Basket
                            </button>
                        </div>

                        <div className="p-6 bg-slate-50/50 flex flex-col h-125 md:h-auto overflow-y-auto">
                            <h3 className="font-extrabold text-slate-900 text-sm border-b pb-2 mb-4 uppercase tracking-wider">Unboxing Feedback Hub</h3>
                            <form onSubmit={handleReviewSubmit} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-3 mb-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold uppercase text-slate-400">Share Rating:</label>
                                    <select value={newRating} onChange={e => setNewRating(Number(e.target.value))} className="border text-xs font-bold p-1 rounded bg-slate-50">
                                        <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
                                        <option value="4">4 Stars ⭐⭐⭐⭐</option>
                                        <option value="3">3 Stars ⭐⭐⭐</option>
                                    </select>
                                </div>
                                <input type="text" placeholder="Write comment here..." value={newComment} onChange={e => setNewComment(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-medium bg-slate-50/50" />
                                <input type="text" placeholder="Paste image URL link for review attach..." value={newImgUrl} onChange={e => setNewImgUrl(e.target.value)} className="w-full border rounded-lg p-2 text-xs font-medium bg-slate-50/50" />
                                <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-1.5 rounded-lg text-xs hover:bg-indigo-700 transition-colors">Submit Review</button>
                            </form>

                            <div className="space-y-3 overflow-y-auto grow">
                                {reviews.map(rev => (
                                    <div key={rev.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm space-y-2">
                                        <div className="flex justify-between items-center text-[11px]">
                                            <span className="font-bold text-slate-700">{rev.user_email}</span>
                                            <span className="text-amber-500 font-bold">{'★'.repeat(rev.rating)}</span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-600">{rev.comment}</p>
                                        {rev.image_url && <img src={rev.image_url} alt="User review asset" className="w-16 h-16 object-cover rounded-lg border" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cart Sliding Overlay Drawer View */}
            {isCartOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end">
                    <div className="bg-white w-full max-w-md h-full p-6 shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center pb-3 border-b mb-4">
                            <h2 className="text-lg font-bold text-slate-900">Checkout Basket</h2>
                            <button onClick={() => setIsCartOpen(false)} className="text-slate-400 font-bold text-sm">✕</button>
                        </div>
                        <div className="grow overflow-y-auto space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                                    <div>
                                        <p className="font-bold text-xs text-slate-800">{item.name} <span className="text-indigo-600 font-bold">x{item.quantity}</span></p>
                                        <p className="text-xs text-slate-400">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t space-y-3 mt-auto">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Shipping Recipient Name</label>
                                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Full Name" className="w-full border rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50" />
                            </div>
                            <div className="flex justify-between items-center font-black text-slate-900 text-base">
                                <span>Total Due:</span>
                                <span className="text-indigo-600">${totalPrice}</span>
                            </div>
                            <button onClick={handleCheckout} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md">
                                Secure Stripe Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CORPORATE MULTI-APP FOOTER INTERFACE */}
            <footer className="mt-20 bg-slate-900 rounded-2xl text-slate-400 p-8 sm:p-10 text-xs border border-slate-800 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Column 1: Contact Logistics Core */}
                    <div className="space-y-3">
                        <h4 className="text-indigo-400' font-black text-sm uppercase tracking-wider text-indigo-400">ShopNxt Hub Office</h4>
                        <p className="leading-relaxed">Platform Developer: <span className="text-white font-bold">Damin Sahu</span></p>
                        <p>📧 Support: <span className="text-slate-200">contact@shopnxt.io</span></p>
                        <p>📞 Phone Gateway: <span className="text-slate-200">+91 98765 43210</span></p>
                        <p>📍 Location Grid: <span className="text-slate-200">Malviya Industrial Area, Jaipur, Rajasthan, India</span></p>
                    </div>

                    {/* Column 2: Ecosystem Coordinate Mapping */}
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-sm uppercase tracking-wider text-yellow-400">Microservice Satellite Nodes</h4>
                        <div className="space-y-2">
                            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                                <p className="font-bold text-slate-200">🚮 IoT Smart Waste Tracker Node</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Telemetry Matrix Coordinates: <span className="font-mono text-cyan-400">26.8476° N, 75.8355° E</span></p>
                            </div>
                            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800">
                                <p className="font-bold text-slate-200">💰 KashFlow Student Ledger Server</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Budget Ledger Cluster: <span className="font-mono text-cyan-400">26.9124° N, 75.7873° E</span></p>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: Autonomous Rover Link System */}
                    <div className="space-y-3">
                        <h4 className="text-white font-black text-sm uppercase tracking-wider text-orange-400">RescueAI Rover Node Terminal</h4>
                        <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                            <p className="font-bold text-slate-200">🏎️ 6-Wheel Autonomous USAR Rover Link</p>
                            <p className="text-slate-400">Sensor Fusion Status: <span className="text-emerald-400 font-bold">🟢 Online (ESP32 Live Stream)</span></p>
                            <p className="text-[11px] font-mono text-slate-500">Telemetry Feed Connection: Node Cluster Secured via NIAT Lab.</p>
                        </div>
                    </div>

                </div>

                <div className="pt-6 border-t border-slate-800/80 text-center text-slate-500 font-semibold flex flex-col sm:flex-row justify-between items-center gap-2">
                    <p>© 2026 ShopNxt Plus Cloud Network Systems. Built with full-stack event-driven database streaming pipelines.</p>
                    <p className="text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase">Production Environment Version V4.2</p>
                </div>
            </footer>

        </div>
    );
}