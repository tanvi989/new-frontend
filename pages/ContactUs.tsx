import React from "react";
import { Link } from "react-router-dom";

const ContactUs: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send this data to your backend here.
    alert("Thank you for contacting us! We will get back to you shortly.");
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-[120px] pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-[26px] md:text-[42px] text-[#1F1F1F] font-medium mb-8 font-sans">
            Contact us
          </h1>

          <h2 className="text-[22px] font-bold text-[#1F1F1F] mb-3 tracking-wide">
            We Love Hearing From You!
          </h2>

          <p className="text-[#525252] text-base font-medium max-w-2xl mx-auto">
            If you have any questions, please fill your queries in the form &
            we'll get back to you shortly.
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-20 max-w-[900px] mx-auto place-items-center">
          {/* Mail Us */}
          <a
            href="mailto:support@multifolks.com"
            className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.04)] p-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 cursor-pointer w-full"
          >
            <div className="w-16 h-16 rounded-full bg-[#025048] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#025048]/20">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#1F1F1F] mb-3">Mail us</h3>
            <p className="text-sm text-[#525252] font-medium">
              support@multifolks.com
            </p>
            <p className="text-sm text-[#525252] font-medium">Available 24x7</p>
          </a>

          {/* Let's Chat */}
          <div className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.04)] p-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 w-full">
            <div className="w-16 h-16 rounded-full bg-[#025048] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#025048]/20">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#1F1F1F] mb-3">
              Let's Chat
            </h3>
            <p className="text-sm text-[#525252] font-medium">
              Available 24*7 Live chat
            </p>
            <p className="text-sm text-[#525252] font-medium">support.</p>
          </div>

          {/* Ask Help */}
          <Link
            to="/help"
            className="bg-white rounded-2xl shadow-[0px_8px_30px_rgba(0,0,0,0.04)] p-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 cursor-pointer w-full"
          >
            <div className="w-16 h-16 rounded-full bg-[#025048] flex items-center justify-center text-white mb-6 shadow-lg shadow-[#025048]/20">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <path d="M12 17h.01"></path>
              </svg>
            </div>
            <h3 className="font-bold text-lg text-[#1F1F1F] mb-3">Ask Help</h3>
            <p className="text-sm text-[#525252] font-medium">
              Find answers to common
            </p>
            <p className="text-sm text-[#525252] font-medium">questions</p>
          </Link>
        </div>

        

        <hr className="border-gray-100 mb-16 max-w-[1000px] mx-auto" />

        {/* Form & Location Container */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 max-w-[1000px] mx-auto">
          {/* Left: Form */}
          <div className="flex-1">
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              <div className="flex flex-col md:flex-row gap-5">
                <input
                  type="text"
                  placeholder="Enter First Name"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-[#1F1F1F] outline-none focus:border-[#1F1F1F] focus:ring-0 transition-colors placeholder:text-gray-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Enter Last Name"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-[#1F1F1F] outline-none focus:border-[#1F1F1F] focus:ring-0 transition-colors placeholder:text-gray-400"
                  required
                />
              </div>

              

              <div className="flex flex-col md:flex-row gap-5">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-[#1F1F1F] outline-none focus:border-[#1F1F1F] focus:ring-0 transition-colors placeholder:text-gray-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="Enter Phone"
                  className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-[#1F1F1F] outline-none focus:border-[#1F1F1F] focus:ring-0 transition-colors placeholder:text-gray-400"
                  required
                />
              </div>

              <textarea
                placeholder="Write Comment"
                rows={6}
                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3.5 text-sm font-medium text-[#1F1F1F] outline-none focus:border-[#1F1F1F] focus:ring-0 transition-colors placeholder:text-gray-400 resize-none"
                required
              ></textarea>

              <div className="mt-2">
                <button
                  type="submit"
                  className="bg-[#232320] text-white font-bold text-sm uppercase tracking-widest py-4 px-12 rounded hover:bg-black transition-all shadow-lg active:scale-95 w-full md:w-auto"
                >
                  SUBMIT
                </button>
              </div>
            </form>
          </div>

          {/* Right: Location */}

          <div className="flex flex-col items-start gap-2 lg:w-1/3">
            <h4 className="font-bold text-[#1F1F1F] text-lg whitespace-nowrap">
              Our Location:
            </h4>
            <p className="text-[#525252] text-sm font-medium leading-relaxed">
              2 Leman Street, London, E1W 9US
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
