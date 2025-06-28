"use client";

import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
import { useJiraStore } from "@/store/jira-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingButton } from "@/components/ui/loading-button";
import { TaskCardSkeleton } from "@/components/ui/shimmer";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Users,
  Settings,
  Bell,
  Bug,
  CheckSquare,
  BookOpen,
  Zap,
  AlertCircle,
  MoreHorizontal,
  FolderPlus,
  Play,
  Pause,
  Square,
  CheckCircle,
  Menu,
  Home,
  FolderOpen,
  Calendar,
  Target,
  Layers,
  Activity,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Clock,
  User,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Timer,
  Copy,
  RefreshCw,
} from "lucide-react";
import { TeamView } from "./TeamView";
import { ActivityView } from "./ActivityView";
import { TaskDetailModal } from "./TaskDetailModal";

export function EnhancedJiraDashboard() {
  const {
    currentUser,
    users,
    projects,
    tasks,
    selectedProject,
    filter,
    loading,
    createTask,
    createProject,
    updateTask,
    updateTaskStatus,
    addComment,
    selectProject,
    setFilter,
    clearFilters,
  } = useJiraStore();

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("board");
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "task" as const,
    priority: "medium" as const,
    assignee: "",
    project: selectedProject || "",
    labels: "",
    storyPoints: 0,
    originalEstimate: 0,
  });

  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
    type: "software" as const,
    category: "Web Development",
    lead: currentUser?.id || "",
  });

  const currentProject = projects.find(
    (p: { id: any }) => p.id === selectedProject
  );
  const projectTasks = tasks.filter(
    (task: { project: any }) => task.project === selectedProject
  );

  // Filter tasks based on current filters
  const filteredTasks = projectTasks.filter(
    (task: {
      assignee: any;
      status: any;
      priority: any;
      type: any;
      title: string;
    }) => {
      if (
        filter.assignee.length &&
        !filter.assignee.includes(task.assignee || "unassigned")
      )
        return false;
      if (filter.status.length && !filter.status.includes(task.status))
        return false;
      if (filter.priority.length && !filter.priority.includes(task.priority))
        return false;
      if (filter.type.length && !filter.type.includes(task.type)) return false;
      if (
        filter.text &&
        !task.title.toLowerCase().includes(filter.text.toLowerCase())
      )
        return false;
      return true;
    }
  );

  const handleCreateTask = async () => {
    if (newTask.title.trim() && newTask.project) {
      setIsCreatingTask(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        createTask({
          ...newTask,
          labels: newTask.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          reporter: currentUser?.id || "",
          status: "pending", // Default to pending status
          watchers: [],
          customFields: {},
        });

        setNewTask({
          title: "",
          description: "",
          type: "task",
          priority: "medium",
          assignee: "",
          project: selectedProject || "",
          labels: "",
          storyPoints: 0,
          originalEstimate: 0,
        });
        setShowCreateTask(false);
      } finally {
        setIsCreatingTask(false);
      }
    }
  };

  const handleCreateProject = async () => {
    if (newProject.name.trim() && newProject.key.trim()) {
      setIsCreatingProject(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        createProject({
          ...newProject,
          members: [
            {
              userId: currentUser?.id || "",
              role: "admin",
              joinedAt: new Date(),
            },
          ],
          groups: [],
          status: "active",
          visibility: "private",
          settings: {
            allowAnonymousAccess: false,
            enableTimeTracking: true,
            defaultAssignee: "unassigned",
          },
          workflows: [],
          components: [],
          versions: [],
          customFields: [],
        });

        setNewProject({
          name: "",
          key: "",
          description: "",
          type: "software",
          category: "Web Development",
          lead: currentUser?.id || "",
        });
        setShowCreateProject(false);
      } finally {
        setIsCreatingProject(false);
      }
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    updateTaskStatus(taskId, newStatus as any);
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "bug":
        return <Bug className="h-4 w-4 text-red-500" />;
      case "story":
        return <BookOpen className="h-4 w-4 text-green-500" />;
      case "epic":
        return <Zap className="h-4 w-4 text-purple-500" />;
      case "subtask":
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "highest":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <AlertCircle className="h-4 w-4 text-green-500" />;
      case "lowest":
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "hold":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "hold":
        return <Pause className="h-4 w-4 text-orange-600" />;
      case "pending":
        return <Square className="h-4 w-4 text-gray-600" />;
      default:
        return <Square className="h-4 w-4 text-gray-600" />;
    }
  };

  const statusColumns = [
    { id: "pending", label: "Pending", color: "bg-gray-50" },
    { id: "in-progress", label: "In Progress", color: "bg-blue-50" },
    { id: "hold", label: "Hold On", color: "bg-orange-50" },
    { id: "done", label: "Done", color: "bg-green-50" },
  ];

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "board", label: "Board", icon: Layers },
    { id: "backlog", label: "Backlog", icon: CheckSquare },
    { id: "sprints", label: "Sprints", icon: Target },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "team", label: "Team", icon: Users },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`hidden md:block bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-semibold text-gray-900">
                Project Manager
              </h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <nav className="px-2 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!sidebarCollapsed && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
              {currentUser && (
                <>
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={currentUser.avatar || "/placeholder.svg"}
                    />
                    <AvatarFallback className="text-xs">
                      {currentUser.name
                        .split(" ")
                        .map((n: any[]) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {currentUser.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {currentUser.email}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Project Manager
                    </h1>
                  </div>
                  <nav className="px-2 space-y-1 flex-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveView(item.id);
                            setMobileSheetOpen(false); // Close mobile menu after selection
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeView === item.id
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* User Profile in Mobile */}
                  <div className="p-4 border-t">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      {currentUser && (
                        <>
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={currentUser.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {currentUser.name
                                .split(" ")
                                .map((n: any[]) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {currentUser.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {currentUser.email}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <h1 className="text-xl font-semibold text-gray-900">
                {activeView === "board"
                  ? "Project Board"
                  : sidebarItems.find((item) => item.id === activeView)
                      ?.label || "Project Management"}
              </h1>

              {(activeView === "board" || activeView === "backlog") &&
                selectedProject && (
                  <Select
                    value={selectedProject || "default"}
                    onValueChange={selectProject}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(
                        (project: {
                          id: Key | null | undefined;
                          name:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                          key:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | ReactPortal
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <SelectItem
                            key={project.id}
                            value={String(project.id ?? "")}
                          >
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded" />
                              <span>{project.name}</span>
                              <span className="text-gray-500">
                                ({project.key})
                              </span>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-4 w-4" />
              </Button>

              {/* Create Project Button */}
              <Dialog
                open={showCreateProject}
                onOpenChange={setShowCreateProject}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                      Set up a new project to organize your work
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          value={newProject.name}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              name: e.target.value,
                            })
                          }
                          placeholder="Enter project name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-key">Project Key</Label>
                        <Input
                          id="project-key"
                          value={newProject.key}
                          onChange={(e) =>
                            setNewProject({
                              ...newProject,
                              key: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="e.g., PROJ"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="project-description">Description</Label>
                      <Textarea
                        id="project-description"
                        value={newProject.description}
                        onChange={(e) =>
                          setNewProject({
                            ...newProject,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your project"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="project-type">Project Type</Label>
                        <Select
                          value={newProject.type}
                          onValueChange={(value: any) =>
                            setNewProject({ ...newProject, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="software">Software</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="project-lead">Project Lead</Label>
                        <Select
                          value={newProject.lead}
                          onValueChange={(value) =>
                            setNewProject({ ...newProject, lead: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map(
                              (user: {
                                id: Key | null | undefined;
                                avatar: any;
                                name:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | ReactPortal
                                      | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                        >
                                      | Iterable<ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                              }) => (
                                <SelectItem
                                  key={user.id ?? "default"}
                                  value={String(user.id ?? "")}
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-4 h-4">
                                      <AvatarImage
                                        src={user.avatar || "/placeholder.svg"}
                                      />
                                      <AvatarFallback className="text-xs">
                                        {typeof user.name === "string"
                                          ? user.name
                                              .split(" ")
                                              .map((n) => n[0])
                                              .join("")
                                          : "?"}
                                      </AvatarFallback>
                                    </Avatar>
                                    {user.name}
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setShowCreateProject(false)}
                    >
                      Cancel
                    </Button>
                    <LoadingButton
                      onClick={handleCreateProject}
                      loading={isCreatingProject}
                      loadingText="Creating..."
                    >
                      Create Project
                    </LoadingButton>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Create Task Button */}
              {(activeView === "board" || activeView === "backlog") &&
                selectedProject && (
                  <Dialog
                    open={showCreateTask}
                    onOpenChange={setShowCreateTask}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Create Task</DialogTitle>
                        <DialogDescription>
                          Create a new task in {currentProject?.name}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="task-type">Task Type</Label>
                            <Select
                              value={newTask.type}
                              onValueChange={(value: any) =>
                                setNewTask({ ...newTask, type: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="story">Story</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="bug">Bug</SelectItem>
                                <SelectItem value="epic">Epic</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="task-priority">Priority</Label>
                            <Select
                              value={newTask.priority}
                              onValueChange={(value: any) =>
                                setNewTask({ ...newTask, priority: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="lowest">Lowest</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="highest">Highest</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="task-title">Title</Label>
                          <Input
                            id="task-title"
                            value={newTask.title}
                            onChange={(e) =>
                              setNewTask({ ...newTask, title: e.target.value })
                            }
                            placeholder="Enter task title"
                          />
                        </div>

                        <div>
                          <Label htmlFor="task-description">Description</Label>
                          <Textarea
                            id="task-description"
                            value={newTask.description}
                            onChange={(e) =>
                              setNewTask({
                                ...newTask,
                                description: e.target.value,
                              })
                            }
                            placeholder="Enter task description"
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="task-assignee">Assignee</Label>
                            <Select
                              value={newTask.assignee}
                              onValueChange={(value) =>
                                setNewTask({ ...newTask, assignee: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Unassigned" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unassigned">
                                  Unassigned
                                </SelectItem>
                                {users.map(
                                  (user: {
                                    id: Key | null | undefined;
                                    avatar: any;
                                    name:
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                        >
                                      | Iterable<ReactNode>
                                      | Promise<
                                          | string
                                          | number
                                          | bigint
                                          | boolean
                                          | ReactPortal
                                          | ReactElement<
                                              unknown,
                                              | string
                                              | JSXElementConstructor<any>
                                            >
                                          | Iterable<ReactNode>
                                          | null
                                          | undefined
                                        >
                                      | null
                                      | undefined;
                                  }) => (
                                    <SelectItem
                                      key={user.id ?? "default"}
                                      value={String(user.id ?? "")}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-4 h-4">
                                          <AvatarImage
                                            src={
                                              user.avatar || "/placeholder.svg"
                                            }
                                          />
                                          <AvatarFallback className="text-xs">
                                            {typeof user.name === "string"
                                              ? user.name
                                                  .split(" ")
                                                  .map((n) => n[0])
                                                  .join("")
                                              : "?"}
                                          </AvatarFallback>
                                        </Avatar>
                                        {user.name}
                                      </div>
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="task-story-points">
                              Story Points
                            </Label>
                            <Input
                              id="task-story-points"
                              type="number"
                              value={newTask.storyPoints}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  storyPoints:
                                    Number.parseInt(e.target.value) || 0,
                                })
                              }
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="task-labels">Labels</Label>
                          <Input
                            id="task-labels"
                            value={newTask.labels}
                            onChange={(e) =>
                              setNewTask({ ...newTask, labels: e.target.value })
                            }
                            placeholder="Enter labels separated by commas"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateTask(false)}
                        >
                          Cancel
                        </Button>
                        <LoadingButton
                          onClick={handleCreateTask}
                          loading={isCreatingTask}
                          loadingText="Creating..."
                        >
                          Create Task
                        </LoadingButton>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeView === "dashboard" ? (
            <DashboardView />
          ) : activeView === "projects" ? (
            <ProjectsView />
          ) : activeView === "board" ? (
            !selectedProject ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Select a Project
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Choose a project from the dropdown to get started
                  </p>
                  <Dialog
                    open={showCreateProject}
                    onOpenChange={setShowCreateProject}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <FolderPlus className="h-4 w-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                {/* Project Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {currentProject?.name}
                      </h2>
                      <p className="text-gray-600">
                        {currentProject?.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-sm">
                        {projectTasks.length} tasks
                      </Badge>
                      <Badge variant="outline" className="text-sm">
                        {
                          projectTasks.filter(
                            (t: { status: string }) => t.status === "done"
                          ).length
                        }{" "}
                        completed
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search tasks..."
                            value={filter.text}
                            onChange={(e) =>
                              setFilter({ text: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Select
                        value={filter.assignee[0] || "all"}
                        onValueChange={(value) =>
                          setFilter({
                            assignee: value === "all" ? [] : [value],
                          })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Assignee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Assignees</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map(
                            (user: {
                              id: Key | null | undefined;
                              name:
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | ReactPortal
                                | Promise<
                                    | string
                                    | number
                                    | bigint
                                    | boolean
                                    | ReactPortal
                                    | ReactElement<
                                        unknown,
                                        string | JSXElementConstructor<any>
                                      >
                                    | Iterable<ReactNode>
                                    | null
                                    | undefined
                                  >
                                | null
                                | undefined;
                            }) => (
                              <SelectItem
                                key={user.id ?? "default"}
                                value={String(user.id ?? "")}
                              >
                                {user.name}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                      <Select
                        value={filter.type[0] || "all"}
                        onValueChange={(value) =>
                          setFilter({ type: value === "all" ? [] : [value] })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" onClick={clearFilters}>
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Kanban Board */}
                {loading.tasks ? (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statusColumns.map((column) => (
                      <Card key={column.id} className="h-fit">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-600">
                            {column.label}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <TaskCardSkeleton key={i} />
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {statusColumns.map((column) => {
                      const columnTasks = filteredTasks.filter(
                        (task: { status: string }) => task.status === column.id
                      );
                      return (
                        <Card
                          key={column.id}
                          className={`h-fit ${column.color}`}
                        >
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-700 flex items-center gap-2">
                              {getStatusIcon(column.id)}
                              {column.label} ({columnTasks.length})
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {columnTasks.map(
                              (task: {
                                assignee: any;
                                id:
                                  | string
                                  | number
                                  | bigint
                                  | ((
                                      prevState: string | null
                                    ) => string | null)
                                  | null
                                  | undefined;
                                type: string;
                                key:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | ReactPortal
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | ReactPortal
                                      | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                        >
                                      | Iterable<ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                                title:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | ReactPortal
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | ReactPortal
                                      | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                        >
                                      | Iterable<ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                                priority: string;
                                labels: any[];
                                storyPoints:
                                  | string
                                  | number
                                  | bigint
                                  | boolean
                                  | ReactElement<
                                      unknown,
                                      string | JSXElementConstructor<any>
                                    >
                                  | Iterable<ReactNode>
                                  | ReactPortal
                                  | Promise<
                                      | string
                                      | number
                                      | bigint
                                      | boolean
                                      | ReactPortal
                                      | ReactElement<
                                          unknown,
                                          string | JSXElementConstructor<any>
                                        >
                                      | Iterable<ReactNode>
                                      | null
                                      | undefined
                                    >
                                  | null
                                  | undefined;
                                updatedAt: string | number | Date;
                              }) => {
                                const assignee = users.find(
                                  (u: { id: any }) => u.id === task.assignee
                                );
                                const safeId =
                                  typeof task.id === "function" ||
                                  task.id == null
                                    ? "unknown"
                                    : String(task.id);
                                return (
                                  <Card
                                    key={safeId}
                                    className="p-3 hover:shadow-md transition-shadow cursor-pointer bg-white border border-gray-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const newId =
                                        typeof task.id === "function" ||
                                        task.id == null
                                          ? null
                                          : String(task.id);
                                      setSelectedTask(newId);
                                    }}
                                  >
                                    <div className="space-y-2">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                          {getTaskTypeIcon(task.type)}
                                          <span className="text-xs text-gray-500 font-mono">
                                            {task.key}
                                          </span>
                                        </div>
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-6 w-6 p-0"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <MoreHorizontal className="h-3 w-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStatusChange(
                                                  String(task.id ?? ""),
                                                  "pending"
                                                )
                                              }
                                            >
                                              <Square className="h-4 w-4 mr-2" />
                                              Move to Pending
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStatusChange(
                                                  String(task.id ?? ""),
                                                  "in-progress"
                                                )
                                              }
                                            >
                                              <Play className="h-4 w-4 mr-2" />
                                              Move to In Progress
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStatusChange(
                                                  String(task.id ?? ""),
                                                  "hold"
                                                )
                                              }
                                            >
                                              <Pause className="h-4 w-4 mr-2" />
                                              Move to Hold
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                              onClick={() =>
                                                handleStatusChange(
                                                  String(task.id ?? ""),
                                                  "done"
                                                )
                                              }
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Mark as Done
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                      <h4 className="text-sm font-medium line-clamp-2">
                                        {task.title}
                                      </h4>
                                      <div className="flex items-center justify-between">
                                        <div className="flex gap-1">
                                          {getPriorityIcon(task.priority)}
                                          {task.labels
                                            .slice(0, 1)
                                            .map(
                                              (
                                                label:
                                                  | boolean
                                                  | Key
                                                  | ReactElement<
                                                      unknown,
                                                      | string
                                                      | JSXElementConstructor<any>
                                                    >
                                                  | Iterable<ReactNode>
                                                  | Promise<
                                                      | string
                                                      | number
                                                      | bigint
                                                      | boolean
                                                      | ReactPortal
                                                      | ReactElement<
                                                          unknown,
                                                          | string
                                                          | JSXElementConstructor<any>
                                                        >
                                                      | Iterable<ReactNode>
                                                      | null
                                                      | undefined
                                                    >
                                                  | null
                                                  | undefined
                                              ) => (
                                                <Badge
                                                  key={String(label)}
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                                  {label}
                                                </Badge>
                                              )
                                            )}
                                          {task.labels.length > 1 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              +{task.labels.length - 1}
                                            </Badge>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {task.storyPoints && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                              {task.storyPoints}
                                            </span>
                                          )}
                                          {assignee && (
                                            <Avatar className="w-5 h-5">
                                              <AvatarImage
                                                src={
                                                  assignee.avatar ||
                                                  "/placeholder.svg"
                                                }
                                              />
                                              <AvatarFallback className="text-xs">
                                                {assignee.name
                                                  .split(" ")
                                                  .map((n: any[]) => n[0])
                                                  .join("")}
                                              </AvatarFallback>
                                            </Avatar>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Updated{" "}
                                        {new Date(
                                          task.updatedAt
                                        ).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </Card>
                                );
                              }
                            )}
                            {columnTasks.length === 0 && (
                              <div className="text-center py-8 text-gray-500">
                                <div className="text-sm">
                                  No tasks in {column.label.toLowerCase()}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )
          ) : activeView === "backlog" ? (
            <BacklogView />
          ) : activeView === "sprints" ? (
            <SprintsView />
          ) : activeView === "reports" ? (
            <ReportsView />
          ) : activeView === "calendar" ? (
            <CalendarView />
          ) : activeView === "team" ? (
            <TeamView />
          ) : activeView === "activity" ? (
            <ActivityView />
          ) : activeView === "settings" ? (
            <Settings />
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Coming Soon
                </h2>
                <p className="text-gray-600">
                  This feature is under development
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          taskId={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

// Dashboard View Component
function DashboardView() {
  const { projects, tasks, users } = useJiraStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t: { status: string }) => t.status === "done"
  ).length;
  const inProgressTasks = tasks.filter(
    (t: { status: string }) => t.status === "in-progress"
  ).length;
  const pendingTasks = tasks.filter(
    (t: { status: string }) => t.status === "pending"
  ).length;

  const recentTasks = tasks
    .sort(
      (
        a: { updatedAt: string | number | Date },
        b: { updatedAt: string | number | Date }
      ) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {completedTasks}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {inProgressTasks}
                </p>
              </div>
              <Play className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingTasks}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map(
                (task: {
                  assignee: any;
                  id: Key | null | undefined;
                  title:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  key:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  status:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                }) => {
                  const assignee = users.find(
                    (u: { id: any }) => u.id === task.assignee
                  );
                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.key}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                      {assignee && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={assignee.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {assignee.name
                              .split(" ")
                              .map((n: any[]) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Projects Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .slice(0, 5)
                .map(
                  (project: {
                    id: Key | null | undefined;
                    name:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                    key:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                  }) => {
                    const projectTasks = tasks.filter(
                      (t: { project: any }) => t.project === project.id
                    );
                    const completedCount = projectTasks.filter(
                      (t: { status: string }) => t.status === "done"
                    ).length;
                    const progress =
                      projectTasks.length > 0
                        ? (completedCount / projectTasks.length) * 100
                        : 0;

                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              {project.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {project.key}
                            </p>
                          </div>
                          <span className="text-sm text-gray-600">
                            {completedCount}/{projectTasks.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Projects View Component
function ProjectsView() {
  const { projects, tasks, users } = useJiraStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">All Projects</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(
          (project: {
            id: Key | null | undefined;
            lead: any;
            name:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
            key:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
            description:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
            type:
              | string
              | number
              | bigint
              | boolean
              | ReactElement<unknown, string | JSXElementConstructor<any>>
              | Iterable<ReactNode>
              | ReactPortal
              | Promise<
                  | string
                  | number
                  | bigint
                  | boolean
                  | ReactPortal
                  | ReactElement<unknown, string | JSXElementConstructor<any>>
                  | Iterable<ReactNode>
                  | null
                  | undefined
                >
              | null
              | undefined;
          }) => {
            const projectTasks = tasks.filter(
              (t: { project: any }) => t.project === project.id
            );
            const completedTasks = projectTasks.filter(
              (t: { status: string }) => t.status === "done"
            ).length;
            const lead = users.find((u: { id: any }) => u.id === project.lead);

            return (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded" />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <Badge variant="outline">{project.key}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {completedTasks}/{projectTasks.length} tasks
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            projectTasks.length > 0
                              ? (completedTasks / projectTasks.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Lead:</span>
                        {lead && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage
                                src={lead.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {lead.name
                                  .split(" ")
                                  .map((n: any[]) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{lead.name}</span>
                          </div>
                        )}
                      </div>
                      <Badge variant="secondary">{project.type}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}

// Backlog View Component
function BacklogView() {
  const { tasks, users, selectedProject } = useJiraStore();
  const [searchTerm, setSearchTerm] = useState("");

  const projectTasks = tasks.filter(
    (task: { project: any }) => task.project === selectedProject
  );
  const filteredTasks = projectTasks.filter(
    (task: { title: string; key: string }) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.key.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Select a Project
          </h2>
          <p className="text-gray-600">Choose a project to view its backlog</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Backlog</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search backlog..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filteredTasks.map(
              (
                task: {
                  assignee: any;
                  id: Key | null | undefined;
                  type: string;
                  key:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  title:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  description:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  priority: string;
                  storyPoints:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  status:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                },
                index: number
              ) => {
                const assignee = users.find(
                  (u: { id: any }) => u.id === task.assignee
                );
                return (
                  <div
                    key={task.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-20">
                        <span className="text-sm text-gray-500">
                          #{index + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          {task.type === "bug" && (
                            <Bug className="h-4 w-4 text-red-500" />
                          )}
                          {task.type === "story" && (
                            <BookOpen className="h-4 w-4 text-green-500" />
                          )}
                          {task.type === "epic" && (
                            <Zap className="h-4 w-4 text-purple-500" />
                          )}
                          {task.type === "task" && (
                            <CheckSquare className="h-4 w-4 text-blue-500" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-gray-500">
                            {task.key}
                          </span>
                          <h3 className="font-medium">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {task.priority === "highest" && (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                          {task.priority === "high" && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {task.priority === "medium" && (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          {task.priority === "low" && (
                            <AlertCircle className="h-4 w-4 text-green-500" />
                          )}
                          {task.priority === "lowest" && (
                            <AlertCircle className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        {task.storyPoints && (
                          <Badge variant="outline" className="text-xs">
                            {task.storyPoints} SP
                          </Badge>
                        )}

                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>

                        {assignee ? (
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={assignee.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {assignee.name
                                .split(" ")
                                .map((n: any[]) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-3 w-3 text-gray-400" />
                          </div>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Clone
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Sprints View Component
function SprintsView() {
  const { tasks, users, selectedProject } = useJiraStore();
  const [activeTab, setActiveTab] = useState("active");

  // Mock sprint data
  const sprints = [
    {
      id: "sprint-1",
      name: "Sprint 1",
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-14"),
      goal: "Implement user authentication and basic dashboard",
    },
    {
      id: "sprint-2",
      name: "Sprint 2",
      status: "planned",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-28"),
      goal: "Add project management features",
    },
  ];

  const activeSprint = sprints.find((s) => s.status === "active");
  const sprintTasks = tasks.filter(
    (task: { project: any }) => task.project === selectedProject
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Sprints</h2>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Sprint
        </Button>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "active"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Active Sprint
        </button>
        <button
          onClick={() => setActiveTab("planned")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "planned"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Future Sprints
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === "completed"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Completed
        </button>
      </div>

      {activeTab === "active" && activeSprint && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    {activeSprint.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeSprint.goal}
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-medium">
                    {activeSprint.startDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">End Date</p>
                  <p className="font-medium">
                    {activeSprint.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium">14 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["pending", "in-progress", "done"].map((status) => {
              const statusTasks = sprintTasks.filter(
                (task: { status: string }) => task.status === status
              );
              const statusLabels = {
                pending: "To Do",
                "in-progress": "In Progress",
                done: "Done",
              };

              return (
                <Card key={status}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-600">
                      {statusLabels[status as keyof typeof statusLabels]} (
                      {statusTasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {statusTasks.map(
                      (task: {
                        assignee: any;
                        id: Key | null | undefined;
                        type: string;
                        key:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        title:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                        priority: string;
                        storyPoints:
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | ReactPortal
                          | Promise<
                              | string
                              | number
                              | bigint
                              | boolean
                              | ReactPortal
                              | ReactElement<
                                  unknown,
                                  string | JSXElementConstructor<any>
                                >
                              | Iterable<ReactNode>
                              | null
                              | undefined
                            >
                          | null
                          | undefined;
                      }) => {
                        const assignee = users.find(
                          (u: { id: any }) => u.id === task.assignee
                        );
                        return (
                          <Card key={task.id} className="p-3 bg-white border">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                {task.type === "bug" && (
                                  <Bug className="h-4 w-4 text-red-500" />
                                )}
                                {task.type === "story" && (
                                  <BookOpen className="h-4 w-4 text-green-500" />
                                )}
                                {task.type === "epic" && (
                                  <Zap className="h-4 w-4 text-purple-500" />
                                )}
                                {task.type === "task" && (
                                  <CheckSquare className="h-4 w-4 text-blue-500" />
                                )}
                                <span className="text-xs text-gray-500 font-mono">
                                  {task.key}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium line-clamp-2">
                                {task.title}
                              </h4>
                              <div className="flex items-center justify-between">
                                <div className="flex gap-1">
                                  {task.priority === "highest" && (
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  {task.priority === "high" && (
                                    <AlertCircle className="h-4 w-4 text-red-500" />
                                  )}
                                  {task.priority === "medium" && (
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                  )}
                                  {task.priority === "low" && (
                                    <AlertCircle className="h-4 w-4 text-green-500" />
                                  )}
                                  {task.priority === "lowest" && (
                                    <AlertCircle className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {task.storyPoints && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                                      {task.storyPoints}
                                    </span>
                                  )}
                                  {assignee && (
                                    <Avatar className="w-5 h-5">
                                      <AvatarImage
                                        src={
                                          assignee.avatar || "/placeholder.svg"
                                        }
                                      />
                                      <AvatarFallback className="text-xs">
                                        {assignee.name
                                          .split(" ")
                                          .map((n: any[]) => n[0])
                                          .join("")}
                                      </AvatarFallback>
                                    </Avatar>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      }
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "planned" && (
        <div className="space-y-4">
          {sprints
            .filter((s) => s.status === "planned")
            .map((sprint) => (
              <Card key={sprint.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{sprint.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {sprint.goal}
                      </p>
                    </div>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {sprint.startDate.toLocaleDateString()} -{" "}
                      {sprint.endDate.toLocaleDateString()}
                    </span>
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4 mr-2" />
                      Start Sprint
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {activeTab === "completed" && (
        <div className="text-center py-12">
          <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No completed sprints
          </h3>
          <p className="text-gray-600">Completed sprints will appear here</p>
        </div>
      )}
    </div>
  );
}

// Reports View Component
function ReportsView() {
  const { tasks, projects } = useJiraStore();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (t: { status: string }) => t.status === "done"
  ).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Reports & Analytics
        </h2>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Completion Rate
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {completionRate.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Projects
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {projects.length}
                </p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Avg. Task Time
                </p>
                <p className="text-2xl font-bold text-purple-600">2.5d</p>
              </div>
              <Timer className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["pending", "in-progress", "hold", "done"].map((status) => {
                const statusTasks = tasks.filter(
                  (t: { status: string }) => t.status === status
                );
                const percentage =
                  totalTasks > 0 ? (statusTasks.length / totalTasks) * 100 : 0;
                const colors = {
                  pending: "bg-gray-500",
                  "in-progress": "bg-blue-500",
                  hold: "bg-orange-500",
                  done: "bg-green-500",
                };

                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">
                        {status.replace("-", " ")}
                      </span>
                      <span>
                        {statusTasks.length} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          colors[status as keyof typeof colors]
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects
                .slice(0, 5)
                .map(
                  (project: {
                    id: Key | null | undefined;
                    name:
                      | string
                      | number
                      | bigint
                      | boolean
                      | ReactElement<
                          unknown,
                          string | JSXElementConstructor<any>
                        >
                      | Iterable<ReactNode>
                      | ReactPortal
                      | Promise<
                          | string
                          | number
                          | bigint
                          | boolean
                          | ReactPortal
                          | ReactElement<
                              unknown,
                              string | JSXElementConstructor<any>
                            >
                          | Iterable<ReactNode>
                          | null
                          | undefined
                        >
                      | null
                      | undefined;
                  }) => {
                    const projectTasks = tasks.filter(
                      (t: { project: any }) => t.project === project.id
                    );
                    const completedCount = projectTasks.filter(
                      (t: { status: string }) => t.status === "done"
                    ).length;
                    const progress =
                      projectTasks.length > 0
                        ? (completedCount / projectTasks.length) * 100
                        : 0;

                    return (
                      <div key={project.id} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{project.name}</span>
                          <span>
                            {completedCount}/{projectTasks.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Calendar View Component
function CalendarView() {
  const { tasks, users } = useJiraStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const today = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  );
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay());

  const days = [];
  const currentDay = new Date(startDate);

  for (let i = 0; i < 42; i++) {
    days.push(new Date(currentDay));
    currentDay.setDate(currentDay.getDate() + 1);
  }

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: { updatedAt: string | number | Date }) => {
      const taskDate = new Date(task.updatedAt);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Calendar</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() - 1
                  )
                )
              }
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth() + 1
                  )
                )
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-medium text-gray-600 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = day.toDateString() === today.toDateString();
              const dayTasks = getTasksForDate(day);

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                    !isCurrentMonth ? "bg-gray-50 text-gray-400" : ""
                  } ${isToday ? "bg-blue-50" : ""}`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isToday ? "text-blue-600" : ""
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayTasks
                      .slice(0, 3)
                      .map(
                        (task: {
                          id: Key | null | undefined;
                          title:
                            | string
                            | number
                            | bigint
                            | boolean
                            | ReactElement<
                                unknown,
                                string | JSXElementConstructor<any>
                              >
                            | Iterable<ReactNode>
                            | Promise<
                                | string
                                | number
                                | bigint
                                | boolean
                                | ReactPortal
                                | ReactElement<
                                    unknown,
                                    string | JSXElementConstructor<any>
                                  >
                                | Iterable<ReactNode>
                                | null
                                | undefined
                              >
                            | null
                            | undefined;
                        }) => (
                          <div
                            key={task.id}
                            className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate"
                            title={String(task.title ?? "")}
                          >
                            {task.title}
                          </div>
                        )
                      )}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
