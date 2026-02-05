import React from "react";

const AboutUs: React.FC = () => {
  return (
    <div className="bg-white">
       <div className="w-full  min-h-screen font-sans text-[#1F1F1F] pt-6 pb-16 md:pt-12 md:pb-24 mt-20 md:mt-1">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Desktop Layout - Hidden on mobile, shown from tablet up */}
        <div className="hidden sm:block relative mb-10 md:mb-0 min-h-[300px] md:min-h-[400px] ">
          
          {/* Left Eye Box - Top Left */}
          <div className="absolute top-20 left-0 w-32 h-32 md:w-40 md:h-40 lg:w-42 lg:h-42">
           
              <img
                src="/eye.png"
                alt="Eye illustration"
                className="w-full h-full object-contain"
                loading="lazy"
              />
           
          </div>

          {/* Center Text Content */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-[600px]">
            <h1 className="text-3xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wide mb-4 md:mb-6 leading-tight">
              About Multifolks
            </h1>
            <p className="text-lg md:text-xl pt-12 text-[#1F1F1F]">
              Multifocals, made for the way you live now.
            </p>
          </div>

          {/* Right Profile Box - Bottom Right */}
          <div className="absolute bottom-20 right-0 w-32 h-32 md:w-40 md:h-40 lg:w-42 lg:h-42">
           
              <img
                src="/q5.png"
                alt="Profile illustration"
                className="w-full h-full object-contain"
                loading="lazy"
              />
          
          </div>
        </div>

        {/* Mobile Layout - Only shown on mobile */}
        <div className="sm:hidden mb-12">
          <div className="flex  items-center space-y-8">
            {/* Mobile Eye Box - Aligned to start */}
            <div className="w-28 h-28 self-start">
          
                <img
                  src="/eye.png"
                  alt="Eye illustration"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              
            </div>

            {/* Mobile Text Content */}
            <div className="text-center">
              <h1 className="text-2xl font-bold uppercase mb-4">
                About Multifolks
              </h1>
              <p className="text-base font-medium text-[#1F1F1F] px-2">
                Multifocals, made for the way you live now.
              </p>
            </div>

            {/* Mobile Profile Box - Aligned to end */}
            <div className="w-28 h-28 self-end">
             
                <img
                  src="/q5.png"
                  alt="Profile illustration"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
             
            </div>
          </div>
        </div>

        {/* Text Content Sections */}
        <div className="space-y-10 sm:space-y-2 max-w-7xl mx-auto">
          <section>
            <h3 className="text-lg sm:text-xl md:text-xl font-mono uppercase mb-1  text-[#1F1F1F] tracking-wide">
              The World's Only 100% Multifocal Specialists
            </h3>
            <div className="text-sm sm:text-base  text-gray-600 space-y-4 sm:space-y-4 text-sm font-mono text-justify">
              <p>
                Ask anyone who wears multifocals and they'll tell you how great
                an addition they are to day-to-day life. School runs, work
                emails, sports, bedtime stories, you can focus at every distance
                with no need for different glasses and no tired eyes.
              </p>
              <p>
                In fact, we're such believers in the life-enhancing power of
                multifocals we made it our mission to encourage more people to
                experience them! Creating the world's first and only multifocal
                specialist service providing high-quality, feature-rich
                multifocal lenses and glasses within budget and with zero fuss.
              </p>
              <p>The rest, as they say, is Multifolks...</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm sm:text-xl md:text-xl font-bold uppercase   text-[#1F1F1F] tracking-wide">
              The Folk Behind Multifolks
            </h3>
            <div className="text-md  text-gray-600 leading-relaxed  font-display text-justify">
              <p>
                We're a deliberately online service, but one totally powered by
                people. Our team are passionate about what we're doing, and
                bring huge experience of the eyewear industry. Our team has
                helped thousands of people find glasses that work for real life.
                That expertise is what drives every frame, every lens, and every
                customer interaction here at Multifolks.
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg sm:text-xl md:text-xl font-bold uppercase  text-[#1F1F1F] tracking-wide">
              Making Multifocals Surprisingly Affordable
            </h3>
            <div className="text-md   text-gray-600 font-sans-serif  leading-relaxed sm:leading-[1.7] font-medium text-justify">
              <p>
                Phone, wallet, keys, we've all got enough expensive things to
                worry about losing already. From day one, a key priority of ours
                was to make multifocals less of a big-ticket purchase. This we
                can do thanks to the fact they're the one thing we focus on and
                our process is super streamlined. Our economies of scale
                translate into genuine savings for our customers, of up to 50%
                against high-street prices. We're not saying lose your glasses!
                But if you do, it's not a $400 disaster any more.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AboutUs;