// Vehicle types
export {
  SeveritySchema,
  VehicleSchema,
  VehicleGuessSchema,
  StoredVehicleSchema,
  type Severity,
  type Vehicle,
  type VehicleGuess,
  type StoredVehicle,
} from './vehicle.ts';

// Diagnosis types
export {
  FixStepSchema,
  WarningLightSchema,
  DiagnosisSchema,
  SEVERITY_CONFIG,
  type FixStep,
  type WarningLight,
  type Diagnosis,
} from './diagnosis.ts';

// API types
export {
  ImageQualityResultSchema,
  VisionAnalysisResultSchema,
  DiagnosisRequestSchema,
  type ImageQualityResult,
  type VisionAnalysisResult,
  type DiagnosisRequest,
  type ScanFlowState,
} from './api.ts';
