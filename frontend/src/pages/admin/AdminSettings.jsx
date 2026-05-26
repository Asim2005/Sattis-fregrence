import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    site_name: 'SATTIS',
    support_email: 'support@satish.com',
    phone_number: '+92 000 0000000',
    address: 'Karachi, Pakistan',
    currency: 'Rs.',
    shipping_fee: '250',
    free_shipping_threshold: '3000',
    shipping_type: 'per_item',
    smtp_host: 'smtp.gmail.com',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_email: 'info@sattis.com',
    smtp_from_name: 'SATTIS Fragrances',
    admin_notify_email: 'admin@sattis.com',
    social_facebook: '',
    social_instagram: '',
    social_whatsapp: '',
    social_tiktok: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.getAll()
      .then(res => {
        const data = res.data.data;
        setSettings(prev => ({
          ...prev,
          ...data
        }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Configure global store parameters and integration configurations</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* General Info */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2">General Info</h3>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Site Name</label>
                <input required value={settings.site_name} onChange={e => setSettings({...settings, site_name: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Support Email</label>
                <input required value={settings.support_email} onChange={e => setSettings({...settings, support_email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
              </div>
           </div>

           {/* Shipping */}
           <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2">Shipping</h3>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Shipping Rate Mode</label>
                <select value={settings.shipping_type} onChange={e => setSettings({...settings, shipping_type: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all">
                  <option value="per_item">Per Item (Multiplied by quantity)</option>
                  <option value="flat">Flat Rate (Single fee for entire order)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Shipping Fee (Rs)</label>
                <input type="number" required value={settings.shipping_fee} onChange={e => setSettings({...settings, shipping_fee: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Free Shipping Threshold</label>
                <input type="number" required value={settings.free_shipping_threshold} onChange={e => setSettings({...settings, free_shipping_threshold: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
              </div>
           </div>
        </div>

        {/* SMTP Mail Configuration */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2 mb-4">SMTP Mail Configurations (PHPMailer)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">SMTP Host</label>
              <input value={settings.smtp_host} onChange={e => setSettings({...settings, smtp_host: e.target.value})} placeholder="e.g. smtp.gmail.com" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">SMTP Port</label>
              <input type="number" value={settings.smtp_port} onChange={e => setSettings({...settings, smtp_port: e.target.value})} placeholder="e.g. 587 or 465" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">SMTP Encryption</label>
              <select value={settings.smtp_encryption} onChange={e => setSettings({...settings, smtp_encryption: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all">
                <option value="tls">TLS (Recommended)</option>
                <option value="ssl">SSL</option>
                <option value="none">None</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">SMTP Username</label>
              <input value={settings.smtp_username} onChange={e => setSettings({...settings, smtp_username: e.target.value})} placeholder="email@gmail.com" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">SMTP Password</label>
              <input type="password" value={settings.smtp_password} onChange={e => setSettings({...settings, smtp_password: e.target.value})} placeholder="SMTP App Password" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Sender Email</label>
              <input value={settings.smtp_from_email} onChange={e => setSettings({...settings, smtp_from_email: e.target.value})} placeholder="noreply@sattis.com" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Sender Name</label>
              <input value={settings.smtp_from_name} onChange={e => setSettings({...settings, smtp_from_name: e.target.value})} placeholder="SATTIS Fragrances" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Admin Notification Email</label>
              <input value={settings.admin_notify_email} onChange={e => setSettings({...settings, admin_notify_email: e.target.value})} placeholder="admin@sattis.com" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="border-t border-gray-100 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 border-b pb-2 mb-4">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">WhatsApp Link/Number</label>
              <input value={settings.social_whatsapp || ''} onChange={e => setSettings({...settings, social_whatsapp: e.target.value})} placeholder="e.g. +923000000000" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Instagram Profile URL</label>
              <input value={settings.social_instagram || ''} onChange={e => setSettings({...settings, social_instagram: e.target.value})} placeholder="https://instagram.com/sattis" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Facebook Profile URL</label>
              <input value={settings.social_facebook || ''} onChange={e => setSettings({...settings, social_facebook: e.target.value})} placeholder="https://facebook.com/sattis" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">TikTok Profile URL</label>
              <input value={settings.social_tiktok || ''} onChange={e => setSettings({...settings, social_tiktok: e.target.value})} placeholder="https://tiktok.com/@sattis" className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all" />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={saving} className="w-full md:w-auto px-12 h-14 bg-black text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50">
            {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
