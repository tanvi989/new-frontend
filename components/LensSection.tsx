// // import React, { useState } from "react";
// // import { useNavigate } from "react-router-dom";

// // export const LensSection: React.FC = () => {
// //   const [activeTab, setActiveTab] = useState<
// //     "overview" | "standard" | "advanced" | "precision"
// //   >("overview");
// //   const navigate = useNavigate();

// //   return (
// //     <section className="w-full font-sans bg-white">
// //       {/* --- Choosing The Right Lens --- */}
// //       <div className="py-24">
// //         <div className="max-w-[1480px] bg-[#F3F0E7] mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
// //           {/* Left Content Column - Increased width to prevent title wrap */}
// //           <div className="lg:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left">
// //             <h2 className="text-[#232320] text-[32px] md:text-[36px] xl:text-[40px] font-bold uppercase mb-8 tracking-wide leading-tight whitespace-nowrap">
// //               CHOOSING THE RIGHT LENS
// //             </h2>

// //             {/* Dynamic Content Based on Tab */}
// //             {activeTab === "overview" && (
// //               <div className="space-y-6 text-[#333333] text-[17px] md:text-[18px] font-medium leading-relaxed mb-12 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
// //                 <p>
// //                   One of the brilliant things about multifocals is the different
// //                   lens types you have to choose from to suit exactly what you
// //                   want them for, whether that's reading, working, driving... or
// //                   everything.
// //                 </p>
// //                 <p>
// //                   Here's an explanation of the three types of multifocal lens.
// //                   And click on our fitting tool to choose the right one for you.
// //                 </p>
// //               </div>
// //             )}

// //             {activeTab === "standard" && (
// //               <div className="flex flex-col gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
// //                 {/* Lens Diagram / Image Container */}
// //                 <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg group border-4 border-white">
// //                   {/* Background Image (Book) */}
// //                   <img
// //                     src="book-blurr 1.png"
// //                     alt="Open book text"
// //                     className="w-full h-full object-cover brightness-75"
// //                   />

// //                   {/* Lens Overlay Diagram */}
// //                   <div className="absolute inset-0 flex items-center justify-center">
// //                     <svg
// //                       viewBox="0 0 400 225"
// //                       className="w-full h-full drop-shadow-lg"
// //                     >
// //                       {/* Lens Shape */}
// //                       <path
// //                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="3"
// //                         className="opacity-90"
// //                       />

// //                       {/* Dashed Division Lines for Zones */}
// //                       <path
// //                         d="M90 80 Q200 90 310 80"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                       <path
// //                         d="M110 140 Q200 150 290 140"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                     </svg>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4 text-[#333333] text-[15px] leading-relaxed text-left">
// //                   <p>
// //                     This lens is perfect for those who spend long hours reading,
// //                     writing, or working on detailed indoor tasks. It features an{" "}
// //                     <strong>extra-wide near vision zone</strong> — ideal for
// //                     home and desk use.
// //                   </p>
// //                   <p>
// //                     <strong>Best for:</strong> For anyone seeking a dedicated
// //                     pair for reading and home activities.
// //                   </p>
// //                   <p className="italic font-medium text-[#1F1F1F]">
// //                     A perfect companion for quiet routines and a life lived up
// //                     close.
// //                   </p>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === "advanced" && (
// //               <div className="flex flex-col gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
// //                 {/* Lens Diagram */}
// //                 <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg group border-4 border-white">
// //                   <img
// //                     src="drive-blurr 1.png"
// //                     alt="Driving road view"
// //                     className="w-full h-full object-cover brightness-75"
// //                   />
// //                   <div className="absolute inset-0 flex items-center justify-center">
// //                     <svg
// //                       viewBox="0 0 400 225"
// //                       className="w-full h-full drop-shadow-lg"
// //                     >
// //                       <path
// //                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="3"
// //                         className="opacity-90"
// //                       />
// //                       {/* Hourglass Shape */}
// //                       <path
// //                         d="M90 80 Q200 90 310 80"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                       <path
// //                         d="M140 80 Q160 130 150 180"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                       <path
// //                         d="M260 80 Q240 130 250 180"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                     </svg>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4 text-[#333333] text-[15px] leading-relaxed text-left">
// //                   <p>
// //                     For users who are always on the move, this lens offers a{" "}
// //                     <strong>
// //                       balanced view across near, intermediate, and distance
// //                       zones
// //                     </strong>
// //                     , making it perfect for work, screens, and driving.
// //                   </p>
// //                   <p>
// //                     <strong>Best For:</strong> First-time progressive wearers.
// //                     Busy, active lifestyles with screen time, driving, and
// //                     multitasking.
// //                   </p>
// //                   <p className="italic font-medium text-[#1F1F1F]">
// //                     A smart upgrade for anyone who needs sharp, stable vision
// //                     throughout the day.
// //                   </p>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === "precision" && (
// //               <div className="flex flex-col gap-6 mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
// //                 {/* Lens Diagram */}
// //                 <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg group border-4 border-white">
// //                   <img
// //                     src="tennis-blurr 1.png"
// //                     alt="Tennis player focus"
// //                     className="w-full h-full object-cover brightness-90"
// //                   />
// //                   <div className="absolute inset-0 flex items-center justify-center">
// //                     <svg
// //                       viewBox="0 0 400 225"
// //                       className="w-full h-full drop-shadow-lg"
// //                     >
// //                       <path
// //                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="3"
// //                         className="opacity-90"
// //                       />
// //                       {/* Wide Zones */}
// //                       <path
// //                         d="M90 90 Q200 100 310 90"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                       <path
// //                         d="M120 150 Q200 160 280 150"
// //                         fill="none"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeDasharray="6 4"
// //                         className="opacity-80"
// //                       />
// //                     </svg>
// //                   </div>
// //                 </div>

// //                 <div className="space-y-4 text-[#333333] text-[15px] leading-relaxed text-left">
// //                   <p>
// //                     Our most advanced lens, Precision+ delivers{" "}
// //                     <strong>ultra-wide viewing zones</strong> with{" "}
// //                     <strong>minimal distortion</strong>, designed to fit
// //                     seamlessly into modern, narrower frames. No trade-offs, just
// //                     clarity and comfort.
// //                   </p>
// //                   <p>
// //                     <strong>Best For:</strong> Seasoned multifocal users, those
// //                     seeking premium clarity in sleek frames and want top
// //                     performance in any design.
// //                   </p>
// //                   <p className="italic font-medium text-[#1F1F1F]">
// //                     A powerful upgrade for those who know and expect the best.
// //                   </p>
// //                 </div>
// //               </div>
// //             )}

// //             {/* Tab Buttons */}
// //             <div className="flex flex-row flex-wrap gap-3 justify-center lg:justify-start w-full">
// //               <button
// //                 onClick={() => setActiveTab("overview")}
// //                 className={`px-6 py-2.5 rounded-full text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
// //                   activeTab === "overview"
// //                     ? "bg-[#232320] text-white"
// //                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
// //                 }`}
// //               >
// //                 Overview
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("standard")}
// //                 className={`px-6 py-2.5 rounded-full text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
// //                   activeTab === "standard"
// //                     ? "bg-[#232320] text-white"
// //                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
// //                 }`}
// //               >
// //                 Standard
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("advanced")}
// //                 className={`px-6 py-2.5 rounded-full text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
// //                   activeTab === "advanced"
// //                     ? "bg-[#232320] text-white"
// //                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
// //                 }`}
// //               >
// //                 Advanced
// //               </button>
// //               <button
// //                 onClick={() => setActiveTab("precision")}
// //                 className={`px-6 py-2.5 rounded-full text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
// //                   activeTab === "precision"
// //                     ? "bg-[#232320] text-white"
// //                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
// //                 }`}
// //               >
// //                 Precision +
// //               </button>
// //             </div>
// //           </div>

// //           {/* Right Content Column (Images) - Adjusted width */}
// //           <div className="lg:w-[40%] relative w-full max-w-[800px]">
// //             {/* Overview - Single Image */}
// //             {activeTab === "overview" && (
// //               <div className="relative w-full h-[500px] md:h-[600px] animate-in fade-in duration-500">
// //                 <div className="w-full h-full overflow-hidden rounded-[30px] md:rounded-[50px] shadow-md">
// //                   <img
// //                     src="image 22.png"
// //                     alt="Overview Image"
// //                     className="w-full h-full object-cover"
// //                   />
// //                 </div>
// //               </div>
// //             )}

// //             {/* Standard Image */}
// //             {activeTab === "standard" && (
// //               <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
// //                 <img
// //                   src="standard 1.png"
// //                   alt="Man reading book in garden"
// //                   className="w-full h-full object-cover"
// //                 />
// //               </div>
// //             )}

// //             {/* Advanced Image */}
// //             {activeTab === "advanced" && (
// //               <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
// //                 <img
// //                   src="advanced 1.png"
// //                   alt="Woman driving car"
// //                   className="w-full h-full object-cover"
// //                 />
// //               </div>
// //             )}

// //             {/* Precision Image */}
// //             {activeTab === "precision" && (
// //               <div className="w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
// //                 <img
// //                   src="tennis-blurr-2 1.png"
// //                   alt="Woman playing tennis"
// //                   className="w-full h-full object-cover object-top"
// //                 />
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* --- Promo Section – WHITE background version --- */}
// //       <div className="max-w-screen-2xl mx-auto px-6 lg:px-8 bg-white">
// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
// //           {/* LEFT: White background + centered image 23.png */}
// //           <div className="bg-white flex flex-col items-center justify-center text-[#1E1E1E] py-16 px-10 text-center">
// //             {/* Your glasses image – perfectly sized & centered */}
// //             <img
// //               src="/image 23.png"
// //               alt="Multifocal Glasses"
// //               className="w-64 md:w-72 lg:w-96 h-auto object-contain mb-10 drop-shadow-xl"
// //             />
// //             {/* Text content */}
// //             <div className="max-w-xs mx-auto">
// //               {/* Button */}
// //               <button className="px-10 py-4 bg-[#1E1E1E] text-white font-helvetica font-bold text-sm uppercase tracking-[0.2em] rounded-full hover:bg-[#333] transition-all shadow-lg">
// //                 Shop Now
// //               </button>
// //             </div>
// //           </div>
// //           {/* RIGHT: 2×2 collage */}
// //           <div className="lg:col-span-2 relative h-[400px] lg:h-auto min-h-[600px] lg:min-h-0">
// //             <img
// //               src="/image 21.png"
// //               alt="Collection"
// //               className="w-full h-full object-cover object-top lg:object-center"
// //             />
// //           </div>
// //         </div>
// //       </div>
// //     </section>
// //   );
// // };

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// export const LensSection: React.FC = () => {
//   const [activeTab, setActiveTab] = useState<
//     "overview" | "standard" | "advanced" | "precision"
//   >("overview");
//   const navigate = useNavigate();

//   return (
//     <section className="w-full font-sans bg-white">
//       {/* --- Choosing The Right Lens --- */}
//       <div className="py-12 md:py-16 lg:py-24 px-4 sm:px-6">
//         <div className="max-w-[1480px] bg-[#F3F0E7] mx-auto px-4 md:px-8 py-8 md:py-12 lg:py-16 rounded-2xl md:rounded-3xl flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
//           {/* Left Content Column */}
//           <div className="lg:w-[55%] xl:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left w-full">
//             <h2 className="text-[#232320] text-[28px] sm:text-[32px] md:text-[36px] xl:text-[40px] font-bold uppercase mb-6 md:mb-8 tracking-wide leading-tight">
//               CHOOSING THE RIGHT LENS
//             </h2>

//             {/* Dynamic Content Based on Tab */}
//             {activeTab === "overview" && (
//               <div className="space-y-4 md:space-y-6 text-[#333333] text-[16px] sm:text-[17px] md:text-[18px] font-medium leading-relaxed mb-8 md:mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <p>
//                   One of the brilliant things about multifocals is the different
//                   lens types you have to choose from to suit exactly what you
//                   want them for, whether that's reading, working, driving... or
//                   everything.
//                 </p>
//                 <p>
//                   Here's an explanation of the three types of multifocal lens.
//                   And click on our fitting tool to choose the right one for you.
//                 </p>
//               </div>
//             )}

//             {activeTab === "standard" && (
//               <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 {/* Lens Diagram / Image Container */}
//                 <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
//                   <img
//                     src="book-blurr 1.png"
//                     alt="Open book text"
//                     className="w-full h-full object-cover brightness-75"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <svg
//                       viewBox="0 0 400 225"
//                       className="w-full h-full drop-shadow-lg"
//                     >
//                       <path
//                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="3"
//                         className="opacity-90"
//                       />
//                       <path
//                         d="M90 80 Q200 90 310 80"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                       <path
//                         d="M110 140 Q200 150 290 140"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
//                   <p>
//                     This lens is perfect for those who spend long hours reading,
//                     writing, or working on detailed indoor tasks. It features an{" "}
//                     <strong>extra-wide near vision zone</strong> — ideal for
//                     home and desk use.
//                   </p>
//                   <p>
//                     <strong>Best for:</strong> For anyone seeking a dedicated
//                     pair for reading and home activities.
//                   </p>
//                   <p className="italic font-medium text-[#1F1F1F]">
//                     A perfect companion for quiet routines and a life lived up
//                     close.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {activeTab === "advanced" && (
//               <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
//                   <img
//                     src="drive-blurr 1.png"
//                     alt="Driving road view"
//                     className="w-full h-full object-cover brightness-75"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <svg
//                       viewBox="0 0 400 225"
//                       className="w-full h-full drop-shadow-lg"
//                     >
//                       <path
//                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="3"
//                         className="opacity-90"
//                       />
//                       <path
//                         d="M90 80 Q200 90 310 80"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                       <path
//                         d="M140 80 Q160 130 150 180"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                       <path
//                         d="M260 80 Q240 130 250 180"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
//                   <p>
//                     For users who are always on the move, this lens offers a{" "}
//                     <strong>
//                       balanced view across near, intermediate, and distance
//                       zones
//                     </strong>
//                     , making it perfect for work, screens, and driving.
//                   </p>
//                   <p>
//                     <strong>Best For:</strong> First-time progressive wearers.
//                     Busy, active lifestyles with screen time, driving, and
//                     multitasking.
//                   </p>
//                   <p className="italic font-medium text-[#1F1F1F]">
//                     A smart upgrade for anyone who needs sharp, stable vision
//                     throughout the day.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {activeTab === "precision" && (
//               <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
//                 <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
//                   <img
//                     src="tennis-blurr 1.png"
//                     alt="Tennis player focus"
//                     className="w-full h-full object-cover brightness-90"
//                   />
//                   <div className="absolute inset-0 flex items-center justify-center">
//                     <svg
//                       viewBox="0 0 400 225"
//                       className="w-full h-full drop-shadow-lg"
//                     >
//                       <path
//                         d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="3"
//                         className="opacity-90"
//                       />
//                       <path
//                         d="M90 90 Q200 100 310 90"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                       <path
//                         d="M120 150 Q200 160 280 150"
//                         fill="none"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeDasharray="6 4"
//                         className="opacity-80"
//                       />
//                     </svg>
//                   </div>
//                 </div>

//                 <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
//                   <p>
//                     Our most advanced lens, Precision+ delivers{" "}
//                     <strong>ultra-wide viewing zones</strong> with{" "}
//                     <strong>minimal distortion</strong>, designed to fit
//                     seamlessly into modern, narrower frames. No trade-offs, just
//                     clarity and comfort.
//                   </p>
//                   <p>
//                     <strong>Best For:</strong> Seasoned multifocal users, those
//                     seeking premium clarity in sleek frames and want top
//                     performance in any design.
//                   </p>
//                   <p className="italic font-medium text-[#1F1F1F]">
//                     A powerful upgrade for those who know and expect the best.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Tab Buttons */}
//             <div className="flex flex-row flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start w-full">
//               <button
//                 onClick={() => setActiveTab("overview")}
//                 className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
//                   activeTab === "overview"
//                     ? "bg-[#232320] text-white"
//                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
//                 }`}
//               >
//                 Overview
//               </button>
//               <button
//                 onClick={() => setActiveTab("standard")}
//                 className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
//                   activeTab === "standard"
//                     ? "bg-[#232320] text-white"
//                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
//                 }`}
//               >
//                 Standard
//               </button>
//               <button
//                 onClick={() => setActiveTab("advanced")}
//                 className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
//                   activeTab === "advanced"
//                     ? "bg-[#232320] text-white"
//                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
//                 }`}
//               >
//                 Advanced
//               </button>
//               <button
//                 onClick={() => setActiveTab("precision")}
//                 className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
//                   activeTab === "precision"
//                     ? "bg-[#232320] text-white"
//                     : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
//                 }`}
//               >
//                 Precision +
//               </button>
//             </div>
//           </div>

//           {/* Right Content Column (Images) - Increased width and made responsive */}
//           <div className="lg:w-[45%] xl:w-[40%] relative w-full max-w-[900px] mt-8 lg:mt-0">
//             {/* Overview - Single Image */}
//             {activeTab === "overview" && (
//               <div className="relative w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] animate-in fade-in duration-500">
//                 <div className="w-full h-full overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[40px] shadow-lg md:shadow-xl">
//                   <img
//                     src="image 22.png"
//                     alt="Overview Image"
//                     className="w-full h-full object-cover object-center"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Standard Image */}
//             {activeTab === "standard" && (
//               <div className="w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
//                 <img
//                   src="standard 1.png"
//                   alt="Man reading book in garden"
//                   className="w-full h-full object-cover object-center"
//                 />
//               </div>
//             )}

//             {/* Advanced Image */}
//             {activeTab === "advanced" && (
//               <div className="w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
//                 <img
//                   src="advanced 1.png"
//                   alt="Woman driving car"
//                   className="w-full h-full object-cover object-center"
//                 />
//               </div>
//             )}

//             {/* Precision Image */}
//             {activeTab === "precision" && (
//               <div className="w-full h-[350px] sm:h-[400px] md:h-[500px] lg:h-[550px] xl:h-[600px] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
//                 <img
//                   src="tennis-blurr-2 1.png"
//                   alt="Woman playing tennis"
//                   className="w-full h-full object-cover object-center lg:object-top"
//                 />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* --- Promo Section – WHITE background version --- */}
//       <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-8 md:py-12 lg:py-16">
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-0">
//           {/* LEFT: White background + centered image 23.png */}
//           <div className="bg-white flex flex-col items-center justify-center text-[#1E1E1E] py-8 md:py-12 lg:py-16 px-6 md:px-10 text-center order-2 lg:order-1">
//             <img
//               src="/image 23.png"
//               alt="Multifocal Glasses"
//               className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 2xl:w-96 h-auto object-contain mb-6 md:mb-8 lg:mb-10 drop-shadow-xl"
//             />
//             <div className="max-w-xs mx-auto">
//               <button
//                 onClick={() => navigate("/glasses/men")}
//                 className="px-8 sm:px-10 py-3 sm:py-4 bg-[#1E1E1E] text-white font-bold text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full hover:bg-[#333] transition-all shadow-lg w-full sm:w-auto"
//               >
//                 Shop Now
//               </button>
//             </div>
//           </div>

//           {/* RIGHT: 2×2 collage */}
//           <div className="lg:col-span-2 relative h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] xl:h-[600px] order-1 lg:order-2">
//             <img
//               src="/image 21.png"
//               alt="Collection"
//               className="w-full h-full object-cover object-center lg:object-center rounded-xl md:rounded-2xl lg:rounded-none"
//             />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const LensSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "standard" | "advanced" | "precision"
  >("overview");
  const navigate = useNavigate();

  return (
    <section className="w-full font-sans bg-white">
      {/* --- Choosing The Right Lens --- */}
      <div className="py-12 md:py-16 lg:py-24 px-4 sm:px-6">
        <div className="max-w-[1480px] bg-[#F3F0E7] mx-auto px-4 md:px-8 py-8 md:py-12 lg:py-16 rounded-2xl md:rounded-3xl flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16">
          {/* Left Content Column */}
          <div className="lg:w-[55%] xl:w-[60%] flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            <h2 className="text-[#232320] text-[28px] sm:text-[32px] md:text-[36px] xl:text-[40px] font-bold uppercase mb-6 md:mb-8 tracking-wide leading-tight">
              CHOOSING THE RIGHT LENS
            </h2>

            {/* Dynamic Content Based on Tab */}
            {activeTab === "overview" && (
              <div className="space-y-4 md:space-y-6 text-[#333333] text-[16px] sm:text-[17px] md:text-[18px] font-medium leading-relaxed mb-8 md:mb-12 max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p>
                  One of the brilliant things about multifocals is the different
                  lens types you have to choose from to suit exactly what you
                  want them for, whether that's reading, working, driving... or
                  everything.
                </p>
                <p>
                  Here's an explanation of the three types of multifocal lens.
                  And click on our fitting tool to choose the right one for you.
                </p>
              </div>
            )}

            {activeTab === "standard" && (
              <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Lens Diagram / Image Container */}
                <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
                  <img
                    src="book-blurr 1.png"
                    alt="Open book text"
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 400 225"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <path
                        d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        className="opacity-90"
                      />
                      <path
                        d="M90 80 Q200 90 310 80"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                      <path
                        d="M110 140 Q200 150 290 140"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
                  <p>
                    This lens is perfect for those who spend long hours reading,
                    writing, or working on detailed indoor tasks. It features an{" "}
                    <strong>extra-wide near vision zone</strong> — ideal for
                    home and desk use.
                  </p>
                  <p>
                    <strong>Best for:</strong> For anyone seeking a dedicated
                    pair for reading and home activities.
                  </p>
                  <p className="italic font-medium text-[#1F1F1F]">
                    A perfect companion for quiet routines and a life lived up
                    close.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "advanced" && (
              <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
                  <img
                    src="drive-blurr 1.png"
                    alt="Driving road view"
                    className="w-full h-full object-cover brightness-75"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 400 225"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <path
                        d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        className="opacity-90"
                      />
                      <path
                        d="M90 80 Q200 90 310 80"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                      <path
                        d="M140 80 Q160 130 150 180"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                      <path
                        d="M260 80 Q240 130 250 180"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
                  <p>
                    For users who are always on the move, this lens offers a{" "}
                    <strong>
                      balanced view across near, intermediate, and distance
                      zones
                    </strong>
                    , making it perfect for work, screens, and driving.
                  </p>
                  <p>
                    <strong>Best For:</strong> First-time progressive wearers.
                    Busy, active lifestyles with screen time, driving, and
                    multitasking.
                  </p>
                  <p className="italic font-medium text-[#1F1F1F]">
                    A smart upgrade for anyone who needs sharp, stable vision
                    throughout the day.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "precision" && (
              <div className="flex flex-col gap-4 md:gap-6 mb-6 md:mb-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative w-full aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-lg group border-2 md:border-4 border-white">
                  <img
                    src="tennis-blurr 1.png"
                    alt="Tennis player focus"
                    className="w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      viewBox="0 0 400 225"
                      className="w-full h-full drop-shadow-lg"
                    >
                      <path
                        d="M80 40 Q200 10 320 40 Q350 110 320 180 Q200 210 80 180 Q50 110 80 40 Z"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        className="opacity-90"
                      />
                      <path
                        d="M90 90 Q200 100 310 90"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                      <path
                        d="M120 150 Q200 160 280 150"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                        className="opacity-80"
                      />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4 text-[#333333] text-[14px] sm:text-[15px] leading-relaxed text-left">
                  <p>
                    Our most advanced lens, Precision+ delivers{" "}
                    <strong>ultra-wide viewing zones</strong> with{" "}
                    <strong>minimal distortion</strong>, designed to fit
                    seamlessly into modern, narrower frames. No trade-offs, just
                    clarity and comfort.
                  </p>
                  <p>
                    <strong>Best For:</strong> Seasoned multifocal users, those
                    seeking premium clarity in sleek frames and want top
                    performance in any design.
                  </p>
                  <p className="italic font-medium text-[#1F1F1F]">
                    A powerful upgrade for those who know and expect the best.
                  </p>
                </div>
              </div>
            )}

            {/* Tab Buttons */}
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 justify-center lg:justify-start w-full">
              <button
                onClick={() => setActiveTab("overview")}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-[#232320] text-white"
                    : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("standard")}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
                  activeTab === "standard"
                    ? "bg-[#232320] text-white"
                    : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setActiveTab("advanced")}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
                  activeTab === "advanced"
                    ? "bg-[#232320] text-white"
                    : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
                }`}
              >
                Advanced
              </button>
              <button
                onClick={() => setActiveTab("precision")}
                className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] lg:text-[15px] font-bold transition-colors shadow-sm whitespace-nowrap ${
                  activeTab === "precision"
                    ? "bg-[#232320] text-white"
                    : "border border-[#232320] text-[#232320] bg-transparent hover:bg-[#232320] hover:text-white"
                }`}
              >
                Precision +
              </button>
            </div>
          </div>

          {/* Right Content Column (Images) - FULL WIDTH & HEIGHT */}
          <div className="lg:w-[45%] xl:w-[40%] relative w-full h-full min-h-[400px] lg:min-h-[600px]">
            {/* Overview - Single Image */}
            {activeTab === "overview" && (
              <div className="absolute inset-0 animate-in fade-in duration-500">
                <div className="w-full h-full overflow-hidden rounded-2xl md:rounded-3xl lg:rounded-[40px] shadow-lg md:shadow-xl">
                  <img
                    src="image 22.png"
                    alt="Overview Image"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            )}

            {/* Standard Image */}
            {activeTab === "standard" && (
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <img
                  src="standard 1.png"
                  alt="Man reading book in garden"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Advanced Image */}
            {activeTab === "advanced" && (
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <img
                  src="advanced 1.png"
                  alt="Woman driving car"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}

            {/* Precision Image */}
            {activeTab === "precision" && (
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-2xl animate-in fade-in slide-in-from-right-4 duration-500">
                <img
                  src="tennis-blurr-2 1.png"
                  alt="Woman playing tennis"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Promo Section – WHITE background version --- */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 bg-white py-8 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-0">
          {/* LEFT: White background + centered image 23.png */}
          <div className="bg-white flex flex-col items-center justify-center text-[#1E1E1E] py-8 md:py-12 lg:py-16 px-6 md:px-10 text-center order-2 lg:order-1">
            <img
              src="/image 23.png"
              alt="Multifocal Glasses"
              className="w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 2xl:w-96 h-auto object-contain mb-6 md:mb-8 lg:mb-10 drop-shadow-xl"
            />
            <div className="max-w-xs mx-auto">
              <button
                onClick={() => navigate("/glasses/men")}
                className="px-8 sm:px-10 py-3 sm:py-4 bg-[#1E1E1E] text-white font-bold text-xs sm:text-sm uppercase tracking-[0.15em] sm:tracking-[0.2em] rounded-full hover:bg-[#333] transition-all shadow-lg w-full sm:w-auto"
              >
                Shop Now
              </button>
            </div>
          </div>

          {/* RIGHT: 2×2 collage - FULL WIDTH & HEIGHT */}
          <div className="lg:col-span-2 relative w-full h-[300px] sm:h-[350px] md:h-[400px] lg:h-full lg:min-h-[500px] xl:min-h-[600px] order-1 lg:order-2">
            <div className="absolute inset-0">
              <img
                src="/image 21.png"
                alt="Collection"
                className="w-full h-full object-cover object-center lg:object-center rounded-xl md:rounded-2xl lg:rounded-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
