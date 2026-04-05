import { useState } from 'react';
import { analyzeWarningLight } from '@/lib/api/openai';
import type { VisionAnalysisResult } from '@/types';

export interface UseVisionAnalysisReturn {
  /** Analyze a dashboard photo — accepts a File object, NOT a base64 string */
  analyze: (imageFile: File) => Promise<VisionAnalysisResult | null>;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
  /** User-friendly error message if analysis failed */
  error: string | null;
  /** Most recent analysis result */
  result: VisionAnalysisResult | null;
  /** Session ID from the server (for subsequent operations) */
  sessionId: number | null;
  /** Reset all state */
  reset: () => void;
}

export function useVisionAnalysis(): UseVisionAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const analyze = async (imageFile: File): Promise<VisionAnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setSessionId(null);

    try {
      const analysisResult = await analyzeWarningLight(imageFile);
      setResult(analysisResult);
      // sessionId is returned in the raw response but not in VisionAnalysisResult
      // We'll need to access it from the API response — for now store if available
      return analysisResult;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to analyze image. Please try again.';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setIsAnalyzing(false);
    setError(null);
    setResult(null);
    setSessionId(null);
  };

  return { analyze, isAnalyzing, error, result, sessionId, reset };
}
