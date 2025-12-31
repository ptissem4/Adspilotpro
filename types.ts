
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
  // Variables Hardcore
  cpm?: string;
  cogs?: string; // Coût produit
  shippingCost?: string;
  retentionRate?: string; // % rachat
  productUrl?: string;
  brand_name?: string;
  // Champs spécifiques Audit Créatif
  auditType?: 'pnl' | 'creative';
  type?: 'ANDROMEDA' | 'CREATIVE' | 'ORACLE' | 'MERCURY' | 'ATLAS';
  name?: string;
  checklistScore?: number;
  creativeHookScore?: number;
  creativeOfferScore?: number;
  creativeDesirabilityScore?: number;
  creativeImageUrl?: string;
  // Champs spécifiques nouveaux modules
  loadTime?: string; // Mercury
  atcRate?: string; // Mercury
  abandonmentRate?: string; // Mercury
  stockLevel?: string; // Atlas
  leadTimeDays?: string; // Atlas
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
  // Champs Hardcore / Nouveaux modules
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
  firstName?: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: string;
  purchasedProducts?: string[]; 
  consultingValue?: number;
  isLocal?: boolean;
  // Données Business
  brand_name?: string;
  website_url?: string;
  shop_logo?: string;
  niche?: string;
  target_cpa?: number;
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

export interface LeadData {
  user: UserProfile;
  lastSimulation: SimulationHistory | null;
  status: 'new' | 'contacted' | 'closed' | 'buyer';
}

export interface Guide {
  id: string;
  title: string;
  description: string;
  price: string;
  icon: string;
  link: string;
}
