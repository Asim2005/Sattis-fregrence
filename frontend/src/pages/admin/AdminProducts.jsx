import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { productsAPI, categoriesAPI, uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', slug: '', category_id: '', price: '', sale_price: '',
    stock: 10, description: '', short_description: '', fragrance_family: '',
    longevity: '', scent_notes: '', is_featured: 0, is_bestseller: 0,
    size: '50ml',
    shipping_fee: 0,
    images: [], // Array of image paths
    meta_title: '',
    meta_description: '',
    meta_keywords: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      console.error('Failed to load categories');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const pRes = await productsAPI.getAll({ limit: 100 });
      setProducts(pRes.data.data || []);
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '', slug: '', category_id: '', price: '', sale_price: '',
      stock: 10, description: '', short_description: '', fragrance_family: '',
      longevity: '', scent_notes: '', is_featured: 0, is_bestseller: 0,
      size: '50ml',
      shipping_fee: 0,
      images: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    // Ensure images is an array of strings (paths)
    const images = p.images?.map(img => img.image_path) || [];
    setFormData({
      ...p,
      images,
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      meta_keywords: p.meta_keywords || ''
    });
    setModalOpen(true);
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(file => uploadAPI.upload(file));
      const results = await Promise.all(uploadPromises);
      // Fixed: Access the nested 'data' from our standardized response
      const newImagePaths = results.map(res => res.data.data.url);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImagePaths]
      }));
      toast.success(`${files.length} image(s) uploaded!`);
    } catch (err) {
      toast.error('Failed to upload some images.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      // images array is already updated in formData
      const payload = { ...formData };
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, payload);
        toast.success('Product updated!');
      } else {
        await productsAPI.create(payload);
        toast.success('Product created!');
      }
      
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsAPI.destroy(id);
      toast.success('Product deleted.');
      loadData();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your fragrance collection</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors"
        >
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4 font-bold">Image</th>
                <th className="px-8 py-4 font-bold">Name</th>
                <th className="px-8 py-4 font-bold">Category</th>
                <th className="px-8 py-4 font-bold">Price</th>
                <th className="px-8 py-4 font-bold">Stock</th>
                <th className="px-8 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-6"><div className="w-12 h-16 bg-gray-100 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-32 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-20 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-16 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-10 rounded" /></td>
                    <td className="px-8 py-6"><div className="h-8 bg-gray-100 w-24 rounded-full" /></td>
                  </tr>
                ))
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                      <img src={getImageUrl(p.primary_image)} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono tracking-tight">{p.slug}</p>
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500">{p.category_name}</td>
                  <td className="px-8 py-4">
                    <p className="text-sm font-bold">Rs. {Number(p.price).toLocaleString()}</p>
                    {p.sale_price && <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Sale: Rs. {Number(p.sale_price).toLocaleString()}</p>}
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`text-sm font-bold ${p.stock < 5 ? 'text-red-500' : 'text-black'}`}>{p.stock} units</span>
                      {p.stock <= 0 ? (
                        <span className="text-[9px] font-black uppercase tracking-tighter text-red-500 bg-red-50 px-2 py-0.5 rounded w-fit">Out of Stock</span>
                      ) : p.stock < 5 ? (
                        <span className="text-[9px] font-black uppercase tracking-tighter text-orange-500 bg-orange-50 px-2 py-0.5 rounded w-fit">Low Stock</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-tighter text-green-500 bg-green-50 px-2 py-0.5 rounded w-fit">In Stock</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(p)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold text-gray-500 hover:text-black">EDIT</button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-xs font-bold text-red-400 hover:text-red-600">DEL</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-y-8 right-8 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[70] flex flex-col overflow-hidden border border-gray-100"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-serif text-2xl">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                <button onClick={() => setModalOpen(false)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">X</button>
              </div>

              <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Product Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                  </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Category</label>
                            <select 
                              value={formData.category_id} 
                              onChange={e => setFormData({...formData, category_id: e.target.value})}
                              className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm"
                            >
                              <option value="">Select Category</option>
                              {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Shipping Fee (Rs.)</label>
                            <input 
                              type="number" 
                              value={formData.shipping_fee} 
                              onChange={e => setFormData({...formData, shipping_fee: e.target.value})}
                              placeholder="0"
                              className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm"
                            />
                          </div>
                        </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Size (50ml, etc)</label>
                    <input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" placeholder="50ml" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Current Stock</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Price (Rs)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Sale Price</label>
                    <input type="number" value={formData.sale_price} onChange={e => setFormData({...formData, sale_price: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">SKU / Code</label>
                    <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" placeholder="ST-001" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Fragrance Family</label>
                    <input value={formData.fragrance_family} onChange={e => setFormData({...formData, fragrance_family: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" placeholder="e.g. Woody, Oriental" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Longevity</label>
                    <input value={formData.longevity} onChange={e => setFormData({...formData, longevity: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" placeholder="e.g. 8-10 Hours" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Product Images (First will be Primary)</label>
                  <div className="grid grid-cols-4 gap-4 mb-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-[3/4] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 group">
                        <img src={getImageUrl(img)} className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >×</button>
                        {idx === 0 && <span className="absolute bottom-1 left-1 bg-black text-white text-[8px] px-1 rounded">Primary</span>}
                      </div>
                    ))}
                    <label className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-2xl text-gray-300">+</span>
                      <span className="text-[10px] text-gray-400">Add More</span>
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Scent Notes & Profile</label>
                  <textarea value={formData.scent_notes} onChange={e => setFormData({...formData, scent_notes: e.target.value})} className="w-full h-24 p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none" placeholder="Top notes: Lemon, Pink Pepper... Heart notes: Jasmine..." />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Short Description</label>
                  <textarea value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} className="w-full h-24 p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Full Description (HTML Supported)</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-40 p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none" />
                </div>

                {/* SEO Configurations */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2">SEO Meta Details</h4>
                  
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Meta Title</label>
                    <input 
                      value={formData.meta_title} 
                      onChange={e => setFormData({...formData, meta_title: e.target.value})} 
                      placeholder="e.g. Premium Woody Scent | SATTIS" 
                      className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Meta Description</label>
                    <textarea 
                      value={formData.meta_description} 
                      onChange={e => setFormData({...formData, meta_description: e.target.value})} 
                      placeholder="Enter a compelling 150-160 character description for search results" 
                      className="w-full h-20 p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none" 
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Meta Keywords (Comma Separated)</label>
                    <input 
                      value={formData.meta_keywords} 
                      onChange={e => setFormData({...formData, meta_keywords: e.target.value})} 
                      placeholder="perfume, premium scent, oud, woody" 
                      className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={formData.is_featured == 1} onChange={e => setFormData({...formData, is_featured: e.target.checked ? 1 : 0})} className="accent-black" />
                      <span className="text-xs font-bold uppercase tracking-widest">Featured Product</span>
                   </label>
                   <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 cursor-pointer">
                      <input type="checkbox" checked={formData.is_bestseller == 1} onChange={e => setFormData({...formData, is_bestseller: e.target.checked ? 1 : 0})} className="accent-black" />
                      <span className="text-xs font-bold uppercase tracking-widest">Best Seller</span>
                   </label>
                </div>
              </form>

              <div className="p-8 border-t border-gray-100 flex gap-4">
                <button onClick={() => setModalOpen(false)} className="flex-1 h-14 border border-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
                <button onClick={handleSave} disabled={uploading} className="flex-1 h-14 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                  {uploading ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
