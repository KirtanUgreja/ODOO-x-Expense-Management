# 💰 ExpenseFlow - Modern Expense Management System

<div align="center">
  <img src="public/placeholder-logo.svg" alt="ExpenseFlow Logo" width="120" height="120">
  
  **A comprehensive, modern expense management solution built with Next.js 15 and React 19**
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.9-38B2AC)](https://tailwindcss.com/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
</div>

## ✨ Features

### 🔐 **Multi-Role Authentication**
- **Admin**: Complete system management and oversight
- **Manager**: Team expense approval and management
- **Employee**: Expense submission and tracking

### 📊 **Comprehensive Dashboard**
- Role-based dashboards with tailored functionality
- Real-time expense tracking and analytics
- Interactive charts and data visualization
- Multi-currency support with live conversion rates

### 📝 **Advanced Expense Management**
- Intuitive expense submission with rich forms
- Receipt upload and OCR text extraction
- Multi-step approval workflow system
- Expense categorization and filtering
- Bulk expense operations

### 📧 **Automated Email Notifications**
- Welcome emails with login credentials
- Manager notifications for pending expenses
- Employee notifications for approval/rejection
- Professional HTML email templates
- Dual email delivery (SMTP + EmailJS)

### 🎨 **Modern UI/UX**
- Beautiful, responsive design built with Radix UI
- Dark/Light theme support
- Mobile-first responsive layout
- Accessible components (WCAG compliant)
- Smooth animations and transitions

### 🛡️ **Security & Compliance**
- Secure authentication system
- Role-based access control (RBAC)
- Data encryption and secure storage
- Audit trail for all transactions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm/pnpm
- **Gmail account** with 2-Factor Authentication (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expense-management
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.template .env.local
   ```

4. **Configure Gmail SMTP** (See [Email Setup Guide](#-email-setup))
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   EMAIL_DEBUG=true
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### 🎯 First Steps

1. **Login as Admin** (default credentials will be displayed on first run)
2. **Configure Email Settings** in Admin Dashboard → Email Configuration
3. **Create Users** via User Management panel
4. **Set Up Approval Rules** for expense workflows
5. **Start Managing Expenses!**

## 🏗️ Tech Stack

### Frontend
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library

### Backend & APIs
- **Next.js API Routes** - Server-side functionality
- **Nodemailer** - Email delivery via SMTP
- **EmailJS** - Client-side email service (fallback)
- **Currency API** - Live exchange rates

### UI Components
- **shadcn/ui** - Re-usable component library
- **Recharts** - Data visualization and charts
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Sonner** - Toast notifications

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📁 Project Structure

```
expense-management/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   └── send-email/    # Email service endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin-dashboard.tsx
│   ├── employee-dashboard.tsx
│   ├── manager-dashboard.tsx
│   ├── auth-page.tsx
│   ├── expense-submission-form.tsx
│   ├── user-management.tsx
│   └── email-config-wizard.tsx
├── lib/                  # Utility libraries
│   ├── data-context.tsx  # Global state management
│   ├── email-service.ts  # Email functionality
│   ├── currency-service.ts # Currency conversion
│   ├── ocr-service.ts    # Receipt OCR processing
│   ├── types.ts          # TypeScript definitions
│   └── utils.ts          # Helper functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
└── styles/              # Additional stylesheets
```

## 🎭 User Roles & Permissions

### 👑 Admin
- **Full System Access**
- User management (create, edit, delete)
- Approval rule configuration
- Email system management
- Company settings and currency
- System-wide analytics and reports
- Expense oversight and intervention

### 👨‍💼 Manager  
- **Team Management**
- Review and approve/reject team expenses
- View team expense analytics
- Access to direct reports' expense history
- Bulk approval operations
- Team spending insights

### 👤 Employee
- **Personal Expense Management**
- Submit expense reports with receipts
- Track expense status and history
- View personal spending analytics
- Upload and manage receipts
- Receive approval/rejection notifications

## 📧 Email Setup

ExpenseFlow includes a comprehensive email notification system. Follow these steps to set up Gmail SMTP:

### 1. Enable 2-Factor Authentication
Visit [Google Account Security](https://myaccount.google.com/security) and enable 2FA.

### 2. Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** and **Other (custom name)**
3. Enter "ExpenseFlow" as the name
4. Copy the 16-character password

### 3. Configure Environment Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM="ExpenseFlow Notifications" <your-email@gmail.com>
EMAIL_DEBUG=true
```

### 4. Test Configuration
Use the built-in Email Configuration Wizard in the Admin Dashboard to test your setup.

### Email Triggers
- 📨 **User Creation**: Welcome email with login credentials
- 📨 **Expense Submission**: Manager notification
- 📨 **Expense Approval**: Employee confirmation
- 📨 **Expense Rejection**: Employee notification with feedback

## 🎨 Customization

### Theme Configuration
- Built-in dark/light mode toggle
- Customizable color schemes via CSS variables
- Responsive design breakpoints
- Component-level styling with Tailwind

### Branding
- Replace logo in `/public/` directory
- Update company information in data context
- Customize email templates in email service
- Modify color scheme in `globals.css`

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SMTP_HOST` | SMTP server hostname | Yes | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | Yes | `587` |
| `SMTP_USER` | SMTP username (email) | Yes | `user@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | Yes | `abcd efgh ijkl mnop` |
| `SMTP_FROM` | From address for emails | No | `"App" <user@gmail.com>` |
| `EMAIL_DEBUG` | Enable email debugging | No | `true` |

### Adding New Features

1. **Create Components** in `/components/`
2. **Add Types** in `/lib/types.ts`  
3. **Update Data Context** in `/lib/data-context.tsx`
4. **Add API Routes** in `/app/api/`
5. **Style with Tailwind** and component patterns

## 📱 Responsive Design

ExpenseFlow is fully responsive and optimized for:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)  
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Screens** (1440px+)

## 🔧 Troubleshooting

### Common Issues

#### Email Not Working
1. Check Gmail 2FA is enabled
2. Verify App Password is correct (16 characters)
3. Test SMTP connection in Admin Dashboard
4. Check spam/junk folders
5. Enable `EMAIL_DEBUG=true` for detailed logs

#### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies  
rm -rf node_modules
npm install

# Check for TypeScript errors
npm run lint
```

#### Port Already in Use
```bash
# Kill processes on port 3000
npx kill-port 3000

# Or start on different port
npm run dev -- -p 3001
```

### Debug Mode
Set `EMAIL_DEBUG=true` in `.env.local` to enable:
- Detailed SMTP connection logs
- Email delivery tracking  
- API request/response logging
- Performance metrics

## 📈 Performance

### Optimization Features
- **Next.js 15** App Router for optimal performance
- **React 19** with concurrent features
- **Image Optimization** with Next.js Image component
- **Code Splitting** for faster page loads
- **Static Site Generation** where applicable
- **Efficient State Management** with React Context

### Monitoring
- Built-in analytics with Vercel Analytics
- Performance monitoring in development
- Error boundaries for graceful failures
- Loading states for better UX

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Add TypeScript types for new features
- Include tests for new functionality
- Update documentation as needed
- Ensure responsive design compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- 📧 **Email**: [Support Email]
- 📖 **Documentation**: [Project Wiki/Docs URL]
- 🐛 **Issues**: [GitHub Issues URL]
- 💬 **Discussions**: [GitHub Discussions URL]

## 🙏 Acknowledgments

- **Vercel** for Next.js and deployment platform
- **Radix UI** for accessible component primitives  
- **shadcn/ui** for beautiful component library
- **Tailwind CSS** for utility-first styling
- **React Team** for the amazing React 19 features

---

<div align="center">
  <p>Made with ❤️ by the ExpenseFlow Team</p>
  <p>
    <a href="#-expenseflow---modern-expense-management-system">⬆️ Back to Top</a>
  </p>
</div>