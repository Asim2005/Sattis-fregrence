import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import { ordersAPI } from '../services/api';
import useSEO from '../hooks/useSEO';

export default function AccountPage() {
  useSEO({ title: 'My Account', noindex: true });

  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data.data || []);
    } catch (err) {
      console.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="pt-32 pb-20 max-w-4xl mx-auto px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-12">
          <h1 className="font-serif text-3xl">My Account</h1>
          <button onClick={handleLogout} className="text-sm font-semibold underline">Logout</button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Profile Information</h2>
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Order History</h2>
            <div className="space-y-4">
              {loading ? (
                <div className="p-12 rounded-2xl bg-gray-50 border border-gray-100 text-center animate-pulse">
                  <p className="text-sm text-gray-400">Loading your history...</p>
                </div>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <div key={order.id} className="p-6 rounded-2xl bg-white border border-gray-100 flex items-center justify-between hover:shadow-sm transition-all">
                    <div>
                      <p className="font-bold">Order #{order.id}</p>
                      <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">Rs. {Number(order.total_amount).toLocaleString()}</p>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'completed' ? 'text-green-500' : 
                        order.status === 'pending' ? 'text-yellow-500' : 'text-gray-400'
                      }`}>
                        {order.status === 'shipped' ? 'Out for Delivery' : 
                         order.status === 'completed' ? 'Received' : order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 rounded-2xl bg-gray-50 border border-gray-100 text-center">
                  <p className="text-sm text-gray-400">You haven't placed any orders yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
