import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem } from "@/types/product";

interface CartState {
  cart: CartItem[];
  wishlist: Product[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addItem: (product: Product, quantity?: number, selectedVariationId?: number, selectedAttributes?: { name: string; option: string }[]) => void;
  removeItem: (productId: number, selectedVariationId?: number) => void;
  updateQuantity: (productId: number, quantity: number, selectedVariationId?: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: number) => boolean;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      cartOpen: false,
      setCartOpen: (open) => set({ cartOpen: open }),
      
      addItem: (product, quantity = 1, selectedVariationId, selectedAttributes) => {
        const cart = get().cart;
        const existingIndex = cart.findIndex(
          (item) => 
            item.product.id === product.id && 
            item.selectedVariationId === selectedVariationId
        );

        if (existingIndex > -1) {
          const updatedCart = [...cart];
          updatedCart[existingIndex].quantity += quantity;
          set({ cart: updatedCart });
        } else {
          set({
            cart: [...cart, { product, quantity, selectedVariationId, selectedAttributes }]
          });
        }
      },

      removeItem: (productId, selectedVariationId) => {
        const cart = get().cart;
        const updatedCart = cart.filter(
          (item) => 
            !(item.product.id === productId && item.selectedVariationId === selectedVariationId)
        );
        set({ cart: updatedCart });
      },

      updateQuantity: (productId, quantity, selectedVariationId) => {
        if (quantity <= 0) {
          get().removeItem(productId, selectedVariationId);
          return;
        }
        
        const cart = get().cart;
        const updatedCart = cart.map((item) => {
          if (item.product.id === productId && item.selectedVariationId === selectedVariationId) {
            return { ...item, quantity };
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      clearCart: () => set({ cart: [] }),

      toggleWishlist: (product) => {
        const wishlist = get().wishlist;
        const exists = wishlist.some((item) => item.id === product.id);
        
        if (exists) {
          set({ wishlist: wishlist.filter((item) => item.id !== product.id) });
        } else {
          set({ wishlist: [...wishlist, product] });
        }
      },

      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },

      getCartTotal: () => {
        return get().cart.reduce((total, item) => {
          const price = parseFloat(item.product.price || "0");
          return total + price * item.quantity;
        }, 0);
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ayodhya-store-cart",
      // Exclude cartOpen state from persistence
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
      }),
    }
  )
);
