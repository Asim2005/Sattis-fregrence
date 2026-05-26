import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center pt-16 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="font-serif text-8xl md:text-[12rem] text-gray-100 leading-none select-none mb-4">404</h1>
        <h2 className="font-serif text-2xl md:text-4xl mb-4 relative z-10 -mt-16 md:-mt-24">Page Not Found</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link 
          to="/" 
          className="inline-block px-8 py-3.5 bg-black text-white text-sm tracking-widest uppercase rounded-full hover:bg-gray-800 transition-colors"
        >
          Return Home
        </Link>
      </motion.div>
    </div>
  );
}
