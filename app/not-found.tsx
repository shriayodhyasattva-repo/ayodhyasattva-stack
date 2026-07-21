import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#FAF8F3] px-4 text-center">
      <div className="bg-white p-10 rounded-3xl shadow-sm border border-border/40 max-w-lg w-full relative overflow-hidden">
        {/* Subtle decorative elements for a premium feel */}
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-orange-600/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200/50 mb-6 shadow-sm">
            <Footprints className="h-9 w-9 text-orange-600" aria-hidden="true" />
          </div>
          
          <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
            Wandered off the Path?
          </h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-base text-muted-foreground leading-relaxed">
              It seems you've ventured deep into the Dandakaranya forest. 
              The page you are seeking is nowhere to be found.
            </p>
            <div className="inline-block bg-orange-50/80 border border-orange-100 py-2 px-4 rounded-full">
              <p className="text-sm font-medium text-orange-800">
                Even Lord Hanuman couldn't locate this URL!
              </p>
            </div>
          </div>
          
          <Link 
            href="/"
            className={cn(
              buttonVariants({ size: "lg" }), 
              "w-full bg-gold hover:bg-gold-hover text-white font-semibold text-base h-12 rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
            )}
          >
            Return to Ayodhya (Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
