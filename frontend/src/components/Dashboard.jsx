import { useState, useEffect } from 'react'
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Brain,
  Activity,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const RISK_COLORS = {
  low: '#10b981',
  medium: '#f59e0b', 
  high: '#ef4444',
  critical: '#dc2626'
}

const EXPANSION_COLORS = {
  none: '#6b7280',
  low: '#3b82f6',
  medium: '#8b5cf6',
  high: '#10b981'
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/summary')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error('Failed to fetch dashboard data')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerPlaybooks = async () => {
    try {
      const response = await fetch('/api/playbooks/evaluate-triggers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Playbooks Triggered",
          description: result.message,
        })
        fetchDashboardData() // Refresh data
      } else {
        throw new Error('Failed to trigger playbooks')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to trigger playbooks",
        variant: "destructive",
      })
    }
  }

  const executePendingSteps = async () => {
    try {
      const response = await fetch('/api/playbooks/execute-pending', {
        method: 'POST',
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Pending playbook steps executed",
        })
        fetchDashboardData() // Refresh data
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const riskData = dashboardData ? Object.entries(dashboardData.risk_distribution).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: RISK_COLORS[key]
  })) : []

  const expansionData = dashboardData ? Object.entries(dashboardData.expansion_opportunities).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    color: EXPANSION_COLORS[key]
  })) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Virtual CSM Dashboard</h1>
          <p className="text-gray-600 mt-1">AI-powered customer success management at your fingertips</p>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={triggerPlaybooks} className="bg-blue-600 hover:bg-blue-700">
            <Brain className="w-4 h-4 mr-2" />
            Trigger AI Analysis
          </Button>
          <Button onClick={executePendingSteps} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Execute Pending
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.total_customers || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Active customer base</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Avg Health Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {dashboardData?.average_health_score || 0}
              <span className="text-sm text-gray-500">/100</span>
            </div>
            <Progress 
              value={dashboardData?.average_health_score || 0} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${dashboardData?.total_mrr?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Monthly recurring revenue</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Urgent Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {dashboardData?.urgent_customers || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">High/critical risk customers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Churn Risk Distribution
            </CardTitle>
            <CardDescription>
              Customer distribution by churn risk level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {riskData.map((item) => (
                <div key={item.name} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expansion Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-500" />
              Expansion Opportunities
            </CardTitle>
            <CardDescription>
              Revenue expansion potential by customer segment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expansionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-500" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData?.pending_actions || 0}
            </div>
            <p className="text-sm text-gray-600">
              AI-generated tasks awaiting execution
            </p>
            <Button className="w-full mt-4" variant="outline" size="sm">
              View All Actions
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="ghost" 
              size="sm"
              onClick={triggerPlaybooks}
            >
              <Brain className="w-4 h-4 mr-2" />
              Run AI Analysis
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="ghost" 
              size="sm"
              onClick={executePendingSteps}
            >
              <Activity className="w-4 h-4 mr-2" />
              Execute Workflows
            </Button>
            <Button className="w-full justify-start" variant="ghost" size="sm">
              <Users className="w-4 h-4 mr-2" />
              Review At-Risk
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">AI Engine</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Online
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Sync</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Playbooks</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                Running
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

