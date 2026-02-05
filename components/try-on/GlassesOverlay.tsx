import { useEffect, useState } from 'react';
import type { FaceLandmarks, GlassesFrame } from '@/types/face-validation';

/**
 * Glasses overlay – 100% same logic as perfect-fit-cam (C:\...\perfect-fit-cam-main).
 * Direct container coords, bridge or midpoint, face width / eye distance scaling.
 */
interface GlassesOverlayProps {
  landmarks: FaceLandmarks | null;
  selectedFrame: GlassesFrame | null;
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export function GlassesOverlay({
  landmarks,
  selectedFrame,
  videoWidth,
  videoHeight,
  containerWidth,
  containerHeight,
}: GlassesOverlayProps) {
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0, rotation: 0 });

  useEffect(() => {
    if (!landmarks || !selectedFrame) return;

    // Same as perfect-fit-cam: get eye positions in container coordinates (direct)
    const leftEyeX = landmarks.leftEye.x * containerWidth;
    const leftEyeY = landmarks.leftEye.y * containerHeight;
    const rightEyeX = landmarks.rightEye.x * containerWidth;
    const rightEyeY = landmarks.rightEye.y * containerHeight;

    // Same as perfect-fit-cam: use bridge if available, otherwise midpoint
    const bridge = (landmarks as FaceLandmarks & { bridge?: { x: number; y: number; z: number } }).bridge;
    const centerX = bridge
      ? bridge.x * containerWidth
      : (leftEyeX + rightEyeX) / 2;
    const centerY = bridge
      ? bridge.y * containerHeight
      : (leftEyeY + rightEyeY) / 2;

    // Same as perfect-fit-cam: calculate eye distance for scaling
    const eyeDistance = Math.sqrt(
      Math.pow(rightEyeX - leftEyeX, 2) + Math.pow(rightEyeY - leftEyeY, 2)
    );

    // Same as perfect-fit-cam: face width for scaling
    const faceWidth = landmarks.faceRight && landmarks.faceLeft
      ? Math.abs(landmarks.faceRight.x - landmarks.faceLeft.x) * containerWidth
      : eyeDistance * 2.5;

    // Same as perfect-fit-cam: mobile vs desktop glasses width
    const isMobile = typeof window !== 'undefined' && (window.matchMedia('(max-width: 767px)').matches || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    const glassesWidth = isMobile ? eyeDistance * 2.4 : Math.max(eyeDistance * 3.2, faceWidth * 1.1);

    // Same as perfect-fit-cam: rotation from eye positions
    const rotation = Math.atan2(rightEyeY - leftEyeY, rightEyeX - leftEyeX) * (180 / Math.PI);

    setPosition({
      x: centerX,
      y: centerY,
      width: glassesWidth,
      rotation,
    });
  }, [landmarks, selectedFrame, videoWidth, videoHeight, containerWidth, containerHeight]);

  if (!landmarks || !selectedFrame) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <img
        src={selectedFrame.imageUrl}
        alt={selectedFrame.name}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-75"
        style={{
          left: position.x,
          top: position.y,
          width: position.width,
          transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`,
        }}
      />
    </div>
  );
}
