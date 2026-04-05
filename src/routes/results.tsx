import { useLocation, useNavigate } from 'react-router';
import { DiagnosisResult } from '@/components/diagnosis';
import { FeedbackCard } from '@/components/feedback/FeedbackCard';
import type { Diagnosis } from '@/types';

interface LocationState {
  diagnosis: Diagnosis;
  sessionId?: number;
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { diagnosis, sessionId } = (location.state as LocationState) || {};

  // If no diagnosis in state, redirect to home
  if (!diagnosis) {
    navigate('/', { replace: true });
    return null;
  }

  const handleScanAnother = () => {
    navigate('/scan');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 py-4 flex items-center border-b">
        <button
          onClick={() => navigate('/')}
          className="text-muted-foreground hover:text-foreground"
        >
          &larr; Home
        </button>
        <h1 className="flex-1 text-center font-semibold">Diagnosis Results</h1>
        <div className="w-12" />
      </header>

      {/* Results */}
      <DiagnosisResult
        diagnosis={diagnosis}
        onScanAnother={handleScanAnother}
      />

      {/* Feedback */}
      {sessionId !== undefined && (
        <FeedbackCard sessionId={sessionId} />
      )}
    </div>
  );
}
