import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, MoreVertical, Edit, Trash2, CheckCircle, XCircle, Users as UsersIcon } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonTable } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { exportUsersToCSV, exportUsersToPDF } from '@/lib/exportUtils';

export default function UserManagement() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data.users || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to deactivate ${userName}?`)) {
      return;
    }

    try {
      await api.deactivateUser(userId);
      toast({
        title: 'Success',
        description: 'User deactivated successfully',
      });
      loadUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId, checked) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    }
  };

  const handleBulkDeactivate = async () => {
    if (!confirm(`Are you sure you want to deactivate ${selectedUsers.length} users?`)) {
      return;
    }

    try {
      toast({
        title: 'Processing',
        description: `Deactivating ${selectedUsers.length} users...`,
        variant: 'info',
      });

      await Promise.all(selectedUsers.map(userId => api.deactivateUser(userId)));
      
      toast({
        title: 'Success',
        description: `Successfully deactivated ${selectedUsers.length} users`,
        variant: 'success',
      });
      
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to deactivate some users',
        variant: 'destructive',
      });
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (!confirm(`Are you sure you want to change ${selectedUsers.length} users to ${newRole} role?`)) {
      return;
    }

    try {
      toast({
        title: 'Processing',
        description: `Updating ${selectedUsers.length} users...`,
        variant: 'info',
      });

      await Promise.all(
        selectedUsers.map(userId => api.updateUser(userId, { role: newRole }))
      );
      
      toast({
        title: 'Success',
        description: `Successfully updated ${selectedUsers.length} users`,
        variant: 'success',
      });
      
      setSelectedUsers([]);
      loadUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update some users',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'default';
      case 'user': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-64 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
            <div className="h-5 w-80 bg-[#E2E8F0] animate-pulse rounded"></div>
          </div>
          <div className="h-11 w-32 bg-[#E2E8F0] animate-pulse rounded"></div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="h-10 w-full bg-[#E2E8F0] animate-pulse rounded mb-6"></div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <div className="h-6 w-32 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
          <div className="h-4 w-64 bg-[#E2E8F0] animate-pulse rounded mb-6"></div>
          <SkeletonTable rows={8} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-[#0F172A] font-['Poppins']">
            User Management
          </h1>
          <p className="text-[#64748B] mt-2">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => exportUsersToCSV(filteredUsers)}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportUsersToPDF(filteredUsers)}>
            Export PDF
          </Button>
          <Button onClick={() => navigate('/admin/users/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedUsers.length > 0 && (
        <Card className="border-[#14B8A6] bg-[#14B8A6]/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UsersIcon className="h-5 w-5 text-[#14B8A6]" />
                <span className="text-sm font-medium text-[#0F172A]">
                  {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleBulkDeactivate}>
                  Deactivate Selected
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkRoleChange('user')}>
                  Set as User
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleBulkRoleChange('viewer')}>
                  Set as Viewer
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            View and manage all users in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#991B1B] px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[#64748B]">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={(checked) => handleSelectUser(user.id, checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-[#0F172A]">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <div className="flex items-center text-[#10B981]">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center text-[#64748B]">
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactive
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.last_login 
                        ? new Date(user.last_login).toLocaleDateString()
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {user.created_at 
                        ? new Date(user.created_at).toLocaleDateString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {user.is_active && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeactivateUser(user.id, user.name)}
                          >
                            <Trash2 className="h-4 w-4 text-[#EF4444]" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
