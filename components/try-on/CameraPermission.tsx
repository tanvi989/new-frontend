import { Camera, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CameraState } from '@/types/face-validation';

interface CameraPermissionProps {
  cameraState: CameraState;
  error: string | null;
  onRequestCamera: () => void;
}

export function CameraPermission({ cameraState, error, onRequestCamera }: CameraPermissionProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Icon */}
        <div className="mx-auto w-24 h-24 rounded-full bg-medical-light flex items-center justify-center mb-8">
          {cameraState === 'denied' || cameraState === 'error' ? (
            <AlertCircle className="w-12 h-12 text-destructive" />
          ) : (
            <Camera className="w-12 h-12 text-primary" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-foreground mb-3">
          {cameraState === 'denied' 
            ? 'Camera Access Required'
            : cameraState === 'error'
              ? 'Camera Error'
              : 'Virtual Try-On'}
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {cameraState === 'denied' || cameraState === 'error' 
            ? error
            : 'To provide accurate glasses fitting and PD measurement, we need access to your camera. Your privacy is protected - no images are stored or transmitted.'}
        </p>

        {/* Trust indicators */}
        {cameraState === 'requesting' && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Secure & Private</span>
          </div>
        )}

        {/* Action button */}
        <Button 
          onClick={onRequestCamera}
          size="lg"
          className="w-full max-w-xs bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
        >
          {cameraState === 'denied' || cameraState === 'error' 
            ? 'Try Again'
            : 'Enable Camera'}
        </Button>

        {/* Help text for denied state */}
        {cameraState === 'denied' && (
          <p className="mt-6 text-sm text-muted-foreground">
            Click the camera icon in your browser's address bar to allow access.
          </p>
        )}
      </div>
    </div>
  );
}