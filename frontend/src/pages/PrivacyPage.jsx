import useSEO from '../hooks/useSEO';

export default function PrivacyPage() {
  useSEO({
    title: 'Privacy Policy',
    description: 'Learn how Sattis collects, uses, and protects your personal data when you shop with us.',
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      <div className="bg-[#0a0a0a] text-white py-24 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3">Data Protection</span>
          <h1 className="font-serif text-4xl md:text-5xl tracking-wide">Privacy Policy</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-20 prose prose-sm text-gray-600 space-y-8">
        <section>
          <h2 className="font-serif text-2xl text-black mb-3">1. Information We Collect</h2>
          <p className="leading-relaxed">
            We collect personal information that you voluntarily provide to us when registering, placing an order, subscribing to our newsletter, or contacting us. This information may include your name, shipping address, phone number, email address, and order history.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">2. How We Use Your Information</h2>
          <p className="leading-relaxed">
            We use your personal information to process orders, manage accounts, send newsletter updates or promotional campaigns (if subscribed), and provide you with responsive customer care.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">3. Data Security</h2>
          <p className="leading-relaxed">
            We take reasonable precautions and implement industry best practices to protect your personal information against unauthorized access, loss, alteration, or disclosure.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-2xl text-black mb-3">4. Third-Party Services</h2>
          <p className="leading-relaxed">
            We do not sell, trade, or otherwise transfer your personal information to external third parties. This does not include trusted partners who assist us in operating our website or shipping orders, provided they agree to keep your information confidential.
          </p>
        </section>
      </div>
    </div>
  );
}
