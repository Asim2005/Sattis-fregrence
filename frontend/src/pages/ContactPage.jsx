import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI, contactAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [siteInfo, setSiteInfo] = useState({
    support_email: 'support@satish.com',
    phone_number: '+92 000 0000000',
    address: 'Karachi, Pakistan',
    social_facebook: '',
    social_instagram: '',
    social_whatsapp: '',
    social_tiktok: ''
  });
  
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    settingsAPI.getAll()
      .then(res => {
        const data = res.data.data;
        setSiteInfo(prev => ({
          ...prev,
          ...data
        }));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await contactAPI.submit(formData);
      toast.success('Your message has been sent successfully!');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#0a0a0a] text-white py-24 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3">Get in Touch</span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-wide">Contact Us</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div>
              <h2 className="font-serif text-3xl mb-6">Let's Connect</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Have questions about our scents, order status, or need assistance choosing your signature scent? Our concierge team is here to assist you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold bg-gray-50 shrink-0">✉</div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Email Support</h4>
                  <p className="text-sm font-bold text-black">{siteInfo.support_email}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold bg-gray-50 shrink-0">☏</div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Phone Helpline</h4>
                  <p className="text-sm font-bold text-black">{siteInfo.phone_number}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-sm font-bold bg-gray-50 shrink-0">⚲</div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Headquarters</h4>
                  <p className="text-sm font-bold text-black">{siteInfo.address}</p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="border-t border-gray-100 pt-8">
              <h4 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-4">Follow SATTIS</h4>
              <div className="flex gap-3">
                {siteInfo.social_facebook && (
                  <a href={siteInfo.social_facebook} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-100 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">Facebook</a>
                )}
                {siteInfo.social_instagram && (
                  <a href={siteInfo.social_instagram} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-100 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">Instagram</a>
                )}
                {siteInfo.social_whatsapp && (
                  <a href={siteInfo.social_whatsapp.startsWith('http') ? siteInfo.social_whatsapp : `https://wa.me/${siteInfo.social_whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-100 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">WhatsApp</a>
                )}
                {siteInfo.social_tiktok && (
                  <a href={siteInfo.social_tiktok} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 rounded-full border border-gray-100 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all">TikTok</a>
                )}
              </div>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-50 p-8 md:p-12 rounded-3xl border border-gray-100"
          >
            <h3 className="font-serif text-2xl mb-8">Send Us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Your Name</label>
                <input 
                  required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200/60 bg-white outline-none text-sm focus:border-black transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Your Email</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200/60 bg-white outline-none text-sm focus:border-black transition-all" 
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  className="w-full h-32 p-4 rounded-xl border border-gray-200/60 bg-white outline-none text-sm focus:border-black transition-all resize-none" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
