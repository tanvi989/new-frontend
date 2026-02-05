export default function Multifocus() {
  return (
    <main className="bg-yellow-400">
      {/* Mobile Layout */}
      <div className="block lg:hidden py-8 px-6">
        {/* Title Section - Centered for mobile */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 font-sans tracking-widest leading-tight [word-spacing:0.1rem]">
            <span className="text-xl">LIFE LOOKS BETTER</span> <br />
            <span className=" mt-1 text-xl">WHEN YOU</span> <br />
            <span className=" mt-1 text-xl">MULTIFOCUS</span>
          </h1>
        </div>

        {/* Middle Text - Left aligned (as it is) */}
        <div className="mb-6">
          <p className="text-sm mb-3 max-w-sm font-sans">
            Built for the multifocal generation, here's what makes us different:
          </p>

          {/* Features List with bold bullets only - Left aligned */}
          <div className="space-y-1 text-sm max-w-sm font-sans ml-4">
            <div className="flex items-start">
              <span className="mr-2 font-black text-xl">•</span>
              <p>Ultra-accurate fit with our proprietary PD & fitting height tech</p>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-black text-xl">•</span>
              <p>Premium lenses with honest pricing and zero compromise on quality</p>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-black text-xl">•</span>
              <p>Expert guidance to match your multifocals to real-life routines</p>
            </div>
            <div className="flex items-start">
              <span className="mr-2 font-black text-xl">•</span>
              <p>Easy ordering, free 30-day returns</p>
            </div>
          </div>
        </div>

        {/* Bottom Text - Left aligned */}
        <div className="mb-8">
          <p className="text-sm max-w-sm font-sans">
            Designed by multifocal specialists. Backed by our Vision Guarantee.
          </p>
        </div>

        {/* Image Section */}
        <div className="mt-4">
          <div className="relative w-full max-w-xs rounded-2xl overflow-hidden">
            <img
              src="./videoGlass.jpg"
              alt="Video thumbnail"
              width="320"
              height="200"
              loading="lazy"
              className="w-full h-[200px] object-cover"
            />
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex flex-col lg:flex-row items-stretch">
        {/* Left Section */}
        <div className="flex-1 p-8 lg:p-12 flex flex-col justify-between">
          {/* Header Content */}
          <div>
            {/* Main Heading with increased word spacing */}
            <h1 className="text-1xl lg:text-1xl uppercase leading-none">
              <span className="block tracking-[0.2rem] font-semibold mb-1" style={{ fontFamily: 'Lynstone-book' }}>
                LIFE LOOKS BETTER
              </span>
              <span className="block tracking-[0.2rem] font-extrabold mb-4" style={{ fontFamily: 'Lynstone-book' }}>
                WHEN YOU MULTIFOCUS
              </span>
            </h1>

            <p className="text-sm lg:text-base mb-3 max-w-sm font-sans" >
              Built for the multifocal generation, here's what makes us different:
            </p>

            {/* Features List with bold bullets only */}
            <div className="space-y-1 text-sm lg:text-base max-w-sm font-sans ml-4">
              <div className="flex items-start" >
                <span className="mr-2 font-black text-xl">•</span>
                <p>Ultra-accurate fit with our proprietary PD, fitting height tech</p>
              </div>
              <div className="flex items-start">
                <span className="mr-2 font-black text-xl">•</span>
                <p>Premium lenses with honest pricing and zero compromise on quality</p>
              </div>
              <div className="flex items-start">
                <span className="mr-2 font-black text-xl">•</span>
                <p>Expert guidance to match your multifocals to real-life routines</p>
              </div>
              <div className="flex items-start">
                <span className="mr-2 font-black text-xl">•</span>
                <p>Easy ordering, free 30-day returns</p>
              </div>
            </div>
            <p className="text-sm lg:text-base mb-3 max-w-sm font-sans mt-4" >
              Designed by multifocal specialists. Backed by our Vision Guarantee.
            </p>
          </div>

          {/* Image Section - Bottom Left */}
          <div className=" lg:mt-1">
            <div className="relative w-full max-w-xs rounded-2xl overflow-hidden">
              {/* Image Replacement */}
              <img
                src="./videoGlass.jpg"
                alt="Video thumbnail"
                width="320"
                height="200"
                loading="lazy"
                className="w-full h-[200px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Right Section - Product Image with equal margins */}
        <div className="flex-1 flex items-center justify-center lg:justify-end lg:min-h-auto my-6 lg:my-8">
          <div className="relative h-full flex items-center justify-center px-0 lg:pr-[30px] lg:justify-end lg:px-0">
            <img
              src="./eyeGlass.png"
              alt="Multifocus glasses product"
              width="800"
              height="600"
              loading="lazy"
              className="h-auto max-h-[85vh] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
