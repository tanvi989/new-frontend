import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CaptureProvider } from './contexts/CaptureContext';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import CustomerView from './components/CustomerView';
import ForgotPassword from './pages/ForgotPassword';
import Login from './pages/Login';
import ScrollToTop from './components/ScrollToTop';
import NewEyeCheck from './pages/NewEyeCheck';
import EyeCheckups from './pages/EyeCheckups';
import Payment from './components/product/Payment';
import Thanks from './components/product/Thanks';
import Layout from './layouts/Layout';
import Appointments from './pages/Appointments';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import KnowledgeBase from './pages/KnowledgeBase';
import AboutUs from './pages/AboutUs';
import MenCollection from './pages/MenCollection';
import AllProducts from './pages/AllProducts';
import GlassesPage from './pages/GlassesPage';
import GlassesMobile from './pages/GlassesMobile';
import WomenCollection from './pages/WomenCollection';
import Cart from './pages/Cart';
import CheckoutPreview from './pages/CheckoutPreview';

import ContactUs from './pages/ContactUs';
import Help from './pages/Help';
import NewMultifocal from './pages/NewMultifocal';
import NewBifocal from './pages/NewBifocal';
import ReplacingMultifocal from './pages/ReplacingMultifocal';
import Orders from './pages/Orders';
import OrderView from './components/OrderView';
import Wishlist from './pages/Wishlist';
import MyPrescription from './pages/MyPrescription';
import MyProfile from './pages/MyProfile';
import RecentlyViewed from './pages/RecentlyViewed';
import Offers from './pages/Offers';
import ProductPage from './pages/ProductPage';
import SelectLenses from './pages/SelectLenses';
import SelectLensType from './pages/SelectLensType';
// import SelectLensQuality from './pages/SelectLensQuality';
import SelectLensPackages from './pages/SelectLensPackages';
import SelectLensCoatings from './pages/SelectLensCoatings';
import SelectLensColor from './pages/SelectLensColor';
import SelectPrescriptionType from './pages/SelectPrescriptionType';
import SelectPrescriptionSource from './pages/SelectPrescriptionSource';
// import AddPrescription from './pages/AddPrescription';
import ManualPrescription from './pages/ManualPrescription';
import UploadPrescription from './pages/UploadPrescription';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';

// Footer Pages - Ensuring imports exist
import Insurance from './pages/Insurance';
import ExchangePolicy from './pages/ExchangePolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import Shipping from './pages/Shipping';
import DeliveryShippingTerms from './pages/DeliveryShippingTerms';
import TermsOfUse from './pages/TermsOfUse';
import WhyMultifolks from './pages/WhyMultifolks';
import ReadyForMultifocals from './pages/ReadyForMultifocals';
import HowToOrder from './pages/HowToOrder';
import ReadPrescription from './pages/ReadPrescription';
import ChoosingRightFrame from './pages/ChoosingRightFrame';
import PickRightLens from './pages/PickRightLens';
import LensCoatings from './pages/LensCoatings';
import ReplacementChecklist from './pages/ReplacementChecklist';
import ProgressiveVsBifocal from './pages/ProgressiveVsBifocal';
import HowMultifocalsWork from './pages/HowMultifocalsWork';
import PupillaryDistance from './pages/PupillaryDistance';
import FittingHeight from './pages/FittingHeight';
import HowWeMeasure from './pages/HowWeMeasure';

import TipsForFirstTimers from './pages/TipsForFirstTimers';
import SizeGuide from './pages/SizeGuide';
import FitGuide from './pages/FitGuide';
import FirstSevenDays from './pages/FirstSevenDays';
import AdjustingToMultifocals from './pages/AdjustingToMultifocals';

import CommonMistakes from './pages/CommonMistakes';
import DrivingTips from './pages/DrivingTips';
import ProgressiveFitCheck from './pages/ProgressiveFitCheck';
import AllDayComfort from './pages/AllDayComfort';
import CleanWithoutScratches from './pages/CleanWithoutScratches';
import StorageAndHandling from './pages/StorageAndHandling';
import TravelTips from './pages/TravelTips';
import BustingTheMyth from './pages/BustingTheMyth';
import OurGuarantee from './pages/OurGuarantee';
import AllArticles from './pages/AllArticles';
import AddPrescription from './pages/AddPrescription';
// import { Checkout } from './pages/Checkout';
import { PerfectFitApp } from './perfect-fit-cam/PerfectFitApp';
import PerfectFitIndex from './perfect-fit-cam/pages/Index';
import PerfectFitResults from './perfect-fit-cam/pages/Results';
import PerfectFitNotFound from './perfect-fit-cam/pages/NotFound';

const App: React.FC = () => {
  const location = useLocation();

  // Load CookieYes consent banner
  useEffect(() => {
    const script = document.createElement('script');
    script.id = 'cookieyes';
    script.type = 'text/javascript';
    script.src = 'https://cdn-cookieyes.com/client_data/867ace6bea3c3f55f9168cd1838d01d8/script.js';
    
    document.head.appendChild(script);
    
    return () => {
      // Cleanup on unmount
      const existingScript = document.getElementById('cookieyes');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  // Define routes that should NOT use the default Navigation/Footer logic
  const isLayoutRoute = [
    '/perfect-fit',
    '/customer-view',
    '/new-eye-check',
    '/checkups',
    '/dashboard',
    '/inventory',
    '/reports',
    '/appoitments',
    '/claim-report',
    '/lens',
    '/knowledge-base',


    '/select-prescription-type',
    '/select-prescription-source',
    '/add-prescription',
    '/select-lens',
    '/select-lens-packages',
    '/select-lens-coatings',
    '/select-lens-color'
  ].some(path => location.pathname.startsWith(path))

    // 👉 dynamic OR checks (exactly like you requested)
    || location.pathname.includes("/select-lens-quality")
    || location.pathname.includes("/select-prescription-type")
    || location.pathname.includes("/select-prescription-source")
    || location.pathname.includes("/add-prescription")
    || location.pathname.includes("/select-lens")
    || location.pathname.includes("/select-lens-packages")
    || location.pathname.includes("/select-lens-coatings")
    || location.pathname.includes("/select-lens-color")
    || location.pathname.includes("/upload-prescription")
    || location.pathname.includes("/manual-prescription");


  const isStandalonePage = [
    '/login',
    '/cart',
    '/checkout-preview',

    '/payment',
    '/thank-you'
  ].includes(location.pathname);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CaptureProvider>
        <div className="min-h-screen bg-cream text-charcoal font-sans selection:bg-burnt-orange selection:text-white relative">
        <ScrollToTop />

        {!isLayoutRoute && !isStandalonePage && <Navigation />}

        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/perfect-fit" element={<PerfectFitApp><PerfectFitIndex /></PerfectFitApp>} />
            <Route path="/perfect-fit/results" element={<PerfectFitApp><PerfectFitResults /></PerfectFitApp>} />
            <Route path="/perfect-fit/*" element={<PerfectFitApp><PerfectFitNotFound /></PerfectFitApp>} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/help" element={<Help />} />
            <Route path="/glasses" element={<GlassesPage />} />
            <Route path="/glasses-m" element={<GlassesMobile />} />
            <Route path="/glasses/men" element={<MenCollection />} />
            <Route path="/glasses/women" element={<WomenCollection />} />

            {/* Footer Info Pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/insurance" element={<Insurance />} />
            <Route path="/exchange-policy" element={<ExchangePolicy />} />
            <Route path="/return-policy" element={<ReturnPolicy />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/delivery-shipping-terms" element={<DeliveryShippingTerms />} />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/why-multifolks" element={<WhyMultifolks />} />

            {/* Guides */}
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/ready-for-multifocals" element={<ReadyForMultifocals />} />
            <Route path="/how-to-order" element={<HowToOrder />} />
            <Route path="/read-your-prescription" element={<ReadPrescription />} />
            <Route path="/choosing-right-frame" element={<ChoosingRightFrame />} />
            <Route path="/pick-right-lens" element={<PickRightLens />} />
            <Route path="/lens-coatings" element={<LensCoatings />} />
            <Route path="/replacement-checklist" element={<ReplacementChecklist />} />

            {/* Multifocal Essentials */}
            <Route path="/PBS-vision" element={<ProgressiveVsBifocal />} />
            <Route path="/how-multifocal-work" element={<HowMultifocalsWork />} />
            <Route path="/pupillary-distance" element={<PupillaryDistance />} />
            <Route path="/fitting-height" element={<FittingHeight />} />
            <Route path="/how-we-measure" element={<HowWeMeasure />} />

            {/* Adaptation */}
            <Route path="/tip-first-time" element={<TipsForFirstTimers />} />
            <Route path="/fit-guide" element={<FitGuide />} />
            <Route path="/first-7-days" element={<FirstSevenDays />} />
            <Route path="/adjusting-multifocal-glasses" element={<AdjustingToMultifocals />} />
            <Route path="/common-mistakes" element={<CommonMistakes />} />
            <Route path="/driving-progressive-lenses" element={<DrivingTips />} />
            <Route path="/progressive-fit-check" element={<ProgressiveFitCheck />} />
            <Route path="/all-day-comfort" element={<AllDayComfort />} />

            {/* Care & Maintenance */}
            <Route path="/clean-scratches" element={<CleanWithoutScratches />} />
            <Route path="/storage-handling" element={<StorageAndHandling />} />
            <Route path="/how-to-travel" element={<TravelTips />} />
            <Route path="/bursting-the-myth" element={<BustingTheMyth />} />
            <Route path="/our-guarantee" element={<OurGuarantee />} />
            <Route path="/all-article" element={<AllArticles />} />

            {/* Product Flow */}
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/product/:id/select-prescription-type" element={<SelectPrescriptionType />} />
            {/* <Route path="/product/:id/select-lens-quality" element={<SelectLensQuality />} /> */}
            <Route path="/product/:id/select-lens-type" element={<SelectLensType />} />
            <Route path="/product/:id/select-lens-packages" element={<SelectLensPackages />} />
            <Route path="/product/:id/select-lens-coatings" element={<SelectLensCoatings />} />
            <Route path="/product/:id/select-lens-color" element={<SelectLensColor />} />
            <Route path="/product/:id/select-prescription-source" element={<SelectPrescriptionSource />} />
            <Route path="/product/:id/add-prescription" element={<AddPrescription />} />
            <Route path="/product/:id/manual-prescription" element={<ManualPrescription />} />
            <Route path="/product/:id/upload-prescription" element={<UploadPrescription />} />
            <Route path="/product/:id/select-lens" element={<SelectLensType />} />
            <Route path="/product/:id/select-lenses" element={<SelectLenses />} />

            {/* <Route path="/product/:id/checkout" element={<Checkout/>} /> */}

            {/* New Multifocal Landing Pages */}
            <Route path="/multifocals/new" element={<NewMultifocal />} />
            <Route path="/multifocals/bifocal" element={<NewBifocal />} />
            <Route path="/multifocals/replacing" element={<ReplacingMultifocal />} />

            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout-preview" element={<CheckoutPreview />} />

            <Route path="/add-prescription" element={<AddPrescription />} />
            <Route path="/manual-prescription" element={<ManualPrescription />} />
            <Route path="/upload-prescription" element={<UploadPrescription />} />
            <Route path="/shop" element={<AllProducts />} />

            {/* Account Routes */}
            <Route path="/my-profile" element={<MyProfile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order-details" element={<OrderView />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/my-prescriptions" element={<MyPrescription />} />
            <Route path="/recently-viewed" element={<RecentlyViewed />} />
            <Route path="/offers" element={<Offers />} />

            {/* Dashboard/Protected Routes Wrapped in Layout */}
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/customer-view" element={<CustomerView />} />
              <Route path="/new-eye-check" element={<NewEyeCheck />} />
              <Route path="/checkups" element={<EyeCheckups />} />
              <Route path="/appoitments" element={<Appointments />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/knowledge-base" element={<KnowledgeBase />} />

              <Route path="/reports" element={<div className="p-8 text-center text-gray-600 font-bold text-xl">Reports Module Coming Soon</div>} />

              {/* Placeholder routes for sidebar links */}
              <Route path="/lens" element={<div className="p-8 text-center text-gray-600 font-bold text-xl">Lens Inventory</div>} />
              <Route path="/claim-report" element={<div className="p-8 text-center text-gray-600 font-bold text-xl">Claim Report Module Coming Soon</div>} />
            </Route>

            {/* Checkout Flow (Standalone) */}
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/thank-you" element={<Thanks />} />

            {/* Catch-all for undefined routes */}
            <Route path="*" element={
              <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-4">
                <h1 className="text-4xl font-bold text-[#232320] mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page Not Found</p>
                <p className="text-gray-500 max-w-md">The page you are looking for might be under construction or does not exist.</p>
                <a href="/" className="mt-8 px-6 py-3 bg-[#232320] text-white rounded-full font-bold uppercase tracking-widest hover:bg-black transition-colors">
                  Go Home
                </a>
              </div>
            } />
          </Routes>
        </main>

        {!isLayoutRoute && !isStandalonePage && <Footer />}

        {/* <button
          onClick={scrollToTop}
          className={`fixed bottom-24 right-8 w-10 h-10 bg-[#FF3B19] rounded-full flex items-center justify-center shadow-lg z-50 hover:bg-[#e03516] transition-colors border-2 border-white/10 ${isStandalonePage ? 'hidden' : ''}`}
          aria-label="Scroll to top"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button> */}
        </div>
      </CaptureProvider>
    </AuthProvider>
  );
};

export default App;