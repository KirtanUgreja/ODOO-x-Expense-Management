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

## Troubleshooting

### "Authentication Failed" Error
- ✅ Verify 2FA is enabled on your Gmail account
- ✅ Use App Password, not your regular Gmail password
- ✅ Double-check the Gmail address is correct
- ✅ Generate a new App Password if needed

### "Connection Timeout" Error
- ✅ Check your internet connection
- ✅ Disable VPN/proxy temporarily
- ✅ Verify firewall settings aren't blocking port 587

### "Certificate Error"
- ✅ This is usually temporary - try again in a few minutes
- ✅ Check if Gmail is experiencing outages

### Email Not Received
- ✅ Check spam/junk folder
- ✅ Verify the recipient email address is correct
- ✅ Check Gmail sending limits (500 emails/day for regular accounts)
- ✅ Ensure your Gmail account isn't suspended

## Security Notes

- **Never commit your `.env.local` file** to version control
- **Use App Passwords** instead of your main Gmail password
- **Keep your App Passwords secure** and regenerate them if compromised
- **Monitor your Gmail account** for suspicious activity

## Need Help?

If you're still having issues:

1. **Check the browser console** for detailed error messages
2. **Enable debug mode** by setting `EMAIL_DEBUG=true` in `.env.local`
3. **Test the SMTP connection** using the built-in tester in the admin panel
4. **Verify your Gmail account** is in good standing and not limited

## Alternative: EmailJS

If Gmail SMTP doesn't work for you, consider using EmailJS as an alternative:

1. Create account at [EmailJS.com](https://www.emailjs.com/)
2. Set up email service and templates
3. Configure the EmailJS environment variables in `.env.local`

Both methods are supported by ExpenseFlow!
