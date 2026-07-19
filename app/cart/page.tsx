"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Image as ImageIcon } from "lucide-react";

export default function CartPage() {
  const { cart, updateQuantity, removeItem, cartTotal, cartCount, clearCart, isInitialized } = useCart();

  if (!isInitialized) {
    return (
      <div className="bg-[#FAF8F3]/50 min-h-screen py-16 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gold border-t-transparent mx-auto" />
          <p className="text-xs text-muted-foreground">Preparing your sacred cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF8F3]/50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">
          Your Sacred Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-background rounded-2xl border border-border p-12 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-4">
            <span className="text-5xl">🪔</span>
            <h2 className="font-serif text-xl font-bold text-foreground">Your Cart is Empty</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Add products from our handpicked spiritual and heritage collections to begin.
            </p>
            <Link href="/products" className="pt-2">
              <Button className="gap-2">
                Browse Collections <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
            
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border/50 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-foreground">Items in Cart ({cartCount})</h3>
                  <button
                    onClick={clearCart}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors font-medium"
                  >
                    Clear All Items
                  </button>
                </div>
                <div className="divide-y divide-border/40 px-6">
                  {cart.map((item, idx) => (
                    <div key={`${item.product.id}-${idx}`} className="py-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                      {/* Left: Product Image & Details */}
                      <div className="flex gap-4 items-center">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                          {item.product.images?.[0]?.src ? (
                            <img
                              src={item.product.images[0].src}
                              alt={item.product.images[0].alt || item.product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted/80 text-muted-foreground">
                              <ImageIcon className="h-6 w-6 opacity-40" />
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-foreground hover:text-gold transition-colors">
                            <Link href={`/product/${item.product.slug}`}>{item.product.name}</Link>
                          </h4>
                          {item.product.categories && item.product.categories.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">{item.product.categories[0]?.name}</p>
                          )}
                          {item.selectedAttributes && item.selectedAttributes.length > 0 && (
                            <div className="flex gap-2 mt-1">
                              {item.selectedAttributes.map((attr) => (
                                <span key={attr.name} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                                  {attr.name}: {attr.option}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Quantity controls & total price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10">
                        {/* Qty Controls */}
                        <div className="flex items-center border border-border rounded-lg bg-background">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariationId, item.key)}
                            className="p-1.5 text-muted-foreground hover:text-gold"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-xs font-semibold text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariationId, item.key)}
                            className="p-1.5 text-muted-foreground hover:text-gold"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Price & Trash */}
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-bold text-gold">
                            ₹{(parseFloat(item.product.price) * item.quantity).toLocaleString("en-IN")}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id, item.selectedVariationId, item.key)}
                            className="text-muted-foreground/65 hover:text-destructive transition-colors p-1"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Summary Card */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-background rounded-xl border border-border p-6 space-y-6">
                <h3 className="text-sm font-bold text-foreground border-b border-border/40 pb-3">Order Summary</h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="text-foreground font-semibold">₹{cartTotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-success font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Estimated Tax (GST)</span>
                    <span className="text-foreground font-semibold">Calculated at Checkout</span>
                  </div>
                </div>

                <div className="border-t border-border/40 pt-4 flex justify-between items-center text-sm font-bold text-foreground">
                  <span>Estimated Total</span>
                  <span className="text-gold text-lg">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="space-y-3">
                  <Link href="/checkout" className="w-full block">
                    <Button className="w-full h-11 text-sm font-semibold shadow-sm gap-2">
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/products" className="w-full block">
                    <Button variant="outline" className="w-full h-11 text-xs">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Guarantees */}
              <div className="bg-background rounded-xl border border-border p-4 space-y-3">
                <div className="flex gap-2.5 items-start text-xs text-muted-foreground leading-tight">
                  <Truck className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                  <span>Free shipping to all zip codes across India. Packed in triple-cushion boxes.</span>
                </div>
                <div className="flex gap-2.5 items-start text-xs text-muted-foreground leading-tight">
                  <ShieldCheck className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                  <span>Verified Secure Checkout using UPI or Cards. Protected by 256-bit encryption.</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
