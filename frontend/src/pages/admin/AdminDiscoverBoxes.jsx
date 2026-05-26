import { useState, useEffect } from 'react';
import { discoverAPI, productsAPI, uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';

export default function AdminDiscoverBoxes() {
  const [slots, setSlots] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlot, setEditingSlot] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    slot_id: '',
    title: '',
    subtitle: '',
    product_id: '',
    bg_image: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [slotsRes, productsRes] = await Promise.all([
        discoverAPI.getAll(),
        productsAPI.getAll({ limit: 200 })
      ]);
      setSlots(slotsRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load homepage grid settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingSlot(slot);
    setFormData({
      slot_id: slot.slot_id,
      title: slot.title || '',
      subtitle: slot.subtitle || '',
      product_id: slot.product_id || '',
      bg_image: slot.bg_image || ''
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadAPI.upload(file);
      setFormData(prev => ({
        ...prev,
        bg_image: res.data.data.url
      }));
      toast.success('Background image uploaded!');
    } catch (err) {
      toast.error('Failed to upload background image.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      await discoverAPI.update(formData.slot_id, {
        product_id: formData.product_id || null,
        bg_image: formData.bg_image || null,
        title: formData.title || null,
        subtitle: formData.subtitle || null
      });
      toast.success(`Slot #${formData.slot_id} updated successfully!`);
      setEditingSlot(null);
      loadData();
    } catch (err) {
      toast.error('Failed to update slot mappings.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Homepage Fragrance Grid</h1>
        <p className="text-gray-400 text-sm mt-1">Configure the 4 large discover slots on your landing page</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl h-64 border border-gray-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {slots.map((slot) => (
            <div key={slot.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between h-96 group hover:shadow-md transition-shadow relative">
              {/* Background Image Preview */}
              {slot.bg_image ? (
                <div className="absolute inset-0 z-0">
                  <img src={getImageUrl(slot.bg_image)} alt={slot.title} className="w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-stone-50 z-0" />
              )}

              <div className="p-6 relative z-10 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] uppercase font-bold tracking-widest bg-black text-white px-2.5 py-1 rounded-full">Slot #{slot.slot_id}</span>
                    {slot.product_id && (
                      <span className="text-[9px] uppercase font-bold tracking-widest text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Connected</span>
                    )}
                  </div>
                  <h3 className="font-serif text-lg text-black font-semibold mb-1">{slot.title || 'Untitled Slot'}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">{slot.subtitle || 'No description set.'}</p>
                </div>

                <div className="border-t border-gray-100 pt-4 mt-auto">
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Target Product</p>
                  <p className="text-xs font-semibold text-black truncate">
                    {slot.product_name ? slot.product_name : <span className="text-gray-400 font-normal italic">No product mapped (leads to Shop)</span>}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 relative z-10 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(slot)}
                  className="w-full py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                >
                  Configure Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Slot Settings */}
      {editingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditingSlot(null)} />
          <div className="bg-white rounded-[32px] w-full max-w-xl p-8 relative z-10 border border-gray-100 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
              <h2 className="font-serif text-2xl">Configure Slot #{editingSlot.slot_id}</h2>
              <button onClick={() => setEditingSlot(null)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Slot Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Citrus & Fresh"
                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Slot Subtitle / Tagline</label>
                <textarea
                  value={formData.subtitle}
                  onChange={e => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="e.g. Bright. Energising. Uplifting."
                  className="w-full h-20 p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Connect to Product</label>
                <select
                  value={formData.product_id}
                  onChange={e => setFormData({...formData, product_id: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm"
                >
                  <option value="">None (Leads to products listing)</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>{prod.name} (Rs. {Number(prod.price).toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Background Image</label>
                <div className="flex gap-4 items-center">
                  {formData.bg_image && (
                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative group flex-shrink-0">
                      <img src={getImageUrl(formData.bg_image)} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, bg_image: ''})}
                        className="absolute inset-0 bg-red-500/80 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <label className="flex-1 h-16 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      {uploading ? 'Uploading...' : formData.bg_image ? 'Replace Image' : 'Upload Image'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => setEditingSlot(null)}
                  className="flex-1 h-14 border border-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 h-14 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Processing...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
