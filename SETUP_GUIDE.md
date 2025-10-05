# 🚀 ExpenseFlow - Complete Setup Guide

A comprehensive guide to set up and run the ExpenseFlow application locally or on your own server.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables Setup](#environment-variables-setup)
4. [Supabase Database Setup](#supabase-database-setup)
5. [SMTP Email Configuration](#smtp-email-configuration)
6. [Running the Application](#running-the-application)
7. [Common Errors & Solutions](#common-errors--solutions)
8. [Testing Guide](#testing-guide)
9. [Production Deployment](#production-deployment)

---

## 🔧 Prerequisites

Before starting, ensure you have:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **pnpm** (recommended)
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Gmail Account** (for SMTP) - [Create](https://accounts.google.com/)

### Check Prerequisites

```bash
node --version  # Should be v18+
npm --version   # Should be v9+
git --version
```

---

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/KirtanUgreja/ODOO-x-Expense-Management
cd ODOO-x-Expense-Management
```

### Step 2: Install Dependencies

Choose one of the following:

**Using npm:**
```bash
npm install
```

**Using pnpm (recommended - faster):**
```bash
npm install -g pnpm
pnpm install
```

**Using yarn:**
```bash
npm install -g yarn
yarn install
```

### Step 3: Verify Installation

```bash
npm list --depth=0
```

You should see all dependencies listed without errors.

---

## 🔐 Environment Variables Setup

### Step 1: Create Environment File

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Or on Windows:
```cmd
copy .env.local.example .env.local
```

### Step 2: Configure Environment Variables

Open `.env.local` and configure the following:

#### 📧 SMTP Configuration (Gmail)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_SECURE=false
SMTP_TLS=true
SMTP_FROM=your-email@gmail.com
FROM_EMAIL=your-email@gmail.com
FROM_NAME=ExpenseFlow
EMAIL_DEBUG=true
```

#### 💾 Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing one
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🗄️ Supabase Database Setup

### Step 1: Access SQL Editor

1. Open your Supabase project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Database Schema

Copy and paste the contents of `supabase-schema.sql` into the SQL editor and click **Run**.

**Or use the fixed schema (recommended for development):**

```bash
# Copy contents of supabase-schema-fixed.sql
```

This will create:
- ✅ `companies` table
- ✅ `users` table
- ✅ `expenses` table
- ✅ `approval_rules` table
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies

### Step 3: Verify Tables

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

You should see: `companies`, `users`, `expenses`, `approval_rules`

### Common Schema Errors & Fixes

#### Error: "extension uuid-ossp does not exist"

**Solution:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### Error: "relation already exists"

**Solution:** Drop existing tables first:
```sql
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS approval_rules CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
```

Then re-run the schema.

#### Error: "RLS policy prevents access"

**Solution:** Use the fixed schema that disables RLS for development:
```sql
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE approval_rules DISABLE ROW LEVEL SECURITY;
```

#### Error: "function auth.uid() does not exist"

**Solution:** This is normal if you're not using Supabase Auth. Use the fixed schema or disable RLS policies.

---

## 📧 SMTP Email Configuration

### Gmail App Password Setup

#### Step 1: Enable 2-Factor Authentication

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the setup process

#### Step 2: Generate App Password

1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (Custom name)**
3. Enter "ExpenseFlow" as the name
4. Click **Generate**
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Remove spaces: `abcdefghijklmnop`
7. Paste into `.env.local` as `SMTP_PASSWORD`

#### Step 3: Update .env.local

```env
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
SMTP_FROM=your-email@gmail.com
```

### Alternative SMTP Providers

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
```

#### AWS SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASSWORD=your-ses-smtp-password
```

---

## 🚀 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start at: **http://localhost:3000**

### Production Build

```bash
npm run build
npm start
```

### Check Application Status

Open your browser and navigate to:
- **Frontend:** http://localhost:3000
- **Email Config Test:** http://localhost:3000/api/send-email (GET request)

---

## ⚠️ Common Errors & Solutions

### 1. Module Not Found Errors

**Error:**
```
Module not found: Can't resolve '@radix-ui/react-dialog'
```

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### 2. Supabase Connection Error

**Error:**
```
Supabase client not initialized
```

**Solution:**
- Verify `.env.local` has correct Supabase credentials
- Restart the dev server: `npm run dev`
- Check Supabase project is active

### 3. SMTP Authentication Failed

**Error:**
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
- ✅ Use App Password, not regular Gmail password
- ✅ Enable 2FA on Gmail account
- ✅ Generate new App Password
- ✅ Remove spaces from App Password
- ✅ Check SMTP_USER matches the Gmail account

### 4. Port Already in Use

**Error:**
```
Port 3000 is already in use
```

**Solution:**
```bash
# Kill process on port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or use different port:
PORT=3001 npm run dev
```

### 5. Database Schema Errors

**Error:**
```
relation "users" does not exist
```

**Solution:**
- Re-run the SQL schema in Supabase
- Verify all tables were created
- Check for SQL syntax errors

### 6. Environment Variables Not Loading

**Error:**
```
process.env.NEXT_PUBLIC_SUPABASE_URL is undefined
```

**Solution:**
- Ensure `.env.local` exists in root directory
- Restart dev server after changing env vars
- Check variable names start with `NEXT_PUBLIC_` for client-side access

### 7. Build Errors

**Error:**
```
Type error: Property 'X' does not exist on type 'Y'
```

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 🧪 Testing Guide

### Test 1: Verify Installation

```bash
npm run dev
```

✅ **Expected:** Server starts without errors at http://localhost:3000

### Test 2: Check Email Configuration

**Method 1: API Test**
```bash
curl http://localhost:3000/api/send-email
```

**Method 2: Browser**
Navigate to: http://localhost:3000/api/send-email

✅ **Expected Response:**
```json
{
  "smtp_configured": true,
  "smtp_user": "your-email@gmail.com",
  "connection_test": {
    "success": true,
    "message": "SMTP connection verified successfully"
  }
}
```

### Test 3: Send Test Email

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "recipient@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email from ExpenseFlow!</p>"
  }'
```

**Using Postman/Insomnia:**
- Method: POST
- URL: http://localhost:3000/api/send-email
- Body (JSON):
```json
{
  "to_email": "your-test-email@gmail.com",
  "subject": "ExpenseFlow Test",
  "html": "<p>Testing email functionality!</p>"
}
```

✅ **Expected:** Email received in inbox

### Test 4: Database Connection

1. Open the application: http://localhost:3000
2. You should see the login page
3. Check browser console for errors (F12)

✅ **Expected:** No Supabase connection errors

### Test 5: Create Company & Admin User

#### Step 1: Insert Test Company

Run in Supabase SQL Editor:
```sql
INSERT INTO companies (name, currency)
VALUES ('Test Company', 'USD')
RETURNING *;
```

Copy the returned `id` (UUID).

#### Step 2: Create Admin User

```sql
INSERT INTO users (email, name, role, company_id, password, is_first_login)
VALUES (
  'admin@test.com',
  'Admin User',
  'admin',
  'YOUR-COMPANY-ID-HERE',
  'password123',
  false
)
RETURNING *;
```

#### Step 3: Login Test

1. Go to http://localhost:3000
2. Login with:
   - Email: `admin@test.com`
   - Password: `password123`

✅ **Expected:** Successfully logged in to admin dashboard

### Test 6: Create Employee User

As admin, test user creation:

1. Navigate to **User Management**
2. Click **Add User**
3. Fill in:
   - Name: `John Doe`
   - Email: `john@test.com`
   - Role: `Employee`
   - Manager: Select a manager
4. Click **Create User**

✅ **Expected:** 
- User created successfully
- Credentials email sent to john@test.com
- User appears in user list

### Test 7: Submit Expense

Login as employee and test expense submission:

1. Login as `john@test.com`
2. Navigate to **Submit Expense**
3. Fill in:
   - Amount: `100.00`
   - Category: `Travel`
   - Description: `Taxi to client meeting`
   - Date: Select today
4. Upload receipt (optional)
5. Click **Submit**

✅ **Expected:**
- Expense submitted successfully
- Status shows "Pending"
- Manager receives notification email

### Test 8: Approve/Reject Expense

Login as manager:

1. Login with manager credentials
2. Navigate to **Pending Approvals**
3. Click on the expense
4. Click **Approve** or **Reject**

✅ **Expected:**
- Status updated
- Employee receives notification email
- Expense moves to appropriate section

### Test 9: OCR Receipt Upload

1. Login as employee
2. Submit expense with receipt image
3. Wait for OCR processing

✅ **Expected:**
- Amount extracted from receipt
- Category suggested
- Data pre-filled in form

### Test 10: Approval Rules Configuration

Login as admin:

1. Navigate to **Settings** → **Approval Rules**
2. Configure multi-level approval
3. Add approval steps
4. Save configuration

✅ **Expected:**
- Rules saved successfully
- Applied to new expenses

---

## 🌐 Production Deployment

### Vercel Deployment (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 2: Login to Vercel

```bash
vercel login
```

#### Step 3: Deploy

```bash
vercel
```

#### Step 4: Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SMTP_HOST
vercel env add SMTP_PORT
vercel env add SMTP_USER
vercel env add SMTP_PASSWORD
vercel env add SMTP_FROM
```

Or set them in Vercel Dashboard:
1. Go to your project
2. Settings → Environment Variables
3. Add all variables from `.env.local`

#### Step 5: Deploy to Production

```bash
vercel --prod
```

### Self-Hosted Deployment

#### Using PM2 (Node.js Process Manager)

```bash
# Install PM2
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "expenseflow" -- start

# Save PM2 configuration
pm2 save

# Setup auto-restart on reboot
pm2 startup
```

#### Using Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t expenseflow .
docker run -p 3000:3000 --env-file .env.local expenseflow
```

---

## 📊 Performance Optimization

### Enable Caching

Add to `next.config.mjs`:
```javascript
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
}
```

### Database Indexing

Already included in schema, but verify:
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename IN ('users', 'expenses', 'companies');
```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** - Already in `.gitignore`
2. **Use strong passwords** for database and admin accounts
3. **Enable RLS** in production (use `supabase-schema.sql`)
4. **Rotate App Passwords** regularly
5. **Use HTTPS** in production
6. **Set up CORS** properly
7. **Enable rate limiting** for API routes

---

## 📞 Support & Troubleshooting

### Still Having Issues?

1. **Check logs:**
   ```bash
   # Development logs
   npm run dev
   
   # Production logs (PM2)
   pm2 logs expenseflow
   ```

2. **Clear cache:**
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run dev
   ```

3. **Verify environment:**
   ```bash
   node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
   ```

4. **Test database connection:**
   - Open Supabase Dashboard
   - Go to Table Editor
   - Verify tables exist and have data

5. **Test SMTP:**
   - Use online SMTP tester
   - Verify App Password is correct
   - Check Gmail security settings

---

## 📝 Quick Reference

### Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Clear cache
rm -rf .next

# Reset database (Supabase SQL Editor)
# Run supabase-schema.sql
```

### Important URLs

- **Local App:** http://localhost:3000
- **Supabase Dashboard:** https://app.supabase.com/
- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## ✅ Setup Checklist

- [ ] Node.js v18+ installed
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` created and configured
- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Gmail App Password generated
- [ ] SMTP configured in `.env.local`
- [ ] Dev server running (`npm run dev`)
- [ ] Email test successful
- [ ] Test company created
- [ ] Admin user created
- [ ] Login successful
- [ ] Employee user created
- [ ] Expense submission tested
- [ ] Approval workflow tested

---

## 🎉 Success!

If you've completed all steps, your ExpenseFlow application should be fully functional!

**Next Steps:**
1. Customize branding and colors
2. Configure approval rules
3. Add more users
4. Set up production deployment
5. Enable analytics (optional)

**Happy Expense Managing! 💰**
