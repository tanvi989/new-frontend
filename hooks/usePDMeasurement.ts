import { useMemo } from 'react';
import type { FaceLandmarks, PDMeasurement } from '@/types/face-validation';

// Average adult face width in mm (used for calibration)
const AVERAGE_FACE_WIDTH_MM = 140;

interface UsePDMeasurementProps {
  landmarks: FaceLandmarks | null;
  videoWidth: number;
  videoHeight: number;
}

export function usePDMeasurement({ landmarks, videoWidth, videoHeight }: UsePDMeasurementProps): PDMeasurement | null {
  return useMemo(() => {
    if (!landmarks || videoWidth === 0) return null;

    // Get pupil positions (normalized 0-1)
    const leftPupilX = landmarks.leftEye.x;
    const rightPupilX = landmarks.rightEye.x;
    
    // Calculate face width in normalized coordinates
    const faceWidthNormalized = Math.abs(landmarks.faceRight.x - landmarks.faceLeft.x);
    
    // Calculate PD in normalized coordinates
    const pdNormalized = Math.abs(rightPupilX - leftPupilX);
    
    // Convert to pixels
    const faceWidthPixels = faceWidthNormalized * videoWidth;
    const pdPixels = pdNormalized * videoWidth;
    
    // Calculate mm per pixel based on average face width
    const mmPerPixel = AVERAGE_FACE_WIDTH_MM / faceWidthPixels;
    
    // Calculate PD in millimeters
    const pdMillimeters = Math.round(pdPixels * mmPerPixel);

    return {
      leftPupilX: leftPupilX * videoWidth,
      rightPupilX: rightPupilX * videoWidth,
      pdPixels,
      pdMillimeters,
      faceWidthPixels,
    };
  }, [landmarks, videoWidth, videoHeight]);
}