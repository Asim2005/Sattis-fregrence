import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { reviewsAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllReviews();
  }, []);

  const loadAllReviews = async () => {
    setLoading(true);
    try {
      // Correct endpoint for all reviews (admin only)
      const res = await reviewsAPI.getAllAdmin(); 
      setReviews(res.data.data || []);
    } catch (err) {
      console.error('Review load error:', err);
      toast.error('Failed to load reviews from database.');
      setReviews([]); // Clear on error
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await reviewsAPI.update(id, { is_approved: currentStatus === 1 ? 0 : 1 });
      toast.success('Review status updated!');
      loadAllReviews();
    } catch (err) {
      toast.error('Failed to update review.');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review forever?')) return;
    try {
      await reviewsAPI.destroy(id);
      toast.success('Review deleted.');
      loadAllReviews();
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Customer Reviews</h1>
        <p className="text-gray-400 text-sm mt-1">Moderate and manage product feedback</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4 font-bold">Reviewer</th>
                <th className="px-8 py-4 font-bold">Product</th>
                <th className="px-8 py-4 font-bold">Rating</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold">{rev.reviewer_name}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">"{rev.body}"</p>
                    {(() => {
                      try {
                        const imgs = typeof rev.images === 'string' ? JSON.parse(rev.images) : rev.images;
                        if (Array.isArray(imgs) && imgs.length > 0) {
                          return (
                            <div className="flex gap-1.5 mt-2">
                              {imgs.map((path, idx) => (
                                <a key={idx} href={path} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                                  <img 
                                    src={path} 
                                    alt="review" 
                                    className="w-10 h-10 rounded-lg object-cover border border-gray-100 hover:opacity-80 transition-opacity" 
                                  />
                                </a>
                              ))}
                            </div>
                          );
                        }
                      } catch (e) {}
                      return null;
                    })()}
                  </td>
                  <td className="px-8 py-6 text-sm font-medium">{rev.product_name || 'Generic Product'}</td>
                  <td className="px-8 py-6">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xs ${i < rev.rating ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      rev.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {rev.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleApproval(rev.id, rev.is_approved)}
                        className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black"
                      >
                        {rev.is_approved ? 'UNAPPROVE' : 'APPROVE'}
                      </button>
                      <button 
                        onClick={() => deleteReview(rev.id)}
                        className="text-[10px] font-bold uppercase tracking-widest text-red-300 hover:text-red-500"
                      >
                        DELETE
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
