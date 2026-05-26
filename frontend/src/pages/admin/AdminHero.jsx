import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { heroAPI, uploadAPI } from '../../services/api';
import { getImageUrl } from '../../utils/image';
import toast from 'react-hot-toast';

export default function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const [formData, setFormData] = useState({
    heading: '', subheading: '', cta_text: 'Shop Now', cta_link: '/products',
    image_path: '', sort_order: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    setLoading(true);
    try {
      const res = await heroAPI.getAll();
      setSlides(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load hero slides.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let image_path = formData.image_path;
      if (selectedFile) {
        const upRes = await uploadAPI.upload(selectedFile);
        image_path = upRes.data.data.url;
      }

      const payload = { ...formData, image_path };
      if (editingSlide) {
        await heroAPI.update(editingSlide.id, payload);
        toast.success('Slide updated!');
      } else {
        await heroAPI.create(payload);
        toast.success('Slide added!');
      }
      setModalOpen(false);
      loadSlides();
    } catch (err) {
      toast.error('Failed to save slide.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      await heroAPI.destroy(id);
      toast.success('Slide removed.');
      loadSlides();
    } catch (err) {
      toast.error('Failed to delete slide.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Hero Slides</h1>
          <p className="text-gray-400 text-sm mt-1">Manage the homepage carousel</p>
        </div>
        <button onClick={() => { setEditingSlide(null); setFormData({ heading: '', subheading: '', cta_text: 'Shop Now', cta_link: '/products', image_path: '', sort_order: 0 }); setModalOpen(true); }} className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium tracking-wide uppercase hover:bg-gray-800 transition-colors">
          Add New Slide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-64 bg-gray-100 rounded-3xl animate-pulse" />)
        ) : slides.map((slide) => (
          <div key={slide.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="h-48 bg-gray-50 relative">
              <img src={getImageUrl(slide.image_path)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingSlide(slide); setFormData(slide); setModalOpen(true); }} className="p-2 bg-white rounded-lg shadow-lg text-xs font-bold text-black hover:bg-gray-100 transition-colors">EDIT</button>
                <button onClick={() => handleDelete(slide.id)} className="p-2 bg-white rounded-lg shadow-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors">DEL</button>
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-serif text-xl mb-1">{slide.heading || 'No Heading'}</h3>
              <p className="text-sm text-gray-400 mb-4 truncate">{slide.subheading || 'No subheading'}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-1 bg-gray-100 rounded-full">Order: {slide.sort_order}</span>
                <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{slide.cta_text} →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white rounded-3xl shadow-2xl z-[70] p-8">
              <h3 className="font-serif text-2xl mb-8">{editingSlide ? 'Edit Slide' : 'Add Slide'}</h3>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Heading</label>
                  <input required value={formData.heading} onChange={e => setFormData({...formData, heading: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Subheading</label>
                  <input value={formData.subheading} onChange={e => setFormData({...formData, subheading: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Image</label>
                    <input type="file" onChange={e => setSelectedFile(e.target.files[0])} className="text-xs w-full" />
                   </div>
                   <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Order</label>
                    <input type="number" value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
                   </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 h-14 border border-black rounded-full text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 h-14 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Slide'}
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
