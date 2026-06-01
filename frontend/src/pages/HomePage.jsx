import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
// import { ArrowRight, Minus, Plus, ShoppingBag } from 'lucide-react';
import { heroAPI, productsAPI, categoriesAPI, discoverAPI, newsletterAPI } from '../services/api';
import useSEO from '../hooks/useSEO';
import { getImageUrl } from '../utils/image';
import ProductCard from '../components/ProductCard';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';

// ── Fade-up animation wrapper ────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  useSEO({
    description: "Discover Sattis — Pakistan's premier luxury fragrance store. Shop exclusive Men, Women & Unisex perfumes online with Cash on Delivery and EasyPaisa.",
  });

  const [slides, setSlides] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [bestSeller, setBestSeller] = useState(null);
  const [categories, setCategories] = useState([]);
  const [discoverBoxes, setDiscoverBoxes] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [qty, setQty] = useState(1);
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    heroAPI.getAll().then(r => setSlides(r.data.data || [])).catch(() => { });
    productsAPI.getAll({ featured: 1, limit: 4 }).then(r => setFeatured(r.data.data || [])).catch(() => { });
    productsAPI.getAll({ bestseller: 1, limit: 1 }).then(r => setBestSeller(r.data.data?.[0] || null)).catch(() => { });
    categoriesAPI.getAll().then(r => setCategories(r.data.data || [])).catch(() => { });
    discoverAPI.getAll().then(r => setDiscoverBoxes(r.data.data || [])).catch(() => { });
  }, []);

  const handleAddBestSeller = () => {
    if (!bestSeller) return;
    addItem(bestSeller, qty);
    openCart();
    toast.success(`${bestSeller.name} added to cart!`, {
      style: { borderRadius: '50px', background: '#0a0a0a', color: '#fff', fontSize: '13px' },
    });
  };


  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubmitting(true);
    try {
      await newsletterAPI.subscribe(newsletterEmail);
      toast.success('Thank you for subscribing!', {
        style: { borderRadius: '50px', background: '#0a0a0a', color: '#fff', fontSize: '13px' },
      });
      setNewsletterEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  return (
    <div className="pt-16">

      {/* ── Hero Carousel ─────────────────────────────────── */}
      {slides.length > 0 ? (
        <Swiper
          modules={[Autoplay, Pagination, EffectFade]}
          effect="fade"
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          loop
          className="h-[60vh] md:h-screen"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                <img src={slide.image_path} alt={slide.heading} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                {(slide.heading || slide.subheading) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                    {slide.heading && (
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-3xl md:text-6xl mb-3 md:mb-4 max-w-2xl"
                      >
                        {slide.heading}
                      </motion.h1>
                    )}
                    {slide.subheading && (
                      <p className="text-xs md:text-lg mb-6 md:mb-8 max-w-xl text-white/80">{slide.subheading}</p>
                    )}
                    <Link to={slide.cta_link || '/products'}
                      className="px-6 py-2.5 md:px-8 md:py-3.5 bg-white text-black text-xs md:text-sm tracking-widest uppercase rounded-full hover:bg-black hover:text-white transition-colors duration-300 font-medium">
                      {slide.cta_text || 'Shop Now'}
                    </Link>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        // Fallback static hero if no slides configured yet
        <div className="h-[60vh] md:h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-center px-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="font-serif text-3xl md:text-7xl mb-4 md:mb-6 text-black"
            >
              Scent is Identity.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-gray-500 text-sm md:text-lg mb-6 md:mb-8 max-w-md mx-auto"
            >
              A curation of masterfully composed fragrances.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <Link to="/products" className="px-6 py-2.5 md:px-8 md:py-3.5 bg-black text-white text-xs md:text-sm tracking-widest uppercase rounded-full hover:bg-gray-800 transition-colors inline-block">
                Explore Collection
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* ── Category Grid ──────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.filter(c => c.slug !== 'bundles' && ['men', 'women', 'unisex'].includes(c.slug)).map((cat, i) => (
            <FadeUp key={cat.slug} delay={i * 0.1}>
              <Link to={`/products/${cat.slug}`}
                className="group relative rounded-3xl overflow-hidden h-64 md:h-[500px] flex items-end p-6 md:p-8">
                {cat.image ? (
                  <img src={getImageUrl(cat.image)} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="absolute inset-0 bg-gray-100" />
                )}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />

                <div className="relative z-10 w-full">
                  <span className="text-white text-[10px] uppercase tracking-[0.4em] font-bold block mb-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500">Discover</span>
                  <h3 className="text-white text-2xl md:text-3xl font-serif tracking-widest uppercase mb-4 md:mb-6">{cat.name}</h3>
                  <div className="overflow-hidden">
                    <span className="inline-block px-6 py-2.5 md:px-8 md:py-3 bg-white text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                      Shop Selection
                    </span>
                  </div>
                </div>
              </Link>
            </FadeUp>
          ))}
        </div>

        {/* Bundles full-width banner */}
        {categories.find(c => c.slug === 'bundles') && (
          <FadeUp delay={0.3} className="mt-6 md:mt-8">
            <Link to="/products/bundles"
              className="group relative rounded-3xl overflow-hidden h-72 md:h-[600px] bg-black text-white flex items-center justify-between px-6 md:px-20">
              {categories.find(c => c.slug === 'bundles').image ? (
                <img src={getImageUrl(categories.find(c => c.slug === 'bundles').image)} alt="Bundles" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/35 to-transparent group-hover:opacity-90 transition-opacity" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between w-full gap-4 md:gap-8">
                <div>
                  <span className="text-[8px] md:text-[10px] uppercase tracking-[0.4em] text-white/50 block mb-1 md:mb-2 font-bold">Exclusive offers</span>
                  <h3 className="font-serif text-2xl md:text-7xl tracking-widest uppercase mb-2 md:mb-4 leading-none">Bundles</h3>
                  <p className="text-[10px] md:text-sm text-white/70 max-w-md leading-relaxed uppercase tracking-wider font-light">Curated combinations for the ultimate fragrance experience.</p>
                </div>
                <div>
                  <span className="inline-block px-8 py-3 md:px-12 md:py-4 bg-white text-black text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-gray-100 transition-all duration-300 shadow-md group-hover:shadow-lg">
                    Explore Sets <span className="ml-2 transition-transform inline-block group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          </FadeUp>
        )}
      </section>

      {/* ── Signature Fragrances ───────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-10 md:pb-16">
          <FadeUp>
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="font-serif text-xl md:text-3xl">Signature Fragrances</h2>
              <Link to="/products" className="text-[10px] md:text-xs tracking-widest uppercase flex items-center gap-2 hover:gap-4 transition-all text-gray-500 hover:text-black">
                View All <span className="ml-1">→</span>
              </Link>
            </div>
          </FadeUp>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </section>
      )}

      {/* ── Scent Family Section ────────────────────────────── */}
      <section className="bg-gray-50 py-12 md:py-20 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <FadeUp>
            <h2 className="font-serif text-xl md:text-4xl text-center mb-2 md:mb-3">Discover Your Fragrance Family</h2>
            <p className="text-center text-gray-400 text-[10px] md:text-sm mb-8 md:mb-12 uppercase tracking-widest">Find the scent that speaks to your soul.</p>
          </FadeUp>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(discoverBoxes.length > 0 ? discoverBoxes : [
              { slot_id: 1, title: 'Citrus & Fresh', subtitle: 'Bright. Energising. Uplifting.' },
              { slot_id: 2, title: 'Woody & Earthy', subtitle: 'Grounded. Rich. Sophisticated.' },
              { slot_id: 3, title: 'Floral & Soft', subtitle: 'Romantic. Delicate. Feminine.' },
              { slot_id: 4, title: 'Oriental & Oud', subtitle: 'Bold. Mysterious. Lasting.' }
            ]).map((box, i) => {
              const hasBg = !!box.bg_image;
              const defaultBgColors = ['bg-yellow-50', 'bg-stone-100', 'bg-rose-50', 'bg-amber-50'];
              const defaultBgColor = defaultBgColors[(box.slot_id - 1) % 4];
              return (
                <FadeUp key={box.id || box.slot_id} delay={i * 0.1}>
                  <Link to={box.product_slug ? `/product/${box.product_slug}` : '/products'}
                    className={`group relative rounded-2xl md:rounded-3xl overflow-hidden p-5 md:p-8 h-56 md:h-80 flex flex-col justify-between hover:shadow-lg transition-all duration-500 border border-gray-100/50 ${hasBg ? 'text-white' : `${defaultBgColor} text-black`}`}>
                    {hasBg && (
                      <>
                        <img src={getImageUrl(box.bg_image)} alt={box.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors duration-500" />
                      </>
                    )}
                    <div className="relative z-10">
                      <span className={`text-[9px] uppercase tracking-[0.25em] font-bold block mb-2 ${hasBg ? 'text-white/60' : 'text-gray-400'}`}>
                        {box.product_name ? 'Featured Scent' : 'Collection'}
                      </span>
                      <h3 className="font-serif text-base md:text-2xl tracking-wide uppercase font-medium leading-snug">{box.title || box.product_name}</h3>
                    </div>
                    <div className="relative z-10 mt-auto flex flex-col gap-1 w-full">
                      <p className={`text-[10px] md:text-xs leading-relaxed ${hasBg ? 'text-white/80' : 'text-gray-500'}`}>{box.subtitle || (box.product_name ? 'Click to explore this luxury fragrance.' : '')}</p>
                      <div className="flex items-center gap-2 mt-2 md:mt-4 font-bold uppercase tracking-widest text-[8px] md:text-[9px]">
                        <span>Shop Selection</span>
                        <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  </Link>
                </FadeUp>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Best Seller Section ─────────────────────────────── */}
      {bestSeller && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-24">
          <FadeUp>
            <div className="text-center mb-8 md:mb-16">
              <span className="text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold block mb-2">Customer Favorite</span>
              <h2 className="font-serif text-2xl md:text-4xl">Our Best Seller</h2>
            </div>
          </FadeUp>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Image */}
            <FadeUp delay={0.1}>
              <div className="product-img-wrap aspect-square bg-gray-50 rounded-[32px] overflow-hidden border border-gray-100/50 p-8 flex items-center justify-center hover:shadow-md transition-shadow duration-500">
                {bestSeller.images?.[0]?.image_path ? (
                  <img src={getImageUrl(bestSeller.images[0].image_path)} alt={bestSeller.name} className="w-full h-full object-cover rounded-2xl" />
                ) : bestSeller.primary_image ? (
                  <img src={getImageUrl(bestSeller.primary_image)} alt={bestSeller.name} className="w-full h-full object-cover rounded-2xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">NO IMAGE</div>
                )}
              </div>
            </FadeUp>

            {/* Details */}
            <FadeUp delay={0.2}>
              <div className="flex items-center gap-3 mb-4">
                <p className="text-[10px] tracking-widest font-bold uppercase text-gray-400">SATTIS — {bestSeller.category_name}</p>
              </div>
              <h3 className="font-serif text-2xl md:text-5xl mb-3 md:mb-4 tracking-wide uppercase text-black font-medium">{bestSeller.name}</h3>

              <div className="flex items-center gap-1.5 mb-6 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">★</span>
                ))}
                <span className="text-xs text-gray-400 ml-2">(4.9/5 Rating)</span>
              </div>

              <div className="flex items-center gap-3 mb-4 md:mb-8">
                <span className="text-xl md:text-2xl font-bold text-black">Rs. {Number(bestSeller.sale_price ?? bestSeller.price).toLocaleString()}</span>
                {bestSeller.sale_price && (
                  <span className="text-gray-400 line-through text-sm md:text-base">Rs. {Number(bestSeller.price).toLocaleString()}</span>
                )}
              </div>

              {bestSeller.short_description && (
                <p className="text-gray-500 text-xs md:text-sm leading-relaxed mb-4 md:mb-8">{bestSeller.short_description}</p>
              )}

              {bestSeller.size && (
                <div className="mb-6 md:mb-8">
                  <p className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Available Size</p>
                  <span className="inline-block px-4 py-2 bg-black text-white text-[10px] md:text-xs font-bold rounded-full uppercase tracking-wider">{bestSeller.size}</span>
                </div>
              )}

              {/* Qty + Add to cart */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="flex items-center justify-between border border-gray-200 rounded-full h-12 md:h-14 px-4 bg-white min-w-[120px]">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="text-gray-500 hover:text-black font-bold px-2 py-1">-</button>
                  <span className="text-sm font-semibold min-w-[20px] text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="text-gray-500 hover:text-black font-bold px-2 py-1">+</button>
                </div>
                <button onClick={handleAddBestSeller}
                  className="flex-1 h-12 md:h-14 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all duration-300">
                  <span>Add to Cart</span>
                  <span className="ml-1">→</span>
                </button>
              </div>
              <Link to={`/product/${bestSeller.slug}`}
                className="block w-full py-3 md:py-4 text-xs font-bold uppercase tracking-widest text-center border border-black rounded-full hover:bg-black hover:text-white transition-colors duration-300">
                View Full Details
              </Link>
            </FadeUp>
          </div>
        </section>
      )}

      {/* ── Elevated Confidence Banner ──────────────────────── */}
      <section className="mx-4 sm:mx-6 mb-10 md:mb-16 rounded-3xl bg-gradient-to-r from-gray-900 to-black text-white overflow-hidden relative py-12 md:py-20 px-6 md:px-8 text-center">
        <FadeUp>
          <h2 className="font-serif text-2xl md:text-5xl mb-3 md:mb-4">Elevated Confidence</h2>
          <p className="text-gray-300 text-xs md:text-sm mb-6 md:mb-8 max-w-md mx-auto">Leave a lasting impression, everywhere you go.</p>
          <Link to="/products"
            className="inline-block px-6 py-2.5 md:px-8 md:py-3.5 bg-white text-black text-xs md:text-sm tracking-widest uppercase rounded-full hover:bg-gray-100 transition-colors font-medium">
            Shop Now
          </Link>
        </FadeUp>

        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full border border-white/10" />
        <div className="absolute -bottom-16 -left-10 w-72 h-72 rounded-full border border-white/10" />
      </section>

      {/* ── Trust Badges ────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-10 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {[
            { icon: '✦', title: 'Curated Excellence', sub: 'Hand-picked premium oils and masterfully balanced compositions.' },
            { icon: '✦', title: 'Sustainable Luxury', sub: 'Mindfully sourced ingredients and eco-conscious packaging solutions.' },
            { icon: '✦', title: 'Global Inspiration', sub: 'Scents that transport you to the world\'s most evocative locales.' },
          ].map((b, i) => (
            <FadeUp key={i} delay={i * 0.1} className="text-center p-6 md:p-10 rounded-2xl md:rounded-[40px] bg-white border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-2xl mb-4 font-serif">{b.icon}</div>
              <h4 className="font-serif text-xl mb-3">{b.title}</h4>
              <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-widest">{b.sub}</p>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Newsletter Section ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mb-12 md:mb-24">
        <div className="relative rounded-3xl md:rounded-[48px] bg-black text-white overflow-hidden py-16 px-6 md:py-24 md:px-8 text-center shadow-xl">
          <div className="relative z-10 max-w-2xl mx-auto">
            <FadeUp>
              <h2 className="font-serif text-2xl md:text-5xl mb-3 md:mb-4 tracking-wide">Unlock the SATTIS Experience</h2>
              <p className="text-gray-400 text-[10px] md:text-sm mb-8 md:mb-10 tracking-widest uppercase">Be the first to know about new collections and special offers.</p>

              <form onSubmit={handleNewsletterSubmit} className="relative max-w-md mx-auto">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full h-12 md:h-14 bg-transparent border border-white/20 rounded-full pl-6 pr-16 text-xs md:text-sm text-white focus:outline-none focus:border-white transition-all placeholder-white/30"
                  />
                  <button
                    type="submit"
                    disabled={newsletterSubmitting}
                    className="absolute right-1.5 top-1.5 w-9 h-9 md:right-2 md:top-2 md:w-10 md:h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors disabled:opacity-50 font-bold"
                  >
                    {newsletterSubmitting ? '...' : '→'}
                  </button>
                </div>
              </form>
            </FadeUp>
          </div>

          {/* Decorative grid & blur elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

    </div>
  );
}
