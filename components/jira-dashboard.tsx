"use client";

import { useJiraStore } from "@/store/jira-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ReportsDashboard } from "@/components/reports-dashboard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Clock,
  BarChart3,
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
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  useState,
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
  JSX,
  ClassAttributes,
  HTMLAttributes,
  Ref,
  SetStateAction,
  RefAttributes,
} from "react";
import { Key } from "readline";

export function JiraDashboard() {
  const {
    currentUser,
    users,
    groups,
    projects,
    tasks,
    sprints,
    epics,
    selectedProject,
    filter,
    loading,
    createTask,
    updateTask,
    assignTask,
    updateTaskStatus,
    addComment,
    selectProject,
    setFilter,
    clearFilters,
    getProjectStats,
    createProject,
  } = useJiraStore();

  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [activeView, setActiveView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "task" as const,
    priority: "medium" as const,
    assignee: "",
    project: selectedProject || "",
    labels: "",
    components: [],
    storyPoints: 0,
    originalEstimate: 0,
  });

  const [newProject, setNewProject] = useState({
    name: "",
    key: "",
    description: "",
  });

  const currentProject = projects.find(
    (p: { id: any }) => p.id === selectedProject
  );
  const projectTasks = tasks.filter(
    (task: { project: any }) => task.project === selectedProject
  );
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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        createTask({
          ...newTask,
          labels: newTask.labels
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          reporter: currentUser?.id || "",
          status: "pending",
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
          components: [],
          storyPoints: 0,
          originalEstimate: 0,
        });
        setShowCreateTask(false);
      } finally {
        setIsCreatingTask(false);
      }
    }
  };

  const handleCreateProjectSubmit = async () => {
    if (newProject.name.trim() && newProject.key.trim()) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        createProject(newProject);
        setNewProject({ name: "", key: "", description: "" });
        setShowCreateProject(false);
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    }
  };

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
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const taskId = draggableId;
    const newStatus = destination.droppableId;

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case "reports":
        return <ReportsDashboard />;
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Dashboard Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Tasks
                  </CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      tasks.filter(
                        (t: { assignee: any }) => t.assignee === currentUser?.id
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    In Progress
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      tasks.filter(
                        (t: { assignee: any; status: string }) =>
                          t.assignee === currentUser?.id &&
                          t.status === "in-progress"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed
                  </CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      tasks.filter(
                        (t: { assignee: any; status: string }) =>
                          t.assignee === currentUser?.id && t.status === "done"
                      ).length
                    }
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Projects
                  </CardTitle>
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{projects.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest updates across your projects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks
                    .sort(
                      (
                        a: { updatedAt: string | number | Date },
                        b: { updatedAt: string | number | Date }
                      ) =>
                        new Date(b.updatedAt).getTime() -
                        new Date(a.updatedAt).getTime()
                    )
                    .slice(0, 5)
                    .map(
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
                        updatedAt: string | number | Date;
                        status: string;
                      }) => {
                        const assignee = users.find(
                          (u: { id: any }) => u.id === task.assignee
                        );
                        return (
                          <div
                            key={String(task.id)}
                            className="flex items-center gap-3 p-3 border rounded-lg"
                          >
                            {getTaskTypeIcon(task.type)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {task.key}
                                </span>
                                <span className="font-medium">
                                  {task.title}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Updated{" "}
                                {new Date(task.updatedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <Badge className={getStatusColor(task.status)}>
                              {task.status.replace("-", " ")}
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
          </div>
        );
      case "board":
        return (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search issues..."
                        value={filter.text}
                        onChange={(e) => setFilter({ text: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select
                    value={filter.assignee[0] || "all"}
                    onValueChange={(value) =>
                      setFilter({ assignee: value === "all" ? [] : [value] })
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
                          <SelectItem key={String(user.id)} value={String(user.id ?? '')}>
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
            <DragDropContext onDragEnd={onDragEnd}>
              {loading.tasks ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {["pending", "in-progress", "hold", "done"].map((status) => (
                    <Card key={status} className="h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-600">
                          {status.replace("-", " ")}
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
                  {["pending", "in-progress", "hold", "done"].map((status) => {
                    const statusTasks = filteredTasks.filter(
                      (task: { status: string }) => task.status === status
                    );
                    return (
                      <Card key={status} className="h-fit">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-medium uppercase tracking-wide text-gray-600">
                            {status.replace("-", " ")} ({statusTasks.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Droppable droppableId={status}>
                            {(provided: {
                              droppableProps: JSX.IntrinsicAttributes &
                                ClassAttributes<HTMLDivElement> &
                                HTMLAttributes<HTMLDivElement>;
                              innerRef: Ref<HTMLDivElement> | undefined;
                              placeholder:
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
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                              >
                                {statusTasks.map(
                                  (
                                    task: {
                                      assignee: any;
                                      id: SetStateAction<string | null>;
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
                                                | string
                                                | JSXElementConstructor<any>
                                              >
                                            | Iterable<ReactNode>
                                            | null
                                            | undefined
                                          >
                                        | null
                                        | undefined;
                                      priority: string;
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
                                                | string
                                                | JSXElementConstructor<any>
                                              >
                                            | Iterable<ReactNode>
                                            | null
                                            | undefined
                                          >
                                        | null
                                        | undefined;
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
                                                | string
                                                | JSXElementConstructor<any>
                                              >
                                            | Iterable<ReactNode>
                                            | null
                                            | undefined
                                          >
                                        | null
                                        | undefined;
                                    },
                                    index: any
                                  ) => {
                                    const assignee = users.find(
                                      (u: { id: any }) => u.id === task.assignee
                                    );
                                    return (
                                      <Draggable
                                        key={task.id}
                                        draggableId={task.id}
                                        index={index}
                                      >
                                        {(provided: {
                                          innerRef:
                                            | Ref<HTMLDivElement>
                                            | undefined;
                                          draggableProps: JSX.IntrinsicAttributes &
                                            HTMLAttributes<HTMLDivElement> &
                                            RefAttributes<HTMLDivElement>;
                                          dragHandleProps: JSX.IntrinsicAttributes &
                                            HTMLAttributes<HTMLDivElement> &
                                            RefAttributes<HTMLDivElement>;
                                        }) => (
                                          <Card
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() =>
                                              setSelectedTask(task.id)
                                            }
                                          >
                                            <div className="space-y-2">
                                              <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                  {getTaskTypeIcon(task.type)}
                                                  <span className="text-xs text-gray-500">
                                                    {task.key}
                                                  </span>
                                                </div>
                                                {getPriorityIcon(task.priority)}
                                              </div>
                                              <h4 className="text-sm font-medium line-clamp-2">
                                                {task.title}
                                              </h4>
                                              <div className="flex items-center justify-between">
                                                <div className="flex gap-1">
                                                  {task.labels
                                                    .slice(0, 2)
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
                                                          key={typeof label === 'string' || typeof label === 'number' ? label : String(label)}
                                                          variant="secondary"
                                                          className="text-xs"
                                                        >
                                                          {label}
                                                        </Badge>
                                                      )
                                                    )}
                                                  {task.labels.length > 2 && (
                                                    <Badge
                                                      variant="secondary"
                                                      className="text-xs"
                                                    >
                                                      +{task.labels.length - 2}
                                                    </Badge>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                  {task.storyPoints && (
                                                    <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
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
                                                          .map(
                                                            (n: any[]) => n[0]
                                                          )
                                                          .join("")}
                                                      </AvatarFallback>
                                                    </Avatar>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          </Card>
                                        )}
                                      </Draggable>
                                    );
                                  }
                                )}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </DragDropContext>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600">This feature is under development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-xl font-semibold text-gray-900">
                Jira Clone
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="md:hidden">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <div className="p-4">
                    <h1 className="text-xl font-semibold text-gray-900">
                      Jira Clone
                    </h1>
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
                          <Icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {selectedProject && (
                <Select value={selectedProject} onValueChange={selectProject}>
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
                        <SelectItem key={project.id} value={project.id}>
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

              {(activeView === "board" || activeView === "backlog") &&
                selectedProject && (
                  <>
                    <Dialog
                      open={showCreateTask}
                      onOpenChange={setShowCreateTask}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Issue
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Issue</DialogTitle>
                          <DialogDescription>
                            Create a new issue in {currentProject?.name}
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="task-type">Issue Type</Label>
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
                                  <SelectItem value="highest">
                                    Highest
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="task-title">Summary</Label>
                            <Input
                              id="task-title"
                              value={newTask.title}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  title: e.target.value,
                                })
                              }
                              placeholder="Enter issue summary"
                            />
                          </div>

                          <div>
                            <Label htmlFor="task-description">
                              Description
                            </Label>
                            <Textarea
                              id="task-description"
                              value={newTask.description}
                              onChange={(e) =>
                                setNewTask({
                                  ...newTask,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Enter issue description"
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
                                      <SelectItem key={user.id} value={user.id}>
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-4 h-4">
                                            <AvatarImage
                                              src={
                                                user.avatar ||
                                                "/placeholder.svg"
                                              }
                                            />
                                            <AvatarFallback className="text-xs">
                                              {user.name
                                                .split(" ")
                                                .map((n: any[]) => n[0])
                                                .join("")}
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
                                setNewTask({
                                  ...newTask,
                                  labels: e.target.value,
                                })
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
                            Create Issue
                          </LoadingButton>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog
                      open={showCreateProject}
                      onOpenChange={setShowCreateProject}
                    >
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Project
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Project</DialogTitle>
                          <DialogDescription>
                            Create a new project
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
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
                                  key: e.target.value,
                                })
                              }
                              placeholder="Enter project key"
                            />
                          </div>

                          <div>
                            <Label htmlFor="project-description">
                              Description
                            </Label>
                            <Textarea
                              id="project-description"
                              value={newProject.description}
                              onChange={(e) =>
                                setNewProject({
                                  ...newProject,
                                  description: e.target.value,
                                })
                              }
                              placeholder="Enter project description"
                              rows={4}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            onClick={() => setShowCreateProject(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleCreateProjectSubmit}>
                            Create Project
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {!selectedProject &&
          activeView !== "dashboard" &&
          activeView !== "reports" &&
          activeView !== "settings" ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Select a Project
                </h2>
                <p className="text-gray-600">
                  Choose a project from the dropdown to get started
                </p>
              </div>
            </div>
          ) : (
            renderContent()
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

// Task Detail Modal Component
function TaskDetailModal({
  taskId,
  onClose,
}: {
  taskId: string;
  onClose: () => void;
}) {
  const { tasks, users, updateTask, addComment, addWorklog } = useJiraStore();
  const [newComment, setNewComment] = useState("");
  const [worklogTime, setWorklogTime] = useState("");
  const [worklogDescription, setWorklogDescription] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isLoggingWork, setIsLoggingWork] = useState(false);

  const task = tasks.find((t: { id: string }) => t.id === taskId);
  const assignee = task?.assignee
    ? users.find((u: { id: any }) => u.id === task.assignee)
    : null;
  const reporter = task?.reporter
    ? users.find((u: { id: any }) => u.id === task.reporter)
    : null;

  if (!task) return null;

  const handleAddComment = async () => {
    if (newComment.trim()) {
      setIsAddingComment(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        addComment(taskId, newComment);
        setNewComment("");
      } finally {
        setIsAddingComment(false);
      }
    }
  };

  const handleLogWork = async () => {
    if (worklogTime && worklogDescription.trim()) {
      setIsLoggingWork(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        addWorklog(taskId, {
          author: "current-user",
          timeSpent: Number.parseInt(worklogTime) * 60,
          description: worklogDescription,
          startedAt: new Date(),
        });
        setWorklogTime("");
        setWorklogDescription("");
      } finally {
        setIsLoggingWork(false);
      }
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{task.key}</span>
            <DialogTitle className="text-lg">{task.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">
                {task.description || "No description provided."}
              </p>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-medium mb-3">
                Comments ({task.comments.length})
              </h3>
              <div className="space-y-3">
                {task.comments.map(
                  (comment: {
                    author: any;
                    id: Key | null | undefined;
                    createdAt: string | number | Date;
                    text:
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
                    const author = users.find(
                      (u: { id: any }) => u.id === comment.author
                    );
                    return (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={author?.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback>
                            {author?.name
                              .split(" ")
                              .map((n: any[]) => n[0])
                              .join("") || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">
                              {author?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-4 space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <LoadingButton
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  loading={isAddingComment}
                  loadingText="Adding..."
                >
                  Add Comment
                </LoadingButton>
              </div>
            </div>

            {/* Work Log */}
            <div>
              <h3 className="font-medium mb-3">Work Log</h3>
              <div className="space-y-2">
                {task.worklog.map(
                  (entry: {
                    author: any;
                    id: Key | null | undefined;
                    description:
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
                    timeSpent: number;
                  }) => {
                    const author = users.find(
                      (u: { id: any }) => u.id === entry.author
                    );
                    return (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage
                              src={author?.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback className="text-xs">
                              {author?.name
                                .split(" ")
                                .map((n: any[]) => n[0])
                                .join("") || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{entry.description}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.floor(entry.timeSpent / 60)}h{" "}
                          {entry.timeSpent % 60}m
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Time spent (hours)"
                    type="number"
                    value={worklogTime}
                    onChange={(e) => setWorklogTime(e.target.value)}
                  />
                  <Input
                    placeholder="Work description"
                    value={worklogDescription}
                    onChange={(e) => setWorklogDescription(e.target.value)}
                  />
                </div>
                <LoadingButton
                  onClick={handleLogWork}
                  disabled={!worklogTime || !worklogDescription.trim()}
                  loading={isLoggingWork}
                  loadingText="Logging..."
                >
                  Log Work
                </LoadingButton>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-500">Status</Label>
                  <Badge className={getStatusColor(task.status)}>
                    {task.status.replace("-", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Priority</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {getPriorityIcon(task.priority)}
                    <span className="text-sm capitalize">{task.priority}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <div className="flex items-center gap-1 mt-1">
                    {getTaskTypeIcon(task.type)}
                    <span className="text-sm capitalize">{task.type}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Assignee</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {assignee ? (
                      <>
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
                        <span className="text-sm">{assignee.name}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Reporter</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {reporter && (
                      <>
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={reporter.avatar || "/placeholder.svg"}
                          />
                          <AvatarFallback className="text-xs">
                            {reporter.name
                              .split(" ")
                              .map((n: any[]) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{reporter.name}</span>
                      </>
                    )}
                  </div>
                </div>
                {task.storyPoints && (
                  <div>
                    <Label className="text-xs text-gray-500">
                      Story Points
                    </Label>
                    <div className="text-sm mt-1">{task.storyPoints}</div>
                  </div>
                )}
                <div>
                  <Label className="text-xs text-gray-500">Created</Label>
                  <div className="text-sm mt-1">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Updated</Label>
                  <div className="text-sm mt-1">
                    {new Date(task.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Labels */}
            {task.labels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Labels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {task.labels.map(
                      (
                        label:
                          | boolean
                          | Key
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
                          | undefined
                      ) => (
                        <Badge
                          key={label}
                          variant="secondary"
                          className="text-xs"
                        >
                          {label}
                        </Badge>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Time Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Time Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Original Estimate:</span>
                  <span>{task.originalEstimate || 0}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Time Spent:</span>
                  <span>
                    {Math.floor((task.timeSpent || 0) / 60)}h{" "}
                    {(task.timeSpent || 0) % 60}m
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span>
                    {Math.floor((task.remainingEstimate || 0) / 60)}h{" "}
                    {(task.remainingEstimate || 0) % 60}m
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper functions for icons and colors
function getTaskTypeIcon(type: string) {
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
}

function getPriorityIcon(priority: string) {
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
}

function getStatusColor(status: string) {
  switch (status) {
    case "done":
      return "bg-green-100 text-green-800 border-green-200";
    case "in-progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "in-review":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "testing":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "blocked":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
}
