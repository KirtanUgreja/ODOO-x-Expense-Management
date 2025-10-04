# 📧 Gmail SMTP Setup Guide for ExpenseFlow

## Quick Setup Steps

### 1. Enable 2-Factor Authentication (Required)
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification** and follow the setup process
3. This is **required** to generate App Passwords

### 2. Generate App Password
1. Visit [App Passwords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (custom name)** → Enter "ExpenseFlow"
4. Click **Generate**
5. **Copy the 16-character password** (spaces will be removed automatically)

### 3. Configure Environment Variables
1. Open your `.env.local` file in the project root
2. Replace these values with your actual Gmail credentials:

```bash
SMTP_USER=your-actual-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM="ExpenseFlow Notifications" <your-actual-email@gmail.com>
```

### 4. Test Configuration
1. Start your development server: `npm run dev`
2. Go to the Admin Dashboard in your app
3. Navigate to "Email Configuration" section
4. Click "Test SMTP Connection" to verify setup
5. Send a test email to yourself

## Example Configuration

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=john.doe@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM="ExpenseFlow Notifications" <john.doe@gmail.com>
EMAIL_DEBUG=true
```
