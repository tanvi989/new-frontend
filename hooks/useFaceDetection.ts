import { useEffect, useRef, useState, useCallback } from 'react';
import type { FaceLandmarks, FaceValidationState, ValidationCheck } from '@/types/face-validation';

/**
 * MediaPipe Face Mesh (best for glasses 👓)
 * Uses refineLandmarks: true so we get iris/pupil landmarks for accurate lens placement.
 * Indices 468 (left) and 473 (right) = iris center = pupil position for perfect-fit frame alignment.
 */
export const MEDIAPIPE_IRIS_INDICES = {
  leftIris: 468,  // Left iris/pupil center – use for lens alignment
  rightIris: 473, // Right iris/pupil center – use for lens alignment
} as const;

const LANDMARK_INDICES = {
  leftEye: MEDIAPIPE_IRIS_INDICES.leftIris,
  rightEye: MEDIAPIPE_IRIS_INDICES.rightIris,
  noseTip: 1,
  leftEar: 234,
  rightEar: 454,
  chin: 152,
  forehead: 10,
  leftEyeUpper: 159,
  leftEyeLower: 145,
  rightEyeUpper: 386,
  rightEyeLower: 374,
  faceLeft: 234,
  faceRight: 454,
};

// Target distance: ~43cm – same thresholds as perfect-fit-cam for consistent capture
const getThresholds = (isMobile: boolean) => {
  const distance = isMobile
    ? {
        targetFaceWidthPercent: 30,
        minFaceWidthPercent: 25,
        maxFaceWidthPercent: 45,
      }
    : {
        targetFaceWidthPercent: 21,
        minFaceWidthPercent: 18,
        maxFaceWidthPercent: 24,
      };

  return {
    maxHeadTilt: 10,
    maxHeadRotation: 15,
    ...distance,
    minBrightness: 80,
    maxBrightness: 220,
    minContrast: 0.3,
    eyeAspectRatioThreshold: 0.01,
    ovalCenterX: 0.5,
    ovalCenterY: 0.45,
    maxFaceOffsetX: 0.12,
    maxFaceOffsetY: 0.15,
  };
};


interface UseFaceDetectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isActive: boolean;
}

export function useFaceDetection({ videoRef, canvasRef, isActive }: UseFaceDetectionProps) {
  const isMobile =
    typeof window !== 'undefined' &&
    (window.matchMedia('(max-width: 767px)').matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

  const thresholdsRef = useRef(getThresholds(isMobile));
  const thresholds = thresholdsRef.current;

  // Same as perfect-fit-cam: robust eye centers on mobile when iris landmarks clump
  const MOBILE_LANDMARK_INDICES = {
    leftEyeOuter: 33,
    leftEyeInner: 133,
    rightEyeOuter: 362,
    rightEyeInner: 263,
  };
  const mobileEyeThreshold = 0.005;

  // Smooth the face width signal a bit to reduce jitter (especially on mobile)
  const smoothedFaceWidthPercentRef = useRef<number | null>(null);

  const [validationState, setValidationState] = useState<FaceValidationState>({
    faceDetected: false,
    faceCount: 0,
    headTilt: 0,
    headRotation: 0,
    faceWidthPercent: 0,
    brightness: 0,
    contrast: 0,
    leftEyeOpen: false,
    rightEyeOpen: false,
    leftEyeAR: 0,
    rightEyeAR: 0,
    pupilsDetected: false,
    landmarks: null,
    allChecksPassed: false,
    validationChecks: [],
  });

  const faceMeshRef = useRef<any>(null);
  const animationFrameRef = useRef<number>();
  const lastProcessTime = useRef<number>(0);

  const extractLandmarks = useCallback((landmarks: any[]): FaceLandmarks => {
    return {
      leftEye: landmarks[LANDMARK_INDICES.leftEye],
      rightEye: landmarks[LANDMARK_INDICES.rightEye],
      noseTip: landmarks[LANDMARK_INDICES.noseTip],
      leftEar: landmarks[LANDMARK_INDICES.leftEar],
      rightEar: landmarks[LANDMARK_INDICES.rightEar],
      chin: landmarks[LANDMARK_INDICES.chin],
      forehead: landmarks[LANDMARK_INDICES.forehead],
      leftEyeUpper: landmarks[LANDMARK_INDICES.leftEyeUpper],
      leftEyeLower: landmarks[LANDMARK_INDICES.leftEyeLower],
      rightEyeUpper: landmarks[LANDMARK_INDICES.rightEyeUpper],
      rightEyeLower: landmarks[LANDMARK_INDICES.rightEyeLower],
      faceLeft: landmarks[LANDMARK_INDICES.faceLeft],
      faceRight: landmarks[LANDMARK_INDICES.faceRight],
    };
  }, []);

  const calculateHeadTilt = useCallback((landmarks: FaceLandmarks): number => {
    const leftEye = landmarks.leftEye;
    const rightEye = landmarks.rightEye;
    const deltaY = rightEye.y - leftEye.y;
    const deltaX = rightEye.x - leftEye.x;
    return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  }, []);

  const calculateHeadRotation = useCallback((landmarks: FaceLandmarks): number => {
    const nose = landmarks.noseTip;
    const leftEar = landmarks.faceLeft;
    const rightEar = landmarks.faceRight;
    const faceCenter = (leftEar.x + rightEar.x) / 2;
    const offset = (nose.x - faceCenter) / (rightEar.x - leftEar.x);
    return offset * 60; // Approximate degrees
  }, []);

  const calculateFaceWidthPercent = useCallback((landmarks: FaceLandmarks, videoWidth: number): number => {
    const faceWidth = Math.abs(landmarks.faceRight.x - landmarks.faceLeft.x);
    return (faceWidth / 1) * 100; // landmarks are normalized 0-1
  }, []);

  const calculateEyeAspectRatio = useCallback((upper: { x: number; y: number }, lower: { x: number; y: number }): number => {
    return Math.abs(upper.y - lower.y);
  }, []);

  const analyzeImageQuality = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return { brightness: 128, contrast: 0.5 };

    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(video, 0, 0, 100, 100);

    const imageData = ctx.getImageData(0, 0, 100, 100);
    const data = imageData.data;

    let sum = 0;
    let min = 255;
    let max = 0;

    for (let i = 0; i < data.length; i += 4) {
      const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
      sum += gray;
      min = Math.min(min, gray);
      max = Math.max(max, gray);
    }

    const brightness = sum / (data.length / 4);
    const contrast = (max - min) / 255;

    return { brightness, contrast };
  }, []);

  /** Validate MediaPipe iris (468/473) pupil positions – only then can we apply lens/frame correctly */
  const arePupilsValid = useCallback((landmarks: FaceLandmarks): boolean => {
    const { leftEye, rightEye } = landmarks;
    const inRange = (v: number) => v >= 0.02 && v <= 0.98;
    if (!inRange(leftEye.x) || !inRange(leftEye.y) || !inRange(rightEye.x) || !inRange(rightEye.y)) return false;
    const dx = rightEye.x - leftEye.x;
    const dy = rightEye.y - leftEye.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist >= 0.06 && dist <= 0.6; // reasonable inter-pupil distance (normalized)
  }, []);

  // Calculate if face is within the oval guide
  const calculateFaceInOval = useCallback((landmarks: FaceLandmarks | null): { inOval: boolean; offsetX: number; offsetY: number } => {
    if (!landmarks) return { inOval: false, offsetX: 0, offsetY: 0 };

    // Calculate face center from landmarks
    const faceCenterX = (landmarks.faceLeft.x + landmarks.faceRight.x) / 2;
    const faceCenterY = (landmarks.forehead.y + landmarks.chin.y) / 2;

    // Calculate offset from oval center
    const offsetX = faceCenterX - thresholds.ovalCenterX;
    const offsetY = faceCenterY - thresholds.ovalCenterY;

    // Check if within acceptable range
    const inOval = Math.abs(offsetX) <= thresholds.maxFaceOffsetX &&
                   Math.abs(offsetY) <= thresholds.maxFaceOffsetY;

    return { inOval, offsetX, offsetY };
  }, [thresholds.maxFaceOffsetX, thresholds.maxFaceOffsetY, thresholds.ovalCenterX, thresholds.ovalCenterY]);

  const generateValidationChecks = useCallback((state: Omit<FaceValidationState, 'validationChecks' | 'allChecksPassed'> & { faceInOval?: boolean; faceOffsetX?: number; faceOffsetY?: number }): ValidationCheck[] => {
    const checks: ValidationCheck[] = [
      {
        id: 'face-detected',
        label: 'Face Detection',
        passed: state.faceDetected && state.faceCount === 1,
        message: !state.faceDetected
          ? 'No face detected'
          : state.faceCount > 1
            ? 'Multiple faces detected'
            : 'Face detected',
        severity: state.faceDetected && state.faceCount === 1 ? 'pass' : 'fail',
      },
      {
        id: 'face-in-oval',
        label: 'Face in Oval',
        passed: state.faceInOval === true,
        message: !state.faceDetected
          ? 'Position face in oval'
          : state.faceInOval
            ? 'Face centered'
            : (state.faceOffsetX || 0) > 0.05
              ? 'Move left'
              : (state.faceOffsetX || 0) < -0.05
                ? 'Move right'
                : (state.faceOffsetY || 0) > 0.05
                  ? 'Move up'
                  : 'Move down',
        severity: state.faceInOval ? 'pass' : 'fail',
      },
      {
        id: 'distance',
        label: 'Distance (~43cm)',
        passed: state.faceWidthPercent >= thresholds.minFaceWidthPercent &&
                state.faceWidthPercent <= thresholds.maxFaceWidthPercent,
        message: state.faceWidthPercent < thresholds.minFaceWidthPercent
          ? 'Move closer to camera'
          : state.faceWidthPercent > thresholds.maxFaceWidthPercent
            ? 'Move back from camera'
            : 'Perfect distance (~43cm)',
        severity: state.faceWidthPercent >= thresholds.minFaceWidthPercent &&
                  state.faceWidthPercent <= thresholds.maxFaceWidthPercent ? 'pass' : 'fail',
      },
      {
        id: 'head-straight',
        label: 'Head Position',
        passed: Math.abs(state.headTilt) <= thresholds.maxHeadTilt,
        message: Math.abs(state.headTilt) <= thresholds.maxHeadTilt
          ? 'Head is straight'
          : state.headTilt > 0
            ? 'Tilt head left'
            : 'Tilt head right',
        severity: Math.abs(state.headTilt) <= thresholds.maxHeadTilt ? 'pass' : 'fail',
      },
      {
        id: 'no-rotation',
        label: 'Face Forward',
        passed: Math.abs(state.headRotation) <= thresholds.maxHeadRotation,
        message: Math.abs(state.headRotation) <= thresholds.maxHeadRotation
          ? 'Facing forward'
          : state.headRotation > 0
            ? 'Turn head left'
            : 'Turn head right',
        severity: Math.abs(state.headRotation) <= thresholds.maxHeadRotation ? 'pass' : 'fail',
      },
      {
        id: 'lighting',
        label: 'Lighting',
        passed: state.brightness >= thresholds.minBrightness &&
                state.brightness <= thresholds.maxBrightness &&
                state.contrast >= thresholds.minContrast,
        message: state.brightness < thresholds.minBrightness
          ? 'Too dark - add light'
          : state.brightness > thresholds.maxBrightness
            ? 'Too bright'
            : state.contrast < thresholds.minContrast
              ? 'Reduce shadows'
              : 'Good lighting',
        severity: state.brightness >= thresholds.minBrightness &&
                  state.brightness <= thresholds.maxBrightness &&
                  state.contrast >= thresholds.minContrast ? 'pass' : 'fail',
      },
      {
        id: 'eyes-open',
        label: 'Eyes Visible',
        passed: state.leftEyeOpen && state.rightEyeOpen,
        message: state.leftEyeOpen && state.rightEyeOpen
          ? 'Eyes open'
          : 'Keep eyes open',
        severity: state.leftEyeOpen && state.rightEyeOpen ? 'pass' : 'fail',
      },
    ];

    return checks;
  }, [
    thresholds.maxBrightness,
    thresholds.maxFaceWidthPercent,
    thresholds.maxHeadRotation,
    thresholds.maxHeadTilt,
    thresholds.minBrightness,
    thresholds.minContrast,
    thresholds.minFaceWidthPercent,
  ]);

  const processResults = useCallback((results: any) => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const { brightness, contrast } = analyzeImageQuality(video, canvas);

    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      smoothedFaceWidthPercentRef.current = null;

      const newState = {
        faceDetected: false,
        faceCount: 0,
        headTilt: 0,
        headRotation: 0,
        faceWidthPercent: 0,
        brightness,
        contrast,
        leftEyeOpen: false,
        rightEyeOpen: false,
        leftEyeAR: 0,
        rightEyeAR: 0,
        landmarks: null,
      };

      const checks = generateValidationChecks(newState);
      setValidationState({
        ...newState,
        validationChecks: checks,
        allChecksPassed: false,
      });
      return;
    }

    const faceCount = results.multiFaceLandmarks.length;
    const landmarks = extractLandmarks(results.multiFaceLandmarks[0]);

    const headTilt = calculateHeadTilt(landmarks);
    const headRotation = calculateHeadRotation(landmarks);

    let rawFaceWidthPercent = calculateFaceWidthPercent(landmarks, video.videoWidth);
    rawFaceWidthPercent = Number.isFinite(rawFaceWidthPercent)
      ? Math.min(100, Math.max(0, rawFaceWidthPercent))
      : 0;

    const prev = smoothedFaceWidthPercentRef.current;
    const faceWidthPercent = prev == null
      ? rawFaceWidthPercent
      : prev * 0.8 + rawFaceWidthPercent * 0.2;
    smoothedFaceWidthPercentRef.current = faceWidthPercent;

    const leftEyeAR = calculateEyeAspectRatio(landmarks.leftEyeUpper, landmarks.leftEyeLower);
    const rightEyeAR = calculateEyeAspectRatio(landmarks.rightEyeUpper, landmarks.rightEyeLower);
    const eyeThreshold = isMobile ? mobileEyeThreshold : thresholds.eyeAspectRatioThreshold;
    const leftEyeOpen = leftEyeAR > eyeThreshold;
    const rightEyeOpen = rightEyeAR > eyeThreshold;

    // Check if face is in oval
    const { inOval, offsetX, offsetY } = calculateFaceInOval(landmarks);

    // Pupil detection (MediaPipe iris 468/473) – required for correct lens/frame placement
    const pupilsDetected = arePupilsValid(landmarks);

    const newState = {
      faceDetected: true,
      faceCount,
      headTilt,
      headRotation,
      faceWidthPercent,
      brightness,
      contrast,
      leftEyeOpen,
      rightEyeOpen,
      leftEyeAR,
      rightEyeAR,
      pupilsDetected,
      landmarks,
      faceInOval: inOval,
      faceOffsetX: offsetX,
      faceOffsetY: offsetY,
    };

    const checks = generateValidationChecks(newState);
    const allChecksPassed = checks.every(check => check.passed);

    setValidationState({
      ...newState,
      validationChecks: checks,
      allChecksPassed,
    });
  }, [
    videoRef,
    canvasRef,
    isMobile,
    analyzeImageQuality,
    extractLandmarks,
    calculateHeadTilt,
    calculateHeadRotation,
    calculateFaceWidthPercent,
    calculateEyeAspectRatio,
    generateValidationChecks,
    thresholds.eyeAspectRatioThreshold,
    calculateFaceInOval,
    arePupilsValid,
  ]);

  useEffect(() => {
    if (!isActive) return;

    let isMounted = true;
    let localFaceMesh: any = null;

    const loadFaceMesh = async () => {
      try {
        // Load FaceMesh from CDN script tag to avoid bundling issues
        const loadScript = (src: string): Promise<void> => {
          return new Promise((resolve, reject) => {
            // Check if already loaded
            if (document.querySelector(`script[src="${src}"]`)) {
              resolve();
              return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.crossOrigin = 'anonymous';
            script.onload = () => resolve();
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');

        if (!isMounted) return;

        // Access FaceMesh from window object
        const FaceMeshClass = (window as any).FaceMesh;

        if (!FaceMeshClass) {
          console.error('FaceMesh class not found on window');
          return;
        }

        localFaceMesh = new FaceMeshClass({
          locateFile: (file: string) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          },
        });

        // Same as perfect-fit-cam: maxNumFaces 1 for fast stable capture
        localFaceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        localFaceMesh.onResults(processResults);
        faceMeshRef.current = localFaceMesh;

        const processFrame = async () => {
          if (!isMounted || !videoRef.current || !faceMeshRef.current) return;

          const now = performance.now();
          if (now - lastProcessTime.current < 100) { // Limit to ~10 FPS for performance
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
          }
          lastProcessTime.current = now;

          if (videoRef.current.readyState >= 2) {
            try {
              await faceMeshRef.current.send({ image: videoRef.current });
            } catch {
              // Ignore errors if instance was closed
            }
          }

          if (isMounted) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
          }
        };

        processFrame();
      } catch (error) {
        console.error('Failed to load FaceMesh:', error);
      }
    };

    loadFaceMesh();

    return () => {
      isMounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }

      // Safely close FaceMesh instance
      if (localFaceMesh) {
        try {
          localFaceMesh.close();
        } catch {
          // Instance may already be deleted, ignore error
        }
        localFaceMesh = null;
      }
      faceMeshRef.current = null;
    };
  }, [isActive, videoRef, processResults]);

  return validationState;
}