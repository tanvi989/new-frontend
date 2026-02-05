import React, { useState, useEffect, useRef } from 'react';
import type { CapturedData, FaceLandmarks } from '@/types/face-validation';
import { parseDimensionsString } from '@/utils/frameDimensions';
import { getVtoImageUrl } from '@/api/retailerApis';

interface VtoProductOverlayProps {
  captureSession: CapturedData;
  productSkuid: string;
  productDimensions?: string;
  productName: string;
  /** When true, hide the small frame thumbnail (e.g. for product page preview box) */
  compact?: boolean;
}

/**
 * VTO Product Overlay - Renders captured face with frame overlay
 * Uses same logic as FramesTab: bridge position + 4mm down, face-width-based scale
 */
export function VtoProductOverlay({
  captureSession,
  productSkuid,
  productDimensions,
  productName,
  compact = false,
}: VtoProductOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  const vtoImageUrl = getVtoImageUrl(productSkuid);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleImageLoad = () => {
    if (imgRef.current) {
      setImageNaturalSize({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  };

  const getFrameTransform = () => {
    const { landmarks, measurements } = captureSession;

    if (!landmarks || !(landmarks as FaceLandmarks).leftEye || !(landmarks as FaceLandmarks).rightEye) {
      return { left: '50%', top: '45%', transform: 'translate(-50%, -50%) scale(0.38)' };
    }

    const lm = landmarks as FaceLandmarks;
    const origW = imageNaturalSize.width || 640;
    const origH = imageNaturalSize.height || 480;
    const contW = containerSize.width;
    const contH = containerSize.height;

    if (origW === 0 || origH === 0 || contW === 0 || contH === 0) {
      return { left: '50%', top: '45%', transform: 'translate(-50%, -50%) scale(0.38)' };
    }

    // Use object-contain mapping (show full image in box)
    const imgScale = Math.min(contW / origW, contH / origH);
    const drawnW = origW * imgScale;
    const drawnH = origH * imgScale;
    const offsetX = (contW - drawnW) / 2;
    const offsetY = (contH - drawnH) / 2;

    const toDisplay = (nx: number, ny: number) => ({
      x: nx * origW * imgScale + offsetX,
      y: ny * origH * imgScale + offsetY,
    });

    const leftEyeDisplay = toDisplay(lm.leftEye.x, lm.leftEye.y);
    const rightEyeDisplay = toDisplay(lm.rightEye.x, lm.rightEye.y);
    const bridge = (lm as FaceLandmarks & { bridge?: { x: number; y: number } }).bridge;
    const bridgeDisplay = bridge
      ? toDisplay(bridge.x, bridge.y)
      : toDisplay((lm.leftEye.x + lm.rightEye.x) / 2, (lm.leftEye.y + lm.rightEye.y) / 2);
    const faceLeftDisplay = lm.faceLeft
      ? toDisplay(lm.faceLeft.x, lm.faceLeft.y)
      : { x: leftEyeDisplay.x - 50, y: leftEyeDisplay.y };
    const faceRightDisplay = lm.faceRight
      ? toDisplay(lm.faceRight.x, lm.faceRight.y)
      : { x: rightEyeDisplay.x + 50, y: rightEyeDisplay.y };

    const faceWidthPx = Math.max(
      Math.abs(faceRightDisplay.x - faceLeftDisplay.x),
      Math.abs(rightEyeDisplay.x - leftEyeDisplay.x) * 2
    );
    const faceWidthMm = measurements?.face_width || 130;
    const mmPerPixel = faceWidthMm / faceWidthPx;

    const frameDims = parseDimensionsString(productDimensions);
    const desiredFrameWidthPx = frameDims.width / mmPerPixel;
    const FRAME_PNG_BASE_WIDTH = 340;
    const scaleFactor = desiredFrameWidthPx / FRAME_PNG_BASE_WIDTH;
    const clampedScale = Math.max(0.26, Math.min(0.62, scaleFactor * 1.0));

    const midX = bridgeDisplay.x;
    const midY = bridgeDisplay.y + (4 / mmPerPixel);

    return {
      left: `${midX}px`,
      top: `${midY}px`,
      transform: `translate(-50%, -50%) scale(${clampedScale})`,
    };
  };

  const frameStyle = getFrameTransform();

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <img
        ref={imgRef}
        src={captureSession.processedImageDataUrl}
        alt="Your fit"
        className="w-full h-full object-contain bg-gray-100"
        onLoad={handleImageLoad}
      />
      {!frameError && (
        <img
          src={vtoImageUrl}
          alt={productName}
          className="absolute pointer-events-none"
          style={{
            ...frameStyle,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
            opacity: frameLoaded ? 1 : 0,
            transition: 'opacity 0.2s ease-in-out',
          }}
          onLoad={() => setFrameLoaded(true)}
          onError={() => setFrameError(true)}
        />
      )}
      {!compact && (
        <div className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden z-10">
          <img
            src={vtoImageUrl}
            alt={productName}
            className="w-full h-full object-contain p-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
}

export default VtoProductOverlay;
