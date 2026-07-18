"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WCOrder } from "@/types/product";
import { Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const [orders, setOrders] = useState<WCOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Order History</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track, return, or repurchase items from your past orders.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gold border-t-transparent mx-auto mb-3" />
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-muted/5 rounded-lg border border-dashed border-border">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No orders found</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Your order history is currently empty.</p>
          <Link href="/products">
            <Button>Explore Sacred Items</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/10 p-4 border-b border-border flex flex-wrap gap-4 justify-between items-center text-sm">
                <div className="flex gap-8">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Order Placed</p>
                    <p className="font-medium text-foreground">{new Date(order.date_created).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Total Amount</p>
                    <p className="font-medium text-foreground">₹{parseFloat(order.total).toLocaleString("en-IN")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-0.5">Order Number</p>
                  <p className="font-medium text-foreground">#{order.number}</p>
                </div>
              </div>
              
              <div className="p-4 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-soft-gold/20 text-gold">
                    {order.status}
                  </span>
                  <Link href={`/account/orders/${order.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      View Details
                    </Button>
                  </Link>
                </div>
                
                <div className="flex items-center gap-4 overflow-x-auto pb-2">
                  {order.line_items.map((item, idx) => (
                    <div key={idx} className="flex-shrink-0 flex items-center gap-3 pr-4 border-r border-border/50 last:border-0">
                      <div className="h-12 w-12 rounded bg-muted/20 overflow-hidden border border-border">
                        {item.image?.src && (
                          <img src={item.image.src} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground max-w-[120px] truncate">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
