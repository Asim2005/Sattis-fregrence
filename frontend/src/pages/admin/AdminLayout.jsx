import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { ... } from 'lucide-react';
import useAuthStore from '../../stores/authStore';

import logoDark from '../../assets/logo-dark.png';

export default function AdminLayout() {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If not admin, redirect to login
    if (user?.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: 'Dashboard', icon: <span>📊</span>, path: '/admin' },
    { label: 'Products', icon: <span>📦</span>, path: '/admin/products' },
    { label: 'Categories', icon: <span>📂</span>, path: '/admin/categories' },
    { label: 'Orders', icon: <span>🛒</span>, path: '/admin/orders' },
    { label: 'Users', icon: <span>👥</span>, path: '/admin/users' },
    { label: 'Coupons', icon: <span>🎟️</span>, path: '/admin/coupons' },
    { label: 'Hero Slides', icon: <span>🖼️</span>, path: '/admin/hero' },
    { label: 'Homepage Grid', icon: <span>🧩</span>, path: '/admin/discover-boxes' },
    { label: 'Newsletter', icon: <span>📧</span>, path: '/admin/newsletter' },
    { label: 'Reviews', icon: <span>💬</span>, path: '/admin/reviews' },
    { label: 'Settings', icon: <span>⚙️</span>, path: '/admin/settings' },
  ];


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-20">
        <div className="p-8 border-b border-white/10 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <img src={logoDark} alt="SATTIS" className="h-[110px] object-contain mix-blend-screen" />
            <span className="text-[10px] tracking-wider font-semibold bg-white/20 px-2 py-0.5 rounded-full uppercase text-white">Admin</span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">Management Portal</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-colors ${
                  isActive ? 'bg-white text-black' : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/" target="_blank" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-white/5 hover:text-white">
            <span>↗️</span>
            View Store
          </Link>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Welcome Back</p>
            <h1 className="font-semibold text-lg">{user?.name || 'Administrator'}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold">
            {user?.name?.[0] || 'A'}
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
