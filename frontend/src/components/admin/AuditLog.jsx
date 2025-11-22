import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SkeletonTable } from '@/components/ui/skeleton';
import { api } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { exportAuditLogsToCSV, exportAuditLogsToPDF } from '@/lib/exportUtils';

export default function AuditLog() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7days');

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, dateRange]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load audit logs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const actions = [
      { type: 'user_created', description: 'Created user account', severity: 'info' },
      { type: 'user_updated', description: 'Updated user information', severity: 'info' },
      { type: 'user_deactivated', description: 'Deactivated user account', severity: 'warning' },
      { type: 'role_changed', description: 'Changed user role', severity: 'warning' },
      { type: 'plan_changed', description: 'Changed organization plan', severity: 'info' },
      { type: 'settings_updated', description: 'Updated organization settings', severity: 'info' },
      { type: 'bulk_operation', description: 'Performed bulk user operation', severity: 'warning' },
      { type: 'data_exported', description: 'Exported user data', severity: 'info' },
      { type: 'login_failed', description: 'Failed login attempt', severity: 'error' },
      { type: 'permission_denied', description: 'Unauthorized access attempt', severity: 'error' },
    ];

    const users = ['Admin User', 'John Doe', 'Jane Smith', 'Bob Johnson'];
    const targets = ['alice@example.com', 'bob@example.com', 'charlie@example.com', 'Organization Settings', 'User Database'];

    return Array.from({ length: 50 }, (_, i) => {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      
      return {
        id: i + 1,
        timestamp: timestamp.toISOString(),
        user: users[Math.floor(Math.random() * users.length)],
        action: action.type,
        description: action.description,
        target: targets[Math.floor(Math.random() * targets.length)],
        severity: action.severity,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const getSeverityBadge = (severity) => {
    const variants = {
      info: 'default',
      warning: 'warning',
      error: 'destructive',
    };
    return variants[severity] || 'default';
  };

  const handleExportCSV = () => {
    exportAuditLogsToCSV(filteredLogs);
    toast({
      title: 'Export Complete',
      description: 'Audit logs exported to CSV successfully',
      variant: 'success',
    });
  };

  const handleExportPDF = () => {
    exportAuditLogsToPDF(filteredLogs);
    toast({
      title: 'Export Complete',
      description: 'Audit logs exported to PDF successfully',
      variant: 'success',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-64 bg-[#E2E8F0] animate-pulse rounded mb-2"></div>
            <div className="h-5 w-80 bg-[#E2E8F0] animate-pulse rounded"></div>
          </div>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-6">
          <SkeletonTable rows={10} columns={6} />
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
            Audit Log
          </h1>
          <p className="text-[#64748B] mt-2">
            Track all administrative actions and system events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="all">All Actions</option>
              <option value="user_created">User Created</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deactivated">User Deactivated</option>
              <option value="role_changed">Role Changed</option>
              <option value="plan_changed">Plan Changed</option>
              <option value="settings_updated">Settings Updated</option>
              <option value="bulk_operation">Bulk Operation</option>
              <option value="data_exported">Data Exported</option>
            </Select>

            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="24hours">Last 24 Hours</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length} entries)</CardTitle>
          <CardDescription>
            Detailed record of all administrative actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Severity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#64748B]">
                    No audit logs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium text-[#0F172A]">
                      {log.user}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">{log.description}</p>
                        <p className="text-xs text-[#64748B]">{log.action}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{log.target}</TableCell>
                    <TableCell className="font-mono text-xs text-[#64748B]">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSeverityBadge(log.severity)}>
                        {log.severity}
                      </Badge>
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
