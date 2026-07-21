import { Star } from "lucide-react";

interface Testimonial {
  id: number;
  author: string;
  location: string;
  rating: number;
  text: string;
  purchase: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author: "Aravind Sharma",
    location: "New Delhi, Delhi",
    rating: 5,
    text: "Jai Shri Ram! The Ram Darbar idol radiates the true majesty of Maryada Purushottam Rama. The fine detailing on the crown is museum-level. It arrived packed with extreme care, bringing immense peace to our home temple.",
    purchase: "Verified Buyer of Brass Ram Darbar"
  },
  {
    id: 2,
    author: "Meera Patel",
    location: "Mumbai, Maharashtra",
    rating: 5,
    text: "The Mysore Sandalwood Dhoop sticks have transformed my morning prayers. The pure, rich fragrance truly feels like stepping into the sanctum of the Ram Janmabhoomi temple. No harsh smoke, just pure devotion.",
    purchase: "Verified Buyer of Mysore Sandalwood Dhoop"
  },
  {
    id: 3,
    author: "Rajesh Kothari",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    text: "I gifted the teakwood replica of the Ayodhya Ram Mandir to my brother. The carvings are spectacular, echoing the grandeur of our heritage. It now stands as a beautiful blessing in his living room. Siya Ram!",
    purchase: "Verified Buyer of Teakwood Ram Mandir Replica"
  }
];

export default function TestimonialSection() {
  return (
    <section className="bg-[#FAF8F3] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold">Voices of the Bhaktas</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mt-2">
            Blessings Shared by Fellow Devotees
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-3">
            The profound joy of bringing Lord Rama home is best expressed by the Bhaktas who have felt His divine presence.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((test) => (
            <div
              key={test.id}
              className="flex flex-col justify-between p-6 sm:p-8 rounded-2xl border border-border bg-background shadow-xs"
            >
              <div>
                {/* Rating stars */}
                <div className="flex gap-1 text-gold mb-4">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>

                <p className="text-sm text-foreground italic leading-relaxed">
                  "{test.text}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{test.author}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{test.location}</p>
                </div>
                <span className="text-[10px] font-medium text-gold bg-soft-gold/20 px-2 py-0.5 rounded-full border border-gold/10">
                  {test.purchase}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
