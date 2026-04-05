import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { v4 as uuidv4 } from 'uuid';
import { useScan } from '@/context/ScanContext';
import { CameraPreview } from '@/components/camera';
import { ImageQualityFeedback } from '@/components/validation';
import { VehicleCard } from '@/components/vehicle';
import { ScanningAnimation } from '@/components/scan';
import { validateImageQuality } from '@/lib/validation/imageQuality';
import { analyzeWarningLight, generateDiagnosis } from '@/lib/api/openai';
import { useVehicleStorage } from '@/hooks/useVehicleStorage';
import { Button } from '@/components/ui/button';
import type { Vehicle, ImageQualityResult, Diagnosis } from '@/types';

/**
 * Create an object URL from a File for display in <img> elements.
 * The caller is responsible for revoking it when no longer needed.
 */
function fileToObjectUrl(file: File): string {
  return URL.createObjectURL(file);
}

export default function Scan() {
  const navigate = useNavigate();
  const { state, dispatch, reset, sessionId, setSessionId, variant, recordFunnelStep, getFunnelTimestamps } = useScan();
  const { storedVehicle, saveVehicle } = useVehicleStorage();

  // Start in capturing mode when page loads
  useEffect(() => {
    recordFunnelStep('camera');
    dispatch({ type: 'START_CAPTURE' });
    return () => reset();
  }, [dispatch, reset, recordFunnelStep]);

  // Handle photo capture — receives File from camera
  const handleCapture = useCallback(async (imageFile: File) => {
    recordFunnelStep('capture');
    dispatch({ type: 'CAPTURE_COMPLETE', imageFile });

    // Validate image quality using a data URL (imageQuality validator needs URL)
    let validationResult: ImageQualityResult;
    try {
      const dataUrl = await fileToDataUrl(imageFile);
      validationResult = await validateImageQuality(dataUrl);
    } catch (error) {
      dispatch({ type: 'ERROR', message: 'Failed to validate image', canRetry: true });
      return;
    }

    if (!validationResult.isValid) {
      dispatch({ type: 'VALIDATION_FAILED', imageFile });
      return;
    }

    // Start AI analysis
    dispatch({ type: 'START_ANALYSIS', imageFile });

    try {
      const result = await analyzeWarningLight(imageFile);
      if (result.sessionId) setSessionId(result.sessionId);
      dispatch({ type: 'ANALYSIS_COMPLETE', imageFile, analysis: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      dispatch({ type: 'ERROR', message, canRetry: true });
    }
  }, [dispatch, recordFunnelStep, setSessionId]);

  // Handle vehicle confirmation
  const handleVehicleConfirm = useCallback(async (vehicle: Vehicle) => {
    // Save vehicle for next time
    saveVehicle(vehicle);

    dispatch({ type: 'VEHICLE_CONFIRMED', vehicle });

    // Generate diagnosis
    if (state.step !== 'confirming-vehicle') return;

    try {
      const diagnosisData = await generateDiagnosis(
        state.analysis.warningLight,
        vehicle,
        sessionId ?? undefined
      );

      recordFunnelStep('diagnosis');

      // Fire-and-forget: send funnel timestamps, device data, and variant to backend
      if (sessionId) {
        fetch(`/api/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...getFunnelTimestamps(),
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            connectionType: 'connection' in navigator
              ? ((navigator as unknown as Record<string, Record<string, unknown>>).connection?.effectiveType as string) ?? null
              : null,
            variant,
          }),
        }).catch(() => { /* best-effort */ });
      }

      // Use an object URL from the captured file for display
      const imageDataUrl = fileToObjectUrl(state.imageFile);

      const diagnosis: Diagnosis = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        warningLight: state.analysis.warningLight,
        vehicle,
        severity: diagnosisData.severity,
        explanation: diagnosisData.explanation,
        safetyGuidance: diagnosisData.safetyGuidance,
        fixSteps: diagnosisData.fixSteps,
        imageDataUrl,
      };

      dispatch({ type: 'DIAGNOSIS_COMPLETE', diagnosis });
      navigate('/results', { state: { diagnosis, sessionId } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Diagnosis failed';
      dispatch({ type: 'ERROR', message, canRetry: true });
    }
  }, [dispatch, navigate, saveVehicle, state, sessionId, variant, recordFunnelStep, getFunnelTimestamps]);

  // Handle retake
  const handleRetake = useCallback(() => {
    dispatch({ type: 'START_CAPTURE' });
  }, [dispatch]);

  // Render based on current state
  const renderContent = () => {
    switch (state.step) {
      case 'idle':
      case 'capturing':
        return <CameraPreview onCapture={handleCapture} />;

      case 'validating':
        return (
          <ValidationStep
            imageFile={state.imageFile}
            onRetake={handleRetake}
            onSubmitAnyway={() => {
              dispatch({ type: 'START_ANALYSIS', imageFile: state.imageFile });
              analyzeWarningLight(state.imageFile).then((result) => {
                if (result.sessionId) setSessionId(result.sessionId);
                dispatch({ type: 'ANALYSIS_COMPLETE', imageFile: state.imageFile, analysis: result });
              }).catch((error) => {
                const message = error instanceof Error ? error.message : 'Analysis failed';
                dispatch({ type: 'ERROR', message, canRetry: true });
              });
            }}
          />
        );

      case 'analyzing':
        return (
          <ScanningAnimation
            imageFile={state.imageFile}
            statusText="Analyzing your dashboard..."
          />
        );

      case 'confirming-vehicle':
        return (
          <div className="w-full max-w-md mx-auto px-4">
            {/* Show captured image */}
            <div className="mb-4 aspect-video bg-muted rounded-lg overflow-hidden">
              <ImageFromFile file={state.imageFile} alt="Captured dashboard" />
            </div>

            {/* Show identified warning light */}
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Identified:</p>
              <p className="font-medium">{state.analysis.warningLight.name}</p>
              {state.analysis.warningLight.code && (
                <p className="text-sm text-muted-foreground">
                  Code: {state.analysis.warningLight.code}
                </p>
              )}
            </div>

            {/* Vehicle confirmation */}
            <VehicleCard
              vehicleGuess={state.analysis.vehicleGuess}
              storedVehicle={storedVehicle}
              onConfirm={handleVehicleConfirm}
            />
          </div>
        );

      case 'generating-diagnosis':
        return (
          <ScanningAnimation
            imageFile={state.imageFile}
            statusText="Generating diagnosis..."
          />
        );

      case 'error':
        return (
          <div className="w-full max-w-md mx-auto px-4 text-center">
            <div className="mb-4 p-4 bg-destructive/10 rounded-lg">
              <p className="text-destructive font-medium">Error</p>
              <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
            </div>
            {state.canRetry && (
              <Button onClick={handleRetake}>Try Again</Button>
            )}
          </div>
        );

      case 'complete':
        // Should have navigated to results already
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-4 py-4 flex items-center">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          &larr; Back
        </button>
        <h1 className="flex-1 text-center font-semibold">Scan Dashboard</h1>
        <div className="w-12" /> {/* Spacer for centering */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-4">
        {renderContent()}
      </main>
    </div>
  );
}

/**
 * Helper: convert a File to a data URL for imageQuality validation.
 * imageQuality.ts uses an <img> element which requires a URL string.
 */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Helper component: renders an <img> from a File using an object URL.
 * Revokes the object URL on cleanup to avoid memory leaks.
 */
function ImageFromFile({ file, alt }: { file: File; alt: string }) {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  return (
    <img
      src={objectUrl}
      alt={alt}
      className="w-full h-full object-cover"
    />
  );
}

// Helper component for validation step
function ValidationStep({
  imageFile,
  onRetake,
  onSubmitAnyway,
}: {
  imageFile: File;
  onRetake: () => void;
  onSubmitAnyway: () => void;
}) {
  const [result, setResult] = useState<ImageQualityResult | null>(null);

  useEffect(() => {
    fileToDataUrl(imageFile)
      .then((dataUrl) => validateImageQuality(dataUrl))
      .then(setResult);
  }, [imageFile]);

  if (!result) return null;

  if (result.isValid) {
    // Shouldn't be here if valid, but handle gracefully
    onSubmitAnyway();
    return null;
  }

  return (
    <ImageQualityFeedback
      imageFile={imageFile}
      result={result}
      onRetake={onRetake}
      onSubmitAnyway={onSubmitAnyway}
    />
  );
}
