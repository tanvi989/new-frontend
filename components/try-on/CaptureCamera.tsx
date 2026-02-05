import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCamera } from '@/hooks/useCamera';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useCaptureData } from '@/contexts/CaptureContext';
import { useVoiceGuidance } from '@/hooks/useVoiceGuidance';
import { CameraPermission } from './CameraPermission';
import { FaceGuideOverlay } from './FaceGuideOverlay';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { detectGlasses, removeGlasses, detectLandmarks } from '@/services/glassesApi';
import { toast } from 'sonner';

export function CaptureCamera() {
  const navigate = useNavigate();
  const { cameraState, error, videoRef, streamRef, requestCamera } = useCamera();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoSize, setVideoSize] = useState({ width: 1280, height: 720 });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const { setCapturedData } = useCaptureData();
  const { speakGuidance, speak, cancel: cancelVoice } = useVoiceGuidance({ enabled: true, debounceMs: 3000 });

  const isMobile =
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 767px)').matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const faceValidationState = useFaceDetection({
    videoRef,
    canvasRef,
    isActive: cameraState === 'granted' && !isCapturing && !isProcessing,
  });

  // All checks passed - just face validation now
  const allChecksPassed = faceValidationState.allChecksPassed;

  // Voice guidance for face positioning
  useEffect(() => {
    if (cameraState === 'granted' && !isCapturing && !isProcessing && faceValidationState.faceDetected) {
      if (!allChecksPassed) {
        speakGuidance(faceValidationState.validationChecks);
      }
    }
  }, [
    cameraState,
    isCapturing,
    isProcessing,
    faceValidationState.faceDetected,
    allChecksPassed,
    faceValidationState.validationChecks,
    speakGuidance,
  ]);

  // Cancel voice when capturing starts
  useEffect(() => {
    if (isCapturing || isProcessing) {
      cancelVoice();
    }
  }, [isCapturing, isProcessing, cancelVoice]);

  // Attach stream to video element when both are available
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    
    if (video && stream && cameraState === 'granted') {
      video.srcObject = stream;
      video.play().catch(console.error);
    }
  }, [videoRef, streamRef, cameraState]);

  // Track video dimensions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoSize({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    if (video.videoWidth > 0) {
      setVideoSize({ width: video.videoWidth, height: video.videoHeight });
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [videoRef, cameraState]);

  // Capture and process image
  const captureAndProcess = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !faceValidationState.landmarks) return;

    setIsProcessing(true);
    
    try {
      // Capture image from video
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw mirrored image
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);

      speak('Image captured');

      // Step 1: Detect glasses
      setProcessingStep('Detecting glasses...');
      const detectResult = await detectGlasses(imageDataUrl);
      
      let processedImageDataUrl = imageDataUrl;
      let glassesDetected = false;

      // Step 2: Remove glasses if detected
      if (detectResult.success && detectResult.glasses_detected) {
        glassesDetected = true;
        setProcessingStep('Removing glasses...');
        const removeResult = await removeGlasses(imageDataUrl);
        if (removeResult.success && removeResult.edited_image_base64) {
          processedImageDataUrl = `data:image/png;base64,${removeResult.edited_image_base64}`;
        }
      }

      // Step 3: Get measurements from API
      setProcessingStep('Measuring face dimensions...');
      const measureResult = await detectLandmarks(processedImageDataUrl);

      if (!measureResult.success || !measureResult.landmarks?.mm) {
        throw new Error('Failed to get measurements');
      }

      // Save data and navigate - include full API landmarks response
      setCapturedData({
        imageDataUrl,
        processedImageDataUrl,
        glassesDetected,
        landmarks: faceValidationState.landmarks,
        measurements: measureResult.landmarks.mm,
        faceShape: measureResult.landmarks.face_shape,
        apiResponse: measureResult,
        timestamp: Date.now(),
      });

      navigate('/results');
    } catch (err) {
      console.error('Processing error:', err);
      toast.error('Failed to process image. Please try again.');
      setIsCapturing(false);
      setCountdown(null);
      setIsProcessing(false);
    }
  }, [videoRef, faceValidationState.landmarks, setCapturedData, navigate, speak]);

  // Auto-capture countdown when all checks pass
  useEffect(() => {
    if (allChecksPassed && !isCapturing && countdown === null) {
      setIsCapturing(true);
      setCountdown(3);
    } else if (!allChecksPassed && isCapturing) {
      // Reset if validation fails during countdown
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      setIsCapturing(false);
      setCountdown(null);
    }
  }, [allChecksPassed, isCapturing, countdown]);

  // Countdown timer
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      captureAndProcess();
    }

    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown, captureAndProcess]);

  const handleRequestCamera = useCallback(() => {
    requestCamera();
  }, [requestCamera]);

  if (cameraState !== 'granted') {
    return (
      <CameraPermission
        cameraState={cameraState}
        error={error}
        onRequestCamera={handleRequestCamera}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden" ref={containerRef}>
      {/* Fullscreen camera */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Face guide overlay – same as perfect-fit-cam: pupil reticles, lines, oval */}
      <div className={cn('absolute inset-0 z-10 pointer-events-none', isMobile && 'flex items-center justify-center')}>
        <FaceGuideOverlay
          isValid={allChecksPassed}
          faceDetected={faceValidationState.faceDetected}
          validationChecks={faceValidationState.validationChecks}
          landmarks={faceValidationState.landmarks}
          isMobile={isMobile}
          containerSize={containerRef.current ? { width: containerRef.current.clientWidth, height: containerRef.current.clientHeight } : undefined}
          debugValues={{
            faceWidthPercent: faceValidationState.faceWidthPercent,
            leftEyeAR: faceValidationState.leftEyeAR,
            rightEyeAR: faceValidationState.rightEyeAR,
            headTilt: faceValidationState.headTilt,
            headRotation: faceValidationState.headRotation,
            brightness: faceValidationState.brightness,
          }}
        />
      </div>

      {/* Countdown overlay */}
      {countdown !== null && countdown > 0 && !isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
          <div className="text-center">
            <div className="text-9xl font-bold text-white animate-pulse drop-shadow-lg">
              {countdown}
            </div>
            <p className="text-white/90 text-xl mt-4 font-medium">Hold still...</p>
          </div>
        </div>
      )}

      {/* Processing overlay */}
      {isProcessing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
          <div className="text-center space-y-6">
            <Loader2 className="h-20 w-20 text-white animate-spin mx-auto" />
            <p className="text-white text-xl font-medium">{processingStep}</p>
          </div>
        </div>
      )}
    </div>
  );
}