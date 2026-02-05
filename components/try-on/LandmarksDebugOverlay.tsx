import type { ApiLandmarksResponse } from '@/types/face-validation';

interface LandmarksDebugOverlayProps {
  landmarks: ApiLandmarksResponse;
  containerWidth: number;
  containerHeight: number;
  naturalWidth: number;
  naturalHeight: number;
}

function getCenter(points: number[][]): { x: number; y: number } {
  if (!points || points.length === 0) return { x: 0, y: 0 };
  const sumX = points.reduce((acc, p) => acc + (p[0] || 0), 0);
  const sumY = points.reduce((acc, p) => acc + (p[1] || 0), 0);
  return { x: sumX / points.length, y: sumY / points.length };
}

export function LandmarksDebugOverlay({
  landmarks,
  containerWidth,
  containerHeight,
  naturalWidth,
  naturalHeight,
}: LandmarksDebugOverlayProps) {
  const scaleX = containerWidth / naturalWidth;
  const scaleY = containerHeight / naturalHeight;

  const regionPoints = landmarks.region_points as any;
  if (!regionPoints) return null;

  const leftEyePoints = regionPoints.left_eye || [];
  const rightEyePoints = regionPoints.right_eye || [];
  const noseBridgePoints = regionPoints.nose_bridge || [];

  const leftEyeCenter = getCenter(leftEyePoints);
  const rightEyeCenter = getCenter(rightEyePoints);
  const noseBridgeCenter = getCenter(noseBridgePoints);
  const eyeMidpoint = {
    x: (leftEyeCenter.x + rightEyeCenter.x) / 2,
    y: (leftEyeCenter.y + rightEyeCenter.y) / 2,
  };

  // Convert to display coordinates
  const toDisplay = (p: { x: number; y: number }) => ({
    x: p.x * scaleX,
    y: p.y * scaleY,
  });

  const leftEyeDisplay = toDisplay(leftEyeCenter);
  const rightEyeDisplay = toDisplay(rightEyeCenter);
  const noseBridgeDisplay = toDisplay(noseBridgeCenter);
  const eyeMidpointDisplay = toDisplay(eyeMidpoint);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
    >
      {/* Eye centers */}
      <circle
        cx={leftEyeDisplay.x}
        cy={leftEyeDisplay.y}
        r={6}
        fill="none"
        stroke="#00ff00"
        strokeWidth={2}
      />
      <circle
        cx={rightEyeDisplay.x}
        cy={rightEyeDisplay.y}
        r={6}
        fill="none"
        stroke="#00ff00"
        strokeWidth={2}
      />

      {/* Eye center dots */}
      <circle cx={leftEyeDisplay.x} cy={leftEyeDisplay.y} r={2} fill="#00ff00" />
      <circle cx={rightEyeDisplay.x} cy={rightEyeDisplay.y} r={2} fill="#00ff00" />

      {/* Line between eyes */}
      <line
        x1={leftEyeDisplay.x}
        y1={leftEyeDisplay.y}
        x2={rightEyeDisplay.x}
        y2={rightEyeDisplay.y}
        stroke="#00ff00"
        strokeWidth={1}
        strokeDasharray="4 4"
      />

      {/* Eye midpoint (anchor for glasses) */}
      <circle
        cx={eyeMidpointDisplay.x}
        cy={eyeMidpointDisplay.y}
        r={4}
        fill="#ff00ff"
      />

      {/* Nose bridge */}
      {noseBridgePoints.length > 0 && (
        <>
          <circle
            cx={noseBridgeDisplay.x}
            cy={noseBridgeDisplay.y}
            r={5}
            fill="none"
            stroke="#ffff00"
            strokeWidth={2}
          />
          <circle
            cx={noseBridgeDisplay.x}
            cy={noseBridgeDisplay.y}
            r={2}
            fill="#ffff00"
          />
        </>
      )}

      {/* Labels */}
      <text
        x={leftEyeDisplay.x}
        y={leftEyeDisplay.y - 12}
        fill="#00ff00"
        fontSize={10}
        textAnchor="middle"
      >
        L Eye
      </text>
      <text
        x={rightEyeDisplay.x}
        y={rightEyeDisplay.y - 12}
        fill="#00ff00"
        fontSize={10}
        textAnchor="middle"
      >
        R Eye
      </text>
      <text
        x={eyeMidpointDisplay.x}
        y={eyeMidpointDisplay.y - 10}
        fill="#ff00ff"
        fontSize={10}
        textAnchor="middle"
      >
        Anchor
      </text>
      {noseBridgePoints.length > 0 && (
        <text
          x={noseBridgeDisplay.x + 15}
          y={noseBridgeDisplay.y}
          fill="#ffff00"
          fontSize={10}
        >
          Bridge
        </text>
      )}

      {/* Draw individual landmark points */}
      {leftEyePoints.map((p: number[], i: number) => (
        <circle
          key={`le-${i}`}
          cx={p[0] * scaleX}
          cy={p[1] * scaleY}
          r={2}
          fill="rgba(0, 255, 0, 0.5)"
        />
      ))}
      {rightEyePoints.map((p: number[], i: number) => (
        <circle
          key={`re-${i}`}
          cx={p[0] * scaleX}
          cy={p[1] * scaleY}
          r={2}
          fill="rgba(0, 255, 0, 0.5)"
        />
      ))}
      {noseBridgePoints.map((p: number[], i: number) => (
        <circle
          key={`nb-${i}`}
          cx={p[0] * scaleX}
          cy={p[1] * scaleY}
          r={2}
          fill="rgba(255, 255, 0, 0.5)"
        />
      ))}
    </svg>
  );
}
