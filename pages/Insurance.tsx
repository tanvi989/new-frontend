import React from "react";

const Insurance: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans">
      {/* Hero Banner */}
      <div className="w-full">
        <img
          src="/insurance-banner.jpg"
          alt="Save on your eyewear with vision insurance"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* How to Use Section */}
      <div className="bg-white py-16 md:py-24 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#1F1F1F] mb-4 font-serif">
              How to Use Vision Insurance
            </h2>
            <p className="text-[#525252] font-medium max-w-2xl mx-auto text-base">
              If you have vision insurance, you can submit your MultiFolks
              eyewear purchase for reimbursement in three easy steps:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-start relative">
              <div className="flex items-center gap-2 mb-4 w-full">
                <div className="text-[#00695C]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#00695C] uppercase tracking-widest">
                  Step 1
                </span>
                {/* Dashed Line */}
                <div className="h-px border-t-2 border-dashed border-[#00695C] flex-1 mx-2 hidden md:block opacity-50 relative top-0.5">
                  <div className="absolute -right-1 -top-1.5 text-[#00695C]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">
                Download your claim form
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed font-medium">
                Choose your vision insurance provider and get their
                reimbursement form.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-start relative">
              <div className="flex items-center gap-2 mb-4 w-full">
                <div className="text-[#00695C]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#00695C] uppercase tracking-widest">
                  Step 2
                </span>
                {/* Dashed Line */}
                <div className="h-px border-t-2 border-dashed border-[#00695C] flex-1 mx-2 hidden md:block opacity-50 relative top-0.5">
                  <div className="absolute -right-1 -top-1.5 text-[#00695C]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">
                Save your invoice
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed font-medium">
                Access your order history and download your detailed invoice.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 mb-4 w-full">
                <div className="text-[#00695C]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-[#00695C] uppercase tracking-widest">
                  Step 3
                </span>
                {/* Dashed Line (End Arrow only for style) */}
                <div className="h-px border-t-2 border-dashed border-[#00695C] flex-1 mx-2 hidden md:block opacity-50 relative top-0.5">
                  <div className="absolute -right-1 -top-1.5 text-[#00695C]">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-2">
                Submit your claim
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed font-medium">
                Send the completed form and invoice to your insurance provider
                by their preferred method.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Claim Form Section */}
      <div className="bg-[#F9F6F3] py-16 px-4 text-center border-y border-gray-200">
        <div className="max-w-[800px] mx-auto">
          <h2 className="text-2xl font-medium text-[#1F1F1F] mb-8 font-serif">
            Claim Form For Insurance Provider
          </h2>
          <button className="bg-[#2B7DCD] hover:bg-[#1e6bb8] text-white font-bold py-3.5 px-8 rounded-md text-sm transition-colors shadow-sm uppercase tracking-wide">
            Download the Generic Reimbursement Form
          </button>
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="bg-white py-20 px-4">
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
          {/* Image */}
          <div className="md:w-1/2 w-full h-[300px] md:h-[400px] relative overflow-hidden rounded-lg shadow-lg">
            <img
              src="imagesp.jpg"
              alt="Glasses Collection on Wood"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Content */}
          <div className="md:w-1/2 space-y-8">
            <div>
              <h3 className="text-base font-bold text-[#1F1F1F] mb-2">
                Use FSA or HSA at Checkout
              </h3>
              <p className="text-sm text-[#525252] font-medium leading-relaxed">
                Pay directly with your FSA or HSA debit card for prescription
                glasses, sunglasses, contact lenses, or reading glasses.
                Non-prescription eyewear is not eligible.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-[#1F1F1F] mb-2">
                Support When You Need It
              </h3>
              <p className="text-sm text-[#525252] font-medium leading-relaxed mb-2">
                Our customer service team is available to help with insurance,
                FSA, or HSA claims and questions. Write to us at{" "}
                <a
                  href="mailto:support@multifolks.com"
                  className="text-[#E94D37] hover:underline font-bold"
                >
                  support@multifolks.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insurance;
