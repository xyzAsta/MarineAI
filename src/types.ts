export type RiskSeverity = 'Low' | 'Moderate' | 'High' | 'Critical';
export type ReviewStatus = 'Pending review' | 'In review' | 'Approved' | 'Flagged';
export type DebrisCategory =
  | 'Plastic bottles'
  | 'Fishing nets'
  | 'Plastic bags'
  | 'Containers'
  | 'Foam'
  | 'Other visible debris';
export type ConditionClass = 'Intact' | 'Weathered' | 'Damaged' | 'Fragmented';
export type CleanupStatus = 'Pending' | 'In progress' | 'Completed';
export type CleanupPriority = 'Low' | 'Moderate' | 'High' | 'Critical';
export type TimeRange = '7d' | '30d' | '90d' | 'all';

export interface DebrisDetection {
  category: DebrisCategory;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ConditionClassification {
  className: ConditionClass;
  confidence: number;
}

export interface RiskFactor {
  name: string;
  weight: number;
  value: number;
  normalized: number;
  description: string;
}

export interface RiskAssessment {
  score: number;
  severity: RiskSeverity;
  factors: RiskFactor[];
  methodology: string;
}

export interface Observation {
  id: string;
  locationName: string;
  latitude: number | null;
  longitude: number | null;
  timestamp: string;
  debrisCategory: DebrisCategory;
  condition: ConditionClass;
  detectionConfidence: number;
  conditionConfidence: number;
  riskScore: number;
  severity: RiskSeverity;
  reviewStatus: ReviewStatus;
  notes: string;
  source: string;
  demoDataIndicator: string;
}

export interface MonitoringLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  risk: number;
  severity: RiskSeverity;
  category: DebrisCategory;
  status: ReviewStatus;
}

export interface CleanupTask {
  id: string;
  title: string;
  locationName: string;
  observationId?: string;
  priority: CleanupPriority;
  recommendedAction: string;
  assignedTeam: string;
  dueDate: string;
  status: CleanupStatus;
}

export interface DashboardMetrics {
  totalObservations: number;
  debrisDetections: number;
  highPriorityLocations: number;
  openCleanupTasks: number;
}

export interface ReportSummary {
  selectedRange: string;
  totalObservations: number;
  totalTasks: number;
  severityBreakdown: Record<RiskSeverity, number>;
  methodology: string;
}

export interface UserPreferences {
  displayName: string;
  email: string;
  theme: 'light' | 'dark';
  defaultRange: TimeRange;
  mapStyle: 'streets' | 'terrain';
  notifications: {
    dailyDigest: boolean;
    riskAlerts: boolean;
    reviewDue: boolean;
  };
  demoMode: boolean;
}
