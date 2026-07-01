import React, { useState, useEffect } from 'react';
import Marketplace from './views/Marketplace';
import UserDashboard from './views/UserDashboard';
import AdminDashboard from './views/AdminDashboard';
import Login from './views/Login';
import { supabase } from './supabaseClient';

export default function App() {
  const [ currentView, setCurrentView ] = useState('shop');
  const [ user, setUser ] = useState(null);
  const [ authLoading, setAuthLoading ] = useState(true);

  // Replace with your preferred admin credential string
  const ADMIN_EMAIL = 'daminsahu697@gmail.com';

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('shop');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-sm font-semibold text-slate-500 tracking-wide">Establishing Secure Session Data...</p>
      </div>
    );
  }

  // If no user session exists, display the professional authentication view
  if (!user) {
    return <Login onAuthSuccess={(authenticatedUser) => setUser(authenticatedUser)} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f3f6] text-slate-800 antialiased font-sans">
      {/* PROFESSIONAL ECOMMERCE NAVBAR */}
      <header className="bg-indigo-600 sticky top-0 z-40 shadow-md px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-8 w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-black text-2xl tracking-tight text-white cursor-pointer flex items-center" onClick={() => setCurrentView('shop')}>
              ShopNxt<span className="text-yellow-400 text-xs italic ml-1 font-bold">Plus</span>
            </span>

            <div className="flex items-center space-x-6 text-sm font-bold text-indigo-100">
              <button onClick={() => setCurrentView('shop')} className={`hover:text-white transition-colors pb-1 border-b-2 ${currentView === 'shop' ? 'border-white text-white' : 'border-transparent'}`}>Marketplace</button>
              <button onClick={() => setCurrentView('account')} className={`hover:text-white transition-colors pb-1 border-b-2 ${currentView === 'account' ? 'border-white text-white' : 'border-transparent'}`}>Track Orders</button>

              {user.email === ADMIN_EMAIL && (
                <button onClick={() => setCurrentView('admin')} className={`hover:text-yellow-400 text-yellow-300 transition-colors pb-1 border-b-2 ${currentView === 'admin' ? 'border-yellow-400' : 'border-transparent'}`}>
                  Admin Panel ⚙️
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-end">
            <div className="text-right hidden md:block">
              <p className="text-xs text-indigo-200">Logged in as</p>
              <p className="text-sm font-semibold text-white">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-4 py-2 rounded-lg text-xs shadow-sm transition-all uppercase tracking-wider">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* RENDER VIEWPORT VIEW */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {currentView === 'shop' && <Marketplace user={user} />}
        {currentView === 'account' && <UserDashboard user={user} />}
        {currentView === 'admin' && user.email === ADMIN_EMAIL && <AdminDashboard />}
      </main>
    </div>
  );
}