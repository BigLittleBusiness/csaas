import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Plus, 
  AlertTriangle, 
  TrendingUp,
  Mail,
  Phone,
  Building,
  Calendar,
  DollarSign
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

const RISK_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200',
  critical: 'bg-red-200 text-red-900 border-red-300'
}

const EXPANSION_COLORS = {
  none: 'bg-gray-100 text-gray-600 border-gray-200',
  low: 'bg-blue-100 text-blue-700 border-blue-200',
  medium: 'bg-purple-100 text-purple-700 border-purple-200',
  high: 'bg-green-100 text-green-700 border-green-200'
}

export default function CustomerList() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, riskFilter])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: '20'
      })
      
      if (riskFilter !== 'all') {
        params.append('risk_level', riskFilter)
      }

      const response = await fetch(`/api/customers?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers)
        setPagination(data.pagination)
      } else {
        throw new Error('Failed to fetch customers')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCustomerHealth = async (customerId) => {
    try {
      const response = await fetch(`/api/customers/${customerId}/health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Customer health score updated",
        })
        fetchCustomers() // Refresh the list
      } else {
        throw new Error('Failed to update health score')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update customer health",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.company && customer.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                  <div className="w-24 h-8 bg-gray-200 rounded"></div>
                </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your customer relationships</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="critical">Critical Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                {/* Customer Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {customer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link 
                        to={`/customers/${customer.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                      >
                        {customer.name}
                      </Link>
                      
                      <Badge className={RISK_COLORS[customer.churn_risk_level] || RISK_COLORS.medium}>
                        {customer.churn_risk_level} risk
                      </Badge>
                      
                      {customer.expansion_opportunity !== 'none' && (
                        <Badge className={EXPANSION_COLORS[customer.expansion_opportunity] || EXPANSION_COLORS.none}>
                          {customer.expansion_opportunity} expansion
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                      
                      {customer.company && (
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span className="truncate">{customer.company}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(customer.mrr)}/mo</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>Since {formatDate(customer.created_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Health Score */}
                <div className="flex flex-col items-end space-y-3 ml-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.round(customer.health_score || 0)}
                    </div>
                    <div className="text-xs text-gray-500">Health Score</div>
                  </div>
                  
                  <div className="w-24">
                    <Progress 
                      value={customer.health_score || 0} 
                      className="h-2"
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateCustomerHealth(customer.id)}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Update
                    </Button>
                    
                    <Link to={`/customers/${customer.id}`}>
                      <Button size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Usage:</span>
                    <span className="ml-2 font-medium">{Math.round(customer.usage_score || 0)}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Engagement:</span>
                    <span className="ml-2 font-medium">{Math.round(customer.engagement_score || 0)}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Support:</span>
                    <span className="ml-2 font-medium">{Math.round(customer.support_score || 0)}/100</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Financial:</span>
                    <span className="ml-2 font-medium">{Math.round(customer.financial_score || 0)}/100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.per_page) + 1} to{' '}
            {Math.min(pagination.page * pagination.per_page, pagination.total)} of{' '}
            {pagination.total} customers
          </p>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page - 1)}
              disabled={!pagination.has_prev}
            >
              Previous
            </Button>
            
            <span className="flex items-center px-3 py-1 text-sm">
              Page {pagination.page} of {pagination.pages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(pagination.page + 1)}
              disabled={!pagination.has_next}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {filteredCustomers.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Users className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || riskFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first customer'
              }
            </p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

