import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// import { ShoppingBag, Star, Minus, Plus, ChevronDown, Check } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { getImageUrl } from '../utils/image';
import useCartStore from '../stores/cartStore';
import toast from 'react-hot-toast';
import useSEO from '../hooks/useSEO';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: product?.name,
    description: product?.short_description
      ? `${product.short_description} — Shop ${product.name} at Sattis with Cash on Delivery across Pakistan.`
      : product?.name
        ? `Shop ${product.name} — a luxury fragrance from Sattis. Fast delivery with COD and EasyPaisa across Pakistan.`
        : undefined,
    ogImage: product?.images?.[0]?.image_path
      ? getImageUrl(product.images[0].image_path)
      : product?.primary_image
        ? getImageUrl(product.primary_image)
        : undefined,
    ogType: 'product',
  });
  const [qty, setQty]         = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [openAccordions, setOpenAccordions] = useState(['details', 'notes']);
  const [zoomModal, setZoomModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addItem, openCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    productsAPI.getOne(slug)
      .then(res => {
        setProduct(res.data.data);
        // Fetch related products from same category
        if (res.data.data.category_slug) {
          productsAPI.getAll({ category: res.data.data.category_slug, limit: 4 })
            .then(relRes => {
              setRelatedProducts(relRes.data.data.filter(p => p.id !== res.data.data.id));
            });
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product) {
      // Update Page Title
      document.title = product.meta_title || `${product.name} | SATTIS Fragrances`;
      
      // Update Meta Description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', product.meta_description || product.short_description || `${product.name} by SATTIS. A curation of masterfully composed scents.`);

      // Update Meta Keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', product.meta_keywords || `sattis, perfume, fragrance, ${product.name}, ${product.fragrance_family || ''}`);
    } else {
      document.title = 'SATTIS Fragrances | Masterfully Composed Scents';
    }
  }, [product]);

  const toggleAccordion = (id) => {
    setOpenAccordions(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleAddToCart = () => {
    addItem(product, qty);
    openCart();
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: '50px', background: '#0a0a0a', color: '#fff', fontSize: '13px' }
    });
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 max-w-7xl mx-auto px-4 grid md:grid-cols-2 gap-12">
        <div className="skeleton aspect-[4/5] rounded-xl" />
        <div className="py-10">
          <div className="skeleton h-4 w-32 mb-6 rounded" />
          <div className="skeleton h-10 w-3/4 mb-4 rounded" />
          <div className="skeleton h-6 w-32 mb-8 rounded" />
          <div className="skeleton h-24 w-full mb-8 rounded" />
          <div className="skeleton h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <h1 className="font-serif text-4xl mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-8">The fragrance you are looking for does not exist or has been removed.</p>
        <Link to="/products" className="px-8 py-3 bg-black text-white rounded-full">Back to Collection</Link>
      </div>
    );
  }

  const price     = Number(product.sale_price ?? product.price);
  const origPrice = product.sale_price ? Number(product.price) : null;
  const rating    = product.avg_rating ? Number(product.avg_rating).toFixed(1) : null;
  const images    = product.images?.length > 0 ? product.images : [{ image_path: '' }];

  const accordions = [
    { id: 'details', title: 'Fragrance Description', content: product.description || product.short_description || 'No description available.' },
    { id: 'notes',   title: 'Scent Notes & Profile', content: product.scent_notes || 'Not specified.' },
    { id: 'specs',   title: 'Specifications', content: `Family: ${product.fragrance_family || 'N/A'}<br/>Longevity: ${product.longevity || 'N/A'}<br/>SKU: ${product.sku || 'N/A'}` }
  ];

  return (
    <div className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <nav className="text-xs text-gray-400 mb-8 uppercase tracking-widest">
          <Link to="/" className="hover:text-black">Home</Link> / 
          <Link to={`/products/${product.category_slug}`} className="hover:text-black mx-1">{product.category_name}</Link> / 
          <span className="text-black ml-1">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
          
          {/* ── Image Gallery ───────────────────────────── */}
          <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:w-20 flex-shrink-0 hide-scrollbar pb-2 md:pb-0">
              {images.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setActiveImage(idx)}
                  className={`relative aspect-[3/4] w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-black' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  {img.image_path ? (
                    <img src={getImageUrl(img.image_path)} alt={`${product.name} ${idx+1}`} className="w-full h-full object-contain p-1" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center"><span>🛒</span></div>
                  )}
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 bg-white border border-gray-100 rounded-2xl overflow-hidden relative aspect-[4/5] product-img-wrap group cursor-zoom-in" onClick={() => setZoomModal(true)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {images[activeImage].image_path ? (
                    <img src={getImageUrl(images[activeImage].image_path)} alt={product.name} className="w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><span>🛒</span></div>
                  )}
                </motion.div>
              </AnimatePresence>
              {product.sale_price && (
                <span className="badge-sale absolute top-4 right-4 rounded-sm px-3 py-1 text-xs">Sale</span>
              )}
              <div className="absolute bottom-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2">Click to Zoom</span>
              </div>
            </div>
          </div>

          {/* ── Details & Add to Cart ───────────────────── */}
          <div className="py-2 md:py-10">
            <h1 className="font-serif text-3xl md:text-5xl mb-3">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-4">
              {rating && (
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{rating} ({product.review_count})</span>
                </div>
              )}
              {product.size && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Size:</span>
                  <span className="text-xs font-bold border border-black px-2 py-0.5 rounded-full">{product.size}</span>
                </div>
              )}
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-2xl font-semibold">Rs. {price.toLocaleString()}</span>
              {origPrice && <span className="text-gray-400 line-through text-lg mb-0.5">Rs. {origPrice.toLocaleString()}</span>}
            </div>

            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              {product.short_description || "A masterfully crafted fragrance that leaves a lasting impression."}
            </p>

            <div className="space-y-4 mb-8">
              {/* Qty & Add to Cart */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-full h-14">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-5 h-full hover:bg-gray-50 transition-colors">-</button>
                  <span className="w-8 text-center text-sm font-medium">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="px-5 h-full hover:bg-gray-50 transition-colors">+</button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 h-14 bg-black text-white text-sm tracking-widest uppercase rounded-full hover:bg-gray-800 transition-colors btn-sweep disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>
              </div>
              
              <button 
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="w-full h-14 bg-white border-2 border-black text-black text-sm font-bold tracking-widest uppercase rounded-full hover:bg-black hover:text-white transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy It Now
              </button>

              <div className="flex items-center justify-center gap-6 py-4 border border-gray-100 rounded-2xl bg-gray-50/50">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">✓ In Stock</div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-600 uppercase tracking-wide">✓ Authentic</div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-gray-100">
              {accordions.map((acc) => {
                const isOpen = openAccordions.includes(acc.id);
                return (
                  <div key={acc.id} className="border-b border-gray-100">
                    <button 
                      onClick={() => toggleAccordion(acc.id)}
                      className="w-full flex items-center justify-between py-5 text-left font-medium uppercase tracking-widest text-xs"
                    >
                      {acc.title}
                      <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div 
                            className="pb-5 text-sm text-gray-500 leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: acc.content }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── Related Products ─────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 pt-16 border-t border-gray-100">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-xl md:text-2xl font-serif">You may also like</h2>
              <Link to="/products" className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors">View Collection →</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* ── Reviews Section ────────────────────────── */}
        <section className="mt-24 pt-20 border-t border-gray-100">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Summary Sidebar */}
            <div className="lg:w-1/3 space-y-10">
              <div>
                <h2 className="text-3xl font-serif mb-2">Guest Reviews</h2>
                <p className="text-gray-400 text-sm">Join the community and share your olfactory journey.</p>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-[2rem] p-10 space-y-8 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-serif text-black leading-none mb-2">{rating || '0.0'}</span>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.round(rating || 0) ? 'text-black' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-gray-100" />
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                    Based on<br/>{product.review_count} experiences
                  </div>
                </div>

                {/* Star bars */}
                <div className="space-y-4">
                  {[5, 4, 3, 2, 1].map(star => {
                    const count = product.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
                    const percent = product.review_count > 0 ? (count / product.review_count) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-4 group">
                        <span className="text-[10px] font-black w-4 text-gray-400">{star}★</span>
                        <div className="flex-1 h-1 bg-gray-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${percent}%` }}
                            viewport={{ once: true }}
                            className="h-full bg-black" 
                          />
                        </div>
                        <span className="text-[10px] font-black text-gray-300 w-4 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Write a review form */}
                <div className="pt-8 border-t border-gray-50">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] mb-6 text-center">Share Your Thoughts</h4>
                  <ReviewForm productId={product.id} onComplete={() => productsAPI.getOne(slug).then(res => setProduct(res.data.data))} />
                </div>
              </div>
            </div>

            {/* Review List */}
            <div className="flex-1 space-y-10">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex gap-6">
                  <div className="group relative">
                    <select className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer pr-4 appearance-none">
                      <option>Recent First</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                    </select>
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[8px] pointer-events-none">▼</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Showing {product.reviews?.length || 0} reviews</span>
              </div>

              <div className="grid gap-6">
                {product.reviews?.length > 0 ? product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white border border-gray-50 rounded-3xl p-8 hover:border-black/10 transition-all duration-500">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold font-serif">
                          {rev.reviewer_name?.charAt(0) || 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm tracking-tight">{rev.reviewer_name}</h4>
                          <div className="flex gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-[10px] ${i < rev.rating ? 'text-black' : 'text-gray-200'}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        {new Date(rev.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    {rev.title && <h5 className="font-bold text-sm mb-2">{rev.title}</h5>}
                    <p className="text-gray-500 leading-relaxed text-sm italic mb-3">"{rev.body || rev.comment}"</p>
                    
                    {(() => {
                      try {
                        const imgs = typeof rev.images === 'string' ? JSON.parse(rev.images) : rev.images;
                        if (Array.isArray(imgs) && imgs.length > 0) {
                          return (
                            <div className="flex gap-2 flex-wrap mt-3">
                              {imgs.map((path, idx) => (
                                <a key={idx} href={path} target="_blank" rel="noreferrer">
                                  <img 
                                    src={path} 
                                    alt="Review attachment" 
                                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 hover:opacity-85 transition-opacity" 
                                  />
                                </a>
                              ))}
                            </div>
                          );
                        }
                      } catch (e) {}
                      return null;
                    })()}
                  </div>
                )) : (
                  <div className="text-center py-24 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100">
                    <div className="text-4xl mb-4 opacity-20">✉</div>
                    <p className="text-gray-400 text-xs font-black uppercase tracking-widest">Awaiting the first note.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {zoomModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10"
            onClick={() => setZoomModal(false)}
          >
            <button className="absolute top-8 right-8 w-12 h-12 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-[110]">
              <span className="text-2xl">×</span>
            </button>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full h-full flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <img 
                src={getImageUrl(images[activeImage].image_path)} 
                alt={product.name} 
                className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewForm({ productId, onComplete }) {
  const [rating, setRating] = useState(5);
  const [name, setName]     = useState('');
  const [body, setBody]     = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedImages.length + files.length > 4) {
      toast.error('You can upload up to 4 images only.');
      return;
    }

    setUploading(true);
    const uploadedUrls = [...selectedImages];
    try {
      const { uploadAPI } = await import('../services/api');
      for (const file of files) {
        const res = await uploadAPI.upload(file);
        if (res.data?.data?.url) {
          uploadedUrls.push(res.data.data.url);
        }
      }
      setSelectedImages(uploadedUrls);
    } catch (err) {
      toast.error('Failed to upload images.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !body) return toast.error('Please fill in all fields.');
    
    setSubmitting(true);
    try {
      const { reviewsAPI } = await import('../services/api');
      await reviewsAPI.create({ 
        product_id: productId, 
        rating, 
        reviewer_name: name, 
        body,
        images: selectedImages
      });
      toast.success('Thank you! Review submitted for approval.', {
        style: { borderRadius: '50px', background: '#0a0a0a', color: '#fff', fontSize: '12px' }
      });
      setName('');
      setBody('');
      setSelectedImages([]);
      if (onComplete) onComplete();
    } catch (err) {
      toast.error('Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left">
      <div className="flex justify-center gap-3 mb-6">
        {[1, 2, 3, 4, 5].map(s => (
          <button 
            key={s} 
            type="button"
            onClick={() => setRating(s)}
            className={`text-3xl transition-all transform hover:scale-110 ${s <= rating ? 'text-black' : 'text-gray-200 hover:text-gray-400'}`}
          >
            {s <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      
      <div className="space-y-4">
        <input 
          placeholder="Your Name" 
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full h-12 px-5 bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-2xl outline-none text-xs font-bold uppercase tracking-widest transition-all"
        />
        <textarea 
          placeholder="Your Experience..." 
          rows="4"
          value={body}
          onChange={e => setBody(e.target.value)}
          className="w-full p-5 bg-gray-50 border border-transparent focus:border-black focus:bg-white rounded-[2rem] outline-none text-sm leading-relaxed transition-all resize-none"
        />
      </div>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {selectedImages.map((url, idx) => (
            <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-100 group">
              <img src={url} alt="review preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Image File Input */}
      {selectedImages.length < 4 && (
        <div>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-1">
                {uploading ? 'Uploading...' : 'Add Images (Max 4)'}
              </p>
              <p className="text-[9px] text-gray-300">JPEG, PNG, WebP or GIF</p>
            </div>
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              disabled={uploading}
              onChange={handleImageChange}
              className="hidden" 
            />
          </label>
        </div>
      )}

      <button 
        type="submit"
        disabled={submitting || uploading}
        className="w-full h-14 bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-gray-800 transition-all disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Post Review'}
      </button>
    </form>
  );
}
