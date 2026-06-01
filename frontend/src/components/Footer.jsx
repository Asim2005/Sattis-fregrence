import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { newsletterAPI, settingsAPI } from '../services/api';
import toast from 'react-hot-toast';
import logoDark from '../assets/logo-dark.png';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [socials, setSocials] = useState({
    social_facebook: '',
    social_instagram: '',
    social_whatsapp: '',
    social_tiktok: '',
    social_facebook_icon: '',
    social_instagram_icon: '',
    social_whatsapp_icon: '',
    social_tiktok_icon: '',
  });

  useEffect(() => {
    settingsAPI.getAll()
      .then(res => {
        const data = res.data.data;
        setSocials({
          social_facebook: data.social_facebook || '',
          social_instagram: data.social_instagram || '',
          social_whatsapp: data.social_whatsapp || '',
          social_tiktok: data.social_tiktok || '',
          social_facebook_icon: data.social_facebook_icon || '',
          social_instagram_icon: data.social_instagram_icon || '',
          social_whatsapp_icon: data.social_whatsapp_icon || '',
          social_tiktok_icon: data.social_tiktok_icon || '',
        });
      })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await newsletterAPI.subscribe(email);
      toast.success('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Marquee strip */}
      <div className="bg-[#3d2b1f] text-white py-3 overflow-hidden">
        <div className="marquee-inner inline-flex gap-16 text-xs tracking-[0.2em] uppercase">
          {Array(8).fill('✦ Masterfully Composed Scents ✦ Free Shipping Over Rs. 3,000 ✦ 100% Authentic').map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      <footer className="bg-black text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

            {/* Brand column */}
            <div className="md:col-span-1">
              <Link to="/" className="block mb-4">
                <img src={logoDark} alt="SATTIS" className="h-[150px] md:h-[180px] object-contain mix-blend-screen" />
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                A curation of masterfully composed scents where artistry meets the olfactory.
              </p>
              <div className="flex items-center gap-3">
                {socials.social_facebook && (
                  <a href={socials.social_facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden">
                    {socials.social_facebook_icon
                      ? <img src={socials.social_facebook_icon} alt="Facebook" className="w-5 h-5 object-contain" />
                      : <span className="text-[10px] font-bold">FB</span>
                    }
                  </a>
                )}
                {socials.social_instagram && (
                  <a href={socials.social_instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden">
                    {socials.social_instagram_icon
                      ? <img src={socials.social_instagram_icon} alt="Instagram" className="w-5 h-5 object-contain" />
                      : <span className="text-[10px] font-bold">IG</span>
                    }
                  </a>
                )}
                {socials.social_whatsapp && (
                  <a href={socials.social_whatsapp.startsWith('http') ? socials.social_whatsapp : `https://wa.me/${socials.social_whatsapp.replace(/\+/g, '').replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden">
                    {socials.social_whatsapp_icon
                      ? <img src={socials.social_whatsapp_icon} alt="WhatsApp" className="w-5 h-5 object-contain" />
                      : <span className="text-[10px] font-bold">WA</span>
                    }
                  </a>
                )}
                {socials.social_tiktok && (
                  <a href={socials.social_tiktok} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden">
                    {socials.social_tiktok_icon
                      ? <img src={socials.social_tiktok_icon} alt="TikTok" className="w-5 h-5 object-contain" />
                      : <span className="text-[10px] font-bold">TT</span>
                    }
                  </a>
                )}
              </div>
            </div>

            {/* About links */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-5 text-gray-400">About</h4>
              <ul className="space-y-3">
                {[['About Us', '/about'], ['Contact Us', '/contact'], ['FAQ', '/faq']].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm text-gray-300 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Need to know links */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-5 text-gray-400">Need to Know</h4>
              <ul className="space-y-3">
                {[
                  ['Terms & Conditions', '/terms'],
                  ['Privacy Policy', '/privacy'],
                  ['Shipping & Delivery', '/shipping'],
                  ['Exchanges, Returns & Cancellations', '/returns'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link to={href} className="text-sm text-gray-300 hover:text-white transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs tracking-[0.2em] uppercase mb-5 text-gray-400">Stay in Touch</h4>
              <p className="text-sm text-gray-400 mb-4">Subscribe for exclusive offers and new arrivals.</p>
              <form onSubmit={handleSubscribe} className="flex items-center border-b border-gray-600 pb-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                />
                <button type="submit" disabled={loading} className="ml-2 hover:opacity-60 transition-opacity disabled:opacity-40">
                  <span className="ml-2">→</span>
                </button>
              </form>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} Sattis Fragrances. All Rights Reserved.</p>
            <div className="flex gap-4 text-xs text-gray-500">
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
