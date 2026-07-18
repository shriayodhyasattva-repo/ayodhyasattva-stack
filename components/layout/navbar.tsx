"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Sparkles, User } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<{name: string, slug: string}[]>([]);
  const pathname = usePathname();
  
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

  // Fetch dynamic categories for navigation
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories.slice(0, 5)); // show top 5
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCategories();
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Products", href: "/products" },
    ...categories.map(c => ({ name: c.name, href: `/products?category=${c.slug}` })),
  ];

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
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex justify-center md:justify-start flex-1 md:flex-none">
            <Link href="/" className="flex items-center gap-2 group">
              <Sparkles className="h-6 w-6 text-gold group-hover:scale-110 transition-transform" />
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                Ayodhya Store
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
                  pathname === link.href ? "text-gold" : "text-foreground/80"
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border mt-3 absolute w-full shadow-lg">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-base font-medium ${
                  pathname === link.href
                    ? "bg-soft-gold text-gold"
                    : "text-foreground hover:bg-muted/10"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-border mt-4 pt-4 pb-2 px-3 flex items-center justify-between">
              <Link 
                href={isLoggedIn ? "/account" : "/auth/login"} 
                className="flex items-center gap-2 text-base font-medium text-foreground hover:text-gold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                {isLoggedIn ? "My Account" : "Log In"}
              </Link>
              <button className="flex items-center gap-2 text-base font-medium text-foreground hover:text-gold">
                <Search className="h-5 w-5" />
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
