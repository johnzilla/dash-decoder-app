import type { Diagnosis } from '@/types';
import { SeverityBadge } from './SeverityBadge';
import { DiagnosisExplanation } from './DiagnosisExplanation';
import { FixSteps } from './FixSteps';
import { Disclaimer } from './Disclaimer';

interface DiagnosisResultProps {
  diagnosis: Diagnosis;
  onScanAnother?: () => void;
}

export function DiagnosisResult({ diagnosis, onScanAnother }: DiagnosisResultProps) {
  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      {/* Captured image preview */}
      <div className="mb-6">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden">
          <img
            src={diagnosis.imageDataUrl}
            alt="Captured dashboard warning light"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Severity at top (per CONTEXT.md) */}
      <div className="flex justify-center mb-8">
        <SeverityBadge severity={diagnosis.severity} size="lg" />
      </div>

      {/* Explanation and safety guidance */}
      <DiagnosisExplanation
        warningLight={diagnosis.warningLight}
        vehicle={diagnosis.vehicle}
        explanation={diagnosis.explanation}
        safetyGuidance={diagnosis.safetyGuidance}
      />

      {/* DIY fix steps */}
      <div className="mt-8">
        <FixSteps steps={diagnosis.fixSteps} />
      </div>

      {/* Scan another button */}
      {onScanAnother && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={onScanAnother}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium
                       hover:bg-primary/90 transition-colors"
          >
            Scan Another Light
          </button>
        </div>
      )}

      {/* Disclaimer at bottom (per CONTEXT.md) */}
      <Disclaimer />
    </div>
  );
}
