// import React from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";

// interface CheckoutStepperProps {
//   currentStep: 1 | 2 | 3 | 4;
//   selections?: Record<number, string>;
// }

// const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
//   currentStep,
//   selections,
// }) => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const { state } = useLocation();

//   const steps = [
//     { step: 1, label: "Select Your Frame", path: -1 },
//     { step: 2, label: "Select Prescription Type", path: null },
//     { step: 3, label: "Add Your Prescription", path: null },
//     { step: 4, label: "Select Your Lenses", path: null },
//   ];

//   const handleNavigation = (stepIdx: number) => {
//     if (stepIdx === 3 && id) {
//       navigate(`/product/${id}/add-prescription`, { state });
//     } else if (stepIdx < currentStep) {
//       navigate(-1);
//     }
//   };

//   return (
//     <div className="w-full max-w-[850px] mx-auto mb-12 px-4 font-sans">
//       <div className="flex items-center justify-between relative">

//         {/* Background Line */}
//         <div className="absolute top-[26px] left-0 w-full h-[2px] bg-gray-200 -z-10"></div>

//         {/* Active Line */}
//         <div
//           className="absolute top-[26px] left-0 h-[2px] bg-[#232320] -z-10 transition-all duration-500"
//           style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
//         ></div>

//         {steps.map((s) => {
//           const isActive = s.step <= currentStep;
//           const isCurrent = s.step === currentStep;
//           const selectionText = selections?.[s.step];

//           return (
//             <div
//               key={s.step}
//               className={`flex flex-col items-center gap-2 cursor-pointer transition-opacity 
//               ${isActive ? "opacity-100" : "opacity-50"}`}
//               onClick={() => handleNavigation(s.step)}
//             >
//               {/* Step Icon Circle */}
//               <div
//                 className={`w-11 h-11 rounded-full flex items-center justify-center border-4 shadow 
//                 transition-all duration-300
//                 ${isActive
//                     ? "bg-[#232320] text-white border-[#E5E3DC]"
//                     : "bg-white text-gray-400 border-gray-300"
//                   }
//                 ${isCurrent ? "ring-2 ring-[#232320] ring-offset-[3px]" : ""}`}
//               >
//                 {/* ICONS */}
//                 {s.step === 1 && (
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M2 12h20"></path>
//                     <circle cx="6" cy="12" r="4"></circle>
//                     <circle cx="18" cy="12" r="4"></circle>
//                   </svg>
//                 )}

//                 {s.step === 2 && (
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
//                     <circle cx="12" cy="12" r="3"></circle>
//                   </svg>
//                 )}

//                 {s.step === 3 && (
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
//                     <polyline points="14 2 14 8 20 8"></polyline>
//                     <line x1="16" y1="13" x2="8" y2="13"></line>
//                     <line x1="16" y1="17" x2="8" y2="17"></line>
//                   </svg>
//                 )}

//                 {s.step === 4 && (
//                   <svg
//                     width="16"
//                     height="16"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   >
//                     <circle cx="12" cy="12" r="10"></circle>
//                     <circle cx="12" cy="12" r="4"></circle>
//                   </svg>
//                 )}
//               </div>

//               {/* TEXT */}
//               <div className="text-center max-w-[130px] leading-snug">
//                 <p
//                   className={`text-[11px] font-semibold uppercase tracking-wide 
//                   ${isActive ? "text-[#232320]" : "text-gray-400"}`}
//                 >
//                   {s.label}
//                 </p>

//                 {selectionText && (
//                   <p className="text-[10px] font-semibold text-[#009FE3] mt-0.5 leading-tight">
//                     {selectionText}
//                   </p>
//                 )}

//                 {isCurrent && !selectionText && (
//                   <p className="text-[9px] text-[#D96C47] font-medium animate-pulse mt-0.5">
//                     In Progress
//                   </p>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default CheckoutStepper;


import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3 | 4;
  selections?: Record<number, string>;
}

const CheckoutStepper: React.FC<CheckoutStepperProps> = ({
  currentStep,
  selections,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();

  const productId =
    id ||
    (state as any)?.product?.id ||
    (state as any)?.product?.skuid ||
    (state as any)?.id;

  const stepRoutes: Record<number, string | null> = {
    1: productId ? `/product/${productId}` : null,
    2: productId ? `/product/${productId}/select-prescription-type` : null,
    3: productId ? `/product/${productId}/add-prescription` : null,
    4: productId ? `/product/${productId}/select-lens-coatings` : null,
  };

  const steps = [
    { step: 1, label: "Select Your Frame" },
    { step: 2, label: "Select Prescription Type" },
    { step: 3, label: "Add Your Prescription" },
    { step: 4, label: "Select Your Lenses" },
  ];

  const handleNavigation = (targetStep: number) => {
    if (targetStep > currentStep) return;
    if (!productId && targetStep > 1) return;
    const path = stepRoutes[targetStep];
    if (path) navigate(path, { state });
  };

  const productDetailPath = productId ? `/product/${productId}` : null;

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 md:px-8 pt-2 md:pt-6 pb-4 md:pb-10 font-sans relative">
      {productDetailPath && (
        <button
          type="button"
          aria-label="Exit flow"
          onClick={() => navigate(productDetailPath, { state })}
          className="absolute right-4 md:right-0 top-2 md:-top-2 text-gray-400 hover:text-gray-600 transition-colors p-2 z-20"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      <div className="flex flex-col w-full">
        {/* Mobile Condensed View - Hidden on mobile as per user request */}
        <div className="hidden">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[#1F1F1F] font-bold uppercase text-sm tracking-wider">
              {steps.find(s => s.step === currentStep)?.label}
            </span>
            <span className="text-gray-500 text-xs font-medium">
              Step {currentStep}/4
            </span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#232320] transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop Full View */}
        <div className="hidden md:flex items-center gap-3 md:gap-4">
          {steps.map((s, idx) => {
            const isActive = s.step <= currentStep;
            const isCurrent = s.step === currentStep;
            const isCompleted = s.step < currentStep;
            const showSelection = selections?.[s.step];
            const connectorProgress = isCompleted ? "100%" : isCurrent ? "50%" : "0%";

            return (
              <div key={s.step} className="flex items-center flex-1">
                <div
                  className={`flex flex-col items-center gap-2 cursor-pointer transition-opacity flex-shrink-0 min-w-[98px] ${isActive ? "opacity-100" : "opacity-50"
                    }`}
                  onClick={() => handleNavigation(s.step)}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-4 shadow transition-all duration-300 ${isActive
                      ? "bg-[#232320] text-white border-[#E5E3DC]"
                      : "bg-white text-gray-400 border-gray-300"
                      } ${isCurrent ? "ring-2 ring-[#232320] ring-offset-[3px]" : ""}`}
                  >
                    {s.step === 1 && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12h20"></path>
                        <circle cx="6" cy="12" r="4"></circle>
                        <circle cx="18" cy="12" r="4"></circle>
                      </svg>
                    )}

                    {s.step === 2 && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}

                    {s.step === 3 && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                    )}

                    {s.step === 4 && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="4"></circle>
                      </svg>
                    )}
                  </div>

                  <div className="text-center max-w-[140px] leading-snug mt-1">
                    <p
                      className={`text-[11px] font-semibold uppercase tracking-wide ${isActive ? "text-[#232320]" : "text-gray-400"
                        }`}
                    >
                      {s.label}
                    </p>

                    {showSelection && (
                      <p className="text-[10px] font-semibold text-[#009FE3] mt-0.5 leading-tight">
                        {showSelection}
                      </p>
                    )}
                  </div>
                </div>

                {idx < steps.length - 1 && (
                  <div className="flex-1 h-[2px] relative mx-2 md:mx-3">
                    <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                    <div
                      className="absolute inset-0 bg-[#232320] rounded-full transition-all duration-500"
                      style={{ width: connectorProgress }}
                    ></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CheckoutStepper;
