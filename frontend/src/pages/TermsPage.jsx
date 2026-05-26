export default function TermsPage() {
  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="bg-[#0a0a0a] text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3">Legal Guidelines</span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-wide">Terms & Conditions</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20 prose prose-sm text-gray-600 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-black mb-3">1. Agreement to Terms</h2>
          <p className="leading-relaxed">
            Welcome to SATTIS. By accessing our site and purchasing our products, you agree to comply with and be bound by these Terms & Conditions. Please read them carefully.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">2. Product Descriptions & Pricing</h2>
          <p className="leading-relaxed">
            We endeavor to ensure that all specifications, descriptions, and prices of products appearing on our site are accurate. However, errors may occasionally occur. SATTIS reserves the right to correct any errors, inaccuracies, or omissions, and to change or update information at any time without prior notice.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">3. Orders & Payment</h2>
          <p className="leading-relaxed">
            By placing an order, you represent that all details you provide to us are true and accurate, and that you are an authorized user of the payment method (COD or credit/debit card) chosen to submit the order. All orders are subject to availability and confirmation of the order price.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">4. Intellectual Property</h2>
          <p className="leading-relaxed">
            The intellectual property rights in all software, branding, imagery, designs, and content made available to you on or through this website remain the property of SATTIS and are protected by copyright laws around the world.
          </p>
        </section>
      </div>
    </div>
  );
}
