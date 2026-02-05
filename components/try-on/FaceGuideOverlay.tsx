import { cn } from '@/lib/utils';
import { ValidationCheck, FaceLandmarks } from '@/types/face-validation';
import { Check, X } from 'lucide-react';

interface DebugValues {
  faceWidthPercent: number;
  leftEyeAR: number;
  rightEyeAR: number;
  headTilt: number;
  headRotation: number;
  brightness: number;
}

interface FaceGuideOverlayProps {
  isValid: boolean;
  faceDetected: boolean;
  validationChecks: ValidationCheck[];
  debugValues?: DebugValues;
  landmarks?: FaceLandmarks | null;
  containerSize?: { width: number; height: number };
  isMobile?: boolean;
}

/**
 * Exact same as perfect-fit-cam: pupil/eye center reticles, vertical midline,
 * horizontal "Align eyes with this line", face contour, oval, corner markers, colors.
 */
export function FaceGuideOverlay({
  isValid,
  faceDetected,
  validationChecks,
  debugValues,
  landmarks,
  containerSize,
  isMobile = false,
}: FaceGuideOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {/* Virtual Lines / Face Contour – exact same as perfect-fit-cam */}
      {faceDetected && landmarks && containerSize && containerSize.width > 0 && containerSize.height > 0 && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none z-20 face-guide-svg"
          viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
        >
          {/* Eyes visualization – stylized reticles (same blue as perfect-fit-cam) */}
          <g className={cn(isMobile ? '' : 'animate-pulse')}>
            <circle
              cx={isMobile ? landmarks.noseTip.x * containerSize.width - 65 : landmarks.leftEye.x * containerSize.width}
              cy={landmarks.leftEye.y * containerSize.height}
              r="12"
              fill="none"
              stroke="hsl(199, 89%, 48%, 0.4)"
              strokeWidth="1"
            />
            <circle
              cx={isMobile ? landmarks.noseTip.x * containerSize.width - 65 : landmarks.leftEye.x * containerSize.width}
              cy={landmarks.leftEye.y * containerSize.height}
              r="2"
              fill="hsl(199, 89%, 48%)"
              stroke="none"
            />
            <circle
              cx={isMobile ? landmarks.noseTip.x * containerSize.width + 65 : landmarks.rightEye.x * containerSize.width}
              cy={landmarks.rightEye.y * containerSize.height}
              r="12"
              fill="none"
              stroke="hsl(199, 89%, 48%, 0.4)"
              strokeWidth="1"
            />
            <circle
              cx={isMobile ? landmarks.noseTip.x * containerSize.width + 65 : landmarks.rightEye.x * containerSize.width}
              cy={landmarks.rightEye.y * containerSize.height}
              r="2"
              fill="hsl(199, 89%, 48%)"
              stroke="none"
            />
          </g>

          {/* Vertical line through nose/center */}
          <line
            x1={landmarks.noseTip.x * containerSize.width}
            y1={landmarks.forehead.y * containerSize.height}
            x2={landmarks.noseTip.x * containerSize.width}
            y2={landmarks.chin.y * containerSize.height}
            stroke="hsl(199, 89%, 48%, 0.2)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />

          {/* Horizontal line through eyes – align eyes with this line (blue like perfect-fit-cam) */}
          <line
            x1={isMobile ? landmarks.noseTip.x * containerSize.width - 85 : landmarks.faceLeft.x * containerSize.width}
            y1={((landmarks.leftEye.y + landmarks.rightEye.y) / 2) * containerSize.height}
            x2={isMobile ? landmarks.noseTip.x * containerSize.width + 85 : landmarks.faceRight.x * containerSize.width}
            y2={((landmarks.leftEye.y + landmarks.rightEye.y) / 2) * containerSize.height}
            stroke={isMobile ? 'hsl(199, 89%, 48%, 0.8)' : 'hsl(199, 89%, 48%, 0.4)'}
            strokeWidth={isMobile ? 2 : 1}
            strokeDasharray={isMobile ? 'none' : '4,4'}
          />

          {/* Eye alignment text – blue, same as perfect-fit-cam */}
          <text
            x={landmarks.noseTip.x * containerSize.width}
            y={((landmarks.leftEye.y + landmarks.rightEye.y) / 2) * containerSize.height - (isMobile ? 25 : 20)}
            fill="hsl(199, 89%, 48%)"
            fontSize={isMobile ? 12 : 10}
            fontWeight="bold"
            textAnchor="middle"
            className="uppercase tracking-widest"
            style={{ fontFamily: 'inherit' }}
          >
            {isMobile ? 'ALIGN EYES WITH THIS LINE MOBILE' : 'Align eyes with this line'}
          </text>

          {/* Face Contour Line */}
          <path
            d={`
              M ${landmarks.forehead.x * containerSize.width} ${landmarks.forehead.y * containerSize.height}
              Q ${landmarks.faceLeft.x * containerSize.width} ${landmarks.leftEye.y * containerSize.height} ${landmarks.faceLeft.x * containerSize.width} ${((landmarks.leftEye.y + landmarks.chin.y) / 2) * containerSize.height}
              Q ${landmarks.faceLeft.x * containerSize.width} ${landmarks.chin.y * containerSize.height} ${landmarks.chin.x * containerSize.width} ${landmarks.chin.y * containerSize.height}
              Q ${landmarks.faceRight.x * containerSize.width} ${landmarks.chin.y * containerSize.height} ${landmarks.faceRight.x * containerSize.width} ${((landmarks.rightEye.y + landmarks.chin.y) / 2) * containerSize.height}
              Q ${landmarks.faceRight.x * containerSize.width} ${landmarks.rightEye.y * containerSize.height} ${landmarks.forehead.x * containerSize.width} ${landmarks.forehead.y * containerSize.height}
            `}
            fill="none"
            stroke="hsl(199, 89%, 48%, 0.4)"
            strokeWidth="2"
          />

          {/* Eye area highlights */}
          <ellipse
            cx={landmarks.leftEye.x * containerSize.width}
            cy={landmarks.leftEye.y * containerSize.height}
            rx={(landmarks.faceRight.x - landmarks.faceLeft.x) * containerSize.width * 0.15}
            ry={(landmarks.chin.y - landmarks.forehead.y) * containerSize.height * 0.08}
            fill="hsl(199, 89%, 48%, 0.05)"
            stroke="hsl(199, 89%, 48%, 0.3)"
            strokeWidth="1"
          />
          <ellipse
            cx={landmarks.rightEye.x * containerSize.width}
            cy={landmarks.rightEye.y * containerSize.height}
            rx={(landmarks.faceRight.x - landmarks.faceLeft.x) * containerSize.width * 0.15}
            ry={(landmarks.chin.y - landmarks.forehead.y) * containerSize.height * 0.08}
            fill="hsl(199, 89%, 48%, 0.05)"
            stroke="hsl(199, 89%, 48%, 0.3)"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Center guide oval – exact same as perfect-fit-cam */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            isMobile ? 'w-[300px] h-[400px]' : 'w-[280px] h-[360px] md:w-[320px] md:h-[420px]',
            'rounded-[50%] transition-all duration-300',
            !faceDetected && 'face-guide-oval pulse-ring',
            faceDetected && isValid && 'face-guide-valid',
            faceDetected && !isValid && 'face-guide-invalid'
          )}
        />
      </div>

      {/* Corner markers – exact same as perfect-fit-cam */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            isMobile ? 'w-[320px] h-[420px]' : 'w-[300px] h-[380px] md:w-[340px] md:h-[440px]',
            'relative'
          )}
        >
          <div className={cn('absolute -top-2 -left-2 w-8 h-8 border-l-[3px] border-t-[3px] rounded-tl-lg transition-colors duration-300', isValid ? 'border-validation-pass' : faceDetected ? 'border-validation-fail' : 'border-white/60')} />
          <div className={cn('absolute -top-2 -right-2 w-8 h-8 border-r-[3px] border-t-[3px] rounded-tr-lg transition-colors duration-300', isValid ? 'border-validation-pass' : faceDetected ? 'border-validation-fail' : 'border-white/60')} />
          <div className={cn('absolute -bottom-2 -left-2 w-8 h-8 border-l-[3px] border-b-[3px] rounded-bl-lg transition-colors duration-300', isValid ? 'border-validation-pass' : faceDetected ? 'border-validation-fail' : 'border-white/60')} />
          <div className={cn('absolute -bottom-2 -right-2 w-8 h-8 border-r-[3px] border-b-[3px] rounded-br-lg transition-colors duration-300', isValid ? 'border-validation-pass' : faceDetected ? 'border-validation-fail' : 'border-white/60')} />
        </div>
      </div>

      {/* Instruction text – exact same as perfect-fit-cam */}
      <div className="absolute top-6 left-0 right-0 text-center px-4">
        <span
          className={cn(
            'inline-block px-6 py-3 rounded-full text-base font-medium backdrop-blur-md',
            !faceDetected && 'bg-black/50 text-white',
            faceDetected && isValid && 'bg-validation-pass/90 text-white',
            faceDetected && !isValid && 'bg-validation-fail/90 text-white'
          )}
        >
          {!faceDetected ? 'Position your face in the oval' : isValid ? 'Perfect! Capturing...' : 'Adjust your position'}
        </span>
      </div>

      {/* Debug panel – exact same as perfect-fit-cam */}
      {debugValues && (
        <div className="absolute top-20 right-4 bg-black/80 backdrop-blur-md rounded-xl p-3 text-xs font-mono text-white space-y-1">
          <div className="text-yellow-400 font-bold mb-2">Debug Values</div>
          <div className={cn((debugValues?.faceWidthPercent ?? 0) >= 15 && (debugValues?.faceWidthPercent ?? 0) <= 70 ? 'text-green-400' : 'text-red-400')}>
            Distance: {debugValues?.faceWidthPercent?.toFixed(1) ?? 'N/A'}%
            <span className="text-white/50 ml-1">(need 15-70%)</span>
          </div>
          <div className={cn((debugValues?.leftEyeAR ?? 0) > 0.01 ? 'text-green-400' : 'text-red-400')}>
            Left Eye AR: {debugValues?.leftEyeAR?.toFixed(3) ?? 'N/A'}
            <span className="text-white/50 ml-1">(need &gt;0.01)</span>
          </div>
          <div className={cn((debugValues?.rightEyeAR ?? 0) > 0.01 ? 'text-green-400' : 'text-red-400')}>
            Right Eye AR: {debugValues?.rightEyeAR?.toFixed(3) ?? 'N/A'}
            <span className="text-white/50 ml-1">(need &gt;0.01)</span>
                  </div>
          <div className={cn(Math.abs(debugValues?.headTilt ?? 0) <= 10 ? 'text-green-400' : 'text-red-400')}>
            Head Tilt: {debugValues?.headTilt?.toFixed(1) ?? 'N/A'}°
            <span className="text-white/50 ml-1">(need ±10°)</span>
                  </div>
          <div className={cn(Math.abs(debugValues?.headRotation ?? 0) <= 15 ? 'text-green-400' : 'text-red-400')}>
            Head Rotation: {debugValues?.headRotation?.toFixed(1) ?? 'N/A'}°
            <span className="text-white/50 ml-1">(need ±15°)</span>
                </div>
          <div className={cn((debugValues?.brightness ?? 0) >= 80 && (debugValues?.brightness ?? 0) <= 220 ? 'text-green-400' : 'text-red-400')}>
            Brightness: {debugValues?.brightness?.toFixed(0) ?? 'N/A'}
            <span className="text-white/50 ml-1">(need 80-220)</span>
          </div>
        </div>
      )}

      {/* Validation checklist on left side – exact same as perfect-fit-cam */}
      <div className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2">
        <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 md:p-4 max-w-[160px] md:max-w-[180px]">
          <div className="flex flex-col gap-2">
        {validationChecks.map((check) => (
          <div
            key={check.id}
            className={cn(
                  'flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg text-sm transition-all duration-200',
                  check.passed ? 'bg-validation-pass/20' : 'bg-white/10'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center',
                    check.passed ? 'bg-validation-pass' : 'bg-white/30'
                  )}
                >
              {check.passed ? (
                    <Check className="h-2.5 w-2.5 md:h-3 md:w-3 text-white" />
              ) : (
                    <X className="h-2.5 w-2.5 md:h-3 md:w-3 text-white/70" />
              )}
            </div>
                <span className={cn('text-[10px] md:text-xs font-medium', check.passed ? 'text-white' : 'text-white/70')}>
                  {check.label}
            </span>
          </div>
        ))}
          </div>
        </div>
      </div>
    </div>
  );
}
