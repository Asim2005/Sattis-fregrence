import { motion } from 'framer-motion';
import useSEO from '../hooks/useSEO';

export default function AboutPage() {
  useSEO({
    title: 'About Sattis',
    description: 'Sattis is a luxury Pakistani fragrance brand crafting premium perfumes for men, women, and unisex. Discover our story, values, and artisan approach to scent.',
  });

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-[#0a0a0a] text-white py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none" style={{ backgroundImage: "url('/assets/images/about-bg.jpg')" }} />
        <div className="max-w-3xl mx-auto px-4 relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400 block mb-3"
          >
            Our Story
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl md:text-5xl tracking-wide"
          >
            Artistry in Olfaction
          </motion.h1>
        </div>
      </div>

      {/* Story Sections */}
      <div className="max-w-4xl mx-auto px-4 py-20 space-y-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-serif text-3xl mb-6 text-black">The Philosophy of SATTIS</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              SATTIS was founded on the belief that a fragrance is much more than a finishing touch—it is an invisible language, a vessel of memory, and an expression of one's deepest character.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              We collaborate with world-renowned perfumers to compose masterfully balanced scents that unfold uniquely on the skin. By sourcing only the absolute finest raw ingredients and essential oils, we produce scents that carry both profound depth and exceptional longevity.
            </p>
          </div>
          <div className="aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-8">
            <span className="font-serif text-8xl text-gray-100 select-none">S</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center md:flex-row-reverse"
        >
          <div className="md:order-2">
            <h2 className="font-serif text-3xl mb-6 text-black">Uncompromising Quality</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Every bottle of SATTIS is hand-filled, inspected, and packaged in a sleek, minimalist aesthetic designed to sit beautifully on your vanity. We ensure that our processes are cruelty-free and prioritize clean, premium formulations.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              From our vibrant, energizing Citrus blends to the deep, mysterious folds of our Oriental & Oud collections, we invite you to explore your signature olfactory identity with SATTIS.
            </p>
          </div>
          <div className="md:order-1 aspect-[4/5] bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center p-8">
            <span className="font-serif text-8xl text-gray-100 select-none">Q</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
