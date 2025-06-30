import { create } from "zustand"
import { persist } from "zustand/middleware"
import   {
  User,
  Group,
  Invitation,
  Task,
  Project,
  Sprint,
  Epic,
  Board,
  AppState,
  TaskFilter,
  WorklogEntry,
  Comment,
  ReportData,
} from "@/types/checklist"
 

interface JiraActions {
  // User Management
  addUser: (user: Omit<User, "id" | "joinedAt" | "lastActive">) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  setCurrentUser: (user: User) => void

  // Group Management
  createGroup: (group: Omit<Group, "id" | "createdAt" | "updatedAt">) => void
  updateGroup: (id: string, updates: Partial<Group>) => void
  deleteGroup: (id: string) => void
  addUserToGroup: (groupId: string, userId: string) => void
  removeUserFromGroup: (groupId: string, userId: string) => void

  // Invitation Management
  sendInvitation: (invitation: Omit<Invitation, "id" | "invitedAt" | "token" | "status">) => void
  acceptInvitation: (token: string) => void
  declineInvitation: (token: string) => void
  cancelInvitation: (id: string) => void

  // Project Management
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  selectProject: (id: string | null) => void
  addProjectMember: (projectId: string, userId: string, role: "admin" | "member" | "viewer") => void
  removeProjectMember: (projectId: string, userId: string) => void

  // Task Management
  createTask: (
    task: Omit<Task, "id" | "key" | "createdAt" | "updatedAt" | "comments" | "attachments" | "worklog">,
  ) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  assignTask: (taskId: string, assigneeId: string) => void
  updateTaskStatus: (taskId: string, status: Task["status"]) => void
  addComment: (taskId: string, comment: string) => void
  addWorklog: (taskId: string, worklog: Omit<WorklogEntry, "id" | "createdAt">) => void
  watchTask: (taskId: string, userId: string) => void
  unwatchTask: (taskId: string, userId: string) => void

  // Sprint Management
  createSprint: (sprint: Omit<Sprint, "id" | "createdAt" | "updatedAt">) => void
  updateSprint: (id: string, updates: Partial<Sprint>) => void
  deleteSprint: (id: string) => void
  startSprint: (id: string) => void
  completeSprint: (id: string) => void
  addTaskToSprint: (sprintId: string, taskId: string) => void
  removeTaskFromSprint: (sprintId: string, taskId: string) => void

  // Epic Management
  createEpic: (epic: Omit<Epic, "id" | "key" | "createdAt" | "updatedAt">) => void
  updateEpic: (id: string, updates: Partial<Epic>) => void
  deleteEpic: (id: string) => void
  addTaskToEpic: (epicId: string, taskId: string) => void
  removeTaskFromEpic: (epicId: string, taskId: string) => void

  // Board Management
  createBoard: (board: Omit<Board, "id" | "createdAt" | "updatedAt">) => void
  updateBoard: (id: string, updates: Partial<Board>) => void
  deleteBoard: (id: string) => void
  selectBoard: (id: string | null) => void

  // Filter and Search
  setFilter: (filter: Partial<TaskFilter>) => void
  clearFilters: () => void
  searchTasks: (query: string) => Task[]

  // Loading States
  setLoading: (key: string, loading: boolean) => void

  // Reports
  generateReport: (period: "month" | "year", date: Date, projectId: string) => ReportData
  exportReport: (data: ReportData, format: "pdf" | "excel" | "csv") => string

  // Analytics
  getProjectStats: (projectId: string) => any
  getSprintStats: (sprintId: string) => any
  getUserStats: (userId: string) => any
}

const defaultUsers: User[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "john@company.com",
    role: "admin",
    status: "active",
    joinedAt: new Date(),
    lastActive: new Date(),
    timezone: "UTC",
    department: "Engineering",
  },
  {
    id: "user-2",
    name: "Jane Smith",
    email: "jane@company.com",
    role: "project_manager",
    status: "active",
    joinedAt: new Date(),
    lastActive: new Date(),
    timezone: "UTC",
    department: "Product",
  },
  {
    id: "user-3",
    name: "Bob Wilson",
    email: "bob@company.com",
    role: "developer",
    status: "active",
    joinedAt: new Date(),
    lastActive: new Date(),
    timezone: "UTC",
    department: "Engineering",
  },
]

const defaultGroups: Group[] = [
  {
    id: "group-1",
    name: "Engineering Team",
    description: "Software development team",
    members: ["user-1", "user-3"],
    permissions: [
      { resource: "task", action: "create", granted: true },
      { resource: "task", action: "update", granted: true },
      { resource: "task", action: "assign", granted: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "user-1",
  },
  {
    id: "group-2",
    name: "Product Team",
    description: "Product management and design",
    members: ["user-2"],
    permissions: [
      { resource: "project", action: "create", granted: true },
      { resource: "task", action: "create", granted: true },
      { resource: "task", action: "assign", granted: true },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "user-1",
  },
]

const defaultProjects: Project[] = [
  {
    id: "project-1",
    key: "DEMO",
    name: "Demo Project",
    description: "A sample project to demonstrate the system",
    type: "software",
    category: "Web Development",
    lead: "user-2",
    members: [
      { userId: "user-1", role: "admin", joinedAt: new Date() },
      { userId: "user-2", role: "admin", joinedAt: new Date() },
      { userId: "user-3", role: "member", joinedAt: new Date() },
    ],
    groups: ["group-1", "group-2"],
    status: "active",
    visibility: "private",
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      allowAnonymousAccess: false,
      enableTimeTracking: true,
      defaultAssignee: "unassigned",
    },
    workflows: [],
    components: [
      {
        id: "comp-1",
        name: "Frontend",
        description: "React frontend components",
        assigneeType: "project_default",
      },
      {
        id: "comp-2",
        name: "Backend",
        description: "Node.js backend services",
        assigneeType: "project_default",
      },
    ],
    versions: [
      {
        id: "ver-1",
        name: "v1.0.0",
        description: "Initial release",
        released: false,
        archived: false,
      },
    ],
    customFields: [],
  },
]

const defaultTasks: Task[] = [
  {
    id: "task-1",
    key: "DEMO-1",
    title: "Set up project structure",
    description: "Initialize the project with proper folder structure and configuration",
    type: "task",
    status: "todo",
    priority: "high",
    assignee: "user-3",
    reporter: "user-2",
    project: "project-1",
    storyPoints: 3,
    originalEstimate: 8,
    remainingEstimate: 8,
    timeSpent: 0,
    labels: ["setup", "infrastructure"],
    components: ["comp-2"],
    fixVersions: ["ver-1"],
    affectsVersions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    attachments: [],
    watchers: ["user-2"],
    customFields: {},
    worklog: [],
  },
  {
    id: "task-2",
    key: "DEMO-2",
    title: "Design user interface mockups",
    description: "Create wireframes and high-fidelity mockups for the main user interface",
    type: "story",
    status: "in-progress",
    priority: "medium",
    assignee: "user-2",
    reporter: "user-2",
    project: "project-1",
    storyPoints: 5,
    originalEstimate: 16,
    remainingEstimate: 12,
    timeSpent: 4,
    labels: ["design", "ui"],
    components: ["comp-1"],
    fixVersions: ["ver-1"],
    affectsVersions: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    attachments: [],
    watchers: ["user-1", "user-2"],
    customFields: {},
    worklog: [
      {
        id: "work-1",
        author: "user-2",
        timeSpent: 240,
        description: "Initial wireframe creation",
        startedAt: new Date(Date.now() - 86400000),
        createdAt: new Date(Date.now() - 86400000),
      },
    ],
  },
  {
    id: "task-3",
    key: "DEMO-3",
    title: "Fix login validation bug",
    description: "Users can bypass email validation on the login form",
    type: "bug",
    status: "backlog",
    priority: "highest",
    reporter: "user-1",
    project: "project-1",
    storyPoints: 2,
    originalEstimate: 4,
    remainingEstimate: 4,
    timeSpent: 0,
    labels: ["bug", "security", "frontend"],
    components: ["comp-1"],
    fixVersions: ["ver-1"],
    affectsVersions: ["ver-1"],
    createdAt: new Date(),
    updatedAt: new Date(),
    comments: [],
    attachments: [],
    watchers: ["user-1"],
    customFields: {},
    worklog: [],
  },
]

export const useJiraStore = create<AppState & JiraActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentUser: defaultUsers[0],
      users: defaultUsers,
      groups: defaultGroups,
      invitations: [],
      projects: defaultProjects,
      tasks: defaultTasks,
      sprints: [],
      epics: [],
      boards: [],
      selectedProject: "project-1",
      selectedBoard: null,
      selectedSprint: null,
      filter: {
        assignee: [],
        reporter: [],
        status: [],
        priority: [],
        type: [],
        project: [],
        sprint: [],
        epic: [],
        labels: [],
        components: [],
        text: "",
        createdDate: {},
        updatedDate: {},
        dueDate: {},
      },
      view: "board",
      settings: {
        theme: "light",
        language: "en",
        timezone: "UTC",
        notifications: {
          email: true,
          browser: true,
          myChanges: false,
          watchedIssues: true,
          mentions: true,
        },
        display: {
          density: "comfortable",
          sidebarCollapsed: false,
          showAvatars: true,
          showSubtasks: true,
        },
      },
      loading: {
        tasks: false,
        projects: false,
        users: false,
        reports: false,
      },

      // Loading States
      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading },
        })),

      // User Management
      addUser: (user) =>
        set((state) => ({
          users: [
            ...state.users,
            {
              ...user,
              id: crypto.randomUUID(),
              joinedAt: new Date(),
              lastActive: new Date(),
            },
          ],
        })),

      updateUser: (id, updates) =>
        set((state) => ({
          users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
        })),

      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((user) => user.id !== id),
        })),

      setCurrentUser: (user) => set({ currentUser: user }),

      // Group Management
      createGroup: (group) =>
        set((state) => ({
          groups: [
            ...state.groups,
            {
              ...group,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateGroup: (id, updates) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === id ? { ...group, ...updates, updatedAt: new Date() } : group,
          ),
        })),

      deleteGroup: (id) =>
        set((state) => ({
          groups: state.groups.filter((group) => group.id !== id),
        })),

      addUserToGroup: (groupId, userId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId ? { ...group, members: [...group.members, userId], updatedAt: new Date() } : group,
          ),
        })),

      removeUserFromGroup: (groupId, userId) =>
        set((state) => ({
          groups: state.groups.map((group) =>
            group.id === groupId
              ? { ...group, members: group.members.filter((id) => id !== userId), updatedAt: new Date() }
              : group,
          ),
        })),

      // Invitation Management
      sendInvitation: (invitation) => {
        const token = crypto.randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7)

        set((state) => ({
          invitations: [
            ...state.invitations,
            {
              ...invitation,
              id: crypto.randomUUID(),
              invitedAt: new Date(),
              expiresAt,
              status: "pending",
              token,
            },
          ],
        }))
      },

      acceptInvitation: (token) =>
        set((state) => ({
          invitations: state.invitations.map((inv) => (inv.token === token ? { ...inv, status: "accepted" } : inv)),
        })),

      declineInvitation: (token) =>
        set((state) => ({
          invitations: state.invitations.map((inv) => (inv.token === token ? { ...inv, status: "declined" } : inv)),
        })),

      cancelInvitation: (id) =>
        set((state) => ({
          invitations: state.invitations.filter((inv) => inv.id !== id),
        })),

      // Project Management
      createProject: (project) =>
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates, updatedAt: new Date() } : project,
          ),
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          selectedProject: state.selectedProject === id ? null : state.selectedProject,
        })),

      selectProject: (id) => set({ selectedProject: id }),

      addProjectMember: (projectId, userId, role) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  members: [...project.members, { userId, role, joinedAt: new Date() }],
                  updatedAt: new Date(),
                }
              : project,
          ),
        })),

      removeProjectMember: (projectId, userId) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  members: project.members.filter((member) => member.userId !== userId),
                  updatedAt: new Date(),
                }
              : project,
          ),
        })),

      // Task Management
      createTask: (task) => {
        const project = get().projects.find((p) => p.id === task.project)
        const taskCount = get().tasks.filter((t) => t.project === task.project).length + 1

        set((state) => ({
          tasks: [
            ...state.tasks,
            {
              ...task,
              id: crypto.randomUUID(),
              key: `${project?.key}-${taskCount}`,
              createdAt: new Date(),
              updatedAt: new Date(),
              comments: [],
              attachments: [],
              worklog: [],
            },
          ],
        }))
      },

      updateTask: (id, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task)),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        })),

      assignTask: (taskId, assigneeId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, assignee: assigneeId, updatedAt: new Date() } : task,
          ),
        })),

      updateTaskStatus: (taskId, status) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status,
                  updatedAt: new Date(),
                  resolvedAt: status === "done" ? new Date() : task.resolvedAt,
                }
              : task,
          ),
        })),

      addComment: (taskId, comment) => {
        const { currentUser } = get()
        if (!currentUser) return

        const newComment: Comment = {
          id: crypto.randomUUID(),
          text: comment,
          author: currentUser.id,
          createdAt: new Date(),
          mentions: [],
          reactions: [],
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, comments: [...task.comments, newComment], updatedAt: new Date() } : task,
          ),
        }))
      },

      addWorklog: (taskId, worklog) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  worklog: [
                    ...task.worklog,
                    {
                      ...worklog,
                      id: crypto.randomUUID(),
                      createdAt: new Date(),
                    },
                  ],
                  timeSpent: (task.timeSpent || 0) + worklog.timeSpent,
                  remainingEstimate: Math.max(0, (task.remainingEstimate || 0) - worklog.timeSpent),
                  updatedAt: new Date(),
                }
              : task,
          ),
        })),

      watchTask: (taskId, userId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId && !task.watchers.includes(userId)
              ? { ...task, watchers: [...task.watchers, userId], updatedAt: new Date() }
              : task,
          ),
        })),

      unwatchTask: (taskId, userId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, watchers: task.watchers.filter((id) => id !== userId), updatedAt: new Date() }
              : task,
          ),
        })),

      // Sprint Management
      createSprint: (sprint) =>
        set((state) => ({
          sprints: [
            ...state.sprints,
            {
              ...sprint,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateSprint: (id, updates) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === id ? { ...sprint, ...updates, updatedAt: new Date() } : sprint,
          ),
        })),

      deleteSprint: (id) =>
        set((state) => ({
          sprints: state.sprints.filter((sprint) => sprint.id !== id),
        })),

      startSprint: (id) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === id ? { ...sprint, state: "active", startDate: new Date(), updatedAt: new Date() } : sprint,
          ),
        })),

      completeSprint: (id) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === id ? { ...sprint, state: "closed", completeDate: new Date(), updatedAt: new Date() } : sprint,
          ),
        })),

      addTaskToSprint: (sprintId, taskId) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === sprintId && !sprint.tasks.includes(taskId)
              ? { ...sprint, tasks: [...sprint.tasks, taskId], updatedAt: new Date() }
              : sprint,
          ),
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, sprint: sprintId } : task)),
        })),

      removeTaskFromSprint: (sprintId, taskId) =>
        set((state) => ({
          sprints: state.sprints.map((sprint) =>
            sprint.id === sprintId
              ? { ...sprint, tasks: sprint.tasks.filter((id) => id !== taskId), updatedAt: new Date() }
              : sprint,
          ),
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, sprint: undefined } : task)),
        })),

      // Epic Management
      createEpic: (epic) => {
        const project = get().projects.find((p) => p.id === epic.projectId)
        const epicCount = get().epics.filter((e) => e.projectId === epic.projectId).length + 1

        set((state) => ({
          epics: [
            ...state.epics,
            {
              ...epic,
              id: crypto.randomUUID(),
              key: `${project?.key}-${epicCount}`,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        }))
      },

      updateEpic: (id, updates) =>
        set((state) => ({
          epics: state.epics.map((epic) => (epic.id === id ? { ...epic, ...updates, updatedAt: new Date() } : epic)),
        })),

      deleteEpic: (id) =>
        set((state) => ({
          epics: state.epics.filter((epic) => epic.id !== id),
        })),

      addTaskToEpic: (epicId, taskId) =>
        set((state) => ({
          epics: state.epics.map((epic) =>
            epic.id === epicId && !epic.tasks.includes(taskId)
              ? { ...epic, tasks: [...epic.tasks, taskId], updatedAt: new Date() }
              : epic,
          ),
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, epic: epicId } : task)),
        })),

      removeTaskFromEpic: (epicId, taskId) =>
        set((state) => ({
          epics: state.epics.map((epic) =>
            epic.id === epicId
              ? { ...epic, tasks: epic.tasks.filter((id) => id !== taskId), updatedAt: new Date() }
              : epic,
          ),
          tasks: state.tasks.map((task) => (task.id === taskId ? { ...task, epic: undefined } : task)),
        })),

      // Board Management
      createBoard: (board) =>
        set((state) => ({
          boards: [
            ...state.boards,
            {
              ...board,
              id: crypto.randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateBoard: (id, updates) =>
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id ? { ...board, ...updates, updatedAt: new Date() } : board,
          ),
        })),

      deleteBoard: (id) =>
        set((state) => ({
          boards: state.boards.filter((board) => board.id !== id),
        })),

      selectBoard: (id) => set({ selectedBoard: id }),

      // Filter and Search
      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
        })),

      clearFilters: () =>
        set({
          filter: {
            assignee: [],
            reporter: [],
            status: [],
            priority: [],
            type: [],
            project: [],
            sprint: [],
            epic: [],
            labels: [],
            components: [],
            text: "",
            createdDate: {},
            updatedDate: {},
            dueDate: {},
          },
        }),

      searchTasks: (query) => {
        const { tasks } = get()
        const lowercaseQuery = query.toLowerCase()

        return tasks.filter(
          (task) =>
            task.title.toLowerCase().includes(lowercaseQuery) ||
            task.description.toLowerCase().includes(lowercaseQuery) ||
            task.key.toLowerCase().includes(lowercaseQuery) ||
            task.labels.some((label) => label.toLowerCase().includes(lowercaseQuery)),
        )
      },

      // Reports
      generateReport: (period, date, projectId) => {
        const { projects, tasks, users } = get()

        const filteredTasks = projectId === "all" ? tasks : tasks.filter((t) => t.project === projectId)
        const filteredProjects = projectId === "all" ? projects : projects.filter((p) => p.id === projectId)

        return {
          period,
          date,
          projectStats: {
            total: filteredProjects.length,
            active: filteredProjects.filter((p) => p.status === "active").length,
            completed: filteredProjects.filter((p) => p.status === "archived").length,
            byStatus: filteredProjects.reduce(
              (acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            ),
            byType: filteredProjects.reduce(
              (acc, p) => {
                acc[p.type] = (acc[p.type] || 0) + 1
                return acc
              },
              {} as Record<string, number>,
            ),
            byPriority: {},
          },
          userStats: users.map((user) => {
            const userTasks = filteredTasks.filter((t) => t.assignee === user.id)
            const completedTasks = userTasks.filter((t) => t.status === "done")
            return {
              userId: user.id,
              name: user.name,
              tasksAssigned: userTasks.length,
              tasksCompleted: completedTasks.length,
              timeSpent: userTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
              completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
            }
          }),
          taskStats: {
            created: filteredTasks.length,
            completed: filteredTasks.filter((t) => t.status === "done").length,
            inProgress: filteredTasks.filter((t) => t.status === "in-progress").length,
            overdue: filteredTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done")
              .length,
            averageCompletionTime: 5.2,
          },
          timeStats: {
            totalLogged: filteredTasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
            averagePerTask: 4.5,
            averagePerUser: 32.5,
            byProject: filteredProjects.reduce(
              (acc, p) => {
                acc[p.name] = filteredTasks
                  .filter((t) => t.project === p.id)
                  .reduce((sum, t) => sum + (t.timeSpent || 0), 0)
                return acc
              },
              {} as Record<string, number>,
            ),
          },
        }
      },

      exportReport: (data, format) => {
        // Mock export functionality
        if (format === "csv") {
          return (
            "Project,Tasks,Completed,Progress\n" +
            data.userStats
              .map((u: any) => `${u.name},${u.tasksAssigned},${u.tasksCompleted},${u.completionRate}%`)
              .join("\n")
          )
        } else if (format === "excel") {
          return "Excel export data would go here"
        } else {
          return "PDF export data would go here"
        }
      },

      // Analytics
      getProjectStats: (projectId) => {
        const { tasks } = get()
        const projectTasks = tasks.filter((task) => task.project === projectId)

        return {
          total: projectTasks.length,
          byStatus: projectTasks.reduce(
            (acc, task) => {
              acc[task.status] = (acc[task.status] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
          byType: projectTasks.reduce(
            (acc, task) => {
              acc[task.type] = (acc[task.type] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
          byPriority: projectTasks.reduce(
            (acc, task) => {
              acc[task.priority] = (acc[task.priority] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          ),
        }
      },

      getSprintStats: (sprintId) => {
        const { tasks, sprints } = get()
        const sprint = sprints.find((s) => s.id === sprintId)
        if (!sprint) return null

        const sprintTasks = tasks.filter((task) => sprint.tasks.includes(task.id))

        return {
          total: sprintTasks.length,
          completed: sprintTasks.filter((task) => task.status === "done").length,
          inProgress: sprintTasks.filter((task) => task.status === "in-progress").length,
          todo: sprintTasks.filter((task) => task.status === "todo" || task.status === "backlog").length,
          totalStoryPoints: sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0),
          completedStoryPoints: sprintTasks
            .filter((task) => task.status === "done")
            .reduce((sum, task) => sum + (task.storyPoints || 0), 0),
        }
      },

      getUserStats: (userId) => {
        const { tasks } = get()
        const userTasks = tasks.filter((task) => task.assignee === userId)

        return {
          assigned: userTasks.length,
          completed: userTasks.filter((task) => task.status === "done").length,
          inProgress: userTasks.filter((task) => task.status === "in-progress").length,
          overdue: userTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date()).length,
        }
      },
    }),
    {
      name: "jira-storage",
    },
  ),
)
