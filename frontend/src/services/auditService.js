/**
 * Audit Logging Service
 * Tracks and logs administrative actions for compliance and security
 */

class AuditService {
  constructor() {
    this.logs = [];
  }

  /**
   * Log an action
   */
  log(action, details = {}) {
    const user = this.getCurrentUser();
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      user: user?.name || 'Unknown',
      userId: user?.id,
      action: action,
      description: this.getActionDescription(action),
      target: details.target || null,
      metadata: details.metadata || {},
      severity: this.getSeverity(action),
      ipAddress: details.ipAddress || 'Unknown',
    };

    this.logs.push(logEntry);
    
    // Send to backend
    this.sendToBackend(logEntry);
    
    // Store in localStorage for offline support
    this.storeLocally(logEntry);

    return logEntry;
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      return null;
    }
  }

  /**
   * Get human-readable description for action
   */
  getActionDescription(action) {
    const descriptions = {
      // User management
      user_created: 'Created user account',
      user_updated: 'Updated user information',
      user_deactivated: 'Deactivated user account',
      user_activated: 'Activated user account',
      user_deleted: 'Deleted user account',
      role_changed: 'Changed user role',
      
      // Organization management
      org_updated: 'Updated organization settings',
      plan_changed: 'Changed organization plan',
      billing_updated: 'Updated billing information',
      
      // Bulk operations
      bulk_user_update: 'Performed bulk user update',
      bulk_user_deactivate: 'Performed bulk user deactivation',
      bulk_user_delete: 'Performed bulk user deletion',
      bulk_role_change: 'Performed bulk role change',
      
      // Data operations
      data_exported: 'Exported data',
      data_imported: 'Imported data',
      
      // Security events
      login_success: 'Successful login',
      login_failed: 'Failed login attempt',
      logout: 'User logout',
      password_changed: 'Changed password',
      permission_denied: 'Unauthorized access attempt',
      
      // System events
      settings_updated: 'Updated system settings',
      integration_added: 'Added integration',
      integration_removed: 'Removed integration',
    };

    return descriptions[action] || action;
  }

  /**
   * Determine severity level
   */
  getSeverity(action) {
    const errorActions = ['login_failed', 'permission_denied', 'user_deleted', 'bulk_user_delete'];
    const warningActions = ['user_deactivated', 'role_changed', 'plan_changed', 'bulk_user_deactivate', 'bulk_role_change'];
    
    if (errorActions.includes(action)) return 'error';
    if (warningActions.includes(action)) return 'warning';
    return 'info';
  }

  /**
   * Send log to backend
   */
  async sendToBackend(logEntry) {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/audit-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(logEntry),
      });
    } catch (err) {
      console.error('Failed to send audit log to backend:', err);
    }
  }

  /**
   * Store log locally
   */
  storeLocally(logEntry) {
    try {
      const logs = this.getLocalLogs();
      logs.push(logEntry);
      
      // Keep only last 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      localStorage.setItem('audit_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Failed to store audit log locally:', err);
    }
  }

  /**
   * Get logs from localStorage
   */
  getLocalLogs() {
    try {
      const logsStr = localStorage.getItem('audit_logs');
      return logsStr ? JSON.parse(logsStr) : [];
    } catch (err) {
      return [];
    }
  }

  /**
   * Clear local logs
   */
  clearLocalLogs() {
    localStorage.removeItem('audit_logs');
  }

  // Convenience methods for common actions
  logUserCreated(userName, userEmail) {
    return this.log('user_created', {
      target: userEmail,
      metadata: { userName, userEmail },
    });
  }

  logUserUpdated(userName, userEmail, changes) {
    return this.log('user_updated', {
      target: userEmail,
      metadata: { userName, userEmail, changes },
    });
  }

  logUserDeactivated(userName, userEmail) {
    return this.log('user_deactivated', {
      target: userEmail,
      metadata: { userName, userEmail },
    });
  }

  logRoleChanged(userName, userEmail, oldRole, newRole) {
    return this.log('role_changed', {
      target: userEmail,
      metadata: { userName, userEmail, oldRole, newRole },
    });
  }

  logPlanChanged(oldPlan, newPlan) {
    return this.log('plan_changed', {
      target: 'Organization Plan',
      metadata: { oldPlan, newPlan },
    });
  }

  logBulkOperation(operation, count, targets) {
    return this.log(`bulk_${operation}`, {
      target: `${count} users`,
      metadata: { operation, count, targets },
    });
  }

  logDataExport(format, recordCount) {
    return this.log('data_exported', {
      target: `${format} export`,
      metadata: { format, recordCount },
    });
  }
}

export const auditService = new AuditService();
