
export interface CalculatorInputs {
  pmv: string;
  margin: string;
  targetRoas: string;
  targetVolume: string;
  currentCpa: string;
  currentRoas: string;
  currentBudget: string;
  currentCtr: string;
  emqScore: string;
  niche: string;
  ltv: string;
  creativeFormats: string[]; // Nouveau champ Andromeda
  dataSource: 'manual' | 'api';
  email?: string;
  projectName?: string;
  notes?: string;
}

export interface NicheData {
  id: string;
  label: string;
  benchmarkRoas: number;
  benchmarkCtr: number;
}

export interface CalculationResults {
  roasThreshold: number;
  maxCpa: number;
  targetCpa: number;
  minWeeklyBudget: number;
  budgetGap: number;
  nicheRoas: number;
  nicheCtr: number;
  roasDiffBenchmark: number;
  roasDiffTarget: number;
  cpaStatus: 'good' | 'warning' | 'bad';
  realMaxCpa: number;
  learningPhaseBudget: number;
  recommendationType: 'reduce_cpa' | 'scale' | 'optimize';
  idealLearningCpa: number;
  cpaReductionPercent: number;
  ventesActuellesHebdo: number;
  ventesCiblesHebdo: number;
  ventesManquantes: number;
  margeInitiale: number;
  provisionParClient: number;
  tresorerieLatenteHebdo: number;
  andromedaOptimized: boolean; // Flag Andromeda
  creativeDiversityScore: number; // 0-100
}

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  purchasedProducts?: string[]; 
  consultingValue?: number;
  // Added isLocal to track offline demo sessions
  isLocal?: boolean;
}

export interface Guide {
  id: string;
  title: string;
  price: string;
  description: string;
  link: string;
  icon: string;
  recommendationTrigger: 'signal' | 'ltv' | 'scaling';
}

export interface SimulationHistory {
  id: string;
  auditId: string;
  userId: string;
  name: string;
  date: string;
  inputs: CalculatorInputs;
  results: CalculationResults;
  verdictLabel: string;
  notes?: string;
}

export interface LeadData {
  user: UserProfile;
  lastSimulation: SimulationHistory | null; // Changé en optionnel
  status: 'new' | 'contacted' | 'closed';
}
