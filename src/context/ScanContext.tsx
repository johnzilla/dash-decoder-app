import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import type { ScanFlowState, Diagnosis, VisionAnalysisResult, Vehicle } from '@/types';

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
}

const ScanContext = createContext<ScanContextValue | null>(null);

export function ScanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(scanReducer, { step: 'idle' });

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <ScanContext.Provider value={{ state, dispatch, reset }}>
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
