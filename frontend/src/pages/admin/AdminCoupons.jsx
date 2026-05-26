import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { couponsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    usage_limit: 0,
    expiry_date: '',
    is_active: 1
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponsAPI.getAll();
      setCoupons(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        discount_type: coupon.discount_type || 'percentage',
        discount_value: coupon.discount_value,
        usage_limit: coupon.usage_limit,
        expiry_date: coupon.expiry_date || '',
        is_active: coupon.is_active
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        usage_limit: 0,
        expiry_date: '',
        is_active: 1
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponsAPI.update(editingCoupon.id, formData);
        toast.success('Coupon updated!');
      } else {
        await couponsAPI.create(formData);
        toast.success('Coupon created!');
      }
      setModalOpen(false);
      loadCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await couponsAPI.destroy(id);
      toast.success('Coupon deleted.');
      loadCoupons();
    } catch (err) {
      toast.error('Failed to delete coupon.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Coupons</h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage discount codes</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
              <th className="px-8 py-4 font-bold">Code</th>
              <th className="px-8 py-4 font-bold">Discount</th>
              <th className="px-8 py-4 font-bold">Usage</th>
              <th className="px-8 py-4 font-bold">Expiry</th>
              <th className="px-8 py-4 font-bold">Status</th>
              <th className="px-8 py-4 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="6" className="px-8 py-4 text-center text-sm text-gray-400">Loading coupons...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="6" className="px-8 py-4 text-center text-sm text-gray-400">No coupons created yet.</td></tr>
            ) : coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-4 font-bold text-sm tracking-widest">{c.code}</td>
                <td className="px-8 py-4 text-sm font-bold text-green-600">
                  {c.discount_type === 'percentage' 
                    ? `${parseFloat(c.discount_value)}% OFF` 
                    : c.discount_type === 'fixed' 
                      ? `Rs. ${parseFloat(c.discount_value)} OFF` 
                      : `Rs. ${parseFloat(c.discount_value)} Shipping`}
                </td>
                <td className="px-8 py-4 text-sm">
                  {c.used_count} / {c.usage_limit === 0 ? '∞' : c.usage_limit}
                </td>
                <td className="px-8 py-4 text-sm text-gray-500">
                  {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : 'No expiry'}
                </td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex gap-4">
                    <button onClick={() => handleOpenModal(c)} className="text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-[70] p-8 overflow-hidden"
            >
              <h3 className="font-serif text-2xl mb-6">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h3>
              
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Coupon Code</label>
                  <input 
                    required 
                    disabled={editingCoupon}
                    value={formData.code} 
                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all font-bold tracking-widest"
                    placeholder="SUMMER25"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Discount Type</label>
                    <select 
                      value={formData.discount_type || 'percentage'} 
                      onChange={e => setFormData({...formData, discount_type: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (Rs.)</option>
                      <option value="shipping">Shipping Discount (Rs.)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">
                      Value {formData.discount_type === 'percentage' ? '(%)' : '(Rs.)'}
                    </label>
                    <input 
                      type="number" required min="1"
                      value={formData.discount_value} 
                      onChange={e => setFormData({...formData, discount_value: e.target.value})} 
                      className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Usage Limit (0=∞)</label>
                  <input 
                    type="number" required min="0"
                    value={formData.usage_limit} 
                    onChange={e => setFormData({...formData, usage_limit: e.target.value})} 
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Expiry Date (Optional)</label>
                  <input 
                    type="date"
                    value={formData.expiry_date} 
                    onChange={e => setFormData({...formData, expiry_date: e.target.value})} 
                    className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                  />
                </div>

                <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formData.is_active == 1} 
                    onChange={e => setFormData({...formData, is_active: e.target.checked ? 1 : 0})} 
                    className="accent-black"
                  />
                  <span className="text-xs font-bold uppercase tracking-widest">Active & Usable</span>
                </label>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-12 border border-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 h-12 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Save Coupon</button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
