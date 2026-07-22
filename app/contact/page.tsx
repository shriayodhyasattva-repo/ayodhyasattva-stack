import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Ayodhya Sattva",
  description: "Get in touch with the Ayodhya Sattva team for any inquiries about our spiritual products.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-lg text-gray-600 mb-8">
            Have a question about our sacred products, your order, or anything else? Our team is here to help you on your spiritual journey.
          </p>
          
          <div className="space-y-6 text-gray-600">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Email Support</h3>
              <p>support@ayodhyasattva.com</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Phone</h3>
              <p>+91 98765 43210</p>
              <p className="text-sm">Mon-Fri, 9:00 AM - 6:00 PM IST</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Address</h3>
              <p>Ayodhya Sattva Store</p>
              <p>Ayodhya, Uttar Pradesh, India</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50/50 p-8 rounded-2xl border border-orange-100">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input type="text" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border" placeholder="Your name" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
              <textarea id="message" rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border" placeholder="How can we help you?"></textarea>
            </div>
            <button type="button" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
