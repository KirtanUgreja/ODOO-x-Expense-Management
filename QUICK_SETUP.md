# 🚀 ExpenseFlow - Quick Setup Guide

This is a simplified setup guide to get ExpenseFlow running quickly. For complete documentation, see the [full README](README.md).

## ⚡ 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Email (Optional but Recommended)
```bash
# Copy environment template
cp .env.template .env.local

# Edit .env.local and add your Gmail credentials:
# SMTP_USER=your-email@gmail.com  
# SMTP_PASSWORD=your-app-password
```

> **Note**: You need a Gmail App Password. Get one at: https://myaccount.google.com/apppasswords

### 3. Start the Application
```bash
npm run dev
```

### 4. Open Browser
Navigate to http://localhost:3000

## 🎯 Default Login

The application will show you admin credentials on first load. Use these to:
- Create users
- Set up approval workflows  
- Configure email settings
- Start managing expenses

## 📧 Email Setup (Detailed)

### Gmail App Password Setup:
1. **Enable 2FA**: Go to [Google Security](https://myaccount.google.com/security)
2. **Generate App Password**: Visit [App Passwords](https://myaccount.google.com/apppasswords)
3. **Select Mail + Other** → Enter "ExpenseFlow"
4. **Copy the 16-character password**
5. **Add to .env.local**:
   ```env
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop
   ```

### Test Email Configuration:
1. Go to **Admin Dashboard** → **Email Configuration**
2. Click **"Test SMTP Connection"**
3. Send a test email to verify setup

## 🎭 User Roles

| Role | Access |
|------|--------|
| **Admin** | Full system management |
| **Manager** | Approve team expenses |
| **Employee** | Submit and track expenses |

## 🆘 Need Help?

### Common Issues:
- **Port 3000 busy?** → App will auto-switch to 3001, 3002, etc.
- **Email not working?** → Check spam folder, verify App Password
- **Build errors?** → Run `npm install --legacy-peer-deps`

### Email Troubleshooting:
```bash
# Enable debug mode in .env.local
EMAIL_DEBUG=true

# Check terminal logs for detailed error messages
```

## 📱 Quick Demo Flow

1. **Login as Admin** → Use displayed credentials
2. **Create a Manager** → User Management → Add User  
3. **Create an Employee** → Assign to the manager
4. **Login as Employee** → Submit an expense
5. **Login as Manager** → Approve the expense
6. **Check Email** → Both users get notifications!

## 🎉 You're Ready!

Your ExpenseFlow installation is complete. Check the [full README](README.md) for advanced configuration, customization options, and detailed feature documentation.

**Happy expense managing!** 💰✨
