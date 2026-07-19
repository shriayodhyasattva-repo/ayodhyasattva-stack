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
  }, []);

  const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      billing: { ...prev.billing, [name]: value } 
    }));
  };

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      shipping: { ...prev.shipping, [name]: value } 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Frontend Validation
    const { billing } = formData;
    if (billing.address_1 || billing.city || billing.state || billing.postcode || billing.phone) {
      if (!billing.address_1 || !billing.city || !billing.state || !billing.postcode || !billing.phone) {
        toast.error("Incomplete Address", { 
          description: "If you provide an address, please fill out all fields: Street, City, State, PIN, and Phone." 
        });
        return;
      }
    }

    setSaving(true);
    
    try {
      const res = await fetch("/api/customer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">State</label>
                <Input name="state" value={formData.billing?.state || ""} onChange={handleBillingChange} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">PIN Code</label>
                <Input name="postcode" value={formData.billing?.postcode || ""} onChange={handleBillingChange} className="h-9 text-xs" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Phone Number</label>
              <Input name="phone" value={formData.billing?.phone || ""} onChange={handleBillingChange} className="h-9 text-xs" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold border-b border-border/50 pb-2">Shipping Address</h3>
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">State</label>
                <Input name="state" value={formData.shipping?.state || ""} onChange={handleShippingChange} className="h-9 text-xs" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">PIN Code</label>
                <Input name="postcode" value={formData.shipping?.postcode || ""} onChange={handleShippingChange} className="h-9 text-xs" />
              </div>
            </div>
          </div>
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
