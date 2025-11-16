-- Najm Althuraya Transaction Management System
-- Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'employee')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ================================================
-- TRANSACTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    service_type VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    passport_id VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'ready', 'delivered', 'cancelled')),
    receive_date DATE NOT NULL,
    expected_delivery DATE NOT NULL,
    notes TEXT,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_number ON transactions(transaction_number);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_assigned ON transactions(assigned_to);
CREATE INDEX IF NOT EXISTS idx_transactions_client ON transactions(client_name);
CREATE INDEX IF NOT EXISTS idx_transactions_mobile ON transactions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);

-- ================================================
-- TRANSACTION HISTORY TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS transaction_history (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    modified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on transaction_id
CREATE INDEX IF NOT EXISTS idx_history_transaction ON transaction_history(transaction_id);
CREATE INDEX IF NOT EXISTS idx_history_modified_at ON transaction_history(modified_at DESC);

-- ================================================
-- HANDOVERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS handovers (
    id SERIAL PRIMARY KEY,
    from_employee INTEGER REFERENCES users(id) ON DELETE SET NULL,
    to_employee INTEGER REFERENCES users(id) ON DELETE SET NULL,
    supervisor_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_handovers_from ON handovers(from_employee);
CREATE INDEX IF NOT EXISTS idx_handovers_to ON handovers(to_employee);
CREATE INDEX IF NOT EXISTS idx_handovers_status ON handovers(status);

-- ================================================
-- HANDOVER ITEMS TABLE (Many-to-Many for transactions)
-- ================================================
CREATE TABLE IF NOT EXISTS handover_items (
    id SERIAL PRIMARY KEY,
    handover_id INTEGER REFERENCES handovers(id) ON DELETE CASCADE,
    transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_handover_items_handover ON handover_items(handover_id);
CREATE INDEX IF NOT EXISTS idx_handover_items_transaction ON handover_items(transaction_id);

-- ================================================
-- SETTINGS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    app_name VARCHAR(255) DEFAULT 'Najm Althuraya',
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#8b5cf6',
    default_language VARCHAR(2) DEFAULT 'ar' CHECK (default_language IN ('en', 'ar')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT single_row CHECK (id = 1)
);

-- ================================================
-- INSERT DEFAULT DATA
-- ================================================

-- Insert default admin user (password: admin123)
-- NOTE: Change this password immediately after first login!
INSERT INTO users (email, password_hash, full_name, role, is_active) 
VALUES (
    'admin@najum-althuraya.com',
    '$2a$10$qQ3h6XYwxvQZGH8yLxK2u.RJrEP7H5qvZ3yGZQXy7Z.xqKZH3K5ZK',
    'System Administrator',
    'admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Insert default settings
INSERT INTO settings (id, app_name, primary_color, secondary_color, default_language)
VALUES (1, 'Najm Althuraya', '#3b82f6', '#8b5cf6', 'ar')
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for transactions table
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for settings table
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VIEWS (Optional - for easier queries)
-- ================================================

-- View for transaction summary
CREATE OR REPLACE VIEW transaction_summary AS
SELECT 
    t.id,
    t.transaction_number,
    t.service_type,
    t.client_name,
    t.mobile_number,
    t.status,
    t.created_at,
    u1.full_name as assigned_employee,
    u2.full_name as created_by_name
FROM transactions t
LEFT JOIN users u1 ON t.assigned_to = u1.id
LEFT JOIN users u2 ON t.created_by = u2.id;

-- ================================================
-- GRANTS (Optional - for security)
-- ================================================
-- Grant appropriate permissions to your application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ================================================
-- COMPLETED
-- ================================================
-- Database schema created successfully!
-- Default admin credentials:
--   Email: admin@najum-althuraya.com
--   Password: admin123
-- IMPORTANT: Change the admin password immediately after first login!
