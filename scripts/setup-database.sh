#!/bin/bash

# ExpenseFlow Database Setup Script
# This script sets up PostgreSQL database for ExpenseFlow

echo "🗃️  ExpenseFlow Database Setup"
echo "==============================="

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo ""
    echo "macOS: brew install postgresql"
    echo "Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    echo "Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL service."
    echo ""
    echo "macOS: brew services start postgresql"
    echo "Ubuntu: sudo systemctl start postgresql"
    echo "Windows: Start PostgreSQL service from Services panel"
    exit 1
fi

echo "✅ PostgreSQL is installed and running"

# Create database
echo ""
echo "📊 Creating ExpenseFlow database..."

# Try to create database (ignore error if exists)
createdb expenseflow 2>/dev/null || echo "⚠️  Database 'expenseflow' already exists"

echo "✅ Database setup complete"

# Run Prisma migration
echo ""
echo "🔄 Running database migrations..."
npx prisma migrate dev --name init

# Generate Prisma client
echo ""
echo "⚙️  Generating Prisma client..."
npx prisma generate

# Seed database
echo ""
echo "🌱 Seeding database with initial data..."
npx tsx prisma/seed.ts

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "📝 Default test accounts:"
echo "  Admin:    admin@expenseflow.com    / admin123"
echo "  Manager:  manager@expenseflow.com  / manager123" 
echo "  Employee: employee@expenseflow.com / employee123"
echo ""
echo "🚀 You can now start the application with: npm run dev"
