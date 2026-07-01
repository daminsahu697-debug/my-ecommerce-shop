import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onAuthSuccess }) {
    const [ email, setEmail ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ isSignUp, setIsSignUp ] = useState(false);
    const [ loading, setLoading ] = useState(false);

    // Custom message object states to replace old alert popups cleanly
    const [ uiMessage, setUiMessage ] = useState({ type: '', text: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        setUiMessage({ type: '', text: '' });

        if (!email || !password) {
            setUiMessage({ type: 'error', text: 'Please fill in all authorization input fields.' });
            return;
        }

        if (password.length < 6) {
            setUiMessage({ type: 'error', text: 'Security restriction: Password must be at least 6 characters long.' });
            return;
        }

        setLoading(true);

        if (isSignUp) {
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setUiMessage({ type: 'error', text: error.message });
            } else {
                setUiMessage({ type: 'success', text: 'Registration complete! Secure database profile mapped. You can sign in now.' });
                setIsSignUp(false);
                setPassword('');
            }
        } else {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                setUiMessage({ type: 'error', text: error.message === "Invalid login credentials" ? "Access Denied: Invalid email or password combination." : error.message });
            } else if (data?.user) {
                onAuthSuccess(data.user);
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center p-4 sm:p-6">
            {/* SPLIT SCREEN AUTH CARD DESIGN */}
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-5 min-h-[520px]">

                {/* LEFT PANEL - FLIPKART STYLE BRAND CONTENT */}
                <div className="bg-indigo-600 md:col-span-2 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="space-y-4 z-10">
                        <h1 className="text-3xl font-extrabold tracking-tight">
                            {isSignUp ? "Join the Portal" : "Login Access"}
                        </h1>
                        <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                            {isSignUp
                                ? "Create a secure account profile to unlock transaction logging, track order dispatch logs, and stream real-time updates."
                                : "Get access to your personalized interface order basket tracking center, and interactive marketplace configurations."
                            }
                        </p>
                    </div>

                    {/* Subtle Decorative Geometric Background Graphic */}
                    <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500 rounded-full opacity-30 mix-blend-multiply filter blur-xl"></div>
                    <div className="absolute top-1/2 -right-10 w-32 h-32 bg-indigo-400 rounded-full opacity-20 mix-blend-multiply filter blur-xl"></div>

                    <span className="font-black text-xl tracking-tight text-white/90 block mt-8 z-10">
                        ShopNxt<span className="text-yellow-400 text-xs italic ml-0.5">Plus</span>
                    </span>
                </div>

                {/* RIGHT PANEL - SECURE INPUT INTERFACE */}
                <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center bg-white">
                    <form onSubmit={handleAuth} className="space-y-5">

                        {/* DYNAMIC ALERT BANNER ENGINE */}
                        {uiMessage.text && (
                            <div className={`p-4 rounded-xl text-xs font-bold transition-all border shadow-sm ${uiMessage.type === 'error'
                                ? 'bg-red-50 border-red-200 text-red-600'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}>
                                <div className="flex items-center space-x-2">
                                    <span>{uiMessage.type === 'error' ? '⚠️' : '✅'}</span>
                                    <p>{uiMessage.text}</p>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-inner"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 tracking-wider mb-1.5">
                                Password Encryption Key
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-inner"
                                placeholder="Enter password (min 6 characters)"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg transform active:scale-[0.99] flex items-center justify-center uppercase tracking-wider"
                        >
                            {loading ? (
                                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                isSignUp ? 'Proceed to Register' : 'Authorize Security Session'
                            )}
                        </button>
                    </form>

                    {/* SPLIT TOGGLE FOOTER ACTION */}
                    <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-400 font-medium">
                            {isSignUp ? "Already map registered on our server node?" : "New to our marketplace cluster?"}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setUiMessage({ type: '', text: '' });
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-bold ml-1.5 transition-colors underline decoration-2 underline-offset-4"
                            >
                                {isSignUp ? 'Sign In Here' : 'Create an Account'}
                            </button>
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}