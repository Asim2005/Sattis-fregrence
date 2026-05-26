import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      openCart:   () => set({ isOpen: true }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.id === product.id
                ? { ...i, quantity: i.quantity + quantity }
                : i
            ),
          });
        } else {
          // Spread ALL product fields so shipping_fee is included
          set({ items: [...items, { ...product, quantity }] });
        }
      },

      removeItem: (productId) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== productId) })),

      updateQty: (productId, quantity) => {
        if (quantity < 1) return get().removeItem(productId);
        set((s) => ({
          items: s.items.map((i) =>
            i.id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'satish_cart_v4',
      storage: createJSONStorage(() => localStorage),
      // Only save items array — keeps it clean, no hydration issues
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// ─── Plain helper functions (not in store state) ──────────────────────────────
// These are reliable because they don't use Zustand's broken getter pattern.

export const getCartSubtotal = (items) =>
  items.reduce(
    (sum, i) => sum + (Number(i.sale_price) || Number(i.price)) * i.quantity,
    0
  );

export const getCartShipping = (items) =>
  items.reduce(
    (sum, i) => sum + parseFloat(i.shipping_fee || 0) * i.quantity,
    0
  );

export const getCartItemCount = (items) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export default useCartStore;
