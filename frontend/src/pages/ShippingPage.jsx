import useSEO from '../hooks/useSEO';

export default function ShippingPage() {
  useSEO({
    title: 'Shipping Policy',
    description: 'Find out about Sattis delivery timelines, Cash on Delivery availability, shipping fees, and order tracking across Pakistan.',
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="bg-[#0a0a0a] text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3">Delivery Information</span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-wide">Shipping & Delivery</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20 prose prose-sm text-gray-600 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Shipping Areas</h2>
          <p className="leading-relaxed">
            SATTIS delivers to all major cities and regions across Pakistan. We partner with reliable courier networks to ensure your luxury fragrances are handled with absolute care.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Delivery Timelines</h2>
          <p className="leading-relaxed">
            - **Karachi**: 2 to 3 business days.<br/>
            - **Lahore, Islamabad & Major Cities**: 3 to 5 business days.<br/>
            - **Other Regions**: 5 to 7 business days.
          </p>
          <p className="leading-relaxed text-sm mt-2 text-gray-400">
            Note: Delivery timelines are estimates and may occasionally be delayed during peak sale periods or due to operational reasons.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Shipping Rates</h2>
          <p className="leading-relaxed">
            We provide **Free Shipping** for all orders valued above **Rs. 3,000**. For orders below this threshold, flat rates or per-item rates are automatically calculated at checkout based on our active logistics schedules.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Order Tracking</h2>
          <p className="leading-relaxed">
            Once your order is processed and shipped, you will receive confirmation from our dispatch team with a tracking ID and link so you can monitor your package.
          </p>
        </section>
      </div>
    </div>
  );
}
