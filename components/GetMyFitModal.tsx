import React, { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export interface MeasurementData {
  totalPD: number;
  leftPD: number;
  rightPD: number;
  leftEyeWidth: number;
  rightEyeWidth: number;
  bridgeWidth: number;
  image?: string; // Added image field
}

interface GetMyFitModalProps {
  open: boolean;
  onClose: () => void;
  onComplete?: (data: MeasurementData) => void;
}

type Step = "intro" | "instruction" | "camera" | "result";
type DetectionState =
  | "initializing"
  | "too-far"
  | "tilted"
  | "centered"
  | "scanning";

// Mobile-specific version of the modal
const MobileGetMyFitModal: React.FC<{
  step: Step;
  agreed: boolean;
  detectionState: DetectionState;
  error: string;
  measurementViews: any[];
  resultView: number;
  onClose: () => void;
  onAgreeChange: (checked: boolean) => void;
  onStepChange: (step: Step) => void;
  onPrevView: () => void;
  onNextView: () => void;
  onSetResultView: (index: number) => void;
  getStatusIcon: () => React.ReactNode;
  getStatusMessage: () => string;
  getStatusColor: () => string;
  videoRef: React.RefObject<HTMLVideoElement>;
}> = ({
  step,
  agreed,
  detectionState,
  error,
  measurementViews,
  resultView,
  onClose,
  onAgreeChange,
  onStepChange,
  onPrevView,
  onNextView,
  onSetResultView,
  getStatusIcon,
  getStatusMessage,
  getStatusColor,
  videoRef,
}) => {
    return (
      <div className="fixed inset-0 z-[100] bg-white font-sans overflow-y-auto">
        {/* Mobile Header */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="flex items-center gap-2">
            {["intro", "instruction", "camera"].map((s, i) => (
              <div
                key={s}
                className={`w-2 h-2 rounded-full ${step === s ? "bg-black" : "bg-gray-300"}`}
              />
            ))}
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Mobile Content */}
        <div className="p-4">
          {/* Step 1: Intro */}
          {step === "intro" && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Find your perfect fit
                </h1>
                <p className="text-gray-600 mb-8">
                  We'll use your camera to measure your face for the best frame fit
                </p>

                <div className="w-48 h-48 mx-auto mb-8 relative">
                  <div className="absolute inset-0 bg-yellow-100 rounded-full flex items-center justify-center">
                    <img src="/perfecteye.svg" alt="Perfect Eye" className="w-24 h-24" />
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Quick & Easy</p>
                      <p className="text-sm text-gray-600">Takes less than 30 seconds</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Privacy Protected</p>
                      <p className="text-sm text-gray-600">We don't store your images</p>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="mobile-privacy"
                      checked={agreed}
                      onChange={(e) => onAgreeChange(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="mobile-privacy" className="text-sm text-gray-700">
                      I agree to the{" "}
                      <Link to="/privacy" target="_blank" className="text-blue-600 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => onStepChange("instruction")}
                  disabled={!agreed}
                  className="w-full bg-black text-white py-3.5 rounded-xl font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Instruction */}
          {step === "instruction" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Ready</h2>
                <p className="text-gray-600 mb-8">Follow these tips for accurate measurements</p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <img src="/tuck-Hair.svg" alt="Tuck Hair" className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">Tuck hair back</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <img src="/no-glass.svg" alt="No Glasses" className="w-10 h-10" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">Remove glasses</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v8M8 12h8"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">Face forward</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 text-center">Good lighting</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="bg-blue-50 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <div>
                      <p className="font-medium text-blue-800 mb-1">Camera Access</p>
                      <p className="text-sm text-blue-700">
                        We need camera permission to scan your face. No images are saved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onStepChange("intro")}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={() => onStepChange("camera")}
                  className="flex-1 bg-black text-white py-3 rounded-xl font-medium"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Camera */}
          {step === "camera" && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Face Scan</h2>
                <p className="text-gray-600">Position your face in the oval</p>
              </div>

              <div className="relative mb-6">
                <div className="aspect-square bg-black rounded-2xl overflow-hidden relative">
                  {error ? (
                    <div className="flex flex-col items-center justify-center h-full text-white p-4">
                      <p className="font-bold text-red-400 mb-2">Camera Error</p>
                      <p className="text-sm text-center">{error}</p>
                    </div>
                  ) : (
                    <>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover transform -scale-x-100"
                      />

                      {/* Face Detection Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`relative w-64 h-80 rounded-[45%] transition-all duration-500 border-[3px] ${getStatusColor()}`}
                        >
                          {detectionState === "scanning" && (
                            <div className="absolute inset-0">
                              <div className="w-full h-1 bg-green-400 absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                        <div
                          className={`px-6 py-2 rounded-full backdrop-blur-md border flex items-center gap-2 ${detectionState === "too-far"
                            ? "bg-yellow-500/90 border-yellow-300"
                            : detectionState === "tilted"
                              ? "bg-red-600/90 border-red-400"
                              : detectionState === "centered" || detectionState === "scanning"
                                ? "bg-green-500/90 border-green-400"
                                : "bg-black/60 border-white/20"
                            }`}
                        >
                          {getStatusIcon()}
                          <span className="text-xs font-bold uppercase text-white">
                            {getStatusMessage()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${detectionState === "initializing" ? "bg-gray-300" : "bg-green-500"}`} />
                    <span className="text-sm text-gray-600">Camera active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${detectionState === "centered" || detectionState === "scanning" ? "bg-green-500" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-600">Face detected</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${detectionState === "scanning" ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
                    <span className="text-sm text-gray-600">Scanning...</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => onStepChange("instruction")}
                  className="flex-1 py-3 border border-gray-300 rounded-xl font-medium text-gray-700"
                >
                  Back
                </button>
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 py-3 rounded-xl font-medium"
                >
                  Scanning...
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Results (Mobile) */}
          {step === "result" && measurementViews.length > 0 && (
            <div className="animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Measurements</h2>
                <p className="text-gray-600">Here are your personalized frame measurements</p>
              </div>

              <div className="mb-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-900">{measurementViews[resultView].title}</span>
                    <span className="text-lg font-bold text-gray-900">{measurementViews[resultView].value.toFixed(1)} mm</span>
                  </div>
                  <p className="text-sm text-gray-600">{measurementViews[resultView].text}</p>
                </div>

                {/* Visual Indicator */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simplified visualization for mobile */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {measurementViews[resultView].type === "totalPD" && (
                        <div className="flex items-center gap-6">
                          <EyeIcon className="w-16 text-blue-600" />
                          <EyeIcon className="w-16 text-blue-600" />
                        </div>
                      )}
                      {(measurementViews[resultView].type === "leftPD" || measurementViews[resultView].type === "rightPD") && (
                        <div className="flex items-center gap-6">
                          <EyeIcon className={`w-16 ${measurementViews[resultView].type === "leftPD" ? "text-blue-600" : "text-gray-300"}`} />
                          <EyeIcon className={`w-16 ${measurementViews[resultView].type === "rightPD" ? "text-blue-600" : "text-gray-300"}`} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Measurement Navigation */}
                <div className="flex justify-between items-center mb-6">
                  <button
                    onClick={onPrevView}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                  </button>
                  <div className="flex gap-2">
                    {measurementViews.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSetResultView(idx)}
                        className={`w-2 h-2 rounded-full ${resultView === idx ? "bg-black" : "bg-gray-300"}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={onNextView}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </button>
                </div>

                {/* Measurement List */}
                <div className="space-y-2">
                  {measurementViews.map((view, idx) => (
                    <div
                      key={idx}
                      onClick={() => onSetResultView(idx)}
                      className={`flex justify-between items-center p-3 rounded-lg ${resultView === idx ? "bg-blue-50 border border-blue-200" : "bg-gray-50 hover:bg-gray-100"}`}
                    >
                      <span className={`font-medium ${resultView === idx ? "text-blue-700" : "text-gray-700"}`}>
                        {view.title}
                      </span>
                      <span className={`font-bold ${resultView === idx ? "text-blue-700" : "text-gray-900"}`}>
                        {view.value.toFixed(1)} mm
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full bg-black text-white py-3.5 rounded-xl font-medium text-base">
                Save Measurements
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

export const GetMyFitModal: React.FC<GetMyFitModalProps> = ({
  open,
  onClose,
  onComplete,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState<Step>("intro");
  const [agreed, setAgreed] = useState(true);
  const [detectionState, setDetectionState] = useState<DetectionState>("initializing");
  const [resultView, setResultView] = useState(0);
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const generateMeasurements = () => {
    const totalPD = 60 + Math.floor(Math.random() * 10);
    const bridge = 14 + Math.floor(Math.random() * 4);
    const halfPD = totalPD / 2;

    return {
      totalPD: totalPD,
      leftPD: halfPD,
      rightPD: halfPD,
      leftEyeWidth: 28 + Math.floor(Math.random() * 4),
      rightEyeWidth: 28 + Math.floor(Math.random() * 4),
      bridgeWidth: bridge,
    };
  };

  const captureImage = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/png');
      }
    }
    return undefined;
  };

  const getViews = (data: MeasurementData) => [
    { title: "Total PD", value: data.totalPD, text: `Your recorded Total Pupillary Distance is ${data.totalPD} mm`, type: "totalPD" },
    { title: "Left Eye PD", value: data.leftPD, text: `Your recorded Left Eye PD is ${data.leftPD} mm`, type: "leftPD" },
    { title: "Right Eye PD", value: data.rightPD, text: `Your recorded Right Eye PD is ${data.rightPD} mm`, type: "rightPD" },
    { title: "Left Eye Width", value: data.leftEyeWidth, text: `Your recorded Left Eye Width is ${data.leftEyeWidth} mm`, type: "leftEyeWidth" },
    { title: "Right Eye Width", value: data.rightEyeWidth, text: `Your recorded Right Eye Width is ${data.rightEyeWidth} mm`, type: "rightEyeWidth" },
    { title: "Nose Bridge Width", value: data.bridgeWidth, text: `Your recorded Nose Bridge Width is ${data.bridgeWidth} mm`, type: "bridge" },
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setStep("intro");
      setAgreed(true);
      setError("");
      setDetectionState("initializing");
      setResultView(0);
      setMeasurements(null);
    }
  }, [open]);

  // Simulated Face Detection Logic Loop
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (open && step === "camera") {
      const runSimulation = () => {
        setDetectionState("initializing");

        timeoutId = setTimeout(() => {
          setDetectionState("too-far");

          timeoutId = setTimeout(() => {
            setDetectionState("tilted");

            timeoutId = setTimeout(() => {
              setDetectionState("centered");

              timeoutId = setTimeout(() => {
                handleStartScanning();
              }, 1500);
            }, 2500);
          }, 2500);
        }, 1500);
      };

      runSimulation();
    }

    return () => clearTimeout(timeoutId);
  }, [open, step]);

  // Camera Setup
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setError("");
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please ensure you have granted permission.");
      }
    };

    if (open && step === "camera") {
      startCamera();
    }

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [open, step]);

  const handleStartScanning = () => {
    setDetectionState("scanning");

    setTimeout(() => {
      const capturedImage = captureImage();
      const newMeasurements = {
        ...generateMeasurements(),
        image: capturedImage
      };

      setMeasurements(newMeasurements);

      if (onComplete) {
        onComplete(newMeasurements);
      }

      // Automatically show results for mobile, close for desktop
      if (isMobile) {
        setStep("result");
      } else {
        onClose();
      }
    }, 3000);
  };

  const measurementViews = measurements ? getViews(measurements) : [];

  const nextView = () => {
    setResultView((prev) => (prev + 1) % measurementViews.length);
  };

  const prevView = () => {
    setResultView((prev) => (prev - 1 + measurementViews.length) % measurementViews.length);
  };

  // --- UI Helpers for Detection State ---
  const getStatusColor = () => {
    switch (detectionState) {
      case "too-far":
        return "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]";
      case "tilted":
        return "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]";
      case "centered":
        return "border-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.4)]";
      case "scanning":
        return "border-[#4ADE80] shadow-[0_0_20px_rgba(74,222,128,0.6)]";
      default:
        return "border-white/50 border-dashed";
    }
  };

  const getStatusMessage = () => {
    switch (detectionState) {
      case "too-far":
        return "Move Closer";
      case "tilted":
        return "Straighten Head";
      case "centered":
        return "Hold Steady";
      case "scanning":
        return "Analyzing Face Map...";
      default:
        return "Locating Face...";
    }
  };

  const getStatusIcon = () => {
    switch (detectionState) {
      case "too-far":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce text-yellow-400">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        );
      case "tilted":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        );
      case "centered":
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#4ADE80]">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        );
      default:
        return null;
    }
  };

  if (!open) return null;

  // Render mobile version
  if (isMobile) {
    return (
      <MobileGetMyFitModal
        step={step}
        agreed={agreed}
        detectionState={detectionState}
        error={error}
        measurementViews={measurementViews}
        resultView={resultView}
        onClose={onClose}
        onAgreeChange={setAgreed}
        onStepChange={setStep}
        onPrevView={prevView}
        onNextView={nextView}
        onSetResultView={setResultView}
        getStatusIcon={getStatusIcon}
        getStatusMessage={getStatusMessage}
        getStatusColor={getStatusColor}
        videoRef={videoRef}
      />
    );
  }

  // Desktop version (your original code)
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 font-sans">
      <div className={`relative w-full ${step === "result" ? "max-w-[90%]" : "max-w-[100%]"} bg-[#F4F4F4] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 px-20 mx-40 transition-all`}>
        {/* Close Button */}
        <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-500 transition-colors z-50">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Stepper Header (Hide in Result) */}
        {step !== "result" && (
          <div className="pt-6 pb-1 px-8 bg-transparent">
            <div className="flex items-center justify-center w-full max-w-2xl mx-auto bg-gray-200/80 rounded-xl py-6 px-12 shadow-sm">
              {/* Step 1 Indicator */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === "intro" ? "bg-white shadow-md text-black scale-110" : "bg-gray-300 text-gray-500 border-none scale-100"}`}>
                  <img src="/sunglasses.png" alt="" className="w-6" />
                </div>
                <span className={`text-[14px] font-bold mt-2 tracking-wide ${step === "intro" ? "text-black" : "text-gray-400"}`}>
                  Perfect Style
                </span>
              </div>

              <div className={`flex-1 h-[1px] mx-2 -mt-6 ${step === "instruction" || step === "camera" ? "bg-black" : "bg-gray-300"}`}></div>

              {/* Step 2 Indicator */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === "instruction" ? "bg-white shadow-md text-black scale-110" : "bg-gray-300 text-gray-500 border-none scale-100"}`}>
                  <img src="/info.png" alt="" className="w-6" />
                </div>
                <span className={`text-[14px] font-bold mt-2 tracking-wide ${step === "instruction" ? "text-black" : "text-gray-400"}`}>
                  Instruction
                </span>
              </div>

              <div className={`flex-1 h-[1px] mx-2 -mt-6 ${step === "camera" ? "bg-black" : "bg-gray-300"}`}></div>

              {/* Step 3 Indicator */}
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${step === "camera" ? "bg-white shadow-md text-black scale-110" : "bg-gray-300 text-gray-500 border-none scale-100"}`}>
                  <img src="/camera.png" alt="" className="w-6" />
                </div>
                <span className={`text-[14px] font-bold mt-2 tracking-wide ${step === "camera" ? "text-black" : "text-gray-400"}`}>
                  Capture Screen
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className={`flex-1 bg-transparent flex flex-col items-center justify-center ${step === "result" ? "p-0" : "px-8 pt-2 pb-8"} min-h-[400px]`}>
          {/* Step 1: Intro */}
          {step === "intro" && (
            <div className="border border-gray-300 rounded-lg p-4 w-full max-w-4xl shadow-sm flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex flex-col items-center text-center w-full">
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-4">Find your perfect style</h2>
                <div className="mb-0 relative">
                  <img src="/perfecteye.svg" alt="Perfect Eye" className="w-[80px] h-[60px] object-contain pb-2 mb-2" />
                </div>
                <p className="text-gray-600 font-small mb-0">We just need to borrow your camera for a moment.</p>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#232320] focus:ring-[#232320] cursor-pointer accent-[#232320]"
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600 cursor-pointer">
                    I agree to the{" "}
                    <Link to="/privacy" target="_blank" className="text-[#1F1F1F] font-bold underline decoration-1 underline-offset-2">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <button
                  onClick={() => setStep("instruction")}
                  disabled={!agreed}
                  className="bg-[#232320] text-white px-12 py-3 rounded-none font-medium text-sm min-w-[160px] hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ready
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Instruction */}
          {step === "instruction" && (
            <div className="border border-gray-300 rounded-lg p-4 w-full max-w-4xl shadow-sm flex flex-col items-center animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="flex flex-col items-center text-center w-full">
                <h2 className="text-2xl font-bold text-[#1F1F1F] mb-10">Instruction</h2>
                <div className="flex flex-col md:flex-row gap-24 md:gap-48 mb-12 w-full justify-center">
                  <div className="flex flex-col items-center gap-4">
                    <img src="/tuck-Hair.svg" alt="Tuck Hair" className="w-[100px] h-[100px] object-contain" />
                    <span className="text-[#1F1F1F] font-medium text-sm">Tuck your hair</span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <img src="/correct-face.svg" alt="Correct Face" className="w-[100px] h-[100px] object-contain" />
                    <span className="text-[#1F1F1F] font-bold text-sm uppercase tracking-wider">CORRECT</span>
                  </div>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <img src="/no-glass.svg" alt="No Glasses" className="w-[100px] h-[100px] object-contain" />
                    </div>
                    <span className="text-[#1F1F1F] font-medium text-sm">No Glasses</span>
                  </div>
                </div>
                <button
                  onClick={() => setStep("camera")}
                  className="bg-[#232320] text-white px-12 py-3 rounded-none font-medium text-sm min-w-[160px] hover:bg-black transition-colors"
                >
                  Ready
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Camera & Face Detection UI */}
          {step === "camera" && (
            <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden relative shadow-lg mb-6">
                {error ? (
                  <div className="flex flex-col items-center justify-center h-full text-white p-4">
                    <p className="font-bold text-red-400 mb-2">Camera Access Denied</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100 opacity-80" />

                    {/* Face Detection Overlay Layer */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
                      <div className={`relative w-64 h-80 rounded-[45%] transition-all duration-500 border-[4px] overflow-hidden z-10 ${getStatusColor()} ${detectionState === "tilted" ? "rotate-6" : "rotate-0"}`}>
                        {detectionState === "scanning" && (
                          <div className="absolute inset-0">
                            <div className="w-full h-1 bg-[#4ADE80] shadow-[0_0_15px_#4ADE80] absolute top-0 animate-[scan_1.5s_ease-in-out_infinite]"></div>
                            <div className="w-full h-full bg-[linear-gradient(rgba(74,222,128,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(74,222,128,0.2)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30"></div>
                          </div>
                        )}

                        {(detectionState === "too-far" || detectionState === "tilted") && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20">
                            {getStatusIcon()}
                          </div>
                        )}
                      </div>

                      {(detectionState === "centered" || detectionState === "scanning") && (
                        <div className="absolute w-80 h-96 flex flex-col justify-between pointer-events-none z-20 animate-pulse">
                          <div className="flex justify-between">
                            <div className="w-8 h-8 border-t-4 border-l-4 border-[#4ADE80] rounded-tl-xl shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                            <div className="w-8 h-8 border-t-4 border-r-4 border-[#4ADE80] rounded-tr-xl shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                          </div>
                          <div className="flex justify-between">
                            <div className="w-8 h-8 border-b-4 border-l-4 border-[#4ADE80] rounded-bl-xl shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                            <div className="w-8 h-8 border-b-4 border-r-4 border-[#4ADE80] rounded-br-xl shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Instruction Label */}
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30">
                      <div className={`px-8 py-3 rounded-full backdrop-blur-md border flex items-center gap-3 transition-all shadow-xl ${detectionState === "too-far"
                        ? "bg-yellow-500/90 border-yellow-300 text-black"
                        : detectionState === "tilted"
                          ? "bg-red-600/90 border-red-400 text-white"
                          : detectionState === "centered" || detectionState === "scanning"
                            ? "bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80] animate-pulse"
                            : "bg-black/60 border-white/20 text-white"
                        }`}>
                        {getStatusIcon()}
                        <span className="text-sm font-bold uppercase tracking-widest">{getStatusMessage()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep("instruction")} className="px-6 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors">
                  Back
                </button>
                <button disabled className="bg-gray-300 text-gray-500 px-8 py-2 rounded text-sm font-medium cursor-not-allowed">
                  Auto-Capturing...
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Result */}
          {step === "result" && measurements && (
            <div className="flex flex-col items-center justify-center w-full h-full bg-white py-12 animate-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-serif font-medium text-[#1F1F1F] tracking-wide">Your</h2>
                <h2 className="text-3xl font-serif font-bold text-[#1F1F1F] tracking-[0.2em] uppercase">Measurements</h2>
              </div>

              <div className="flex flex-col md:flex-row w-full max-w-4xl px-8 gap-12 items-center">
                {/* Left Column: Table */}
                <div className="w-full md:w-1/2">
                  <div className="border-t border-gray-200">
                    {measurementViews.map((view, idx) => (
                      <div key={idx} onClick={() => setResultView(idx)} className={`flex justify-between items-center py-4 border-b border-gray-200 cursor-pointer transition-colors ${resultView === idx ? "bg-white pl-2 border-l-4 border-l-[#025048]" : "hover:bg-gray-50"}`}>
                        <span className={`text-sm ${resultView === idx ? "text-[#1F1F1F] font-bold" : "text-gray-600 font-medium"}`}>
                          {view.title}
                        </span>
                        <span className={`text-sm font-bold ${resultView === idx ? "text-[#1F1F1F]" : "text-gray-800"}`}>
                          {view.value.toFixed(1)} mm
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Visuals */}
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
                  <div className="w-full h-[300px] flex items-center justify-center relative mb-6 border border-gray-100 rounded-xl bg-[#FAFAFA] p-4">
                    <button onClick={prevView} className="absolute left-4 p-2 hover:bg-white bg-gray-100 rounded-full transition-colors shadow-sm z-10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    <button onClick={nextView} className="absolute right-4 p-2 hover:bg-white bg-gray-100 rounded-full transition-colors shadow-sm z-10">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>

                    {/* Dynamic SVG Visualization */}
                    <div className="relative flex flex-col items-center justify-center">
                      {measurementViews[resultView].type === "totalPD" && (
                        <div className="flex items-center gap-8 relative">
                          <EyeIcon className="w-24 text-[#025048]" />
                          <EyeIcon className="w-24 text-[#025048]" />
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] h-20 border-t-2 border-l-2 border-r-2 border-[#1F1F1F] rounded-t-lg -mt-10"></div>
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1F1F1F] text-white text-xs font-bold px-3 py-1.5 rounded shadow-md whitespace-nowrap">
                            {measurementViews[resultView].value.toFixed(1)} mm
                          </div>
                        </div>
                      )}
                      {(measurementViews[resultView].type === "leftPD" || measurementViews[resultView].type === "rightPD") && (
                        <div className="flex items-center gap-8 relative">
                          <EyeIcon className={`w-24 ${measurementViews[resultView].type === "leftPD" ? "opacity-100 text-[#025048]" : "opacity-20"}`} />
                          <div className="w-[2px] h-24 bg-dashed border-l-2 border-dashed border-gray-300 mx-2"></div>
                          <EyeIcon className={`w-24 ${measurementViews[resultView].type === "rightPD" ? "opacity-100 text-[#025048]" : "opacity-20"}`} />
                          <div className={`absolute top-8 ${measurementViews[resultView].type === "leftPD" ? "left-[22%]" : "right-[22%]"} flex flex-col items-center w-20`}>
                            <div className="w-full h-4 border-t-2 border-[#1F1F1F] relative">
                              <div className="absolute top-[-5px] left-0 w-[2px] h-3 bg-[#1F1F1F]"></div>
                              <div className="absolute top-[-5px] right-0 w-[2px] h-3 bg-[#1F1F1F]"></div>
                            </div>
                            <span className="bg-[#1F1F1F] text-white text-xs font-bold px-2 py-1 rounded -mt-8">
                              {measurementViews[resultView].value.toFixed(1)} mm
                            </span>
                          </div>
                        </div>
                      )}
                      {(measurementViews[resultView].type === "leftEyeWidth" || measurementViews[resultView].type === "rightEyeWidth") && (
                        <div className="flex items-center justify-center">
                          <div className="relative">
                            <EyeIcon className="w-40 text-[#025048]" />
                            <div className="absolute -top-6 left-0 w-full flex flex-col items-center">
                              <div className="bg-[#1F1F1F] text-white text-xs font-bold px-2 py-1 rounded mb-1 shadow-md">
                                {measurementViews[resultView].value.toFixed(1)} mm
                              </div>
                              <div className="w-full border-t-2 border-dashed border-[#1F1F1F] relative h-2">
                                <div className="absolute top-[-5px] left-0 w-[2px] h-3 bg-[#1F1F1F]"></div>
                                <div className="absolute top-[-5px] right-0 w-[2px] h-3 bg-[#1F1F1F]"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {measurementViews[resultView].type === "bridge" && (
                        <div className="flex items-center gap-1">
                          <EyeIcon className="w-28 opacity-30" />
                          <div className="relative w-16 flex flex-col items-center justify-center h-20">
                            <div className="bg-[#1F1F1F] text-white text-xs font-bold px-2 py-1 rounded mb-2 z-10 shadow-md">
                              {measurementViews[resultView].value.toFixed(1)} mm
                            </div>
                            <div className="w-full border-b-2 border-[#1F1F1F] absolute bottom-8"></div>
                            <div className="w-[2px] h-3 bg-[#1F1F1F] absolute bottom-6 left-0"></div>
                            <div className="w-[2px] h-3 bg-[#1F1F1F] absolute bottom-6 right-0"></div>
                          </div>
                          <EyeIcon className="w-28 opacity-30" />
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-medium text-[#555] text-center px-4 leading-relaxed">
                    {measurementViews[resultView].text}
                  </p>
                </div>
              </div>

              {onComplete && (
                <div className="mt-12">
                  <button onClick={() => onComplete(measurements!)} className="bg-[#025048] text-white px-12 py-3.5 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-[#013d37] transition-all shadow-lg hover:shadow-xl transform active:scale-95">
                    SAVE AND CONTINUE
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <style>{`
            @keyframes scan {
                0% { top: 0%; }
                50% { top: 100%; }
                100% { top: 0%; }
            }
        `}</style>
      </div>
    </div>
  );
};

const EyeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 60" fill="none" className={className}>
    <path d="M10 30 Q50 5 90 30 Q50 55 10 30 Z" stroke="currentColor" strokeWidth="3" fill="white" />
    <path d="M10 30 Q50 5 90 30 Q50 55 10 30 Z" stroke="currentColor" strokeWidth="3" fill="none" />
    <circle cx="50" cy="30" r="12" stroke="currentColor" strokeWidth="3" />
    <circle cx="50" cy="30" r="5" fill="currentColor" />
  </svg>
);