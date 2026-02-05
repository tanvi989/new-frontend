import { useState, useCallback, useRef, useEffect } from 'react';
import type { CameraState } from '@/types/face-validation';

interface UseCameraProps {
  onStreamReady?: (stream: MediaStream) => void;
}

export function useCamera({ onStreamReady }: UseCameraProps = {}) {
  const [cameraState, setCameraState] = useState<CameraState>('requesting');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const attachStream = useCallback(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, []);

  const requestCamera = useCallback(async () => {
    setCameraState('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;
      attachStream();
      setCameraState('granted');
      onStreamReady?.(stream);
    } catch (err) {
      console.error('Camera access error:', err);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setCameraState('denied');
          setError('Camera access was denied. Please allow camera access in your browser settings.');
        } else if (err.name === 'NotFoundError') {
          setCameraState('error');
          setError('No camera found. Please connect a camera and try again.');
        } else {
          setCameraState('error');
          setError('Failed to access camera. Please try again.');
        }
      }
    }
  }, [onStreamReady, attachStream]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Auto-request camera on mount
  useEffect(() => {
    requestCamera();
  }, []);

  // Re-attach stream when video element changes (component re-renders)
  useEffect(() => {
    if (cameraState === 'granted' && streamRef.current) {
      attachStream();
    }
  }, [cameraState, attachStream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    cameraState,
    error,
    videoRef,
    streamRef,
    requestCamera,
    stopCamera,
  };
}