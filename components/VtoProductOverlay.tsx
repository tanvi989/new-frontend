import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import type { CapturedData, FaceLandmarks } from '@/types/face-validation';
import { parseDimensionsString } from '@/utils/frameDimensions';
import { getVtoImageUrl } from '@/api/retailerApis';
import { computeFrameOverlayTransform } from '@/utils/frameOverlayTransform';
import { Share2, Download, Copy } from 'lucide-react';

/** Defaults matching FramesTab so /glasses matches VTO when no adjustments saved */
const DEFAULT_FRAME_ADJUSTMENTS = { offsetX: -14, offsetY: -23, scaleAdjust: 1.3, rotationAdjust: 0 };

/** Convert landmark 0-1 from full image to 0-1 in cropped image using cropRect */
function landmarkFullToCropped(
  nx: number,
  ny: number,
  r: { fullWidth: number; fullHeight: number; sx: number; sy: number; sw: number; sh: number }
): { x: number; y: number } {
  const nxc = (nx * r.fullWidth - r.sx) / r.sw;
  const nyc = (ny * r.fullHeight - r.sy) / r.sh;
  return { x: Math.max(0, Math.min(1, nxc)), y: Math.max(0, Math.min(1, nyc)) };
}

function landmarksToCropped(lm: FaceLandmarks, cropRect: NonNullable<CapturedData['cropRect']>): FaceLandmarks {
  const pt = (nx: number, ny: number) => landmarkFullToCropped(nx, ny, cropRect);
  const bridge = (lm as FaceLandmarks & { bridge?: { x: number; y: number; z: number } }).bridge;
  const withZ = (x: number, y: number, z: number) => ({ ...pt(x, y), z });
  return {
    leftEye: withZ(lm.leftEye.x, lm.leftEye.y, lm.leftEye.z),
    rightEye: withZ(lm.rightEye.x, lm.rightEye.y, lm.rightEye.z),
    noseTip: withZ(lm.noseTip.x, lm.noseTip.y, lm.noseTip.z),
    leftEar: withZ(lm.leftEar.x, lm.leftEar.y, lm.leftEar.z),
    rightEar: withZ(lm.rightEar.x, lm.rightEar.y, lm.rightEar.z),
    chin: withZ(lm.chin.x, lm.chin.y, lm.chin.z),
    forehead: withZ(lm.forehead.x, lm.forehead.y, lm.forehead.z),
    leftEyeUpper: withZ(lm.leftEyeUpper.x, lm.leftEyeUpper.y, lm.leftEyeUpper.z),
    leftEyeLower: withZ(lm.leftEyeLower.x, lm.leftEyeLower.y, lm.leftEyeLower.z),
    rightEyeUpper: withZ(lm.rightEyeUpper.x, lm.rightEyeUpper.y, lm.rightEyeUpper.z),
    rightEyeLower: withZ(lm.rightEyeLower.x, lm.rightEyeLower.y, lm.rightEyeLower.z),
    faceLeft: withZ(lm.faceLeft.x, lm.faceLeft.y, lm.faceLeft.z),
    faceRight: withZ(lm.faceRight.x, lm.faceRight.y, lm.faceRight.z),
    ...(bridge ? { bridge: { x: pt(bridge.x, bridge.y).x, y: pt(bridge.x, bridge.y).y, z: bridge.z } } : {}),
  } as FaceLandmarks;
}

interface VtoProductOverlayProps {
  captureSession: CapturedData;
  productSkuid: string;
  productDimensions?: string;
  productName: string;
  /** When true, hide the small frame thumbnail (e.g. for product page preview box) */
  compact?: boolean;
  /** Align face image left (e.g. on glasses-m) or center. Default center. */
  imagePosition?: 'left' | 'center';
}

/**
 * VTO Product Overlay - Uses cropped image on /glasses when saved from VTO; frame alignment from VTO is preserved.
 * Only the frame is swapped per product (each product's frame width/size); same position/rotation as you aligned in VTO.
 */
export function VtoProductOverlay({
  captureSession,
  productSkuid,
  productDimensions,
  productName,
  compact = false,
  imagePosition = 'center',
}: VtoProductOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [frameError, setFrameError] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [sharePopupOpen, setSharePopupOpen] = useState(false);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [sharePopupLoading, setSharePopupLoading] = useState(false);

  const vtoImageUrl = getVtoImageUrl(productSkuid);
  const savedAdj = captureSession.frameAdjustments ?? DEFAULT_FRAME_ADJUSTMENTS;
  const adj = { ...savedAdj };

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
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize((prev) => (rect.width !== prev.width || rect.height !== prev.height ? { width: rect.width, height: rect.height } : prev));
    }
  };

  const getFrameStyle = (): React.CSSProperties => {
    const { landmarks, measurements, cropRect } = captureSession;
    if (!landmarks || !(landmarks as FaceLandmarks).leftEye || !(landmarks as FaceLandmarks).rightEye) {
      return { left: '50%', top: '45%', transform: 'translate(-50%, -50%) scale(0.38)' };
    }
    const lm = landmarks as FaceLandmarks;
    // When we display the cropped image, landmarks must be in 0-1 of the cropped image
    const landmarksForImage = cropRect ? landmarksToCropped(lm, cropRect) : lm;
    const faceWidthMm = measurements?.face_width ?? 0;
    const naturalSize = { width: imageNaturalSize.width || 640, height: imageNaturalSize.height || 480 };
    if (containerSize.width === 0 || containerSize.height === 0 || faceWidthMm <= 0) {
      return { left: '50%', top: '45%', transform: 'translate(-50%, -50%) scale(0.38)' };
    }
    const dims = parseDimensionsString(productDimensions);
    const transform = computeFrameOverlayTransform(
      dims.width,
      dims.lensHeight,
      landmarksForImage,
      faceWidthMm,
      containerSize,
      naturalSize,
      true // object-contain so image fits without over-zoom; frame position matches
    );
    if (!transform) {
      return { left: '50%', top: '45%', transform: 'translate(-50%, -50%) scale(0.38)' };
    }
    let displayX = transform.midX + adj.offsetX;
    const displayY = transform.midY + adj.offsetY;
    // When face image is object-left (glasses-m), frame was computed for object-center; shift frame left by same offset
    if (imagePosition === 'left') {
      const scale = Math.min(containerSize.width / naturalSize.width, containerSize.height / naturalSize.height);
      const drawnWidth = naturalSize.width * scale;
      const centerOffsetX = (containerSize.width - drawnWidth) / 2;
      displayX -= centerOffsetX;
    }
    // Mobile only (container < 400px): fixed 133% scale to match Get My Fit popup and /glasses-m. Desktop unchanged.
    const isMobileContainer = containerSize.width > 0 && containerSize.width < 400;
    const scaleBoost = isMobileContainer ? 1.33 : 1;
    const finalScale = transform.scaleFactor * adj.scaleAdjust * scaleBoost;
    const finalRotation = transform.angleRad + (adj.rotationAdjust * Math.PI) / 180;
    return {
      position: 'absolute' as const,
      left: `${displayX}px`,
      top: `${displayY}px`,
      transform: `translate(-50%, -50%) rotate(${finalRotation}rad) scale(${finalScale})`,
      transformOrigin: 'center center',
    };
  };

  const frameStyle = getFrameStyle();

  /** Get numeric transform for canvas composite (displayX, displayY, scale, rotation) */
  const getFrameTransform = (): { displayX: number; displayY: number; scale: number; rotation: number } | null => {
    const { landmarks, measurements, cropRect } = captureSession;
    if (!landmarks || !(landmarks as FaceLandmarks).leftEye || !(landmarks as FaceLandmarks).rightEye) return null;
    const lm = landmarks as FaceLandmarks;
    const landmarksForImage = cropRect ? landmarksToCropped(lm, cropRect) : lm;
    const faceWidthMm = measurements?.face_width ?? 0;
    const naturalSize = { width: imageNaturalSize.width || 640, height: imageNaturalSize.height || 480 };
    if (containerSize.width === 0 || containerSize.height === 0 || faceWidthMm <= 0) return null;
    const dims = parseDimensionsString(productDimensions);
    const transform = computeFrameOverlayTransform(
      dims.width,
      dims.lensHeight,
      landmarksForImage,
      faceWidthMm,
      containerSize,
      naturalSize,
      true
    );
    if (!transform) return null;
    const displayX = transform.midX + adj.offsetX;
    const displayY = transform.midY + adj.offsetY;
    const scale = transform.scaleFactor * adj.scaleAdjust;
    const rotation = transform.angleRad + (adj.rotationAdjust * Math.PI) / 180;
    return { displayX, displayY, scale, rotation };
  };

  const filename = `vto-${productName.replace(/\s+/g, '-')}.png`;

  /** Compute frame transform using exact container and image dimensions (for capture; avoids stale state). */
  const getFrameTransformForCapture = (
    containerW: number,
    containerH: number,
    naturalW: number,
    naturalH: number
  ): { displayX: number; displayY: number; scale: number; rotation: number } | null => {
    const { landmarks, measurements, cropRect } = captureSession;
    if (!landmarks || !(landmarks as FaceLandmarks).leftEye || !(landmarks as FaceLandmarks).rightEye) return null;
    const lm = landmarks as FaceLandmarks;
    const landmarksForImage = cropRect ? landmarksToCropped(lm, cropRect) : lm;
    const faceWidthMm = measurements?.face_width ?? 0;
    if (containerW <= 0 || containerH <= 0 || faceWidthMm <= 0) return null;
    const dims = parseDimensionsString(productDimensions);
    const transform = computeFrameOverlayTransform(
      dims.width,
      dims.lensHeight,
      landmarksForImage,
      faceWidthMm,
      { width: containerW, height: containerH },
      { width: naturalW, height: naturalH },
      true
    );
    if (!transform) return null;
    return {
      displayX: transform.midX + adj.offsetX,
      displayY: transform.midY + adj.offsetY,
      scale: transform.scaleFactor * adj.scaleAdjust,
      rotation: transform.angleRad + (adj.rotationAdjust * Math.PI) / 180,
    };
  };

  const captureImage = async (): Promise<{ blob: Blob | null; frameDrawn: boolean }> => {
    const noFrame = { blob: null as Blob | null, frameDrawn: false };
    if (!containerRef.current) return noFrame;
    const rect = containerRef.current.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w <= 0 || h <= 0) return noFrame;

    const scale = 2;
    const cw = w * scale;
    const ch = h * scale;

    // Load face image
    const faceData = captureSession.processedImageDataUrl;
    if (!faceData) return noFrame;

    const faceImg = new Image();
    await new Promise<void>((resolve, reject) => {
      faceImg.onload = () => resolve();
      faceImg.onerror = () => reject(new Error('Face load failed'));
      faceImg.src = faceData;
      if (faceImg.complete) resolve();
    });

    const fw = faceImg.naturalWidth;
    const fh = faceImg.naturalHeight;

    // Create canvas and draw face (object-contain style) — same as on-screen
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');
    if (!ctx) return noFrame;

    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, cw, ch);

    const scaleFace = Math.min(cw / fw, ch / fh);
    const drawW = fw * scaleFace;
    const drawH = fh * scaleFace;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;
    ctx.drawImage(faceImg, 0, 0, fw, fh, offsetX, offsetY, drawW, drawH);

    // Transform for frame uses same container size as this canvas (w, h) and face natural size
    const transform = getFrameTransformForCapture(w, h, fw, fh);

    // Load frame: try same-origin (proxy) first, then direct backend URL if env set (e.g. local dev)
    let frameImg: HTMLImageElement | null = null;
    const tryLoadFrame = async (url: string): Promise<boolean> => {
      const res = await fetch(url);
      if (!res.ok) return false;
      const blob = await res.blob();
      if (blob.size === 0) return false;
      frameImg = new Image();
      await new Promise<void>((resolve, reject) => {
        frameImg!.onload = () => resolve();
        frameImg!.onerror = () => reject(new Error('Frame load failed'));
        frameImg!.src = URL.createObjectURL(blob);
        if (frameImg!.complete) resolve();
      });
      return frameImg!.complete && frameImg!.naturalWidth > 0;
    };
    try {
      const proxyUrl = `${window.location.origin}/api/v1/vto-frame/${productSkuid}`;
      let loaded = await tryLoadFrame(proxyUrl);
      if (!loaded) {
        if (frameImg?.src.startsWith('blob:')) URL.revokeObjectURL(frameImg.src);
        frameImg = null;
        const apiBase = (import.meta as { env?: { VITE_API_TARGET?: string } }).env?.VITE_API_TARGET?.trim();
        if (apiBase) {
          const base = apiBase.replace(/\/$/, '');
          loaded = await tryLoadFrame(`${base}/api/v1/vto-frame/${productSkuid}`);
        }
        if (!loaded) {
          // Fallback: same URL as display — {base}/{skuid}_VTO.png (skuid + VTO)
          const vtoImageUrl = getVtoImageUrl(productSkuid);
          loaded = await tryLoadFrame(vtoImageUrl);
        }
        if (!loaded) frameImg = null;
      }
    } catch {
      frameImg = null;
    }

    // Merge: draw VTO frame on top of face so share/download gets face + frame
    const FRAME_PNG_BASE_WIDTH = 400;
    const frameLoaded = frameImg && frameImg.complete && frameImg.naturalWidth > 0;
    if (frameLoaded && frameImg) {
      const fw2 = frameImg.naturalWidth;
      const fh2 = frameImg.naturalHeight;
      const frameScale = transform?.scale ?? 0.35;
      const displayX = transform?.displayX ?? w / 2;
      const displayY = transform?.displayY ?? h / 2;
      const rotation = transform?.rotation ?? 0;
      const displayW = FRAME_PNG_BASE_WIDTH * frameScale * scale;
      const displayH = displayW * (fh2 / fw2);
      const sx = displayX * scale;
      const sy = displayY * scale;
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(rotation);
      ctx.drawImage(frameImg, 0, 0, fw2, fh2, -displayW / 2, -displayH / 2, displayW, displayH);
      ctx.restore();
      if (frameImg.src.startsWith('blob:')) URL.revokeObjectURL(frameImg.src);
    }
    const frameDrawn = frameLoaded;

    return new Promise<{ blob: Blob | null; frameDrawn: boolean }>((resolve) =>
      canvas.toBlob((b) => resolve({ blob: b, frameDrawn }), 'image/png', 0.95)
    );
  };

  const handleShareButtonClick = async () => {
    setSharePopupLoading(true);
    setSharePopupOpen(false);
    const result = await captureImage();
    setSharePopupLoading(false);
    if (result.blob) {
      setCapturedBlob(result.blob);
      setSharePopupOpen(true);
      if (!result.frameDrawn) {
        toast.info('Image saved without frame. Ensure backend is running and frame is available.');
      }
    } else {
      toast.error('Could not capture image');
    }
  };

  const handleShare = async () => {
    if (!capturedBlob) return;
    const file = new File([capturedBlob], filename, { type: 'image/png' });
    try {
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `${productName} - Virtual Try-On`, files: [file] });
        toast.success('Shared!');
      } else {
        const url = URL.createObjectURL(capturedBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Shared via download');
      }
      setSharePopupOpen(false);
      setCapturedBlob(null);
    } catch (e) {
      toast.error('Share cancelled or failed');
    }
  };

  const handleSaveToGallery = () => {
    if (!capturedBlob) return;
    const url = URL.createObjectURL(capturedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Saved to gallery');
    setSharePopupOpen(false);
    setCapturedBlob(null);
  };

  const handleCopy = async () => {
    if (!capturedBlob) return;
    try {
      if (navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': capturedBlob })]);
        toast.success('Image copied! Paste in messages or documents.');
        setSharePopupOpen(false);
        setCapturedBlob(null);
      } else {
        toast.error('Copy not supported in this browser. Try Share or Save to gallery.');
      }
    } catch (e) {
      toast.error('Copy failed. Try Share or Save to gallery instead.');
    }
  };

  const closeSharePopup = () => {
    setSharePopupOpen(false);
    setCapturedBlob(null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-gray-100">
      <img
        ref={imgRef}
        src={captureSession.processedImageDataUrl}
        alt="Your fit"
        className={`w-full h-full object-contain ${imagePosition === 'left' ? 'object-left' : 'object-center'}`}
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
        <div
          className="absolute bottom-2 right-2 w-16 h-16 md:w-20 md:h-20 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden z-10 shrink-0"
          style={{ maxWidth: 'calc(100% - 1rem)', maxHeight: 'calc(100% - 1rem)' }}
        >
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
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); handleShareButtonClick(); }}
        disabled={sharePopupLoading}
        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-md border border-gray-200 z-10 flex items-center justify-center disabled:opacity-70"
        title="Share"
        aria-label="Share this look"
      >
        <Share2 className="w-4 h-4 text-gray-700" />
      </button>

      {/* Share popup - rendered via portal to avoid overflow clipping */}
      {sharePopupOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
            onClick={closeSharePopup}
            role="presentation"
          >
            <div
              className="bg-white rounded-xl shadow-xl p-5 flex flex-col gap-3 min-w-[240px] mx-4"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Share or save"
            >
              <p className="text-sm font-medium text-gray-800 text-center">Share or save your look</p>
              <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleSaveToGallery}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Save to gallery</span>
                </button>
              </div>
              <button
                type="button"
                onClick={closeSharePopup}
                className="text-sm text-gray-500 hover:text-gray-700 py-1"
              >
                Cancel
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}

export default VtoProductOverlay;
