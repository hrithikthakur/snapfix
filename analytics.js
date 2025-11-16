/**
 * Analytics Module for SnapFix
 * Supports PostHog, Mixpanel, and barebones file logging
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');

class Analytics {
  constructor() {
    this.provider = null;
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.generateSessionId();
    this.isEnabled = true;
    this.logFile = null;
    this.config = {
      provider: process.env.ANALYTICS_PROVIDER || 'file', // 'posthog', 'mixpanel', 'file'
      posthogApiKey: process.env.POSTHOG_API_KEY || '',
      posthogHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      mixpanelToken: process.env.MIXPANEL_TOKEN || '',
      logToFile: process.env.ANALYTICS_LOG_TO_FILE !== 'false',
      logDirectory: path.join(app.getPath('userData'), 'analytics'),
    };

    this.initialize();
  }

  /**
   * Initialize analytics provider
   */
  initialize() {
    // Create log directory if file logging is enabled
    if (this.config.logToFile) {
      try {
        if (!fs.existsSync(this.config.logDirectory)) {
          fs.mkdirSync(this.config.logDirectory, { recursive: true });
        }
        const logFileName = `analytics-${new Date().toISOString().split('T')[0]}.log`;
        this.logFile = path.join(this.config.logDirectory, logFileName);
      } catch (error) {
        console.error('Failed to create analytics log directory:', error);
      }
    }

    // Initialize provider based on config
    switch (this.config.provider.toLowerCase()) {
      case 'posthog':
        this.initializePostHog();
        break;
      case 'mixpanel':
        this.initializeMixpanel();
        break;
      case 'file':
      default:
        this.provider = 'file';
        break;
    }

    // Track app launch
    this.track('app_launched', {
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch,
    });
  }

  /**
   * Initialize PostHog
   */
  initializePostHog() {
    try {
      // PostHog doesn't have an official Node.js SDK, so we'll use HTTP API
      this.provider = 'posthog';
      console.log('Analytics: PostHog initialized (HTTP API)');
    } catch (error) {
      console.error('Failed to initialize PostHog:', error);
      this.provider = 'file';
    }
  }

  /**
   * Initialize Mixpanel
   */
  initializeMixpanel() {
    try {
      // Mixpanel Node.js SDK would be installed via npm
      // For now, we'll use HTTP API
      this.provider = 'mixpanel';
      console.log('Analytics: Mixpanel initialized (HTTP API)');
    } catch (error) {
      console.error('Failed to initialize Mixpanel:', error);
      this.provider = 'file';
    }
  }

  /**
   * Get or create a unique user ID
   */
  getOrCreateUserId() {
    const userDataPath = app.getPath('userData');
    const userIdFile = path.join(userDataPath, 'analytics-user-id.json');

    try {
      if (fs.existsSync(userIdFile)) {
        const data = JSON.parse(fs.readFileSync(userIdFile, 'utf8'));
        return data.userId;
      }
    } catch (error) {
      console.error('Error reading user ID:', error);
    }

    // Generate new user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      fs.writeFileSync(userIdFile, JSON.stringify({ userId }), 'utf8');
    } catch (error) {
      console.error('Error saving user ID:', error);
    }

    return userId;
  }

  /**
   * Generate a session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track an event
   */
  async track(eventName, properties = {}) {
    if (!this.isEnabled) return;

    const event = {
      event: eventName,
      properties: {
        ...properties,
        userId: this.userId,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
        platform: process.platform,
        version: app.getVersion(),
      },
    };

    // Send to provider
    switch (this.provider) {
      case 'posthog':
        await this.sendToPostHog(event);
        break;
      case 'mixpanel':
        await this.sendToMixpanel(event);
        break;
      case 'file':
      default:
        this.logToFile(event);
        break;
    }
  }

  /**
   * Send event to PostHog
   */
  async sendToPostHog(event) {
    if (!this.config.posthogApiKey) {
      console.warn('PostHog API key not configured');
      this.logToFile(event);
      return;
    }

    try {
      const fetch = require('node-fetch');
      const url = `${this.config.posthogHost}/capture/`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.posthogApiKey,
          event: event.event,
          properties: {
            ...event.properties,
            distinct_id: this.userId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`PostHog API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send event to PostHog:', error);
      // Fallback to file logging
      this.logToFile(event);
    }
  }

  /**
   * Send event to Mixpanel
   */
  async sendToMixpanel(event) {
    if (!this.config.mixpanelToken) {
      console.warn('Mixpanel token not configured');
      this.logToFile(event);
      return;
    }

    try {
      const fetch = require('node-fetch');
      const url = 'https://api.mixpanel.com/track';
      
      const data = {
        event: event.event,
        properties: {
          ...event.properties,
          token: this.config.mixpanelToken,
          distinct_id: this.userId,
        },
      };

      // Mixpanel expects base64 encoded data
      const encodedData = Buffer.from(JSON.stringify(data)).toString('base64');
      const response = await fetch(`${url}?data=${encodedData}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Mixpanel API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send event to Mixpanel:', error);
      // Fallback to file logging
      this.logToFile(event);
    }
  }

  /**
   * Log event to file
   */
  logToFile(event) {
    if (!this.logFile) return;

    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        ...event,
      };
      
      const logLine = JSON.stringify(logEntry) + '\n';
      fs.appendFileSync(this.logFile, logLine, 'utf8');
    } catch (error) {
      console.error('Failed to write to analytics log file:', error);
    }
  }

  /**
   * Identify user with properties
   */
  identify(userProperties = {}) {
    if (!this.isEnabled) return;

    const identifyData = {
      userId: this.userId,
      properties: userProperties,
      timestamp: new Date().toISOString(),
    };

    // Log identification
    this.logToFile({
      event: 'user_identified',
      ...identifyData,
    });

    // Send to providers if configured
    if (this.provider === 'posthog' && this.config.posthogApiKey) {
      // PostHog identify would be sent via separate API call
      console.log('PostHog identify:', identifyData);
    }

    if (this.provider === 'mixpanel' && this.config.mixpanelToken) {
      // Mixpanel identify would be sent via separate API call
      console.log('Mixpanel identify:', identifyData);
    }
  }

  /**
   * Set user properties
   */
  setUserProperties(properties) {
    this.identify(properties);
  }

  /**
   * Track page/screen view
   */
  screen(screenName, properties = {}) {
    this.track('screen_viewed', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    this.track('analytics_toggled', { enabled });
  }

  /**
   * Get analytics summary (for debugging)
   */
  getSummary() {
    return {
      provider: this.provider,
      userId: this.userId,
      sessionId: this.sessionId,
      isEnabled: this.isEnabled,
      logFile: this.logFile,
    };
  }
}

// Export singleton instance
module.exports = new Analytics();

