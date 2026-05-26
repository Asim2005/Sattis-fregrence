import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const { items } = get();
        if (!items.find(i => i.id === product.id)) {
          set({ items: [...items, product] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter(i => i.id !== id) });
      },

      isInWishlist: (id) => {
        return get().items.some(i => i.id === id);
      },

      toggleItem: (product) => {
        if (get().isInWishlist(product.id)) {
          get().removeItem(product.id);
        } else {
          get().addItem(product);
        }
      }
    }),
    { name: 'satish-wishlist' }
  )
);

export default useWishlistStore;
