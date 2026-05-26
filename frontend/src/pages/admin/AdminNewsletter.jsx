import { useState, useEffect } from 'react';
import { newsletterAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Campaign Form State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await newsletterAPI.getSubscribers();
      setSubscribers(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load newsletter subscribers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) {
      toast.error('Subject and content are required.');
      return;
    }
    setSending(true);
    try {
      const res = await newsletterAPI.sendCampaign({ subject, content });
      toast.success(res.data.message || 'Campaign broadcasted successfully!');
      setSubject('');
      setContent('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send campaign.');
    } finally {
      setSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => 
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Newsletter Campaigns</h1>
        <p className="text-gray-400 text-sm mt-1">Manage subscriber lists and broadcast email campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Subscribers List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="font-serif text-lg">Subscribers ({filteredSubscribers.length})</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-xs focus:border-black focus:bg-white transition-all w-48"
              />
              <button
                onClick={loadSubscribers}
                className="px-4 h-10 border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50 bg-gray-50/50">
                    <th className="px-6 py-4 font-bold">ID</th>
                    <th className="px-6 py-4 font-bold">Email Address</th>
                    <th className="px-6 py-4 font-bold">Subscribed On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    [1, 2, 3].map(i => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 w-8 rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 w-48 rounded" /></td>
                        <td className="px-6 py-5"><div className="h-4 bg-gray-100 w-32 rounded" /></td>
                      </tr>
                    ))
                  ) : filteredSubscribers.length > 0 ? (
                    filteredSubscribers.map((sub, idx) => (
                      <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-mono">#{idx + 1}</td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-black">{sub.email}</p>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {formatDate(sub.subscribed_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-6 py-12 text-center text-gray-400 text-sm italic">
                        No subscribers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Compose Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="font-serif text-xl">Compose Campaign</h2>
              <p className="text-gray-400 text-xs mt-1">Broadcast an HTML/text message to all subscribers instantly.</p>
            </div>

            <form onSubmit={handleSendCampaign} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Campaign Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Discover our newest Summer Curation!"
                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-2 block">Email Body Content</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Type your campaign message here..."
                  rows="8"
                  className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50 outline-none text-sm focus:border-black focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending || subscribers.length === 0}
                className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                {sending ? 'Sending Broadcast...' : 'Broadcast Campaign'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
