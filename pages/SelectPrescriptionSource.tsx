import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import Toast from "../components/Toast";
import { getMyPrescriptions } from "../api/retailerApis";
import { getProductFlow } from "../utils/productFlowStorage";
import { LoginModal } from "../components/LoginModal";
import { X } from "lucide-react";

const SelectPrescriptionSource: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNewPrescription = () => {
    navigate(`/product/${id}/add-prescription`, {
      state: {
        ...state,
        prescriptionTier: state?.lensOption || state?.prescriptionTier,
      }
    });
  };

  const handleAccountPrescription = async () => {
    if (!localStorage.getItem("token")) {
      // Open login modal instead of navigating to /login page
      setShowLoginModal(true);
      return;
    }

    try {
      // Check if user has any prescriptions
      const response = await getMyPrescriptions();

      if (response.data && response.data.success && response.data.data && response.data.data.length > 0) {
        // User has prescriptions, navigate to prescription page
        navigate(`/my-prescriptions`, {
          state: {
            ...state,
            prescriptionTier: state?.lensOption || state?.prescriptionTier,
            productId: id,
            returnPath: `/product/${id}/select-prescription-source`,
          },
        });
      } else {
        // No prescriptions found, show toast
        setToast({ message: "No prescription found", type: "warning" });
      }
    } catch (error) {
      console.error("Error fetching prescriptions:", error);
      setToast({ message: "No prescription found", type: "warning" });
    }
  };

  const handleShareLater = () => {
    navigate(`/product/${id}/select-lens`, {
      state: {
        ...state,
        prescriptionMethod: "later",
        prescriptionTier: state?.lensOption || state?.prescriptionTier,
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 relative">
      {/* TOP HEADER STRIP (Stepper) */}
      <div className="hidden lg:block">
        <CheckoutStepper
          currentStep={3}
          selections={{
            2: "Bifocal/Progressive Eyeglasses",
          }}
        />
      </div>

      <div className="max-w-[1000px] mx-auto mt-4 md:mt-6">
        {/* PAGE TITLE */}
         <div className="text-center mb-8 relative md:mb-12">
          {/* Desktop Title */}
          <p className="hidden md:block text-xl md:text-2xl font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
            SELECT AN OPTION
          </p>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between border-b border-black pb-4 -mx-4 px-4 bg-[#F3F0E7]">
            <p className="text-[18px] font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
              SELECT AN OPTION
            </p>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* CARD GRID */}
        <div className="flex flex-col gap-5 max-w-[900px] mx-auto">

          {/* 🔹 TOP TWO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* NEW CUSTOMER CARD */}
            <button
              onClick={handleNewPrescription}
              className="
                w-full                 /* widened card */
                bg-[#F3F0E7]
                
                border-[1.8px]
                border-[#777]          /* darker border */
                rounded-[24px]         /* more rounded */
                p-4                   /* bigger padding */
                hover:border-[#555]
                hover:shadow-md
                transition-all
                duration-300
                text-center
                min-h-[150px]          /* slightly taller */
                flex-row md:flex-col
                items-center
                justify-center
              "
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
                New customer or new prescription?
              </h3>

              <p className="text-base text-gray-700 leading-relaxed">
                You will need your current prescription and pupillary distance (PD).
              </p>
            </button>

            {/* ACCOUNT PRESCRIPTIONS CARD */}
            <button
              onClick={handleAccountPrescription}
              className="
                w-full                 /* widened card */
                bg-[#F3F0E7]
                
                border-[1.8px]
                border-[#777]
                rounded-3xl
                p-4
                hover:border-[#555]
                hover:shadow-md
                transition-all
                duration-300
                text-center
                min-h-[150px]
                flex-row md:flex-col
                items-center
                justify-center
              "
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
                Select from my account
              </h3>

              <p className="text-base text-gray-700 leading-relaxed">
                Choose a saved prescription or select one from a previous order.
              </p>
            </button>
          </div>

          {/* 🔹 BOTTOM SINGLE CARD */}
          <div className="flex justify-center">
            <button
              onClick={handleShareLater}
              className="
                w-full
                md:w-[50%]             /* slightly wider on desktop */
                bg-[#F3F0E7]
                
                border-[1.8px]
                border-[#777]
                rounded-3xl
                p-4
                hover:border-[#555]
                hover:shadow-md
                transition-all
                duration-300
                text-center
                min-h-[150px]
                flex-row md:flex-col
                items-center
                justify-center
              "
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
                Share your prescription later
              </h3>

              <p className="text-base text-gray-700 leading-relaxed">
                Share your prescription with us after placing your order.
              </p>
            </button>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="block md:mt-12 md:static fixed bottom-6 left-0 right-0 px-4 bg-[#F3F0E7] md:bg-transparent pt-2 md:pt-0 text-center">
          <p className="text-[#1F1F1F] text-sm font-medium">
            Use your benefits—we accept HSA/FSA Payments.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onNext={(email) => {
          setShowLoginModal(false);
          // Navigate to full login page with email
          navigate("/login", { state: { email } });
        }}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default SelectPrescriptionSource;
