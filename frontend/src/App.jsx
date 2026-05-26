import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Lazy-loaded pages for code-splitting & faster initial load
import { lazy, Suspense } from 'react';

const HomePage       = lazy(() => import('./pages/HomePage'));
const ProductsPage   = lazy(() => import('./pages/ProductsPage'));
const ProductDetail  = lazy(() => import('./pages/ProductDetail'));
const CheckoutPage   = lazy(() => import('./pages/CheckoutPage'));
const LoginPage      = lazy(() => import('./pages/LoginPage'));
const RegisterPage   = lazy(() => import('./pages/RegisterPage'));
const AccountPage    = lazy(() => import('./pages/AccountPage'));
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts  = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders    = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers     = lazy(() => import('./pages/admin/AdminUsers'));
const AdminHero      = lazy(() => import('./pages/admin/AdminHero'));
const AdminSettings  = lazy(() => import('./pages/admin/AdminSettings'));
const AdminReviews   = lazy(() => import('./pages/admin/AdminReviews'));
const ScentQuiz      = lazy(() => import('./pages/ScentQuiz'));
const WishlistPage   = lazy(() => import('./pages/WishlistPage'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCoupons    = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminDiscoverBoxes = lazy(() => import('./pages/admin/AdminDiscoverBoxes'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const NotFound       = lazy(() => import('./pages/NotFound'));

// Lazy-loaded static info pages
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const ContactPage    = lazy(() => import('./pages/ContactPage'));
const FAQPage        = lazy(() => import('./pages/FAQPage'));
const TermsPage      = lazy(() => import('./pages/TermsPage'));
const PrivacyPage    = lazy(() => import('./pages/PrivacyPage'));
const ShippingPage   = lazy(() => import('./pages/ShippingPage'));
const ReturnsPage    = lazy(() => import('./pages/ReturnsPage'));


function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <CartDrawer />

      <Routes>
        {/* ── Admin routes (no Navbar/Footer) ─────────────── */}
        <Route
          path="/admin"
          element={<Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>}
        >
          <Route index element={<Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense>} />
          <Route path="products" element={<Suspense fallback={<PageLoader />}><AdminProducts /></Suspense>} />
          <Route path="categories" element={<Suspense fallback={<PageLoader />}><AdminCategories /></Suspense>} />
          <Route path="orders"   element={<Suspense fallback={<PageLoader />}><AdminOrders /></Suspense>} />
          <Route path="users"    element={<Suspense fallback={<PageLoader />}><AdminUsers /></Suspense>} />
          <Route path="hero"     element={<Suspense fallback={<PageLoader />}><AdminHero /></Suspense>} />
          <Route path="reviews"  element={<Suspense fallback={<PageLoader />}><AdminReviews /></Suspense>} />
          <Route path="coupons"  element={<Suspense fallback={<PageLoader />}><AdminCoupons /></Suspense>} />
          <Route path="discover-boxes" element={<Suspense fallback={<PageLoader />}><AdminDiscoverBoxes /></Suspense>} />
          <Route path="newsletter" element={<Suspense fallback={<PageLoader />}><AdminNewsletter /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><AdminSettings /></Suspense>} />

        </Route>

        {/* ── Public routes (with Navbar/Footer) ───────────── */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <main>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route index          element={<HomePage />} />
                    <Route path="products"              element={<ProductsPage />} />
                    <Route path="products/:category"    element={<ProductsPage />} />
                    <Route path="product/:slug"         element={<ProductDetail />} />
                    <Route path="scent-quiz"          element={<ScentQuiz />} />
                    <Route path="wishlist"            element={<WishlistPage />} />
                    <Route path="checkout"              element={<CheckoutPage />} />
                    <Route path="login"                 element={<LoginPage />} />
                    <Route path="register"              element={<RegisterPage />} />
                    <Route path="account"               element={<AccountPage />} />
                    <Route path="account/orders"        element={<AccountPage tab="orders" />} />
                    <Route path="about"                 element={<AboutPage />} />
                    <Route path="contact"               element={<ContactPage />} />
                    <Route path="faq"                   element={<FAQPage />} />
                    <Route path="terms"                 element={<TermsPage />} />
                    <Route path="privacy"               element={<PrivacyPage />} />
                    <Route path="shipping"              element={<ShippingPage />} />
                    <Route path="returns"               element={<ReturnsPage />} />
                    <Route path="*"                     element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
