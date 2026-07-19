import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!store.isInitialized && !store.isSyncing) {
      store.fetchCart();
    }
  }, [store.isInitialized, store.isSyncing, store.fetchCart]);

  return {
    cart: store.cart,
    wishlist: mounted ? store.wishlist : [],
    cartOpen: store.cartOpen,
    setCartOpen: store.setCartOpen,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleWishlist: store.toggleWishlist,
    isInWishlist: store.isInWishlist,
    cartTotal: store.getCartTotal(),
    cartCount: store.getCartCount(),
    isMounted: mounted,
    isInitialized: store.isInitialized,
    isSyncing: store.isSyncing,
  };
}
