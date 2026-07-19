"use client";

import React, { useEffect, useState } from "react";
import { WCCustomer, WCAddress } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ProfilePage() {
  const [customer, setCustomer] = useState<WCCustomer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [statesList, setStatesList] = useState<{code: string, name: string}[]>([]);
  const [countriesList, setCountriesList] = useState<{code: string, name: string}[]>([]);

  // Form states
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    billing: {} as WCAddress,
    shipping: {} as WCAddress,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/customer");
        if (res.ok) {
          const data = await res.json();
          setCustomer(data.customer);
          setFormData({
            first_name: data.customer.first_name || "",
            last_name: data.customer.last_name || "",
            billing: data.customer.billing || {},
            shipping: data.customer.shipping || {},
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();

    fetch("/api/locations?countries=true&country=IN")
      .then(res => res.json())
      .then(data => {
        if (data.countries) setCountriesList(data.countries);
        if (data.states) setStatesList(data.states);
      })
      .catch(err => console.error("Failed to load locations", err));
  }, []);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      billing: { ...prev.billing, [name]: value } 
    }));

    if (name === "country") {
      fetch(`/api/locations?country=${value}`)
        .then(res => res.json())
        .then(data => {
          setStatesList(data.states || []);
          setFormData(prev => ({ ...prev, billing: { ...prev.billing, state: "" } }));
        });
    }
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      shipping: { ...prev.shipping, [name]: value } 
    }));

    if (name === "country") {
      fetch(`/api/locations?country=${value}`)
        .then(res => res.json())
        .then(data => {
          setStatesList(data.states || []);
          setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, state: "" } }));
        });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    const { billing } = formData;
    const activeCountry = billing.country || "IN";
    
    if (billing.address_1 || billing.city || activeCountry || billing.postcode || billing.phone) {
      // If they started filling the address, make sure all critical fields are present
      if (!billing.address_1 || !billing.city || !billing.postcode || !billing.phone) {
        toast.error("Incomplete Address", { 
          description: "If you provide an address, please fill out all fields: Street, City, Country, PIN, and Phone." 
        });
        return;
      }
    }

    setSaving(true);
    
    // Copy billing to shipping if toggle is checked
    const payload = { ...formData };
    
    // Ensure country is passed even if unchanged
    payload.billing.country = payload.billing.country || "IN";
    payload.shipping.country = payload.shipping.country || "IN";

    if (sameAsBilling) {
      payload.shipping = { ...payload.billing };
    }
    
    try {
      const res = await fetch("/api/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }
      
      const data = await res.json();
      setCustomer(data.customer);
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error("Update failed", { description: error.message });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 animate-pulse text-sm text-muted-foreground">Loading profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Profile & Addresses</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information and default delivery addresses.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b border-border/50 pb-2">Basic Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">First Name</label>
              <Input name="first_name" value={formData.first_name} onChange={handleBasicChange} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Last Name</label>
              <Input name="last_name" value={formData.last_name} onChange={handleBasicChange} className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold">Email Address (Cannot be changed)</label>
              <Input value={customer?.email || ""} disabled className="h-9 text-xs bg-muted/20" />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b border-border/50 pb-2">Billing Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Street Address</label>
              <Input name="address_1" value={formData.billing?.address_1 || ""} onChange={handleBillingChange} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold">City</label>
                <Input name="city" value={formData.billing?.city || ""} onChange={handleBillingChange} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold">Country</label>
                <select 
                  name="country" 
                  value={formData.billing?.country || "IN"} 
                  onChange={handleBillingChange} 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Country</option>
                  {countriesList.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              {statesList.length > 0 && (
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold">State</label>
                  <select 
                    name="state" 
                    value={formData.billing?.state || ""} 
                    onChange={handleBillingChange} 
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select State</option>
                    {statesList.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold">PIN / Zip Code</label>
                <Input 
                  name="postcode" 
                  value={formData.billing?.postcode || ""} 
                  onChange={handleBillingChange} 
                  className="h-9 text-xs" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Phone Number</label>
              <Input name="phone" value={formData.billing?.phone || ""} onChange={handleBillingChange} className="h-9 text-xs" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <h3 className="text-sm font-bold">Shipping Address</h3>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="sameAsBilling" 
                checked={sameAsBilling}
                onChange={(e) => setSameAsBilling(e.target.checked)}
                className="h-3 w-3 rounded text-gold border-border focus:ring-gold"
              />
              <label htmlFor="sameAsBilling" className="text-xs text-muted-foreground cursor-pointer">
                Same as billing address
              </label>
            </div>
          </div>
          
          {!sameAsBilling && (
            <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Street Address</label>
              <Input name="address_1" value={formData.shipping?.address_1 || ""} onChange={handleShippingChange} className="h-9 text-xs" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold">City</label>
                <Input name="city" value={formData.shipping?.city || ""} onChange={handleShippingChange} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold">Country</label>
                <select 
                  name="country" 
                  value={formData.shipping?.country || "IN"} 
                  onChange={handleShippingChange} 
                  className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="" disabled>Select Country</option>
                  {countriesList.map(country => (
                    <option key={country.code} value={country.code}>{country.name}</option>
                  ))}
                </select>
              </div>
              {statesList.length > 0 && (
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold">State</label>
                  <select 
                    name="state" 
                    value={formData.shipping?.state || ""} 
                    onChange={handleShippingChange} 
                    className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select State</option>
                    {statesList.map(state => (
                      <option key={state.code} value={state.code}>{state.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1.5 col-span-2 sm:col-span-1">
                <label className="text-xs font-semibold">PIN / Zip Code</label>
                <Input 
                  name="postcode" 
                  value={formData.shipping?.postcode || ""} 
                  onChange={handleShippingChange} 
                  className="h-9 text-xs" 
                />
              </div>
            </div>
          </div>
          )}
        </div>

        <div className="pt-4 border-t border-border/50">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
