import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(formData.name, formData.email, formData.password);
    if (res.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
      >
        <h1 className="font-serif text-3xl text-center mb-2">Create Account</h1>
        <p className="text-gray-400 text-sm text-center mb-8">Join the world of SATTIS</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full h-12 px-4 rounded-full border border-gray-200 focus:border-black outline-none transition-colors text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
            <input 
              type="email" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full h-12 px-4 rounded-full border border-gray-200 focus:border-black outline-none transition-colors text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Password</label>
            <input 
              type="password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full h-12 px-4 rounded-full border border-gray-200 focus:border-black outline-none transition-colors text-sm"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 bg-black text-white rounded-full text-sm tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link to="/login" className="text-black font-semibold underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
