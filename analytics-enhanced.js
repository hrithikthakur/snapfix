/**
 * Enhanced Analytics Module for SnapFix
 * Tracks specific metrics for product decisions:
 * - Shortcut activation rates
 * - Daily usage frequency
 * - AI failure rates
 * - Replacement failure rates
 * - Permission denial rates
 * - Text replacement vs clipboard mode
 * - Text length distribution
 * - Power user identification
 * - Onboarding effectiveness
 */

const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class EnhancedAnalytics {
  constructor() {
    this.userId = this.getOrCreateUserId();
    this.sessionId = this.generateSessionId();
    this.isEnabled = true;
    this.config = {
      provider: process.env.ANALYTICS_PROVIDER || 'file',
      posthogApiKey: process.env.POSTHOG_API_KEY || '',
      posthogHost: process.env.POSTHOG_HOST || 'https://app.posthog.com',
      mixpanelToken: process.env.MIXPANEL_TOKEN || '',
      logToFile: process.env.ANALYTICS_LOG_TO_FILE !== 'false',
      logDirectory: path.join(app.getPath('userData'), 'analytics'),
      metricsFile: path.join(app.getPath('userData'), 'analytics', 'metrics.json'),
    };

    // Daily usage tracking
    this.dailyUsage = this.loadDailyUsage();
    this.sessionStartTime = Date.now();
    this.sessionEvents = [];

    this.initialize();
    this.trackSessionStart();
  }

  /**
   * Initialize analytics
   */
  initialize() {
    if (this.config.logToFile) {
      try {
        if (!fs.existsSync(this.config.logDirectory)) {
          fs.mkdirSync(this.config.logDirectory, { recursive: true });
        }
      } catch (error) {
        console.error('Failed to create analytics directory:', error);
      }
    }

    // Load existing metrics
    this.metrics = this.loadMetrics();
    
    // Initialize daily counters
    this.initializeDailyCounters();
  }

  /**
   * Load or create metrics file
   */
  loadMetrics() {
    try {
      if (fs.existsSync(this.config.metricsFile)) {
        return JSON.parse(fs.readFileSync(this.config.metricsFile, 'utf8'));
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    }

    return {
      firstSeen: new Date().toISOString(),
      totalSessions: 0,
      totalShortcutActivations: 0,
      totalGrammarFixes: 0,
      totalFailures: 0,
      totalAIFailures: 0,
      totalReplacementFailures: 0,
      permissionDeniedCount: 0,
      permissionGrantedCount: 0,
      clipboardModeCount: 0,
      nativeModeCount: 0,
      textLengthDistribution: {
        small: 0,      // < 50 chars
        medium: 0,     // 50-200 chars
        large: 0,       // 200-500 chars
        xlarge: 0,     // > 500 chars
      },
      dailyUsage: {},
      powerUserDays: 0, // Days with 20+ uses
      onboardingCompleted: false,
      onboardingSteps: {
        firstLaunch: false,
        firstShortcut: false,
        firstSuccess: false,
        firstPermission: false,
      },
    };
  }

  /**
   * Save metrics to file
   */
  saveMetrics() {
    try {
      fs.writeFileSync(
        this.config.metricsFile,
        JSON.stringify(this.metrics, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  /**
   * Load daily usage data
   */
  loadDailyUsage() {
    const today = this.getTodayKey();
    if (!this.metrics.dailyUsage[today]) {
      this.metrics.dailyUsage[today] = {
        date: today,
        shortcutActivations: 0,
        grammarFixes: 0,
        successes: 0,
        failures: 0,
        aiFailures: 0,
        replacementFailures: 0,
      };
    }
    return this.metrics.dailyUsage[today];
  }

  /**
   * Initialize daily counters
   */
  initializeDailyCounters() {
    const today = this.getTodayKey();
    if (!this.metrics.dailyUsage[today]) {
      this.metrics.dailyUsage[today] = {
        date: today,
        shortcutActivations: 0,
        grammarFixes: 0,
        successes: 0,
        failures: 0,
        aiFailures: 0,
        replacementFailures: 0,
        textLengths: [],
        methods: { native: 0, clipboard: 0 },
      };
    }
  }

  /**
   * Get today's date key (YYYY-MM-DD)
   */
  getTodayKey() {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get or create user ID
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

    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      fs.writeFileSync(userIdFile, JSON.stringify({ userId }), 'utf8');
    } catch (error) {
      console.error('Error saving user ID:', error);
    }

    return userId;
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Track session start
   */
  trackSessionStart() {
    this.metrics.totalSessions++;
    this.metrics.onboardingSteps.firstLaunch = true;
    this.saveMetrics();

    this.track('app_launched', {
      version: app.getVersion(),
      platform: process.platform,
      session_number: this.metrics.totalSessions,
      is_first_session: this.metrics.totalSessions === 1,
    });
  }

  /**
   * Track shortcut activation
   */
  trackShortcutActivated() {
    this.metrics.totalShortcutActivations++;
    this.dailyUsage.shortcutActivations++;
    
    // Track onboarding
    if (!this.metrics.onboardingSteps.firstShortcut) {
      this.metrics.onboardingSteps.firstShortcut = true;
    }

    this.saveMetrics();

    this.track('shortcut_activated', {
      total_activations: this.metrics.totalShortcutActivations,
      daily_activations: this.dailyUsage.shortcutActivations,
    });
  }

  /**
   * Track grammar fix attempt
   */
  trackGrammarFixAttempted(textLength, method) {
    this.metrics.totalGrammarFixes++;
    this.dailyUsage.grammarFixes++;
    
    // Track method usage
    if (method === 'native') {
      this.metrics.nativeModeCount++;
      this.dailyUsage.methods.native++;
    } else {
      this.metrics.clipboardModeCount++;
      this.dailyUsage.methods.clipboard++;
    }

    // Track text length distribution
    if (textLength < 50) {
      this.metrics.textLengthDistribution.small++;
    } else if (textLength < 200) {
      this.metrics.textLengthDistribution.medium++;
    } else if (textLength < 500) {
      this.metrics.textLengthDistribution.large++;
    } else {
      this.metrics.textLengthDistribution.xlarge++;
    }

    this.dailyUsage.textLengths.push(textLength);

    this.saveMetrics();

    this.track('grammar_fix_attempted', {
      text_length: textLength,
      method: method,
      total_fixes: this.metrics.totalGrammarFixes,
      daily_fixes: this.dailyUsage.grammarFixes,
    });
  }

  /**
   * Track grammar fix success
   */
  trackGrammarFixSucceeded(textLength, method, responseTime) {
    this.dailyUsage.successes++;
    
    // Track onboarding
    if (!this.metrics.onboardingSteps.firstSuccess) {
      this.metrics.onboardingSteps.firstSuccess = true;
      this.metrics.onboardingCompleted = 
        this.metrics.onboardingSteps.firstLaunch &&
        this.metrics.onboardingSteps.firstShortcut &&
        this.metrics.onboardingSteps.firstSuccess;
    }

    this.saveMetrics();

    this.track('grammar_fix_succeeded', {
      text_length: textLength,
      method: method,
      response_time: responseTime,
      daily_successes: this.dailyUsage.successes,
    });

    // Check for power user status
    this.checkPowerUserStatus();
  }

  /**
   * Track AI failure
   */
  trackAIFailure(errorType, errorMessage, textLength) {
    this.metrics.totalFailures++;
    this.metrics.totalAIFailures++;
    this.dailyUsage.failures++;
    this.dailyUsage.aiFailures++;

    this.saveMetrics();

    this.track('ai_failure', {
      error_type: errorType,
      error_message: errorMessage,
      text_length: textLength,
      total_ai_failures: this.metrics.totalAIFailures,
      daily_ai_failures: this.dailyUsage.aiFailures,
    });
  }

  /**
   * Track replacement failure
   */
  trackReplacementFailure(method, textLength) {
    this.metrics.totalFailures++;
    this.metrics.totalReplacementFailures++;
    this.dailyUsage.failures++;
    this.dailyUsage.replacementFailures++;

    this.saveMetrics();

    this.track('replacement_failure', {
      method: method,
      text_length: textLength,
      total_replacement_failures: this.metrics.totalReplacementFailures,
      daily_replacement_failures: this.dailyUsage.replacementFailures,
    });
  }

  /**
   * Track permission denied
   */
  trackPermissionDenied() {
    this.metrics.permissionDeniedCount++;

    this.saveMetrics();

    this.track('permission_denied', {
      total_denials: this.metrics.permissionDeniedCount,
      has_ever_granted: this.metrics.permissionGrantedCount > 0,
    });
  }

  /**
   * Track permission granted
   */
  trackPermissionGranted() {
    this.metrics.permissionGrantedCount++;
    
    // Track onboarding
    if (!this.metrics.onboardingSteps.firstPermission) {
      this.metrics.onboardingSteps.firstPermission = true;
    }

    this.saveMetrics();

    this.track('permission_granted', {
      total_grants: this.metrics.permissionGrantedCount,
      was_first_grant: this.metrics.permissionGrantedCount === 1,
    });
  }

  /**
   * Check and track power user status
   */
  checkPowerUserStatus() {
    const todayUsage = this.dailyUsage.grammarFixes;
    
    if (todayUsage >= 20 && todayUsage < 21) {
      // First time hitting 20 today
      this.metrics.powerUserDays++;
      this.track('power_user_achieved', {
        daily_usage: todayUsage,
        total_power_user_days: this.metrics.powerUserDays,
      });
    }
  }

  /**
   * Track app close
   */
  trackAppClosed() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    this.track('app_closed', {
      session_duration: sessionDuration,
      daily_shortcut_activations: this.dailyUsage.shortcutActivations,
      daily_grammar_fixes: this.dailyUsage.grammarFixes,
      daily_successes: this.dailyUsage.successes,
      daily_failures: this.dailyUsage.failures,
      is_power_user_today: this.dailyUsage.grammarFixes >= 20,
    });

    this.saveMetrics();
  }

  /**
   * Get analytics summary for reporting
   */
  getSummary() {
    const today = this.getTodayKey();
    const todayUsage = this.metrics.dailyUsage[today] || {};
    
    // Calculate averages
    const totalDays = Object.keys(this.metrics.dailyUsage).length || 1;
    const avgDailyUsage = this.metrics.totalGrammarFixes / totalDays;
    
    // Calculate failure rates
    const aiFailureRate = this.metrics.totalGrammarFixes > 0
      ? (this.metrics.totalAIFailures / this.metrics.totalGrammarFixes * 100).toFixed(2)
      : 0;
    
    const replacementFailureRate = this.metrics.totalGrammarFixes > 0
      ? (this.metrics.totalReplacementFailures / this.metrics.totalGrammarFixes * 100).toFixed(2)
      : 0;

    // Calculate method preference
    const totalMethodUses = this.metrics.nativeModeCount + this.metrics.clipboardModeCount;
    const nativeModeRate = totalMethodUses > 0
      ? (this.metrics.nativeModeCount / totalMethodUses * 100).toFixed(2)
      : 0;
    const clipboardModeRate = totalMethodUses > 0
      ? (this.metrics.clipboardModeCount / totalMethodUses * 100).toFixed(2)
      : 0;

    // Calculate text length distribution
    const totalTextUses = Object.values(this.metrics.textLengthDistribution).reduce((a, b) => a + b, 0);
    const textLengthPercentages = totalTextUses > 0 ? {
      small: (this.metrics.textLengthDistribution.small / totalTextUses * 100).toFixed(2),
      medium: (this.metrics.textLengthDistribution.medium / totalTextUses * 100).toFixed(2),
      large: (this.metrics.textLengthDistribution.large / totalTextUses * 100).toFixed(2),
      xlarge: (this.metrics.textLengthDistribution.xlarge / totalTextUses * 100).toFixed(2),
    } : { small: 0, medium: 0, large: 0, xlarge: 0 };

    // Calculate permission denial rate
    const totalPermissionAttempts = this.metrics.permissionDeniedCount + this.metrics.permissionGrantedCount;
    const permissionDenialRate = totalPermissionAttempts > 0
      ? (this.metrics.permissionDeniedCount / totalPermissionAttempts * 100).toFixed(2)
      : 0;

    // Calculate onboarding completion rate
    const onboardingCompleted = this.metrics.onboardingCompleted;

    return {
      // User identification
      userId: this.userId,
      firstSeen: this.metrics.firstSeen,
      totalSessions: this.metrics.totalSessions,
      
      // Usage metrics
      totalShortcutActivations: this.metrics.totalShortcutActivations,
      totalGrammarFixes: this.metrics.totalGrammarFixes,
      avgDailyUsage: avgDailyUsage.toFixed(2),
      todayUsage: todayUsage.grammarFixes || 0,
      isPowerUserToday: (todayUsage.grammarFixes || 0) >= 20,
      totalPowerUserDays: this.metrics.powerUserDays,
      
      // Failure rates
      totalFailures: this.metrics.totalFailures,
      totalAIFailures: this.metrics.totalAIFailures,
      totalReplacementFailures: this.metrics.totalReplacementFailures,
      aiFailureRate: `${aiFailureRate}%`,
      replacementFailureRate: `${replacementFailureRate}%`,
      todayFailures: todayUsage.failures || 0,
      todayAIFailures: todayUsage.aiFailures || 0,
      todayReplacementFailures: todayUsage.replacementFailures || 0,
      
      // Permission metrics
      permissionDeniedCount: this.metrics.permissionDeniedCount,
      permissionGrantedCount: this.metrics.permissionGrantedCount,
      permissionDenialRate: `${permissionDenialRate}%`,
      hasPermissions: this.metrics.permissionGrantedCount > 0,
      
      // Method usage
      nativeModeCount: this.metrics.nativeModeCount,
      clipboardModeCount: this.metrics.clipboardModeCount,
      nativeModeRate: `${nativeModeRate}%`,
      clipboardModeRate: `${clipboardModeRate}%`,
      todayNativeUses: todayUsage.methods?.native || 0,
      todayClipboardUses: todayUsage.methods?.clipboard || 0,
      
      // Text length distribution
      textLengthDistribution: this.metrics.textLengthDistribution,
      textLengthPercentages: textLengthPercentages,
      avgTextLength: todayUsage.textLengths?.length > 0
        ? (todayUsage.textLengths.reduce((a, b) => a + b, 0) / todayUsage.textLengths.length).toFixed(0)
        : 0,
      
      // Onboarding
      onboardingCompleted: onboardingCompleted,
      onboardingSteps: this.metrics.onboardingSteps,
    };
  }

  /**
   * Generate report file
   */
  generateReport() {
    const summary = this.getSummary();
    const reportPath = path.join(this.config.logDirectory, `report-${this.getTodayKey()}.json`);
    
    try {
      fs.writeFileSync(
        reportPath,
        JSON.stringify(summary, null, 2),
        'utf8'
      );
      console.log('Analytics report generated:', reportPath);
      return reportPath;
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }

  /**
   * Track event (delegates to base analytics if needed)
   */
  track(eventName, properties = {}) {
    // Log to file if enabled
    if (this.config.logToFile) {
      const logFile = path.join(
        this.config.logDirectory,
        `analytics-${this.getTodayKey()}.log`
      );
      
      try {
        const logEntry = {
          timestamp: new Date().toISOString(),
          event: eventName,
          properties: {
            ...properties,
            userId: this.userId,
            sessionId: this.sessionId,
          },
        };
        
        fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n', 'utf8');
      } catch (error) {
        console.error('Failed to write to analytics log:', error);
      }
    }

    // Send to PostHog/Mixpanel if configured (same as base analytics)
    // ... (implementation from base analytics.js)
  }
}

// Export singleton instance
module.exports = new EnhancedAnalytics();

