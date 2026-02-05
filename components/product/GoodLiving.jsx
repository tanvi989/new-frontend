export default function GoodLiving() {
  return (
    <main className=" flex items-center justify-center py-8 px-0">
      {/* Mobile Card Container with padding */}
      <div className="w-full max-w-sm p-2">
        {/* Card with rounded corners and image background */}
        <div className="w-full rounded-2xl shadow-2xl overflow-hidden relative h-[800px]">
          {/* Background Image - zoomed in */}
          <img 
            src="./bottomGlass.png" 
            alt="Premium eyewear" 
            className="absolute inset-0 w-full h-full object-cover scale-110 -rotate-270"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30" />

          {/* Vertical Centered Red Font */}
          <div className="absolute inset-0 flex items-start mt-32  justify-center">
            <span 
              className="text-[#E94D37]  font-bold"
              style={{
                writingMode: "vertical-rl",
                textOrientation: "mixed",
                transform: "rotate(180deg)",
                letterSpacing: "0.1em",
                fontSize: "44px",
                lineHeight: "1.2"
              }}
            >
              M 46 16 RM
            </span>
          </div>

          {/* Text and Button Section - Positioned at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-6 py-12 flex flex-col items-center text-center gap-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
            {/* Heading */}
            <h1 className="text-white text-2xl leading-relaxed" style={{
                fontFamily: "Lynstone-book",
                fontWeight: 350,
                fontSize: "28px",
                lineHeight: "32px",
                letterSpacing: "0.05em",
                wordWrap: "break-word",
            }}>
              Good living starts with good vision
            </h1>

            {/* CTA Button */}
            <button className="bg-white text-gray-950 hover:bg-gray-100 font-semibold px-8 py-7 rounded-full uppercase tracking-widest transition-colors" style={{
                fontSize:"9.5px"
            }}>
              Start Online Eye Scan
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}