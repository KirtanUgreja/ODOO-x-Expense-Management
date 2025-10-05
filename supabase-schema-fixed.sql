-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own company" ON companies;
DROP POLICY IF EXISTS "Users can update their own company" ON companies;
DROP POLICY IF EXISTS "Users can view users in their company" ON users;
DROP POLICY IF EXISTS "Admins can insert users in their company" ON users;
DROP POLICY IF EXISTS "Admins can update users in their company" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can delete users in their company" ON users;
DROP POLICY IF EXISTS "Users can view expenses in their company" ON expenses;
DROP POLICY IF EXISTS "Users can insert their own expenses" ON expenses;
DROP POLICY IF EXISTS "Admins and managers can update expenses" ON expenses;
DROP POLICY IF EXISTS "Users can view approval rules in their company" ON approval_rules;
DROP POLICY IF EXISTS "Admins can manage approval rules" ON approval_rules;

-- Disable RLS temporarily for easier development
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules DISABLE ROW LEVEL SECURITY;
