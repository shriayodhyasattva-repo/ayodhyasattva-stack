import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQs - Ayodhya Sattva",
  description: "Frequently asked questions about Ayodhya Sattva products and services.",
};

const faqs = [
  {
    question: "Are all your products authentic?",
    answer: "Yes, all our sacred items, rudrakshas, and pooja samagri are 100% authentic and ethically sourced directly from trusted artisans and suppliers in and around Ayodhya."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship globally to select countries. Shipping costs and delivery times vary depending on the destination."
  },
  {
    question: "How long does delivery take within India?",
    answer: "Standard domestic delivery usually takes 5-7 business days. We also offer express shipping options at checkout for faster delivery."
  },
  {
    question: "Can I return a product if I am not satisfied?",
    answer: "We accept returns within 7 days of delivery for most items, provided they are unused and in their original packaging. Please refer to our Returns Policy for detailed terms."
  },
  {
    question: "Are the sacred items energized before shipping?",
    answer: "Many of our sacred items undergo special pooja and energization processes before dispatch, depending on the product type. This will be specifically mentioned in the product description."
  }
];

export default function FaqsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
      
      <div className="mt-12 space-y-8">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-600">Still have questions?</p>
        <a href="/contact" className="mt-4 inline-block text-orange-600 font-medium hover:text-orange-700">Contact our support team &rarr;</a>
      </div>
    </div>
  );
}
