import type { WarningLight, Vehicle } from '@/types';

interface DiagnosisExplanationProps {
  warningLight: WarningLight;
  vehicle: Vehicle;
  explanation: string;
  safetyGuidance: string;
}

export function DiagnosisExplanation({
  warningLight,
  vehicle,
  explanation,
  safetyGuidance,
}: DiagnosisExplanationProps) {
  return (
    <div className="space-y-6">
      {/* What was identified */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Warning Light Identified</h2>
        <div className="bg-muted rounded-lg p-4">
          <p className="font-medium text-lg">{warningLight.name}</p>
          {warningLight.code && (
            <p className="text-sm text-muted-foreground mt-1">
              Code: {warningLight.code}
            </p>
          )}
          <p className="text-sm text-muted-foreground mt-1">
            Vehicle: {vehicle.year} {vehicle.make} {vehicle.model}
          </p>
        </div>
      </section>

      {/* Plain English explanation (DIAG-01) */}
      <section>
        <h2 className="text-lg font-semibold mb-2">What This Means</h2>
        <p className="text-muted-foreground leading-relaxed">{explanation}</p>
      </section>

      {/* Safety guidance (DIAG-03) */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Can I Keep Driving?</h2>
        <div className="bg-muted rounded-lg p-4">
          <p className="leading-relaxed">{safetyGuidance}</p>
        </div>
      </section>
    </div>
  );
}
