import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react';
import type { ScanFlowState, Diagnosis, VisionAnalysisResult, Vehicle } from '@/types';

type FunnelStep = 'camera' | 'capture' | 'diagnosis' | 'feedback';
interface FunnelTimestamps {
  funnelCameraAt: string | null;
  funnelCaptureAt: string | null;
  funnelDiagnosisAt: string | null;
  funnelFeedbackAt: string | null;
}

type ScanAction =
  | { type: 'START_CAPTURE' }
  | { type: 'CAPTURE_COMPLETE'; imageFile: File }
  | { type: 'VALIDATION_FAILED'; imageFile: File }
  | { type: 'START_ANALYSIS'; imageFile: File }
  | { type: 'ANALYSIS_COMPLETE'; imageFile: File; analysis: VisionAnalysisResult }
  | { type: 'VEHICLE_CONFIRMED'; vehicle: Vehicle }
  | { type: 'DIAGNOSIS_COMPLETE'; diagnosis: Diagnosis }
  | { type: 'ERROR'; message: string; canRetry: boolean }
  | { type: 'RESET' };

function scanReducer(state: ScanFlowState, action: ScanAction): ScanFlowState {
  switch (action.type) {
    case 'START_CAPTURE':
      return { step: 'capturing' };
    case 'CAPTURE_COMPLETE':
      return { step: 'validating', imageFile: action.imageFile };
    case 'VALIDATION_FAILED':
      return { step: 'validating', imageFile: action.imageFile };
    case 'START_ANALYSIS':
      return { step: 'analyzing', imageFile: action.imageFile };
    case 'ANALYSIS_COMPLETE':
      return {
        step: 'confirming-vehicle',
        imageFile: action.imageFile,
        analysis: action.analysis,
      };
    case 'VEHICLE_CONFIRMED':
      if (state.step !== 'confirming-vehicle') return state;
      return {
        step: 'generating-diagnosis',
        imageFile: state.imageFile,
        vehicle: action.vehicle,
        warningLight: state.analysis.warningLight,
      };
    case 'DIAGNOSIS_COMPLETE':
      return { step: 'complete', diagnosis: action.diagnosis };
    case 'ERROR':
      return { step: 'error', message: action.message, canRetry: action.canRetry };
    case 'RESET':
      return { step: 'idle' };
    default:
      return state;
  }
}

interface ScanContextValue {
  state: ScanFlowState;
  dispatch: React.Dispatch<ScanAction>;
  reset: () => void;
  sessionId: number | null;
  setSessionId: (id: number) => void;
  variant: string;
  recordFunnelStep: (step: FunnelStep) => void;
  getFunnelTimestamps: () => FunnelTimestamps;
}

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, { step: 'idle' });
  const [sessionId, setSessionIdState] = useState<number | null>(null);
  const funnelRef = useRef<Record<string, string>>({});

  // Parse ?v= variant from URL on mount
  const variant = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('v') || 'organic';
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSessionIdState(null);
    funnelRef.current = {};
  }, []);

  const setSessionId = useCallback((id: number) => {
    setSessionIdState(id);
  }, []);

  const recordFunnelStep = useCallback((step: FunnelStep) => {
    if (!funnelRef.current[step]) {
      funnelRef.current[step] = new Date().toISOString();
    }
  }, []);

  const getFunnelTimestamps = useCallback((): FunnelTimestamps => ({
    funnelCameraAt: funnelRef.current['camera'] || null,
    funnelCaptureAt: funnelRef.current['capture'] || null,
    funnelDiagnosisAt: funnelRef.current['diagnosis'] || null,
    funnelFeedbackAt: funnelRef.current['feedback'] || null,
  }), []);

  return (
    <ScanContext.Provider value={{
      state, dispatch, reset,
      sessionId, setSessionId, variant,
      recordFunnelStep, getFunnelTimestamps,
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within ScanProvider');
  }
  return context;
}
