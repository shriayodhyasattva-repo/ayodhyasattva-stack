import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, CartItem as OriginalCartItem } from "@/types/product";
import { toast } from "sonner";

// Extend CartItem to include the backend key
export interface CartItem extends OriginalCartItem {
  key?: string;
}

interface CartState {
  cart: CartItem[];
  wishlist: Product[];
  cartOpen: boolean;
  isSyncing: boolean;
  isInitialized: boolean;
  serverTotal: number;
  serverCurrency: string;
  setCartOpen: (open: boolean) => void;
  
  // Backend interactions
  fetchCart: () => Promise<void>;
  addItem: (product: Product, quantity?: number, selectedVariationId?: number, selectedAttributes?: { name: string; option: string }[]) => Promise<void>;
  removeItem: (productId: number, selectedVariationId?: number, key?: string) => Promise<void>;
  updateQuantity: (productId: number, quantity: number, selectedVariationId?: number, key?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  
  // Wishlist (stays local)
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
      isSyncing: false,
      isInitialized: false,
      serverTotal: 0,
      serverCurrency: "INR",
      
      setCartOpen: (open) => set({ cartOpen: open }),

      fetchCart: async () => {
        if (get().isSyncing || get().isInitialized) return;
        try {
          set({ isSyncing: true });
          const res = await fetch("/api/cart");
          if (res.ok) {
            const data = await res.json();
            get().syncWithBackend(data);
          }
        } catch (error) {
          console.error("Failed to fetch cart", error);
        } finally {
          set({ isSyncing: false, isInitialized: true });
        }
      },
      
      // Internal helper to map Store API response to our UI state
      syncWithBackend: (storeData: any) => {
        if (!storeData || !storeData.items) return;
        
        const minorUnit = storeData.totals.currency_minor_unit || 2;
        const divisor = Math.pow(10, minorUnit);
        
        const mappedCart: CartItem[] = storeData.items.map((item: any) => ({
          key: item.key,
          product: {
            id: item.id,
            name: item.name,
            price: (parseInt(item.prices.price) / divisor).toString(),
            images: item.images,
          } as Product,
          quantity: item.quantity,
          selectedVariationId: item.variation_id || undefined,
          selectedAttributes: item.variation?.map((v: any) => ({
            name: v.attribute,
            option: v.value
          })) || undefined,
        }));
        
        set({ 
          cart: mappedCart, 
          serverTotal: parseInt(storeData.totals.total_price) / divisor,
          isInitialized: true
        });
      },
      
      addItem: async (product, quantity = 1, selectedVariationId, selectedAttributes) => {
        try {
          set({ isSyncing: true });
          
          // Optimistic UI could go here, but for now we wait for backend
          const res = await fetch("/api/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, quantity, variationId: selectedVariationId, variation: selectedAttributes }),
          });
          
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          
          (get() as any).syncWithBackend(data);
          toast.success("Added to cart");
          set({ cartOpen: true });
        } catch (error: any) {
          toast.error("Failed to add to cart", { description: error.message });
        } finally {
          set({ isSyncing: false });
        }
      },

      removeItem: async (productId, selectedVariationId, key) => {
        if (!key) {
           // Fallback to finding the key if only IDs are provided
           const item = get().cart.find(i => i.product.id === productId && i.selectedVariationId === selectedVariationId);
           key = item?.key;
        }
        if (!key) return;

        try {
          set({ isSyncing: true });
          const res = await fetch("/api/cart/remove", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key }),
          });
          
          const data = await res.json();
          if (res.ok) {
            (get() as any).syncWithBackend(data);
          }
        } catch (error) {
          toast.error("Failed to remove item");
        } finally {
          set({ isSyncing: false });
        }
      },

      updateQuantity: async (productId, quantity, selectedVariationId, key) => {
        if (!key) {
           const item = get().cart.find(i => i.product.id === productId && i.selectedVariationId === selectedVariationId);
           key = item?.key;
        }
        if (!key) return;

        if (quantity <= 0) {
          get().removeItem(productId, selectedVariationId, key);
          return;
        }
        
        try {
          set({ isSyncing: true });
          const res = await fetch("/api/cart/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, quantity }),
          });
          
          const data = await res.json();
          if (res.ok) {
            (get() as any).syncWithBackend(data);
          }
        } catch (error) {
          toast.error("Failed to update quantity");
        } finally {
          set({ isSyncing: false });
        }
      },

      clearCart: async () => {
         try {
           await fetch("/api/cart/clear", { method: "POST" });
         } catch (e) {
           console.error(e);
         }
         set({ cart: [], serverTotal: 0 });
      },

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
        return get().serverTotal;
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "ayodhya-store-cart",
      // Only partialize wishlist now, cart state is fetched from server!
      partialize: (state) => ({
        wishlist: state.wishlist,
      }),
    }
  )
);
