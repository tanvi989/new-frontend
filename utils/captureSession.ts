import type { CapturedData } from '@/types/face-validation';

/** Session key for Get My Fit / VTO capture data (image, PD, face width, landmarks, etc.) */
export const GET_MY_FIT_CAPTURE_SESSION_KEY = 'getMyFitCaptureSession';

export function saveCaptureSession(data: CapturedData): void {
  try {
    sessionStorage.setItem(GET_MY_FIT_CAPTURE_SESSION_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('Failed to save capture session:', e);
  }
}

export function getCaptureSession(): CapturedData | null {
  try {
    const raw = sessionStorage.getItem(GET_MY_FIT_CAPTURE_SESSION_KEY);
    return raw ? (JSON.parse(raw) as CapturedData) : null;
  } catch {
    return null;
  }
}

export function clearCaptureSession(): void {
  try {
    sessionStorage.removeItem(GET_MY_FIT_CAPTURE_SESSION_KEY);
  } catch {}
}
