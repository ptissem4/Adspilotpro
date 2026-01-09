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
  creativeFormats: string[];
  dataSource: 'manual' | 'api';
  email?: string;
  projectName?: string;
  notes?: string;
  cpm?: string;
  cogs?: string;
  shippingCost?: string;
  retentionRate?: string;
  productUrl?: string;
  brand_name?: string;
  auditType?: 'pnl' | 'creative';
  type?: 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS';
  name?: string;
  checklistScore?: number;
  creativeHookScore?: number;
  creativeOfferScore?: number;
  creativeDesirabilityScore?: number;
  creativeImageUrl?: string;
  loadTime?: string;
  atcRate?: string;
  abandonmentRate?: string;
  stockLevel?: string;
  leadTimeDays?: string;
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
  andromedaOptimized: boolean;
  creativeDiversityScore: number;
  realNetProfit?: number;
  breakevenRoas?: number;
  estimatedCtr?: number;
  calculatedLtv?: number;
  conversionScore?: number;
  frictionRate?: number;
  scalingSolidarity?: number;
  daysToStockout?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  purchasedProducts?: string[]; 
  consultingValue?: number;
  brand_name?: string;
  website_url?: string;
  shop_logo?: string;
  niche?: string;
  target_cpa?: number;
  has_andromeda_access?: boolean; // Accès Masterclass
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
  type: 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS';
}

export interface NicheData {
  id: string;
  label: string;
  benchmarkRoas: number;
  benchmarkCtr: number;
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  progress: number;
  lessons: Lesson[];
  isLocked: boolean;
}

// Added missing LeadData interface used by AdminDashboard and AdminService
export interface LeadData {
  user: UserProfile;
  lastSimulation: any | null;
  status: 'new' | 'waitlist' | 'contacted' | 'buyer' | 'closed';
}