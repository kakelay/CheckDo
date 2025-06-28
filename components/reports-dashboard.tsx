"use client"

import { useState, useEffect } from "react"
import { useJiraStore } from "@/store/jira-store"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingButton } from "@/components/ui/loading-button"
import { Shimmer } from "@/components/ui/shimmer"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download, TrendingUp, Clock, CheckCircle2, AlertTriangle, BarChart3, FileText, Filter } from "lucide-react"

const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]

export function ReportsDashboard() {
  const { projects, tasks, users, selectedProject, loading, generateReport, exportReport } = useJiraStore()

  const [reportPeriod, setReportPeriod] = useState<"month" | "year">("month")
  const [reportDate, setReportDate] = useState(new Date())
  const [reportProject, setReportProject] = useState<string>("all")
  const [reportData, setReportData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const data = generateReport(reportPeriod, reportDate, reportProject)
      setReportData(data)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportReport = async (format: "pdf" | "excel" | "csv") => {
    setIsExporting(true)
    try {
      // Simulate export
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const exportData = exportReport(reportData, format)

      // Create download link
      const blob = new Blob([exportData], {
        type:
          format === "pdf"
            ? "application/pdf"
            : format === "excel"
              ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : "text/csv",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `report-${reportPeriod}-${reportDate.toISOString().split("T")[0]}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }

  const formatDate = (date: Date) => {
    return reportPeriod === "month"
      ? date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
      : date.getFullYear().toString()
  }

  const getDateOptions = () => {
    const options = []
    const now = new Date()

    if (reportPeriod === "month") {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        options.push({
          value: date.toISOString(),
          label: date.toLocaleDateString("en-US", { year: "numeric", month: "long" }),
        })
      }
    } else {
      for (let i = 0; i < 5; i++) {
        const year = now.getFullYear() - i
        const date = new Date(year, 0, 1)
        options.push({
          value: date.toISOString(),
          label: year.toString(),
        })
      }
    }

    return options
  }

  // Generate mock data for demonstration
  useEffect(() => {
    if (!reportData) {
      handleGenerateReport()
    }
  }, [])

  const mockReportData = {
    period: reportPeriod,
    date: reportDate,
    projectStats: {
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
      completed: projects.filter((p) => p.status === "archived").length,
      byStatus: {
        active: projects.filter((p) => p.status === "active").length,
        archived: projects.filter((p) => p.status === "archived").length,
      },
      byType: {
        software: projects.filter((p) => p.type === "software").length,
        business: projects.filter((p) => p.type === "business").length,
        service_desk: projects.filter((p) => p.type === "service_desk").length,
      },
    },
    userStats: users.map((user) => {
      const userTasks = tasks.filter((t) => t.assignee === user.id)
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
      created: tasks.length,
      completed: tasks.filter((t) => t.status === "done").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length,
      averageCompletionTime: 5.2,
    },
    timeStats: {
      totalLogged: tasks.reduce((sum, t) => sum + (t.timeSpent || 0), 0),
      averagePerTask: 4.5,
      averagePerUser: 32.5,
      byProject: projects.reduce(
        (acc, p) => {
          acc[p.name] = tasks.filter((t) => t.project === p.id).reduce((sum, t) => sum + (t.timeSpent || 0), 0)
          return acc
        },
        {} as Record<string, number>,
      ),
    },
  }

  const currentData = reportData || mockReportData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports for your projects and team</p>
        </div>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Configure your report parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Period</label>
              <Select value={reportPeriod} onValueChange={(value: "month" | "year") => setReportPeriod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Select value={reportDate.toISOString()} onValueChange={(value) => setReportDate(new Date(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getDateOptions().map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={reportProject} onValueChange={setReportProject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <LoadingButton
                onClick={handleGenerateReport}
                loading={isGenerating}
                loadingText="Generating..."
                className="flex-1"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate
              </LoadingButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Content */}
      {isGenerating ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Shimmer className="w-24 h-4" />
                </CardHeader>
                <CardContent>
                  <Shimmer className="w-16 h-8 mb-2" />
                  <Shimmer className="w-20 h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Shimmer className="w-32 h-6" />
            </CardHeader>
            <CardContent>
              <Shimmer className="w-full h-64" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Export Actions */}
          <div className="flex justify-end gap-2">
            <LoadingButton
              variant="outline"
              onClick={() => handleExportReport("csv")}
              loading={isExporting}
              loadingText="Exporting..."
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </LoadingButton>
            <LoadingButton
              variant="outline"
              onClick={() => handleExportReport("excel")}
              loading={isExporting}
              loadingText="Exporting..."
            >
              <FileText className="h-4 w-4 mr-2" />
              Export Excel
            </LoadingButton>
            <LoadingButton
              variant="outline"
              onClick={() => handleExportReport("pdf")}
              loading={isExporting}
              loadingText="Exporting..."
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </LoadingButton>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.taskStats.created}</div>
                <p className="text-xs text-muted-foreground">{currentData.taskStats.completed} completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentData.taskStats.inProgress}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((currentData.taskStats.inProgress / currentData.taskStats.created) * 100)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.floor(currentData.timeStats.totalLogged / 60)}h</div>
                <p className="text-xs text-muted-foreground">{currentData.timeStats.averagePerTask}h avg per task</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{currentData.taskStats.overdue}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((currentData.taskStats.overdue / currentData.taskStats.created) * 100)}% of total
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="team">Team Performance</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Status Distribution</CardTitle>
                    <CardDescription>Current status of all tasks</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Completed", value: currentData.taskStats.completed, color: "#10B981" },
                            { name: "In Progress", value: currentData.taskStats.inProgress, color: "#3B82F6" },
                            {
                              name: "Todo",
                              value:
                                currentData.taskStats.created -
                                currentData.taskStats.completed -
                                currentData.taskStats.inProgress,
                              color: "#F59E0B",
                            },
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {[
                            { name: "Completed", value: currentData.taskStats.completed, color: "#10B981" },
                            { name: "In Progress", value: currentData.taskStats.inProgress, color: "#3B82F6" },
                            {
                              name: "Todo",
                              value:
                                currentData.taskStats.created -
                                currentData.taskStats.completed -
                                currentData.taskStats.inProgress,
                              color: "#F59E0B",
                            },
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Project Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Types</CardTitle>
                    <CardDescription>Distribution by project type</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(currentData.projectStats.byType).map(([type, count]) => ({
                          type: type.replace("_", " "),
                          count,
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3B82F6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Statistics</CardTitle>
                  <CardDescription>Overview of all projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.map((project) => {
                      const projectTasks = tasks.filter((t) => t.project === project.id)
                      const completedTasks = projectTasks.filter((t) => t.status === "done")
                      const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0

                      return (
                        <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <div>
                              <div className="font-medium">{project.name}</div>
                              <div className="text-sm text-gray-600">{project.key}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{projectTasks.length}</div>
                              <div className="text-gray-600">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{completedTasks.length}</div>
                              <div className="text-gray-600">Done</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{Math.round(progress)}%</div>
                              <div className="text-gray-600">Progress</div>
                            </div>
                            <Badge variant={project.status === "active" ? "default" : "secondary"}>
                              {project.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Team Performance</CardTitle>
                  <CardDescription>Individual team member statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {currentData.userStats.map((userStat: any) => {
                      const user = users.find((u) => u.id === userStat.userId)
                      if (!user) return null

                      return (
                        <div key={userStat.userId} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-600">{user.role.replace("_", " ")}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="font-medium">{userStat.tasksAssigned}</div>
                              <div className="text-gray-600">Assigned</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{userStat.tasksCompleted}</div>
                              <div className="text-gray-600">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{Math.floor(userStat.timeSpent / 60)}h</div>
                              <div className="text-gray-600">Time Spent</div>
                            </div>
                            <div className="text-center">
                              <div className="font-medium">{Math.round(userStat.completionRate)}%</div>
                              <div className="text-gray-600">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Time by Project</CardTitle>
                    <CardDescription>Time logged per project</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={Object.entries(currentData.timeStats.byProject).map(([project, time]) => ({
                          project: project.length > 15 ? project.substring(0, 15) + "..." : project,
                          time: Math.floor((time as number) / 60),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="project" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}h`, "Time Spent"]} />
                        <Bar dataKey="time" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Statistics</CardTitle>
                    <CardDescription>Overall time tracking metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Time Logged:</span>
                      <span className="font-medium">{Math.floor(currentData.timeStats.totalLogged / 60)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average per Task:</span>
                      <span className="font-medium">{currentData.timeStats.averagePerTask}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average per User:</span>
                      <span className="font-medium">{currentData.timeStats.averagePerUser}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Most Active Project:</span>
                      <span className="font-medium">
                        {
                          Object.entries(currentData.timeStats.byProject).reduce((a, b) =>
                            (a[1] as number) > (b[1] as number) ? a : b,
                          )[0]
                        }
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
