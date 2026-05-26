import { motion, AnimatePresence } from 'framer-motion';
// import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import useCartStore from '../stores/cartStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty } = useCartStore();
  const subtotal = items.reduce((sum, i) => sum + (i.sale_price ?? i.price) * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[100] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span>🛒</span>
                <span className="font-medium text-sm tracking-wide">
                  Your Cart {itemCount > 0 && <span className="text-gray-400">({itemCount})</span>}
                </span>
              </div>
              <button onClick={closeCart} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                <span>X</span>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                  <span className="text-4xl">🛒</span>
                  <div>
                    <p className="font-serif text-lg mb-1">Your cart is empty</p>
                    <p className="text-sm text-gray-400">Have an account?{' '}
                      <Link to="/login" onClick={closeCart} className="underline hover:text-black">Log in</Link>
                      {' '}to check out faster.
                    </p>
                  </div>
                  <button onClick={closeCart} className="mt-2 px-8 py-3 bg-black text-white text-sm rounded-full hover:bg-gray-800 transition-colors">
                    Continue shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => {
                    const price = item.sale_price ?? item.price;
                    const primaryImg = item.images?.find(i => i.is_primary)?.image_path || item.images?.[0]?.image_path;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 30 }}
                        className="flex gap-4"
                      >
                        {/* Image */}
                        <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {primaryImg ? (
                            <img src={primaryImg} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100" />
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-400 mb-2">{item.category_name}</p>
                          <p className="text-sm font-semibold">Rs. {(price * item.quantity).toLocaleString()}</p>

                          {/* Qty controls */}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                              <button onClick={() => updateQty(item.id, item.quantity - 1)} className="px-3 py-1 text-sm hover:bg-gray-50 transition-colors">
                                 -
                              </button>
                              <span className="px-2 text-sm min-w-[2rem] text-center">{item.quantity}</span>
                              <button onClick={() => updateQty(item.id, item.quantity + 1)} className="px-3 py-1 text-sm hover:bg-gray-50 transition-colors">
                                 +
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                               <span>🗑️</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="font-semibold">Rs. {subtotal.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400 mb-4 text-center">Shipping & taxes calculated at checkout</p>
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="block w-full text-center py-3.5 bg-black text-white text-sm rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button onClick={closeCart} className="mt-2 block w-full text-center py-3 text-sm text-gray-500 hover:text-black transition-colors">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
