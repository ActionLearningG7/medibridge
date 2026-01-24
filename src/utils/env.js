/**
 * Environment variable utilities
 * Centralized access to environment variables with validation
 */

export const env = {
  // API URLs
  apiGateway: process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:8080',
  userService: process.env.REACT_APP_USER_SERVICE_BASE_URL || 'http://localhost:8081',
  appointmentService: process.env.REACT_APP_APPOINTMENT_SERVICE_BASE_URL || 'http://localhost:8082',
  prescriptionService: process.env.REACT_APP_PRESCRIPTION_SERVICE_BASE_URL || 'http://localhost:8083',
  labService: process.env.REACT_APP_LAB_SERVICE_BASE_URL || 'http://localhost:8084',
  reportsService: process.env.REACT_APP_REPORTS_SERVICE_BASE_URL || 'http://localhost:8085',
  sosService: process.env.REACT_APP_SOS_AMBULANCE_SERVICE_BASE_URL || 'http://localhost:8086',

  // WebSocket URLs
  appointmentWs: process.env.REACT_APP_APPOINTMENT_WS_URL || 'ws://localhost:8082/ws',
  sosWs: process.env.REACT_APP_SOS_WS_URL || 'ws://localhost:8086/ws',

  // App Config
  appName: process.env.REACT_APP_NAME || 'MediBridge',
  appVersion: process.env.REACT_APP_VERSION || '1.0.0',
  appEnv: process.env.REACT_APP_ENV || 'development',

  // Feature Flags
  enableWebSockets: process.env.REACT_APP_ENABLE_WEBSOCKETS === 'true',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS === 'true',

  // Pagination
  defaultPageSize: parseInt(process.env.REACT_APP_DEFAULT_PAGE_SIZE || '10', 10),
  maxPageSize: parseInt(process.env.REACT_APP_MAX_PAGE_SIZE || '100', 10),

  // Session
  sessionTimeoutMinutes: parseInt(process.env.REACT_APP_SESSION_TIMEOUT_MINUTES || '30', 10),

  // Helper methods
  isDevelopment: () => process.env.NODE_ENV === 'development',
  isProduction: () => process.env.NODE_ENV === 'production',
  isTest: () => process.env.NODE_ENV === 'test',
};

// Validation on import (only in development)
if (env.isDevelopment()) {
  const requiredVars = [
    'REACT_APP_USER_SERVICE_BASE_URL',
    'REACT_APP_APPOINTMENT_SERVICE_BASE_URL',
  ];

  const missing = requiredVars.filter(
    (varName) => !process.env[varName]
  );

  if (missing.length > 0) {
    console.warn(
      '⚠️  Missing environment variables (using defaults):',
      missing.join(', ')
    );
  }
}

export default env;
