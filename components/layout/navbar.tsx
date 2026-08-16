"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Sparkles, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Navbar({ categories }: { categories: {name: string, slug: string}[] }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  
  const { cartCount, cart: items } = useCart();
  const { user, isLoggedIn } = useAuth();
  
  const itemCount = cartCount;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Products", href: "/products" },
    ...categories.map(c => ({ name: c.name, href: `/products?category=${c.slug}` })),
  ];

  const checkIsActive = (href: string) => {
    if (href === "/products") {
      return pathname === "/products" && !currentCategory;
    }
    if (href.startsWith("/products?category=")) {
      const slug = href.split("=")[1];
      return pathname === "/products" && currentCategory === slug;
    }
    return pathname === href;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              className="text-foreground hover:text-gold transition-colors"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-8 w-8 overflow-hidden group-hover:scale-110 transition-transform">
                <Image 
                  src="/logo.png" 
                  alt="Ayodhya Sattva Logo" 
                  fill 
                  className="object-contain" 
                  priority 
                />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Ayodhya Sattva
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-gold ${
                  checkIsActive(link.href) ? "text-gold" : "text-foreground/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 sm:gap-6 flex-1 md:flex-none justify-end">
            <button className="text-foreground hover:text-gold transition-colors hidden sm:block">
              <span className="sr-only">Search</span>
              <Search className="h-5 w-5" />
            </button>
            
            <Link href={isLoggedIn ? "/account" : "/auth/login"} className="text-foreground hover:text-gold transition-colors hidden sm:block">
              <span className="sr-only">Account</span>
              <User className={`h-5 w-5 ${isLoggedIn ? "text-gold" : ""}`} />
            </Link>

            <Link href="/cart" className="group flex items-center gap-1.5 text-foreground hover:text-gold transition-colors">
              <div className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      {/* Mobile Menu Panel */}
      <div 
        className={`fixed top-0 left-0 h-full w-[85%] max-w-sm bg-background border-r border-border z-[70] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-border/40">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
            <div className="relative h-7 w-7 overflow-hidden">
              <Image src="/logo.png" alt="Ayodhya Sattva Logo" fill className="object-contain" />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-foreground">
              Ayodhya Sattva
            </span>
          </Link>
          <button 
            onClick={() => setMobileMenuOpen(false)} 
            className="text-muted-foreground hover:text-gold transition-colors rounded-full p-1 bg-muted"
          >
            <span className="sr-only">Close menu</span>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-2">Navigation</div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block rounded-xl px-4 py-3.5 text-lg font-serif transition-all ${
                  checkIsActive(link.href)
                    ? "bg-gold/10 text-gold font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/40">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4 px-2">Account & Settings</div>
            <div className="space-y-2">
              <Link 
                href={isLoggedIn ? "/account" : "/auth/login"} 
                className="flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:text-gold rounded-xl hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-gold/30 text-gold">
                  <User className="h-4 w-4" />
                </div>
                {isLoggedIn ? "My Account" : "Sign In / Register"}
              </Link>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-foreground hover:text-gold rounded-xl hover:bg-muted transition-colors text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-soft-gold/30 text-gold">
                  <Search className="h-4 w-4" />
                </div>
                Search Store
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
