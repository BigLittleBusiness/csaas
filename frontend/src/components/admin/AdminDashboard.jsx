import { useState, useEffect } from 'react';
import { Users, Building2, TrendingUp, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#64748B]">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] px-4 py-3 rounded-lg">
        Error loading dashboard: {error}
      </div>
    );
  }

  const { statistics, recent_activity } = stats || {};
  const userStats = statistics?.users || {};
  const orgStats = statistics?.organization || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A] font-['Poppins']">
          Admin Dashboard
        </h1>
        <p className="text-[#64748B] mt-2">
          Manage users, monitor activity, and configure organization settings
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">{userStats.total || 0}</div>
            <p className="text-xs text-[#64748B] mt-1">
              {userStats.active || 0} active, {userStats.inactive || 0} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-[#10B981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">{userStats.active || 0}</div>
            <p className="text-xs text-[#64748B] mt-1">
              {userStats.verified || 0} verified accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#14B8A6]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">
              {orgStats.customer_count || 0}
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              of {orgStats.max_customers || 0} limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <Building2 className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A] capitalize">
              {orgStats.plan_tier || 'N/A'}
            </div>
            <Badge 
              variant={orgStats.subscription_status === 'active' ? 'success' : 'warning'}
              className="mt-2"
            >
              {orgStats.subscription_status || 'Unknown'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recent_activity?.new_users?.length > 0 ? (
              <div className="space-y-4">
                {recent_activity.new_users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{user.name}</p>
                      <p className="text-xs text-[#64748B]">{user.email}</p>
                    </div>
                    <Badge variant={user.is_active ? 'success' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No recent users</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logins</CardTitle>
            <CardDescription>Latest user activity</CardDescription>
          </CardHeader>
          <CardContent>
            {recent_activity?.recent_logins?.length > 0 ? (
              <div className="space-y-4">
                {recent_activity.recent_logins.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{user.name}</p>
                      <p className="text-xs text-[#64748B]">{user.email}</p>
                    </div>
                    <p className="text-xs text-[#64748B]">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#64748B]">No recent logins</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organization Info */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Current subscription and usage information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-[#64748B]">Organization Name</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-1">
                {orgStats.name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748B]">User Limit</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-1">
                {userStats.total || 0} / {orgStats.max_users === -1 ? '∞' : orgStats.max_users || 0}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-[#64748B]">Customer Limit</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-1">
                {orgStats.customer_count || 0} / {orgStats.max_customers || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
