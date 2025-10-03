/**
 * Comprehensive Audit Logging System for GDPR/HIPAA Compliance
 * Tracks all data access, modifications, and user activities
 */

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  sessionId: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceType: 'contact' | 'patient' | 'document' | 'appointment' | 'deal' | 'property' | 'user' | 'system';
  details: {
    endpoint?: string;
    method?: string;
    statusCode?: number;
    ipAddress: string;
    userAgent: string;
    location?: {
      country?: string;
      city?: string;
      coordinates?: [number, number];
    };
    changes?: {
      field: string;
      oldValue?: any;
      newValue?: any;
      encrypted: boolean;
    }[];
    searchQuery?: string;
    exportFormat?: string;
    reason?: string;
  };
  compliance: {
    dataClassification: 'PUBLIC' | 'PII' | 'PHI' | 'SENSITIVE';
    legalBasis?: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
    retentionPeriod: number; // days
    requiresNotification: boolean;
  };
  risk: {
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: string[];
    requiresReview: boolean;
  };
}

export type AuditAction = 
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT'
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED' | 'PASSWORD_CHANGE'
  | 'SEARCH' | 'FILTER' | 'SORT' | 'BULK_UPDATE' | 'BULK_DELETE'
  | 'SHARE' | 'DOWNLOAD' | 'PRINT' | 'EMAIL' | 'SMS'
  | 'BACKUP' | 'RESTORE' | 'ENCRYPT' | 'DECRYPT'
  | 'PERMISSION_CHANGE' | 'ROLE_CHANGE' | 'SETTINGS_CHANGE'
  | 'DATA_ANONYMIZE' | 'DATA_PURGE' | 'KEY_ROTATION';

export type AuditResource = 
  | 'user_profile' | 'contact_record' | 'patient_record' | 'medical_history'
  | 'treatment_plan' | 'appointment' | 'document' | 'signature'
  | 'property_listing' | 'deal' | 'pipeline' | 'analytics'
  | 'automation_workflow' | 'email_template' | 'sms_template'
  | 'encryption_key' | 'audit_log' | 'backup' | 'system_settings';

export interface AuditFilter {
  userId?: string;
  userRole?: string;
  action?: AuditAction;
  resourceType?: string;
  dateFrom?: string;
  dateTo?: string;
  riskLevel?: string;
  dataClassification?: string;
  ipAddress?: string;
  requiresReview?: boolean;
}

export interface AuditSummary {
  totalEvents: number;
  eventsByAction: Record<AuditAction, number>;
  eventsByResource: Record<string, number>;
  eventsByUser: Record<string, number>;
  riskDistribution: Record<string, number>;
  complianceAlerts: number;
  timeRange: {
    from: string;
    to: string;
  };
}

class AuditLogger {
  private events: AuditEvent[] = [];
  private listeners: ((event: AuditEvent) => void)[] = [];

  /**
   * Log an audit event
   */
  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<string> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date().toISOString()
    };

    // Store the event
    this.events.push(auditEvent);

    // Trigger real-time alerts for high-risk events
    if (auditEvent.risk.level === 'HIGH' || auditEvent.risk.level === 'CRITICAL') {
      this.triggerSecurityAlert(auditEvent);
    }

    // Notify listeners
    this.listeners.forEach(listener => listener(auditEvent));

    // In production, persist to secure audit database
    await this.persistEvent(auditEvent);

    return auditEvent.id;
  }

  /**
   * Log user authentication events
   */
  async logAuth(
    action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED',
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    sessionId: string,
    ipAddress: string,
    userAgent: string,
    reason?: string
  ): Promise<string> {
    return this.log({
      userId,
      userEmail,
      userName,
      userRole,
      sessionId,
      action,
      resource: 'user_profile',
      resourceId: userId,
      resourceType: 'user',
      details: {
        ipAddress,
        userAgent,
        reason
      },
      compliance: {
        dataClassification: 'PII',
        legalBasis: 'legitimate_interests',
        retentionPeriod: 2555, // 7 years
        requiresNotification: action === 'LOGIN_FAILED'
      },
      risk: {
        level: action === 'LOGIN_FAILED' ? 'MEDIUM' : 'LOW',
        factors: action === 'LOGIN_FAILED' ? ['failed_authentication'] : [],
        requiresReview: action === 'LOGIN_FAILED'
      }
    });
  }

  /**
   * Log data access events
   */
  async logDataAccess(
    action: 'READ' | 'SEARCH' | 'EXPORT',
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    sessionId: string,
    resourceType: AuditEvent['resourceType'],
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    details: {
      searchQuery?: string;
      exportFormat?: string;
      recordCount?: number;
    } = {}
  ): Promise<string> {
    const dataClassification = this.getDataClassification(resourceType);
    const riskLevel = this.assessRiskLevel(action, resourceType, details);

    return this.log({
      userId,
      userEmail,
      userName,
      userRole,
      sessionId,
      action: action.toUpperCase() as AuditAction,
      resource: `${resourceType}_record` as AuditResource,
      resourceId,
      resourceType,
      details: {
        ipAddress,
        userAgent,
        ...details
      },
      compliance: {
        dataClassification,
        legalBasis: dataClassification === 'PHI' ? 'legal_obligation' : 'legitimate_interests',
        retentionPeriod: dataClassification === 'PHI' ? 2555 : 1095,
        requiresNotification: action === 'EXPORT' && dataClassification !== 'PUBLIC'
      },
      risk: {
        level: riskLevel,
        factors: this.getRiskFactors(action, resourceType, details),
        requiresReview: riskLevel === 'HIGH' || riskLevel === 'CRITICAL'
      }
    });
  }

  /**
   * Log data modification events
   */
  async logDataModification(
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    userId: string,
    userEmail: string,
    userName: string,
    userRole: string,
    sessionId: string,
    resourceType: AuditEvent['resourceType'],
    resourceId: string,
    ipAddress: string,
    userAgent: string,
    changes: AuditEvent['details']['changes'] = [],
    reason?: string
  ): Promise<string> {
    const dataClassification = this.getDataClassification(resourceType);
    const riskLevel = action === 'DELETE' ? 'HIGH' : 'MEDIUM';

    return this.log({
      userId,
      userEmail,
      userName,
      userRole,
      sessionId,
      action,
      resource: `${resourceType}_record` as AuditResource,
      resourceId,
      resourceType,
      details: {
        ipAddress,
        userAgent,
        changes,
        reason
      },
      compliance: {
        dataClassification,
        legalBasis: dataClassification === 'PHI' ? 'legal_obligation' : 'legitimate_interests',
        retentionPeriod: dataClassification === 'PHI' ? 2555 : 1095,
        requiresNotification: action === 'DELETE' && dataClassification !== 'PUBLIC'
      },
      risk: {
        level: riskLevel,
        factors: this.getRiskFactors(action, resourceType, { changes }),
        requiresReview: action === 'DELETE' || changes.some(c => c.encrypted)
      }
    });
  }

  /**
   * Get audit events with filtering
   */
  async getEvents(filter: AuditFilter = {}, limit: number = 100, offset: number = 0): Promise<AuditEvent[]> {
    let filteredEvents = [...this.events];

    // Apply filters
    if (filter.userId) {
      filteredEvents = filteredEvents.filter(e => e.userId === filter.userId);
    }
    if (filter.userRole) {
      filteredEvents = filteredEvents.filter(e => e.userRole === filter.userRole);
    }
    if (filter.action) {
      filteredEvents = filteredEvents.filter(e => e.action === filter.action);
    }
    if (filter.resourceType) {
      filteredEvents = filteredEvents.filter(e => e.resourceType === filter.resourceType);
    }
    if (filter.dateFrom) {
      filteredEvents = filteredEvents.filter(e => e.timestamp >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      filteredEvents = filteredEvents.filter(e => e.timestamp <= filter.dateTo!);
    }
    if (filter.riskLevel) {
      filteredEvents = filteredEvents.filter(e => e.risk.level === filter.riskLevel);
    }
    if (filter.dataClassification) {
      filteredEvents = filteredEvents.filter(e => e.compliance.dataClassification === filter.dataClassification);
    }
    if (filter.ipAddress) {
      filteredEvents = filteredEvents.filter(e => e.details.ipAddress === filter.ipAddress);
    }
    if (filter.requiresReview !== undefined) {
      filteredEvents = filteredEvents.filter(e => e.risk.requiresReview === filter.requiresReview);
    }

    // Sort by timestamp (newest first)
    filteredEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    return filteredEvents.slice(offset, offset + limit);
  }

  /**
   * Get audit summary
   */
  async getSummary(filter: AuditFilter = {}): Promise<AuditSummary> {
    const events = await this.getEvents(filter, 10000); // Get all events for summary

    const summary: AuditSummary = {
      totalEvents: events.length,
      eventsByAction: {} as Record<AuditAction, number>,
      eventsByResource: {},
      eventsByUser: {},
      riskDistribution: {},
      complianceAlerts: 0,
      timeRange: {
        from: events.length > 0 ? events[events.length - 1].timestamp : new Date().toISOString(),
        to: events.length > 0 ? events[0].timestamp : new Date().toISOString()
      }
    };

    events.forEach(event => {
      // Count by action
      summary.eventsByAction[event.action] = (summary.eventsByAction[event.action] || 0) + 1;

      // Count by resource
      summary.eventsByResource[event.resourceType] = (summary.eventsByResource[event.resourceType] || 0) + 1;

      // Count by user
      summary.eventsByUser[event.userName] = (summary.eventsByUser[event.userName] || 0) + 1;

      // Count by risk level
      summary.riskDistribution[event.risk.level] = (summary.riskDistribution[event.risk.level] || 0) + 1;

      // Count compliance alerts
      if (event.compliance.requiresNotification || event.risk.requiresReview) {
        summary.complianceAlerts++;
      }
    });

    return summary;
  }

  /**
   * Export audit logs for compliance reporting
   */
  async exportLogs(
    filter: AuditFilter = {},
    format: 'json' | 'csv' | 'xml' = 'json'
  ): Promise<string> {
    const events = await this.getEvents(filter, 10000);
    
    switch (format) {
      case 'csv':
        return this.exportToCSV(events);
      case 'xml':
        return this.exportToXML(events);
      default:
        return JSON.stringify(events, null, 2);
    }
  }

  /**
   * Add event listener for real-time monitoring
   */
  addEventListener(listener: (event: AuditEvent) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: AuditEvent) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Private helper methods
   */
  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDataClassification(resourceType: string): AuditEvent['compliance']['dataClassification'] {
    switch (resourceType) {
      case 'patient':
      case 'appointment':
        return 'PHI';
      case 'contact':
      case 'user':
        return 'PII';
      case 'document':
      case 'deal':
        return 'SENSITIVE';
      default:
        return 'PUBLIC';
    }
  }

  private assessRiskLevel(
    action: string,
    resourceType: string,
    details: any
  ): AuditEvent['risk']['level'] {
    if (action === 'DELETE' || action === 'EXPORT') return 'HIGH';
    if (resourceType === 'patient' || resourceType === 'user') return 'MEDIUM';
    if (details.recordCount && details.recordCount > 100) return 'MEDIUM';
    return 'LOW';
  }

  private getRiskFactors(action: string, resourceType: string, details: any): string[] {
    const factors: string[] = [];
    
    if (action === 'DELETE') factors.push('data_deletion');
    if (action === 'EXPORT') factors.push('data_export');
    if (resourceType === 'patient') factors.push('phi_access');
    if (details.changes?.some((c: any) => c.encrypted)) factors.push('encrypted_data_modified');
    if (details.recordCount && details.recordCount > 100) factors.push('bulk_operation');
    
    return factors;
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    // In production, persist to secure audit database
    // For demo, we just store in memory
    console.log('Audit event logged:', event.action, event.resource, event.userId);
  }

  private triggerSecurityAlert(event: AuditEvent): void {
    // In production, send alerts to security team
    console.warn('SECURITY ALERT:', event.risk.level, event.action, event.userId);
  }

  private exportToCSV(events: AuditEvent[]): string {
    const headers = [
      'Timestamp', 'User', 'Action', 'Resource', 'Resource ID',
      'IP Address', 'Risk Level', 'Data Classification'
    ];

    const rows = events.map(event => [
      event.timestamp,
      event.userName,
      event.action,
      event.resource,
      event.resourceId,
      event.details.ipAddress,
      event.risk.level,
      event.compliance.dataClassification
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private exportToXML(events: AuditEvent[]): string {
    const xmlEvents = events.map(event => `
      <event id="${event.id}">
        <timestamp>${event.timestamp}</timestamp>
        <user>${event.userName}</user>
        <action>${event.action}</action>
        <resource>${event.resource}</resource>
        <resourceId>${event.resourceId}</resourceId>
        <ipAddress>${event.details.ipAddress}</ipAddress>
        <riskLevel>${event.risk.level}</riskLevel>
        <dataClassification>${event.compliance.dataClassification}</dataClassification>
      </event>
    `).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
    <auditLog>
      ${xmlEvents}
    </auditLog>`;
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();

// Convenience functions for common audit operations
export const logUserLogin = (
  userId: string,
  userEmail: string,
  userName: string,
  userRole: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string
) => auditLogger.logAuth('LOGIN', userId, userEmail, userName, userRole, sessionId, ipAddress, userAgent);

export const logUserLogout = (
  userId: string,
  userEmail: string,
  userName: string,
  userRole: string,
  sessionId: string,
  ipAddress: string,
  userAgent: string
) => auditLogger.logAuth('LOGOUT', userId, userEmail, userName, userRole, sessionId, ipAddress, userAgent);

export const logDataRead = (
  userId: string,
  userEmail: string,
  userName: string,
  userRole: string,
  sessionId: string,
  resourceType: AuditEvent['resourceType'],
  resourceId: string,
  ipAddress: string,
  userAgent: string
) => auditLogger.logDataAccess('READ', userId, userEmail, userName, userRole, sessionId, resourceType, resourceId, ipAddress, userAgent);

export const logDataUpdate = (
  userId: string,
  userEmail: string,
  userName: string,
  userRole: string,
  sessionId: string,
  resourceType: AuditEvent['resourceType'],
  resourceId: string,
  ipAddress: string,
  userAgent: string,
  changes: AuditEvent['details']['changes'] = []
) => auditLogger.logDataModification('UPDATE', userId, userEmail, userName, userRole, sessionId, resourceType, resourceId, ipAddress, userAgent, changes);

export default auditLogger;