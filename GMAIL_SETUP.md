# 📧 Gmail Configuration Guide

To enable real email notifications, you need to configure Gmail SMTP settings. Here's how:

## 🔐 Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Factor Authentication if not already enabled

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Other (custom name)"
3. Enter "ExpenseFlow" as the app name
4. Copy the 16-character password (e.g., "abcd efgh ijkl mnop")

### Step 3: Create Environment File
Create a `.env.local` file in your project root with:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM="ExpenseFlow" <your-email@gmail.com>
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the App Password from Step 2

### Step 4: Restart the Server
```bash
npm run dev
```

## 🧪 Testing
1. Go to Admin Dashboard → Email Config tab
2. Send a test email to verify the setup
3. Check your Gmail sent folder and the recipient's inbox

## 🔧 Alternative: Using EmailJS (No Server Required)
1. Create account at [EmailJS.com](https://www.emailjs.com/)
2. Set up email service (Gmail/Outlook/etc.)
3. Create email templates
4. Add to `.env.local`:
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_CREDENTIALS=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_EXPENSE=template_xxxxxxx
```
