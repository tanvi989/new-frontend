import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GetMyFitPopupMobile from './GetMyFitPopupMobile';
import { useCaptureData } from '@/contexts/CaptureContext';
import { detectGlasses, removeGlasses, detectLandmarks } from '@/services/glassesApi';
import { cropToPassportStyle } from '@/utils/passportCrop';
import { MeasurementsTab } from '@/components/try-on/MeasurementsTab';
import { FramesTab } from '@/components/try-on/FramesTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ruler, Glasses, Loader2, RotateCcw, Volume2, X, Camera, Download, ExternalLink, ChevronLeft, Check } from 'lucide-react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';
import { FaceGuideOverlay } from '@/components/try-on/FaceGuideOverlay';
import { getCaptureSession, saveCaptureSession } from '@/utils/captureSession';
import { DEFAULT_ADJUSTMENTS_DESKTOP } from '@/utils/frameOverlayUtils';
import { toast } from 'sonner';

interface GetMyFitPopupProps {
  open: boolean;
  onClose: () => void;
  /** When provided, open directly at this step (e.g. '4' when restoring from session). */
  initialStep?: Step;
  /** When provided, auto-fill PD and close without showing result page (extra feature, doesn't affect normal VTO flow) */
  onPDCaptured?: (pdData: { pdSingle?: number; pdRight?: number; pdLeft?: number }) => void;
  /**
   * When true (product page only): after scanning, shows the Align UI briefly then
   * auto-closes (or closes immediately when user clicks Align). Image is already saved
   * to context/session. All other pages omit this prop and get the full step 4 flow.
   */
  skipStep4?: boolean;
}

type Step = '1' | '2' | '3' | '4';

const PROCESSING_MESSAGES = [
  "We're measuring your face...",
  "Working on your data...",
  "Analyzing your measurements...",
  "Getting your perfect fit...",
  "Almost there...",
];

const GetMyFitPopup: React.FC<GetMyFitPopupProps> = ({ open, onClose, initialStep, onPDCaptured, skipStep4 }) => {
  const { capturedData, setCapturedData } = useCaptureData();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>('1');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [processedImageData, setProcessedImageData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [glassesDetected, setGlassesDetected] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  /** After AI remove: show this photo and "Go ahead" before continuing to measurements */
  const [removedPreviewUrl, setRemovedPreviewUrl] = useState<string | null>(null);
  /** Step 4 tab: measurements | frames (Virtual Try-On) – controlled so MeasurementsTab can switch to frames */
  const [step4Tab, setStep4Tab] = useState<'measurements' | 'frames'>('measurements');
  /** Show "Click SNAP" hint only after 10 seconds on step 3 */
  const [showSnapHint, setShowSnapHint] = useState(false);
  /** Countdown display for product page auto-close */
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number>(4);

  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /** Helper: sync session → context then close */
  const doClose = useCallback(() => {
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    const session = getCaptureSession();
    if (session) setCapturedData(session);
    onClose();
  }, [onClose, setCapturedData]);

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

  // When entering step 4:
  // - Always start on measurements tab
  // - If product page flow (skipStep4), start 4-second auto-close countdown
  useEffect(() => {
    if (currentStep !== '4') return;
    setStep4Tab('measurements');

    if (!skipStep4) return;

    // Start countdown
    setAutoCloseCountdown(4);
    countdownIntervalRef.current = setInterval(() => {
      setAutoCloseCountdown(prev => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Auto-close after 4 seconds
    autoCloseTimerRef.current = setTimeout(() => {
      doClose();
    }, 4000);

    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [currentStep, skipStep4, doClose]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  /** Keep last valid landmarks so SNAP still works if the current frame momentarily has none */
  const lastLandmarksRef = useRef<any>(null);
  const [containerSize, setContainerSize] = useState({ width: 700, height: 480 });

  const { speakGuidance, speak, cancel: cancelVoice, currentMessage } = useVoiceGuidance({ enabled: true, debounceMs: 3000 });

  // Allow child components (e.g. MeasurementsTab) to request closing the popup
  useEffect(() => {
    const handler = () => onClose();
    window.addEventListener('getmyfit:close', handler as EventListener);
    return () => window.removeEventListener('getmyfit:close', handler as EventListener);
  }, [onClose]);

  // Step 3 full-screen: containerSize = viewport (same as perfect-fit-cam VTO)
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

  // Voice guidance for steps
  useEffect(() => {
    if (!open) return;
    if (currentStep === '1') {
      speak('Welcome to Multifolks Get My Fit. Let\'s get your perfect measurements. Please agree to the privacy policy to begin.');
    } else if (currentStep === '2') {
      speak('Great! Tuck your hair behind your ears and keep your glasses on if you wear them. Face the camera in good lighting.');
    } else if (currentStep === '3' && !capturedImageData && !isProcessing) {
      speak('Position your face in the oval. Align your eyes with the blue horizontal line. Keep your head straight and look at the camera. We will capture automatically when everything is aligned. If you are not able to get a photo, click the SNAP button to take your photo.');
    } else if (currentStep === '4') {
      if (skipStep4) {
        speak('Almost done! You can adjust alignment now, or we will close automatically in a few seconds.');
      } else {
        speak('Align your face how you would like to wear your frames. Then click View MFit Collection to browse glasses, or click View Measurement to see your measurements.');
      }
    }
  }, [open, currentStep, speak, skipStep4]);

  useEffect(() => {
    if (open && currentStep === '3' && !capturedImageData && !isProcessing && faceValidationState.faceDetected) {
      if (!allChecksPassed) {
        speakGuidance(faceValidationState.validationChecks);
      }
    }
  }, [open, currentStep, capturedImageData, isProcessing, faceValidationState.faceDetected, allChecksPassed, faceValidationState.validationChecks, speakGuidance]);

  // Reset state when modal opens/closes (or open at initialStep when restoring from session)
  useEffect(() => {
    if (open) {
      if (initialStep === '4') {
        const session = getCaptureSession();
        if (session) setCapturedData(session);
        setCurrentStep('4');
        setPrivacyAgreed(true);
      } else {
        setCurrentStep('1');
        setPrivacyAgreed(false);
        setCapturedImageData(null);
        setProcessedImageData(null);
        setGlassesDetected(false);
        setIsProcessing(false);
        setIsCapturing(false);
      }
    } else {
      stopCamera();
      cancelVoice();
      // Clean up any running auto-close timers when popup is closed externally
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }
  }, [open, initialStep ?? '1']);

  // Initialize camera when step 3 is active
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
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initializeCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Could not access camera. Please check permissions.');
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const captureAndProcess = useCallback(async () => {
    const video = videoRef.current;
    const landmarks = faceValidationState.landmarks ?? lastLandmarksRef.current;
    if (!video || !landmarks || isProcessing) return;

    setIsCapturing(false);
    setIsProcessing(true);
    setProcessingStep('Capturing image...');
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImageData(imageDataUrl);
      stopCamera();
      speak('Image captured');

      setProcessingStep('Detecting glasses...');
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
        } catch (err) {
          console.error('[GetMyFit] Removal error:', err);
          toast.error('Could not remove glasses. Using original image.');
          await performMeasurements(imageDataUrl, imageDataUrl, true, landmarks);
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      await performMeasurements(imageDataUrl, imageDataUrl, false, landmarks);
      
    } catch (err) {
      console.error('Processing error:', err);
      toast.error('Failed to process image. Please try again.');
      setIsCapturing(false);
      setIsProcessing(false);
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
        console.error('[GetMyFit] Landmarks API unexpected response:', JSON.stringify(measureResult, null, 2));
        throw new Error('Failed to get measurements');
      }

      const passport = await cropToPassportStyle(processedUrl, landmarks);
      const finalImage = passport?.croppedDataUrl ?? processedUrl;
      const cropRect = passport?.cropRect;
      const croppedPreviewDataUrl = passport?.croppedDataUrl ?? processedUrl;
      const faceShape = measureResult?.landmarks?.face_shape ?? measureResult?.face_shape ?? measureResult?.data?.face_shape ?? '';
      
      // Prescription pages only — auto-fill PD and close
      if (onPDCaptured && measurements) {
        const pdSingle = measurements.pd ? Number(measurements.pd.toFixed(2)) : undefined;
        const pdRight = measurements.pd_right ? Number(measurements.pd_right.toFixed(2)) : undefined;
        const pdLeft = measurements.pd_left ? Number(measurements.pd_left.toFixed(2)) : undefined;
        if (pdSingle != null || (pdRight != null && pdLeft != null)) {
          setIsProcessing(false);
          onPDCaptured({ pdSingle, pdRight, pdLeft });
          onClose();
          return;
        }
      }

      const capturedPayload = {
        imageDataUrl: originalUrl,
        processedImageDataUrl: finalImage,
        croppedPreviewDataUrl: croppedPreviewDataUrl,
        glassesDetected,
        landmarks,
        measurements,
        faceShape,
        apiResponse: measureResult,
        timestamp: Date.now(),
        frameAdjustments: { ...DEFAULT_ADJUSTMENTS_DESKTOP },
        ...(cropRect ? { cropRect } : {}),
      };
      setCapturedData(capturedPayload);
      saveCaptureSession(capturedPayload);

      setIsProcessing(false);

      // PRODUCT PAGE FLOW: show Align UI briefly, then auto-close via the useEffect timer above
      if (skipStep4) {
        setCurrentStep('4');
        return;
      }

      // DEFAULT FLOW: show full step 4
      setCurrentStep('4');
      speak('Success! Measurements complete. You can now try on different frames.');
    } catch (err) {
      console.error('Measurement error:', err);
      toast.error('Measurement failed. Please retake the photo.');
      setIsProcessing(false);
      retakePhoto();
    }
  };

  const handleKeepGlasses = async () => {
    const landmarks = faceValidationState.landmarks ?? lastLandmarksRef.current;
    if (!capturedImageData || !landmarks) return;
    setGlassesDetected(false);
    await performMeasurements(capturedImageData, capturedImageData, true, landmarks);
  };

  const handleRemoveGlasses = async () => {
    if (!capturedImageData || !faceValidationState.landmarks) return;
    setGlassesDetected(false);
    setRemovedPreviewUrl(null);
    setIsProcessing(true);
    setProcessingStep('Removing glasses...');
    try {
      const removeResult = await removeGlasses(capturedImageData);
      if (removeResult.success && removeResult.edited_image_base64) {
        const processedUrl = `data:image/png;base64,${removeResult.edited_image_base64}`;
        setProcessedImageData(processedUrl);
        setRemovedPreviewUrl(processedUrl);
      } else {
        throw new Error('Glasses removal failed');
      }
    } catch (err) {
      console.error('[GetMyFit] Removal error:', err);
      toast.error('Could not remove glasses. Using original image.');
      await performMeasurements(capturedImageData, capturedImageData, true, faceValidationState.landmarks);
    } finally {
      setIsProcessing(false);
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
    toast.success('Image saved successfully');
  };

  const retakePhoto = () => {
    setCapturedImageData(null);
    setProcessedImageData(null);
    setGlassesDetected(false);
    setIsProcessing(false);
    setIsCapturing(false);
    if (currentStep === '3') initializeCamera();
    else setCurrentStep('3');
  };

  // Auto-capture: no countdown – capture immediately when all checks pass
  useEffect(() => {
    if (allChecksPassed && !isCapturing && !capturedImageData && !isProcessing && faceValidationState.landmarks) {
      setIsCapturing(true);
      captureAndProcess();
    }
  }, [allChecksPassed, isCapturing, capturedImageData, isProcessing, faceValidationState.landmarks, captureAndProcess]);

  const handleStepClick = (step: Step) => {
    if (step === '3' && !privacyAgreed) return;
    if (step === '4' && !capturedImageData && !capturedData) return;
    if (currentStep === '4' && step === '3') {
      retakePhoto();
      return;
    }
    setCurrentStep(step);
  };

  const handleNext = () => {
    if (currentStep === '1' && !privacyAgreed) return;
    const stepNum = parseInt(currentStep);
    if (stepNum < 4) {
      setCurrentStep(String(stepNum + 1) as Step);
    }
  };

  const fadeInStyles = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fadeIn { animation: fadeIn 0.5s ease; }
    .face-guide-oval {
      border: 3px dashed hsl(199 89% 48% / 0.6);
      box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.4);
    }
    .face-guide-valid {
      border-color: #22c55e;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.3), 0 0 0 9999px rgba(15, 23, 42, 0.4);
    }
    .face-guide-invalid {
      border-color: #ef4444;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.3), 0 0 0 9999px rgba(15, 23, 42, 0.4);
    }
    .border-validation-pass { border-color: #22c55e !important; }
    .border-validation-fail { border-color: #ef4444 !important; }
    .bg-validation-pass\\/90 { background-color: rgba(34, 197, 94, 0.9) !important; }
    .bg-validation-fail\\/90 { background-color: rgba(239, 68, 68, 0.9) !important; }
    .bg-validation-pass\\/20 { background-color: rgba(34, 197, 94, 0.2) !important; }
    .bg-validation-pass { background-color: #22c55e !important; }
    .pulse-ring { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
  `;

  if (isMobile) {
    return <GetMyFitPopupMobile open={open} onClose={onClose} onPDCaptured={onPDCaptured} skipStep4={skipStep4} />;
  }

  if (!open) return null;

  if (currentStep === '3') {
    return (
      <>
        <div className="fixed inset-0 z-[1000] bg-black overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
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
                isMobile={false}
              />
            )}
          </div>

          {currentMessage && !capturedImageData && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full text-white flex items-center gap-3 z-20 pointer-events-none">
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold tracking-wide uppercase">{currentMessage}</span>
            </div>
          )}

          <button
            onClick={() => setCurrentStep('2')}
            className="absolute top-4 left-4 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-30 border border-white/20 pointer-events-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white z-30 pointer-events-auto"
          >
            <X className="w-5 h-5" />
          </button>

          {!capturedImageData ? (
            <>
              {showSnapHint && (
                <p className="absolute bottom-20 left-4 right-4 text-center text-white/90 text-sm font-medium z-30 pointer-events-none drop-shadow-md">
                  Can&apos;t get a clear alignment? Click <strong>SNAP</strong> to take your photo.
                </p>
              )}
              <button
                onClick={switchCamera}
                className="absolute bottom-4 left-4 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all z-30 border border-white/20"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              <button
                onClick={captureAndProcess}
                disabled={!faceValidationState.faceDetected || isProcessing}
                className="absolute bottom-4 right-4 bg-primary text-white px-8 py-3 rounded-full font-black tracking-widest shadow-2xl hover:scale-105 transition-all z-30 disabled:bg-gray-600 border border-white/20 flex items-center gap-2 italic"
              >
                <Camera className="w-5 h-5" /> SNAP
              </button>
            </>
          ) : (
            <div className="absolute inset-0 z-20">
              <img
                src={removedPreviewUrl || capturedImageData}
                alt={removedPreviewUrl ? 'Glasses removed' : 'Captured'}
                className="w-full h-full object-contain bg-black"
                key={removedPreviewUrl ? 'removed' : 'capture'}
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-40 text-white">
                  <Loader2 className="w-12 h-12 animate-spin mb-4 text-primary" />
                  <p className="text-xl font-bold tracking-widest uppercase italic">{processingStep}</p>
                </div>
              )}
              {capturedImageData && !isProcessing && !glassesDetected && !removedPreviewUrl && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40">
                  <button onClick={retakePhoto} className="bg-black text-white px-12 py-4 rounded-full font-black tracking-widest hover:bg-primary transition-all shadow-xl uppercase italic">
                    Retake Scan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <style dangerouslySetInnerHTML={{ __html: fadeInStyles }} />
      </>
    );
  }

  return (
    <>
      <div 
        className={`fixed inset-0 z-[1000] flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
          open ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          padding: '12vh 12vw',
          boxSizing: 'border-box'
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div 
          className={`bg-gray-100 w-full h-full rounded-[10px] overflow-hidden shadow-2xl relative transform transition-all duration-300 ${
            open ? 'scale-100' : 'scale-95'
          }`}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        >
          {currentMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-6 py-2 rounded-full text-white flex items-center gap-3 z-[1002] shadow-xl border border-white/10">
              <Volume2 className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-xs font-bold tracking-wide uppercase">{currentMessage}</span>
            </div>
          )}

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black rounded-full flex items-center justify-center cursor-pointer z-[1001] shadow-lg hover:bg-gray-100 transition-all hover:rotate-90 group"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex w-full h-full">
            {/* Left Section */}
            <div className="w-1/3 px-14 py-0" style={{ backgroundColor: '#f3F3F3' }}>
              {[
                { id: '1', label: 'SET UP', icon: '/icons/setup-img.png' },
                { id: '2', label: 'GET READY', icon: '/icons/get-ready-img.png' },
                { id: '3', label: 'SNAP', icon: '/icons/snap-img.png' },
                { id: '4', label: 'DONE!', icon: '/icons/done-img.png' }
              ].map((step) => (
                <div
                  key={step.id}
                  className={`h-1/4 flex items-center p-4 cursor-pointer transition-all ${
                    currentStep === step.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleStepClick(step.id as Step)}
                >
                  <div className={`w-20 h-20 rounded-lg flex items-center justify-center transition-all flex-shrink-0 overflow-hidden mr-4 ${
                    currentStep === step.id ? 'bg-blue-100' : 'bg-transparent'
                  }`}>
                    <img src={step.icon} alt={step.label} className="w-full h-full object-cover" />
                  </div>
                  <div className={`font-bold flex items-center justify-center gap-2 ${currentStep === step.id ? 'text-black' : 'text-gray-500'}`}>
                    <span>{step.label}</span>
                    {(() => {
                      const curr = parseInt(currentStep, 10);
                      const id = parseInt(step.id, 10);
                      const isCompleted = curr > id || (curr === 4 && id === 4);
                      return isCompleted ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-600 text-white">
                          <Check className="w-3.5 h-3.5" />
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>
              ))}
            </div>

            <div className="w-1 bg-white"></div>

            {/* Right Section */}
            <div className="w-2/3 bg-gray-100 flex flex-col justify-center items-center p-6 text-center relative overflow-hidden">
              
              {currentStep === '1' && (
                <div className="flex flex-col items-center animate-fadeIn max-w-[500px] w-full">
                  <h1 className="font-semibold text-[17px] leading-[100%] tracking-[0.2em] text-center uppercase mb-6 text-black">
                    WELCOME TO MULTIFOLKS MFit
                  </h1>
                  <div className="w-[180px] h-[180px] mb-6 flex items-center justify-center">
                    <svg width="260" height="260" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M39.542 213.417C35.4289 213.417 31.9632 212.007 29.1447 209.189C26.3262 206.369 24.917 202.903 24.917 198.792V83.4167C24.917 79.2639 26.3262 75.7882 29.1447 72.9896C31.9632 70.191 35.4289 68.7917 39.542 68.7917H72.5837L92.6253 46.5833H148.959V52.5417H95.3337L75.292 74.75H39.542C37.0142 74.75 34.9378 75.6076 33.3128 77.3229C31.6878 79.0382 30.8753 81.0694 30.8753 83.4167V198.792C30.8753 201.319 31.6878 203.396 33.3128 205.021C34.9378 206.646 37.0142 207.458 39.542 207.458H198.792C201.32 207.458 203.396 206.646 205.021 205.021C206.646 203.396 207.459 201.319 207.459 198.792V111.042H213.417V198.792C213.417 202.903 212.018 206.369 209.219 209.189C206.42 212.007 202.945 213.417 198.792 213.417H39.542ZM207.459 74.75V52.5417H185.25V46.5833H207.459V24.375H213.417V46.5833H235.625V52.5417H213.417V74.75H207.459ZM119.167 178.208C129.639 178.208 138.441 174.642 145.573 167.51C152.705 160.378 156.271 151.576 156.271 141.104C156.271 130.632 152.705 121.83 145.573 114.698C138.441 107.566 129.639 104 119.167 104C108.695 104 99.8927 107.566 92.7607 114.698C85.6288 121.83 82.0628 130.632 82.0628 141.104C82.0628 151.576 85.6288 160.378 92.7607 167.51C99.8927 174.642 108.695 178.208 119.167 178.208ZM119.167 172.25C110.32 172.25 102.917 169.271 96.9587 163.312C91.0003 157.354 88.0212 149.951 88.0212 141.104C88.0212 132.257 91.0003 124.854 96.9587 118.896C102.917 112.938 110.32 109.958 119.167 109.958C128.014 109.958 135.417 112.938 141.375 118.896C147.334 124.854 150.313 132.257 150.313 141.104C150.313 149.951 147.334 157.354 141.375 163.312C135.417 169.271 128.014 172.25 119.167 172.25Z" fill="#E94D37"/>
                    </svg>
                  </div>
                  <p className="text-base text-gray-600 mb-8 max-w-[400px] leading-relaxed">
                    One click. Perfect measurements. Better fitting frames. Let's take your picture.
                  </p>
                  <div className="flex items-start justify-center gap-2 mb-6 max-w-[400px] mx-auto">
                    <input type="checkbox" id="privacyPolicy" checked={privacyAgreed} onChange={(e) => setPrivacyAgreed(e.target.checked)} className="mt-0.5 w-[18px] h-[18px] cursor-pointer flex-shrink-0" />
                    <label htmlFor="privacyPolicy" className="text-sm text-gray-600 cursor-pointer leading-snug">Agree to <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">privacy policy</Link>, I consent to secure on device image capture and processing.</label>
                  </div>
                  <button onClick={handleNext} disabled={!privacyAgreed} className="bg-black text-white border-none px-10 py-3 text-base font-semibold rounded-[50px] cursor-pointer transition-all hover:bg-gray-800 disabled:bg-gray-400">READY</button>
                </div>
              )}

              {currentStep === '2' && (
                <div className="flex flex-col items-center animate-fadeIn max-w-[500px] w-full text-center">
                  <h2 className="text-3xl font-bold mb-12 text-black uppercase">Before We Begin</h2>
                  <div className="flex justify-center items-center gap-12 mb-12">
                    <div className="flex flex-col items-center">
                      <img src="/tuck-Hair.svg" alt="Hair" className="w-[140px] h-[140px]" />
                      <p className="text-base text-gray-600 mt-4 max-w-[140px]">Tuck your hair behind your ears</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src="/no-glass.svg" alt="Glasses" className="w-[140px] h-[140px]" />
                      <p className="text-base text-gray-600 mt-4 max-w-[140px]">Keep your glasses on</p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-600 font-semibold mb-8">
                    <i className="fas fa-check-circle mr-3"></i>
                    <span>Look straight ahead, eyes at camera and relax</span>
                  </div>
                  <button onClick={handleNext} className="bg-black text-white border-none px-10 py-3 text-base font-semibold rounded-[50px] cursor-pointer hover:bg-gray-800 transition-all uppercase">Start Camera</button>
                </div>
              )}

              {/* Step 4 Content */}
              {currentStep === '4' && (
                <div className="flex flex-col items-center animate-fadeIn w-full max-w-[850px] h-full overflow-y-auto pt-6 px-6">
                  <div className="flex items-center justify-center w-full mb-6">
                    <div className="flex flex-col items-center w-full">
                      <h2 className="text-4xl font-black tracking-[0.15em] text-black text-center">MFit</h2>

                      {/* Product page: countdown banner + manual close button */}
                      {skipStep4 && (
                        <div className="mt-3 mb-1 flex items-center gap-3 bg-[#D96C47]/10 border border-[#D96C47]/30 rounded-full px-5 py-2">
                          <span className="text-sm text-[#D96C47] font-semibold">
                            Returning to product page in <strong>{autoCloseCountdown}s</strong>
                          </span>
                          <button
                            onClick={doClose}
                            className="text-xs font-black bg-[#D96C47] text-white px-4 py-1 rounded-full hover:bg-[#c45e3a] transition-colors uppercase tracking-wider"
                          >
                            Done
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/*
                    PRODUCT PAGE FLOW (skipStep4=true):
                    Show MeasurementsTab (Align UI). Clicking Align saves adjustments.
                    Clicking the Align button OR the Done button OR waiting 4s closes popup.
                  */}
                  {skipStep4 ? (
                    <div
                      className="w-full bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
                      onClick={(e) => {
                        const target = e.target as HTMLElement;
                        const btn = target.closest('button');
                        // Close 300ms after any button click so the action (Align) saves first
                        if (btn) {
                          setTimeout(doClose, 300);
                        }
                      }}
                    >
                      <MeasurementsTab onViewMeasurements={() => {}} />
                    </div>
                  ) : (
                    /* DEFAULT FLOW: full tabs */
                    <Tabs value={step4Tab} onValueChange={(v) => setStep4Tab(v as 'measurements' | 'frames')} className="w-full">
                      <TabsList className="grid grid-cols-2 h-12 bg-gray-100 p-1 rounded-xl mb-6">
                        <TabsTrigger value="measurements" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest">
                          Perfect MFit
                        </TabsTrigger>
                        <TabsTrigger value="frames" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold uppercase text-[10px] tracking-widest">
                          Measurement
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="measurements" className="mt-0 focus-visible:outline-none bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <MeasurementsTab onViewMeasurements={() => setStep4Tab('frames')} />
                      </TabsContent>
                      <TabsContent value="frames" className="mt-0 focus-visible:outline-none bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <FramesTab measurementsOnly onBackToMeasurements={() => setStep4Tab('measurements')} useDesktopDefaults />
                      </TabsContent>
                    </Tabs>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: fadeInStyles }} />
    </>
  );
};

export default GetMyFitPopup;