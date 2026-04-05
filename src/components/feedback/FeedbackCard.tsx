import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface FeedbackCardProps {
  sessionId: number;
}

type AccuracyRating = 'yes' | 'no' | 'unsure';
type NextAction = 'fix-myself' | 'mechanic' | 'ignore' | 'other';

export function FeedbackCard({ sessionId }: FeedbackCardProps) {
  const [accuracyRating, setAccuracyRating] = useState<AccuracyRating | null>(null);
  const [usefulnessRating, setUsefulnessRating] = useState<number | null>(null);
  const [nextAction, setNextAction] = useState<NextAction | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isComplete = accuracyRating !== null && usefulnessRating !== null && nextAction !== null;

  const handleSubmit = async () => {
    if (!isComplete) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accuracyRating,
          usefulnessRating,
          nextAction,
          comment: comment.trim() || undefined,
        }),
      });
      if (res.status === 201) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not submit feedback. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="mx-4 mb-6">
        <CardContent className="pt-6 text-center">
          <p className="text-lg font-medium text-green-700">Thanks for your feedback!</p>
          <p className="text-sm text-muted-foreground mt-1">Your input helps us improve DashDecoder.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-4 mb-6">
      <CardHeader>
        <CardTitle className="text-base">How did we do?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Question 1: Was this diagnosis accurate? */}
        <div className="space-y-2">
          <Label>Was this diagnosis accurate?</Label>
          <div className="flex gap-2 flex-wrap">
            {(['yes', 'no', 'unsure'] as AccuracyRating[]).map((val) => (
              <Button
                key={val}
                type="button"
                variant={accuracyRating === val ? 'default' : 'outline'}
                size="sm"
                onClick={() => setAccuracyRating(val)}
              >
                {val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'Unsure'}
              </Button>
            ))}
          </div>
        </div>

        {/* Question 2: How useful was this? (1-5 stars) */}
        <div className="space-y-2">
          <Label>How useful was this?</Label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setUsefulnessRating(star)}
                className="text-2xl leading-none focus:outline-none transition-colors"
                aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              >
                <span className={usefulnessRating !== null && star <= usefulnessRating ? 'text-yellow-400' : 'text-gray-300'}>
                  &#9733;
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: What will you do next? */}
        <div className="space-y-2">
          <Label>What will you do next?</Label>
          <div className="flex gap-2 flex-wrap">
            {([
              { value: 'fix-myself', label: 'Fix it myself' },
              { value: 'mechanic', label: 'Go to mechanic' },
              { value: 'ignore', label: 'Ignore it' },
              { value: 'other', label: 'Other' },
            ] as { value: NextAction; label: string }[]).map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant={nextAction === value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNextAction(value)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Optional free text */}
        <div className="space-y-1">
          <Label htmlFor="feedback-comment">Any additional comments? (optional)</Label>
          <textarea
            id="feedback-comment"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
            rows={3}
            placeholder="Any additional comments?"
            maxLength={500}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
        </div>

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isComplete || submitting}
          className="w-full"
        >
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}
