import type { GlassesFrame, FaceLandmarks, FrameOffsets } from '@/types/face-validation';

export const DEFAULT_OFFSETS: FrameOffsets = {
  offsetX: -16,
  offsetY: 2,
  scaleAdjust: 1.21,
  rotationAdjust: 0,
};

export interface AdjustmentValues {
  offsetX: number;
  offsetY: number;
  scaleAdjust: number;
  rotationAdjust: number;
}

export const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  offsetX: -16,
  offsetY: 2,
  scaleAdjust: 1.21,
  rotationAdjust: 0,
};

export interface FrameTransformResult {
  midX: number;
  midY: number;
  scaleFactor: number;
  angleRad: number;
}

/**
 * Frame overlay calculation – positions frame on face using landmarks.
 */
export function computeFrameTransform(
  frame: GlassesFrame,
  landmarks: FaceLandmarks,
  faceWidthMm: number,
  containerSize: { width: number; height: number },
  naturalSize: { width: number; height: number }
): FrameTransformResult | null {
  if (naturalSize.width === 0 || naturalSize.height === 0) return null;
  if (containerSize.width === 0 || containerSize.height === 0) return null;
  if (faceWidthMm <= 0) return null;

  const scale = Math.max(
    containerSize.width / naturalSize.width,
    containerSize.height / naturalSize.height
  );
  const drawnWidth = naturalSize.width * scale;
  const drawnHeight = naturalSize.height * scale;
  const offsetX = (containerSize.width - drawnWidth) / 2;
  const offsetY = (containerSize.height - drawnHeight) / 2;

  const toDisplay = (p: { x: number; y: number }) => ({
    x: p.x * scale + offsetX,
    y: p.y * scale + offsetY,
  });

  const leftEyeNatural = {
    x: landmarks.leftEye.x * naturalSize.width,
    y: landmarks.leftEye.y * naturalSize.height,
  };
  const rightEyeNatural = {
    x: landmarks.rightEye.x * naturalSize.width,
    y: landmarks.rightEye.y * naturalSize.height,
  };
  const bridge = (landmarks as FaceLandmarks & { bridge?: { x: number; y: number; z: number } }).bridge;
  const bridgeNatural = bridge
    ? { x: bridge.x * naturalSize.width, y: bridge.y * naturalSize.height }
    : {
        x: ((landmarks.leftEye.x + landmarks.rightEye.x) / 2) * naturalSize.width,
        y: ((landmarks.leftEye.y + landmarks.rightEye.y) / 2) * naturalSize.height,
      };
  const faceLeftNatural = {
    x: landmarks.faceLeft.x * naturalSize.width,
    y: landmarks.faceLeft.y * naturalSize.height,
  };
  const faceRightNatural = {
    x: landmarks.faceRight.x * naturalSize.width,
    y: landmarks.faceRight.y * naturalSize.height,
  };

  const leftEyeDisplay = toDisplay(leftEyeNatural);
  const rightEyeDisplay = toDisplay(rightEyeNatural);
  const bridgeDisplay = toDisplay(bridgeNatural);
  const faceLeftDisplay = toDisplay(faceLeftNatural);
  const faceRightDisplay = toDisplay(faceRightNatural);
  const faceWidthPx = Math.abs(faceRightDisplay.x - faceLeftDisplay.x);

  const dx = rightEyeDisplay.x - leftEyeDisplay.x;
  const dy = rightEyeDisplay.y - leftEyeDisplay.y;
  let angleRad = Math.atan2(dy, dx);
  const angleDeg = Math.abs((angleRad * 180) / Math.PI);
  if (angleDeg < 3) angleRad = 0;

  const mmPerPixel = faceWidthMm / faceWidthPx;
  const desiredFrameWidthPx = frame.width / mmPerPixel;
  const FRAME_PNG_BASE_WIDTH = 400;
  const scaleFactor = desiredFrameWidthPx / FRAME_PNG_BASE_WIDTH;

  const midX = bridgeDisplay.x;
  const eyeLineY = (leftEyeDisplay.y + rightEyeDisplay.y) / 2;
  const midY = eyeLineY;

  return { midX, midY, scaleFactor, angleRad };
}
