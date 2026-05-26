import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { ShoppingBag, Star } from 'lucide-react';
import useCartStore from '../stores/cartStore';
import useWishlistStore from '../stores/wishlistStore';
import { getImageUrl } from '../utils/image';
import toast from 'react-hot-toast';

export default function ProductCard({ product, index = 0 }) {
  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();

  const isFavorite = isInWishlist(product.id);

  const price      = Number(product.sale_price ?? product.price);
  const origPrice  = product.sale_price ? Number(product.price) : null;
  const onSale     = !!product.sale_price;
  const primaryImg = product.images?.find(i => i.is_primary)?.image_path
                  || product.images?.[0]?.image_path
                  || product.primary_image;
  const rating     = product.avg_rating ? Number(product.avg_rating).toFixed(1) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    openCart();
    toast.success(`${product.name} added to cart!`, {
      style: { borderRadius: '50px', background: '#0a0a0a', color: '#fff', fontSize: '13px' },
      iconTheme: { primary: '#fff', secondary: '#0a0a0a' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link to={`/product/${product.slug}`} className="group block">
        {/* Image container */}
        <div className="relative product-img-wrap bg-white rounded-sm aspect-[3/4] mb-3 overflow-hidden border border-gray-100">
          {primaryImg ? (
            <img
              src={getImageUrl(primaryImg)}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-300">IMAGE</span>
            </div>
          )}

          {/* Sale badge */}
          {onSale && (
            <span className="badge-sale absolute top-3 right-3 rounded-sm">Sale</span>
          )}

          {/* Wishlist toggle */}
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleItem(product); }}
            className={`absolute top-3 left-3 w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 ${
              isFavorite ? 'bg-black text-white' : 'bg-white/80 text-black hover:bg-black hover:text-white'
            }`}
          >
            <span className="text-xs">{isFavorite ? '♥' : '♡'}</span>
          </button>

          {/* Quick add button — appears on hover */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-black text-white text-xs tracking-widest uppercase rounded-full flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors"
            >
              <span>+</span>
              Quick Add
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">{product.category_name}</p>
          <h3 className="text-sm font-medium leading-snug mb-1 group-hover:underline underline-offset-2 transition-all">
            {product.name}
          </h3>

          {/* Rating */}
          {rating && (
            <div className="flex items-center gap-1 mb-1">
              <span className="text-yellow-400">★</span>
              <span className="text-xs text-gray-500">{rating} ({product.review_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Rs. {price.toLocaleString()}</span>
            {origPrice && (
              <span className="text-xs text-gray-400 line-through">Rs. {origPrice.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
