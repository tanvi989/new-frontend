import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCaptureData } from '@/contexts/CaptureContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import { saveCaptureSession } from '@/utils/captureSession';
import { FrameAdjustmentControls } from './FrameAdjustmentControls';
import { DEFAULT_ADJUSTMENTS, DEFAULT_ADJUSTMENTS_DESKTOP, type AdjustmentValues } from '@/utils/frameOverlayUtils';
import { getProductBySku } from '@/api/retailerApis';
import VtoProductOverlay from '@/components/VtoProductOverlay';
import { toast } from 'sonner';
import { detectLandmarksFromImage } from '@/services/faceLandmarksFromImage';

/** Same frame as /glasses product cards – use a product skuid from catalog */
const TEST_FRAME_SKUID = 'E10A1012';

export interface MeasurementsTabProps {
  /** When provided, clicking "View Measurement" switches to Virtual Try-On tab (where PD, Face Width, Face Shape are shown). */
  onViewMeasurements?: () => void;
  /** When set (e.g. mobile popup), use this size for the frame preview instead of 384x332. */
  previewWidth?: number;
  previewHeight?: number;
  /** When true (mobile), center VTO image and show measurement + controls below. */
  compactLayout?: boolean;
  /** When true (e.g. mobile popup), hide frame alignment controls and use 100% size by default. */
  hideFrameAlignment?: boolean;
  /** When true (desktop MFit), hide Size control and keep scale at 100%. */
  hideSizeControl?: boolean;
}

/** Face shape → frame suggestions for multifocals (Shapes to Pick, Why, Shapes to Avoid, Why) */
const FACE_SHAPE_SUGGESTIONS: Record<string, { pick: string; pickWhy: string; avoid: string; avoidWhy: string }> = {
  oval: {
    pick: 'Rectangle, Semi square, Square, Hexagon',
    pickWhy: 'Adds structure for multifocal lens height. Creates a sharp premium style contrast.',
    avoid: 'Round, Small Round',
    avoidWhy: 'Reduces lens depth. Weak for multifocals.',
  },
  square: {
    pick: 'Round, Oval, Cat-eye',
    pickWhy: 'Softens angles, enables comfortable multifocal viewing zones. Balances jawline with elegant lift.',
    avoid: 'Square, Heavy Frames',
    avoidWhy: 'Over-angular. Visually harsh.',
  },
  round: {
    pick: 'Rectangle, Square, Cat-eye, Hexagon',
    pickWhy: 'Adds definition and supports wider reading area. Creates authority and face length.',
    avoid: 'Round, Tiny Shapes',
    avoidWhy: 'Crowds progressive corridor.',
  },
  rectangle: {
    pick: 'Round, Aviator, Square, Cat-eye',
    pickWhy: 'Reduces face length; deeper lenses aid multifocals. Adds width and visual balance.',
    avoid: 'Narrow frames',
    avoidWhy: 'Limits lens progression space.',
  },
  heart: {
    pick: 'Oval, Cat-eye, Round, Aviator, Wayfarer',
    pickWhy: 'Balances forehead for stable multifocal fit. Adds lower-face width for harmony.',
    avoid: 'Top-heavy frames',
    avoidWhy: 'Shifts focus upward. Unstable look.',
  },
  oblong: {
    pick: 'Round, Aviator, Square, Cat-eye',
    pickWhy: 'Reduces face length; deeper lenses aid multifocals. Adds width and visual balance.',
    avoid: 'Narrow frames',
    avoidWhy: 'Limits lens progression space.',
  },
};

function getSuggestionForShape(faceShape: string | undefined) {
  if (!faceShape) return null;
  const key = faceShape.toLowerCase().trim();
  return FACE_SHAPE_SUGGESTIONS[key] ?? FACE_SHAPE_SUGGESTIONS[key.replace(/\s+/g, '_')] ?? null;
}

const FIXED_100_ADJUSTMENTS: AdjustmentValues = { offsetX: 0, offsetY: 0, scaleAdjust: 1, rotationAdjust: 0 };

/** AI eye-aligned position: frame placed using detected eyes/landmarks (no manual offset). */
const AI_ALIGN_ADJUSTMENTS: AdjustmentValues = { offsetX: 0, offsetY: 0, scaleAdjust: 1, rotationAdjust: 0 };

/** Mobile: fixed frame scale after align (133%) – matches Get My Fit popup & /glasses-m */
const MOBILE_ALIGN_SCALE = 1.2;

export function MeasurementsTab({ onViewMeasurements, previewWidth = 384, previewHeight = 332, compactLayout = false, hideFrameAlignment = false, hideSizeControl = false }: MeasurementsTabProps = {}) {
  const { capturedData, setCapturedData } = useCaptureData();
  const hasAutoAlignedRef = useRef(false);
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(() => {
    const base = hideFrameAlignment
      ? { ...FIXED_100_ADJUSTMENTS }
      : capturedData?.frameAdjustments
        ? { ...capturedData.frameAdjustments }
        : (compactLayout ? { ...DEFAULT_ADJUSTMENTS } : { ...DEFAULT_ADJUSTMENTS_DESKTOP }); // Desktop: 85% default
    if (hideSizeControl) base.scaleAdjust = 1;
    return base;
  });
  const [testProduct, setTestProduct] = useState<{ dimensions?: string; name: string } | null>(null);
  const [showMeasurementConfirm, setShowMeasurementConfirm] = useState(false);
  const [isAligning, setIsAligning] = useState(false);

  /** Default apply align on both desktop and mobile when MeasurementsTab mounts with capturedData */
  const handleAlignToEyes = useCallback(async () => {
    if (!capturedData?.processedImageDataUrl || isAligning) return;
    setIsAligning(true);
    try {
      const newLandmarks = await detectLandmarksFromImage(capturedData.processedImageDataUrl);
      if (!newLandmarks) {
        toast.error('Could not detect eyes. Try a clearer photo or click Align again.');
        return;
      }
      const scaleForAlign = hideSizeControl ? 1 : (compactLayout ? MOBILE_ALIGN_SCALE : 0.9); // Desktop: 85% after align
      const alignValues: AdjustmentValues = {
        ...AI_ALIGN_ADJUSTMENTS,
        scaleAdjust: scaleForAlign,
      };
      setAdjustments(alignValues);
      const updated = {
        ...capturedData,
        landmarks: newLandmarks,
        cropRect: undefined,
        frameAdjustments: {
          offsetX: alignValues.offsetX,
          offsetY: alignValues.offsetY,
          scaleAdjust: alignValues.scaleAdjust,
          rotationAdjust: alignValues.rotationAdjust,
        },
      };
      setCapturedData(updated);
      saveCaptureSession(updated);
      toast.success('Frame aligned to eyes');
    } catch (e) {
      console.error('Align to eyes failed:', e);
      toast.error('Alignment failed. Try again.');
    } finally {
      setIsAligning(false);
    }
  }, [capturedData, setCapturedData, hideSizeControl, compactLayout, isAligning]);

  /** Auto-run align once on mount when we have capturedData (default apply on desktop and mobile) */
  useEffect(() => {
    if (!capturedData?.processedImageDataUrl || hasAutoAlignedRef.current || hideFrameAlignment) return;
    hasAutoAlignedRef.current = true;
    handleAlignToEyes();
  }, [capturedData?.processedImageDataUrl, hideFrameAlignment, handleAlignToEyes]);

  useEffect(() => {
    let cancelled = false;
    getProductBySku(TEST_FRAME_SKUID).then((res) => {
      if (cancelled) return;
      const product = res?.data?.data ?? res?.data;
      if (product) {
        setTestProduct({
          dimensions: product.dimensions,
          name: product.name ?? TEST_FRAME_SKUID,
        });
      }
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const captureWithAdjustments = { ...capturedData, frameAdjustments: adjustments };

  const handleAdjustmentsChange = useCallback(
    (next: AdjustmentValues) => {
      setAdjustments(next);
      if (capturedData) {
        // Persist latest fine‑tune values in context so they stay the same
        // when switching tabs (Measurements ↔ Frames) inside the MFit popup.
        setCapturedData({
          ...capturedData,
          frameAdjustments: {
            offsetX: next.offsetX,
            offsetY: next.offsetY,
            scaleAdjust: next.scaleAdjust,
            rotationAdjust: next.rotationAdjust,
          },
        });
      }
    },
    [capturedData, setCapturedData]
  );

  const handleResetAdjustments = useCallback(() => {
    const baseDefault = compactLayout ? DEFAULT_ADJUSTMENTS : DEFAULT_ADJUSTMENTS_DESKTOP;
    const reset = { ...baseDefault, ...(hideSizeControl ? { scaleAdjust: 1 } : {}) };
    setAdjustments(reset);
    if (capturedData) {
      setCapturedData({
        ...capturedData,
        frameAdjustments: {
          offsetX: reset.offsetX,
          offsetY: reset.offsetY,
          scaleAdjust: reset.scaleAdjust,
          rotationAdjust: reset.rotationAdjust,
        },
      });
    }
  }, [capturedData, setCapturedData, hideSizeControl, compactLayout]);

  const handleViewMeasurementsClick = useCallback(() => {
    if (!onViewMeasurements) return;
    setShowMeasurementConfirm(true);
  }, [onViewMeasurements]);

  if (!capturedData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">No Data Found</p>
      </div>
    );
  }

  const { faceShape } = capturedData;

  const measurements = capturedData?.measurements;
  const isCompact = compactLayout || previewWidth !== 384;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Alignment Loader Overlay */}
      {isAligning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm mx-4 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-2">We are aligning frame on your face</p>
            <p className="text-sm text-gray-600">Please wait while we ensure perfect alignment...</p>
          </div>
        </div>
      )}
      {/* Instruction + Face with test frame */}
      <div className={isCompact ? 'space-y-3 flex flex-col items-center' : 'space-y-3 text-left'}>
        <div className="flex flex-wrap items-center justify-center gap-2 w-full">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide ">
            Your fit is personal. <br />
Position the frame as you would wear it daily. Accurate alignment ensures perfectly tailored multifocals.
          </p>
          {!hideFrameAlignment && capturedData?.processedImageDataUrl && (
         <button
  type="button"
  onClick={handleAlignToEyes}
  disabled={isAligning}
  className="hidden shrink-0 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md bg-[#232320] text-white hover:bg-black transition-colors disabled:opacity-70 disabled:cursor-wait flex items-center gap-1.5"
  title="Detect eyes and align frame (MediaPipe)"
>
  {isAligning ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
  Align
</button>
          )}
        </div>
        {/* Desktop: grid image left, controls right. Mobile (compactLayout): VTO centered, then measurement + controls below. */}
        {isCompact ? (
          <>
            <div className="flex justify-center w-full">
              <div className="p-0 bg-[#F7F7F7] flex relative rounded-xl overflow-hidden shadow-sm shrink-0" style={{ width: previewWidth, height: previewHeight }}>
                <VtoProductOverlay
                  captureSession={captureWithAdjustments}
                  productSkuid={TEST_FRAME_SKUID}
                  productDimensions={testProduct?.dimensions}
                  productName={testProduct?.name ?? 'Test frame'}
                  compact
                />
              </div>
            </div>
            {measurements && (
              <div className="w-full text-center py-2 px-3 bg-gray-100 rounded-xl">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Measurement</p>
                <p className="text-sm font-semibold text-gray-900 mt-1">
                  PD <span className="text-primary">{measurements.pd != null ? `${Number(measurements.pd).toFixed(1)} mm` : '—'}</span>
                  {measurements.face_width != null && (
                    <span className="text-gray-600 ml-3">Face width {Number(measurements.face_width).toFixed(0)} mm</span>
                  )}
                </p>
              </div>
            )}
            {!hideFrameAlignment && (
              <div className="w-full flex justify-center">
                <FrameAdjustmentControls
                  values={adjustments}
                  onChange={handleAdjustmentsChange}
                  onReset={handleResetAdjustments}
                  hideSizeControl={hideSizeControl}
                />
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[384px_1fr] gap-4 items-start min-w-0" style={previewWidth !== 384 ? { gridTemplateColumns: `${previewWidth}px 1fr` } : undefined}>
            <div className="p-0 bg-[#F7F7F7] flex relative rounded-xl overflow-hidden shadow-sm" style={{ width: previewWidth, height: previewHeight }}>
              <VtoProductOverlay
                captureSession={captureWithAdjustments}
                productSkuid={TEST_FRAME_SKUID}
                productDimensions={testProduct?.dimensions}
                productName={testProduct?.name ?? 'Test frame'}
                compact
              />
            </div>
            {!hideFrameAlignment && (
              <div className="flex justify-end min-w-0">
                <FrameAdjustmentControls
                  values={adjustments}
                  onChange={handleAdjustmentsChange}
                  onReset={handleResetAdjustments}
                  hideSizeControl={hideSizeControl}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Face shape frame suggestions – 2x2 grid (only when shape is known) */}
      {(() => {
        const suggestion = getSuggestionForShape(faceShape);
        return suggestion ? (
          <div className="bg-[#F3F4F6] border border-gray-200 rounded-2xl p-4 shadow-sm">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-3">
              Frame suggestions for your face shape
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Shapes to pick</p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{suggestion.pick}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Why</p>
                <p className="text-xs text-gray-700 leading-snug">{suggestion.pickWhy}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Shapes to avoid</p>
                <p className="text-sm font-medium text-gray-900 leading-snug">{suggestion.avoid}</p>
              </div>
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5">Why</p>
                <p className="text-xs text-gray-700 leading-snug">{suggestion.avoidWhy}</p>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* View Measurement – switches to Virtual Try-On tab where PD, Face Width, Face Shape are shown (with alignment confirmation) */}
      {onViewMeasurements && (
        <button
          type="button"
          onClick={handleViewMeasurementsClick}
          className="w-full inline-flex items-center justify-center bg-[#F3F4F6] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-200 border-2 border-gray-300 transition-all"
        >
          View Measurement
        </button>
      )}

      {/* Confirmation for View Measurement: Did you align your frame perfectly? Rendered via portal so it appears above MFit popup (z-[1000]). */}
      {showMeasurementConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowMeasurementConfirm(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-center text-lg font-semibold text-gray-900">Confirm</h3>
              <p className="mt-2 text-center text-sm text-gray-600">
                Did you align your frame perfectly on your face?
              </p>
              <p className="mt-1 text-center text-xs text-gray-500">
                Based on your fine-tune adjustments, we&apos;ll align the frame on your face.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowMeasurementConfirm(false);
                    toast.info('Please align your frame first, then try again.');
                  }}
                  className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMeasurementConfirm(false);
                    onViewMeasurements?.();
                  }}
                  className="flex-1 rounded-xl bg-black py-3 text-sm font-bold uppercase tracking-wide text-white hover:bg-gray-800"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
