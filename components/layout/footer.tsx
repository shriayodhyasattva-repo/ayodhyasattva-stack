"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FOOTER_LINKS, CONTACT_INFO, STORE_NAME, STORE_DESCRIPTION } from "@/lib/constants";

export default function Footer() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#FAF8F3] border-t border-border mt-auto">
      
      {/* Reassurance Badges */}
      <div className="border-b border-border bg-[#F5EFE4]/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-gold/30 text-gold shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Sacred Packaged Shipping</h4>
                <p className="text-xs text-muted-foreground">Directly shipped from the holy land of Ayodhya with safe protective layers.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-gold/30 text-gold shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">Hassle-Free Exchange</h4>
                <p className="text-xs text-muted-foreground">Complete peace of mind return policies for all transit damaged goods.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-soft-gold/30 text-gold shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">100% Genuine Crafts</h4>
                <p className="text-xs text-muted-foreground">Artisanal products certified for material authenticity and fair trade wages.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand Info & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <Link href="/" className="font-serif text-2xl font-bold tracking-wide text-gold">
                🛕 {STORE_NAME}
              </Link>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {STORE_DESCRIPTION}. Connecting devotees worldwide to the heritage, spirituality, and artistic brilliance of Ayodhya.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground tracking-wide">Receive Sacred Updates</h4>
              <p className="text-xs text-muted-foreground">Subscribe to receive details on upcoming spiritual collections, festivals, and stories.</p>
              {subscribed ? (
                <div className="text-sm text-success font-medium bg-success/5 border border-success/15 px-3 py-2 rounded-lg inline-block">
                  Thank you! You are now subscribed.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="h-9 bg-background/50 text-xs rounded-lg focus-visible:border-gold"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button type="submit" variant="default" size="sm" className="h-9 gap-1 font-medium">
                    Subscribe <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Shop Collections</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Devotee Care</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-foreground tracking-wide uppercase">Our Temple Store</h4>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <MapPin className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                <span>{CONTACT_INFO.address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Phone className="h-4.5 w-4.5 text-gold shrink-0" />
                <span>{CONTACT_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <Mail className="h-4.5 w-4.5 text-gold shrink-0" />
                <span>{CONTACT_INFO.email}</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <Clock className="h-4.5 w-4.5 text-gold shrink-0 mt-0.5" />
                <span>{CONTACT_INFO.hours}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-12 border-t border-border/60 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {STORE_NAME}. Handcrafted in India. All spiritual rights reserved.
            </p>
            
            {/* Accepted Payments Mock badges */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mr-1">Secured By:</span>
              <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded text-[10px] font-semibold text-foreground">
                💳 Razorpay
              </div>
              <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded text-[10px] font-semibold text-foreground">
                📱 UPI Secure
              </div>
              <div className="flex items-center gap-2 bg-background border border-border px-2 py-1 rounded text-[10px] font-semibold text-foreground">
                🔒 SSL Encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
