import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, Star } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#FAF8F3] border-b border-border/40">

      {/* Soft background glows */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-soft-gold/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-[350px] w-[350px] rounded-full bg-gold/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ── Mobile layout: full-bleed image hero with overlay text ─────── */}
        <div className="block lg:hidden">
          <div className="relative w-full aspect-[4/3] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1609137144814-7d5267b137d5?auto=format&fit=crop&q=80&w=800"
              alt="Divine Brass Idol Showcase"
              className="h-full w-full object-cover"
            />
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F3] via-[#FAF8F3]/40 to-transparent" />
          </div>

          {/* Text below the image on mobile */}
          <div className="py-8 text-center space-y-5">
            <div className="inline-flex items-center gap-1.5 bg-soft-gold/20 border border-gold/20 px-3 py-1 rounded-full text-gold text-xs font-semibold uppercase tracking-wider">
              🪔 Direct from Ayodhya Dham
            </div>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground leading-tight px-2">
              Experience the Divine <span className="text-gold">Heritage of Ayodhya</span>
            </h1>

            <p className="text-sm text-muted-foreground leading-relaxed px-2 max-w-sm mx-auto">
              Handcrafted brass idols, copper pooja sets, temple incense, and sacred literature — hand-selected for authenticity.
            </p>

            {/* Trust badges */}
            <div className="flex justify-center gap-5 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-gold" />
                <span>100% Genuine</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span>4.8 Rated</span>
              </div>
            </div>

            {/* Mobile CTAs — full width, large tap targets */}
            <div className="flex flex-col gap-3 px-4 pt-2">
              <Link href="/products">
                <Button size="lg" className="w-full h-14 text-base gap-2 shadow-md">
                  Browse Sacred Collection <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/products?category=temple-idols">
                <Button variant="secondary" size="lg" className="w-full h-12 text-sm">
                  View Temple Idols
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Desktop layout: side-by-side ─────────────────────────────────── */}
        <div className="hidden lg:grid grid-cols-12 gap-12 items-center py-28">

          {/* Left Content */}
          <div className="col-span-7 flex flex-col space-y-6">
            <div className="inline-flex items-center gap-1.5 self-start bg-soft-gold/20 border border-gold/20 px-3 py-1 rounded-full text-gold text-xs font-semibold uppercase tracking-wider">
              🪔 Direct from Ayodhya Dham
            </div>

            <h1 className="font-serif text-5xl xl:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
              Experience the Divine <br />
              <span className="text-gold">Heritage of Ayodhya</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Bring home the spiritual sanctity of the holy city. Explore museum-quality handcrafted brass idols, copper pooja sets, temple incense, and sacred literature. Hand-selected for authenticity and spiritual energy.
            </p>

            <div className="flex gap-6 text-sm text-muted-foreground font-medium">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5 text-gold" />
                <span>100% Genuine Brass</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4.5 w-4.5 text-gold fill-gold" />
                <span>4.8 Avg. Rating</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/products">
                <Button size="lg" className="h-12 px-8 text-sm gap-2">
                  Browse Sacred Collection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/products?category=temple-idols">
                <Button variant="secondary" size="lg" className="h-12 px-8 text-sm">
                  View Temple Idols
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="col-span-5">
            <div className="relative mx-auto max-w-[420px] aspect-[4/5] rounded-2xl overflow-hidden border border-border shadow-xl bg-background group">
              <img
                src="https://images.unsplash.com/photo-1609137144814-7d5267b137d5?auto=format&fit=crop&q=80&w=800"
                alt="Divine Brass Idol Showcase"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
                <div className="text-white">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-soft-gold">Artisanal Masterpiece</span>
                  <h3 className="font-serif text-lg font-semibold mt-1">Brass Ram Darbar Devotion</h3>
                  <p className="text-xs text-white/80 mt-1">Hand-cast by traditional heritage metalcrafters.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
