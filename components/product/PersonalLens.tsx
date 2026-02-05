export default function PersonalLens() {
  return (
    <div className="bg-[#F3CB0A] w-full min-h-[600px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {/* Header Section */}
      <div className="text-center mb-12 md:mb-20 w-full">
        {/* Mobile: 2 lines */}
        <div className="block md:hidden">
          <p className="text-[20px] sm:text-3xl font-semibold text-black mb-4 sm:mb-6 tracking-[0.2em] leading-tight uppercase">
            Your personal <br /> multifocals ready,
            <br /> in a few minutes
          </p>
        </div>

        {/* Desktop: 1 line */}
        {/* Headline – hidden on mobile, bigger on md+ */}
        <div className="hidden md:block">
          <p className="text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-black mb-4 lg:mb-5 tracking-[0.2em] leading-tight uppercase">
            Your personal multifocals, ready in a few minutes
          </p>
        </div>

        {/* Body text – slightly smaller than the headline, responsive */}
        <p className="text-black text-sm md:text-[15px] lg:text-base leading-relaxed max-w-3xl mx-auto tracking-[-0.02em] px-4">
          It couldn&apos;t be simpler. All you need is your prescription and
          we&apos;ll run you through the rest.
        </p>
      </div>

      {/* Mobile Layout - Only shown on mobile screens */}
      <div className="block md:hidden grid grid-cols-1 gap-8 max-w-7xl w-full">
        {/* Step 1 Mobile */}
        <div className="relative flex items-start p-4">
          {/* Left Side: Number + STEP */}
          <div className="flex flex-col items-start mr-4 flex-shrink-0 relative z-10">
            {/* STEP text - Adjusted position */}
            <span
              className="text-[#E94D37] font-bold text-sm tracking-widest relative z-20 mb-1 mt-1"
              style={{
                fontSize: "18px",
                fontFamily: "Lynstone-regular",
                fontWeight: 350,
                marginBottom: "20px",
                lineHeight: "28px",
                letterSpacing: "5%",
                wordWrap: "break-word",
              }}
            >
              STEP
            </span>
            {/* Large Number */}
            <div className="text-white font-black text-[100px] leading-none z-0 -mt-8">
              1
            </div>
          </div>

          {/* Right Side: Title + Description - Aligned with left side */}
          <div className="flex flex-col ">
            {/* Title - Aligned with STEP text */}
            <h4 className="text-xl text-black mb-2 relative z-10 leading-snug">
              Upload your lens
            </h4>
            {/* Description */}
            <p className="text-black text-sm leading-relaxed relative z-10">
              There are 3 types of multifocal lens: standard, advanced and
              precision. Our fitting tool will identify the best one for you.
            </p>
          </div>
        </div>

        {/* Step 2 Mobile */}
        <div className="relative flex items-start p-4">
          <div className="flex flex-col items-start mr-4 flex-shrink-0">
            <span
              className="text-red-500 font-bold text-sm tracking-widest relative z-10 "
              style={{
                fontSize: "18px",
                fontFamily: "Lynstone-regular",
                fontWeight: 350,
                lineHeight: "28px",
                letterSpacing: "5%",
                wordWrap: "break-word",
              }}
            >
              STEP
            </span>
            <div className="text-white font-black text-[100px] leading-none z-0 -mt-3">
              2
            </div>
          </div>

          <div className="flex flex-col ">
            <h4 className="text-xl text-black mb-2 relative z-10 leading-snug">
              Choose your frames
            </h4>
            <p className="text-black text-lg leading-relaxed relative z-10">
              The fun bit!
            </p>
          </div>
        </div>

        {/* Step 3 Mobile */}
        <div className="relative flex items-start p-4">
          <div className="flex flex-col items-start mr-4 flex-shrink-0">
            <span
              className="text-red-500 font-bold text-sm tracking-widest relative z-10 mb-1"
              style={{
                fontSize: "18px",
                fontFamily: "Lynstone-regular",
                fontWeight: 350,
                lineHeight: "28px",
                letterSpacing: "5%",
                wordWrap: "break-word",
              }}
            >
              STEP
            </span>
            <div className="text-white font-black text-[100px] leading-none z-0 -mt-3">
              3
            </div>
          </div>

          <div className="flex flex-col   ">
            <h4 className="text-xl text-black mb-2 relative z-10 leading-snug">
              Upload your prescription
            </h4>
            <p className="text-black text-sm leading-relaxed relative z-10">
              Upload your prescription from your optician. We'll help if you're
              not sure how to read it.
            </p>
          </div>
        </div>

        {/* Step 4 Mobile */}
        <div className="relative flex items-start p-4">
          <div className="flex flex-col items-start mr-4 flex-shrink-0">
            <span
              className="text-red-500 font-bold text-sm tracking-widest relative z-10 mb-1"
              style={{
                fontSize: "18px",
                fontFamily: "Lynstone-regular",
                fontWeight: 350,
                lineHeight: "28px",
                letterSpacing: "5%",
                wordWrap: "break-word",
              }}
            >
              STEP
            </span>
            <div className="text-white font-black text-[100px] leading-none z-0 -mt-3">
              4
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="text-xl text-black mb-2 relative z-10 leading-snug">
              Pay without pressure
            </h4>
            <p className="text-black text-xs leading-relaxed relative z-10">
              Your multifocals will arrive in a few days. Remember, if you
              change your mind, just send them back!
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Only shown on desktop/tablet screens */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 max-w-7xl w-full">
        {/* Step 1 Desktop */}
        <div className="relative flex flex-col items-start p-4 sm:p-6 lg:w-[260px] mb-10">
          <div className="absolute right-10 -top-10 sm:-top-12 text-white font-black text-[140px] sm:text-[180px] md:text-[220px] lg:text-[300px] leading-none z-0">
            1
          </div>

          <div className="relative z-10 w-full max-w-xl">
            <span className="text-red-500 font-bold text-sm sm:text-base tracking-widest uppercase block mb-6">
              Step
            </span>

            <h4
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-6 leading-tight mt-16"
              style={{
                fontSize: "16px",
                fontFamily: "Lynstone-regular",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              Choose your lens
            </h4>
            <p
              className="text-black text-sm sm:text-base leading-relaxed font-light"
              style={{
                fontSize: "10px",
                fontFamily: "Lynstone-book",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              There are 3 types of multifocal lens: standard, advanced and
              precision. Our fitting tool will identify the best one for you.
            </p>
          </div>
        </div>

        {/* Step 2 Desktop */}

        <div className="relative flex flex-col items-start p-4 sm:p-6 lg:w-[260px] mb-10">
          <div className="absolute right-0 -top-10 sm:-top-12 text-white font-black text-[140px] sm:text-[180px] md:text-[220px] lg:text-[300px] leading-none z-0">
            2
          </div>

          <div className="relative z-10 w-full max-w-sm">
            <span className="text-red-500 font-bold text-sm sm:text-base tracking-widest uppercase block mb-6">
              Step
            </span>
            <h4
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-6 leading-tight mt-16"
              style={{
                fontSize: "16px",
                fontFamily: "Lynstone-regular",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              Choose your frames
            </h4>
            <p
              className="text-black text-sm sm:text-base leading-relaxed font-light"
              style={{
                fontSize: "12px",
                fontFamily: "Lynstone-book",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              The fun bit!
            </p>
          </div>
        </div>

        {/* Step 3 Desktop */}
        <div className="relative flex flex-col items-start p-4 sm:p-6 lg:w-[260px] mb-10">
          <div className="absolute right-0 -top-10 sm:-top-12 text-white font-black text-[140px] sm:text-[180px] md:text-[220px] lg:text-[300px] leading-none z-0">
            3
          </div>

          <div className="relative z-10 w-full max-w-sm">
            <span className="text-red-500 font-bold text-sm sm:text-base tracking-widest uppercase block mb-6">
              Step
            </span>
            <h4
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-6 leading-tight mt-16"
              style={{
                fontSize: "16px",
                fontFamily: "Lynstone-regular",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              Upload your prescription
            </h4>
            <p
              className="text-black text-sm sm:text-base leading-relaxed font-light"
              style={{
                fontSize: "12px",
                fontFamily: "Lynstone-book",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              Upload your prescription from your optician. We'll help if you're
              not sure how to read it.
            </p>
          </div>
        </div>

        {/* Step 4 Desktop */}
        <div className="relative flex flex-col items-start p-4 sm:p-6 lg:w-[260px] mb-10">
          <div className="absolute right-0 -top-10 sm:-top-12 text-white font-black text-[140px] sm:text-[180px] md:text-[220px] lg:text-[300px] leading-none z-0">
            4
          </div>

          <div className="relative z-10 w-full max-w-sm">
            <span className="text-red-500 font-bold text-sm sm:text-base tracking-widest uppercase block mb-6">
              Step
            </span>

            <h4
              className="text-2xl sm:text-3xl lg:text-4xl font-medium text-black mb-6 leading-tight mt-16"
              style={{
                fontSize: "16px",
                fontFamily: "Lynstone-regular",
                lineHeight: "14px",
                wordWrap: "break-word",
              }}
            >
              Pay without pressure
            </h4>

            <p
              className="text-black text-sm sm:text-base leading-relaxed font-light"
              style={{
                fontSize: "12px",
                fontFamily: "Lynstone-book",
                lineHeight: "16px",
                wordWrap: "break-word",
              }}
            >
              Your multifocals will arrive in a few days. Remember, if you
              change your mind, just send them back!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
