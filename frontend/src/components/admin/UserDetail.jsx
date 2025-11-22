import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SkeletonForm, SkeletonCard } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'user',
    is_active: true,
  });

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const data = await api.getUser(userId);
      setUser(data.user);
      setFormData({
        name: data.user.name || '',
        role: data.user.role || 'user',
        is_active: data.user.is_active ?? true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load user details',
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
      await api.updateUser(userId, formData);
      toast({
        title: 'Success',
        description: 'User updated successfully',
      });
      navigate('/admin/users');
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

  const handleDeactivate = async () => {
    if (!confirm(`Are you sure you want to deactivate ${user?.name}?`)) {
      return;
    }

    try {
      await api.deactivateUser(userId);
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
      navigate('/admin/users');
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-[#E2E8F0] animate-pulse rounded"></div>
          <div>
            <div className="h-9 w-48 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
            <div className="h-5 w-64 bg-[#E2E8F0] animate-pulse rounded"></div>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 rounded-xl border border-[#E2E8F0] bg-white p-6">
            <div className="h-6 w-48 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
            <div className="h-4 w-64 bg-[#E2E8F0] animate-pulse rounded mb-6"></div>
            <SkeletonForm />
          </div>
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Button>
        <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] px-4 py-3 rounded-lg">
          User not found
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold text-[#0F172A] font-['Poppins']">
              Edit User
            </h1>
            <p className="text-[#64748B] mt-2">
              Update user information and permissions
            </p>
          </div>
        </div>
        {user.is_active && (
          <Button variant="destructive" onClick={handleDeactivate}>
            <Trash2 className="mr-2 h-4 w-4" />
            Deactivate User
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* User Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update user details and role</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-[#F1F5F9] cursor-not-allowed"
                />
                <p className="text-xs text-[#64748B]">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="viewer">Viewer</option>
                </Select>
                <p className="text-xs text-[#64748B]">
                  Admin: Full access • User: Standard access • Viewer: Read-only
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select
                  id="status"
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={saving}>
                  <Save className="mr-2 h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/admin/users')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* User Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-[#64748B]">Status</p>
              <Badge 
                variant={user.is_active ? 'success' : 'secondary'}
                className="mt-1"
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">Current Role</p>
              <p className="text-lg font-semibold text-[#0F172A] mt-1 capitalize">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">Last Login</p>
              <p className="text-sm text-[#0F172A] mt-1">
                {user.last_login 
                  ? new Date(user.last_login).toLocaleString()
                  : 'Never logged in'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">Account Created</p>
              <p className="text-sm text-[#0F172A] mt-1">
                {user.created_at 
                  ? new Date(user.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-[#64748B]">User ID</p>
              <p className="text-sm text-[#0F172A] mt-1 font-mono">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
