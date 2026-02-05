export interface FaceLandmarks {
  leftEye: { x: number; y: number; z: number };
  rightEye: { x: number; y: number; z: number };
  noseTip: { x: number; y: number; z: number };
  leftEar: { x: number; y: number; z: number };
  rightEar: { x: number; y: number; z: number };
  chin: { x: number; y: number; z: number };
  forehead: { x: number; y: number; z: number };
  leftEyeUpper: { x: number; y: number; z: number };
  leftEyeLower: { x: number; y: number; z: number };
  rightEyeUpper: { x: number; y: number; z: number };
  rightEyeLower: { x: number; y: number; z: number };
  faceLeft: { x: number; y: number; z: number };
  faceRight: { x: number; y: number; z: number };
}

export interface ValidationCheck {
  id: string;
  label: string;
  passed: boolean;
  message: string;
  severity: 'pass' | 'warning' | 'fail';
}

export interface FaceValidationState {
  faceDetected: boolean;
  faceCount: number;
  headTilt: number; // degrees, 0 is straight
  headRotation: number; // degrees, 0 is forward
  faceWidthPercent: number; // percentage of frame width
  brightness: number; // 0-255
  contrast: number; // 0-1
  leftEyeOpen: boolean;
  rightEyeOpen: boolean;
  leftEyeAR: number; // eye aspect ratio for debugging
  rightEyeAR: number; // eye aspect ratio for debugging
  /** True when MediaPipe iris (468/473) pupil positions are valid – required for correct lens placement */
  pupilsDetected: boolean;
  landmarks: FaceLandmarks | null;
  allChecksPassed: boolean;
  validationChecks: ValidationCheck[];
}

export interface CreditCardValidation {
  cardDetected: boolean;
  cardFullyVisible: boolean;
  cardInPosition: boolean;
  cardTilted: boolean;
}

export interface PDMeasurement {
  leftPupilX: number;
  rightPupilX: number;
  pdPixels: number;
  pdMillimeters: number;
  faceWidthPixels: number;
}

export interface FrameOffsets {
  offsetX: number;  // Horizontal offset in pixels (positive = right)
  offsetY: number;  // Vertical offset in pixels (positive = down)
  scaleAdjust: number; // Scale multiplier (1.0 = no change)
  rotationAdjust: number; // Rotation adjustment in degrees
}

export interface GlassesFrame {
  id: string;
  name: string;
  imageUrl: string;
  category: 'rectangular' | 'round' | 'aviator' | 'cat-eye' | 'square' | 'vto';
  color: string;
  width: number; // frame width in mm
  lensWidth: number; // lens width in mm
  lensHeight?: number; // lens height in mm (for vertical alignment)
  noseBridge: number; // nose bridge in mm
  templeLength: number; // temple length in mm
  offsets?: FrameOffsets; // Per-frame fine-tune offsets
}

export type CameraState = 'requesting' | 'granted' | 'denied' | 'error';

export interface ApiMeasurements {
  pd: number;
  pd_left: number;
  pd_right: number;
  nose_bridge_left: number;
  nose_bridge_right: number;
  face_width: number;
  face_height: number;
  face_ratio: number;
}

export interface ApiScale {
  mm_per_pixel: number;
  iris_diameter_px: number;
}

export interface ApiDebug {
  pd_error_mm: number;
  expected_accuracy: string;
}

export interface ApiLandmarks {
  scale: ApiScale;
  mm: ApiMeasurements;
  face_shape: string;
  debug: ApiDebug;
}

export interface RegionPoint {
  x: number;
  y: number;
}

export interface ApiRegionPoints {
  left_eye_center: RegionPoint;
  right_eye_center: RegionPoint;
  left_eyebrow: RegionPoint;
  right_eyebrow: RegionPoint;
  nose_tip: RegionPoint;
  left_ear: RegionPoint;
  right_ear: RegionPoint;
  chin: RegionPoint;
}

export interface ApiLandmarksResponse {
  success: boolean;
  landmarks: ApiLandmarks;
}

export interface CapturedData {
  imageDataUrl: string;
  processedImageDataUrl: string; // After glasses removal if needed
  /** Optional cropped preview used for thumbnails/product pages (doesn't affect overlay alignment). */
  croppedPreviewDataUrl?: string;
  glassesDetected: boolean;
  landmarks: FaceLandmarks;
  measurements: ApiMeasurements;
  faceShape: string;
  apiResponse?: ApiLandmarksResponse; // Full API response
  timestamp: number;
}