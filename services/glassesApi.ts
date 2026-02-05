const API_BASE = 'https://api.multifolks.aonetech.in';

// Session management - simple incrementing IDs stored in sessionStorage
function getSessionIds(): { guestId: string; sessionId: string } {
  let guestId = sessionStorage.getItem('guest_id');
  let sessionId = sessionStorage.getItem('session_id');
  
  if (!guestId) {
    guestId = String(Date.now());
    sessionStorage.setItem('guest_id', guestId);
  }
  
  if (!sessionId) {
    sessionId = String(Date.now());
    sessionStorage.setItem('session_id', sessionId);
  }
  
  return { guestId, sessionId };
}

export interface GlassesDetectResponse {
  success: boolean;
  glasses_detected: boolean;
  confidence: number;
  edited_image_base64?: string;
}

export interface GlassesRemoveResponse {
  success: boolean;
  edited_image_base64: string;
}

export interface LandmarkMeasurements {
  pd: number;
  pd_left: number;
  pd_right: number;
  nose_bridge_left: number;
  nose_bridge_right: number;
  face_width: number;
  face_height: number;
  face_ratio: number;
}

export interface Scale {
  mm_per_pixel: number;
  iris_diameter_px: number;
}

export interface DebugInfo {
  pd_error_mm: number;
  expected_accuracy: string;
}

export interface LandmarksDetectResponse {
  success: boolean;
  landmarks: {
    scale: Scale;
    mm: LandmarkMeasurements;
    face_shape: string;
    debug: DebugInfo;
  };
}

export interface SelectFrameResponse {
  success: boolean;
  message?: string;
  frame_image?: string;
  fitting_height?: number;
}

async function dataURLtoBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export async function detectGlasses(imageDataUrl: string): Promise<GlassesDetectResponse> {
  try {
    const { guestId, sessionId } = getSessionIds();
    const blob = await dataURLtoBlob(imageDataUrl);
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');

    const response = await fetch(`${API_BASE}/glasses/detect?guest_id=${guestId}&session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to detect glasses: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Glasses detection API error:', error);
    // Return default response if API fails (CORS or network issue)
    return { success: true, glasses_detected: false, confidence: 0 };
  }
}

export async function removeGlasses(imageDataUrl: string): Promise<GlassesRemoveResponse> {
  try {
    const { guestId, sessionId } = getSessionIds();
    const blob = await dataURLtoBlob(imageDataUrl);
    const formData = new FormData();
    formData.append('image', blob, 'capture.jpg');

    const response = await fetch(`${API_BASE}/glasses/remove?guest_id=${guestId}&session_id=${sessionId}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to remove glasses: ${response.status}`);
    }

    // Check content type - API might return image directly or JSON
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('image')) {
      // API returns image directly - convert to base64
      const imageBlob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          // Remove data URL prefix to get just base64
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageBlob);
      });
      return { success: true, edited_image_base64: base64 };
    }

    // Otherwise parse as JSON
    return response.json();
  } catch (error) {
    console.error('Glasses removal API error:', error);
    throw new Error('Failed to remove glasses from image');
  }
}

export async function detectLandmarks(imageDataUrl: string): Promise<LandmarksDetectResponse> {
  try {
    const { guestId, sessionId } = getSessionIds();
    const blob = await dataURLtoBlob(imageDataUrl);
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');

    const response = await fetch(`${API_BASE}/landmarks/detect?guest_id=${guestId}&session_id=${sessionId}`, {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to detect landmarks: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Landmarks detection API error:', error);
    throw new Error('CORS error: The API server needs to allow requests from this domain. Please configure CORS on your backend.');
  }
}

export async function selectFrame(
  frameImageDataUrl: string,
  frameId: string,
  frameName: string,
  dimensions: string
): Promise<SelectFrameResponse> {
  try {
    const { guestId, sessionId } = getSessionIds();
    const blob = await dataURLtoBlob(frameImageDataUrl);
    const formData = new FormData();
    formData.append('guest_id', guestId);
    formData.append('session_id', sessionId);
    formData.append('frame_id', frameId);
    formData.append('frame_name', frameName);
    formData.append('dimensions', dimensions);
    formData.append('selected_frame_image', blob, 'frame_selection.jpg');

    const response = await fetch(`${API_BASE}/virtual-tryon/select-frame`, {
      method: 'POST',
      headers: { 'accept': 'application/json' },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to save frame selection: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('Select frame API error:', error);
    throw new Error('Failed to save frame selection');
  }
}