import useSEO from '../hooks/useSEO';

export default function ReturnsPage() {
  useSEO({
    title: 'Returns & Exchanges',
    description: 'Read the Sattis returns and exchange policy. Learn how to return or exchange a product hassle-free.',
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="bg-[#0a0a0a] text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3">Customer Policies</span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-wide">Exchanges, Returns & Cancellations</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20 prose prose-sm text-gray-600 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Exchanges & Returns Policy</h2>
          <p className="leading-relaxed">
            At SATTIS, we take immense pride in the craftsmanship of our fragrances. If you are not fully satisfied with your purchase, you may initiate an exchange or return within **7 days** of receiving your package.
          </p>
          <p className="leading-relaxed">
            To be eligible for an exchange or return:
            - The fragrance bottle must remain completely unused and in its original, sealed plastic packaging.<br/>
            - The product box and outer casing must be undamaged.<br/>
            - You must provide proof of purchase from our official store.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">Cancellations</h2>
          <p className="leading-relaxed">
            You may request to cancel your order at any time before it goes into the **Processing** or **Shipped** status. Once an order is handed over to our logistics partners, it cannot be cancelled. 
          </p>
          <p className="leading-relaxed">
            If SATTIS must cancel an order (due to out-of-stock inventory, delivery area limitations, or other reasons), our customer service team will contact you directly to share the reason.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">How to Initiate a Request</h2>
          <p className="leading-relaxed">
            Please reach out to our concierge support team via email at our support desk or via WhatsApp with your Order ID. Our logistics team will guide you on returning your product.
          </p>
        </section>
      </div>
    </div>
  );
}
