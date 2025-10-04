// OTP System Configuration
// Set OTP_ENABLED to false to disable OTP verification temporarily
// Set OTP_ENABLED to true to re-enable OTP verification

const OTP_CONFIG = {
  // TEMPORARY: OTP system disabled for easier testing/development
  OTP_ENABLED: false,
  
  // OTP settings (when enabled)
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,
  
  // Email settings
  SEND_WELCOME_EMAIL: true,
  SEND_OTP_EMAIL: false // Will be set to OTP_ENABLED value
};

// Auto-set OTP email based on OTP_ENABLED
OTP_CONFIG.SEND_OTP_EMAIL = OTP_CONFIG.OTP_ENABLED;

module.exports = OTP_CONFIG;