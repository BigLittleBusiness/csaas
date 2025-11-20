import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  Activity,
  Target,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300'
}

const PRIORITY_COLORS = {
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
  urgent: 'bg-red-200 text-red-900 border-red-300'
}

export default function CustomerDetail() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomer()
  }, [id])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        throw new Error('Failed to fetch customer')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateHealthScore = async () => {
    try {
      const response = await fetch(`/api/customers/${id}/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const updatedCustomer = await response.json()
        setCustomer(updatedCustomer)
        toast({
          title: "Success",
          description: "Health score updated with AI insights",
        })
      } else {
        throw new Error('Failed to update health score')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update health score",
        variant: "destructive",
      })
    }
  }

  const markActionComplete = async (actionId) => {
    try {
      const response = await fetch(`/api/actions/${actionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action_status: 'completed',
          outcome: 'Completed via dashboard'
        })
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Action marked as completed",
        })
        fetchCustomer() // Refresh data
      } else {
        throw new Error('Failed to update action')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update action",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  const parseAIInsights = (insightsJson) => {
    try {
      return JSON.parse(insightsJson)
    } catch {
      return null
    }
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

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Customer not found</h2>
        <Link to="/customers">
          <Button className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Customers
          </Button>
        </Link>
      </div>
    )
  }

  const aiInsights = parseAIInsights(customer.ai_insights)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600 mt-1">{customer.company || 'Individual Customer'}</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <Button onClick={updateHealthScore} className="bg-blue-600 hover:bg-blue-700">
            <Brain className="w-4 h-4 mr-2" />
            Update AI Analysis
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {Math.round(customer.health_score || 0)}/100
            </div>
            <Progress value={customer.health_score || 0} className="h-2" />
            <Badge className={`mt-2 ${RISK_COLORS[customer.churn_risk_level] || RISK_COLORS.medium}`}>
              {customer.churn_risk_level} risk
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(customer.mrr)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Plan: {customer.plan_type || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Customer Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-gray-900">
              {formatDate(customer.created_date).split(',')[0]}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {Math.floor((new Date() - new Date(customer.created_date)) / (1000 * 60 * 60 * 24))} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Expansion Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${customer.expansion_opportunity === 'high' ? 'bg-green-100 text-green-700' : 
              customer.expansion_opportunity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              customer.expansion_opportunity === 'low' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'}`}>
              {customer.expansion_opportunity || 'none'}
            </Badge>
            <p className="text-xs text-gray-500 mt-2">Revenue growth potential</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health Analysis</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{customer.email}</span>
                </div>
                {customer.company && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{customer.company}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Customer since {formatDate(customer.created_date)}</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            {aiInsights && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="w-5 h-5 mr-2 text-blue-500" />
                    AI Insights
                  </CardTitle>
                  <CardDescription>
                    Generated {formatDate(customer.last_ai_analysis)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-sm text-gray-600">{aiInsights.summary}</p>
                  </div>
                  
                  {aiInsights.key_risks && aiInsights.key_risks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
                        Key Risks
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {aiInsights.key_risks.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <Badge className={PRIORITY_COLORS[aiInsights.priority_level] || PRIORITY_COLORS.medium}>
                    {aiInsights.priority_level} priority
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Usage Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{Math.round(customer.usage_score || 0)}</div>
                <Progress value={customer.usage_score || 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Product engagement level</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Engagement Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{Math.round(customer.engagement_score || 0)}</div>
                <Progress value={customer.engagement_score || 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Communication activity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Support Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{Math.round(customer.support_score || 0)}</div>
                <Progress value={customer.support_score || 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Support interaction health</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Financial Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">{Math.round(customer.financial_score || 0)}</div>
                <Progress value={customer.financial_score || 0} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">Payment and plan health</p>
              </CardContent>
            </Card>
          </div>

          {aiInsights && aiInsights.opportunities && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                  Improvement Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiInsights.opportunities.map((opportunity, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{opportunity}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="space-y-4">
            {customer.pending_actions && customer.pending_actions.length > 0 ? (
              customer.pending_actions.map((action) => (
                <Card key={action.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{action.title}</h3>
                          <Badge className={PRIORITY_COLORS[action.priority] || PRIORITY_COLORS.medium}>
                            {action.priority}
                          </Badge>
                          {action.ai_generated && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Generated
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{action.description}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Created {formatDate(action.created_date)}
                          </span>
                          <span className="capitalize">{action.action_type}</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => markActionComplete(action.id)}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending actions</h3>
                  <p className="text-gray-600">All customer success actions are up to date</p>
                </CardContent>
              </Card>
            )}
          </div>

          {aiInsights && aiInsights.recommended_actions && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-500" />
                  AI Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {aiInsights.recommended_actions.map((action, index) => (
                    <li key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{action}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {customer.recent_activities && customer.recent_activities.length > 0 ? (
                <div className="space-y-4">
                  {customer.recent_activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {activity.activity_type.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
                  <p className="text-gray-600">Customer activity will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

