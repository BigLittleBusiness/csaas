import { useState, useEffect } from 'react';
import { Building2, Save, CreditCard, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function OrganizationSettings() {
  const { toast } = useToast();
  const [organization, setOrganization] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    billing_email: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [orgData, plansData] = await Promise.all([
        api.getOrganization(),
        api.getAvailablePlans(),
      ]);
      
      setOrganization(orgData);
      setPlans(plansData.plans || []);
      setFormData({
        name: orgData.name || '',
        billing_email: orgData.billing_email || '',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load organization data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await api.updateOrganization(formData);
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
      loadData();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePlanChange = async (newPlan) => {
    if (!confirm(`Are you sure you want to change to the ${newPlan} plan?`)) {
      return;
    }

    try {
      await api.updateOrganizationPlan(newPlan);
      toast({
        title: 'Success',
        description: 'Plan updated successfully',
      });
      loadData();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const getPlanPrice = (planTier) => {
    const plan = plans.find(p => p.tier === planTier);
    return plan ? `$${plan.monthly_price.toLocaleString()}` : 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#64748B]">Loading organization settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-[#0F172A] font-['Poppins']">
          Organization Settings
        </h1>
        <p className="text-[#64748B] mt-2">
          Manage your organization details and subscription
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Organization Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>Update your organization information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing_email">Billing Email</Label>
                <Input
                  id="billing_email"
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                  placeholder="billing@company.com"
                  required
                />
                <p className="text-xs text-[#64748B]">
                  Invoices and billing notifications will be sent to this email
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#64748B]">Organization ID</p>
              <p className="text-sm text-[#0F172A] mt-1 font-mono">
                {organization?.id}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">Created</p>
              <p className="text-sm text-[#0F172A] mt-1">
                {organization?.created_at 
                  ? new Date(organization.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">Status</p>
              <Badge 
                variant={organization?.subscription_status === 'active' ? 'success' : 'warning'}
                className="mt-1"
              >
                {organization?.subscription_status || 'Unknown'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription>Your current plan and usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#14B8A6]/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-[#14B8A6]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Current Plan</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1 capitalize">
                  {organization?.plan_tier || 'N/A'}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  {getPlanPrice(organization?.plan_tier)}/month
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#0891B2]/10 rounded-lg">
                <Users className="h-6 w-6 text-[#0891B2]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Users</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1">
                  {organization?.user_count || 0} / {organization?.max_users === -1 ? '∞' : organization?.max_users || 0}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  {organization?.max_users === -1 ? 'Unlimited' : 'users available'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#10B981]/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#10B981]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Customers</p>
                <p className="text-2xl font-bold text-[#0F172A] mt-1">
                  {organization?.customer_count || 0} / {organization?.max_customers || 0}
                </p>
                <p className="text-sm text-[#64748B] mt-1">
                  customers tracked
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose the plan that fits your needs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.tier}
                className={`border-2 rounded-xl p-6 transition-all ${
                  organization?.plan_tier === plan.tier
                    ? 'border-[#14B8A6] bg-[#14B8A6]/5'
                    : 'border-[#E2E8F0] hover:border-[#14B8A6]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-[#0F172A] capitalize">
                    {plan.tier}
                  </h3>
                  {organization?.plan_tier === plan.tier && (
                    <Badge variant="success">Current</Badge>
                  )}
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-bold text-[#0F172A]">
                    ${plan.monthly_price.toLocaleString()}
                  </span>
                  <span className="text-[#64748B]">/month</span>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm">
                    <span className="text-[#64748B]">Up to</span>
                    <span className="ml-1 font-semibold text-[#0F172A]">
                      {plan.max_customers} customers
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <span className="text-[#64748B]">Up to</span>
                    <span className="ml-1 font-semibold text-[#0F172A]">
                      {plan.max_users === -1 ? 'Unlimited' : plan.max_users} users
                    </span>
                  </div>
                </div>

                {organization?.plan_tier !== plan.tier && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handlePlanChange(plan.tier)}
                  >
                    Switch to {plan.tier}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
