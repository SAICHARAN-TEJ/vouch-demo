/**
 * Vouch core domain model.
 *
 * These types are the shared contract between the demo path
 * (Demo Controls → Mock providers) and the future production path
 * (Android sensors / on-device camera). Both paths emit the SAME
 * event structures, so the Context Engine and UI never need to change
 * when real hardware is introduced (PRD §23, §24, §48).
 */

// ---------------------------------------------------------------------------
// Enumerations
// ---------------------------------------------------------------------------

/** The kind of manoeuvre inferred from motion signals. */
export type ManoeuvreType =
  | "normal"
  | "lateral_manoeuvre"
  | "hard_braking"
  | "sudden_swerve";

/** Categories of road hazard tracked as shared intelligence. */
export type RoadEventType = "pothole" | "speed_breaker" | "waterlogging" | "debris";

/** Aggregation confidence tier for a road event (PRD §22). */
export type RoadEventStatus = "possible" | "probable" | "confirmed";

/** The contextual conclusion of the engine (PRD §3, §21). */
export type Verdict =
  | "likely_justified"
  | "high_confidence_likely_justified"
  | "context_unclear";

/** Motion of a detected object relative to the rider (rear camera). */
export type RelativeMotion = "approaching" | "receding" | "static";

/** What the rear camera perceived. */
export type DetectedObject = "vehicle" | "obstacle" | "none";

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

// ---------------------------------------------------------------------------
// Sensor inputs
// ---------------------------------------------------------------------------

/**
 * Normalised motion sample. In the demo these come from MockSensorProvider;
 * in production they come from a fused accelerometer + gyroscope stream.
 */
export interface MotionData {
  /** Lateral acceleration in g (side-to-side; swerve indicator). */
  lateralG: number;
  /** Longitudinal acceleration in g (negative = braking). */
  longitudinalG: number;
  /** Yaw rate in deg/s (rotation about the vertical axis). */
  gyroZ: number;
  /** Speed in km/h at the moment of the sample. */
  speed: number;
  /** Epoch milliseconds. */
  timestamp: number;
}

/** A discrete motion event surfaced by a SensorProvider. */
export interface SensorEvent {
  type: ManoeuvreType;
  motion: MotionData;
  /** Detector confidence that this was a genuine manoeuvre (0..1). */
  confidence: number;
}

// ---------------------------------------------------------------------------
// Camera inputs
// ---------------------------------------------------------------------------

/**
 * A single rear-camera detection. Only metadata is retained — never frames
 * (PRD §25 privacy principle). In the demo these come from MockCameraProvider.
 */
export interface CameraDetection {
  object: DetectedObject;
  /** Estimated distance to the object in metres. */
  relativeDistance: number;
  relativeMotion: RelativeMotion;
  confidence: number;
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Road events (shared intelligence)
// ---------------------------------------------------------------------------

export interface RoadEvent {
  id: string;
  type: RoadEventType;
  latitude: number;
  longitude: number;
  /** Aggregate confidence 0..1. */
  confidence: number;
  status: RoadEventStatus;
  /** Number of times this hazard has been reported. */
  reports: number;
  /** Number of distinct riders who contributed reports. */
  riders: number;
  /** Human-readable time first detected, e.g. "09:42". */
  firstDetected: string;
  /** Human-readable time last confirmed, e.g. "10:18". */
  lastConfirmed: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Context Engine
// ---------------------------------------------------------------------------

/** Which of the three investigative signals fired. */
export interface ContextSignals {
  motion: boolean;
  roadContext: boolean;
  rearApproach: boolean;
}

/** Everything the Context Engine needs to reach a verdict (PRD §20). */
export interface ContextInput {
  sensorEvent: SensorEvent;
  location: GeoPoint;
  /** Known road events near the rider (already spatially relevant). */
  nearbyRoadEvents: RoadEvent[];
  cameraDetection: CameraDetection | null;
  timestamp: number;
}

/** The engine's output (PRD §20 example JSON). */
export interface ContextResult {
  eventType: ManoeuvreType;
  /** Machine tags of the contributing context, e.g. ["pothole_detected"]. */
  context: string[];
  confidence: number;
  verdict: Verdict;
  explanation: string;
  signals: ContextSignals;
  /** The specific nearby hazard that provided road context, if any. */
  nearbyEvent: RoadEvent | null;
  /** The camera detection that provided surrounding context, if any. */
  cameraDetection: CameraDetection | null;
  /** Distance in metres to the nearby hazard, if one was found. */
  hazardDistanceM: number | null;
}

// ---------------------------------------------------------------------------
// Persisted rider events & trips
// ---------------------------------------------------------------------------

export interface RiderEvent {
  id: string;
  tripId: string;
  riderId: string;
  eventType: ManoeuvreType;
  latitude: number;
  longitude: number;
  motionData: MotionData;
  contextResult: ContextResult;
  confidence: number;
  createdAt: string;
}

export interface Rider {
  id: string;
  name: string;
  vouchScore: number;
  scoreFactors: ScoreFactor[];
  totalDistance: number;
  createdAt: string;
}

export interface Trip {
  id: string;
  riderId: string;
  startTime: string;
  endTime: string | null;
  distance: number;
  scoreChange: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Vouch Score
// ---------------------------------------------------------------------------

export type ScoreFactorKey =
  | "context_aware"
  | "smooth_acceleration"
  | "safe_braking"
  | "unexplained_manoeuvres";

export interface ScoreFactor {
  key: ScoreFactorKey;
  label: string;
  delta: number;
}
