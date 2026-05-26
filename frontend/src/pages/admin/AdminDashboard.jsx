import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { analyticsAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_sales: 0,
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    recent_orders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.get()
      .then(res => setStats(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Revenue', value: `Rs. ${Number(stats.revenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-green-50' },
    { label: 'Total Orders', value: stats.total_orders || 0, icon: '📦', color: 'bg-blue-50' },
    { label: 'Products', value: stats.total_products || 0, icon: '🏷️', color: 'bg-purple-50' },
    { label: 'Customers', value: stats.total_users || 0, icon: '👥', color: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-3xl border border-gray-100 bg-white shadow-sm flex items-center gap-5`}
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center text-xl shadow-inner`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
            <h3 className="font-serif text-xl">Recent Orders</h3>
            <button className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                  <th className="px-8 py-4 font-bold">Order ID</th>
                  <th className="px-8 py-4 font-bold">Customer</th>
                  <th className="px-8 py-4 font-bold">Amount</th>
                  <th className="px-8 py-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_orders?.length > 0 ? stats.recent_orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-4 text-sm font-medium">#{order.id}</td>
                    <td className="px-8 py-4">
                      <p className="text-sm font-semibold">{order.full_name}</p>
                      <p className="text-xs text-gray-400">{order.guest_email || order.email}</p>
                    </td>
                    <td className="px-8 py-4 text-sm font-bold">Rs. {Number(order.total_amount).toLocaleString()}</td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {order.status === 'shipped' ? 'Out for Delivery' : 
                         order.status === 'completed' ? 'Received' : order.status}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-12 text-center text-gray-400 text-sm italic">
                      No orders found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions / Activity */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
          <h3 className="font-serif text-xl mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full py-4 px-6 bg-black text-white rounded-2xl text-sm font-medium flex items-center justify-between hover:bg-gray-800 transition-all group">
              Add New Product
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button className="w-full py-4 px-6 bg-gray-50 text-black border border-gray-100 rounded-2xl text-sm font-medium flex items-center justify-between hover:bg-gray-100 transition-all group">
              Update Hero Slides
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>

          {/* Low Stock Alert */}
          {stats.low_stock?.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-red-500 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                Low Stock Alerts
              </h4>
              <div className="space-y-3">
                {stats.low_stock.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100/50">
                    <span className="text-xs font-medium text-gray-700">{p.name}</span>
                    <span className="text-xs font-bold text-red-600">{p.stock} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-gray-100 text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">System Status</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-green-600">API Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
