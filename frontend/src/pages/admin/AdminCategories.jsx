import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categoriesAPI, uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCat, setEditingCat] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingCat) return;
    
    setSaving(true);
    try {
      let imagePath = editingCat.image;
      if (selectedFile) {
        const upRes = await uploadAPI.upload(selectedFile);
        imagePath = upRes.data.data.url;
      }

      await categoriesAPI.update(editingCat.id, {
        ...editingCat,
        image: imagePath
      });
      
      toast.success('Category updated successfully!');
      setEditingCat(null);
      setSelectedFile(null);
      loadCategories();
    } catch (err) {
      toast.error('Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">Manage background images for collection cards</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-96 md:h-[450px] bg-gray-100 rounded-3xl animate-pulse" />)}
          </div>
          <div className="h-64 md:h-80 bg-gray-100 rounded-3xl animate-pulse" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Category Cards (e.g. Men, Women, Unisex) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.filter(c => c.slug !== 'bundles').map((cat) => (
              <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group relative h-[450px]">
                {cat.image ? (
                  <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-xl uppercase tracking-widest bg-gray-50">
                    No Background
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-6 left-6 text-white z-10">
                   <h3 className="font-serif text-3xl uppercase tracking-widest leading-none mb-2">{cat.name}</h3>
                   <p className="text-[10px] uppercase tracking-widest opacity-80">{cat.sort_order || 0} Products Found</p>
                </div>
                <button 
                  onClick={() => setEditingCat(cat)}
                  className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg text-black hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              </div>
            ))}
          </div>

          {/* Bundles Banner Card */}
          {categories.filter(c => c.slug === 'bundles').map((cat) => (
            <div key={cat.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group relative h-64 md:h-80">
              {cat.image ? (
                <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 font-serif text-xl uppercase tracking-widest bg-gray-50">
                  No Background
                </div>
              )}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-500" />
              <div className="absolute bottom-8 left-8 text-white z-10">
                 <h3 className="font-serif text-4xl md:text-5xl uppercase tracking-widest leading-none mb-3">{cat.name}</h3>
                 <p className="text-xs uppercase tracking-widest opacity-80">{cat.sort_order || 0} Products Found</p>
              </div>
              <button 
                onClick={() => setEditingCat(cat)}
                className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg text-black hover:scale-110 transition-transform opacity-0 group-hover:opacity-100 z-20"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editingCat && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCat(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[70] p-10">
              <h3 className="font-serif text-2xl mb-2">Edit {editingCat.name}</h3>
              <p className="text-gray-400 text-sm mb-8">Set a background image for this category section.</p>
              
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Category Name</label>
                  <input value={editingCat.name} onChange={e => setEditingCat({...editingCat, name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Background Image</label>
                  <div className="p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-center">
                    {selectedFile || editingCat.image ? (
                       <div className="mb-4 w-full h-32 rounded-xl overflow-hidden bg-white border border-gray-100">
                          <img src={selectedFile ? URL.createObjectURL(selectedFile) : getImageUrl(editingCat.image)} alt="Preview" className="w-full h-full object-cover" />
                       </div>
                    ) : (
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 mb-2 shadow-sm">
                        +
                      </div>
                    )}
                    <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer" />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setEditingCat(null)} className="flex-1 h-14 border border-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 h-14 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
