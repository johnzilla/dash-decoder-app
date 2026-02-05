import { useEffect } from 'react';
import { useCamera } from '@/hooks/useCamera';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CaptureButton } from './CaptureButton';

interface CameraPreviewProps {
  onCapture: (imageDataUrl: string) => void;
  onError?: (error: string) => void;
}

export function CameraPreview({ onCapture, onError }: CameraPreviewProps) {
  const { videoRef, error, isActive, startCamera, stopCamera, capturePhoto } = useCamera();

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  const handleCapture = () => {
    const photo = capturePhoto();
    if (photo) {
      stopCamera();
      onCapture(photo);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 p-4">
        <Alert variant="destructive">
          <AlertTitle>Camera Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => startCamera()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Video preview */}
      <div className="relative aspect-[4/3] bg-black rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Loading state */}
        {!isActive && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-pulse text-white">Starting camera...</div>
          </div>
        )}
      </div>

      {/* Capture button */}
      {isActive && (
        <div className="mt-4 flex justify-center">
          <CaptureButton onClick={handleCapture} />
        </div>
      )}

      {/* Guidance text */}
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Point your camera at the dashboard warning light
      </p>
    </div>
  );
}
