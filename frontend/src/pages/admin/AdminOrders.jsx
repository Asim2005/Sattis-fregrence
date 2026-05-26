import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ordersAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifying, setNotifying] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [savingReason, setSavingReason] = useState(false);

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    loadOrders();
  }, [currentPage, activeStatus, debouncedSearch]);

  useEffect(() => {
    if (selectedOrder) {
      setCancellationReason(selectedOrder.cancellation_reason || '');
    } else {
      setCancellationReason('');
    }
  }, [selectedOrder]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = {
        paginate: 'true',
        page: currentPage,
        limit,
      };
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      if (activeStatus !== 'all') {
        params.status = activeStatus;
      }
      const res = await ordersAPI.getAll(params);
      const data = res.data.data;
      if (data && data.orders && data.pagination) {
        setOrders(data.orders);
        setTotalPages(data.pagination.pages || 1);
        setTotalOrders(data.pagination.total || 0);
      } else {
        setOrders(Array.isArray(data) ? data : []);
        setTotalPages(1);
        setTotalOrders(Array.isArray(data) ? data.length : 0);
      }
    } catch (err) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = async (order) => {
    try {
      const res = await ordersAPI.getOne(order.id);
      setSelectedOrder(res.data.data);
    } catch (err) {
      toast.error('Failed to load order details.');
      setSelectedOrder(order); // Fallback to partial data
    }
  };

  const updateStatus = async (id, status, payment_status) => {
    try {
      const targetStatus = status || selectedOrder.status;
      const targetPaymentStatus = payment_status || selectedOrder.payment_status;
      const reason = targetStatus === 'cancelled' ? (cancellationReason || selectedOrder.cancellation_reason || '') : '';
      const data = { 
        status: targetStatus, 
        payment_status: targetPaymentStatus,
        cancellation_reason: reason
      };
      await ordersAPI.update(id, data);
      toast.success('Order updated successfully');
      
      // Update selected order if open
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, ...data });
      }
      loadOrders(); // Refresh the list
    } catch (err) {
      toast.error('Failed to update order.');
    }
  };

  const handleSaveCancellationReason = async () => {
    if (!selectedOrder) return;
    setSavingReason(true);
    try {
      const data = {
        status: selectedOrder.status,
        payment_status: selectedOrder.payment_status,
        cancellation_reason: cancellationReason
      };
      await ordersAPI.update(selectedOrder.id, data);
      toast.success('Cancellation reason saved successfully');
      setSelectedOrder({ ...selectedOrder, cancellation_reason: cancellationReason });
      loadOrders();
    } catch (err) {
      toast.error('Failed to save cancellation reason.');
    } finally {
      setSavingReason(false);
    }
  };

  const handleNotifyCustomer = async (id) => {
    setNotifying(true);
    try {
      await ordersAPI.notifyStatus(id);
      toast.success('Customer notified successfully via email.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send notification email.');
    } finally {
      setNotifying(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this order? This action is permanent and cannot be undone.')) {
      return;
    }
    try {
      await ordersAPI.destroy(id);
      toast.success('Order deleted successfully');
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete order.');
    }
  };

  const statuses = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Orders</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track customer purchases</p>
        </div>
        <button onClick={loadOrders} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-xs font-bold uppercase tracking-widest text-gray-500">Refresh</button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {statuses.map(tab => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveStatus(tab.value);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeStatus === tab.value
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-11 pl-12 pr-10 rounded-xl bg-gray-50 border border-gray-100 outline-none text-xs font-semibold focus:border-black focus:bg-white transition-all duration-300"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-black transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-gray-50">
                <th className="px-8 py-4 font-bold">Order ID</th>
                <th className="px-8 py-4 font-bold">Customer</th>
                <th className="px-8 py-4 font-bold">Date</th>
                <th className="px-8 py-4 font-bold">Amount</th>
                <th className="px-8 py-4 font-bold">Status</th>
                <th className="px-8 py-4 font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-8 py-10 bg-gray-50/10" />
                  </tr>
                ))
              ) : orders.length > 0 ? orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group" onClick={() => handleOrderClick(order)}>
                  <td className="px-8 py-5 text-sm font-bold">#{order.id}</td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-semibold">{order.full_name}</p>
                    <p className="text-xs text-gray-400">{order.guest_email || order.email}</p>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-5 text-sm font-bold">Rs. {Number(order.total_amount).toLocaleString()}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status === 'shipped' ? 'Out for Delivery' : 
                       order.status === 'completed' ? 'Received' : order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <button className="text-xs font-bold text-gray-400 group-hover:text-black underline underline-offset-2 transition-colors">Details</button>
                  </td>
                </tr>
              )) : (
                <tr>
                   <td colSpan="6" className="px-8 py-12 text-center text-gray-400 text-sm">No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white border-t border-gray-50">
            <p className="text-xs font-semibold text-gray-400">
              Showing Page <span className="text-black font-bold">{currentPage}</span> of <span className="text-black font-bold">{totalPages}</span> ({totalOrders} orders total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                Previous
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                  if (
                    totalPages > 5 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (page === 2 && currentPage > 3) {
                      return <span key={page} className="px-2 text-gray-400 text-xs font-semibold">...</span>;
                    }
                    if (page === totalPages - 1 && currentPage < totalPages - 2) {
                      return <span key={page} className="px-2 text-gray-400 text-xs font-semibold">...</span>;
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                        currentPage === page
                          ? 'bg-black text-white shadow-sm'
                          : 'bg-transparent text-gray-500 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-4 py-2 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Side Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col border-l border-gray-100"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-2xl">Order #{selectedOrder.id}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50">X</button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                {/* Customer & Shipping */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Customer</h4>
                    <div>
                      <p className="text-sm font-semibold">{selectedOrder.full_name}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.guest_email || selectedOrder.email}</p>
                      <p className="text-sm text-gray-500">{selectedOrder.phone}</p>
                    </div>
                    <div className="pt-2">
                       <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Payment Method</h4>
                       <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-bold uppercase tracking-widest">{selectedOrder.payment_method}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Shipping To</h4>
                    <p className="text-sm leading-relaxed">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.country}</p>
                    
                    {selectedOrder.notes && (
                      <div className="pt-2">
                        <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-1">Order Notes / Details</h4>
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800 leading-relaxed italic">
                          {selectedOrder.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 border-b border-gray-50 pb-2">Order Items</h4>
                  <div className="space-y-4">
                    {selectedOrder.items?.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold">{item.quantity}x</span>
                          <span className="font-medium text-gray-600">{item.product_name}</span>
                        </div>
                        <span className="font-bold">Rs. {Number(item.total_price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="p-6 bg-gray-50 rounded-2xl space-y-3">
                  {selectedOrder.subtotal && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Subtotal</span>
                      <span>Rs. {Number(selectedOrder.subtotal).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.shipping_fee && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Shipping</span>
                      <span>Rs. {Number(selectedOrder.shipping_fee).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span>Rs. {Number(selectedOrder.total_amount).toLocaleString()}</span>
                  </div>
                </div>

                {/* Status Update */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Order Status</h4>
                    <div className="relative">
                      <select 
                        value={selectedOrder.status}
                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value, null)}
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 outline-none text-xs font-semibold appearance-none focus:border-black focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Backed out for delivery</option>
                        <option value="completed">Completed / Received</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Payment Status</h4>
                    <div className="relative">
                      <select 
                        value={selectedOrder.payment_status || 'unpaid'}
                        onChange={(e) => updateStatus(selectedOrder.id, null, e.target.value)}
                        className="w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 outline-none text-xs font-semibold appearance-none focus:border-black focus:bg-white transition-all cursor-pointer"
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Reason */}
                {selectedOrder.status === 'cancelled' && (
                  <div className="space-y-3 pt-6 border-t border-gray-100">
                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Cancellation Reason</h4>
                    <textarea
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      placeholder="Write the reason for cancellation here so you can remember later..."
                      className="w-full h-24 p-4 rounded-xl bg-gray-50 border border-gray-100 outline-none text-xs font-semibold focus:border-black focus:bg-white transition-all resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveCancellationReason}
                        disabled={savingReason}
                        className="h-10 px-6 bg-black text-white hover:bg-gray-800 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
                      >
                        {savingReason ? 'Saving Reason...' : 'Save Reason'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Notify Customer via Email */}
                <div className="pt-6 border-t border-gray-100">
                  <button
                    onClick={() => handleNotifyCustomer(selectedOrder.id)}
                    disabled={notifying}
                    className="w-full h-12 bg-black text-white hover:bg-gray-800 rounded-full text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span>✉️</span> {notifying ? 'Sending Email...' : 'Notify Customer via Email'}
                  </button>
                </div>

                {/* Delete Order */}
                <div className="pt-4">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="w-full h-12 border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span> Delete Order
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
