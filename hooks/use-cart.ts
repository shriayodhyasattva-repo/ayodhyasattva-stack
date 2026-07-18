import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart-store";

export function useCart() {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return {
    cart: mounted ? store.cart : [],
    wishlist: mounted ? store.wishlist : [],
    cartOpen: store.cartOpen,
    setCartOpen: store.setCartOpen,
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleWishlist: store.toggleWishlist,
    isInWishlist: store.isInWishlist,
    cartTotal: mounted ? store.getCartTotal() : 0,
    cartCount: mounted ? store.getCartCount() : 0,
    isMounted: mounted,
  };
}
