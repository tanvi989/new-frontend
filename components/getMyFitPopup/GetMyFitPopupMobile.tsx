import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCaptureData } from '@/contexts/CaptureContext';
import { detectGlasses, removeGlasses, detectLandmarks } from '@/services/glassesApi';
import { cropToPassportStyle } from '@/utils/passportCrop';
import { MeasurementsTab } from '@/components/try-on/MeasurementsTab';
import { FramesTab } from '@/components/try-on/FramesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Loader2, RotateCcw, Volume2, X, Camera, Download, ExternalLink, ChevronLeft } from 'lucide-react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';
import { FaceGuideOverlay } from '@/components/try-on/FaceGuideOverlay';
import { saveCaptureSession } from '@/utils/captureSession';
import { DEFAULT_ADJUSTMENTS } from '@/utils/frameOverlayUtils';
import { toast } from 'sonner';
import type { FaceLandmarks } from '@/types/face-validation';

interface GetMyFitPopupMobileProps {
  open: boolean;
  onClose: () => void;
  /** When provided, auto-fill PD and navigate — same as desktop behaviour */
  onPDCaptured?: (pdData: { pdSingle?: number; pdRight?: number; pdLeft?: number }) => void;
}

type Step = '1' | '2' | '3' | '4';

const PROCESSING_MESSAGES = [
  "We're measuring your face...",
  "Working on your data...",
  "Analyzing your measurements...",
  "Getting your perfect fit...",
  "Almost there...",
];

/** Same PD calculation as perfect-fit-cam usePDMeasurement: face width calibration → mm */
const AVERAGE_FACE_WIDTH_MM = 140;
function computePDFromLandmarks(landmarks: { leftEye?: { x: number }; rightEye?: { x: number }; faceLeft?: { x: number }; faceRight?: { x: number } }): { pd: number; pd_left: number; pd_right: number } | null {
  if (landmarks?.leftEye?.x == null || landmarks?.rightEye?.x == null || landmarks?.faceLeft?.x == null || landmarks?.faceRight?.x == null) return null;
  const faceWidthNorm = Math.abs((landmarks.faceRight!.x ?? 0) - (landmarks.faceLeft!.x ?? 0));
  const pdNorm = Math.abs((landmarks.rightEye!.x ?? 0) - (landmarks.leftEye!.x ?? 0));
  if (faceWidthNorm <= 0) return null;
  const pdMm = Math.round((AVERAGE_FACE_WIDTH_MM * pdNorm) / faceWidthNorm);
  return { pd: pdMm, pd_left: Math.round(pdMm / 2), pd_right: Math.round(pdMm / 2) };
}

const GetMyFitPopupMobile: React.FC<GetMyFitPopupMobileProps> = ({ open, onClose, onPDCaptured }) => {
  const { setCapturedData } = useCaptureData();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('1');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [glassesDetected, setGlassesDetected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [removedPreviewUrl, setRemovedPreviewUrl] = useState<string | null>(null);
  const [showSnapHint, setShowSnapHint] = useState(false);
  const [step4Tab, setStep4Tab] = useState<'measurements' | 'frames'>('measurements');

  useEffect(() => {
    if (currentStep === '4') setStep4Tab('measurements');
  }, [currentStep]);

  useEffect(() => {
    if (currentStep !== '3' || capturedImageData) {
      setShowSnapHint(false);
      return;
    }
    const timer = setTimeout(() => setShowSnapHint(true), 10000);
    return () => {
      clearTimeout(timer);
      setShowSnapHint(false);
    };
  }, [currentStep, capturedImageData]);

  useEffect(() => {
    if (!isProcessing) return;
    setProcessingStep(PROCESSING_MESSAGES[0]);
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % PROCESSING_MESSAGES.length;
      setProcessingStep(PROCESSING_MESSAGES[index]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isProcessing]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const lastLandmarksRef = useRef<any>(null);
  const pendingCaptureRafRef = useRef<number | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 380, height: 420 });

  const { speakGuidance, speak, cancel: cancelVoice, currentMessage } = useVoiceGuidance({ enabled: true, debounceMs: 3000 });

  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('getmyfit:close', handler as EventListener);
    return () => window.removeEventListener('getmyfit:close', handler as EventListener);
  }, [onClose]);

  useEffect(() => {
    if (currentStep !== '3') return;
    const setSize = () => setContainerSize({ width: window.innerWidth, height: window.innerHeight });
    setSize();
    window.addEventListener('resize', setSize);
    return () => window.removeEventListener('resize', setSize);
  }, [currentStep]);

  const faceValidationState = useFaceDetection({
    videoRef,
    canvasRef,
    isActive: open && currentStep === '3' && !capturedImageData && !isProcessing,
  });

  if (faceValidationState.landmarks) lastLandmarksRef.current = faceValidationState.landmarks;
  const allChecksPassed = faceValidationState.allChecksPassed;

  useEffect(() => {
    if (!open) return;
    if (currentStep === '1') speak('Welcome to Multi Folks Fit. Let\'s get your perfect measurements. Please agree to the privacy policy to begin.');
    if (currentStep === '2') speak('Tuck your hair behind your ears and keep your glasses on. Face the camera in good lighting.');
    if (currentStep === '3' && !capturedImageData && !isProcessing) {
      speak('Position your face in the oval. Keep your head straight and look at the camera. We will capture automatically when everything is aligned. If you are not able to get a photo, click SNAP to take your photo.');
    }
  }, [open, currentStep, speak]);

  useEffect(() => {
    if (open && currentStep === '3' && !capturedImageData && !isProcessing && faceValidationState.faceDetected) {
      if (!allChecksPassed) speakGuidance(faceValidationState.validationChecks);
    }
  }, [open, currentStep, capturedImageData, isProcessing, faceValidationState.faceDetected, allChecksPassed, faceValidationState.validationChecks, speakGuidance]);

  useEffect(() => {
    if (open) {
      setCurrentStep('1');
      setPrivacyAgreed(false);
      setCapturedImageData(null);
      setProcessedImageData(null);
      setGlassesDetected(false);
      setIsProcessing(false);
      setIsCapturing(false);
    } else {
      stopCamera();
      cancelVoice();
    }
  }, [open]);

  useEffect(() => {
    if (open && currentStep === '3' && !capturedImageData) {
      initializeCamera();
    } else if (currentStep !== '3' || capturedImageData) {
      stopCamera();
    }
  }, [open, currentStep, capturedImageData, facingMode]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const initializeCamera = async () => {
    try {
      if (streamRef.current) stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error(error);
      toast.error('Could not access camera.');
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const captureAndProcess = useCallback(async (landmarksForCapture?: FaceLandmarks | null) => {
    const video = videoRef.current;
    const landmarks = landmarksForCapture ?? faceValidationState.landmarks ?? lastLandmarksRef.current;
    if (!video || !landmarks || isProcessing) return;

    if (video.videoWidth <= 0 || video.videoHeight <= 0) {
      toast.error('Camera not ready. Please wait a moment.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep('Capturing...');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No ctx');

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      // When onPDCaptured is provided, don't show the captured image — just close smoothly after processing
      if (!onPDCaptured) setCapturedImageData(imageDataUrl);
      stopCamera();

      speak('Image captured');

      const detectResult = await detectGlasses(imageDataUrl);
      if (detectResult.success && detectResult.glasses_detected) {
        speak('If you are wearing glasses, no worries - our AI tool will automatically remove it.');
        setProcessingStep('Removing glasses...');
        try {
          const removeResult = await removeGlasses(imageDataUrl);
          if (removeResult.success && removeResult.edited_image_base64) {
            const processedUrl = `data:image/png;base64,${removeResult.edited_image_base64}`;
            setProcessedImageData(processedUrl);
            await performMeasurements(imageDataUrl, processedUrl, false, landmarks);
          } else {
            throw new Error('Glasses removal failed');
          }
        } catch {
          await performMeasurements(imageDataUrl, imageDataUrl, true, landmarks);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      await performMeasurements(imageDataUrl, imageDataUrl, false, landmarks);
    } catch (err) {
      toast.error('Processing failed');
      retakePhoto();
    }
  }, [videoRef, faceValidationState.landmarks, facingMode, speak]);

  const performMeasurements = async (originalUrl: string, processedUrl: string, glassesDetected: boolean, landmarks: any) => {
    setIsProcessing(true);
    try {
      const measureResult = await detectLandmarks(processedUrl);

      const measurements =
        measureResult?.landmarks?.mm ??
        measureResult?.measurements ??
        measureResult?.data?.mm ??
        measureResult?.data?.measurements;

      if (!measureResult?.success || !measurements || typeof measurements !== 'object') {
        console.error('[GetMyFitMobile] Landmarks API unexpected response:', JSON.stringify(measureResult, null, 2));
        throw new Error('Fail');
      }

      const faceShape = measureResult?.landmarks?.face_shape ?? measureResult?.face_shape ?? measureResult?.data?.face_shape ?? '';

      const apiPd = measurements.pd != null && Number(measurements.pd) > 0 ? Number(Number(measurements.pd).toFixed(2)) : undefined;
      const apiPdLeft = measurements.pd_left != null && Number(measurements.pd_left) > 0 ? Number(Number(measurements.pd_left).toFixed(2)) : undefined;
      const apiPdRight = measurements.pd_right != null && Number(measurements.pd_right) > 0 ? Number(Number(measurements.pd_right).toFixed(2)) : undefined;
      const fallbackPd = computePDFromLandmarks(landmarks);
      const measurementsNormalized = {
        ...measurements,
        pd: apiPd ?? fallbackPd?.pd ?? 0,
        pd_left: apiPdLeft ?? fallbackPd?.pd_left ?? 0,
        pd_right: apiPdRight ?? fallbackPd?.pd_right ?? 0,
      };

      // ✅ KEY FIX: If onPDCaptured callback provided, call it and auto-navigate (same as desktop)
      if (onPDCaptured) {
        const pdSingle = measurementsNormalized.pd ? Number(Number(measurementsNormalized.pd).toFixed(2)) : undefined;
        const pdRight = measurementsNormalized.pd_right ? Number(Number(measurementsNormalized.pd_right).toFixed(2)) : undefined;
        const pdLeft = measurementsNormalized.pd_left ? Number(Number(measurementsNormalized.pd_left).toFixed(2)) : undefined;

        if (pdSingle != null || (pdRight != null && pdLeft != null)) {
          setIsProcessing(false);
          onPDCaptured({ pdSingle, pdRight, pdLeft });
          onClose(); // Close popup and let SelectPrescriptionSource auto-navigate
          return;
        }
      }

      const passport = await cropToPassportStyle(processedUrl, landmarks);
      const finalImage = passport?.croppedDataUrl ?? processedUrl;
      const cropRect = passport?.cropRect;
      // Use cropped image as preview for VTO thumbnail on product page
      const croppedPreviewDataUrl = passport?.croppedDataUrl ?? processedUrl;

      // Default frame adjustments so product page shows image immediately without needing "Align" step (mobile: scale 1.33)
      const mobileFrameAdjustments = { ...DEFAULT_ADJUSTMENTS, scaleAdjust: 1.33 };
      const capturedPayload = {
        imageDataUrl: originalUrl,
        processedImageDataUrl: finalImage,
        croppedPreviewDataUrl: croppedPreviewDataUrl,
        glassesDetected,
        landmarks,
        measurements: measurementsNormalized,
        faceShape,
        apiResponse: measureResult,
        timestamp: Date.now(),
        frameAdjustments: mobileFrameAdjustments,
        ...(cropRect ? { cropRect } : {}),
      };
      setCapturedData(capturedPayload);
      saveCaptureSession(capturedPayload);
      setIsProcessing(false);
      setCurrentStep('4');
      speak('Measurements complete.');
    } catch (err) {
      toast.error('Measurement failed');
      retakePhoto();
    }
  };

  const downloadResult = () => {
    if (!capturedImageData) return;
    const link = document.createElement('a');
    link.href = processedImageData || capturedImageData;
    link.download = `multifolks-fit-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image saved');
  };

  const retakePhoto = () => {
    setCapturedImageData(null);
    setProcessedImageData(null);
    setRemovedPreviewUrl(null);
    setGlassesDetected(false);
    setIsProcessing(false);
    setIsCapturing(false);
    if (currentStep === '3') initializeCamera();
    else setCurrentStep('3');
  };

  useEffect(() => {
    if (!allChecksPassed || isCapturing || capturedImageData || isProcessing || !faceValidationState.landmarks) {
      if (pendingCaptureRafRef.current != null) {
        cancelAnimationFrame(pendingCaptureRafRef.current);
        pendingCaptureRafRef.current = null;
      }
      return;
    }
    const raf = requestAnimationFrame(() => {
      pendingCaptureRafRef.current = null;
      if (!videoRef.current?.videoWidth || isCapturing || capturedImageData || isProcessing) return;
      const landmarks = lastLandmarksRef.current ?? faceValidationState.landmarks;
      if (!landmarks) return;
      setIsCapturing(true);
      captureAndProcess(landmarks);
    });
    pendingCaptureRafRef.current = raf;
    return () => {
      if (pendingCaptureRafRef.current != null) cancelAnimationFrame(pendingCaptureRafRef.current);
      pendingCaptureRafRef.current = null;
    };
  }, [allChecksPassed, isCapturing, capturedImageData, isProcessing, faceValidationState.landmarks, captureAndProcess]);

  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-black/70 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-[#F8F5EF] w-full max-w-md h-[90vh] mx-auto rounded-3xl overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMessage && (
          <div className="absolute top-2 left-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center gap-3 z-[100] shadow-xl">
            <Volume2 className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[8px] font-black uppercase tracking-widest">{currentMessage}</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center z-50 transition-transform active:scale-90"
        >
          <i className="fas fa-times text-white text-sm"></i>
        </button>

        {/* Step 1: Welcome */}
        {currentStep === '1' && (
          <div className="flex flex-col items-center justify-center h-full px-6 py-8 animate-fadeIn">
            <h1 className="text-xl font-bold text-center text-gray-900 mb-6 uppercase tracking-wide">WELCOME TO<br />MULTIFOLKS MFit</h1>
            <div className="mb-8">
              <svg width="180" height="180" viewBox="0 0 260 260" fill="none">
                <path d="M39.542 213.417C35.4289 213.417 31.9632 212.007 29.1447 209.189C26.3262 206.369 24.917 202.903 24.917 198.792V83.4167C24.917 79.2639 26.3262 75.7882 29.1447 72.9896C31.9632 70.191 35.4289 68.7917 39.542 68.7917H72.5837L92.6253 46.5833H148.959V52.5417H95.3337L75.292 74.75H39.542C37.0142 74.75 34.9378 75.6076 33.3128 77.3229C31.6878 79.0382 30.8753 81.0694 30.8753 83.4167V198.792C30.8753 201.319 31.6878 203.396 33.3128 205.021C34.9378 206.646 37.0142 207.458 39.542 207.458H198.792C201.32 207.458 203.396 206.646 205.021 205.021C206.646 203.396 207.459 201.319 207.459 198.792V111.042H213.417V198.792C213.417 202.903 212.018 206.369 209.219 209.189C206.42 212.007 202.945 213.417 198.792 213.417H39.542ZM207.459 74.75V52.5417H185.25V46.5833H207.459V24.375H213.417V46.5833H235.625V52.5417H213.417V74.75H207.459ZM119.167 178.208C129.639 178.208 138.441 174.642 145.573 167.51C152.705 160.378 156.271 151.576 156.271 141.104C156.271 130.632 152.705 121.83 145.573 114.698C138.441 107.566 129.639 104 119.167 104C108.695 104 99.8927 107.566 92.7607 114.698C85.6288 121.83 82.0628 130.632 82.0628 141.104C82.0628 151.576 85.6288 160.378 92.7607 167.51C99.8927 174.642 108.695 178.208 119.167 178.208ZM119.167 172.25C110.32 172.25 102.917 169.271 96.9587 163.312C91.0003 157.354 88.0212 149.951 88.0212 141.104C88.0212 132.257 91.0003 124.854 96.9587 118.896C102.917 112.938 110.32 109.958 119.167 109.958C128.014 109.958 135.417 112.938 141.375 118.896C147.334 124.854 150.313 132.257 150.313 141.104C150.313 149.951 147.334 157.354 141.375 163.312C135.417 169.271 128.014 172.25 119.167 172.25Z" fill="#E94D37"/>
              </svg>
            </div>
            <p className="text-gray-800 text-sm text-center mb-8 px-4 font-medium leading-relaxed">
              One click. Perfect measurements.<br />Better-fitting frames.<br />Let's take your picture.
            </p>
            <div className="flex items-start gap-3 mb-8 px-6">
              <input type="checkbox" id="privacyPolicyMobile" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="mt-1 w-5 h-5 rounded border-gray-400 shrink-0" />
              <label htmlFor="privacyPolicyMobile" className="text-sm text-gray-800 leading-relaxed">
                Agree to <Link to="/privacy" className="font-bold text-gray-900 underline">privacy policy</Link>, I consent to secure on device image capture and processing.
              </label>
            </div>
            <button onClick={() => setCurrentStep('2')} disabled={!privacyAgreed} className="bg-gray-800 text-white px-12 py-4 rounded-full font-bold disabled:bg-gray-400 transition-transform active:scale-95 shadow-xl">READY</button>
          </div>
        )}

        {/* Step 2: Before We Begin */}
        {currentStep === '2' && (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">BEFORE WE BEGIN</h2>
            <div className="flex justify-center items-center gap-8 mb-10">
              <div className="flex flex-col items-center">
                <img src="/tuck-Hair.svg" alt="Hair" className="w-[100px] h-[100px]" />
                <p className="text-xs text-gray-800 mt-3 text-center font-bold">Tuck hair behind ears</p>
              </div>
              <div className="flex flex-col items-center">
                <img src="/no-glass.svg" alt="Glasses" className="w-[100px] h-[100px]" />
                <p className="text-xs text-gray-800 mt-3 text-center font-bold">Keep glasses on</p>
              </div>
            </div>
            <div className="mb-10 text-center px-4">
              <p className="text-green-600 text-sm font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
                Look straight ahead, eyes at camera and relax
              </p>
            </div>
            <div className="text-lg font-black text-green-600 mb-8 italic uppercase tracking-widest">Perfect!</div>
            <button onClick={() => setCurrentStep('3')} className="bg-gray-800 text-white px-12 py-4 rounded-full font-bold transition-transform active:scale-95 shadow-xl">READY</button>
          </div>
        )}

        {/* Step 3: Full-screen capture */}
        {currentStep === '3' && (
          <div className="fixed inset-0 z-[1000] bg-black overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-contain bg-black"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 z-10 pointer-events-none">
              {!capturedImageData && (
                <FaceGuideOverlay
                  isValid={allChecksPassed}
                  faceDetected={faceValidationState.faceDetected}
                  validationChecks={faceValidationState.validationChecks}
                  landmarks={faceValidationState.landmarks}
                  containerSize={containerSize}
                  isMobile={true}
                  hideEyeLine
                  debugValues={{
                    faceWidthPercent: faceValidationState.faceWidthPercent,
                    leftEyeAR: faceValidationState.leftEyeAR,
                    rightEyeAR: faceValidationState.rightEyeAR,
                    headTilt: faceValidationState.headTilt,
                    headRotation: faceValidationState.headRotation,
                    brightness: faceValidationState.brightness,
                  }}
                />
              )}
            </div>

            {currentMessage && !capturedImageData && (
              <div className="absolute top-2 left-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full text-white flex items-center gap-3 z-20 pointer-events-none">
                <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-[8px] font-black uppercase tracking-widest">{currentMessage}</span>
              </div>
            )}

            <button
              onClick={() => setCurrentStep('2')}
              className="absolute top-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-30 border border-white/30"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-10 h-10 bg-black/60 rounded-full flex items-center justify-center text-white z-30"
            >
              <i className="fas fa-times text-white text-sm"></i>
            </button>

            {!capturedImageData && !isProcessing ? (
              <>
                {showSnapHint && (
                  <p className="absolute bottom-20 left-4 right-4 text-center text-white/90 text-xs font-medium z-30 pointer-events-none drop-shadow-md">
                    Can&apos;t get a clear alignment? Click <strong>SNAP</strong> to take your photo.
                  </p>
                )}
                <button onClick={switchCamera} className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-30 border border-white/30">
                  <RotateCcw className="w-6 h-6" />
                </button>
                <button
                  onClick={() => captureAndProcess(faceValidationState.landmarks ?? lastLandmarksRef.current)}
                  disabled={!faceValidationState.faceDetected || isProcessing || !(faceValidationState.landmarks || lastLandmarksRef.current)}
                  className="absolute bottom-4 right-4 bg-primary text-white px-6 py-3 rounded-full font-black text-[10px] tracking-widest shadow-2xl z-30 disabled:bg-gray-600 border border-white/20 uppercase italic"
                >
                  <Camera className="w-4 h-4 inline mr-1" /> Snap
                </button>
              </>
            ) : onPDCaptured && isProcessing && !capturedImageData ? (
              // PD-only mode: show clean fullscreen spinner, no captured image shown
              <div className="absolute inset-0 z-20 bg-black flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-14 h-14 text-white animate-spin" />
                <p className="text-white font-black uppercase tracking-widest text-[11px]">{processingStep}</p>
              </div>
            ) : (
              <div className="absolute inset-0 z-20">
                <img src={removedPreviewUrl || capturedImageData} alt={removedPreviewUrl ? 'Glasses removed' : 'Captured'} className="w-full h-full object-contain bg-black" />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-white font-black uppercase tracking-widest text-[10px]">{processingStep}</p>
                  </div>
                )}
                {capturedImageData && !isProcessing && !removedPreviewUrl && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                    <button onClick={retakePhoto} className="bg-white text-black border-2 border-black px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest">Retake Scan</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Results */}
        {currentStep === '4' && (
          <div className="flex flex-col items-center animate-fadeIn w-full h-full overflow-hidden px-4 py-6">
            <div className="flex items-center justify-center w-full mb-4">
              <h2 className="text-2xl font-black tracking-[0.15em] text-gray-900 text-center w-full">MFit</h2>
            </div>
            
            <Tabs value={step4Tab} onValueChange={(v) => setStep4Tab(v as 'measurements' | 'frames')} className="w-full flex-1 flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-2 h-10 bg-gray-200/50 p-1 rounded-xl mb-4">
                <TabsTrigger value="measurements" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[9px] uppercase tracking-widest">Perfect MFit</TabsTrigger>
                <TabsTrigger value="frames" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-[9px] uppercase tracking-widest">Try-On</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <TabsContent value="measurements" className="mt-0 focus-visible:outline-none"><MeasurementsTab onViewMeasurements={() => setStep4Tab('frames')} previewWidth={280} previewHeight={231} compactLayout /></TabsContent>
                <TabsContent value="frames" className="mt-0 focus-visible:outline-none"><FramesTab measurementsOnly onBackToMeasurements={() => setStep4Tab('measurements')} /></TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}} />
    </div>
  );
};

export default GetMyFitPopupMobile;