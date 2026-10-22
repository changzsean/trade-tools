export interface GrowthMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  status: "open" | "in_progress" | "completed";
  category: "learning" | "community" | "resource" | "help";
}

export interface LearningProgress {
  pathTitle: string;
  currentLesson: string;
  progressPercent: number;
  nextAction: string;
}

export interface GrowthSummary {
  userName: string;
  level: number;
  dayInCommunity: number;
  growthValue: number;
  growthTarget: number;
  rank: string;
  influence: number;
  learningHours: number;
  streakDays: number;
  metrics: GrowthMetric[];
  tasks: DailyTask[];
  learning: LearningProgress;
}
