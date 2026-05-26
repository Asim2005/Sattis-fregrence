import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import useCartStore, { getCartSubtotal, getCartShipping } from '../stores/cartStore';
import { ordersAPI, couponsAPI, settingsAPI } from '../services/api';
import { getImageUrl } from '../utils/image';
import toast from 'react-hot-toast';



export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const navigate = useNavigate();

  // Use the reliable plain helper functions - not the broken Zustand getters
  const subtotal     = getCartSubtotal(items);
  const shippingTotal = getCartShipping(items);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [siteSettings, setSiteSettings] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '',
    paymentMethod: 'cod'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    settingsAPI.getAll()
      .then(res => {
        setSiteSettings(res.data.data);
      })
      .catch(err => {
        console.error('Failed to fetch store settings:', err);
      });
  }, []);

  // Calculate dynamic shipping fee using admin settings
  const getDynamicShipping = () => {
    if (!siteSettings) return shippingTotal;

    const shippingType = siteSettings.shipping_type || 'per_item';
    const flatFee = parseFloat(siteSettings.shipping_fee || 250);
    const threshold = parseFloat(siteSettings.free_shipping_threshold || 3000);

    if (subtotal >= threshold) {
      return 0;
    }

    if (shippingType === 'flat') {
      return flatFee;
    } else {
      return items.reduce(
        (sum, i) => sum + parseFloat(i.shipping_fee || 0) * i.quantity,
        0
      );
    }
  };

  const calculatedShipping = getDynamicShipping();

  // Advanced Discount Calculation
  let discountAmount = 0;
  let shippingDiscount = 0;

  if (appliedCoupon) {
    const type = appliedCoupon.discount_type || 'percentage';
    const val = parseFloat(appliedCoupon.discount_value);
    if (type === 'percentage') {
      discountAmount = (subtotal * val) / 100;
    } else if (type === 'fixed') {
      discountAmount = Math.min(val, subtotal);
    } else if (type === 'shipping') {
      shippingDiscount = Math.min(val, calculatedShipping);
    }
  }

  const finalShipping = Math.max(0, calculatedShipping - shippingDiscount);
  const finalTotal = (subtotal - discountAmount) + finalShipping;


  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await couponsAPI.validate(couponCode);
      const coupon = res.data.data;
      setAppliedCoupon(coupon);
      
      let msg = `Coupon applied! `;
      if (coupon.discount_type === 'percentage') msg += `${coupon.discount_value}% OFF`;
      else if (coupon.discount_type === 'fixed') msg += `Rs. ${coupon.discount_value} OFF`;
      else msg += `Rs. ${coupon.discount_value} Shipping Discount`;
      
      toast.success(msg);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code.');
      setAppliedCoupon(null);
    }
  };

  if (items.length === 0 && step < 3) {
    return (
      <div className="pt-32 pb-20 text-center min-h-screen">
        <h1 className="font-serif text-3xl mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8">Add some fragrances before checking out.</p>
        <Link to="/products" className="px-8 py-3 bg-black text-white rounded-full">Explore Collection</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      window.scrollTo(0, 0);
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        full_name:      `${formData.firstName} ${formData.lastName}`.trim(),
        email:          formData.email,
        phone:          formData.phone,
        address:        formData.address,
        city:           formData.city,
        country:        'Pakistan',
        payment_method: formData.paymentMethod.toUpperCase(),
        sender_name:    formData.senderName || '',
        items:          items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.sale_price ?? i.price })),
        subtotal,
        shipping_fee:   finalShipping,
        total_amount:   finalTotal,
        coupon_code:    appliedCoupon?.code || null
      };
      
      const res = await ordersAPI.create(orderData);
      if (res.data.success) {
        toast.success('Order placed successfully!');
        
        // Save the details for showing the receipt to the customer
        const receiptDetails = {
          orderId: res.data.data.order_id,
          fullName: orderData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          paymentMethod: formData.paymentMethod,
          items: [...items], // Clone the items array before clearing the cart
          subtotal,
          shipping: finalShipping,
          discount: discountAmount,
          total: finalTotal
        };
        
        setPlacedOrder(receiptDetails);
        clearCart();
        setStep(3);
        window.scrollTo(0, 0);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Progress Bar */}
        <div className="max-w-xl mx-auto mb-12 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          {[1, 2, 3].map((s) => (
            <div key={s} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-500'}`}>
              {s}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Form Side */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="font-serif text-2xl mb-8">Shipping Information</h2>
                  <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">First Name</label>
                        <input required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Last Name</label>
                        <input required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Email</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Phone</label>
                        <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Full Address</label>
                      <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">City</label>
                        <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">State</label>
                        <input required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Zip Code</label>
                        <input required value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm" />
                      </div>
                    </div>
                    <button type="submit" className="w-full h-14 bg-black text-white rounded-full text-sm tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors mt-4">
                      Continue to Payment
                    </button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <h2 className="font-serif text-2xl mb-8">Payment Method</h2>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="space-y-4 mb-8">
                      {/* Cash on Delivery */}
                      <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-black bg-black/5' : 'border-gray-100 hover:border-gray-200'}`}>
                        <div className="flex items-center gap-4">
                          <input type="radio" name="pay" checked={formData.paymentMethod === 'cod'} onChange={() => setFormData({...formData, paymentMethod: 'cod'})} className="accent-black w-4 h-4" />
                          <div>
                            <p className="text-sm font-bold uppercase tracking-widest">Cash on Delivery (COD)</p>
                            <p className="text-xs text-gray-400 mt-1">Pay with cash upon delivery of your order.</p>
                          </div>
                        </div>
                      </label>

                      {/* EasyPaisa */}
                      <div className={`rounded-2xl border-2 transition-all overflow-hidden ${formData.paymentMethod === 'easypaisa' ? 'border-black' : 'border-gray-100'}`}>
                        <label className={`flex items-center justify-between p-5 cursor-pointer ${formData.paymentMethod === 'easypaisa' ? 'bg-black/5' : 'hover:bg-gray-50'}`}>
                          <div className="flex items-center gap-4">
                            <input type="radio" name="pay" checked={formData.paymentMethod === 'easypaisa'} onChange={() => setFormData({...formData, paymentMethod: 'easypaisa'})} className="accent-black w-4 h-4" />
                            <div>
                              <p className="text-sm font-bold uppercase tracking-widest">EasyPaisa</p>
                              <p className="text-xs text-gray-400 mt-1">Transfer directly to our EasyPaisa account.</p>
                            </div>
                          </div>
                        </label>
                        
                        <AnimatePresence>
                          {formData.paymentMethod === 'easypaisa' && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-5 pb-5 pt-2 bg-black/5 border-t border-black/5"
                            >
                              <div className="bg-white p-5 rounded-xl border border-black/5 space-y-3 mb-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400">Transfer Instructions</p>
                                <div className="space-y-1">
                                  <p className="text-sm"><span className="text-gray-400">Title:</span> <span className="font-bold">Jahanzaib Ali Khan</span></p>
                                  <p className="text-sm"><span className="text-gray-400">Account:</span> <span className="font-bold">03116563500</span></p>
                                </div>
                                <p className="text-[10px] text-gray-500 leading-relaxed">Please transfer the total amount to the above account and provide the sender's name below for verification.</p>
                              </div>
                              <div>
                                <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Sender's Name / Account Name</label>
                                <input 
                                  required 
                                  placeholder="e.g. Ahmad Khan"
                                  value={formData.senderName || ''} 
                                  onChange={e => setFormData({...formData, senderName: e.target.value})} 
                                  className="w-full h-12 px-4 rounded-xl border border-gray-100 bg-white focus:border-black outline-none transition-all text-sm" 
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="flex-1 h-14 border border-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                        Back
                      </button>
                      <button onClick={handleSubmit} disabled={loading} className="flex-1 h-14 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-all disabled:opacity-50">
                        {loading ? 'Processing...' : 'Complete Order'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-2xl mx-auto py-6"
                >
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                      ✓
                    </div>
                    <h2 className="font-serif text-3xl mb-2">Thank You!</h2>
                    <p className="text-gray-500 text-sm">Your order has been placed successfully.</p>
                  </div>

                  {placedOrder ? (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6 text-left">
                      <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-gray-400">Order Number</p>
                          <p className="font-bold text-lg">#{placedOrder.orderId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-gray-400">Date</p>
                          <p className="font-bold text-sm">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Shipping Details</p>
                        <div className="text-sm space-y-1 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-50">
                          <p className="font-semibold text-black">{placedOrder.fullName}</p>
                          <p>{placedOrder.address}</p>
                          <p>{placedOrder.city}, {placedOrder.state} {placedOrder.zip}</p>
                          <p className="text-xs text-gray-500 pt-1">Phone: {placedOrder.phone} | Email: {placedOrder.email}</p>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2">Items Ordered</p>
                        <div className="divide-y divide-gray-100">
                          {placedOrder.items.map((item) => (
                            <div key={item.id} className="py-3 flex gap-4 items-center">
                              <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={getImageUrl(item.images?.[0]?.image_path || item.primary_image)} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">Rs. {((item.sale_price ?? item.price) * item.quantity).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Totals */}
                      <div className="pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Subtotal</span>
                          <span>Rs. {placedOrder.subtotal.toLocaleString()}</span>
                        </div>
                        {placedOrder.discount > 0 && (
                          <div className="flex justify-between text-xs text-green-600 font-medium">
                            <span>Discount</span>
                            <span>- Rs. {placedOrder.discount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Shipping Fee</span>
                          <span>{placedOrder.shipping === 0 ? 'FREE' : `Rs. ${placedOrder.shipping}`}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold pt-2 border-t border-dashed border-gray-200">
                          <span>Total Amount</span>
                          <span className="text-lg">Rs. {placedOrder.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400 pt-1">
                          <span>Payment Method</span>
                          <span className="font-bold text-black">{placedOrder.paymentMethod.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">We'll send you a confirmation email shortly.</p>
                  )}

                  <div className="text-center mt-8">
                    <Link to="/" className="inline-block px-12 py-4 bg-black text-white rounded-full text-sm tracking-widest uppercase font-medium hover:bg-gray-800 transition-colors">
                      Back to Store
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Side */}
          {step < 3 && (
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-16 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(item.images?.[0]?.image_path || item.primary_image)} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">{item.category_name}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold mt-1">Rs. {((item.sale_price ?? item.price) * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3 pt-6 border-t border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>Rs. {subtotal.toLocaleString()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>
                        Discount {appliedCoupon.discount_type === 'percentage' 
                          ? `(${appliedCoupon.discount_value}%)` 
                          : appliedCoupon.discount_type === 'fixed' 
                            ? '(Flat)' 
                            : '(Shipping)'}
                      </span>
                      <span>- Rs. {discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Shipping</span>
                    <span>{finalShipping === 0 ? 'FREE' : `Rs. ${finalShipping}`}</span>
                  </div>
                  {shippingDiscount > 0 && (
                    <div className="flex justify-between text-[10px] text-green-600 font-bold uppercase tracking-widest -mt-2">
                      <span>Shipping Discount Applied</span>
                      <span>- Rs. {shippingDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3">
                    <span>Total</span>
                    <span>Rs. {finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Coupon Input */}
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-2 block">Promo Code</label>
                  <div className="flex gap-2">
                    <input 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 h-12 px-4 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all text-sm font-bold tracking-widest"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="px-6 bg-black text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
