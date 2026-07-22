import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Shipping Policy - Ayodhya Sattva",
  description: "Learn about our shipping times, methods, and delivery policies.",
};

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Shipping Policy</h1>
      
      <div className="prose prose-orange max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
          <p>
            All orders are processed within 1 to 2 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.
          </p>
          <p className="mt-2">
            For sacred items that require special pooja or sanctification before dispatch, please allow an additional 2-3 business days.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Domestic Shipping Rates and Estimates</h2>
          <p>
            Shipping charges for your order will be calculated and displayed at checkout. We offer standard and expedited shipping options across India.
          </p>
          <ul className="list-disc pl-5 mt-4 space-y-2">
            <li><strong>Standard Shipping:</strong> 5-7 business days</li>
            <li><strong>Express Shipping:</strong> 2-3 business days</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">International Shipping</h2>
          <p>
            We currently offer international shipping to select countries. Shipping charges for your order will be calculated and displayed at checkout depending on your region. Please note that your order may be subject to import duties and taxes, which are incurred once a shipment reaches your destination country.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How do I check the status of my order?</h2>
          <p>
            When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available.
          </p>
          <p className="mt-4">
            You can also track your order directly on our <Link href="/track-order" className="text-orange-600 hover:underline">Track Order page</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
