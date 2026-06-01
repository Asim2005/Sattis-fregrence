import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import useWishlistStore from '../stores/wishlistStore';
import ProductCard from '../components/ProductCard';
import useSEO from '../hooks/useSEO';

export default function WishlistPage() {
  useSEO({ title: 'My Wishlist', noindex: true });

  const { items } = useWishlistStore();

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-serif text-4xl md:text-5xl mb-4">Your Wishlist</h1>
            <p className="text-gray-500 uppercase tracking-widest text-xs">{items.length} Items Saved</p>
          </div>
          <Link to="/products" className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:opacity-60 transition-opacity">
            Continue Shopping
          </Link>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {items.map((item, idx) => (
              <ProductCard key={item.id} product={item} index={idx} />
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="text-4xl mb-6">♡</div>
            <h2 className="font-serif text-2xl mb-4">Your wishlist is empty</h2>
            <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">Save your favorite fragrances here to find them easily later.</p>
            <Link to="/products" className="px-10 py-4 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">
              Discover Scents
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
