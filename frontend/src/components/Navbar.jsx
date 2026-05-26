import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Heart, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../stores/cartStore';
import useAuthStore from '../stores/authStore';
import SearchModal from './SearchModal';

import logoLight from '../assets/logo-light.png';

export default function Navbar() {
  const [scrolled, setScrolled]         = useState(false);
  const [visible, setVisible]           = useState(true);
  const [lastScrollY, setLastScrollY]   = useState(0);
  const [menuOpen, setMenuOpen]         = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [accountOpen, setAccountOpen]   = useState(false);
  const { itemCount, openCart }         = useCartStore();
  const { user, logout }                = useAuthStore();
  const navigate                        = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setVisible(false); // Scrolling down, hide navbar
      } else {
        setVisible(true); // Scrolling up, show navbar
      }
      setLastScrollY(currentScrollY);
      setScrolled(currentScrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    { to: '/',            label: 'Home' },
    { to: '/products/men',    label: 'Men' },
    { to: '/products/women',  label: 'Women' },
    { to: '/products',    label: 'All Products' },
    { to: '/scent-quiz',  label: 'Scent Quiz' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass shadow-sm' : 'bg-transparent'
        } ${visible ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">

          {/* Left – Nav Links (desktop) */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-xs tracking-widest uppercase font-medium transition-colors duration-200 hover:opacity-60 ${
                    isActive ? 'border-b border-black pb-0.5' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Center – Logo */}
          <Link to="/" className="relative md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center">
            <img src={logoLight} alt="SATTIS" className="h-[130px] md:h-[150px] object-contain select-none mix-blend-multiply" />
          </Link>

          {/* Right – Icons */}
          <div className="flex items-center gap-3.5 md:gap-4 ml-auto">
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:opacity-60 transition-opacity" aria-label="Search">
              <Search size={18} strokeWidth={2} />
            </button>

            {/* Account dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`p-2 transition-opacity hover:opacity-60 ${accountOpen ? 'opacity-60' : ''}`}
                aria-label="Account"
              >
                <User size={18} strokeWidth={2} />
              </button>
              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50"
                  >
                    <p className="text-sm font-medium mb-3">Account</p>
                    {user ? (
                      <>
                        <p className="text-xs text-gray-500 mb-3">Hello, {user.name}!</p>
                        {user.role === 'admin' && (
                          <Link to="/admin" onClick={() => setAccountOpen(false)} className="block w-full text-center text-xs py-2.5 px-4 bg-black text-white rounded-full mb-2 hover:bg-gray-800 transition-colors">
                            Admin Dashboard
                          </Link>
                        )}
                        <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex items-center justify-center gap-2 text-xs py-2.5 px-4 bg-black text-white rounded-full mb-2 hover:bg-gray-800 transition-colors">
                          Orders
                        </Link>
                        <button onClick={() => { logout(); setAccountOpen(false); }} className="w-full text-xs py-2.5 px-4 border border-black rounded-full hover:bg-black hover:text-white transition-colors">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { navigate('/login'); setAccountOpen(false); }} className="w-full text-sm py-3 px-4 bg-[#5A31F4] text-white rounded-full mb-2 font-medium">
                          Sign in with account
                        </button>
                        <button onClick={() => { navigate('/register'); setAccountOpen(false); }} className="w-full text-sm py-3 px-4 bg-black text-white rounded-full mb-3">
                          Other sign in options
                        </button>
                        <div className="flex gap-2">
                          <Link to="/account/orders" onClick={() => setAccountOpen(false)} className="flex-1 text-xs py-2.5 text-center bg-black text-white rounded-full">Orders</Link>
                          <Link to="/account" onClick={() => setAccountOpen(false)} className="flex-1 text-xs py-2.5 text-center bg-black text-white rounded-full">Profile</Link>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 hover:opacity-60 transition-opacity" aria-label="Wishlist">
              <Heart size={18} strokeWidth={2} />
            </Link>

            {/* Cart icon with badge */}
            <button onClick={openCart} className="relative p-2 hover:opacity-60 transition-opacity" aria-label="Cart">
              <ShoppingBag size={18} strokeWidth={2} />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 text-[9px] bg-black text-white rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button className="md:hidden p-2 hover:opacity-60" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={18} strokeWidth={2} /> : <Menu size={18} strokeWidth={2} />}
            </button>
          </div>
        </div>

          {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <nav className="flex flex-col px-6 py-4 gap-4">
                {navLinks.map((link) => (
                  <NavLink key={link.to} to={link.to} end={link.to === '/'} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `text-sm tracking-widest uppercase font-medium ${isActive ? 'font-semibold' : 'text-gray-600'}`}>
                    {link.label}
                  </NavLink>
                ))}
                {user ? (
                  <button onClick={() => { logout(); setMenuOpen(false); }} className="text-left text-sm tracking-widest uppercase text-gray-600">Sign Out</button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm tracking-widest uppercase text-gray-600">Account</Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Click outside to close account dropdown */}
      {accountOpen && <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
