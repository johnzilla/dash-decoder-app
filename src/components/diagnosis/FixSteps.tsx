import type { FixStep } from '@/types';

interface FixStepsProps {
  steps: FixStep[];
}

export function FixSteps({ steps }: FixStepsProps) {
  if (steps.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-semibold mb-2">DIY Fix Steps</h2>
        <p className="text-muted-foreground">
          This issue typically requires professional diagnosis. We recommend
          visiting a qualified mechanic.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">DIY Fix Steps</h2>
      <ol className="space-y-4">
        {steps.map((step) => (
          <li key={step.step} className="flex gap-4">
            {/* Step number circle */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              {step.step}
            </div>

            {/* Step content */}
            <div className="flex-1 pt-1">
              <p className="font-medium">{step.instruction}</p>
              {step.notes && (
                <p className="text-sm text-muted-foreground mt-1">
                  Note: {step.notes}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
