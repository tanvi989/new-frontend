import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CheckoutStepper from "../components/CheckoutStepper";
import Toast from "../components/Toast";
import { getProductFlow, setProductFlow } from "../utils/productFlowStorage";
import { LoginModal } from "../components/LoginModal";
import PrescriptionHelpModal from "../components/PrescriptionHelpModal";
import GetMyFitPopup from "../components/getMyFitPopup/GetMyFitPopup";
import { getCaptureSession } from "../utils/captureSession";
import { X, Volume2, VolumeX } from "lucide-react";

const SelectPrescriptionSource: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state: locationState, pathname } = useLocation();
  const flow = id ? getProductFlow(id) : null;
  const state = { ...flow, product: locationState?.product ?? flow?.product, ...locationState };
  const navigate = useNavigate();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pdPreference, setPdPreference] = useState<"" | "know" | "generate">("");
  const [pdType, setPdType] = useState<"single" | "dual">("single");
  const [pdSingle, setPdSingle] = useState("");
  const [pdRight, setPdRight] = useState("");
  const [pdLeft, setPdLeft] = useState("");
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpModalTab, setHelpModalTab] = useState("Pupillary Distance");
  const [isGetMyFitOpen, setIsGetMyFitOpen] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [capturedPD, setCapturedPD] = useState<{ pdSingle?: number; pdRight?: number; pdLeft?: number } | null>(null);
  const [pdFilledByMfit, setPdFilledByMfit] = useState(false);

  // Ref for scrolling to PD form on mobile
  const pdFormRef = React.useRef<HTMLDivElement>(null);

  const scrollToPdForm = () => {
    setTimeout(() => {
      pdFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const pdVoiceText =
    "PD, made easy. Let's keep this simple. " +
    "Some prescriptions show Distance PD and Near PD. For multifocal or progressive lenses, always use Distance PD. " +
    "If your prescription shows just one PD value, that's absolutely fine. Enter it as it is — we'll handle the rest. " +
    "You can also choose to split the PD evenly between both eyes. For example, if your PD is 66, enter 33 for the right eye and 33 for the left eye. " +
    "If your prescription shows separate values for each eye, select Dual PD and enter the left and right values exactly as written. " +
    "And if your prescription doesn't mention PD at all, don't worry — you're in safe hands. " +
    "Use Generate PD with MFit. Our technology measures both eyes precisely, and has been tested on thousands of people. " +
    "Your PD is delivered instantly, with accuracy you can trust. " +
    "And every order is protected by our 30-day, no-questions-asked guarantee.";

  // Play voice every time user lands on this page (pathname includes select-prescription-source)
  useEffect(() => {
    if (voiceMuted || !window.speechSynthesis || !pathname.includes("select-prescription-source")) return;
    const timer = setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(pdVoiceText);
      utterance.rate = 0.9;
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }, 300);
    return () => {
      clearTimeout(timer);
      window.speechSynthesis.cancel();
    };
  }, [voiceMuted, pathname]);

  const pdOptions = React.useMemo(
    () => Array.from({ length: 45 }, (_, i) => (20 + i * 0.5).toFixed(2)),
    []
  );
  const pdSingleOptions = React.useMemo(
    () => Array.from({ length: 81 }, (_, i) => (40 + i * 0.5).toFixed(2)),
    []
  );

  // Load PD from flow/session into state (but don't show form initially – user must click a card first)
  useEffect(() => {
    if (!id) return;
    const flowHasPD = flow?.pdPreference === "know" && (flow?.pdSingle || (flow?.pdRight && flow?.pdLeft));
    if (flowHasPD) {
      setPdType(flow.pdType === "dual" ? "dual" : "single");
      if (flow.pdSingle) setPdSingle(flow.pdSingle);
      if (flow.pdRight) setPdRight(flow.pdRight);
      if (flow.pdLeft) setPdLeft(flow.pdLeft);
      return;
    }
    const session = getCaptureSession();
    const m = session?.measurements;
    if (!m) return;
    const hasTotal = typeof m.pd === "number" && m.pd > 0;
    const hasDual = typeof m.pd_left === "number" && typeof m.pd_right === "number" && m.pd_left > 0 && m.pd_right > 0;
    if (!hasTotal && !hasDual) return;
    setPdFilledByMfit(true);
    if (hasDual) {
      setPdType("dual");
      setPdRight(roundPdToDropdownOption(m.pd_right, pdOptions));
      setPdLeft(roundPdToDropdownOption(m.pd_left, pdOptions));
      setPdSingle("");
      if (id) {
        setProductFlow(id, {
          pdPreference: "know",
          pdType: "dual",
          pdRight: roundPdToDropdownOption(m.pd_right, pdOptions),
          pdLeft: roundPdToDropdownOption(m.pd_left, pdOptions),
        });
      }
    } else {
      const totalPd = hasTotal ? m.pd : (m.pd_left ?? 0) + (m.pd_right ?? 0);
      if (totalPd <= 0) return;
      setPdType("dual");
      const half = totalPd / 2;
      setPdRight(roundPdToDropdownOption(half, pdOptions));
      setPdLeft(roundPdToDropdownOption(half, pdOptions));
      setPdSingle("");
      if (id) {
        setProductFlow(id, {
          pdPreference: "know",
          pdType: "dual",
          pdRight: roundPdToDropdownOption(totalPd / 2, pdOptions),
          pdLeft: roundPdToDropdownOption(totalPd / 2, pdOptions),
        });
      }
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps -- run once on mount; flow/capture session are read at that time

  // Function to round PD to nearest dropdown option
  // Special handling: if PD is 60.50, choose 61.00; if less than 60.5 (but >= 60), choose 60.00
  const roundPdToDropdownOption = (value: number, options: string[]): string => {
    if (isNaN(value) || value <= 0) return "";
    
    const numValue = Number(value);
    
    // Special handling for values around 60-61
    if (numValue >= 60 && numValue < 60.5) {
      return "60.00";
    }
    if (numValue === 60.5 || (numValue > 60.5 && numValue <= 61)) {
      return "61.00";
    }
    
    // Otherwise, find the nearest option
    let closest = options[0];
    let minDiff = Math.abs(numValue - parseFloat(closest));
    
    for (const option of options) {
      const diff = Math.abs(numValue - parseFloat(option));
      if (diff < minDiff) {
        minDiff = diff;
        closest = option;
      }
    }
    
    return closest;
  };

  const openHelp = (tab: string) => {
    setHelpModalTab(tab);
    setHelpModalOpen(true);
  };

  const HelpButton = ({ onClick }: { onClick: () => void }) => (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="ml-2 w-5 h-5 rounded-full bg-[#E94D37] flex items-center justify-center hover:bg-[#bf3e2b] transition-colors flex-shrink-0"
      aria-label="PD info"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 5v3M6 4.5a.5.5 0 100-1 .5.5 0 000 1z" />
      </svg>
    </button>
  );

  const handleNewPrescription = () => {
    const isKnow = pdPreference === "know";
    const right = isKnow && pdType === "single" && pdSingle
      ? (parseFloat(pdSingle) / 2).toFixed(2)
      : isKnow && pdType === "dual"
        ? pdRight
        : undefined;
    const left = isKnow && pdType === "single" && pdSingle
      ? (parseFloat(pdSingle) / 2).toFixed(2)
      : isKnow && pdType === "dual"
        ? pdLeft
        : undefined;
    const pdPayload = {
      pdPreference: pdPreference || undefined,
      pdType: isKnow ? pdType : undefined,
      pdSingle: isKnow && pdType === "single" ? pdSingle : undefined,
      pdRight: right,
      pdLeft: left,
    };
    if (id) setProductFlow(id, pdPayload);
    navigate(`/product/${id}/add-prescription`, {
      state: {
        ...state,
        prescriptionTier: state?.lensOption || state?.prescriptionTier,
        ...pdPayload,
      }
    });
  };

  const handleGenerateNewPd = () => {
    const hasExistingPD = pdSingle || (pdRight && pdLeft);
    if (hasExistingPD) {
      // PD already exists (from session/flow) – show the form with values
      setPdPreference("know");
      scrollToPdForm();
    } else {
      // No PD – open MFit popup
      if (id) setProductFlow(id, { pdPreference: "generate" });
      setIsGetMyFitOpen(true);
    }
  };

  // Auto-fill PD when MFit captures it — then auto-navigate to add-prescription
  const handlePDCaptured = (pdData: { pdSingle?: number; pdRight?: number; pdLeft?: number }) => {
    setCapturedPD(pdData);
    setPdFilledByMfit(true);
    setIsGetMyFitOpen(false);
    setPdPreference("know");

    let roundedRight = "";
    let roundedLeft = "";
    if (pdData.pdRight != null && pdData.pdLeft != null) {
      roundedRight = roundPdToDropdownOption(pdData.pdRight, pdOptions);
      roundedLeft = roundPdToDropdownOption(pdData.pdLeft, pdOptions);
    } else if (pdData.pdSingle != null) {
      const half = pdData.pdSingle / 2;
      roundedRight = roundPdToDropdownOption(half, pdOptions);
      roundedLeft = roundPdToDropdownOption(half, pdOptions);
    } else if (pdData.pdRight != null || pdData.pdLeft != null) {
      const half = (pdData.pdRight ?? pdData.pdLeft ?? 0) / 2;
      const total = half * 2;
      roundedRight = roundPdToDropdownOption(total / 2, pdOptions);
      roundedLeft = roundPdToDropdownOption(total / 2, pdOptions);
    }

    setPdType("dual");
    setPdRight(roundedRight);
    setPdLeft(roundedLeft);
    setPdSingle("");

    // Build payload using local vars immediately (React state updates are async)
    const pdPayload = {
      pdPreference: "know" as const,
      pdType: "dual" as const,
      pdSingle: undefined as string | undefined,
      pdRight: roundedRight,
      pdLeft: roundedLeft,
    };

    if (id && (roundedRight || roundedLeft)) {
      setProductFlow(id, pdPayload);
    }

    // Auto-navigate directly to add-prescription — user shouldn't need to press Continue after MFit
    if (roundedRight && roundedLeft && id) {
      navigate(`/product/${id}/add-prescription`, {
        state: {
          ...state,
          prescriptionTier: state?.lensOption || state?.prescriptionTier,
          ...pdPayload,
        },
      });
    } else {
      // Fallback: rounding failed, show form so user can correct manually
      scrollToPdForm();
    }
  };

  // Helper function to get lens type display text
  const getLensTypeText = () => {
    const lensType = state?.lensType;
    const tier = state?.prescriptionTier;
    
    if (lensType === "progressive" && tier) {
      // Map tier to display name
      const tierMap: { [key: string]: string } = {
        precision: "Precision+ Options",
        advanced: "Advanced Options",
        standard: "Standard Options"
      };
      return `Progressive - ${tierMap[tier] || tier}`;
    }
    
    switch (lensType) {
      case "single":
        return "Single Vision";
      case "bifocal":
        return "Bifocal";
      case "progressive":
        return "Progressive";
      default:
        return "Multifocal";
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F0E7] font-sans py-8 px-4 md:px-8 pb-16 md:pb-8 relative">
      {/* TOP HEADER STRIP (Stepper) */}
      <div className="hidden lg:block">
        <CheckoutStepper
          currentStep={3}
          selections={{
            2: `${getLensTypeText()} Eyeglasses`,
          }}
        />
      </div>

      <div className="max-w-[1000px] mx-auto mt-4 md:mt-6">
        {/* PAGE TITLE */}
         <div className="mb-8 relative md:mb-12">
          {/* Desktop Title */}
          <div className="hidden md:flex items-center justify-center gap-2">
            <p className="text-xl md:text-2xl font-medium text-[#1F1F1F] uppercase tracking-[0.1em]">
              Select a Pupillary Distance (PD) Option 
            </p>
            <HelpButton onClick={() => openHelp("Pupillary Distance")} />
          </div>
          <p className="hidden md:block text-base text-gray-600 mt-2 text-center max-w-[560px] mx-auto">
            PD is the distance between the centres of your pupils (in mm). It helps us align your lenses correctly.
          </p>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between border-b border-black pb-4 -mx-4 px-4 bg-[#F3F0E7]">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <p className="text-[18px] font-medium text-[#1F1F1F] uppercase tracking-[0.1em] truncate">
                PD Option - {getLensTypeText()}
              </p>
              <HelpButton onClick={() => openHelp("Pupillary Distance")} />
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="md:hidden text-sm text-gray-600 mt-3 px-0">
            PD is the distance between the centres of your pupils (in mm). It helps us align your lenses correctly.
          </p>
        </div>

        {/* CARD GRID */}
        <div className="flex flex-col gap-5 max-w-[900px] mx-auto">

          {/* 🔹 TOP TWO CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* I know my PD value CARD */}
            <button
              type="button"
              onClick={() => {
                setPdPreference("know");
                scrollToPdForm();
              }}
              className="
                w-full
                bg-[#F3F0E7]
                border-[1.8px]
                border-[#777]
                rounded-[24px]
                p-4
                hover:border-[#555]
                hover:shadow-md
                transition-all
                duration-300
                text-center
                min-h-[150px]
                flex-row md:flex-col
                items-center
                justify-center
              "
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
                I know my PD value
              </h3>

              <p className="text-base text-gray-700 leading-relaxed">
                You can enter it when adding your prescription (from your prescription slip or a previous measurement).
              </p>
            </button>

            {/* Generate new PD with MFit CARD */}
            <button
              onClick={handleGenerateNewPd}
              className="
                w-full
                bg-[#F3F0E7]
                border-[1.8px]
                border-[#777]
                rounded-3xl
                p-4
                hover:border-[#555]
                hover:shadow-md
                transition-all
                duration-300
                text-center
                min-h-[150px]
                flex-row md:flex-col
                items-center
                justify-center
              "
            >
              <h3 className="text-lg font-bold text-[#1F1F1F] mb-3">
                Generate new PD value with MFit 
              </h3>

              <p className="text-base text-gray-700 leading-relaxed">
                We&apos;ll guide you to measure your PD using your device camera in the next step.
              </p>
            </button>
          </div>

          {/* 🔹 BOTTOM CARD: PD form — same size/style as top two cards */}
          {pdPreference === "know" && (
            <div className="flex justify-center" ref={pdFormRef}>
              <div className="w-full md:w-1/2 bg-[#F3F0E7] border-[1.8px] border-[#777] rounded-[24px] p-4 min-h-[150px] flex flex-col justify-center">
                <p className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wide mb-2">
                  {pdFilledByMfit ? "PD is autofilled by MFit" : "Choose one:"}
                </p>
                {!pdFilledByMfit && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pdTypeCard"
                        value="single"
                        checked={pdType === "single"}
                        onChange={() => setPdType("single")}
                        className="w-3.5 h-3.5 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                      />
                      <span className="text-xs font-medium text-[#1F1F1F]">Single PD (total distance)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="pdTypeCard"
                        value="dual"
                        checked={pdType === "dual"}
                        onChange={() => setPdType("dual")}
                        className="w-3.5 h-3.5 text-[#014D40] focus:ring-[#014D40] border-gray-300"
                      />
                      <span className="text-xs font-medium text-[#1F1F1F]">Both eyes PD</span>
                    </label>
                  </div>
                )}

                {pdType === "single" && !pdFilledByMfit && (
                  <div className="mb-2">
                    <label htmlFor="select-pd-single-card" className="text-[10px] font-bold text-[#1F1F1F] uppercase tracking-wide block mb-1">
                      PD (mm)
                    </label>
                    <div className="relative max-w-[140px]">
                      <select
                        id="select-pd-single-card"
                        value={pdSingle}
                        onChange={(e) => setPdSingle(e.target.value)}
                        className="relative z-10 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 pr-7 text-[#1F1F1F] text-sm font-medium focus:outline-none focus:border-[#232320] appearance-none cursor-pointer"
                        style={{ minHeight: "36px" }}
                      >
                        <option value="">Select</option>
                        {pdSingleOptions.map((val) => (
                          <option key={val} value={val}>{val}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 z-0">
                        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {(pdType === "dual" || pdFilledByMfit) && (
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="flex flex-col gap-0.5">
                      <label htmlFor="select-pd-right-card" className="text-[10px] font-bold text-[#1F1F1F] uppercase tracking-wide">
                        Right Eye
                      </label>
                      <div className="relative">
                        <select
                          id="select-pd-right-card"
                          value={pdRight}
                          onChange={(e) => setPdRight(e.target.value)}
                          className="relative z-10 w-full bg-white border border-gray-200 rounded-lg px-2 py-2 pr-6 text-[#1F1F1F] text-sm font-medium focus:outline-none focus:border-[#232320] appearance-none cursor-pointer"
                          style={{ minHeight: "36px" }}
                        >
                          <option value="">Select</option>
                          {pdOptions.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 z-0">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label htmlFor="select-pd-left-card" className="text-[10px] font-bold text-[#1F1F1F] uppercase tracking-wide">
                        Left Eye
                      </label>
                      <div className="relative">
                        <select
                          id="select-pd-left-card"
                          value={pdLeft}
                          onChange={(e) => setPdLeft(e.target.value)}
                          className="relative z-10 w-full bg-white border border-gray-200 rounded-lg px-2 py-2 pr-6 text-[#1F1F1F] text-sm font-medium focus:outline-none focus:border-[#232320] appearance-none cursor-pointer"
                          style={{ minHeight: "36px" }}
                        >
                          <option value="">Select</option>
                          {pdOptions.map((val) => (
                            <option key={val} value={val}>{val}</option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 z-0">
                          <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleNewPrescription}
                  disabled={(pdType === "single" && !pdSingle) || (pdType === "dual" && (!pdRight || !pdLeft))}
                  className="mt-1 w-full bg-[#232320] text-white py-2.5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to add prescription
                </button>
              </div>
            </div>
          )}
        </div>

        {/* PD made simple - short instructions (voice reads on page load) */}
        <div className="w-full max-w-[900px] mx-auto mt-6 md:mt-8 p-4 md:p-5 bg-white/80 border border-[#777] rounded-[20px]">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-[#1F1F1F] font-bold text-sm uppercase tracking-wide">
              PD made simple
            </h4>
            <button
              type="button"
              onClick={() => {
                if (voiceMuted) {
                  setVoiceMuted(false);
                } else {
                  window.speechSynthesis.cancel();
                  setVoiceMuted(true);
                }
              }}
              className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              aria-label={voiceMuted ? "Play PD info" : "Mute PD info"}
              title={voiceMuted ? "Play again" : "Mute"}
            >
              {voiceMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
          <ul className="text-sm text-gray-700 space-y-2 list-none pl-0">
            <li className="flex gap-2">
              <span className="text-[#6B8E23] font-bold shrink-0">•</span>
              <span>Some prescriptions show Distance PD and Near PD — use Distance PD for progressives.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#6B8E23] font-bold shrink-0">•</span>
              <span> Single PD ranges from 45–72 mm. Dual PD measures 22–42 mm per eye.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#6B8E23] font-bold shrink-0">•</span>
              <span>If your prescription has only one PD value, enter single PD we will do the rest.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#6B8E23] font-bold shrink-0">•</span>
              <span>If your prescription does not have PD, no worries — our MFit measures both eyes precisely, tested on thousands.</span>
            </li>
          </ul>
        </div>

        {/* FOOTER NOTE */}
        <div className="mt-8 md:mt-12 pb-8 md:pb-0 text-center">
          <p className="text-[#1F1F1F] text-sm font-medium">
            Use your benefits—we accept HSA/FSA Payments.
          </p>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onNext={(email) => {
          setShowLoginModal(false);
          // Navigate to full login page with email
          navigate("/login", { state: { email } });
        }}
        onClose={() => setShowLoginModal(false)}
      />

      <PrescriptionHelpModal
        open={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        initialTab={helpModalTab}
      />

      <GetMyFitPopup
        open={isGetMyFitOpen}
        onClose={() => setIsGetMyFitOpen(false)}
        onPDCaptured={handlePDCaptured}
      />
    </div>
  );
};

export default SelectPrescriptionSource;