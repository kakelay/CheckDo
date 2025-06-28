export interface ChecklistItem {
  startedAt: Date;
  dueDate?: boolean;
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  category: string;
  priority: "low" | "medium" | "high";
  tags: string[];
  estimatedTime: number;
  notes: string;
  dependencies: string[];
  status: "todo" | "in-progress" | "review" | "completed" | "blocked";
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  attachments: Attachment[];
  comments: Comment[];
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  isDefault: boolean;
  isPublic: boolean;
  author: string;
  version: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  usageCount: number;
  rating: number;
  reviews: Review[];
  estimatedDuration: number;
  createdAt: Date;
  updatedAt: Date;
  items: ChecklistItem[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ChecklistProject {
  id: string;
  name: string;
  description: string;
  templateId: string;
  items: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
  status: "not-started" | "in-progress" | "completed" | "on-hold" | "cancelled";
  progress: number;
  dueDate?: Date;
  assignees: TeamMember[];
  owner: string;
  priority: "low" | "medium" | "high" | "critical";
  color: string;
  archived: boolean;
  milestones: Milestone[];
  timeEntries: TimeEntry[];
  notifications: Notification[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  joinedAt: Date;
  lastActive: Date;
}

export interface TimeEntry {
  id: string;
  itemId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  description: string;
  billable: boolean;
}

export interface Notification {
  id: string;
  type: string;
  message: string;
  itemId?: string;
  userId?: string;
  createdAt: Date;
  read: boolean;
}

export interface Analytics {
  totalProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalTimeSpent: number;
  averageCompletionTime: number;
  productivityScore: number;
  weeklyProgress: { week: string; completed: number; created: number }[];
  categoryBreakdown: { category: string; count: number; completed: number }[];
  teamPerformance: {
    member: string;
    tasksCompleted: number;
    timeSpent: number;
  }[];
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  mentions: string[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  items: string[];
}

export interface ChecklistState {
  templates: ChecklistTemplate[];
  projects: ChecklistProject[];
  activeChecklists: ChecklistItem[];
  selectedTemplate: string | null;
  selectedProject: string | null;
  currentUser: TeamMember | null;
  teamMembers: TeamMember[];
  notifications: Notification[];
  filter: {
    category: string;
    priority: string;
    completed: boolean | null;
    assignee: string;
    tags: string[];
    dateRange: { start: Date | null; end: Date | null };
    status: string;
  };
  view: "list" | "kanban" | "gantt";
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
    autoSave: boolean;
    defaultView: "list" | "kanban" | "gantt";
  };
}
