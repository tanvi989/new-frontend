import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCaptureData } from '@pf/context/CaptureContext';
import { MeasurementsTab } from '@pf/components/try-on/MeasurementsTab';
import { FramesTab } from '@pf/components/try-on/FramesTab';
import { FaceShapeRecommendationGrid } from '@pf/components/try-on/FaceShapeRecommendationGrid';
import { Button } from '@pf/components/ui/button';
import { ArrowLeft, Ruler, ExternalLink } from 'lucide-react';
import { useVoiceGuidance } from '@pf/hooks/useVoiceGuidance';
import { saveCaptureSession } from '@/utils/captureSession';
import { cropToPassportStyle } from '@/utils/passportCrop';

type View = 'frames' | 'measurements';

const RESULTS_VOICE_MESSAGE =
  'Use the horizontal and vertical sliders, or drag the frame, to move it left, right, up, and down. Line up the frame with your eyes and the bridge of your nose, the way you like to wear your glasses. Your measurements will be based on this position. When you are happy with the alignment, click View My Measurements to view your data.';

export default function Results() {
  const navigate = useNavigate();
  const { capturedData } = useCaptureData();
  const { speak } = useVoiceGuidance({ enabled: true, debounceMs: 5000 });
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);
  const [view, setView] = useState<View>('frames');
  const hasSpokenResultsRef = useRef(false);

  // Voice instruction once when user lands on MFit results (frames view)
  useEffect(() => {
    if (capturedData && view === 'frames' && !hasSpokenResultsRef.current) {
      hasSpokenResultsRef.current = true;
      speak(RESULTS_VOICE_MESSAGE);
    }
  }, [capturedData, view, speak]);

  useEffect(() => {
    if (!capturedData?.processedImageDataUrl || !capturedData?.landmarks) return;
    let cancelled = false;
    cropToPassportStyle(capturedData.processedImageDataUrl, capturedData.landmarks).then((result) => {
      if (!cancelled && result?.croppedDataUrl) setCroppedImageUrl(result.croppedDataUrl);
    });
    return () => { cancelled = true; };
  }, [capturedData?.processedImageDataUrl, capturedData?.landmarks]);

  const handleExploreAllLenses = () => {
    if (!capturedData) return;
    saveCaptureSession(capturedData);
    navigate('/glasses');
  };

  // Redirect to home if no captured data
  useEffect(() => {
    if (!capturedData) {
      navigate('/perfect-fit');
    }
  }, [capturedData, navigate]);

  if (!capturedData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3]">
      {/* Header – same style as MFit step 4 */}
      <div className="flex flex-col items-center w-full pt-6 px-4 pb-4">
        <div className="flex items-center justify-between w-full max-w-[850px] mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/perfect-fit')}
            className="shrink-0 rounded-full hover:bg-black/10"
          >
            <ArrowLeft className="h-5 w-5 text-black" />
          </Button>
          <h2 className="text-4xl font-black tracking-[0.15em] text-black">
            MFit
          </h2>
          <div className="w-10" />
        </div>

        <div className="w-full max-w-[850px] bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          {view === 'frames' && (
            <>
              <FramesTab />
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={() => setView('measurements')}
                  variant="outline"
                  className="rounded-full border-black text-black hover:bg-black hover:text-white font-bold uppercase text-[10px] tracking-widest flex items-center gap-2"
                >
                  <Ruler className="h-4 w-4" />
                  View My Measurements
                </Button>
              </div>
            </>
          )}
          {view === 'measurements' && (
            <>
              <div className="mb-4 flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('frames')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ← Back to Try-On
                </Button>
              </div>
              <MeasurementsTab />
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={handleExploreAllLenses}
                  className="bg-black text-white rounded-full px-6 py-3 font-bold uppercase text-[10px] tracking-widest hover:bg-gray-800 flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Explore Our MFit Collection
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Face shape frame recommendations – 2×2 grid */}
        {capturedData.faceShape && (
          <FaceShapeRecommendationGrid faceShape={capturedData.faceShape} />
        )}
      </div>
    </div>
  );
}
