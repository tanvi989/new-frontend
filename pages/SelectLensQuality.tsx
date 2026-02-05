// import React, { useState } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import CheckoutStepper from "../components/CheckoutStepper";

// const SelectLensQuality: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const lensType = state?.lensType || "progressive"; // 'progressive' or 'bifocal'
//   const [selectedQuality, setSelectedQuality] = useState<
//     "advanced" | "standard"
//   >("advanced");

//   const handleContinue = () => {
//     // Navigate to prescription source selection page
//     navigate(`/product/${id}/select-prescription-source`, {
//       state: {
//         ...state,
//         prescriptionTier: selectedQuality,
//         lensType: lensType,
//         product: state?.product,
//       },
//     });
//   };

//   const getPageTitle = () => {
//     return "SELECT MULTIFOCAL TYPE";
//   };

//   // return (
//   //   <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8">
//   //     <CheckoutStepper currentStep={2} />

//   //     <div className="max-w-[1000px] mx-auto">
//   //       {/* Header Title */}
//   //       <div className="text-center mb-10 relative">
//   //         <h1 className="text-[28px] md:text-[32px] font-bold text-[#1F1F1F] uppercase tracking-widest">
//   //           {getPageTitle()}
//   //         </h1>
//   //         <button
//   //           onClick={() => navigate(-1)}
//   //           className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors hidden md:block"
//   //         >
//   //           <svg
//   //             width="24"
//   //             height="24"
//   //             viewBox="0 0 24 24"
//   //             fill="none"
//   //             stroke="currentColor"
//   //             strokeWidth="2"
//   //             strokeLinecap="round"
//   //             strokeLinejoin="round"
//   //           >
//   //             <circle cx="12" cy="12" r="10"></circle>
//   //             <line x1="15" y1="9" x2="9" y2="15"></line>
//   //             <line x1="9" y1="9" x2="15" y2="15"></line>
//   //           </svg>
//   //         </button>
//   //       </div>

//   //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-[900px] mx-auto">
//   //         {/* Advanced & Precision+ Card (Recommended) */}
//   //         <div
//   //           className={`rounded-2xl p-4 md:p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg relative ${selectedQuality === "advanced"
//   //               ? "bg-white border-[#025048] shadow-md"
//   //               : "bg-[#F3F0E7] border-transparent shadow-soft hover:border-gray-200"
//   //             }`}
//   //           onClick={() => setSelectedQuality("advanced")}
//   //         >
//   //           {/* Selection Indicator (Top Right) */}
//   //           <div
//   //             className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedQuality === "advanced"
//   //               ? "border-[#025048] bg-[#025048]"
//   //               : "border-gray-300"
//   //               }`}
//   //           >
//   //             {selectedQuality === "advanced" && (
//   //               <svg
//   //                 width="10"
//   //                 height="10"
//   //                 viewBox="0 0 12 12"
//   //                 fill="none"
//   //                 stroke="white"
//   //                 strokeWidth="2"
//   //               >
//   //                 <polyline points="1 6 4.5 9 11 2"></polyline>
//   //               </svg>
//   //             )}
//   //           </div>

//   //           <div className="mb-3">
//   //             <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wide bg-[#F3CB0A] px-2 py-0.5 rounded">
//   //               Recommended
//   //             </span>
//   //           </div>
//   //           <h3 className="text-lg font-bold text-[#1F1F1F] mb-4 font-serif leading-tight pr-8">
//   //             Advanced & Precision+ Options
//   //           </h3>

//   //           <div className="flex flex-col sm:flex-row gap-4">
//   //             {/* Icon */}
//   //             <div className="flex-shrink-0 flex justify-center sm:justify-start">
//   //               <LensIcon variant="advanced" lensType={lensType} />
//   //             </div>

//   //             {/* List */}
//   //             <ul className="space-y-1.5 flex-1">
//   //               {[
//   //                 "Best choice for first-timers",
//   //                 "Works with all frame styles",
//   //                 "Fastest, easiest to adapt",
//   //                 "For living life fully, without limits",
//   //                 "Highest clarity across distances",
//   //               ].map((item, i) => (
//   //                 <li
//   //                   key={i}
//   //                   className="flex items-start gap-2 text-xs text-[#525252] font-medium leading-snug"
//   //                 >
//   //                   <span className="mt-1 w-1.5 h-1.5 bg-[#1F1F1F] rounded-full shrink-0"></span>
//   //                   {item}
//   //                 </li>
//   //               ))}
//   //             </ul>
//   //           </div>
//   //         </div>

//   //         {/* Standard Card */}
//   //         <div
//   //           className={`rounded-2xl p-4 md:p-6 border-2 cursor-pointer transition-all duration-300 hover:shadow-lg relative ${selectedQuality === "standard"
//   //               ? "bg-white border-[#025048] shadow-md"
//   //               : "bg-[#F3F0E7] border-transparent shadow-soft hover:border-gray-200"
//   //             }`}
//   //           onClick={() => setSelectedQuality("standard")}
//   //         >
//   //           <div
//   //             className={`absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedQuality === "standard"
//   //               ? "border-[#025048] bg-[#025048]"
//   //               : "border-gray-300"
//   //               }`}
//   //           >
//   //             {selectedQuality === "standard" && (
//   //               <svg
//   //                 width="10"
//   //                 height="10"
//   //                 viewBox="0 0 12 12"
//   //                 fill="none"
//   //                 stroke="white"
//   //                 strokeWidth="2"
//   //               >
//   //                 <polyline points="1 6 4.5 9 11 2"></polyline>
//   //               </svg>
//   //             )}
//   //           </div>

//   //           <div className="mb-3 invisible">
//   //             <span className="text-xs font-bold uppercase tracking-wide px-2 py-0.5">
//   //               Spacer
//   //             </span>
//   //           </div>
//   //           <h3 className="text-lg font-bold text-[#1F1F1F] mb-4 font-serif leading-tight pr-8">
//   //             Standard Options
//   //           </h3>

//   //           <div className="flex flex-col sm:flex-row gap-4">
//   //             {/* Icon */}
//   //             <div className="flex-shrink-0 flex justify-center sm:justify-start">
//   //               <LensIcon variant="standard" lensType={lensType} />
//   //             </div>

//   //             <ul className="space-y-1.5 flex-1">
//   //               {[
//   //                 "Designed for slower, calmer days",
//   //                 "Great for reading, less screen",
//   //                 "Ideal for minimal daily driving",
//   //                 "Works with select classic frames",
//   //               ].map((item, i) => (
//   //                 <li
//   //                   key={i}
//   //                   className="flex items-start gap-2 text-xs text-[#525252] font-medium leading-snug"
//   //                 >
//   //                   <span className="mt-1 w-1.5 h-1.5 bg-[#1F1F1F] rounded-full shrink-0"></span>
//   //                   {item}
//   //                 </li>
//   //               ))}
//   //             </ul>
//   //           </div>
//   //         </div>
//   //       </div>

//   //       <div className="flex justify-center">
//   //         <button
//   //           onClick={handleContinue}
//   //           className="bg-[#025048] text-white px-16 py-4 rounded-full font-bold text-sm uppercase tracking-[0.15em] hover:bg-[#013d37] transition-all shadow-lg hover:shadow-xl active:scale-95 min-w-[240px]"
//   //         >
//   //           CONTINUE
//   //         </button>
//   //       </div>
//   //     </div>
//   //   </div>
//   // );
// };

// const LensIcon = ({
//   variant,
//   lensType,
// }: {
//   variant: "advanced" | "standard";
//   lensType: string;
// }) => {
//   const lensBorder = "#FF3B19";
//   const lensBg = "#FAF9F6";
//   const blurFill = "#FFD700";
//   const strokeColor = "#E6B400";

//   // Lens Shape: Realistic rounded shape
//   const lensPath =
//     "M30 50 C30 20 70 10 100 10 C130 10 170 20 170 50 C170 100 150 140 100 150 C50 140 30 100 30 50 Z";

//   return (
//     <svg
//       width="100"
//       height="100"
//       viewBox="0 0 200 160"
//       fill="none"
//       xmlns="http://www.w3.org/2000/svg"
//       className="mx-auto"
//     >
//       {/* Background */}
//       <path d={lensPath} fill={lensBg} stroke={lensBorder} strokeWidth="2.5" />

//       <mask id={`mask-${variant}-${lensType}`}>
//         <path d={lensPath} fill="white" />
//       </mask>

//       <g mask={`url(#mask-${variant}-${lensType})`}>
//         {lensType === "bifocal" ? (
//           <>
//             {/* Bifocal: Clear horizontal line dividing two zones */}

//             {/* Horizontal dividing line */}
//             <line
//               x1="30"
//               y1="100"
//               x2="170"
//               y2="100"
//               stroke={strokeColor}
//               strokeWidth="3"
//             />

//             {/* Small reading segment at bottom */}
//             <path
//               d="M70 100 Q100 105 130 100 L130 140 Q100 145 70 140 Z"
//               fill={blurFill}
//               opacity="0.3"
//             />
//           </>
//         ) : variant === "standard" ? (
//           <>
//             {/* Standard: Narrow corridor with larger blur zones */}

//             {/* Left Blur Zone */}
//             <path
//               d="M20 80 Q75 85 65 115 Q60 140 40 160 H20 V80 Z"
//               fill={blurFill}
//             />
//             <path
//               d="M20 80 Q75 85 65 115 Q60 140 40 160"
//               stroke={strokeColor}
//               strokeWidth="2"
//               strokeDasharray="4 3"
//               fill="none"
//             />

//             {/* Right Blur Zone */}
//             <path
//               d="M180 80 Q125 85 135 115 Q140 140 160 160 H180 V80 Z"
//               fill={blurFill}
//             />
//             <path
//               d="M180 80 Q125 85 135 115 Q140 140 160 160"
//               stroke={strokeColor}
//               strokeWidth="2"
//               strokeDasharray="4 3"
//               fill="none"
//             />
//           </>
//         ) : (
//           <>
//             {/* Advanced: Wide corridor with smaller blur zones */}

//             {/* Left Blur Zone */}
//             <path
//               d="M20 95 Q50 100 45 125 Q40 145 30 160 H20 V95 Z"
//               fill={blurFill}
//             />
//             <path
//               d="M20 95 Q50 100 45 125 Q40 145 30 160"
//               stroke={strokeColor}
//               strokeWidth="2"
//               strokeDasharray="4 3"
//               fill="none"
//             />

//             {/* Right Blur Zone */}
//             <path
//               d="M180 95 Q150 100 155 125 Q160 145 170 160 H180 V95 Z"
//               fill={blurFill}
//             />
//             <path
//               d="M180 95 Q150 100 155 125 Q160 145 170 160"
//               stroke={strokeColor}
//               strokeWidth="2"
//               strokeDasharray="4 3"
//               fill="none"
//             />
//           </>
//         )}

//         {/* Text Labels */}
//         {lensType === "bifocal" ? (
//           <>
//             <text
//               x="100"
//               y="60"
//               textAnchor="middle"
//               fontSize="8"
//               fontWeight="800"
//               fill="#1F1F1F"
//               letterSpacing="0.05em"
//               fontFamily="sans-serif"
//             >
//               DISTANCE
//             </text>
//             <text
//               x="100"
//               y="125"
//               textAnchor="middle"
//               fontSize="8"
//               fontWeight="800"
//               fill="#1F1F1F"
//               letterSpacing="0.05em"
//               fontFamily="sans-serif"
//             >
//               READING
//             </text>
//           </>
//         ) : (
//           <>
//             <text
//               x="100"
//               y="45"
//               textAnchor="middle"
//               fontSize="8"
//               fontWeight="800"
//               fill="#1F1F1F"
//               letterSpacing="0.05em"
//               fontFamily="sans-serif"
//             >
//               DISTANCE
//             </text>
//             <text
//               x="100"
//               y="90"
//               textAnchor="middle"
//               fontSize="8"
//               fontWeight="800"
//               fill="#1F1F1F"
//               letterSpacing="0.05em"
//               fontFamily="sans-serif"
//             >
//               INTERMEDIATE
//             </text>
//             <text
//               x="100"
//               y="130"
//               textAnchor="middle"
//               fontSize="8"
//               fontWeight="800"
//               fill="#1F1F1F"
//               letterSpacing="0.05em"
//               fontFamily="sans-serif"
//             >
//               NEAR
//             </text>
//           </>
//         )}
//       </g>
//     </svg>
//   );
// };

// export default SelectLensQuality;



//XXXXXXXXXXXXXXXXXXXXHere is the code for the SelectLensQuality page2, whgich i have commented XXXXXXXXXXXXXXXXX

