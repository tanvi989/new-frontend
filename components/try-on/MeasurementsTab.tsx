import { useCaptureData } from '@/contexts/CaptureContext';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { saveCaptureSession } from '@/utils/captureSession';

export function MeasurementsTab() {
  const { capturedData } = useCaptureData();
  const navigate = useNavigate();

  if (!capturedData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
        <p className="text-gray-500 font-medium">No Data Found</p>
      </div>
    );
  }

  const { measurements, processedImageDataUrl, faceShape } = capturedData;

  const formatVal = (v: number | undefined, d = 1) => (v != null && !isNaN(v)) ? v.toFixed(d) : 'N/A';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Simple PD Card */}
      <div className="bg-[#F3F4F6] text-black p-6 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1 text-center">Pupillary Distance</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-5xl font-black italic tracking-tighter">{formatVal(measurements?.pd)}</span>
            <span className="text-lg text-gray-700">mm</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/10">
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-600 uppercase">Left PD</p>
              <p className="text-xl font-bold italic">{formatVal(measurements?.pd_left)}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-600 uppercase">Right PD</p>
              <p className="text-xl font-bold italic">{formatVal(measurements?.pd_right)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Face Width + Face Shape (requested layout) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-100 p-4 rounded-2xl">
          <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Face Width</p>
          <p className="text-xl font-bold">
            {formatVal(measurements?.face_width)}
            <span className="text-xs ml-1 opacity-50">mm</span>
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-2xl">
          <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Face Shape</p>
          <p className="text-xl font-bold uppercase italic tracking-tighter">{faceShape || 'N/A'}</p>
        </div>
      </div>

      {/* View MFIT collection (same behavior as Explore All Lenses) */}
      <button
        type="button"
        onClick={() => {
          saveCaptureSession(capturedData);
          navigate('/glasses');
          window.dispatchEvent(new CustomEvent('getmyfit:close'));
        }}
        className="w-full inline-flex items-center justify-center bg-black text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-gray-800 transition-all"
      >
        View MFIT Collection
      </button>

      {/*
      Bridge Stats (commented out for now)
      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Nose Bridge (mm)</p>
        <div className="flex justify-between">
          <div className="flex gap-10">
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase">Left</p>
              <p className="text-lg font-bold">{formatVal(measurements?.nose_bridge_left)}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-gray-400 uppercase">Right</p>
              <p className="text-lg font-bold">{formatVal(measurements?.nose_bridge_right)}</p>
            </div>
          </div>
          <Activity className="w-5 h-5 text-gray-300" />
        </div>
      </div>
      */}
    </div>
  );
}
