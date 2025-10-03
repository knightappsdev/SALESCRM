/**
 * Integration Manager for External Services and APIs
 * Provides a unified interface for connecting with third-party services
 */

export interface IntegrationConfig {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'calendar' | 'storage' | 'crm' | 'payment' | 'analytics' | 'communication';
  provider: string;
  status: 'active' | 'inactive' | 'error' | 'pending';
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    clientId?: string;
    clientSecret?: string;
    webhook?: string;
    [key: string]: any;
  };
  settings: {
    syncEnabled: boolean;
    syncInterval: number; // minutes
    lastSync?: string;
    webhookUrl?: string;
    rateLimits?: {
      requestsPerSecond: number;
      requestsPerHour: number;
      requestsPerDay: number;
    };
    [key: string]: any;
  };
  endpoints: {
    base: string;
    auth?: string;
    webhook?: string;
    [endpoint: string]: string | undefined;
  } & {
    base: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationEvent {
  id: string;
  integrationId: string;
  type: 'sync' | 'webhook' | 'api_call' | 'error' | 'auth_refresh';
  direction: 'inbound' | 'outbound';
  status: 'success' | 'failed' | 'pending';
  data: any;
  error?: string;
  timestamp: string;
  retryCount: number;
  metadata?: {
    endpoint?: string;
    httpStatus?: number;
    responseTime?: number;
    [key: string]: any;
  };
}

export interface WebhookHandler {
  integrationId: string;
  eventTypes: string[];
  handler: (event: any) => Promise<void>;
}

export class IntegrationManager {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private webhookHandlers: Map<string, WebhookHandler[]> = new Map();
  private events: IntegrationEvent[] = [];
  private rateLimiters: Map<string, RateLimiter> = new Map();

  /**
   * Register a new integration
   */
  async registerIntegration(config: Omit<IntegrationConfig, 'createdAt' | 'updatedAt'>): Promise<string> {
    const integration: IntegrationConfig = {
      ...config,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(integration.id, integration);
    
    // Initialize rate limiter if limits are defined
    if (integration.settings.rateLimits) {
      this.rateLimiters.set(integration.id, new RateLimiter(integration.settings.rateLimits));
    }

    // Test connection
    await this.testIntegration(integration.id);

    return integration.id;
  }

  /**
   * Update integration configuration
   */
  async updateIntegration(id: string, updates: Partial<IntegrationConfig>): Promise<void> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    const updated: IntegrationConfig = {
      ...integration,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.integrations.set(id, updated);
  }

  /**
   * Get integration by ID
   */
  getIntegration(id: string): IntegrationConfig | undefined {
    return this.integrations.get(id);
  }

  /**
   * List all integrations
   */
  listIntegrations(category?: string): IntegrationConfig[] {
    const integrations = Array.from(this.integrations.values());
    return category 
      ? integrations.filter(i => i.category === category)
      : integrations;
  }

  /**
   * Test integration connection
   */
  async testIntegration(id: string): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration) {
      throw new Error(`Integration ${id} not found`);
    }

    try {
      const response = await this.makeApiCall(id, 'GET', integration.endpoints.base + '/health');
      
      if (response.ok) {
        await this.updateIntegration(id, { status: 'active' });
        return true;
      } else {
        await this.updateIntegration(id, { status: 'error' });
        return false;
      }
    } catch (error) {
      await this.updateIntegration(id, { status: 'error' });
      await this.logEvent(id, 'error', 'outbound', 'failed', null, (error as Error).message);
      return false;
    }
  }

  /**
   * Make API call to integration
   */
  async makeApiCall(
    integrationId: string,
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<Response> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error(`Integration ${integrationId} not found`);
    }

    // Check rate limits
    const rateLimiter = this.rateLimiters.get(integrationId);
    if (rateLimiter && !rateLimiter.canMakeRequest()) {
      throw new Error('Rate limit exceeded');
    }

    const startTime = Date.now();

    try {
      const requestHeaders = {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(integration),
        ...headers
      };

      const response = await fetch(endpoint, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined
      });

      const responseTime = Date.now() - startTime;

      await this.logEvent(
        integrationId,
        'api_call',
        'outbound',
        response.ok ? 'success' : 'failed',
        { method, endpoint, data },
        response.ok ? undefined : `HTTP ${response.status}`,
        {
          endpoint,
          httpStatus: response.status,
          responseTime
        }
      );

      return response;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      await this.logEvent(
        integrationId,
        'api_call',
        'outbound',
        'failed',
        { method, endpoint, data },
        (error as Error).message,
        { endpoint, responseTime }
      );

      throw error;
    }
  }

  /**
   * Register webhook handler
   */
  registerWebhookHandler(handler: WebhookHandler): void {
    const existing = this.webhookHandlers.get(handler.integrationId) || [];
    existing.push(handler);
    this.webhookHandlers.set(handler.integrationId, existing);
  }

  /**
   * Handle incoming webhook
   */
  async handleWebhook(integrationId: string, eventType: string, data: any): Promise<void> {
    const handlers = this.webhookHandlers.get(integrationId) || [];
    const matchingHandlers = handlers.filter(h => h.eventTypes.includes(eventType));

    for (const handler of matchingHandlers) {
      try {
        await handler.handler(data);
        await this.logEvent(integrationId, 'webhook', 'inbound', 'success', data);
      } catch (error) {
        await this.logEvent(integrationId, 'webhook', 'inbound', 'failed', data, (error as Error).message);
      }
    }
  }

  /**
   * Sync data with integration
   */
  async syncData(integrationId: string, direction: 'pull' | 'push' | 'bidirectional' = 'pull'): Promise<void> {
    const integration = this.integrations.get(integrationId);
    if (!integration || !integration.settings.syncEnabled) {
      return;
    }

    try {
      if (direction === 'pull' || direction === 'bidirectional') {
        await this.pullData(integrationId);
      }

      if (direction === 'push' || direction === 'bidirectional') {
        await this.pushData(integrationId);
      }

      await this.updateIntegration(integrationId, {
        settings: {
          ...integration.settings,
          lastSync: new Date().toISOString()
        }
      });

      await this.logEvent(integrationId, 'sync', 'outbound', 'success', { direction });
    } catch (error) {
      await this.logEvent(integrationId, 'sync', 'outbound', 'failed', { direction }, (error as Error).message);
    }
  }

  /**
   * Get integration events
   */
  getEvents(integrationId?: string, limit: number = 100): IntegrationEvent[] {
    let events = [...this.events];
    
    if (integrationId) {
      events = events.filter(e => e.integrationId === integrationId);
    }

    return events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get integration metrics
   */
  getMetrics(integrationId: string, timeframe: 'hour' | 'day' | 'week' = 'day'): {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    errorRate: number;
  } {
    const cutoff = new Date();
    switch (timeframe) {
      case 'hour':
        cutoff.setHours(cutoff.getHours() - 1);
        break;
      case 'day':
        cutoff.setDate(cutoff.getDate() - 1);
        break;
      case 'week':
        cutoff.setDate(cutoff.getDate() - 7);
        break;
    }

    const events = this.events.filter(e => 
      e.integrationId === integrationId &&
      new Date(e.timestamp) > cutoff &&
      e.type === 'api_call'
    );

    const totalRequests = events.length;
    const successfulRequests = events.filter(e => e.status === 'success').length;
    const failedRequests = totalRequests - successfulRequests;
    
    const responseTimes = events
      .filter(e => e.metadata?.responseTime)
      .map(e => e.metadata!.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;

    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      errorRate
    };
  }

  /**
   * Private helper methods
   */
  private getAuthHeaders(integration: IntegrationConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    if (integration.credentials.apiKey) {
      headers['Authorization'] = `Bearer ${integration.credentials.apiKey}`;
    }

    if (integration.credentials.accessToken) {
      headers['Authorization'] = `Bearer ${integration.credentials.accessToken}`;
    }

    return headers;
  }

  private async pullData(integrationId: string): Promise<void> {
    // Implementation depends on specific integration
    console.log(`Pulling data from integration ${integrationId}`);
  }

  private async pushData(integrationId: string): Promise<void> {
    // Implementation depends on specific integration
    console.log(`Pushing data to integration ${integrationId}`);
  }

  private async logEvent(
    integrationId: string,
    type: IntegrationEvent['type'],
    direction: IntegrationEvent['direction'],
    status: IntegrationEvent['status'],
    data: any,
    error?: string,
    metadata?: any
  ): Promise<void> {
    const event: IntegrationEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      integrationId,
      type,
      direction,
      status,
      data,
      error,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      metadata
    };

    this.events.push(event);

    // Keep only last 10000 events to prevent memory issues
    if (this.events.length > 10000) {
      this.events = this.events.slice(-10000);
    }
  }
}

/**
 * Rate Limiter for API calls
 */
class RateLimiter {
  private requests: number[] = [];
  private limits: {
    requestsPerSecond: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };

  constructor(limits: {
    requestsPerSecond: number;
    requestsPerHour: number;
    requestsPerDay: number;
  }) {
    this.limits = limits;
  }

  canMakeRequest(): boolean {
    const now = Date.now();
    const secondAgo = now - 1000;
    const hourAgo = now - 3600000;
    const dayAgo = now - 86400000;

    // Clean old requests
    this.requests = this.requests.filter(time => time > dayAgo);

    const requestsLastSecond = this.requests.filter(time => time > secondAgo).length;
    const requestsLastHour = this.requests.filter(time => time > hourAgo).length;
    const requestsLastDay = this.requests.length;

    if (requestsLastSecond >= this.limits.requestsPerSecond ||
        requestsLastHour >= this.limits.requestsPerHour ||
        requestsLastDay >= this.limits.requestsPerDay) {
      return false;
    }

    this.requests.push(now);
    return true;
  }
}

// Export singleton instance
export const integrationManager = new IntegrationManager();

// Common integrations setup
export const setupCommonIntegrations = async () => {
  // Email integrations
  await integrationManager.registerIntegration({
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'email',
    provider: 'SendGrid',
    status: 'inactive',
    credentials: {},
    settings: {
      syncEnabled: false,
      syncInterval: 60,
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerHour: 3600,
        requestsPerDay: 86400
      }
    },
    endpoints: {
      base: 'https://api.sendgrid.com/v3',
      send: '/mail/send',
      templates: '/templates'
    }
  });

  // SMS integrations
  await integrationManager.registerIntegration({
    id: 'twilio',
    name: 'Twilio',
    category: 'sms',
    provider: 'Twilio',
    status: 'inactive',
    credentials: {},
    settings: {
      syncEnabled: false,
      syncInterval: 30,
      rateLimits: {
        requestsPerSecond: 1,
        requestsPerHour: 3600,
        requestsPerDay: 86400
      }
    },
    endpoints: {
      base: 'https://api.twilio.com/2010-04-01',
      messages: '/Messages.json'
    }
  });

  // Calendar integrations
  await integrationManager.registerIntegration({
    id: 'google_calendar',
    name: 'Google Calendar',
    category: 'calendar',
    provider: 'Google',
    status: 'inactive',
    credentials: {},
    settings: {
      syncEnabled: true,
      syncInterval: 15,
      rateLimits: {
        requestsPerSecond: 10,
        requestsPerHour: 3600,
        requestsPerDay: 86400
      }
    },
    endpoints: {
      base: 'https://www.googleapis.com/calendar/v3',
      events: '/calendars/primary/events'
    }
  });

  // Storage integrations
  await integrationManager.registerIntegration({
    id: 'aws_s3',
    name: 'Amazon S3',
    category: 'storage',
    provider: 'AWS',
    status: 'inactive',
    credentials: {},
    settings: {
      syncEnabled: false,
      syncInterval: 60,
      rateLimits: {
        requestsPerSecond: 100,
        requestsPerHour: 360000,
        requestsPerDay: 8640000
      }
    },
    endpoints: {
      base: 'https://s3.amazonaws.com'
    }
  });
};