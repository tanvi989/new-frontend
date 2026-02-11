import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import { savePrescriptionType } from "../utils/productFlowStorage";

// Image paths for Select Lens Type page – files in public/ (Precision+, Advanced, Standard)
const IMG_PRECISION_PLUS = "/Specs 3.png";
const IMG_ADVANCED = "/Specs 2.png";
const IMG_STANDARD = "/specs 1.png";

const SelectPrescriptionType: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useLocation();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedType, setSelectedType] = useState<"progressive" | "bifocal" | "single" | null>(
    null
  );
  const [expanded, setExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<"advanced" | "standard" | "precision" | null>(null);

  // Reset to unexpanded view when navigating to this page
  useEffect(() => {
    setExpanded(false);
    setSelectedType(null);
    setSelectedOption(null);
  }, [location.pathname]);

  const handleBifocalClick = () => {
    if (id) savePrescriptionType(id, { lensType: "bifocal" });
    navigate(`/product/${id}/select-prescription-source`, {
      state: { ...state, lensType: "bifocal" },
    });
  };

  const handleSingleClick = () => {
    if (id) savePrescriptionType(id, { lensType: "single" });
    navigate(`/product/${id}/select-prescription-source`, {
      state: { ...state, lensType: "single" },
    });
  };

  const handleProgressiveClick = () => {
    setSelectedType("progressive");
    setExpanded(true);
  };

  const handleMobileOptionSelect = (option: "advanced" | "standard" | "precision") => {
    if (id) savePrescriptionType(id, { lensType: "progressive", prescriptionTier: option === "precision" ? "advanced" : option });
    navigate(`/product/${id}/select-prescription-source`, {
      state: { ...state, lensType: "progressive", lensOption: option === "precision" ? "advanced" : option, precisionPlus: option === "precision" },
    });
  };

  const handleContinue = () => {
    if (!selectedType) return;
    if (expanded && !selectedOption) return;
    const prescriptionTier = selectedOption === "precision" ? "advanced" : selectedOption ?? undefined;
    if (id) savePrescriptionType(id, { lensType: selectedType, prescriptionTier });
    navigate(`/product/${id}/select-prescription-source`, {
      state: { ...state, lensType: selectedType, lensOption: selectedOption === "precision" ? "advanced" : selectedOption, precisionPlus: selectedOption === "precision" },
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 mt-0 pb-20 md:pb-8">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <CheckoutStepper currentStep={2} />
      </div>

      <div className="max-w-[1000px] mx-auto relative mt-4 md:mt-6">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between border-b border-black py-2 mb-6">
          <p className="text-lg font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
            SELECT LENS TYPE
          </p>
          <button
            onClick={() => {
              if (expanded) {
                setExpanded(false);
                setSelectedType(null);
              } else {
                navigate(-1);
              }
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block text-center mb-6">
          <p className="text-2xl font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
            SELECT LENS TYPE
          </p>
        </div>

        {/* Main Content Area */}
        {!expanded ? (
          <>
            {/* First Row - Progressive and Bifocal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 max-w-[900px] mx-auto">
              {/* Progressive Lenses Section */}
              <div
                onClick={handleProgressiveClick}
                className={`flex flex-col w-full 
                  rounded-3xl p-6 border cursor-pointer 
                  ${selectedType === "progressive"
                    ? "border-green-600 shadow-sm"
                    : "bg-[#F3F0E7] border-gray-300"
                  }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="45" height="33" viewBox="0 0 53 47" fill="none">
                        <path d="M41.3712 25.8687C45.3008 25.0141 47.4296 24.4347 51.1073 23.0869C50.8825 26.2267 50.2407 27.9874 48.6037 31.154C46.2581 35.6774 44.8235 37.5897 42.2056 40.0556C42.7845 38.3723 43.0078 37.0979 42.762 35.0485L40.8148 30.3195C39.831 27.9259 39.6186 26.7623 41.3712 25.8687Z" fill="#F3C507" stroke="#E94D37" strokeWidth="0.5" strokeDasharray="2 2"></path>
                        <path d="M10.8542 26.4248C6.92456 25.5703 4.7957 24.9909 1.11804 23.6431C1.34289 26.7829 1.98460 28.5435 3.62162 31.7102C5.96719 36.2336 7.40183 38.1458 10.0198 40.6118C9.44080 38.9285 9.21751 37.6541 9.46330 35.6046L11.4105 30.8756C12.3944 28.4821 12.6067 27.3185 10.8542 26.4248Z" fill="#F3C507" stroke="#E94D37" strokeWidth="0.5" strokeDasharray="2 2"></path>
                        <path d="M47.2125 7.50894C34.4162 -0.558067 16.335 -1.3932 6.31448 6.50371C-3.70609 14.4006 1.31377 38.1077 14.1099 43.1149C26.906 48.122 35.0022 44.0876 35.5293 43.9499C36.0565 43.8121 42.4837 41.1681 45.8218 35.8828C52.2199 26.9812 55.1213 12.4948 47.2125 7.50894Z" stroke="#E94D37"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-[#1F1F1F]">
                        Progressive / varifocal lenses
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-snug md:leading-normal">
                        <span className="md:hidden">Corrects for near, mid and far distance with a smooth transition.</span>
                        <span className="hidden md:inline">Seamless vision across distances.</span>
                      </p>
                    </div>
                  </div>

                  {/* Arrow (Mobile) or Radio (Desktop) */}
                  <div className="md:hidden flex items-center justify-center self-center">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                      <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="hidden md:block">
                    {selectedType === "progressive" ? (
                      <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bifocal Lenses Section */}
              <div
                className={`flex flex-col w-full 
                  rounded-3xl p-6 border cursor-pointer 
                  ${selectedType === "bifocal"
                    ? "border-green-600 shadow-sm"
                    : "bg-[#F3F0E7] border-gray-300"
                  }`}
                onClick={handleBifocalClick}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0">
                      <svg width="45" height="33" viewBox="0 0 45 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M37.0428 5.27222C28.0581 -0.391845 15.3628 -0.978215 8.32715 4.56642C1.29143 10.111 4.81601 26.7565 13.8005 30.2722C22.785 33.7878 28.4696 30.9551 28.8397 30.8584C29.2098 30.7617 33.7226 28.9053 36.0663 25.1943C40.5586 18.9442 42.5958 8.77293 37.0428 5.27222Z" stroke="#E94D37" stroke-width="0.702128"></path>
                        <path d="M23 26C28.5228 26 33 23.9853 33 21.5C33 19.0147 28.5228 17 23 17C17.4772 17 13 19.0147 13 21.5C13 23.9853 17.4772 26 23 26Z" fill="#F3C507" stroke="#E94D37" stroke-width="0.35" stroke-dasharray="1.4 1.4"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-[#1F1F1F] mb-1">
                        Bifocal Lenses
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-snug md:leading-normal">
                        <span className="md:hidden">Distance & near vision in the same lenses.</span>
                        <span className="hidden md:inline">Distance & Near vision in same lenses.</span>
                      </p>
                    </div>
                  </div>

                  <div className="md:hidden flex items-center justify-center self-center">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                      <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="hidden md:block">
                    {selectedType === "bifocal" ? (
                      <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Second Row - Single Vision (Centered on Desktop) */}
            <div className="flex justify-center md:justify-center mb-12">
              <div
                className={`flex flex-col w-full md:w-[45%] max-w-[450px]
                  rounded-3xl p-6 border cursor-pointer 
                  ${selectedType === "single"
                    ? "border-green-600 shadow-sm"
                    : "bg-[#F3F0E7] border-gray-300"
                  }`}
                onClick={handleSingleClick}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 shrink-0">
                      <svg width="45" height="33" viewBox="0 0 45 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M37.0428 5.27222C28.0581 -0.391845 15.3628 -0.978215 8.32715 4.56642C1.29143 10.111 4.81601 26.7565 13.8005 30.2722C22.785 33.7878 28.4696 30.9551 28.8397 30.8584C29.2098 30.7617 33.7226 28.9053 36.0663 25.1943C40.5586 18.9442 42.5958 8.77293 37.0428 5.27222Z" stroke="#E94D37" stroke-width="0.702128"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-[#1F1F1F] mb-1">
                        Single Vision Lenses
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 leading-snug md:leading-normal">
                        <span className="md:hidden">Corrects for one field of vision: near, intermediate or distance.</span>
                        <span className="hidden md:inline">Corrects for one field of vision.</span>
                      </p>
                    </div>
                  </div>

                  <div className="md:hidden flex items-center justify-center self-center">
                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                      <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="hidden md:block">
                    {selectedType === "single" ? (
                      <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center">
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Expanded View */
          <div className="grid gap-5 mb-12 max-w-[900px] mx-auto grid-cols-1">
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Precision+ Options - First */}
                <div
                  onClick={() => {
                    setSelectedOption("precision");
                    if (window.innerWidth < 768) {
                      handleMobileOptionSelect("precision");
                    }
                  }}
                  className={`flex flex-col p-5 rounded-3xl border-2 cursor-pointer
                    ${selectedOption === "precision"
                      ? "border-green-600 shadow-md"
                      : "border-gray-400"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-semibold bg-black text-white px-2 py-1 rounded mb-1 uppercase tracking-wider inline-block">Recommended for Repeat Multifocal Users</p>
                      <h3 className="text-lg md:text-base font-bold text-[#1F1F1F]">
                        Precision+ Options
                      </h3>
                    </div>
                    {/* Arrow (Mobile) or Radio (Desktop) */}
                    <div className="md:hidden flex items-center justify-center">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="hidden md:block">
                      {selectedOption === "precision" ? (
                        <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-5 items-center md:items-start">
                    <img
                      src={IMG_PRECISION_PLUS}
                      alt="Precision+ Options"
                      className="w-24 md:w-28 h-24 md:h-auto rounded-full md:rounded-2xl shrink-0 object-cover border border-gray-200 md:border-none"
                    />
                    <div className="text-sm text-[#1F1F1F] space-y-1 md:space-y-1.5 flex-1">
                      <p>• Highest clarity across distances</p>
                      <p>• Fastest, seamless visual transitions</p>
                      <p>• Premium optics, maximum comfort</p>
                      <p>• Works with all frame styles</p>
                      <p>• For living life fully, without limits</p>
                    </div>
                  </div>
                </div>

                {/* Advanced Options - Second */}
                <div
                  onClick={() => {
                    setSelectedOption("advanced");
                    if (window.innerWidth < 768) {
                      handleMobileOptionSelect("advanced");
                    }
                  }}
                  className={`flex flex-col p-5 rounded-3xl border-2 cursor-pointer
                    ${selectedOption === "advanced"
                      ? "border-green-600 shadow-md"
                      : "border-gray-400"
                    }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-semibold bg-black text-white px-2 py-1 rounded mb-1 uppercase tracking-wider inline-block">Recommended for New Multifocal User</p>
                      <h3 className="text-lg md:text-base font-bold text-[#1F1F1F]">
                        Advanced Options
                      </h3>
                    </div>
                    {/* Arrow (Mobile) or Radio (Desktop) */}
                    <div className="md:hidden flex items-center justify-center">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="hidden md:block">
                      {selectedOption === "advanced" ? (
                        <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-5 items-center md:items-start">
                    <img
                      src={IMG_ADVANCED}
                      alt="Advanced Options"
                      className="w-24 md:w-28 h-24 md:h-auto rounded-full md:rounded-2xl shrink-0 object-cover border border-gray-200 md:border-none"
                    />
                    <div className="text-sm text-[#1F1F1F] space-y-1 md:space-y-1.5 flex-1">
                      <p>• Ideal for everyday multitasking</p>
                      <p>• Clear near to mid vision</p>
                      <p>• Comfortable digital viewing</p>
                      <p>• Works with all frame styles</p>
                      <p>• Fastest, easiest to adapt</p>
                    </div>
                  </div>
                </div>

                {/* Standard Options - Third */}
                <div className="md:col-span-2 flex justify-center">
                  <div
                    onClick={() => {
                      setSelectedOption("standard");
                      if (window.innerWidth < 768) {
                        handleMobileOptionSelect("standard");
                      }
                    }}
                    className={`flex flex-col p-5 rounded-3xl border-2 cursor-pointer w-full md:w-1/2
                      ${selectedOption === "standard"
                        ? "border-green-600 shadow-md"
                        : "border-gray-400"
                      }`}
                  >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg md:text-base font-bold text-[#1F1F1F]">
                        Standard Options
                      </h3>
                    </div>
                    {/* Arrow (Mobile) or Radio (Desktop) */}
                    <div className="md:hidden flex items-center justify-center">
                      <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                        <path d="M1 13L7 7L1 1" stroke="#E94D37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="hidden md:block">
                      {selectedOption === "standard" ? (
                        <div className="w-6 h-6 rounded-full bg-green-600 border-2 border-green-600 flex items-center justify-center shrink-0">
                          <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 5.2L4.2 8.4L11 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400 shrink-0" />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 md:gap-5 items-center md:items-start">
                    <img
                      src={IMG_STANDARD}
                      alt="Standard Options"
                      className="w-24 md:w-28 h-24 md:h-auto rounded-full md:rounded-2xl shrink-0 object-cover border border-gray-200 md:border-none"
                    />
                    <div className="text-sm text-[#1F1F1F] space-y-1 md:space-y-1.5 flex-1">
                      <p>• Designed for slower, calmer days</p>
                      <p>• Great for reading, less screen</p>
                      <p>• Ideal for minimal daily driving</p>
                      <p>• Works with select classic frames</p>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button (Desktop) */}
        <div className="hidden md:flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedType || (expanded && !selectedOption)}
            className={`px-16 py-3.5 rounded-full font-semibold text-sm uppercase tracking-wider transition-all shadow-md ${selectedType && (!expanded || selectedOption)
              ? "bg-[#184545] text-white cursor-pointer hover:bg-[#123535]"
              : "bg-[#184545] text-white"
              }`}
          >
            Continue
          </button>
        </div>
      </div>

      {/* Mobile Continue Button */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <button
          onClick={handleContinue}
          disabled={!selectedType || (expanded && !selectedOption)}
          className={`w-full py-3 rounded-full font-semibold text-sm uppercase tracking-wider transition-all ${selectedType && (!expanded || selectedOption)
            ? "bg-[#184545] text-white cursor-pointer"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default SelectPrescriptionType;