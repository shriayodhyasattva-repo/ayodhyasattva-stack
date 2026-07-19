"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { ChevronRight, ShieldCheck, Tag, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: items, cartTotal, clearCart, isMounted, isInitialized } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  // Default flat fee shipping cost if not free shipping
  const [shippingCost, setShippingCost] = useState(99);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    if (isInitialized && items.length === 0) {
      router.push("/cart");
    }
  }, [items, router, isInitialized]);

  if (!isInitialized || items.length === 0) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: cartTotal }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      setDiscount(parseFloat(data.coupon.discount_amount));
      if (data.coupon.free_shipping) setShippingCost(0);
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      setDiscount(0);
      toast.error(error.message || "Invalid coupon code");
    }
  };

  const handlePayment = async () => {
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.address || !formData.phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    
    try {
      const finalTotal = cartTotal - discount + shippingCost;
      
      // 1. Create WooCommerce Order
      const orderPayload = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethod === "razorpay" ? "Credit Card / UPI / NetBanking" : "Cash on Delivery",
        set_paid: false,
        status: "pending",
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.pincode,
          country: "IN",
          email: formData.email,
          phone: formData.phone
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.pincode,
          country: "IN",
        },
        line_items: items.map(item => ({
          product_id: item.product.id,
          variation_id: item.selectedVariationId,
          quantity: item.quantity,
        })),
        coupon_lines: discount > 0 ? [{ code: couponCode }] : []
      };

      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");
      
      const wcOrder = orderData.order;

      // 2. Handle Payment
      if (paymentMethod === "cod") {
        toast.success("Order placed successfully!");
        clearCart();
        router.push(`/account/orders/${wcOrder.id}`);
        return;
      }

      // Razorpay Flow
      const rzpRes = await fetch("/api/payment/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          amount: finalTotal,
          receipt: `rcptid_${wcOrder.id}`
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || "Failed to initialize payment");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Ayodhya Store",
        description: `Order #${wcOrder.number}`,
        image: "/logo.png",
        order_id: rzpData.id,
        handler: async function (response: any) {
          try {
            // Verify payment signature
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                wc_order_id: wcOrder.id
              })
            });

            if (!verifyRes.ok) throw new Error("Payment verification failed");

            toast.success("Payment successful!");
            clearCart();
            router.push(`/account/orders/${wcOrder.id}`);
          } catch (err: any) {
            toast.error("Payment verification failed", { description: "Please contact support if amount was deducted." });
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#B8860B" // Gold
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error("Payment failed", { description: response.error.description });
      });
      rzp.open();

    } catch (error: any) {
      toast.error("Checkout Failed", { description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const finalAmount = cartTotal - discount + shippingCost;

  return (
    <div className="bg-[#FAF8F3] min-h-screen pt-24 pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <nav className="flex text-sm text-muted-foreground mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link href="/cart" className="hover:text-gold transition-colors">Cart</Link></li>
            <li><ChevronRight className="h-4 w-4" /></li>
            <li className="text-foreground font-medium" aria-current="page">Checkout</li>
          </ol>
        </nav>

        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          
          {/* Left Column (Forms) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Contact Info */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Contact Information</h2>
                {!user && (
                  <p className="text-sm text-muted-foreground">
                    Already have an account? <Link href="/auth/login" className="text-gold hover:underline">Log in</Link>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name *</label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none">Email Address *</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="phone" className="text-sm font-medium leading-none">Phone Number *</label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                </div>
              </div>
            </section>

            {/* Shipping Address */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium leading-none">Street Address *</label>
                  <Input id="address" name="address" placeholder="House number and street name" value={formData.address} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-medium leading-none">City *</label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="state" className="text-sm font-medium leading-none">State *</label>
                  <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="pincode" className="text-sm font-medium leading-none">PIN Code *</label>
                  <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-4">Payment Method</h2>
              <div className="bg-white rounded-lg border border-border p-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 space-y-0">
                    <input 
                      type="radio" 
                      id="razorpay" 
                      name="paymentMethod" 
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={() => setPaymentMethod("razorpay")}
                      className="h-4 w-4 text-gold border-border focus:ring-gold"
                    />
                    <label htmlFor="razorpay" className="text-sm font-medium leading-none cursor-pointer">
                      Credit Card / UPI / NetBanking
                    </label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <input 
                      type="radio" 
                      id="cod" 
                      name="paymentMethod" 
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="h-4 w-4 text-gold border-border focus:ring-gold"
                    />
                    <label htmlFor="cod" className="text-sm font-medium leading-none cursor-pointer">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                <span>Your payment information is processed securely.</span>
              </div>
            </section>
            
          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-xl border border-border shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-foreground mb-6">Order Summary</h2>
              
              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border">
                      <img
                        src={item.product.images?.[0]?.src || "/placeholder.jpg"}
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="flex justify-between text-sm font-medium text-foreground">
                        <h3 className="line-clamp-2 pr-4">{item.product.name}</h3>
                        <p className="ml-4 whitespace-nowrap">₹{parseFloat(item.product.price).toLocaleString("en-IN")}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-b border-border/50 py-4 mb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Discount code" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="pl-9 h-10"
                    />
                  </div>
                  <Button variant="outline" onClick={handleApplyCoupon} disabled={!couponCode}>Apply</Button>
                </div>
                {discount > 0 && (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Discount applied: -₹{discount.toLocaleString("en-IN")}
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <p>Subtotal</p>
                  <p className="font-medium text-foreground">₹{cartTotal.toLocaleString("en-IN")}</p>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <p>Discount</p>
                    <p className="font-medium">-₹{discount.toLocaleString("en-IN")}</p>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <p>Shipping</p>
                  <p className="font-medium text-foreground">{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</p>
                </div>
                <div className="flex justify-between pt-3 border-t border-border/50">
                  <p className="text-base font-bold text-foreground">Total</p>
                  <p className="text-lg font-bold text-foreground">₹{finalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={handlePayment} 
                  disabled={loading} 
                  className="w-full h-12 text-base shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{paymentMethod === 'cod' ? 'Place Order' : 'Pay Now'}</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
