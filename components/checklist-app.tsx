"use client"

import { useState } from "react"
import { useChecklistStore } from "@/store/checklist-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, Trash2, Filter, CheckCircle2, Circle, ListChecks, BarChart3, Bell, Settings } from "lucide-react"
import { TemplateManager } from "@/components/template-manager"
import { ProjectDashboard } from "@/components/project-dashboard"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export function ChecklistApp() {
  const {
    templates,
    activeChecklists,
    selectedTemplate,
    filter,
    notifications,
    currentUser,
    addTemplate,
    deleteTemplate,
    selectTemplate,
    addChecklistItem,
    updateChecklistItem,
    deleteChecklistItem,
    toggleChecklistItem,
    createChecklistFromTemplate,
    setFilter,
    clearFilters,
    clearAllChecklists,
    getCompletionStats,
    markAllNotificationsRead,
  } = useChecklistStore()

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    items: [],
  })

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    tags: [],
    notes: "",
    status: "todo" as const,
  })

  const stats = getCompletionStats()
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const filteredChecklists = activeChecklists.filter((item) => {
    if (filter.category && filter.category !== "all" && item.category !== filter.category) return false
    if (filter.priority && filter.priority !== "all" && item.priority !== filter.priority) return false
    if (filter.completed !== null && item.completed !== filter.completed) return false
    if (filter.status && filter.status !== "all" && item.status !== filter.status) return false
    return true
  })

  const categories = [...new Set(activeChecklists.map((item) => item.category))]
  const priorities = ["low", "medium", "high"]
  const statuses = ["todo", "in-progress", "review", "completed", "blocked"]

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim()) {
      addTemplate(newTemplate)
      setNewTemplate({ name: "", description: "", category: "", items: [] })
    }
  }

  const handleAddItem = () => {
    if (newItem.title.trim()) {
      addChecklistItem(newItem)
      setNewItem({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        tags: [],
        notes: "",
        status: "todo",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "review":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "blocked":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Management Suite</h1>
            <p className="text-gray-600">Complete project management with templates and analytics</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" onClick={markAllNotificationsRead}>
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </Button>

            {/* User Avatar */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{currentUser.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.percentage}%</div>
              <Progress value={stats.percentage} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="checklists" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="checklists">Tasks</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="checklists" className="space-y-6">
            {/* Enhanced Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Advanced Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <Label htmlFor="category-filter">Category</Label>
                    <Select
                      value={filter.category || "all"}
                      onValueChange={(value) => setFilter({ category: value === "all" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority-filter">Priority</Label>
                    <Select
                      value={filter.priority || "all"}
                      onValueChange={(value) => setFilter({ priority: value === "all" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All priorities</SelectItem>
                        {priorities.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={filter.status || "all"}
                      onValueChange={(value) => setFilter({ status: value === "all" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace("-", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="completion-filter">Completion</Label>
                    <Select
                      value={filter.completed === null ? "all" : filter.completed.toString()}
                      onValueChange={(value) => setFilter({ completed: value === "all" ? null : value === "true" })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="false">Pending</SelectItem>
                        <SelectItem value="true">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end gap-2">
                    <Button onClick={clearFilters} variant="outline" className="flex-1">
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Add New Item */}
            <Card>
              <CardHeader>
                <CardTitle>Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="new-title">Title</Label>
                    <Input
                      id="new-title"
                      value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Input
                      id="new-category"
                      value={newItem.category}
                      onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                      placeholder="Category"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-priority">Priority</Label>
                    <Select
                      value={newItem.priority}
                      onValueChange={(value: any) => setNewItem({ ...newItem, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button onClick={handleAddItem} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="new-description">Description (optional)</Label>
                    <Textarea
                      id="new-description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Task description"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-notes">Notes (optional)</Label>
                    <Textarea
                      id="new-notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                      placeholder="Additional notes"
                      rows={2}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Checklist Items */}
            <div className="space-y-4">
              {filteredChecklists.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">No tasks found. Add a new task or create one from a template.</p>
                  </CardContent>
                </Card>
              ) : (
                filteredChecklists.map((item) => (
                  <Card
                    key={item.id}
                    className={`transition-all ${item.completed ? "bg-green-50 border-green-200" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <button onClick={() => toggleChecklistItem(item.id)} className="mt-1 flex-shrink-0">
                          {item.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className={`font-medium ${item.completed ? "line-through text-gray-500" : ""}`}>
                                {item.title}
                              </h3>
                              {item.description && (
                                <p
                                  className={`text-sm mt-1 ${item.completed ? "line-through text-gray-400" : "text-gray-600"}`}
                                >
                                  {item.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <Badge variant="outline" className="text-xs">
                                  {item.category}
                                </Badge>
                                <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>{item.priority}</Badge>
                                <Badge className={`text-xs ${getStatusColor(item.status)}`}>
                                  {item.status.replace("-", " ")}
                                </Badge>
                                {item.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              {item.notes && <p className="text-sm text-gray-600 mt-2 italic">{item.notes}</p>}
                              {item.comments.length > 0 && (
                                <div className="text-sm text-gray-600 mt-2">
                                  {item.comments.length} comment{item.comments.length !== 1 ? "s" : ""}
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => deleteChecklistItem(item.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <ProjectDashboard />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplateManager />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings & Preferences
                </CardTitle>
                <CardDescription>Configure your workspace preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <p>Settings panel coming soon...</p>
                  <p className="text-sm">Configure notifications, themes, and workspace preferences.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
