import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import { Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef(null);
  const debouncedQuery        = useDebounce(query, 350);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    else { setQuery(''); setResults([]); }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults([]); return; }
    setLoading(true);
    productsAPI.getAll({ search: debouncedQuery, limit: 8 })
      .then(res => setResults(res.data.data || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const suggestions = ['Vice Aura', 'Florezia', 'Lunarelle', 'Intense Prime'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] bg-white rounded-b-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <span className="text-gray-400">SRCH</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fragrances..."
                className="flex-1 text-sm outline-none placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-xs text-gray-400 hover:text-black transition-colors">Clear</button>
              )}
              <button onClick={onClose} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">
                <span>X</span>
              </button>
            </div>

            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
              {/* Suggestions chips */}
              {!query && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestions.map((s) => (
                    <button key={s} onClick={() => setQuery(s)}
                      className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading skeleton */}
              {loading && (
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 items-center">
                      <div className="skeleton w-14 h-16 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-3 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/3 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Results */}
              {!loading && results.length > 0 && (
                <>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3">Products</p>
                  <div className="space-y-3">
                    {results.map((p) => {
                      const img = p.images?.[0]?.image_path;
                      const price = p.sale_price ?? p.price;
                      return (
                        <Link key={p.id} to={`/product/${p.slug}`} onClick={onClose}
                          className="flex gap-3 items-center group hover:bg-gray-50 rounded-lg p-2 -mx-2 transition-colors">
                          <div className="w-14 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {img && <img src={img} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{p.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-sm font-semibold">Rs. {Number(price).toLocaleString()}</span>
                              {p.sale_price && <span className="text-xs text-gray-400 line-through">Rs. {Number(p.price).toLocaleString()}</span>}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <Link to={`/products?search=${query}`} onClick={onClose}
                    className="mt-4 block w-full text-center py-2.5 bg-black text-white text-xs rounded-full hover:bg-gray-800 transition-colors">
                    View all results
                  </Link>
                </>
              )}

              {/* No results */}
              {!loading && query && results.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No fragrances found for "{query}"</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
