"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF8F3] px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-border/40 max-w-md w-full">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" aria-hidden="true" />
        </div>
        
        <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
          Service Temporarily Unavailable
        </h2>
        
        <p className="text-sm text-muted-foreground mb-6">
          We are currently experiencing high traffic or a temporary connection issue with our store servers. Please wait a moment and try again.
        </p>
        
        <Button 
          onClick={() => reset()}
          className="w-full bg-gold hover:bg-gold-hover text-white font-semibold"
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
