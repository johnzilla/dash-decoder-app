import { useState, useEffect, useCallback } from 'react';
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

export default function Scan() {
  const navigate = useNavigate();
  const { state, dispatch, reset } = useScan();
  const { storedVehicle, saveVehicle } = useVehicleStorage();

  // Start in capturing mode when page loads
  useEffect(() => {
    dispatch({ type: 'START_CAPTURE' });
    return () => reset();
  }, [dispatch, reset]);

  // Handle photo capture
  const handleCapture = useCallback(async (imageDataUrl: string) => {
    dispatch({ type: 'CAPTURE_COMPLETE', imageDataUrl });

    // Validate image quality
    let validationResult: ImageQualityResult;
    try {
      validationResult = await validateImageQuality(imageDataUrl);
    } catch (error) {
      dispatch({ type: 'ERROR', message: 'Failed to validate image', canRetry: true });
      return;
    }

    if (!validationResult.isValid) {
      dispatch({ type: 'VALIDATION_FAILED', imageDataUrl });
      return;
    }

    // Start AI analysis
    dispatch({ type: 'START_ANALYSIS', imageDataUrl });

    try {
      const analysis = await analyzeWarningLight(imageDataUrl);
      dispatch({ type: 'ANALYSIS_COMPLETE', imageDataUrl, analysis });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      dispatch({ type: 'ERROR', message, canRetry: true });
    }
  }, [dispatch]);

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
        vehicle
      );

      const diagnosis: Diagnosis = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        warningLight: state.analysis.warningLight,
        vehicle,
        severity: diagnosisData.severity,
        explanation: diagnosisData.explanation,
        safetyGuidance: diagnosisData.safetyGuidance,
        fixSteps: diagnosisData.fixSteps,
        imageDataUrl: state.imageDataUrl,
      };

      dispatch({ type: 'DIAGNOSIS_COMPLETE', diagnosis });
      navigate('/results', { state: { diagnosis } });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Diagnosis failed';
      dispatch({ type: 'ERROR', message, canRetry: true });
    }
  }, [dispatch, navigate, saveVehicle, state]);

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
        // Show validation feedback - need to re-validate for display
        return (
          <ValidationStep
            imageDataUrl={state.imageDataUrl}
            onRetake={handleRetake}
            onSubmitAnyway={() => {
              dispatch({ type: 'START_ANALYSIS', imageDataUrl: state.imageDataUrl });
              analyzeWarningLight(state.imageDataUrl).then((analysis) => {
                dispatch({ type: 'ANALYSIS_COMPLETE', imageDataUrl: state.imageDataUrl, analysis });
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
            imageDataUrl={state.imageDataUrl}
            statusText="Analyzing your dashboard..."
          />
        );

      case 'confirming-vehicle':
        return (
          <div className="w-full max-w-md mx-auto px-4">
            {/* Show captured image */}
            <div className="mb-4 aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={state.imageDataUrl}
                alt="Captured dashboard"
                className="w-full h-full object-cover"
              />
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
            imageDataUrl={state.imageDataUrl}
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

// Helper component for validation step
function ValidationStep({
  imageDataUrl,
  onRetake,
  onSubmitAnyway,
}: {
  imageDataUrl: string;
  onRetake: () => void;
  onSubmitAnyway: () => void;
}) {
  const [result, setResult] = useState<ImageQualityResult | null>(null);

  useEffect(() => {
    validateImageQuality(imageDataUrl).then(setResult);
  }, [imageDataUrl]);

  if (!result) return null;

  if (result.isValid) {
    // Shouldn't be here if valid, but handle gracefully
    onSubmitAnyway();
    return null;
  }

  return (
    <ImageQualityFeedback
      imageDataUrl={imageDataUrl}
      result={result}
      onRetake={onRetake}
      onSubmitAnyway={onSubmitAnyway}
    />
  );
}
