import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCaptureData } from '@/contexts/CaptureContext';
import { AlertCircle } from 'lucide-react';
import { saveCaptureSession } from '@/utils/captureSession';
import { FrameAdjustmentControls } from './FrameAdjustmentControls';
import { DEFAULT_ADJUSTMENTS, type AdjustmentValues } from '@/utils/frameOverlayUtils';
import { getProductBySku } from '@/api/retailerApis';
import VtoProductOverlay from '@/components/VtoProductOverlay';
import { toast } from 'sonner';

/** Same frame as /glasses product cards – use a product skuid from catalog */
const TEST_FRAME_SKUID = 'E10A1012';

export interface MeasurementsTabProps {
  /** When provided, clicking "View Measurement" switches to Virtual Try-On tab (where PD, Face Width, Face Shape are shown). */
  onViewMeasurements?: () => void;
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

export function MeasurementsTab({ onViewMeasurements }: MeasurementsTabProps = {}) {
  const { capturedData, setCapturedData } = useCaptureData();
  const [adjustments, setAdjustments] = useState<AdjustmentValues>(() =>
    capturedData?.frameAdjustments
      ? { ...capturedData.frameAdjustments }
      : { ...DEFAULT_ADJUSTMENTS }
  );
  const [testProduct, setTestProduct] = useState<{ dimensions?: string; name: string } | null>(null);
  const [showAlignConfirm, setShowAlignConfirm] = useState(false);

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

  const handleResetAdjustments = useCallback(() => {
    setAdjustments({ ...DEFAULT_ADJUSTMENTS });
  }, []);

  const proceedToCollection = useCallback(() => {
    if (!capturedData) return;
    const withAdjustments = {
      ...capturedData,
      frameAdjustments: {
        offsetX: adjustments.offsetX,
        offsetY: adjustments.offsetY,
        scaleAdjust: adjustments.scaleAdjust,
        rotationAdjust: adjustments.rotationAdjust,
      },
    };
    setCapturedData(withAdjustments);
    saveCaptureSession(withAdjustments);
    window.dispatchEvent(new CustomEvent('getmyfit:close'));
    // Full page navigation so /glasses loads fresh and reads the new session from storage
    window.location.href = '/glasses';
  }, [capturedData, adjustments, setCapturedData]);

  const handleViewCollection = useCallback(() => {
    setShowAlignConfirm(true);
  }, []);

  if (!capturedData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">No Data Found</p>
      </div>
    );
  }

  const { faceShape } = capturedData;

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Instruction + Face with test frame – same component as /glasses for identical view */}
      <div className="space-y-3 text-left">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          Please align how you like to wear glasses
        </p>
        {/* Image left, Fine-tune panel right. DO NOT change image width/height (384x332). */}
        <div className="grid grid-cols-1 md:grid-cols-[384px_1fr] gap-4 items-start min-w-0">
          <div className="p-0 bg-[#F7F7F7] flex relative rounded-xl overflow-hidden shadow-sm" style={{ width: 384, height: 332 }}>
            <VtoProductOverlay
              captureSession={captureWithAdjustments}
              productSkuid={TEST_FRAME_SKUID}
              productDimensions={testProduct?.dimensions}
              productName={testProduct?.name ?? 'Test frame'}
              compact
            />
          </div>
          <div className="flex justify-end min-w-0">
            <FrameAdjustmentControls
              values={adjustments}
              onChange={setAdjustments}
              onReset={handleResetAdjustments}
            />
          </div>
        </div>
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

      {/* View Measurement – switches to Virtual Try-On tab where PD, Face Width, Face Shape are shown */}
      {onViewMeasurements && (
        <button
          type="button"
          onClick={onViewMeasurements}
          className="w-full inline-flex items-center justify-center bg-[#F3F4F6] text-black py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-200 border-2 border-gray-300 transition-all"
        >
          View Measurement
        </button>
      )}

      {/* View MFIT Collection – asks confirmation before redirect */}
      <button
        type="button"
        onClick={handleViewCollection}
        className="w-full inline-flex items-center justify-center bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-all"
      >
        View MFIT Collection
      </button>

      {/* Confirmation: Did you align your frame perfectly? Rendered via portal so it appears above MFit popup (z-[1000]). */}
      {showAlignConfirm &&
        createPortal(
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/70" onClick={() => setShowAlignConfirm(false)} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h3 className="text-center text-lg font-semibold text-gray-900">Confirm</h3>
              <p className="mt-2 text-center text-sm text-gray-600">
                Did you align your frame perfectly on your face?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlignConfirm(false);
                    toast.info('Please align your frame first, then try again.');
                  }}
                  className="flex-1 rounded-xl border-2 border-gray-300 bg-white py-3 text-sm font-bold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAlignConfirm(false);
                    proceedToCollection();
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
