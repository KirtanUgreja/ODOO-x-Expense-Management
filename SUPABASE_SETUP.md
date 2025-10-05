# Supabase Migration Guide

This guide will help you migrate from localStorage to Supabase for persistent, remote database storage.

## Prerequisites

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Step 1: Set up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the SQL Editor
4. Run the SQL to create all tables and policies

## Step 2: Get Supabase Credentials

1. In your Supabase project dashboard, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon public key

## Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`
2. Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Step 4: Migrate Existing Data (Optional)

If you have existing data in localStorage:

1. Open your browser's developer console
2. Load the migration script by running:
```javascript
// First, make sure Supabase client is available
import { createClient } from '@supabase/supabase-js'
window.supabase = createClient('your_url', 'your_key')

// Then run the migration
migrateToSupabase()
```

## Step 5: Switch to Supabase Data Context

Update your `app/layout.tsx` to use the new Supabase data context:

```tsx
// Replace this import:
// import { DataProvider } from "@/lib/data-context"

// With this:
import { DataProvider } from "@/lib/data-context-supabase"
```

## Step 6: Test the Migration

1. Restart your development server: `npm run dev`
2. Try logging in with existing credentials
3. Create new users, expenses, and test all functionality
4. Verify data persists after browser refresh

## Step 7: Clean Up (Optional)

Once you've verified everything works:

1. Remove the old data context file: `lib/data-context.tsx`
2. Rename `lib/data-context-supabase.tsx` to `lib/data-context.tsx`
3. Remove localStorage data by running in browser console:
```javascript
localStorage.clear()
```

## Database Schema Overview

The Supabase database includes:

- **companies**: Store company information
- **users**: Store user accounts with roles and relationships
- **expenses**: Store expense records with approval workflow
- **approval_rules**: Store company-specific approval workflows

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access data from their own company
- Role-based permissions (admin, manager, employee)
- Secure API access through Supabase

## Benefits of Supabase Migration

✅ **Persistent Data**: Data survives browser clears and device changes  
✅ **Multi-Device Access**: Access from any device with login  
✅ **Real-time Updates**: Automatic sync across multiple sessions  
✅ **Backup & Recovery**: Automatic database backups  
✅ **Scalability**: Handles growing data and user base  
✅ **Security**: Enterprise-grade security and compliance  

## Troubleshooting

### Common Issues:

1. **Connection Error**: Verify your Supabase URL and API key
2. **Permission Denied**: Check RLS policies in Supabase dashboard
3. **Migration Failed**: Ensure localStorage data exists before migration
4. **Login Issues**: Verify user data was migrated correctly

### Support:

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Review database logs in Supabase dashboard
- Test API calls in Supabase API explorer

## Next Steps

After successful migration:

1. Set up automated backups in Supabase
2. Configure production environment variables
3. Set up monitoring and alerts
4. Consider implementing real-time subscriptions for live updates