# 📧 Email Integration Setup Guide

ExpenseFlow now includes a comprehensive email system that automatically sends notifications to users. This guide explains how to configure and use the email features.

## ✨ Features

- **Credential Emails**: Automatically send login credentials to new users
- **Expense Notifications**: Notify managers when expenses are submitted
- **Approval/Rejection Alerts**: Inform employees about expense status updates
- **Professional Templates**: Beautiful, responsive HTML email templates
- **Dual Methods**: Support for both EmailJS (client-side) and SMTP (server-side)

## 🚀 Quick Start


SMTP is recommended for production environments:

1. **Configure Environment Variables**
   ```bash
   # Add to .env.local
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SMTP_FROM=noreply@yourcompany.com
   ```

2. **Gmail Setup**
   - Enable 2-Factor Authentication
   - Generate an App Password
   - Use the App Password (not your regular password)

3. **Other Email Providers**
   - **Outlook**: `smtp.live.com:587`
   - **Yahoo**: `smtp.mail.yahoo.com:587`
   - **Custom**: Contact your email provider for SMTP settings

## 🔧 Configuration Options

### EmailJS Configuration
```env
NEXT_PUBLIC_EMAILJS_SERVICE_ID=service_xxxxxxx
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_CREDENTIALS=template_xxxxxxx
NEXT_PUBLIC_EMAILJS_TEMPLATE_EXPENSE=template_xxxxxxx
```

### SMTP Configuration
```env
# Gmail Example
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@yourcompany.com
SMTP_PASSWORD=your-app-password
SMTP_FROM="ExpenseFlow" <noreply@yourcompany.com>

# Outlook Example
SMTP_HOST=smtp.live.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@outlook.com
SMTP_PASSWORD=your-password

# Custom SMTP
SMTP_HOST=mail.yourcompany.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notifications@yourcompany.com
SMTP_PASSWORD=your-password
```

## 📱 How It Works

### Automatic Email Triggers

1. **User Creation**
   ```javascript
   // When admin creates a new user
   const newUser = createUser("john@company.com", "John Doe", "employee")
   // → Automatically sends credentials email to john@company.com
   ```

2. **Expense Submission**
   ```javascript
   // When employee submits expense
   const expense = createExpense(100, "USD", "Travel", "Client meeting")
   // → Automatically notifies manager/approvers
   ```

3. **Expense Approval/Rejection**
   ```javascript
   // When manager approves/rejects
   updateExpenseStatus(expenseId, "approved", managerId)
   // → Automatically notifies employee
   ```

### Email Templates

The system includes professional, responsive email templates:

- **Modern Design**: Clean, corporate-friendly appearance
- **Responsive**: Works on desktop and mobile
- **Branded**: Includes ExpenseFlow branding and colors
- **Actionable**: Includes links back to the application

## 🛠️ Testing & Configuration

### Using the Admin Panel

1. **Navigate to Admin Dashboard**
2. **Go to "Email Config" Tab**
3. **Check Configuration Status**
4. **Send Test Emails**

### Manual Testing

Test SMTP configuration:
```bash
# Send test email via API
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to_email": "test@example.com",
    "to_name": "Test User",
    "subject": "Test Email",
    "html": "This is a test email from ExpenseFlow!"
  }'
```

## 🔒 Security Considerations

### EmailJS Security
- ✅ Easy to set up
- ⚠️ Public keys exposed in client-side code
- ⚠️ Rate limiting applies
- 📝 Good for development/small applications

### SMTP Security
- ✅ Credentials stored server-side only
- ✅ No rate limiting (depends on provider)
- ✅ Professional sender reputation
- 📝 Recommended for production

## 🚨 Troubleshooting

### Common Issues

**EmailJS not working:**
- Check service ID and public key
- Verify template IDs match
- Ensure templates use correct variable names
- Check browser console for errors

**SMTP not working:**
- Verify SMTP credentials
- Check if 2FA/App Passwords are required
- Ensure correct host and port
- Check server logs for detailed errors

**Gmail specific:**
- Use App Passwords, not account password
- Enable "Less secure app access" if using password
- Check Gmail quotas and limits

### Debug Mode

Enable detailed logging:
```javascript
// Check console for email sending logs
console.log("Email configuration:", {
  emailjs: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  smtp: !!process.env.SMTP_USER
})
```

## 📊 Email Analytics

Track email delivery in the admin panel:
- View sent emails
- Check delivery status
- Monitor email frequency
- Export email logs

## 🎯 Best Practices

1. **Use SMTP for Production**: More reliable and secure
2. **Test Thoroughly**: Always test email configuration before deployment
3. **Monitor Quotas**: Be aware of sending limits
4. **Professional Sender**: Use a professional "from" address
5. **Template Consistency**: Keep email templates consistent with your brand
6. **Error Handling**: Monitor failed email deliveries

## 🔄 Automatic Fallback

The system automatically tries multiple methods:
1. **EmailJS** (if configured)
2. **SMTP API** (if EmailJS fails)
3. **Local Storage** (for tracking, always works)

This ensures notifications are never lost, even if email delivery fails.

## 📞 Support

For email configuration help:
1. Check the Email Config tab in Admin Dashboard
2. Test your configuration using the built-in test tool
3. Review server logs for detailed error messages
4. Consult your email provider's SMTP documentation
