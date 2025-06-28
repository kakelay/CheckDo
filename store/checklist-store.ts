import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  ChecklistItem,
  ChecklistTemplate,
  ChecklistState,
  ChecklistProject,
  TeamMember,
  TimeEntry,
  Notification,
  Analytics,
  Comment,
  Milestone,
} from "@/types/checklist";

interface ChecklistActions {
  // Template actions
  addTemplate: (
    template: Omit<
      ChecklistTemplate,
      "id" | "createdAt" | "updatedAt" | "usageCount" | "rating" | "reviews"
    >
  ) => void;
  updateTemplate: (id: string, updates: Partial<ChecklistTemplate>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string | null) => void;
  duplicateTemplate: (id: string) => void;
  exportTemplate: (id: string) => string;
  importTemplate: (templateData: string) => void;
  rateTemplate: (templateId: string, rating: number, comment: string) => void;

  // Project actions
  createProject: (
    name: string,
    description: string,
    templateId: string,
    options?: Partial<ChecklistProject>
  ) => void;
  updateProject: (id: string, updates: Partial<ChecklistProject>) => void;
  deleteProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  archiveProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  addMilestone: (projectId: string, milestone: Omit<Milestone, "id">) => void;
  updateMilestone: (
    projectId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ) => void;

  // Checklist item actions
  addChecklistItem: (
    item: Omit<
      ChecklistItem,
      "id" | "createdAt" | "updatedAt" | "attachments" | "comments"
    >
  ) => void;
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void;
  deleteChecklistItem: (id: string) => void;
  toggleChecklistItem: (id: string) => void;
  createChecklistFromTemplate: (templateId: string) => void;
  bulkUpdateItems: (ids: string[], updates: Partial<ChecklistItem>) => void;
  addComment: (itemId: string, comment: string) => void;
  updateItemStatus: (id: string, status: ChecklistItem["status"]) => void;
  assignItem: (id: string, assigneeId: string) => void;

  // Team management
  addTeamMember: (
    member: Omit<TeamMember, "id" | "joinedAt" | "lastActive">
  ) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;
  setCurrentUser: (user: TeamMember) => void;

  // Time tracking
  startTimer: (itemId: string, description?: string) => void;
  stopTimer: (itemId: string) => void;
  addTimeEntry: (entry: Omit<TimeEntry, "id">) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;

  // Notifications
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;

  // Filter and view actions
  setFilter: (filter: Partial<ChecklistState["filter"]>) => void;
  clearFilters: () => void;
  setView: (view: ChecklistState["view"]) => void;
  updateSettings: (settings: Partial<ChecklistState["settings"]>) => void;

  // Analytics and reporting
  getAnalytics: () => Analytics;
  getProjectStats: (projectId: string) => {
    total: number;
    completed: number;
    percentage: number;
    overdue: number;
  };
  getTeamStats: () => {
    member: string;
    tasksCompleted: number;
    timeSpent: number;
  }[];
  getCompletionStats: () => {
    total: number;
    completed: number;
    percentage: number;
  };
  exportData: () => string;
  importData: (data: string) => void;

  // Utility actions
  clearAllChecklists: () => void;
  searchTemplates: (query: string) => ChecklistTemplate[];
  searchProjects: (query: string) => ChecklistProject[];
  getDependentItems: (itemId: string) => ChecklistItem[];
  getBlockedItems: () => ChecklistItem[];
}

// Enhanced default templates with more comprehensive data
const defaultTemplates: ChecklistTemplate[] = [
  {
    id: "web-dev-template",
    name: "Full-Stack Web Development",
    description:
      "Complete workflow for building modern web applications with React, Node.js, and deployment",
    category: "Development",
    isDefault: true,
    isPublic: true,
    author: "System",
    version: "2.0",
    tags: ["web", "development", "fullstack", "react", "nodejs", "deployment"],
    difficulty: "intermediate",
    usageCount: 0,
    rating: 4.8,
    reviews: [],
    estimatedDuration: 2400, // 40 hours
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        title: "Project Planning & Requirements",
        description:
          "Define project scope, requirements, and technical specifications",
        completed: false,
        category: "Planning",
        priority: "high",
        tags: ["planning", "requirements", "documentation"],
        estimatedTime: 180,
        notes: "Include user stories, wireframes, and technical architecture",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: [],
        comments: [],
        startedAt: new Date(),
        dueDate: false,
      },
      {
        title: "Development Environment Setup",
        description:
          "Set up development tools, IDE, version control, and project structure",
        completed: false,
        category: "Setup",
        priority: "high",
        tags: ["setup", "environment", "tools"],
        estimatedTime: 120,
        notes: "Configure ESLint, Prettier, Git hooks, and CI/CD pipeline",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],

        dueDate: false,
      },
      {
        title: "Database Design & Setup",
        description:
          "Design database schema, set up database, and create migrations",
        completed: false,
        category: "Backend",
        priority: "high",
        tags: ["database", "schema", "migrations"],
        estimatedTime: 240,
        notes: "Consider data relationships, indexing, and performance",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "API Development",
        description:
          "Build RESTful APIs with authentication, validation, and error handling",
        completed: false,
        category: "Backend",
        priority: "high",
        tags: ["api", "backend", "authentication", "validation"],
        estimatedTime: 480,
        notes:
          "Implement JWT authentication, input validation, and comprehensive error handling",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Frontend Component Library",
        description: "Create reusable UI components following design system",
        completed: false,
        category: "Frontend",
        priority: "medium",
        tags: ["frontend", "components", "ui", "design-system"],
        estimatedTime: 360,
        notes: "Build component library with Storybook documentation",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "State Management Implementation",
        description: "Implement global state management with Redux/Zustand",
        completed: false,
        category: "Frontend",
        priority: "medium",
        tags: ["state", "redux", "zustand", "frontend"],
        estimatedTime: 240,
        notes:
          "Choose appropriate state management solution based on app complexity",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "User Authentication & Authorization",
        description:
          "Implement user registration, login, and role-based access control",
        completed: false,
        category: "Security",
        priority: "high",
        tags: ["auth", "security", "rbac"],
        estimatedTime: 300,
        notes:
          "Include password reset, email verification, and social login options",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Testing Implementation",
        description:
          "Write unit tests, integration tests, and end-to-end tests",
        completed: false,
        category: "Testing",
        priority: "high",
        tags: ["testing", "jest", "cypress", "quality"],
        estimatedTime: 360,
        notes: "Aim for 80%+ code coverage with meaningful tests",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Performance Optimization",
        description:
          "Optimize bundle size, implement caching, lazy loading, and CDN",
        completed: false,
        category: "Optimization",
        priority: "medium",
        tags: ["performance", "optimization", "caching", "cdn"],
        estimatedTime: 180,
        notes: "Use Lighthouse audits and performance monitoring tools",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Security Hardening",
        description:
          "Implement security best practices, HTTPS, CSP, and vulnerability scanning",
        completed: false,
        category: "Security",
        priority: "high",
        tags: ["security", "https", "csp", "vulnerability"],
        estimatedTime: 240,
        notes: "Follow OWASP security guidelines and conduct security audit",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Documentation & API Docs",
        description:
          "Create comprehensive documentation, API docs, and deployment guides",
        completed: false,
        category: "Documentation",
        priority: "medium",
        tags: ["documentation", "api-docs", "readme"],
        estimatedTime: 180,
        notes:
          "Include setup instructions, API reference, and troubleshooting guide",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
      {
        title: "Deployment & DevOps",
        description:
          "Set up production deployment, monitoring, and CI/CD pipeline",
        completed: false,
        category: "DevOps",
        priority: "high",
        tags: ["deployment", "cicd", "monitoring", "devops"],
        estimatedTime: 300,
        notes:
          "Include staging environment, automated deployments, and monitoring setup",
        dependencies: [],
        status: "todo",
        id: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        startedAt: new Date(),
        attachments: [],
        comments: [],
        dueDate: false,
      },
    ],
  },
  // Add more comprehensive templates...
];

const defaultTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "John Do1",
    email: "john@example.com",
    role: "owner",
    joinedAt: new Date(),
    lastActive: new Date(),
  },
  {
    id: "user-2",
    name: "John Doe2",
    email: "john@example.com",
    role: "owner",
    joinedAt: new Date(),
    lastActive: new Date(),
  },
];

export const useChecklistStore = create<ChecklistState & ChecklistActions>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: defaultTemplates,
      projects: [],
      activeChecklists: [],
      selectedTemplate: null,
      selectedProject: null,
      currentUser: defaultTeamMembers[0],
      teamMembers: defaultTeamMembers,
      notifications: [],
      filter: {
        category: "",
        priority: "",
        completed: null,
        assignee: "",
        tags: [],
        dateRange: { start: null, end: null },
        status: "",
      },
      view: "list",
      settings: {
        theme: "light",
        notifications: true,
        autoSave: true,
        defaultView: "list",
      },

      // Template actions
      addTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates,
            {
              ...template,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              usageCount: 0,
              rating: 0,
              reviews: [],
            },
          ],
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((template) =>
            template.id === id
              ? { ...template, ...updates, updatedAt: new Date() }
              : template
          ),
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((template) => template.id !== id),
          selectedTemplate:
            state.selectedTemplate === id ? null : state.selectedTemplate,
        })),

      selectTemplate: (id) => set({ selectedTemplate: id }),

      duplicateTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return;

        const duplicated = {
          ...template,
          id: crypto.randomUUID(),
          name: `${template.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          usageCount: 0,
          isDefault: false,
          rating: 0,
          reviews: [],
        };

        set((state) => ({
          templates: [...state.templates, duplicated],
        }));
      },

      exportTemplate: (id) => {
        const template = get().templates.find((t) => t.id === id);
        if (!template) return "";
        return JSON.stringify(template, null, 2);
      },

      importTemplate: (templateData) => {
        try {
          const template = JSON.parse(templateData);
          const imported = {
            ...template,
            id: crypto.randomUUID(),
            createdAt: new Date(),
            updatedAt: new Date(),
            usageCount: 0,
            isDefault: false,
            rating: 0,
            reviews: [],
          };

          set((state) => ({
            templates: [...state.templates, imported],
          }));
        } catch (error) {
          console.error("Failed to import template:", error);
        }
      },

      rateTemplate: (templateId, rating, comment) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const review = {
          id: crypto.randomUUID(),
          author: currentUser.name,
          rating,
          comment,
          createdAt: new Date(),
        };

        set((state) => ({
          templates: state.templates.map((template) => {
            if (template.id === templateId) {
              const newReviews = [...template.reviews, review];
              const newRating =
                newReviews.reduce((sum, r) => sum + r.rating, 0) /
                newReviews.length;
              return {
                ...template,
                reviews: newReviews,
                rating: Math.round(newRating * 10) / 10,
              };
            }
            return template;
          }),
        }));
      },

      // Project actions
      createProject: (name, description, templateId, options = {}) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        const projectItems = template.items.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: [],
          comments: [],
        }));

        const project: ChecklistProject = {
          id: crypto.randomUUID(),
          name,
          description,
          templateId,
          items: projectItems,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "not-started",
          progress: 0,
          assignees: [],
          owner: get().currentUser?.id || "",
          priority: "medium",
          color: "#3B82F6",
          archived: false,
          milestones: [],
          timeEntries: [],
          notifications: [],
          ...options,
        };

        set((state) => ({
          projects: [...state.projects, project],
          templates: state.templates.map((t) =>
            t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        }));
      },

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          selectedProject:
            state.selectedProject === id ? null : state.selectedProject,
        })),

      selectProject: (id) => set({ selectedProject: id }),

      archiveProject: (id) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, archived: true, updatedAt: new Date() }
              : project
          ),
        })),

      duplicateProject: (id) => {
        const project = get().projects.find((p) => p.id === id);
        if (!project) return;

        const duplicated = {
          ...project,
          id: crypto.randomUUID(),
          name: `${project.name} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "not-started" as const,
          progress: 0,
          items: project.items.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
            completed: false,
            status: "todo" as const,
            createdAt: new Date(),
            updatedAt: new Date(),
            comments: [],
            attachments: [],
          })),
        };

        set((state) => ({
          projects: [...state.projects, duplicated],
        }));
      },

      addMilestone: (projectId, milestone) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  milestones: [
                    ...project.milestones,
                    {
                      ...milestone,
                      id: crypto.randomUUID(),
                    },
                  ],
                  updatedAt: new Date(),
                }
              : project
          ),
        })),

      updateMilestone: (projectId, milestoneId, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  milestones: project.milestones.map((milestone) =>
                    milestone.id === milestoneId
                      ? { ...milestone, ...updates }
                      : milestone
                  ),
                  updatedAt: new Date(),
                }
              : project
          ),
        })),

      // Enhanced checklist item actions
      addChecklistItem: (item) =>
        set((state) => ({
          activeChecklists: [
            ...state.activeChecklists,
            {
              ...item,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
              attachments: [],
              comments: [],
            },
          ],
        })),

      updateChecklistItem: (id, updates) =>
        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === id
                ? { ...item, ...updates, updatedAt: new Date() }
                : item
            ),
          })),
        })),

      deleteChecklistItem: (id) =>
        set((state) => ({
          activeChecklists: state.activeChecklists.filter(
            (item) => item.id !== id
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.filter((item) => item.id !== id),
          })),
        })),

      toggleChecklistItem: (id) => {
        const now = new Date();
        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            item.id === id
              ? {
                  ...item,
                  completed: !item.completed,
                  status: !item.completed ? "completed" : "todo",
                  completedAt: !item.completed ? now : undefined,
                  updatedAt: now,
                }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    completed: !item.completed,
                    status: !item.completed ? "completed" : "todo",
                    completedAt: !item.completed ? now : undefined,
                    updatedAt: now,
                  }
                : item
            ),
          })),
        }));
      },

      createChecklistFromTemplate: (templateId) => {
        const template = get().templates.find((t) => t.id === templateId);
        if (!template) return;

        const newItems = template.items.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          attachments: [],
          comments: [],
        }));

        set((state) => ({
          activeChecklists: [...state.activeChecklists, ...newItems],
          selectedTemplate: templateId,
          templates: state.templates.map((t) =>
            t.id === templateId ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        }));
      },

      bulkUpdateItems: (ids, updates) =>
        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            ids.includes(item.id)
              ? { ...item, ...updates, updatedAt: new Date() }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              ids.includes(item.id)
                ? { ...item, ...updates, updatedAt: new Date() }
                : item
            ),
          })),
        })),

      addComment: (itemId, comment) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const newComment: Comment = {
          id: crypto.randomUUID(),
          text: comment,
          author: currentUser.name,
          createdAt: new Date(),
          mentions: [],
        };

        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  comments: [...item.comments, newComment],
                  updatedAt: new Date(),
                }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    comments: [...item.comments, newComment],
                    updatedAt: new Date(),
                  }
                : item
            ),
          })),
        }));
      },

      updateItemStatus: (id, status) => {
        const now = new Date();
        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  completed: status === "completed",
                  completedAt: status === "completed" ? now : item.completedAt,
                  startedAt:
                    status === "in-progress" && !item.startedAt
                      ? now
                      : item.startedAt,
                  updatedAt: now,
                }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === id
                ? {
                    ...item,
                    status,
                    completed: status === "completed",
                    completedAt:
                      status === "completed" ? now : item.completedAt,
                    startedAt:
                      status === "in-progress" && !item.startedAt
                        ? now
                        : item.startedAt,
                    updatedAt: now,
                  }
                : item
            ),
          })),
        }));
      },

      assignItem: (id, assigneeId) =>
        set((state) => ({
          activeChecklists: state.activeChecklists.map((item) =>
            item.id === id
              ? { ...item, assignee: assigneeId, updatedAt: new Date() }
              : item
          ),
          projects: state.projects.map((project) => ({
            ...project,
            items: project.items.map((item) =>
              item.id === id
                ? { ...item, assignee: assigneeId, updatedAt: new Date() }
                : item
            ),
          })),
        })),

      // Team management
      addTeamMember: (member) =>
        set((state) => ({
          teamMembers: [
            ...state.teamMembers,
            {
              ...member,
              id: crypto.randomUUID(),
              joinedAt: new Date(),
              lastActive: new Date(),
            },
          ],
        })),

      updateTeamMember: (id, updates) =>
        set((state) => ({
          teamMembers: state.teamMembers.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        })),

      removeTeamMember: (id) =>
        set((state) => ({
          teamMembers: state.teamMembers.filter((member) => member.id !== id),
        })),

      setCurrentUser: (user) => set({ currentUser: user }),

      // Time tracking
      startTimer: (itemId, description = "") => {
        const { currentUser } = get();
        if (!currentUser) return;

        const timeEntry: TimeEntry = {
          id: crypto.randomUUID(),
          itemId,
          userId: currentUser.id,
          startTime: new Date(),
          duration: 0,
          description,
          billable: false,
        };

        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            timeEntries: [...project.timeEntries, timeEntry],
          })),
        }));
      },

      stopTimer: (itemId) => {
        const now = new Date();
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            timeEntries: project.timeEntries.map((entry) => {
              if (entry.itemId === itemId && !entry.endTime) {
                const duration = Math.floor(
                  (now.getTime() - entry.startTime.getTime()) / 60000
                );
                return { ...entry, endTime: now, duration };
              }
              return entry;
            }),
          })),
        }));
      },

      addTimeEntry: (entry) =>
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            timeEntries: [
              ...project.timeEntries,
              { ...entry, id: crypto.randomUUID() },
            ],
          })),
        })),

      updateTimeEntry: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            timeEntries: project.timeEntries.map((entry) =>
              entry.id === id ? { ...entry, ...updates } : entry
            ),
          })),
        })),

      deleteTimeEntry: (id) =>
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            timeEntries: project.timeEntries.filter((entry) => entry.id !== id),
          })),
        })),

      // Notifications
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: crypto.randomUUID(),
              createdAt: new Date(),
            },
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((notification) =>
            notification.id === id
              ? { ...notification, read: true }
              : notification
          ),
        })),

      markAllNotificationsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((notification) => ({
            ...notification,
            read: true,
          })),
        })),

      deleteNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter(
            (notification) => notification.id !== id
          ),
        })),

      // Filter and view actions
      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
        })),

      clearFilters: () =>
        set({
          filter: {
            category: "",
            priority: "",
            completed: null,
            assignee: "",
            tags: [],
            dateRange: { start: null, end: null },
            status: "",
          },
        }),

      setView: (view) => set({ view }),

      updateSettings: (settings) =>
        set((state) => ({
          settings: { ...state.settings, ...settings },
        })),

      // Analytics and reporting
      getAnalytics: () => {
        const { projects, activeChecklists } = get();
        const allItems = [
          ...activeChecklists,
          ...projects.flatMap((p) => p.items),
        ];

        const totalProjects = projects.length;
        const completedProjects = projects.filter(
          (p) => p.status === "completed"
        ).length;
        const totalTasks = allItems.length;
        const completedTasks = allItems.filter((item) => item.completed).length;

        const totalTimeSpent = projects
          .flatMap((p) => p.timeEntries)
          .reduce((sum, entry) => sum + entry.duration, 0);

        const averageCompletionTime =
          completedTasks > 0 ? totalTimeSpent / completedTasks : 0;

        const productivityScore =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Weekly progress (mock data for now)
        const weeklyProgress = [
          { week: "Week 1", completed: 12, created: 15 },
          { week: "Week 2", completed: 18, created: 20 },
          { week: "Week 3", completed: 15, created: 18 },
          { week: "Week 4", completed: 22, created: 25 },
        ];

        const categoryBreakdown = allItems.reduce((acc, item) => {
          const existing = acc.find((cat) => cat.category === item.category);
          if (existing) {
            existing.count++;
            if (item.completed) existing.completed++;
          } else {
            acc.push({
              category: item.category,
              count: 1,
              completed: item.completed ? 1 : 0,
            });
          }
          return acc;
        }, [] as { category: string; count: number; completed: number }[]);

        const teamPerformance = get().teamMembers.map((member) => ({
          member: member.name,
          tasksCompleted: allItems.filter(
            (item) => item.assignee === member.id && item.completed
          ).length,
          timeSpent: projects
            .flatMap((p) => p.timeEntries)
            .filter((entry) => entry.userId === member.id)
            .reduce((sum, entry) => sum + entry.duration, 0),
        }));

        return {
          totalProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          totalTimeSpent,
          averageCompletionTime,
          productivityScore,
          weeklyProgress,
          categoryBreakdown,
          teamPerformance,
        };
      },

      getProjectStats: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project)
          return { total: 0, completed: 0, percentage: 0, overdue: 0 };

        const total = project.items.length;
        const completed = project.items.filter((item) => item.completed).length;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;
        const overdue = project.items.filter(
          (item) =>
            item.dueDate &&
            new item.dueDate < new Date() &&
            !item.completed
        ).length;

        return { total, completed, percentage, overdue };
      },

      getTeamStats: () => {
        const { projects, teamMembers } = get();
        const allItems = projects.flatMap((p) => p.items);

        return teamMembers.map((member) => ({
          member: member.name,
          tasksCompleted: allItems.filter(
            (item) => item.assignee === member.id && item.completed
          ).length,
          timeSpent: projects
            .flatMap((p) => p.timeEntries)
            .filter((entry) => entry.userId === member.id)
            .reduce((sum, entry) => sum + entry.duration, 0),
        }));
      },

      getCompletionStats: () => {
        const { activeChecklists, projects } = get();
        // combine standalone checklist items and all project items
        const allItems = [
          ...activeChecklists,
          ...projects.flatMap((p) => p.items),
        ];

        const total = allItems.length;
        const completed = allItems.filter((item) => item.completed).length;
        const percentage =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        return { total, completed, percentage };
      },

      exportData: () => {
        const state = get();
        return JSON.stringify(
          {
            templates: state.templates,
            projects: state.projects,
            teamMembers: state.teamMembers,
            settings: state.settings,
          },
          null,
          2
        );
      },

      importData: (data) => {
        try {
          const imported = JSON.parse(data);
          set((state) => ({
            ...state,
            ...imported,
          }));
        } catch (error) {
          console.error("Failed to import data:", error);
        }
      },

      // Utility actions
      clearAllChecklists: () => set({ activeChecklists: [] }),

      searchTemplates: (query) => {
        const { templates } = get();
        const lowercaseQuery = query.toLowerCase();

        return templates.filter(
          (template) =>
            template.name.toLowerCase().includes(lowercaseQuery) ||
            template.description.toLowerCase().includes(lowercaseQuery) ||
            template.category.toLowerCase().includes(lowercaseQuery) ||
            template.tags.some((tag) =>
              tag.toLowerCase().includes(lowercaseQuery)
            )
        );
      },

      searchProjects: (query) => {
        const { projects } = get();
        const lowercaseQuery = query.toLowerCase();

        return projects.filter(
          (project) =>
            project.name.toLowerCase().includes(lowercaseQuery) ||
            project.description.toLowerCase().includes(lowercaseQuery)
        );
      },

      getDependentItems: (itemId) => {
        const { activeChecklists, projects } = get();
        const allItems = [
          ...activeChecklists,
          ...projects.flatMap((p) => p.items),
        ];

        return allItems.filter((item) => item.dependencies.includes(itemId));
      },

      getBlockedItems: () => {
        const { activeChecklists, projects } = get();
        const allItems = [
          ...activeChecklists,
          ...projects.flatMap((p) => p.items),
        ];

        return allItems.filter((item) => {
          return item.dependencies.some((depId) => {
            const dependency = allItems.find((dep) => dep.id === depId);
            return dependency && !dependency.completed;
          });
        });
      },
    }),
    {
      name: "checklist-storage",
    }
  )
);
