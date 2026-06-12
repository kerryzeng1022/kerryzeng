export type ScoreBand = "low" | "medium" | "high";

export type BasicInfo = {
  nickname: string;
  ageRange: string;
  status: string;
  occupation: string;
  professionalBackground?: string;
  yearsExperience?: string;
  credentials?: string;
  city: string;
  education: string;
  biggestConfusion: string;
  incomeGoal: string;
};

export type Dimension = {
  id: string;
  name: string;
  order: number;
};

export type Question = {
  id: string;
  dimension: string;
  dimensionName: string;
  text: string;
  reverse: boolean;
  responseMode?: "agreement" | "action" | "feeling" | "choiceAB";
  source: string;
};

export type Questionnaire = {
  scale: Array<{ value: number; label: string }>;
  dimensions: Dimension[];
  questions: Question[];
};

export type AnswerMap = Record<string, number>;

export type CareerCalibrationKind =
  | "interest"
  | "capability"
  | "entry"
  | "condition";

export type CareerCalibrationQuestion = {
  id: string;
  kind: CareerCalibrationKind;
  text: string;
  tags: string[];
  reverse?: boolean;
};

export type CareerCalibrationProfile = {
  interests: Record<string, number>;
  capabilities: Record<string, number>;
  constraints: Record<string, number>;
  completionRate: number;
};

export type CareerMatchStatus = "strong" | "promising" | "explore" | "conditional";

export type CareerScoreBreakdown = {
  workStyle: number;
  capabilityEvidence: number;
  interest: number;
  feasibility: number;
  conflictPenalty: number;
};

export type CareerRoleMatch = {
  roleId: string;
  roleTitle: string;
  familyId: string;
  familyName: string;
  score: number;
  status: CareerMatchStatus;
  scoreBreakdown: CareerScoreBreakdown;
  why: string[];
  entryRequirements: string[];
  gaps: string[];
  adjacentRoles: string[];
  validationActions: string[];
};

export type CareerFamilyMatch = {
  familyId: string;
  familyName: string;
  score: number;
  roleTitles: string[];
  reason: string;
};

export type CareerMatches = {
  families: CareerFamilyMatch[];
  roles: CareerRoleMatch[];
  conditionalRoles: CareerRoleMatch[];
  evidenceNotice: string;
  matchingVersion: 2;
};

export type DimensionScore = {
  dimension: string;
  dimensionName: string;
  score: number;
  scoreBand: ScoreBand;
};

export type AnalysisAsset = {
  dimension: string;
  dimensionName: string;
  scoreBand: ScoreBand;
  title: string;
  baseAnalysis: string;
  strengths: string[];
  risks: string[];
  suggestions: string[];
  suitableEnvironments: string[];
  avoidEnvironments: string[];
};

export type CareerRule = {
  trackName: string;
  conditions: string[];
  reason: string;
  suitableRoles: string[];
  entryPath: string;
  risks: string;
  validationMethod: string;
};

export type CombinationRule = {
  id: string;
  name: string;
  conditions: string[];
  insight: string;
  suitableTracks: string[];
  risk: string;
  suggestion: string;
};

export type ReportContext = {
  basicInfo: BasicInfo;
  scores: DimensionScore[];
  topDimensions: DimensionScore[];
  lowDimensions: DimensionScore[];
  matchedAnalyses: AnalysisAsset[];
  matchedCombinations: CombinationRule[];
  matchedCareerTracks: Array<CareerRule & { matchScore: number }>;
  careerCalibration?: CareerCalibrationProfile;
  careerMatches?: CareerMatches;
  generatedAt: string;
};

export type CareerReport = {
  cover: {
    title: string;
    subtitle: string;
    userProfileSummary: string;
    generatedAt: string;
  };
  oneSentenceProfile: string;
  plainLanguageProfile?: {
    chooseEnvironment: string[];
    manageLosses: string[];
    oneLine: string;
  };
  overallSummary: string;
  dimensionAnalyses: Array<{
    dimension: string;
    dimensionName: string;
    score: number;
    scoreLevel: string;
    baseConclusion: string;
    personalizedInsight: string;
    workplaceManifestation: string;
    strengths: string[];
    risks: string[];
    suggestions: string[];
    userConclusion?: string;
    plainExplanation?: string;
    suitableWork?: string[];
    unsuitableWork?: string[];
    nextValidation?: string;
  }>;
  coreStrengthCombinations: Array<{
    title: string;
    relatedDimensions: string[];
    analysis: string;
    suitableScenarios: string[];
    riskReminder: string;
    plainSummary?: string;
    whyItMatters?: string;
    validationTask?: string;
    personalityAnalysis?: string;
    careerFitAnalysis?: string;
    roleFitDetails?: string[];
    workStyleFit?: string;
    growthPotential?: string;
    mismatchWarning?: string;
    validationPlan?: string;
  }>;
  careerRiskZones: Array<{
    title: string;
    reason: string;
    typicalScenarios: string[];
    avoidSuggestion: string;
    concreteScenarios?: string[];
    likelyProblems?: string[];
    uniqueAvoidAction?: string;
  }>;
  recommendedCareerTracks: Array<{
    trackName: string;
    matchScore: number;
    whySuitable: string;
    suitableRoles: string[];
    entryPath: string;
    first90DaysValidation: string;
    riskAndCorrection: string;
    plainWhy?: string;
    firstStepAction?: string;
    validationSteps?: string[];
    riskCorrectionSteps?: string[];
    matchLabel?: string;
    matchStatus?: CareerMatchStatus;
    scoreBreakdown?: CareerScoreBreakdown;
    evidenceNotice?: string;
    roleDetails?: CareerRoleMatch[];
  }>;
  notRecommendedEnvironments: Array<{
    environment: string;
    reason: string;
    howToIdentify: string;
    avoidRoles?: string[];
    likelyProblems?: string[];
    howToCheck?: string[];
  }>;
  ninetyDayActionPlan: {
    month1: string;
    month2: string;
    month3: string;
    weeklyActions: string[];
    weeklyDetails?: string[];
  };
  finalAdvice: string;
  upsellToAgent: {
    title: string;
    description: string;
    suggestedQuestions: string[];
  };
};

export type StoredReport = {
  id: string;
  paid: boolean;
  createdAt: string;
  basicInfo: BasicInfo;
  selectedQuestionIds?: string[];
  calibrationAnswers?: AnswerMap;
  careerCalibration?: CareerCalibrationProfile;
  careerMatches?: CareerMatches;
  matchingVersion?: 2;
  scores: DimensionScore[];
  report: CareerReport;
  chineseCharCount: number;
  duplicateAudit?: {
    passed: boolean;
    scannedSegments: number;
    checkedAt: string;
  };
  contentVersion?: number;
  aiEnhancedAt?: string;
  aiEnhancementFailedAt?: string;
};
