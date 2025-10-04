// 用户相关类型定义
export interface User {
  id: string;
  email: string;
  role: 'student' | 'parent' | 'teacher';
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  grade: number;
  total_points: number;
  level: number;
  parent_id?: string;
  created_at: string;
}

// 学习相关类型定义
export interface GameLevel {
  id: string;
  name: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'vocabulary' | 'grammar' | 'listening' | 'reading' | 'writing';
  unlock_points: number;
  max_stars: number;
  maxScore: number;
  points: number;
  totalQuestions: number;
  estimatedTime: number;
  locked: boolean;
  content?: any;
}

export interface GameProgress {
  id: string;
  student_id: string;
  level_id: string;
  levelId?: string; // 兼容字段
  stars_earned: number;
  stars?: number; // 兼容字段
  points_earned: number;
  score?: number; // 兼容字段
  completed_at: string;
  attempts: number;
}

export interface Assessment {
  id: string;
  student_id: string;
  listening_score: number;
  speaking_score: number;
  reading_score: number;
  writing_score: number;
  overall_level: string;
  completed_at: string;
}

export interface LearningReport {
  id: string;
  student_id: string;
  weekly_stats: any;
  monthly_stats: any;
  recommendations: any;
  generated_at: string;
}

// 游戏相关类型定义
export interface GameQuestion {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string;
  type: 'multiple_choice' | 'fill_blank' | 'match' | 'spell';
}

export interface GameSession {
  level_id: string;
  questions: GameQuestion[];
  current_question: number;
  score: number;
  stars: number;
  start_time: Date;
}

// 统计数据类型定义
export interface LearningStats {
  total_points: number;
  completed_levels: number;
  study_days: number;
  average_score: number;
  weekly_progress: number[];
  category_scores: {
    vocabulary: number;
    grammar: number;
    listening: number;
    reading: number;
  };
}