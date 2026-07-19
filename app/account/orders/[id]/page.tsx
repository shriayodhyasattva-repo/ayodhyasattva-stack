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
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
          setNotes(data.notes || []);
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
                <span>{order.status === "completed" || (order.status === "processing" && order.payment_method !== "cod") ? "Total Paid" : "Total Amount"}</span>
                <span>₹{parseFloat(order.total).toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
          
          {notes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border/50">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                Order Updates
              </h3>
              <div className="border border-border rounded-lg bg-background overflow-hidden relative">
                {/* Timeline vertical line */}
                <div className="absolute left-[39px] top-4 bottom-4 w-px bg-border/80"></div>
                
                <div className="divide-y divide-border/50 relative z-10">
                  {notes.map((note, idx) => (
                    <div key={note.id} className="p-4 pl-[72px] relative group hover:bg-muted/5 transition-colors">
                      {/* Timeline dot */}
                      <div className={`absolute left-8 top-5 h-3.5 w-3.5 rounded-full border-2 border-background ring-1 ring-border ${idx === 0 ? 'bg-gold ring-gold/50' : 'bg-muted-foreground/30'}`}></div>
                      
                      <div className="text-xs text-muted-foreground font-medium mb-1.5 flex items-center justify-between">
                        {new Date(note.date_created).toLocaleString()}
                        {idx === 0 && <span className="text-[9px] uppercase tracking-wider bg-gold/10 text-gold px-1.5 py-0.5 rounded font-bold">Latest</span>}
                      </div>
                      
                      {/* Render note HTML content safely */}
                      <div 
                        className="text-sm text-foreground leading-relaxed prose prose-sm prose-p:my-1 max-w-none"
                        dangerouslySetInnerHTML={{ __html: note.note }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
