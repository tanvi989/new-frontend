import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaptureData } from '@/contexts/CaptureContext';
import { GlassesSelector } from './GlassesSelector';
import { saveCaptureSession } from '@/utils/captureSession';
import { FrameAdjustmentControls } from './FrameAdjustmentControls';
import { Glasses, AlertCircle, CheckCircle, Info, Move, Crosshair } from 'lucide-react';
import type { GlassesFrame, FrameOffsets, FaceLandmarks } from '@/types/face-validation';
import { cn } from '@/lib/utils';
import { getFrames, getVtoImageUrl, getProductBySku } from '@/api/retailerApis';
import { parseDimensionsString } from '@/utils/frameDimensions';

// Static frame images (local) – original 3
const frame1Img = '/frames/frame1.png';
const frame2Img = '/frames/frame2.png';
const frame3Img = '/frames/frame3.png';

/** Original URL-based frame configs: skuid used to fetch dimensions; image = base/{skuid}_VTO.png */
const URL_FRAME_CONFIGS: { skuid: string; name: string }[] = [
  { skuid: 'E10A1012', name: 'E10A1012' },
  { skuid: 'E10A8615', name: 'E10A8615' },
  { skuid: 'E10A8617', name: 'E10A8617' },
];

/** Defaults for exact fit on face (Horizontal -14px, Vertical -23px, Size 130%) */
const DEFAULT_OFFSETS: FrameOffsets = { offsetX: -14, offsetY: -23, scaleAdjust: 1.3, rotationAdjust: 0 };

/** Filter range: show frames in [faceWidth, faceWidth + 15] */
const FACE_WIDTH_RANGE_MM = 15;

function shapeToCategory(shape: string | undefined): GlassesFrame['category'] {
  if (!shape) return 'vto';
  const s = shape.toLowerCase();
  if (s.includes('round')) return 'round';
  if (s.includes('square')) return 'square';
  if (s.includes('aviator')) return 'aviator';
  if (s.includes('cat') || s.includes('eye')) return 'cat-eye';
  if (s.includes('rectangular') || s.includes('rectangle')) return 'rectangular';
  return 'vto';
}

function productToGlassesFrame(p: any): GlassesFrame {
  const dims = parseDimensionsString(p.dimensions);
  const skuid = p.skuid ?? p.id ?? '';
  return {
    id: skuid,
    name: p.name ?? skuid,
    imageUrl: getVtoImageUrl(skuid),
    category: shapeToCategory(p.shape),
    color: p.frame_color ?? p.frameColor ?? '—',
    width: dims.width,
    lensWidth: dims.lensWidth,
    noseBridge: dims.noseBridge,
    templeLength: dims.templeLength,
    offsets: { ...DEFAULT_OFFSETS },
  };
}

// Original 3 static frames (local) – lensHeight for vertical alignment
const STATIC_FRAMES: GlassesFrame[] = [
  { id: '1', name: 'Pink Cat-Eye', imageUrl: frame1Img, category: 'cat-eye', color: 'Pink', width: 127, lensWidth: 50, lensHeight: 30, noseBridge: 15, templeLength: 135, offsets: { ...DEFAULT_OFFSETS } },
  { id: '2', name: 'Blue Round', imageUrl: frame2Img, category: 'round', color: 'Blue', width: 122, lensWidth: 44, lensHeight: 28, noseBridge: 18, templeLength: 125, offsets: { ...DEFAULT_OFFSETS } },
  { id: '3', name: 'Black Aviator', imageUrl: frame3Img, category: 'aviator', color: 'Black', width: 141, lensWidth: 55, lensHeight: 34, noseBridge: 18, templeLength: 142, offsets: { ...DEFAULT_OFFSETS } },
];

type FitCategory = 'tight' | 'perfect' | 'loose';

interface FrameTransform {
  midX: number;
  midY: number;
  scaleFactor: number;
  angleRad: number;
  fit: FitCategory;
  eyeDistancePx: number;
}

interface AdjustmentValues {
  offsetX: number;
  offsetY: number;
  scaleAdjust: number;
  rotationAdjust: number;
}

/** Defaults for exact fit on face (Horizontal -14px, Vertical -23px, Size 130%, Rotation 0°) */
const DEFAULT_ADJUSTMENTS: AdjustmentValues = {
  offsetX: -14,
  offsetY: -23,
  scaleAdjust: 1.3,
  rotationAdjust: 0,
};

/**
 * Frame overlay calculation – 100% same logic as perfect-fit-cam (frontend-only).
 */
function computeFrameTransform(
  frame: GlassesFrame,
  landmarks: FaceLandmarks,
  faceWidthMm: number,
  containerSize: { width: number; height: number },
  naturalSize: { width: number; height: number }
): FrameTransform | null {
  if (naturalSize.width === 0 || naturalSize.height === 0) return null;
  if (containerSize.width === 0 || containerSize.height === 0) return null;
  if (faceWidthMm <= 0) return null;

  // object-cover mapping (box-sized view: face centered, overflow hidden)
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

  // Same as perfect-fit-cam: MediaPipe landmarks (no Gemini in multifolks)
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

  // Same as perfect-fit-cam: angle (head roll) from eyes
  const dx = rightEyeDisplay.x - leftEyeDisplay.x;
  const dy = rightEyeDisplay.y - leftEyeDisplay.y;
  let angleRad = Math.atan2(dy, dx);
  const angleDeg = Math.abs((angleRad * 180) / Math.PI);
  if (angleDeg < 3) angleRad = 0;

  const eyeDistancePx = Math.sqrt(dx * dx + dy * dy);

  // Scale using frame width and face width (mm) so overlay matches real-world dimensions
  const mmPerPixel = faceWidthMm / faceWidthPx;
  const desiredFrameWidthPx = frame.width / mmPerPixel;
  const FRAME_PNG_BASE_WIDTH = 400;
  const scaleFactor = desiredFrameWidthPx / FRAME_PNG_BASE_WIDTH;

  // Position: horizontal = bridge; vertical = EYE LINE so frame aligns with eyes (same line user aligned to)
  const midX = bridgeDisplay.x;
  const eyeLineY = (leftEyeDisplay.y + rightEyeDisplay.y) / 2;
  const midY = eyeLineY;

  // Same as perfect-fit-cam: fit classification
  const diff = frame.width - faceWidthMm;
  let fit: FitCategory;
  if (diff <= -3) fit = 'tight';
  else if (diff >= 5) fit = 'loose';
  else fit = 'perfect';

  return {
    midX,
    midY,
    scaleFactor,
    angleRad,
    fit,
    eyeDistancePx,
  };
}

const FIT_CONFIG: Record<FitCategory, { label: string; color: string; message: string; icon: typeof CheckCircle }> = {
  tight: {
    label: 'Tight Fit',
    color: 'text-orange-500',
    message: 'This frame may feel narrow on your face.',
    icon: AlertCircle,
  },
  perfect: {
    label: 'Perfect Fit',
    color: 'text-green-500',
    message: 'This frame fits your face perfectly!',
    icon: CheckCircle,
  },
  loose: {
    label: 'Loose Fit',
    color: 'text-blue-500',
    message: 'This frame has a relaxed, looser fit.',
    icon: Info,
  },
};

// MediaPipe Face Mesh iris indices 468/473 (same as useFaceDetection) – best for glasses 👓 perfect fit
/** Displayed image rect for object-cover (box-sized view: face centered, overflow hidden) – landmark → container mapping */
function getDisplayedImageRectCover(
  containerW: number,
  containerH: number,
  naturalW: number,
  naturalH: number
): { offsetX: number; offsetY: number; width: number; height: number } {
  if (naturalW <= 0 || naturalH <= 0) return { offsetX: 0, offsetY: 0, width: containerW, height: containerH };
  const scale = Math.max(containerW / naturalW, containerH / naturalH);
  const drawnW = naturalW * scale;
  const drawnH = naturalH * scale;
  const offsetX = (containerW - drawnW) / 2;
  const offsetY = (containerH - drawnH) / 2;
  return { offsetX, offsetY, width: drawnW, height: drawnH };
}

/** Map MediaPipe normalized (0-1) landmark to container coords using displayed image rect */
function landmarkToContainer(
  nx: number,
  ny: number,
  rect: { offsetX: number; offsetY: number; width: number; height: number }
): { x: number; y: number } {
  return { x: rect.offsetX + nx * rect.width, y: rect.offsetY + ny * rect.height };
}

export interface FramesTabProps {
  /** When true (e.g. in MFit popup), show only measurements; hide try-on image, frame selector, Explore All Lenses. */
  measurementsOnly?: boolean;
  /** When set (e.g. in MFit popup), show Back button to switch to Measurements tab. */
  onBackToMeasurements?: () => void;
}

export function FramesTab({ measurementsOnly = false, onBackToMeasurements }: FramesTabProps) {
  const navigate = useNavigate();
  const { capturedData, setCapturedData } = useCaptureData();
  const [selectedFrame, setSelectedFrame] = useState<GlassesFrame | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [croppedObjectUrl, setCroppedObjectUrl] = useState<string | null>(null);
  const croppedObjectUrlRef = useRef<string | null>(null);
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(DEFAULT_ADJUSTMENTS);
  const [leftEyePos, setLeftEyePos] = useState({ x: 0, y: 0 });
  const [rightEyePos, setRightEyePos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState<'left' | 'right' | 'frame' | null>(null);
  const [filteredFramesFromDb, setFilteredFramesFromDb] = useState<GlassesFrame[]>([]);
  const [allFramesFromDb, setAllFramesFromDb] = useState<any[]>([]);
  const [originalSixFrames, setOriginalSixFrames] = useState<GlassesFrame[]>(STATIC_FRAMES);

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameDragStartRef = useRef<{ clientX: number; clientY: number; offsetX: number; offsetY: number } | null>(null);

  // Cleanup cropped blob URL on unmount / when regenerated
  useEffect(() => {
    return () => {
      if (croppedObjectUrlRef.current) {
        URL.revokeObjectURL(croppedObjectUrlRef.current);
        croppedObjectUrlRef.current = null;
      }
    };
  }, []);

  // Load all frames once (≈811) then filter by frame width range
  const faceWidthMm = capturedData?.measurements?.face_width ?? 0;
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        if (cancelled) return;
        const res = await getFrames(undefined, 1000);
        const list: any[] = res?.data?.data || res?.data?.products || [];
        setAllFramesFromDb(list);
      } catch {
        if (!cancelled) setAllFramesFromDb([]);
      }
    };
    run();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const width = faceWidthMm > 0 ? faceWidthMm : 130; // fallback 130mm if no measurement yet
    const minW = width;
    const maxW = width + FACE_WIDTH_RANGE_MM;

    const filtered = allFramesFromDb.filter((p: any) => {
      if (!p?.dimensions) return false;
      const w = parseDimensionsString(p.dimensions).width;
      return w >= minW && w <= maxW;
    });

    setFilteredFramesFromDb(filtered.map((p: any) => productToGlassesFrame(p)));
  }, [faceWidthMm, allFramesFromDb]);

  // Load original 6 frames: 3 static + 3 URL-based (fetch dimensions by skuid, image = base/{skuid}_VTO.png)
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const urlFrames: GlassesFrame[] = [];
      for (const config of URL_FRAME_CONFIGS) {
        try {
          const res = await getProductBySku(config.skuid);
          const product = res?.data?.data ?? res?.data;
          if (cancelled || !product) continue;
          urlFrames.push(productToGlassesFrame(product));
        } catch {
          const dims = parseDimensionsString(undefined);
          urlFrames.push({
            id: config.skuid,
            name: config.name,
            imageUrl: getVtoImageUrl(config.skuid),
            category: 'vto',
            color: '—',
            width: dims.width,
            lensWidth: dims.lensWidth,
            lensHeight: dims.lensHeight,
            noseBridge: dims.noseBridge,
            templeLength: dims.templeLength,
            offsets: { ...DEFAULT_OFFSETS },
          });
        }
      }
      if (!cancelled) setOriginalSixFrames([...STATIC_FRAMES, ...urlFrames]);
    };
    run();
    return () => { cancelled = true; };
  }, []);

  // Frames shown: filtered-by-range list (fallback to defaults if none match)
  const FRAMES = useMemo(
    () => (filteredFramesFromDb.length ? filteredFramesFromDb : originalSixFrames),
    [filteredFramesFromDb, originalSixFrames]
  );

  const displayRect = useMemo(
    () =>
      getDisplayedImageRectCover(
        containerSize.width,
        containerSize.height,
        imageNaturalSize.width,
        imageNaturalSize.height
      ),
    [containerSize.width, containerSize.height, imageNaturalSize.width, imageNaturalSize.height]
  );

  // Same eye detection logic as perfect-fit-cam: MediaPipe iris 468/473 → map to displayed image rect
  useEffect(() => {
    if (!capturedData?.landmarks || containerSize.width <= 0 || imageNaturalSize.width <= 0) return;
    const { landmarks } = capturedData;
    setLeftEyePos(landmarkToContainer(landmarks.leftEye.x, landmarks.leftEye.y, displayRect));
    setRightEyePos(landmarkToContainer(landmarks.rightEye.x, landmarks.rightEye.y, displayRect));
  }, [capturedData, containerSize, imageNaturalSize, displayRect]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setContainerSize({ width: img.clientWidth, height: img.clientHeight });
    setImageNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
  };

  /** Returns crop rect (full image coords) for the visible object-cover region. Used so /glasses can map landmarks to cropped image. */
  const getCropRect = useCallback((): { fullWidth: number; fullHeight: number; sx: number; sy: number; sw: number; sh: number } | null => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return null;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (naturalW <= 0 || naturalH <= 0 || containerW <= 0 || containerH <= 0) return null;
    const scale = Math.max(containerW / naturalW, containerH / naturalH);
    const offsetX = (containerW - naturalW * scale) / 2;
    const offsetY = (containerH - naturalH * scale) / 2;
    let sx = (-offsetX) / scale;
    let sy = (-offsetY) / scale;
    let sw = containerW / scale;
    let sh = containerH / scale;
    sx = Math.max(0, Math.min(sx, naturalW));
    sy = Math.max(0, Math.min(sy, naturalH));
    sw = Math.max(1, Math.min(sw, naturalW - sx));
    sh = Math.max(1, Math.min(sh, naturalH - sy));
    return { fullWidth: naturalW, fullHeight: naturalH, sx, sy, sw, sh };
  }, []);

  const getCroppedVisibleDataUrl = useCallback((): string | null => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return null;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (naturalW <= 0 || naturalH <= 0 || containerW <= 0 || containerH <= 0) return null;

    // Same math as object-cover: determine what portion of the source image is visible.
    const scale = Math.max(containerW / naturalW, containerH / naturalH);
    const drawnW = naturalW * scale;
    const drawnH = naturalH * scale;
    const offsetX = (containerW - drawnW) / 2;
    const offsetY = (containerH - drawnH) / 2;

    // Visible region in source coordinates
    let sx = (-offsetX) / scale;
    let sy = (-offsetY) / scale;
    let sw = containerW / scale;
    let sh = containerH / scale;

    // Clamp to source bounds
    sx = Math.max(0, Math.min(sx, naturalW));
    sy = Math.max(0, Math.min(sy, naturalH));
    sw = Math.max(1, Math.min(sw, naturalW - sx));
    sh = Math.max(1, Math.min(sh, naturalH - sy));

    const canvas = document.createElement('canvas');
    const maxOut = 1200;
    const outScale = Math.min(1, maxOut / Math.max(sw, sh));
    canvas.width = Math.round(sw * outScale);
    canvas.height = Math.round(sh * outScale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // Persistable (sessionStorage-friendly) image string
    return canvas.toDataURL('image/jpeg', 0.85);
  }, []);

  const openCroppedImageInNewTab = useCallback(async () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const containerW = container.clientWidth;
    const containerH = container.clientHeight;
    if (naturalW <= 0 || naturalH <= 0 || containerW <= 0 || containerH <= 0) return;

    // Same math as object-cover: determine what portion of the source image is visible.
    const scale = Math.max(containerW / naturalW, containerH / naturalH);
    const drawnW = naturalW * scale;
    const drawnH = naturalH * scale;
    const offsetX = (containerW - drawnW) / 2;
    const offsetY = (containerH - drawnH) / 2;

    // Visible region in source coordinates
    let sx = (-offsetX) / scale;
    let sy = (-offsetY) / scale;
    let sw = containerW / scale;
    let sh = containerH / scale;

    // Clamp to source bounds
    sx = Math.max(0, Math.min(sx, naturalW));
    sy = Math.max(0, Math.min(sy, naturalH));
    sw = Math.max(1, Math.min(sw, naturalW - sx));
    sh = Math.max(1, Math.min(sh, naturalH - sy));

    const canvas = document.createElement('canvas');

    // Output at (roughly) the visible source resolution, capped for size
    const maxOut = 1800;
    const outScale = Math.min(1, maxOut / Math.max(sw, sh));
    canvas.width = Math.round(sw * outScale);
    canvas.height = Math.round(sh * outScale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });
    if (!blob) return;

    // Revoke previous URL
    if (croppedObjectUrlRef.current) {
      URL.revokeObjectURL(croppedObjectUrlRef.current);
      croppedObjectUrlRef.current = null;
    }

    const url = URL.createObjectURL(blob);
    croppedObjectUrlRef.current = url;
    setCroppedObjectUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleFrameSelect = async (frame: GlassesFrame | null) => {
    if (!capturedData) {
      setSelectedFrame(frame);
      if (frame?.offsets) setAdjustments(frame.offsets);
      else setAdjustments(DEFAULT_ADJUSTMENTS);
      return;
    }
    // Get My Fit only uses images without glasses; no need to remove glasses again on result page
    setSelectedFrame(frame);
    if (frame?.offsets) {
      setAdjustments(frame.offsets);
    } else {
      setAdjustments(DEFAULT_ADJUSTMENTS);
    }
  };

  const handleResetAdjustments = () => {
    setAdjustments(selectedFrame?.offsets || DEFAULT_ADJUSTMENTS);
  };

  // Drag logic - Mouse and Touch (eye markers)
  const startDrag = (eye: 'left' | 'right') => (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(eye);
  };

  // Drag logic - Frame (glasses) move by mouse/touch
  const startFrameDrag = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    frameDragStartRef.current = { clientX, clientY, offsetX: adjustments.offsetX, offsetY: adjustments.offsetY };
    setDragging('frame');
  }, [adjustments.offsetX, adjustments.offsetY]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging || !containerRef.current) return;

    if (dragging === 'frame') {
      const start = frameDragStartRef.current;
      if (!start) return;
      setAdjustments((prev) => ({
        ...prev,
        offsetX: start.offsetX + (clientX - start.clientX),
        offsetY: start.offsetY + (clientY - start.clientY),
      }));
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));

    if (dragging === 'left') {
      setLeftEyePos({ x, y });
    } else {
      setRightEyePos({ x, y });
    }
  }, [dragging]);

  const endDrag = useCallback(() => {
    if (dragging === 'left' || dragging === 'right') {
      if (capturedData) {
        const eyeDistancePx = Math.sqrt(
          Math.pow(rightEyePos.x - leftEyePos.x, 2) +
          Math.pow(rightEyePos.y - leftEyePos.y, 2)
        );
        
        const initialEyeDistPx = Math.sqrt(
          Math.pow((capturedData.landmarks.rightEye.x - capturedData.landmarks.leftEye.x) * containerSize.width, 2) +
          Math.pow((capturedData.landmarks.rightEye.y - capturedData.landmarks.leftEye.y) * containerSize.height, 2)
        );
        
        const safeInitialDist = initialEyeDistPx || 1;
        const mmPerPx = capturedData.measurements.pd / safeInitialDist;
        const newPD = eyeDistancePx * mmPerPx;

        setCapturedData({
          ...capturedData,
          measurements: {
            ...capturedData.measurements,
            pd: newPD,
            pd_left: newPD / 2,
            pd_right: newPD / 2
          }
        });
      }
    }
    if (dragging === 'frame') {
      frameDragStartRef.current = null;
    }
    setDragging(null);
  }, [dragging, leftEyePos, rightEyePos, capturedData, containerSize, setCapturedData]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', endDrag);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', endDrag);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', endDrag);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', endDrag);
    };
  }, [dragging, handleMove, endDrag]);

  const transform = useMemo(() => {
    if (!selectedFrame || !containerSize.width || !capturedData?.landmarks || !imageRef.current) return null;

    const { landmarks, measurements } = capturedData;
    const img = imageRef.current;
    const naturalSize = { width: img.naturalWidth || imageNaturalSize.width || 1, height: img.naturalHeight || imageNaturalSize.height || 1 };

    return computeFrameTransform(
      selectedFrame,
      landmarks,
      measurements?.face_width ?? 0,
      containerSize,
      naturalSize
    );
  }, [selectedFrame, containerSize, capturedData?.landmarks, capturedData?.measurements?.face_width, imageNaturalSize.width, imageNaturalSize.height]);

  if (!capturedData) return null;

  const getGlassesStyle = (): React.CSSProperties => {
    if (!transform || containerSize.width === 0) return { display: 'none' };

    const displayX = transform.midX + adjustments.offsetX;
    const displayY = transform.midY + adjustments.offsetY;
    const finalScale = transform.scaleFactor * adjustments.scaleAdjust;
    const finalRotation = transform.angleRad + (adjustments.rotationAdjust * Math.PI / 180);

    return {
      position: 'absolute',
      left: `${displayX}px`,
      top: `${displayY}px`,
      transform: `translate(-50%, -50%) rotate(${finalRotation}rad) scale(${finalScale})`,
      transformOrigin: 'center center',
      pointerEvents: 'auto',
      cursor: dragging === 'frame' ? 'grabbing' : 'grab',
      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
      zIndex: 20
    };
  };

  const fitInfo = transform ? FIT_CONFIG[transform.fit] : null;
  const { measurements, faceShape } = capturedData;
  const formatVal = (v: number | undefined, d = 1) => (v != null && !isNaN(v)) ? v.toFixed(d) : 'N/A';

  return (
    <div className="space-y-4">
      {/* Simpler Results Header – hidden when measurementsOnly (e.g. MFit popup) */}
      {!measurementsOnly && (
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold uppercase tracking-wider">Virtual Try-On</h3>
          {transform && fitInfo && (
            <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded", fitInfo.color, "bg-gray-100")}>
              {fitInfo.label}
            </span>
          )}
        </div>
      )}

      {/* Back to Perfect MFit tab – only when measurementsOnly and callback provided */}
      {measurementsOnly && onBackToMeasurements && (
        <button
          type="button"
          onClick={onBackToMeasurements}
          className="w-full flex items-center justify-center gap-2 bg-[#F3F4F6] text-black py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest border-2 border-gray-300 hover:bg-gray-200 transition-colors"
        >
          ← Back to Perfect MFit
        </button>
      )}

      {/* Pupillary Distance + Face Width / Face Shape */}
      <div className="bg-[#F3F4F6] text-black p-4 rounded-2xl shadow-sm border border-gray-200">
        <div className="text-center mb-3">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">Pupillary Distance</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-black italic tracking-tighter">{formatVal(measurements?.pd)}</span>
            <span className="text-base text-gray-700">mm</span>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-black/10">
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-600 uppercase">Left PD</p>
              <p className="text-lg font-bold italic">{formatVal(measurements?.pd_left)}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-600 uppercase">Right PD</p>
              <p className="text-lg font-bold italic">{formatVal(measurements?.pd_right)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-black/10">
          <div className="bg-gray-100/80 p-3 rounded-xl text-center">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-0.5">Face Width</p>
            <p className="text-base font-bold">
              {formatVal(measurements?.face_width)}
              <span className="text-xs ml-1 opacity-50">mm</span>
            </p>
          </div>
          <div className="bg-gray-100/80 p-3 rounded-xl text-center">
            <p className="text-[9px] font-bold text-gray-500 uppercase mb-0.5">Face Shape</p>
            <p className="text-base font-bold uppercase italic tracking-tighter">{faceShape || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Try-on image, dots, PD line, glasses – hidden when measurementsOnly */}
      {!measurementsOnly && (
        <>
          <div 
            ref={containerRef}
            className="relative rounded-xl overflow-hidden bg-black aspect-[35/45] shadow-lg max-w-[280px] w-full mx-auto"
          >
            <img
              ref={imageRef}
              src={capturedData.processedImageDataUrl}
              alt="Try-on"
              className="w-full h-full object-cover object-center pointer-events-none"
              onLoad={handleImageLoad}
            />

            {/* Draggable Markers */}
            <div 
              className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-move z-40 flex items-center justify-center touch-none"
              style={{ left: leftEyePos.x, top: leftEyePos.y }}
              onMouseDown={startDrag('left')}
              onTouchStart={startDrag('left')}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 border-white shadow-xl transition-all",
                dragging === 'left' ? "bg-primary scale-125" : "bg-primary/60 scale-100"
              )}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
            </div>

            <div 
              className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 cursor-move z-40 flex items-center justify-center touch-none"
              style={{ left: rightEyePos.x, top: rightEyePos.y }}
              onMouseDown={startDrag('right')}
              onTouchStart={startDrag('right')}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 border-white shadow-xl transition-all",
                dragging === 'right' ? "bg-primary scale-125" : "bg-primary/60 scale-100"
              )}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
            </div>

            {/* PD Line */}
            <svg className="absolute inset-0 pointer-events-none z-20">
              <line x1={leftEyePos.x} y1={leftEyePos.y} x2={rightEyePos.x} y2={rightEyePos.y} stroke="white" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
              <text x={(leftEyePos.x + rightEyePos.x) / 2} y={(leftEyePos.y + rightEyePos.y) / 2 - 10} fill="white" fontSize="10" textAnchor="middle" className="font-bold">
                {capturedData.measurements.pd.toFixed(1)}mm
              </text>
            </svg>

            {/* Glasses - draggable by mouse/touch */}
            {selectedFrame && transform && (
              <img
                src={selectedFrame.imageUrl}
                alt={selectedFrame.name}
                style={getGlassesStyle()}
                onMouseDown={startFrameDrag}
                onTouchStart={startFrameDrag}
                draggable={false}
              />
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-3 text-center tracking-widest italic">
              Drag dots to your pupils for perfect fit
            </p>
            
            {selectedFrame && (
              <FrameAdjustmentControls
                values={adjustments}
                onChange={setAdjustments}
                onReset={handleResetAdjustments}
              />
            )}
          </div>

          <GlassesSelector
            frames={FRAMES}
            selectedFrame={selectedFrame}
            onSelectFrame={handleFrameSelect}
            faceWidthMm={capturedData?.measurements?.face_width ?? 0}
          />
        </>
      )}

      {/* Explore All Lenses + View Cropped Image – hidden when measurementsOnly */}
      {!measurementsOnly && (
        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={openCroppedImageInNewTab}
            className="w-full flex items-center justify-center gap-2 bg-[#F3F4F6] text-black py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest border border-black/20 hover:bg-gray-200 transition-colors"
          >
            View Cropped Image (New Tab)
          </button>
          <button
            type="button"
            onClick={() => {
              if (capturedData) {
                const cropped = getCroppedVisibleDataUrl();
                const cropRect = getCropRect();
                const toSave = {
                  ...capturedData,
                  processedImageDataUrl: cropped ?? capturedData.processedImageDataUrl,
                  ...(cropped ? { croppedPreviewDataUrl: cropped } : {}),
                  ...(cropRect ? { cropRect } : {}),
                  frameAdjustments: {
                    offsetX: adjustments.offsetX,
                    offsetY: adjustments.offsetY,
                    scaleAdjust: adjustments.scaleAdjust,
                    rotationAdjust: adjustments.rotationAdjust,
                  },
                };
                saveCaptureSession(toSave);
              }
              window.dispatchEvent(new CustomEvent('getmyfit:close'));
              navigate('/glasses');
            }}
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Explore All Lenses
          </button>
        </div>
      )}
    </div>
  );
}
