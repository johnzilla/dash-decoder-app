/**
 * React hook for Vision API analysis
 *
 * Provides interface for:
 * - Analyzing dashboard photos to identify warning lights
 * - Managing loading and error states
 * - Storing analysis results for UI display
 */

import { useState } from 'react';
import { analyzeWarningLight } from '@/lib/api/openai';
import type { VisionAnalysisResult } from '@/types';

export interface UseVisionAnalysisReturn {
  /** Analyze a dashboard photo */
  analyze: (imageDataUrl: string) => Promise<VisionAnalysisResult | null>;
  /** Whether analysis is currently in progress */
  isAnalyzing: boolean;
  /** User-friendly error message if analysis failed */
  error: string | null;
  /** Most recent analysis result */
  result: VisionAnalysisResult | null;
  /** Reset all state (for retrying or starting over) */
  reset: () => void;
}

/**
 * Hook for analyzing dashboard photos with Vision API
 *
 * @example
 * ```tsx
 * const { analyze, isAnalyzing, error, result } = useVisionAnalysis();
 *
 * const handleAnalyze = async (imageDataUrl: string) => {
 *   const result = await analyze(imageDataUrl);
 *   if (result) {
 *     console.log('Warning light:', result.warningLight.name);
 *     console.log('Vehicle guess:', result.vehicleGuess);
 *   }
 * };
 * ```
 */
export function useVisionAnalysis(): UseVisionAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VisionAnalysisResult | null>(null);

  const analyze = async (imageDataUrl: string): Promise<VisionAnalysisResult | null> => {
    // Reset previous state
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysisResult = await analyzeWarningLight(imageDataUrl);
      setResult(analysisResult);
      return analysisResult;
    } catch (err) {
      // Extract user-friendly error message
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
  };

  return {
    analyze,
    isAnalyzing,
    error,
    result,
    reset,
  };
}
