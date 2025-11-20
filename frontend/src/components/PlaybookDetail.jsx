import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Settings, 
  Activity,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Mail,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

const STEP_TYPE_ICONS = {
  email: Mail,
  task: CheckCircle,
  wait: Clock,
  condition: Settings
}

const STATUS_COLORS = {
  active: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  paused: 'bg-yellow-100 text-yellow-700 border-yellow-200'
}

export default function PlaybookDetail() {
  const { id } = useParams()
  const [playbook, setPlaybook] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlaybook()
  }, [id])

  const fetchPlaybook = async () => {
    try {
      const response = await fetch(`/api/playbooks/${id}`)
      if (response.ok) {
        const data = await response.json()
        setPlaybook(data)
      } else {
        throw new Error('Failed to fetch playbook')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load playbook details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePlaybook = async () => {
    try {
      const response = await fetch(`/api/playbooks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !playbook.is_active })
      })
      
      if (response.ok) {
        const updatedPlaybook = await response.json()
        setPlaybook(updatedPlaybook)
        toast({
          title: "Success",
          description: `Playbook ${updatedPlaybook.is_active ? 'activated' : 'deactivated'}`,
        })
      } else {
        throw new Error('Failed to update playbook')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update playbook",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'N/A'
    const duration = new Date(endDate) - new Date(startDate)
    const minutes = Math.floor(duration / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!playbook) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Playbook not found</h2>
        <Link to="/playbooks">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playbooks
          </Button>
        </Link>
      </div>
    )
  }

  const triggerConditions = JSON.parse(playbook.trigger_conditions || '{}')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/playbooks">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{playbook.name}</h1>
            <p className="text-gray-600 mt-1">{playbook.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Active:</span>
            <Switch
              checked={playbook.is_active}
              onCheckedChange={togglePlaybook}
            />
          </div>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {playbook.performance?.total_executions || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {playbook.performance?.success_rate || 0}%
            </div>
            <Progress value={playbook.performance?.success_rate || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Currently Running</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {playbook.performance?.active_executions || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Priority Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {playbook.priority}/10
            </div>
            <p className="text-xs text-gray-500 mt-1">Execution priority</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="workflow" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps</CardTitle>
              <CardDescription>
                {playbook.steps?.length || 0} steps in this playbook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playbook.steps && playbook.steps.length > 0 ? (
                <div className="space-y-4">
                  {playbook.steps.map((step, index) => {
                    const StepIcon = STEP_TYPE_ICONS[step.step_type] || Activity
                    
                    return (
                      <div key={step.id} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium flex-shrink-0">
                          {step.step_order}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <StepIcon className="w-4 h-4 text-gray-400" />
                            <h3 className="font-medium text-gray-900">{step.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {step.step_type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {step.delay_hours > 0 && (
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                Delay: {step.delay_hours}h
                              </span>
                            )}
                            <span className="capitalize">Order: {step.step_order}</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No steps configured</h3>
                  <p className="text-gray-600">Add steps to create your workflow</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Conditions</CardTitle>
              <CardDescription>
                Conditions that automatically start this playbook
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(triggerConditions).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(triggerConditions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          Condition for triggering this playbook
                        </p>
                      </div>
                      <Badge variant="outline">
                        {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No triggers configured</h3>
                  <p className="text-gray-600">Set up conditions to automatically trigger this playbook</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Executions</CardTitle>
              <CardDescription>
                Latest playbook execution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {playbook.recent_executions && playbook.recent_executions.length > 0 ? (
                <div className="space-y-4">
                  {playbook.recent_executions.map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          execution.status === 'completed' ? 'bg-green-500' :
                          execution.status === 'active' ? 'bg-blue-500' :
                          execution.status === 'failed' ? 'bg-red-500' :
                          'bg-yellow-500'
                        }`}></div>
                        
                        <div>
                          <div className="flex items-center space-x-3 mb-1">
                            <span className="font-medium text-gray-900">
                              Execution #{execution.id}
                            </span>
                            <Badge className={STATUS_COLORS[execution.status] || STATUS_COLORS.active}>
                              {execution.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Started: {formatDate(execution.started_date)}</div>
                            {execution.completed_date && (
                              <div>
                                Completed: {formatDate(execution.completed_date)}
                                <span className="ml-2 text-gray-500">
                                  ({formatDuration(execution.started_date, execution.completed_date)})
                                </span>
                              </div>
                            )}
                            <div>Current Step: {execution.current_step + 1}/{playbook.steps?.length || 0}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {execution.status === 'active' && (
                          <div className="text-sm text-blue-600 font-medium">
                            Step {execution.current_step + 1} of {playbook.steps?.length || 0}
                          </div>
                        )}
                        {execution.success !== null && (
                          <div className={`text-sm font-medium ${
                            execution.success ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {execution.success ? 'Success' : 'Failed'}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No executions yet</h3>
                  <p className="text-gray-600">Playbook executions will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Execution Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Executions:</span>
                  <span className="font-medium">{playbook.performance?.total_executions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-medium text-green-600">{playbook.performance?.successful_executions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-medium text-red-600">{playbook.performance?.failed_executions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Currently Active:</span>
                  <span className="font-medium text-blue-600">{playbook.performance?.active_executions || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Success Rate:</span>
                    <span className="font-medium text-green-600">{playbook.performance?.success_rate || 0}%</span>
                  </div>
                  <Progress value={playbook.performance?.success_rate || 0} className="h-2" />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-between mb-1">
                      <span>Category:</span>
                      <Badge variant="outline" className="capitalize">{playbook.category}</Badge>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span>Priority:</span>
                      <span className="font-medium">{playbook.priority}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Modified:</span>
                      <span>{formatDate(playbook.last_modified)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

