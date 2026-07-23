"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";
import { ChevronRight, ShieldCheck, Tag, ArrowRight, Check, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart: items, cartTotal, clearCart, isMounted, isInitialized, fetchCart } = useCart();
  const { user, refreshSession } = useAuth();
  
  const [authMode, setAuthMode] = useState<"guest" | "login" | "register">("guest");
  const [authLoading, setAuthLoading] = useState(false);
  const [contactCompleted, setContactCompleted] = useState(false);
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [countriesList, setCountriesList] = useState<{code: string, name: string}[]>([]);
  const [statesList, setStatesList] = useState<{code: string, name: string}[]>([]);
  const [pinError, setPinError] = useState("");

  useEffect(() => {
    // Fetch available payment gateways
    fetch("/api/checkout/gateways")
      .then(res => res.json())
      .then(data => {
        if (data.gateways && data.gateways.length > 0) {
          setGateways(data.gateways);
          setPaymentMethod(data.gateways[0].id);
        }
      })
      .catch(err => console.error("Failed to load gateways", err));

    // Fetch countries and default states for IN
    fetch("/api/locations?countries=true&country=IN")
      .then(res => res.json())
      .then(data => {
        if (data.countries) setCountriesList(data.countries);
        if (data.states) setStatesList(data.states);
      })
      .catch(err => console.error("Failed to load locations", err));
  }, []);

  const [couponCode, setCouponCode] = useState("");
  // Let WooCommerce handle shipping and discount natively on the backend!
  // We no longer calculate them on the frontend.

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "IN",
    state: "",
    pincode: "",
  });

  // Pre-fill user data and address if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
      }));

      // Fetch full profile to get addresses
      fetch("/api/customer")
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.customer) {
            const customer = data.customer;
            // Prefer billing address for checkout if available, otherwise shipping
            const address = customer.billing?.address_1 ? customer.billing : customer.shipping;
            if (address) {
              setFormData(prev => ({
                ...prev,
                phone: address.phone || prev.phone,
                address: address.address_1 || prev.address,
                city: address.city || prev.city,
                country: address.country || prev.country,
                state: address.state || prev.state,
                pincode: address.postcode || prev.pincode,
              }));
              
              if (address.phone) {
                setContactCompleted(true);
              }
            }
          }
        })
        .catch(err => console.error("Failed to load customer profile", err));
    }
  }, [user]);

  useEffect(() => {
    if (isInitialized && items.length === 0) {
      router.push("/cart");
    }
  }, [items, router, isInitialized]);

  if (!isInitialized || items.length === 0) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    if (name === "country") {
      // Fetch states for the new country
      fetch(`/api/locations?country=${value}`)
        .then(res => res.json())
        .then(data => {
          setStatesList(data.states || []);
          setFormData(prev => ({ ...prev, state: "" })); // Reset state
        })
        .catch(err => console.error("Failed to load states", err));
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      const res = await fetch("/api/cart/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error);
      }
      
      // Store API automatically recalculates totals when coupon is applied
      await fetchCart(); 
      toast.success("Coupon applied successfully!");
    } catch (error: any) {
      toast.error(error.message || "Invalid coupon code");
    }
  };

  const handleInlineAuth = async () => {
    if (authMode === "guest") {
      if (!formData.firstName || !formData.email || !formData.phone) {
        toast.error("Please provide name, email, and phone to continue.");
        return;
      }
      setContactCompleted(true);
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "login") {
        if (!formData.email || !password) {
          toast.error("Please enter email and password");
          return;
        }
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: formData.email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        
        await refreshSession();
        await fetchCart();
        toast.success("Logged in successfully!");
      } else if (authMode === "register") {
        if (!formData.email || !password || !formData.firstName || !formData.lastName) {
          toast.error("Please fill in all fields");
          return;
        }
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password,
            firstName: formData.firstName,
            lastName: formData.lastName
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        
        await refreshSession();
        await fetchCart();
        toast.success("Account created successfully!");
      }
      setContactCompleted(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePayment = async () => {
    // Basic validation
    if (!formData.firstName || !formData.email || !formData.address || !formData.phone || !formData.country) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    if (statesList.length > 0 && !formData.state) {
      toast.error("Please select a state.");
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create WooCommerce Order natively via Store API
      // It handles line_items, coupons, shipping and taxes automatically based on cart session
      const orderPayload = {
        payment_method: paymentMethod,
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.pincode,
          country: formData.country,
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
          country: formData.country,
        }
      };

      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");
      
      const wcOrder = orderData.order;

      // 2. Handle Payment
      // If it's COD, BACS, Cheque, or any offline method, we just complete the order.
      // If it's Razorpay, we initialize the Razorpay flow.
      if (paymentMethod !== "razorpay") {
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
          // wcOrder.totals.total_price is passed directly.
          amount: parseFloat(wcOrder.totals?.total_price || wcOrder.total || cartTotal),
          receipt: `rcptid_${wcOrder.id}`
        }),
      });

      const rzpData = await rzpRes.json();
      if (!rzpRes.ok) throw new Error(rzpData.error || "Failed to initialize payment");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "Ayodhya Sattva",
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

  const finalAmount = cartTotal;

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
          Secure Your Sacred Offerings
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-12 gap-y-10">
          
          {/* Left Column (Forms) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Contact Info */}
            <section className={cn("space-y-6 rounded-xl border border-border p-6 transition-all", contactCompleted ? "bg-muted/5 border-muted" : "bg-white shadow-sm")}>
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors", contactCompleted ? "bg-green-600 text-white" : "bg-gold text-white")}>
                    {contactCompleted ? <Check className="h-3 w-3" /> : "1"}
                  </span>
                  Account & Contact
                </h2>
                {contactCompleted && !user && (
                   <Button variant="ghost" size="sm" onClick={() => setContactCompleted(false)} className="text-xs h-7">Edit</Button>
                )}
              </div>
              
              {contactCompleted ? (
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                   <div className="flex items-center gap-2">
                     <UserIcon className="h-4 w-4" />
                     <span className="font-medium text-foreground">{formData.email}</span>
                   </div>
                   <span>{formData.phone}</span>
                </div>
              ) : (
                <>
                  {!user && (
                    <div className="flex bg-muted/30 p-1 rounded-lg mb-6">
                      <button onClick={() => setAuthMode("guest")} className={cn("flex-1 text-sm py-2 rounded-md font-medium transition-colors", authMode === "guest" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>Guest Checkout</button>
                      <button onClick={() => setAuthMode("login")} className={cn("flex-1 text-sm py-2 rounded-md font-medium transition-colors", authMode === "login" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>Login</button>
                      <button onClick={() => setAuthMode("register")} className={cn("flex-1 text-sm py-2 rounded-md font-medium transition-colors", authMode === "register" ? "bg-white shadow text-foreground" : "text-muted-foreground hover:text-foreground")}>Create Account</button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {authMode !== "login" && (
                      <>
                        <div className="space-y-1.5">
                          <label htmlFor="firstName" className="text-sm font-medium leading-none">First Name *</label>
                          <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-1.5">
                          <label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name</label>
                          <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                        </div>
                      </>
                    )}
                    <div className={cn("space-y-1.5", authMode === "login" ? "sm:col-span-2" : "sm:col-span-2")}>
                      <label htmlFor="email" className="text-sm font-medium leading-none">Email Address *</label>
                      <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required disabled={!!user} />
                    </div>
                    
                    {authMode !== "login" && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="phone" className="text-sm font-medium leading-none">Phone Number *</label>
                        <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
                      </div>
                    )}

                    {authMode !== "guest" && (
                      <div className="space-y-1.5 sm:col-span-2">
                        <label htmlFor="password" className="text-sm font-medium leading-none">Password *</label>
                        <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      </div>
                    )}
                  </div>

                  <div className="pt-4">
                    <Button onClick={handleInlineAuth} disabled={authLoading} className="w-full sm:w-auto min-w-[200px]">
                      {authLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        authMode === "guest" ? "Continue to Shipping" :
                        authMode === "login" ? "Sign In & Continue" : "Create Account & Continue"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </section>

            {/* Shipping Address */}
            <section className={cn("space-y-6 rounded-xl border p-6 transition-all", !contactCompleted ? "opacity-50 pointer-events-none border-border/50 bg-muted/10 grayscale-[50%]" : "border-border bg-white shadow-sm")}>
              <div className="flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors", !contactCompleted ? "bg-muted text-muted-foreground" : "bg-gold text-white")}>2</span>
                <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="address" className="text-sm font-medium leading-none">Street Address *</label>
                  <Input id="address" name="address" placeholder="House number and street name" value={formData.address} onChange={handleInputChange} required disabled={!contactCompleted} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="city" className="text-sm font-medium leading-none">City *</label>
                  <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required disabled={!contactCompleted} />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="country" className="text-sm font-medium leading-none">Country *</label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    disabled={!contactCompleted}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select Country</option>
                    {countriesList.map(country => (
                      <option key={country.code} value={country.code}>{country.name}</option>
                    ))}
                  </select>
                </div>
                {statesList.length > 0 && (
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-sm font-medium leading-none">State *</label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                      disabled={!contactCompleted}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select State</option>
                      {statesList.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label htmlFor="pincode" className="text-sm font-medium leading-none">PIN / Zip Code *</label>
                  <Input 
                    id="pincode" 
                    name="pincode" 
                    value={formData.pincode} 
                    onChange={handleInputChange} 
                    required 
                    disabled={!contactCompleted}
                  />
                </div>
              </div>
            </section>

            {/* Payment Method */}
            <section className={cn("space-y-6 rounded-xl border p-6 transition-all", !contactCompleted ? "opacity-50 pointer-events-none border-border/50 bg-muted/10 grayscale-[50%]" : "border-border bg-white shadow-sm")}>
              <div className="flex items-center gap-2 border-b border-border/40 pb-4 mb-4">
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors", !contactCompleted ? "bg-muted text-muted-foreground" : "bg-gold text-white")}>3</span>
                <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
              </div>
              <div className="bg-white rounded-lg border border-border p-4">
                <div className="space-y-4">
                  {gateways.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">Loading payment methods...</div>
                  ) : (
                    gateways.map((gateway) => (
                      <div key={gateway.id} className="flex items-center space-x-3 space-y-0">
                        <input 
                          type="radio" 
                          id={gateway.id}
                          name="paymentMethod" 
                          value={gateway.id}
                          checked={paymentMethod === gateway.id}
                          onChange={() => setPaymentMethod(gateway.id)}
                          disabled={!contactCompleted}
                          className="h-4 w-4 text-gold border-border focus:ring-gold"
                        />
                        <label htmlFor={gateway.id} className={cn("text-sm font-medium leading-none cursor-pointer", !contactCompleted && "opacity-60")}>
                          {gateway.title}
                          {gateway.description && (
                            <p className="text-xs text-muted-foreground mt-1 font-normal leading-relaxed max-w-[90%]">
                              {gateway.description}
                            </p>
                          )}
                        </label>
                      </div>
                    ))
                  )}
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
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border relative">
                      <Image
                        src={item.product.images?.[0]?.src || "/placeholder.jpg"}
                        alt={item.product.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-center">
                      <div className="flex justify-between text-sm font-medium text-foreground">
                        <h3 className="line-clamp-2 pr-4" dangerouslySetInnerHTML={{ __html: item.product.name }} />
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
                <p className="text-[10px] text-muted-foreground mt-2">
                  Coupon discounts are automatically calculated by WooCommerce in the total.
                </p>
              </div>

              {/* Totals */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <p>Cart Total (incl. taxes/shipping/discounts)</p>
                  <p className="text-lg font-bold text-foreground">₹{finalAmount.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="mt-8">
                <Button 
                  onClick={handlePayment} 
                  disabled={loading || !contactCompleted} 
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
                {!contactCompleted && (
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Please complete the Contact & Account step to continue.
                  </p>
                )}
              </div>

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
