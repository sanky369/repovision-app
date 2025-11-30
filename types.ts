export interface RepoAnalysis {
  name: string;
  description: string;
  architecturePrompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  FETCHING_REPO = 'FETCHING_REPO',
  ANALYZING_ARCH = 'ANALYZING_ARCH',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface GenerationResult {
  imageUrl: string;
  analysisSummary: string;
}