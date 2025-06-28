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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Plus, Trash2, Copy, Download, Upload, Search, Star, Clock, Users, BarChart3, Play } from "lucide-react"

export function TemplateManager() {
  const {
    templates,
    projects,
    selectedTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    selectTemplate,
    duplicateTemplate,
    exportTemplate,
    importTemplate,
    createProject,
    searchTemplates,
  } = useChecklistStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("all")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState("")
  const [newProject, setNewProject] = useState({ name: "", description: "" })

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    difficulty: "beginner" as const,
    estimatedDuration: 0,
    items: [] as any[],
  })

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    priority: "medium" as const,
    estimatedTime: 0,
    tags: "",
    notes: "",
  })

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = [...new Set(templates.map((t) => t.category))]
  const difficulties = ["beginner", "intermediate", "advanced"]

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim()) {
      addTemplate({
        ...newTemplate,
        tags: newTemplate.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        isDefault: false,
        isPublic: false,
        author: "User",
        version: "1.0",
      })
      setNewTemplate({
        name: "",
        description: "",
        category: "",
        tags: "",
        difficulty: "beginner",
        estimatedDuration: 0,
        items: [],
      })
      setShowCreateDialog(false)
    }
  }

  const handleAddItemToTemplate = () => {
    if (newItem.title.trim()) {
      setNewTemplate((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            ...newItem,
            tags: newItem.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            completed: false,
            dependencies: [],
          },
        ],
      }))
      setNewItem({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        estimatedTime: 0,
        tags: "",
        notes: "",
      })
    }
  }

  const handleCreateProject = (templateId: string) => {
    if (newProject.name.trim()) {
      createProject(newProject.name, newProject.description, templateId)
      setNewProject({ name: "", description: "" })
    }
  }

  const handleExportTemplate = (templateId: string) => {
    const data = exportTemplate(templateId)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `template-${templateId}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTemplate = () => {
    if (importData.trim()) {
      importTemplate(importData)
      setImportData("")
      setShowImportDialog(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 border-green-200"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "advanced":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Template</DialogTitle>
                <DialogDescription>Paste the JSON data of the template you want to import.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste template JSON here..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleImportTemplate}>Import</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Template</DialogTitle>
                <DialogDescription>
                  Create a reusable checklist template with detailed items and metadata.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Template Details</TabsTrigger>
                  <TabsTrigger value="items">Checklist Items</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                        placeholder="Enter template name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-category">Category</Label>
                      <Input
                        id="template-category"
                        value={newTemplate.category}
                        onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                        placeholder="e.g., Development, Marketing"
                      />
                    </div>
                    <div>
                      <Label htmlFor="template-difficulty">Difficulty</Label>
                      <Select
                        value={newTemplate.difficulty}
                        onValueChange={(value: any) => setNewTemplate({ ...newTemplate, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="template-duration">Estimated Duration (minutes)</Label>
                      <Input
                        id="template-duration"
                        type="number"
                        value={newTemplate.estimatedDuration}
                        onChange={(e) =>
                          setNewTemplate({ ...newTemplate, estimatedDuration: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="Total estimated time"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea
                      id="template-description"
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                      placeholder="Describe what this template is for"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-tags">Tags (comma-separated)</Label>
                    <Input
                      id="template-tags"
                      value={newTemplate.tags}
                      onChange={(e) => setNewTemplate({ ...newTemplate, tags: e.target.value })}
                      placeholder="web, development, react, nodejs"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="items" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Add Checklist Item</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="item-title">Title</Label>
                          <Input
                            id="item-title"
                            value={newItem.title}
                            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                            placeholder="Task title"
                          />
                        </div>
                        <div>
                          <Label htmlFor="item-category">Category</Label>
                          <Input
                            id="item-category"
                            value={newItem.category}
                            onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                            placeholder="Task category"
                          />
                        </div>
                        <div>
                          <Label htmlFor="item-priority">Priority</Label>
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
                        <div>
                          <Label htmlFor="item-time">Estimated Time (minutes)</Label>
                          <Input
                            id="item-time"
                            type="number"
                            value={newItem.estimatedTime}
                            onChange={(e) =>
                              setNewItem({ ...newItem, estimatedTime: Number.parseInt(e.target.value) || 0 })
                            }
                            placeholder="Time estimate"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="item-description">Description</Label>
                        <Textarea
                          id="item-description"
                          value={newItem.description}
                          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                          placeholder="Detailed description of the task"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="item-tags">Tags (comma-separated)</Label>
                          <Input
                            id="item-tags"
                            value={newItem.tags}
                            onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
                            placeholder="setup, frontend, testing"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button onClick={handleAddItemToTemplate} className="w-full">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="item-notes">Notes</Label>
                        <Textarea
                          id="item-notes"
                          value={newItem.notes}
                          onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                          placeholder="Additional notes or instructions"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Display added items */}
                  {newTemplate.items.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Template Items ({newTemplate.items.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {newTemplate.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{item.title}</div>
                                <div className="text-sm text-gray-600">
                                  {item.category} • {item.priority} priority
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    items: prev.items.filter((_, i) => i !== index),
                                  }))
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate}>Create Template</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Difficulty</Label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  {difficulties.map((difficulty) => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {filteredTemplates.length} of {templates.length} templates
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="h-4 w-4 text-yellow-500" />}
                  </CardTitle>
                  <CardDescription className="mt-1">{template.description}</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Template Metadata */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{template.category}</Badge>
                <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                {template.estimatedDuration && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(template.estimatedDuration)}
                  </Badge>
                )}
              </div>

              {/* Template Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-gray-500" />
                  <span>{template.items.length} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{template.usageCount} uses</span>
                </div>
              </div>

              {/* Template Tags */}
              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <Separator />

              {/* Template Actions */}
              <div className="space-y-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Play className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Project from Template</DialogTitle>
                      <DialogDescription>Create a new project using the "{template.name}" template.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          value={newProject.name}
                          onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                          placeholder="Enter project name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-description">Description (optional)</Label>
                        <Textarea
                          id="project-description"
                          value={newProject.description}
                          onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                          placeholder="Project description"
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancel</Button>
                        <Button onClick={() => handleCreateProject(template.id)}>Create Project</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => duplicateTemplate(template.id)}>
                    <Copy className="h-4 w-4 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleExportTemplate(template.id)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  {!template.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No templates found</p>
              <p>Try adjusting your search criteria or create a new template.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
