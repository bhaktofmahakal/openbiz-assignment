-- Initialize database with basic configuration

-- Create database if it doesn't exist
-- Note: This is handled by Docker, but included for reference

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance (these will be created by Prisma migrations)
-- This file serves as documentation and backup

-- Insert initial configuration data
INSERT INTO configurations (key, value, description, is_active) VALUES
('otp_expiry_minutes', '10', 'OTP expiry time in minutes', true),
('max_otp_attempts', '3', 'Maximum OTP verification attempts', true),
('pan_verification_cache_hours', '24', 'PAN verification cache duration in hours', true),
('rate_limit_window_minutes', '15', 'Rate limiting window in minutes', true),
('rate_limit_max_requests', '100', 'Maximum requests per window', true),
('form_session_timeout_minutes', '30', 'Form session timeout in minutes', true)
ON CONFLICT (key) DO NOTHING;

-- Create initial audit log entry
INSERT INTO audit_logs (action, details, timestamp) VALUES
('SYSTEM_INITIALIZED', '{"message": "Database initialized successfully"}', NOW());