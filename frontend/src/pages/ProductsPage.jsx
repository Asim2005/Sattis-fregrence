import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
// import { Filter, SlidersHorizontal } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function ProductsPage() {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search');
  const scent = searchParams.get('scent');
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    productsAPI.getAll({ category, search, limit: 100 })
      .then(res => {
        let data = res.data.data || [];
        if (scent) {
            data = data.filter(p => p.fragrance_family?.includes(scent) || p.scent_notes?.includes(scent));
        }
        setProducts(data);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, search, scent]);

  let title = 'All Products';
  if (category) title = category.charAt(0).toUpperCase() + category.slice(1);
  if (search) title = `Search: ${search}`;
  if (scent) title = `${scent} Fragrances`;

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
          <div>
            <nav className="text-xs text-gray-400 mb-2 uppercase tracking-widest">
              <span>Home</span> / <span>{title}</span>
            </nav>
            <h1 className="font-serif text-3xl md:text-5xl">{title}</h1>
            <p className="text-sm text-gray-500 mt-3">{products.length} {products.length === 1 ? 'Product' : 'Products'}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity"
            >
              FLTR Filters
            </button>
            <button className="flex items-center gap-2 text-sm font-medium hover:opacity-60 transition-opacity">
              SORT Sort By
            </button>
          </div>
        </div>

        {/* Filters Panel (Basic visual placeholder for now) */}
        {showFilters && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             exit={{ height: 0, opacity: 0 }}
             className="mb-8 p-6 bg-gray-50 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-6"
           >
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3">Price Range</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Under Rs. 2,000</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Rs. 2,000 - Rs. 4,000</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Over Rs. 4,000</label>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest mb-3">Scent Profile</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Woody</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Citrus</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Floral</label>
                </div>
              </div>
           </motion.div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i}>
                <div className="skeleton aspect-[3/4] rounded-sm mb-3" />
                <div className="skeleton h-3 w-1/3 mb-2 rounded" />
                <div className="skeleton h-4 w-3/4 mb-2 rounded" />
                <div className="skeleton h-4 w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h2 className="font-serif text-2xl mb-3">No products found</h2>
            <p className="text-gray-500 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
            <button onClick={() => window.history.back()} className="px-8 py-3 bg-black text-white rounded-full text-sm">
              Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
