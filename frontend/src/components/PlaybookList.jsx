import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Play, 
  Pause, 
  Plus, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  TrendingUp,
  Brain
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'

const CATEGORY_COLORS = {
  onboarding: 'bg-blue-100 text-blue-700 border-blue-200',
  engagement: 'bg-green-100 text-green-700 border-green-200',
  retention: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  expansion: 'bg-purple-100 text-purple-700 border-purple-200',
  support: 'bg-red-100 text-red-700 border-red-200'
}

export default function PlaybookList() {
  const [playbooks, setPlaybooks] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlaybooks()
    fetchPerformance()
  }, [])

  const fetchPlaybooks = async () => {
    try {
      const response = await fetch('/api/playbooks')
      if (response.ok) {
        const data = await response.json()
        setPlaybooks(data)
      } else {
        throw new Error('Failed to fetch playbooks')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load playbooks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPerformance = async () => {
    try {
      const response = await fetch('/api/playbooks/performance')
      if (response.ok) {
        const data = await response.json()
        setPerformance(data)
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error)
    }
  }

  const togglePlaybook = async (playbookId, isActive) => {
    try {
      const response = await fetch(`/api/playbooks/${playbookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !isActive })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: `Playbook ${!isActive ? 'activated' : 'deactivated'}`,
        })
        fetchPlaybooks() // Refresh data
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

  const initializeDefaults = async () => {
    try {
      const response = await fetch('/api/playbooks/initialize-defaults', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Default playbooks initialized",
        })
        fetchPlaybooks() // Refresh data
      } else {
        throw new Error('Failed to initialize playbooks')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize default playbooks",
        variant: "destructive",
      })
    }
  }

  const triggerEvaluation = async () => {
    try {
      const response = await fetch('/api/playbooks/evaluate-triggers', {
        method: 'POST',
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message,
        })
      } else {
        throw new Error('Failed to evaluate triggers')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to evaluate playbook triggers",
        variant: "destructive",
      })
    }
  }

  const executePending = async () => {
    try {
      const response = await fetch('/api/playbooks/execute-pending', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Pending steps executed",
        })
      } else {
        throw new Error('Failed to execute pending steps')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to execute pending steps",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Playbooks</h1>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automated Playbooks</h1>
          <p className="text-gray-600 mt-1">AI-powered customer success workflows</p>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={triggerEvaluation} className="bg-blue-600 hover:bg-blue-700">
            <Brain className="w-4 h-4 mr-2" />
            Evaluate Triggers
          </Button>
          <Button onClick={executePending} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Execute Pending
          </Button>
          <Button onClick={initializeDefaults} variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Initialize Defaults
          </Button>
        </div>
      </div>

      {/* Performance Overview */}
      {performance && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Playbooks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{performance.total_playbooks}</div>
              <p className="text-xs text-gray-500 mt-1">
                {performance.active_playbooks} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{performance.total_executions}</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{performance.success_rate}%</div>
              <Progress value={performance.success_rate} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Currently Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{performance.active_executions}</div>
              <p className="text-xs text-gray-500 mt-1">Running workflows</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Playbooks List */}
      <div className="grid gap-6">
        {playbooks.length > 0 ? (
          playbooks.map((playbook) => (
            <Card key={playbook.id} className={`transition-all ${playbook.is_active ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <CardTitle className="text-lg">{playbook.name}</CardTitle>
                      <Badge className={CATEGORY_COLORS[playbook.category] || CATEGORY_COLORS.onboarding}>
                        {playbook.category}
                      </Badge>
                      <Badge variant={playbook.is_active ? "default" : "secondary"}>
                        {playbook.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <CardDescription className="text-gray-600">
                      {playbook.description}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-4 ml-4">
                    <div className="text-right text-sm">
                      <div className="font-medium text-gray-900">
                        Priority: {playbook.priority}/10
                      </div>
                      <div className="text-gray-500">
                        {playbook.steps?.length || 0} steps
                      </div>
                    </div>
                    
                    <Switch
                      checked={playbook.is_active}
                      onCheckedChange={() => togglePlaybook(playbook.id, playbook.is_active)}
                    />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Performance Metrics */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Performance</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Executions:</span>
                        <span className="font-medium">{playbook.performance?.total_executions || 0}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Success Rate:</span>
                        <span className="font-medium text-green-600">{playbook.performance?.success_rate || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Currently Running:</span>
                        <span className="font-medium text-blue-600">{playbook.performance?.active_executions || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trigger Conditions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Trigger Conditions</h4>
                    <div className="text-sm text-gray-600">
                      {playbook.trigger_conditions ? (
                        <div className="space-y-1">
                          {Object.entries(JSON.parse(playbook.trigger_conditions)).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <span className="capitalize">{key.replace('_', ' ')}: {JSON.stringify(value)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">No conditions set</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Actions</h4>
                    <div className="flex flex-col space-y-2">
                      <Link to={`/playbooks/${playbook.id}`}>
                        <Button size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" variant="outline" className="w-full">
                        <Settings className="w-3 h-3 mr-2" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Steps Preview */}
                {playbook.steps && playbook.steps.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Workflow Steps</h4>
                    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                      {playbook.steps.slice(0, 5).map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{step.title}</div>
                            <div className="text-gray-500 capitalize">{step.step_type}</div>
                          </div>
                          {index < Math.min(playbook.steps.length - 1, 4) && (
                            <div className="w-4 h-px bg-gray-300"></div>
                          )}
                        </div>
                      ))}
                      {playbook.steps.length > 5 && (
                        <div className="text-sm text-gray-500 ml-2">
                          +{playbook.steps.length - 5} more steps
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Activity className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No playbooks found</h3>
              <p className="text-gray-600 mb-4">
                Get started by initializing default playbooks or creating custom workflows
              </p>
              <div className="flex justify-center space-x-3">
                <Button onClick={initializeDefaults}>
                  <Settings className="w-4 h-4 mr-2" />
                  Initialize Defaults
                </Button>
                <Button variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

