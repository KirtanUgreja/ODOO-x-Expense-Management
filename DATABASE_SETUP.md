# 🗃️ PostgreSQL Database Setup for ExpenseFlow

ExpenseFlow now supports PostgreSQL database for production-ready data persistence! This replaces localStorage with a robust, scalable database solution.

## 🚀 Quick Setup

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)

### 2. Run Automated Setup
```bash
npm run db:setup
```

This script will:
- ✅ Create the `expenseflow` database
- ✅ Run Prisma migrations
- ✅ Generate Prisma client
- ✅ Seed with sample data
- ✅ Create test user accounts

### 3. Update Environment Variables
Your `.env.local` should include:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/expenseflow"
```

## 🎯 Test Accounts (After Setup)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@expenseflow.com | admin123 |
| Manager | manager@expenseflow.com | manager123 |
| Employee | employee@expenseflow.com | employee123 |

## 📊 Database Schema

### Tables Created:
- **companies** - Company information
- **users** - User accounts with roles and authentication
- **expenses** - Expense records with approval workflow
- **approval_records** - Audit trail of approvals/rejections
- **email_notifications** - Email notification history
- **approval_rules** - Company approval policies

## 🔧 Available Commands

```bash
# Database setup and management
npm run db:setup          # Complete database setup
npm run db:migrate         # Run migrations
npm run db:generate        # Generate Prisma client
npm run db:seed           # Seed sample data
npm run db:studio         # Open Prisma Studio (GUI)
npm run db:reset          # Reset and reseed database

# Development
npm run dev               # Start with database support
```

## 🔄 Migration from localStorage

The app automatically detects and switches between localStorage and database modes:

1. **localStorage Mode** (Default) - Uses browser storage
2. **Database Mode** - Uses PostgreSQL (toggle in Admin Dashboard)

### Switching Modes:
- Admin Dashboard → Settings → "Toggle Database Mode"
- Or set `databaseMode: true` in data context

## 🏗️ Database Architecture

### Relationships:
```
Company (1) → (n) Users
Company (1) → (n) Expenses
User (1) → (n) Expenses (as employee)
User (1) → (n) ApprovalRecords (as approver)
Expense (1) → (n) ApprovalRecords
```

### Key Features:
- **ACID Compliance** - Reliable transactions
- **Foreign Key Constraints** - Data integrity
- **Indexes** - Fast query performance
- **Audit Trail** - Complete approval history
- **Type Safety** - Prisma TypeScript integration

## 🐳 Docker Setup (Optional)

For containerized PostgreSQL:

```bash
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: expenseflow
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
npm run db:setup
```

## 🌐 Cloud Database Options

### Supabase (Recommended)
1. Create project at [supabase.com](https://supabase.com)
2. Get connection string from Settings → Database
3. Update `DATABASE_URL` in `.env.local`

### Railway
1. Create project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy connection string to `DATABASE_URL`

### PlanetScale
1. Create database at [planetscale.com](https://planetscale.com)
2. Get connection string
3. Update `DATABASE_URL`

## 🔒 Security Best Practices

### Production Setup:
```env
# Use strong credentials
DATABASE_URL="postgresql://username:strongpassword@hostname:5432/expenseflow"

# Enable SSL (for cloud databases)
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

### Connection Pooling:
For high traffic, consider connection pooling:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

## 🚨 Troubleshooting

### Connection Issues:
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Test connection
psql -h localhost -p 5432 -U postgres -d expenseflow
```

### Migration Errors:
```bash
# Reset migrations
npm run db:reset

# Manual migration
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Permission Issues:
```bash
# Grant permissions (if needed)
sudo -u postgres psql
CREATE USER expenseflow WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE expenseflow TO expenseflow;
```

## 📈 Performance Optimization

### Indexing:
The schema includes optimized indexes for:
- User lookups by email
- Expense queries by employee/company
- Approval record queries

### Query Optimization:
- Uses Prisma relations for efficient joins
- Includes necessary fields only
- Implements pagination for large datasets

## 🔄 Backup & Recovery

### Automated Backups:
```bash
# Create backup
pg_dump expenseflow > expenseflow_backup.sql

# Restore backup
psql expenseflow < expenseflow_backup.sql
```

### Migration Scripts:
All schema changes are versioned through Prisma migrations, ensuring consistent deployments.

---

**Your ExpenseFlow application now has enterprise-grade database support!** 🎉

For questions or issues, check the troubleshooting section or create an issue in the repository.
