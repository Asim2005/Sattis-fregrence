import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { productsAPI } from '../services/api';

const questions = [
  {
    id: 1,
    text: "How do you want to feel when wearing your scent?",
    options: [
      { id: 'a', text: 'Bright & Energized', value: 'Fresh' },
      { id: 'b', text: 'Mysterious & Deep', value: 'Oriental' },
      { id: 'c', text: 'Elegant & Sophisticated', value: 'Woody' },
      { id: 'd', text: 'Romantic & Soft', value: 'Floral' }
    ]
  },
  {
    id: 2,
    text: "What's your ideal environment?",
    options: [
      { id: 'a', text: 'A morning garden after rain', value: 'Floral' },
      { id: 'b', text: 'A sun-drenched library', value: 'Woody' },
      { id: 'c', text: 'A bustling night market', value: 'Oriental' },
      { id: 'd', text: 'A high-speed coastal drive', value: 'Fresh' }
    ]
  },
  {
    id: 3,
    text: "Choose a texture that appeals to you:",
    options: [
      { id: 'a', text: 'Crisp Linen', value: 'Fresh' },
      { id: 'b', text: 'Rich Velvet', value: 'Oriental' },
      { id: 'c', text: 'Polished Wood', value: 'Woody' },
      { id: 'd', text: 'Soft Silk', value: 'Floral' }
    ]
  }
];

export default function ScentQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnswer = (val) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      calculateResult(newAnswers);
    }
  };

  const calculateResult = async (finalAnswers) => {
    setLoading(true);
    setStep(questions.length); // Move to results loading state
    
    // Simple logic: pick the most frequent scent family
    const counts = finalAnswers.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    const topFamily = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

    try {
      const res = await productsAPI.getAll({ search: topFamily, limit: 3 });
      setResults(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-4 overflow-hidden">
      <div className="max-w-2xl w-full">
        
        <AnimatePresence mode="wait">
          {step < questions.length ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="bg-white p-10 md:p-16 rounded-[40px] shadow-sm border border-gray-100 text-center"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400 mb-6">Question {step + 1} of {questions.length}</p>
              <h2 className="font-serif text-3xl md:text-4xl mb-12 leading-tight">{questions[step].text}</h2>
              
              <div className="grid gap-4">
                {questions[step].options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.value)}
                    className="w-full py-5 px-8 rounded-2xl border border-gray-100 bg-gray-50 text-sm font-medium hover:border-black hover:bg-black hover:text-white transition-all text-left flex justify-between items-center group"
                  >
                    {opt.text}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              {loading ? (
                <div className="space-y-6">
                  <div className="w-16 h-16 border-4 border-gray-100 border-t-black rounded-full animate-spin mx-auto" />
                  <p className="font-serif text-2xl">Finding your signature scent...</p>
                </div>
              ) : (
                <div className="space-y-12">
                  <div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-4">Your Fragrance Matches</h2>
                    <p className="text-gray-500">Based on your scent profile, we recommend these fragrances.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {results.map((p) => (
                      <Link key={p.id} to={`/product/${p.slug}`} className="group bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-4">
                          <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        </div>
                        <h4 className="font-serif text-lg mb-1">{p.name}</h4>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">{p.category_name}</p>
                      </Link>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button onClick={() => { setStep(0); setAnswers([]); }} className="px-8 py-3 border border-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors">Retake Quiz</button>
                    <Link to="/products" className="px-8 py-3 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors">Explore All</Link>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      
      {/* Decorative Floating Elements */}
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-rose-50 rounded-full blur-[100px] -z-10" />
      <div className="fixed -top-20 -right-20 w-80 h-80 bg-blue-50 rounded-full blur-[100px] -z-10" />
    </div>
  );
}
