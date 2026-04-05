import { useEffect, useMemo } from 'react';

interface ScanningAnimationProps {
  imageFile: File;
  statusText?: string;
}

export function ScanningAnimation({
  imageFile,
  statusText = 'Analyzing your dashboard...',
}: ScanningAnimationProps) {
  const objectUrl = useMemo(() => URL.createObjectURL(imageFile), [imageFile]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        {/* Captured image */}
        <img
          src={objectUrl}
          alt="Captured dashboard"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Scanning overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent">
          {/* Animated scan line */}
          <div className="absolute left-0 right-0 h-1 bg-primary/60 animate-scan" />
        </div>

        {/* Corner brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary" />
        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary" />
      </div>

      {/* Status text */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground">{statusText}</p>
      </div>

    </div>
  );
}
