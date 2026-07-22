import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order - Ayodhya Sattva",
  description: "Track your Ayodhya Sattva order status.",
};

export default function TrackOrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-lg text-gray-600">Enter your order details below to check the current status of your shipment.</p>
      </div>
      
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 md:p-12">
        <form className="space-y-6 max-w-md mx-auto">
          <div>
            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700">Order ID</label>
            <input 
              type="text" 
              id="orderId" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border" 
              placeholder="e.g. #12345" 
            />
            <p className="mt-1 text-xs text-gray-500">Found in your order confirmation email.</p>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Billing Email</label>
            <input 
              type="email" 
              id="email" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm p-3 border" 
              placeholder="Email used during checkout" 
            />
          </div>
          
          <button 
            type="button" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            Track Order
          </button>
        </form>
      </div>
    </div>
  );
}
