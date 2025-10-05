-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'employee')),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    password VARCHAR(255) NOT NULL,
    is_first_login BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    current_approval_step INTEGER DEFAULT 0,
    approval_history JSONB DEFAULT '[]'::jsonb,
    receipt_url TEXT,
    ocr_data JSONB,
    converted_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approval rules table
CREATE TABLE approval_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    sequence JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_manager_approver_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_manager_id ON users(manager_id);
CREATE INDEX idx_expenses_company_id ON expenses(company_id);
CREATE INDEX idx_expenses_employee_id ON expenses(employee_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_created_at ON expenses(created_at);
CREATE INDEX idx_approval_rules_company_id ON approval_rules(company_id);

-- Row Level Security (RLS) policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
    FOR SELECT USING (
        id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can update their own company" ON companies
    FOR UPDATE USING (
        id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Users policies
CREATE POLICY "Users can view users in their company" ON users
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can insert users in their company" ON users
    FOR INSERT WITH CHECK (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update users in their company" ON users
    FOR UPDATE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can delete users in their company" ON users
    FOR DELETE USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Expenses policies
CREATE POLICY "Users can view expenses in their company" ON expenses
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Users can insert their own expenses" ON expenses
    FOR INSERT WITH CHECK (
        employee_id = auth.uid() AND
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins and managers can update expenses" ON expenses
    FOR UPDATE USING (
        company_id IN (
            SELECT company_id FROM users 
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Approval rules policies
CREATE POLICY "Users can view approval rules in their company" ON approval_rules
    FOR SELECT USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage approval rules" ON approval_rules
    FOR ALL USING (
        company_id IN (SELECT company_id FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Functions for better data management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at columns and triggers if needed
-- ALTER TABLE companies ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE expenses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE approval_rules ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- CREATE TRIGGER update_approval_rules_updated_at BEFORE UPDATE ON approval_rules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();