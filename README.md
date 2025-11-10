# RekberPay - Indonesian Escrow Platform

A modern, secure, and user-friendly escrow platform built with TypeScript, React, and Express.js. RekberPay enables safe milestone-based transactions between buyers and sellers in Indonesia, with built-in dispute resolution, KYC verification, and multiple payment gateway support.

## 🎯 Project Overview

RekberPay is Indonesia's trusted escrow solution designed to eliminate transaction fraud and provide security for both buyers and sellers. The platform implements a sophisticated escrow engine with milestone-based fund releases, secure dispute resolution, and comprehensive admin controls.

### Key Features

- **Secure Escrow Transactions** - Funds are held securely until both parties confirm the transaction is complete
- **Smart URL Escrow Creation** - Paste any marketplace link and automatically extract product details to create an escrow in seconds
- **KYC Verification** - Complete identity verification for enhanced security and compliance with Indonesian regulations
- **Dispute Resolution** - Built-in mediation system with secure chat and evidence upload for fair conflict resolution
- **Multiple Payment Methods** - Support for Mayar, static QR codes, and manual settlement
- **Admin Dashboard** - Comprehensive management interface for user management, analytics, and dispute oversight
- **Real-time Notifications** - Email, SMS, and in-app alerts for transaction updates
- **Audit Logging** - Complete transaction history for compliance and fraud prevention
- **Role-Based Access Control** - Support for multiple user roles (Admin, Agent Admin, Buyer, Seller, Mediator)

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- ShadCN/UI components for consistent design
- Wouter for lightweight routing
- tRPC for type-safe API calls
- React Query for data management

**Backend:**
- Express.js 4 with Node.js
- tRPC 11 for type-safe RPC procedures
- Drizzle ORM for database management
- MySQL/TiDB for data persistence
- Manus OAuth for authentication
- SuperJSON for complex data serialization

**Infrastructure:**
- Docker-ready deployment
- Environment-based configuration
- S3 integration for file storage
- Webhook support for integrations

### Database Schema

The application uses 14 core tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts with KYC status and reputation |
| `escrows` | Main escrow transactions with lifecycle tracking |
| `escrow_wallets` | Fund tracking per transaction |
| `transactions` | Detailed money movement records |
| `disputes` | Dispute cases with resolution tracking |
| `dispute_messages` | Secure chat between parties |
| `reviews` | Ratings and feedback system |
| `payment_methods` | Saved payment information |
| `fee_configs` | Flexible fee structure configuration |
| `notifications` | Multi-channel alert system |
| `audit_logs` | Immutable action records for compliance |
| `blacklist` | AML/CFT compliance tracking |
| `api_keys` | External API integration management |
| `webhooks` | Event subscription system |

## 📋 Prerequisites

Before running the project, ensure you have:

- **Node.js** 22.13.0 or higher
- **pnpm** 10.4.1 or higher (package manager)
- **MySQL** 8.0+ or **TiDB** compatible database
- **Git** for version control
- A Manus account for OAuth configuration
- Environment variables properly configured

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/hackazer/rekberpay-js.git
cd rekberpay-js
```

### 2. Install Dependencies

```bash
# Install all project dependencies
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL=mysql://user:password@localhost:3306/rekberpay

# OAuth Configuration (Manus)
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://api.manus.im
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_jwt_secret_key

# Application Configuration
VITE_APP_TITLE=RekberPay
VITE_APP_LOGO=https://your-logo-url.png

# Owner Configuration
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# API Keys
BUILT_IN_FORGE_API_KEY=your_api_key
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### 4. Set Up the Database

```bash
# Generate database migrations
pnpm db:generate

# Apply migrations to your database
pnpm db:push
```

### 5. Start the Development Server

```bash
# Run both frontend and backend in development mode
pnpm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
rekberpay-js/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── pages/         # Page components (Home, Dashboard, etc.)
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React contexts (Theme, Auth)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and helpers
│   │   ├── App.tsx        # Main app component with routing
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── index.html         # HTML template
│
├── server/                # Express.js backend
│   ├── _core/            # Core infrastructure
│   │   ├── index.ts      # Server entry point
│   │   ├── context.ts    # tRPC context setup
│   │   ├── trpc.ts       # tRPC configuration
│   │   ├── env.ts        # Environment variables
│   │   └── ...
│   ├── db.ts             # Database query helpers
│   ├── routers.ts        # tRPC procedure definitions
│   └── ...
│
├── drizzle/              # Database schema and migrations
│   ├── schema.ts         # Table definitions
│   └── migrations/       # SQL migration files
│
├── shared/               # Shared types and constants
│   └── const.ts          # Shared constants
│
├── storage/              # S3 file storage helpers
│   └── index.ts          # Storage utilities
│
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite bundler configuration
├── drizzle.config.ts     # Drizzle ORM configuration
└── README.md             # This file
```

## 🔧 Development Commands

### Frontend Development

```bash
# Start development server with hot reload
pnpm run dev

# Build for production
pnpm run build

# Preview production build locally
pnpm run preview

# Run type checking
pnpm run type-check

# Format code with Prettier
pnpm run format
```

### Database Management

```bash
# Generate new migrations from schema changes
pnpm db:generate

# Apply pending migrations
pnpm db:push

# Open database studio (visual editor)
pnpm db:studio
```

### Type Safety

```bash
# Check TypeScript errors
pnpm run type-check

# Watch mode for continuous checking
pnpm run type-check:watch
```

## 🔐 Authentication Flow

RekberPay uses Manus OAuth for secure authentication:

1. User clicks "Login" or "Get Started"
2. Redirected to Manus OAuth portal
3. User authenticates with email, Google, or OTP
4. Redirected back to `/api/oauth/callback`
5. Session cookie is created
6. User is authenticated in the application

### Protected Routes

Routes that require authentication:
- `/dashboard` - User transaction dashboard
- `/escrow/create` - Create new escrow
- `/escrow/:id` - View escrow details
- `/profile` - User profile and KYC
- `/dispute/:id` - Dispute management
- `/admin` - Admin dashboard (admin only)

## 💳 Payment Integration

### Supported Payment Methods

1. **Mayar Payment Gateway** - Primary payment processor for fund collection
2. **Static QR Codes** - Direct bank transfer with QR code generation
3. **Manual Settlement** - Admin-initiated fund transfers

### Payment Flow

```
Buyer initiates payment
    ↓
Selects payment method
    ↓
Funds transferred to escrow wallet
    ↓
Escrow status: FUNDED
    ↓
Buyer confirms receipt/completion
    ↓
Funds released to seller
    ↓
Escrow status: COMPLETED
```

## 🛡️ Security Features

- **HTTPS/TLS Encryption** - All data in transit is encrypted
- **JWT Session Management** - Secure session tokens with expiration
- **KYC Verification** - Identity verification for compliance
- **AML/CFT Blacklist** - Fraud prevention and compliance
- **Audit Logging** - Complete transaction history
- **Role-Based Access Control** - Fine-grained permission management
- **Secure Password Hashing** - Industry-standard password security
- **CORS Configuration** - Cross-origin request protection

## 📊 Admin Dashboard Features

The admin panel provides:

- **User Management** - View, freeze, and manage user accounts
- **KYC Approval** - Review and approve identity verification
- **Escrow Monitoring** - Track all transactions and status
- **Dispute Management** - Review and resolve disputes
- **Analytics Dashboard** - Transaction volume, completion rates, and trends
- **Fee Configuration** - Customize transaction fees
- **Audit Logs** - View complete action history
- **Webhook Management** - Configure external integrations

## 🐛 Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or specify a different port
PORT=3001 pnpm run dev
```

### Database Connection Issues

```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test connection
mysql -u user -p -h localhost -D rekberpay
```

### TypeScript Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Run type check
pnpm run type-check
```

## 📚 API Documentation

### tRPC Procedures

The backend exposes tRPC procedures organized by feature:

**Authentication:**
- `auth.me` - Get current user
- `auth.logout` - Logout user

**User Management:**
- `user.getProfile` - Get user profile
- `user.updateProfile` - Update profile information
- `user.submitKYC` - Submit KYC verification

**Escrow Operations:**
- `escrow.create` - Create new escrow
- `escrow.getById` - Get escrow details
- `escrow.getMyEscrows` - Get user's escrows
- `escrow.confirmPayment` - Confirm payment received
- `escrow.releasePayment` - Release funds to seller

**Dispute Management:**
- `dispute.create` - Create dispute
- `dispute.getByEscrowId` - Get dispute for escrow
- `dispute.getMessages` - Get dispute messages
- `dispute.addMessage` - Add message to dispute

**Admin Operations:**
- `admin.getUsers` - List all users
- `admin.getEscrows` - List all escrows
- `admin.getDisputes` - List all disputes
- `admin.getStats` - Get platform statistics
- `admin.freezeUser` - Freeze user account
- `admin.unfreezeUser` - Unfreeze user account

## 🚢 Deployment

### Production Build

```bash
# Build frontend and backend
pnpm run build

# Start production server
pnpm run start
```

### Docker Deployment

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "start"]
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Create a Pull Request with a clear description

### Code Style

- Use TypeScript for type safety
- Follow the existing code structure
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

## 📝 Roadmap

### Phase 1: Core Features (✅ Complete)
- [x] Database schema and models
- [x] Authentication system
- [x] Escrow engine
- [x] User dashboards
- [x] Dispute resolution
- [x] Admin panel

### Phase 2: Payment Integration (🔄 In Progress)
- [ ] Mayar gateway integration
- [ ] QR code payment support
- [ ] Automatic settlement
- [ ] Refund management

### Phase 3: Smart Features (📋 Planned)
- [ ] AI-powered URL parsing
- [ ] Email notifications
- [ ] SMS alerts
- [ ] Push notifications
- [ ] Advanced analytics

### Phase 4: Scaling (📋 Planned)
- [ ] Multi-currency support
- [ ] International expansion
- [ ] Mobile app (iOS/Android)
- [ ] API for third-party integrations

## 📄 License

This project is proprietary software. All rights reserved.

## 📞 Support

For issues, questions, or suggestions:

- **GitHub Issues:** https://github.com/hackazer/rekberpay-js/issues
- **Email:** support@rekberpay.com
- **Documentation:** https://docs.rekberpay.com

## 👥 Team

- **Project Lead:** [Your Name]
- **Developers:** [Team Members]
- **Contributors:** Community contributors welcome!

---

**Last Updated:** November 10, 2024  
**Version:** 1.0.0  
**Status:** Active Development

Made with ❤️ for secure transactions in Indonesia
