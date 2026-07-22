import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Returns & Refunds Policy - Ayodhya Sattva",
  description: "Learn about our returns and refunds policy.",
};

export default function ReturnsPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8">Returns & Refunds Policy</h1>
      
      <div className="prose prose-orange max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Returns Overview</h2>
          <p>
            We accept returns within 7 days of the delivery date. To be eligible for a return, your item must be unused, in the same condition that you received it, and in its original packaging.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            * Note: Certain sacred items, pooja samagri, and personalized products are exempt from being returned for purity and hygiene reasons.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to initiate a return</h2>
          <ol className="list-decimal pl-5 mt-4 space-y-2">
            <li>Contact our customer support team at <a href="mailto:support@ayodhyasattva.com" className="text-orange-600 hover:underline">support@ayodhyasattva.com</a> with your order number and reason for return.</li>
            <li>Our team will review your request and provide you with a Return Merchandise Authorization (RMA) number and shipping instructions.</li>
            <li>Pack the item securely and ship it to the provided address using a trackable shipping service.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refunds</h2>
          <p>
            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
          </p>
          <p className="mt-2">
            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment within 5-7 business days. Please note that original shipping costs are non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Defective Items</h2>
          <p>
            If you receive a defective or damaged item, please contact us immediately upon receipt with photos of the damage. We will arrange for a replacement or a full refund at no additional cost to you.
          </p>
        </section>
        
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm text-gray-600 text-center">
            For more information, please <Link href="/contact" className="text-orange-600 font-medium hover:underline">contact us</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
