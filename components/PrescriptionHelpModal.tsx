import React, { useState, useEffect } from "react";

interface PrescriptionHelpModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: string;
}

const TABS = [
  "Pupillary Distance",
  "Birth Year",
  "OD/OS",
  "SPH",
  "CYL",
  "AXIS",
  "PRISM",
];

const PrescriptionTable = ({ activeTab }: { activeTab: string }) => {
  const getHighlightClass = (tabName: string) => {
    return activeTab === tabName ? "bg-[#FBECE9]" : "bg-white";
  };

  const getHeaderColor = (tabName: string) => {
    return activeTab === tabName ? "text-[#E94D37]" : "text-gray-500";
  };

  return (
    <div className="w-full max-w-[600px] mt-8">
      <div className="grid grid-cols-5 text-center mb-2 px-4">
        <div
          className={`text-xs font-bold uppercase tracking-wider pb-2 ${getHeaderColor(
            "OD/OS"
          )}`}
        >
          OD / OS
        </div>
        <div
          className={`text-xs font-bold uppercase tracking-wider pb-2 ${getHeaderColor(
            "SPH"
          )}`}
        >
          SPH
        </div>
        <div
          className={`text-xs font-bold uppercase tracking-wider pb-2 ${getHeaderColor(
            "CYL"
          )}`}
        >
          CYL
        </div>
        <div
          className={`text-xs font-bold uppercase tracking-wider pb-2 ${getHeaderColor(
            "AXIS"
          )}`}
        >
          AXIS
        </div>
        <div
          className={`text-xs font-bold uppercase tracking-wider pb-2 ${getHeaderColor(
            "PRISM"
          )}`}
        >
          PRISM
        </div>
      </div>

      <div className="grid grid-cols-5 text-center gap-x-1">
        {/* Row 1 OD */}
        <div
          className={`flex items-center justify-center py-4 rounded-t-lg ${getHighlightClass(
            "OD/OS"
          )}`}
        >
          <span className="font-bold text-[#1F1F1F] text-sm">OD</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-t-lg ${getHighlightClass(
            "SPH"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            SPH
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0.00</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-t-lg ${getHighlightClass(
            "CYL"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            CYL
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0.00</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-t-lg ${getHighlightClass(
            "AXIS"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            AXIS
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-t-lg ${getHighlightClass(
            "PRISM"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            PRISM
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0</span>
        </div>

        {/* Row 2 OS */}
        <div
          className={`flex items-center justify-center py-4 rounded-b-lg ${getHighlightClass(
            "OD/OS"
          )}`}
        >
          <span className="font-bold text-[#1F1F1F] text-sm">OS</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-b-lg ${getHighlightClass(
            "SPH"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            SPH
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0.00</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-b-lg ${getHighlightClass(
            "CYL"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            CYL
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0.00</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-b-lg ${getHighlightClass(
            "AXIS"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            AXIS
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0</span>
        </div>
        <div
          className={`flex flex-col items-center justify-center py-3 rounded-b-lg ${getHighlightClass(
            "PRISM"
          )}`}
        >
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            BASE
          </span>
          <span className="font-bold text-[#1F1F1F] text-sm">0</span>
        </div>
      </div>
    </div>
  );
};

const PrescriptionHelpModal: React.FC<PrescriptionHelpModalProps> = ({
  open,
  onClose,
  initialTab = "Pupillary Distance",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-[850px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-black hover:text-gray-600 transition-colors z-10 p-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="13" y2="13"></line>
            <line x1="13" y1="1" x2="1" y2="13"></line>
          </svg>
        </button>

        {/* Tabs */}
        <div className="flex items-center justify-start border-b border-gray-200 pt-8 px-8 gap-8 overflow-x-auto scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all border-b-[3px] ${
                activeTab === tab
                  ? "border-[#FF3B19] text-[#FF3B19]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-10 min-h-[400px] flex flex-col items-center text-center">
          {activeTab === "Pupillary Distance" && (
            <>
              <p className="text-sm text-gray-700 mb-10 leading-relaxed max-w-2xl font-medium">
                Pupillary distance (PD) is the distance between the pupils of
                your two eyes. It is an essential measurement when buying a new
                pair of eyeglasses or prescription sunglasses. For greatest
                comfort and clarity.
              </p>
              <div className="w-full max-w-[400px]">
                <svg viewBox="0 0 400 150" className="w-full h-full">
                  {/* Left Eye Graphic */}
                  <g transform="translate(60, 80)">
                    <path
                      d="M-45 0 Q0 -40 45 0 Q0 40 -45 0 Z"
                      fill="white"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="0" r="14" fill="black" />
                    <circle cx="0" cy="0" r="5" fill="white" />
                    {/* Pupil Center Line Vertical */}
                    <line
                      x1="0"
                      y1="-60"
                      x2="0"
                      y2="0"
                      stroke="#F3CB0A"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </g>

                  {/* Right Eye Graphic */}
                  <g transform="translate(340, 80)">
                    <path
                      d="M-45 0 Q0 -40 45 0 Q0 40 -45 0 Z"
                      fill="white"
                      stroke="black"
                      strokeWidth="2"
                    />
                    <circle cx="0" cy="0" r="14" fill="black" />
                    <circle cx="0" cy="0" r="5" fill="white" />
                    {/* Pupil Center Line Vertical */}
                    <line
                      x1="0"
                      y1="-60"
                      x2="0"
                      y2="0"
                      stroke="#F3CB0A"
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                    />
                  </g>

                  {/* Center Line Vertical */}
                  <line
                    x1="200"
                    y1="20"
                    x2="200"
                    y2="100"
                    stroke="#F3CB0A"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />

                  {/* Total PD Arrow Line */}
                  <line
                    x1="60"
                    y1="20"
                    x2="340"
                    y2="20"
                    stroke="#F3CB0A"
                    strokeWidth="2"
                  />
                  {/* Arrowheads */}
                  <path d="M60 20 L70 15 L70 25 Z" fill="#F3CB0A" />
                  <path d="M340 20 L330 15 L330 25 Z" fill="#F3CB0A" />
                  <text
                    x="200"
                    y="15"
                    textAnchor="middle"
                    fontSize="12"
                    fill="black"
                    fontWeight="500"
                  >
                    Total PD
                  </text>

                  {/* Right PD Arrow Line (Left side of image) */}
                  <line
                    x1="60"
                    y1="50"
                    x2="200"
                    y2="50"
                    stroke="#F3CB0A"
                    strokeWidth="2"
                  />
                  <path d="M60 50 L70 45 L70 55 Z" fill="#F3CB0A" />
                  <path d="M200 50 L190 45 L190 55 Z" fill="#F3CB0A" />
                  <text
                    x="130"
                    y="45"
                    textAnchor="middle"
                    fontSize="11"
                    fill="black"
                    fontWeight="500"
                  >
                    Right PD
                  </text>

                  {/* Left PD Arrow Line (Right side of image) */}
                  <line
                    x1="200"
                    y1="50"
                    x2="340"
                    y2="50"
                    stroke="#F3CB0A"
                    strokeWidth="2"
                  />
                  <path d="M200 50 L210 45 L210 55 Z" fill="#F3CB0A" />
                  <path d="M340 50 L330 45 L330 55 Z" fill="#F3CB0A" />
                  <text
                    x="270"
                    y="45"
                    textAnchor="middle"
                    fontSize="11"
                    fill="black"
                    fontWeight="500"
                  >
                    Left PD
                  </text>
                </svg>
              </div>
            </>
          )}

          {activeTab === "Birth Year" && (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-gray-700 leading-relaxed max-w-2xl font-medium">
                Please enter the birth year of the customer associated with this
                prescription/order. Customer's birth year helps us provide
                age-appropriate lens recommendations.
              </p>
            </div>
          )}

          {activeTab === "OD/OS" && (
            <>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed max-w-2xl font-medium">
                <strong>OD</strong> = Oculus Dexter, which refers to the right
                eye. <strong>OS</strong> = Oculus Sinister, refers to left
              </p>
              <PrescriptionTable activeTab={activeTab} />
            </>
          )}

          {activeTab === "SPH" && (
            <>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed max-w-3xl font-medium text-left">
                <strong>SPH</strong> = Sphere or Spherical, refers to the main
                correction in the prescription. Minus (-) values are for
                nearsightedness, and Plus (+) values are for farsightedness. If
                "PL" or "Plano" is written for this value then you should select
                0.00 for this field.
              </p>
              <PrescriptionTable activeTab={activeTab} />
            </>
          )}

          {activeTab === "CYL" && (
            <>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed max-w-3xl font-medium text-left">
                <strong>CYL</strong> = Cylinder, refers to a correction for
                astigmatism. It can be either positive or negative. A CYL value
                will always have an Axis value. If "DS" or "SPH" is noted in the
                CYL space on your prescription, you have no astigmatism in that
                eye. In that case, enter 0.00 for the CYL and Axis.
              </p>
              <PrescriptionTable activeTab={activeTab} />
            </>
          )}

          {activeTab === "AXIS" && (
            <>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed max-w-3xl font-medium text-left">
                <strong>AXIS</strong> = refers to the angle of the correction
                for the astigmatism (CYL) in the eye from 1 to 180 degrees. If
                there is no CYL value then there is no Axis value. The Axis
                value may be written as 3 digits, which means if your Axis value
                is 5, it is often written as 005.
              </p>
              <PrescriptionTable activeTab={activeTab} />
            </>
          )}

          {activeTab === "PRISM" && (
            <>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed max-w-3xl font-medium text-left">
                <strong>PRISM</strong> = In optometry, prism power refers to the
                strength of a prism used in eyeglasses to correct double vision
                or other alignment problems in the eyes. The power is measured
                in prism diopters, indicating how much the light is bent to
                correct the alignment.
              </p>
              <PrescriptionTable activeTab={activeTab} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionHelpModal;
