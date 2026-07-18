"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { WCOrder } from "@/types/product";
import { Package, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<WCOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          // Show only top 3 recent orders
          setRecentOrders(data.orders?.slice(0, 3) || []);
        }
      } catch (error) {
        console.error("Failed to fetch recent orders", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Account Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your spiritual items, track orders, and update your preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-muted/10 rounded-lg p-4 border border-border">
          <h3 className="font-semibold text-sm mb-2 text-foreground">Profile Details</h3>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><span className="font-medium text-foreground">Name:</span> {user?.firstName} {user?.lastName}</p>
            <p><span className="font-medium text-foreground">Email:</span> {user?.email}</p>
          </div>
          <Link href="/account/profile" className="text-xs font-semibold text-gold hover:underline mt-3 inline-block">
            Edit Profile →
          </Link>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-foreground">Recent Orders</h3>
          <Link href="/account/orders" className="text-xs font-semibold text-gold hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-sm text-muted-foreground animate-pulse">Loading orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12 bg-muted/5 rounded-lg border border-dashed border-border">
            <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">No orders yet</p>
            <p className="text-xs text-muted-foreground mt-1 mb-4">You haven't placed any orders.</p>
            <Link href="/products">
              <Button size="sm">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-border rounded-lg gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-foreground">Order #{order.number}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/20 text-muted-foreground uppercase font-bold tracking-wider">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(order.date_created).toLocaleDateString()}
                    </span>
                    <span>{order.line_items.length} items</span>
                    <span className="font-semibold text-foreground">₹{parseFloat(order.total).toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <Link href={`/account/orders/${order.id}`}>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto h-8 text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
