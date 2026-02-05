import React from "react";
import { Link } from "react-router-dom";

const PupillaryDistance: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1F1F1F]">
      {/* Hero Banner Section */}
      <div className="relative w-full h-[300px] md:h-[400px] bg-[#F3F0E7] overflow-hidden mb-12">
        <img
          src="pd-banner.jpg"
          alt="Pupillary Distance Guide"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-12 max-w-[1400px] mx-auto">
          {/* Breadcrumbs */}
          <div className="text-xs font-bold text-[#525252] uppercase tracking-widest flex items-center gap-2 mt-4">
            <Link
              to="/"
              className="hover:underline hover:text-black transition-colors"
            >
              HOME
            </Link>
            <span>/</span>
            <span className="text-[#1F1F1F]">PUPILLARY DISTANCE GUIDE</span>
          </div>

          {/* Banner Title - Right Aligned */}
          <div className="flex justify-end items-center h-full pb-10">
            <h1 className="text-3xl md:text-5xl font-bold text-[#1F1F1F] tracking-tight text-right max-w-md">
              Pupillary Distance Guide
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 md:px-8">
        {/* Main Content Header */}
        <div className="mb-12 border-b border-gray-200 pb-12">
          <h2 className="text-[32px] md:text-[42px] font-bold text-[#1F1F1F] mb-6 leading-tight">
            How to Measure Pupillary Distance (PD) at Home
          </h2>
          <p className="text-[#525252] text-lg leading-relaxed mb-8">
            PD (Pupillary Distance) is the space between the centers of your
            pupils, measured in millimeters. It determines where the optical
            center of each lens should sit so your vision stays sharp and
            strain-free.
          </p>

          {/* Types of PD Section */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-[#1F1F1F] mb-4">
              Types of PD
            </h3>
            <ul className="list-disc pl-5 space-y-3 text-[#525252] text-base">
              <li>
                <span className="font-bold text-[#1F1F1F]">Single PD:</span> One
                measurement across both eyes (e.g., 62mm) — used mainly for
                single vision.
              </li>
              <li>
                <span className="font-bold text-[#1F1F1F]">Dual PD:</span> One
                measurement per eye (e.g., 31mm right, 31mm left) — preferred
                for multifocals to fine-tune each zone's position.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-12 text-[#333] text-base font-medium leading-relaxed border-b border-gray-200 pb-12 mb-12">
          <section>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-4">
              Why Pupillary Distance Matters?
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>Keeps multifocals feeling balanced and natural.</li>
              <li>
                Aligns the reading and intermediate zones so they fall exactly
                where your eyes need them.
              </li>
              <li>
                Prevents distortion and eye strain, especially for screen-heavy
                routines.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6">
              Easy Ways to Measure PD at Home
            </h3>

            <div className="mb-8">
              <h4 className="font-bold text-[#1F1F1F] text-lg mb-3">
                With MultiFolks AI Tool (Recommended):
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[#525252]">
                <li>A quick, guided webcam capture during checkout.</li>
                <li>Accurate to ±1mm, no tools or manual measuring needed.</li>
              </ul>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-[#1F1F1F] text-lg mb-6">
                Manual Options:
              </h4>

              <div className="grid md:grid-cols-2 gap-8 mb-10 items-start">
                <div>
                  <h5 className="font-bold text-[#1F1F1F] text-base mb-2">
                    Credit Card Method:
                  </h5>
                  <ul className="list-disc pl-5 space-y-2 text-[#525252] mb-4">
                    <li>Stand 12–14 inches from a mirror.</li>
                    <li>Hold a credit card below your eyes for scale.</li>
                    <li>
                      Look straight ahead, take a selfie, and upload it — we
                      calculate your PD digitally.
                    </li>
                  </ul>
                </div>
                <div className="bg-[#F9F9F9] p-4 rounded-lg">
                  <img
                    src=""
                    alt="Credit Card Method Illustration"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-start">
                <div>
                  <h5 className="font-bold text-[#1F1F1F] text-base mb-2">
                    Ruler + Friend Method:
                  </h5>
                  <ul className="list-disc pl-5 space-y-2 text-[#525252] mb-4">
                    <li>Sit with a millimeter ruler above your eyes.</li>
                    <li>
                      Have a friend measure from the center of one pupil to the
                      other, or per eye for dual PD.
                    </li>
                  </ul>
                </div>
                <div className="bg-[#F9F9F9] p-4 rounded-lg">
                  <img
                    src="https://multifolks.com/wp-content/uploads/2024/02/Group-1000003059.png"
                    alt="Ruler and Friend Method Illustration"
                    className="w-full h-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-6">
              Using A Mirror
            </h3>
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <p className="mb-2 font-bold text-sm">
                  What you need: A mirror & a ruler
                </p>
                <p className="mb-2 font-bold text-sm">Steps:</p>
                <ol className="list-decimal pl-5 space-y-2 text-[#525252]">
                  <li>Stand at least 8 inches away from a mirror.</li>
                  <li>Take the ruler & place it against the brow.</li>
                  <li>
                    Close your left eye & align the 0 mm of the ruler with your
                    right pupil.
                  </li>
                  <li>
                    Repeat the same with the right eye & measure this distance.
                  </li>
                  <li>You’ll have your PD value right there.</li>
                </ol>
              </div>
              <div className="bg-[#F9F9F9] p-4 rounded-lg">
                <img
                  src="https://multifolks.com/wp-content/uploads/2024/02/Group-1000003060.png"
                  alt="Using a Mirror Method Illustration"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-4">
              Using Existing Prescription
            </h3>
            <p className="mb-4 text-[#525252]">
              If you already have a PD, look for an abbreviated “PD” column on
              the lower part of your prescription slip. If there are two
              pupillary values in your prescriptions, you might have to measure
              the distance between each pupil to the center of the nose bridge
              individually.
            </p>
            <p className="text-[#525252]">
              In case your PD measurement is not coming out right, you can also
              take help from a friend or visit your optometrist / optician to
              get your exact Pupillary distance.
            </p>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-[#1F1F1F] mb-4">
              Some More Takeaways:
            </h3>
            <ul className="list-disc pl-5 space-y-2 text-[#525252]">
              <li>
                PD is an important value when buying eyeglasses to ensure
                perfectly centered vision.
              </li>
              <li>
                You can ask the optometrist to measure it for you at your
                regular Eye Check Up.
              </li>
              <li>
                You can find your PD Value with the help of a PD stick or a
                pupilometer also.
              </li>
              <li>
                If you wear Reading Glasses, your PD value will be different.
                Ideally, you need to subtract 3 mm from your PD value in order
                to get the exact PD.
              </li>
              <li>
                PD Value can change with age. So make sure you go for regular
                eye check-ups.
              </li>
            </ul>
          </section>
        </div>

        {/* Shop Now Button */}
        <div className="flex justify-center pb-16">
          <Link
            to="/eyeglasses"
            className="bg-[#232320] text-white px-12 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-black transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PupillaryDistance;
