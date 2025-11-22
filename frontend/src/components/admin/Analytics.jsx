import { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SkeletonCard } from '@/components/ui/skeleton';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function Analytics() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts (replace with real data from API)
  const userGrowthData = [
    { month: 'Jan', users: 12, active: 10 },
    { month: 'Feb', users: 15, active: 13 },
    { month: 'Mar', users: 18, active: 16 },
    { month: 'Apr', users: 22, active: 19 },
    { month: 'May', users: 28, active: 25 },
    { month: 'Jun', users: 32, active: 30 },
  ];

  const activityData = [
    { day: 'Mon', logins: 45, actions: 120 },
    { day: 'Tue', logins: 52, actions: 145 },
    { day: 'Wed', logins: 48, actions: 132 },
    { day: 'Thu', logins: 61, actions: 168 },
    { day: 'Fri', logins: 55, actions: 152 },
    { day: 'Sat', logins: 28, actions: 75 },
    { day: 'Sun', logins: 22, actions: 58 },
  ];

  const roleDistribution = [
    { name: 'Admin', value: stats?.statistics?.users?.total ? Math.floor(stats.statistics.users.total * 0.2) : 4 },
    { name: 'User', value: stats?.statistics?.users?.total ? Math.floor(stats.statistics.users.total * 0.6) : 12 },
    { name: 'Viewer', value: stats?.statistics?.users?.total ? Math.floor(stats.statistics.users.total * 0.2) : 4 },
  ];

  const COLORS = {
    Admin: '#14B8A6',
    User: '#0891B2',
    Viewer: '#64748B',
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-64 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
          <div className="h-5 w-96 bg-[#E2E8F0] animate-pulse rounded"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A] font-['Poppins']">
          Analytics & Insights
        </h1>
        <p className="text-[#64748B] mt-2">
          Track user activity, growth trends, and platform usage
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {stats?.statistics?.users?.total || 0}
            </div>
            <p className="text-xs text-[#10B981] mt-1">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {stats?.statistics?.users?.active || 0}
            </div>
            <p className="text-xs text-[#10B981] mt-1">
              +8% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Sessions</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#14B8A6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">4.2</div>
            <p className="text-xs text-[#10B981] mt-1">
              +0.3 from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-[#0891B2]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">78%</div>
            <p className="text-xs text-[#10B981] mt-1">
              +5% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Total and active users over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#14B8A6" 
                  strokeWidth={2}
                  name="Total Users"
                  dot={{ fill: '#14B8A6', r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#0891B2" 
                  strokeWidth={2}
                  name="Active Users"
                  dot={{ fill: '#0891B2', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Role Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Role Distribution</CardTitle>
            <CardDescription>Breakdown by user roles</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity</CardTitle>
          <CardDescription>User logins and actions over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" stroke="#64748B" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px'
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="logins" fill="#14B8A6" name="Logins" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actions" fill="#0891B2" name="Actions" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
