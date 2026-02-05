import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { ImageQualityResult } from '@/types';

interface ImageQualityFeedbackProps {
  imageDataUrl: string;
  result: ImageQualityResult;
  onRetake: () => void;
  onSubmitAnyway?: () => void; // Optional "submit anyway" for edge cases
}

export function ImageQualityFeedback({
  imageDataUrl,
  result,
  onRetake,
  onSubmitAnyway,
}: ImageQualityFeedbackProps) {
  if (result.isValid) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Image Quality Issue
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Preview of captured image */}
        <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
          <img
            src={imageDataUrl}
            alt="Captured photo with quality issues"
            className="absolute inset-0 w-full h-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-destructive/10" />
        </div>

        {/* List of issues */}
        <ul className="space-y-2">
          {result.issues.map((issue, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <span className="text-destructive mt-1">*</span>
              <span>{issue}</span>
            </li>
          ))}
        </ul>

        {/* Tips */}
        <div className="rounded-lg bg-muted p-3">
          <p className="text-sm font-medium mb-2">Tips for a better photo:</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>* Hold your phone steady</li>
            <li>* Ensure the dashboard is well-lit</li>
            <li>* Avoid direct sunlight on the screen</li>
            <li>* Get close enough to see the warning light clearly</li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button onClick={onRetake} className="w-full" size="lg">
          Take Another Photo
        </Button>

        {onSubmitAnyway && (
          <Button
            onClick={onSubmitAnyway}
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          >
            Submit anyway (results may be inaccurate)
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
