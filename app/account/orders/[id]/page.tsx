"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { WCOrder } from "@/types/product";
import { ArrowLeft, Clock, Package, MapPin, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<WCOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error("Failed to fetch order details", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return <div className="text-center py-12 animate-pulse text-sm text-muted-foreground">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        <p>Order not found</p>
        <Link href="/account/orders" className="text-gold mt-4 inline-block hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-border/50 pb-4">
        <Link href="/account/orders">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-foreground">Order #{order.number}</h2>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Clock className="h-3 w-3" />
            Placed on {new Date(order.date_created).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-muted/10 rounded-lg border border-border">
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1">Status</p>
          <span className="text-sm font-bold uppercase tracking-wider text-gold">
            {order.status}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Total</p>
          <p className="font-bold text-foreground">₹{parseFloat(order.total).toLocaleString("en-IN")}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Package className="h-4 w-4 text-gold" />
            Items ({order.line_items.length})
          </h3>
          <div className="border border-border rounded-lg divide-y divide-border/50">
            {order.line_items.map((item) => (
              <div key={item.id} className="p-3 flex items-start gap-4">
                <div className="h-16 w-16 rounded bg-muted/20 border border-border flex-shrink-0">
                  {item.image?.src && (
                    <img src={item.image.src} alt={item.name} className="h-full w-full object-cover rounded" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Quantity: {item.quantity}</p>
                  <p className="text-xs font-medium text-foreground mt-1">₹{parseFloat(item.total).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold" />
              Delivery Address
            </h3>
            <div className="border border-border rounded-lg p-4 bg-muted/5 text-sm text-foreground">
              <p className="font-semibold mb-1">{order.shipping.first_name} {order.shipping.last_name}</p>
              <p>{order.shipping.address_1}</p>
              {order.shipping.address_2 && <p>{order.shipping.address_2}</p>}
              <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" />
              Payment Details
            </h3>
            <div className="border border-border rounded-lg p-4 bg-muted/5 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.payment_method_title}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50 font-bold">
                <span>Total Paid</span>
                <span>₹{parseFloat(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
