# RekberPay Setup Guide

This guide provides detailed instructions for setting up the RekberPay development environment.

## Prerequisites

Before starting, ensure you have:

- **Node.js** 22.13.0 or higher ([Download](https://nodejs.org/))
- **pnpm** 10.4.1 or higher ([Installation Guide](https://pnpm.io/installation))
- **Git** ([Download](https://git-scm.com/))
- **MySQL** 8.0+ or **TiDB** ([Download](https://www.mysql.com/downloads/))
- A **Manus account** for OAuth configuration
- A **GitHub account** for repository access

### Verify Installations

```bash
# Check Node.js version
node --version  # Should be v22.13.0 or higher

# Check pnpm version
pnpm --version  # Should be 10.4.1 or higher

# Check Git version
git --version   # Should be 2.0 or higher

# Check MySQL version
mysql --version # Should be 8.0 or higher
```

## Step 1: Clone the Repository

```bash
# Clone from GitHub
git clone https://github.com/hackazer/rekberpay-js.git
cd rekberpay-js

# Or if you forked it
git clone https://github.com/YOUR_USERNAME/rekberpay-js.git
cd rekberpay-js
```

## Step 2: Install Dependencies

```bash
# Install all project dependencies
pnpm install

# This will install:
# - Frontend dependencies (React, Tailwind, etc.)
# - Backend dependencies (Express, tRPC, Drizzle, etc.)
# - Development tools (TypeScript, Prettier, etc.)
```

### Troubleshooting Installation

If you encounter issues:

```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

## Step 3: Database Setup

### Create Database

```bash
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE rekberpay;
CREATE USER 'rekberpay_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON rekberpay.* TO 'rekberpay_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Configure Database Connection

Create a `.env.local` file in the project root:

```env
# Database Configuration
DATABASE_URL=mysql://rekberpay_user:secure_password@localhost:3306/rekberpay
```

### Run Migrations

```bash
# Generate migrations from schema
pnpm db:generate

# Apply migrations to database
pnpm db:push

# Verify database setup
pnpm db:studio  # Opens visual database editor
```

## Step 4: Manus OAuth Setup

### Get OAuth Credentials

1. Go to [Manus Dashboard](https://manus.im)
2. Create a new application
3. Note your `App ID`
4. Set redirect URI to `http://localhost:3000/api/oauth/callback`
5. Generate API keys

### Configure Environment Variables

Add to `.env.local`:

```env
# OAuth Configuration
VITE_APP_ID=your_app_id_here
VITE_OAUTH_PORTAL_URL=https://api.manus.im
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_jwt_secret_key_here

# Owner Configuration (Your Account)
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id_from_manus

# API Keys from Manus
BUILT_IN_FORGE_API_KEY=your_api_key_here
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key_here
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

## Step 5: Application Configuration

### Configure App Settings

Add to `.env.local`:

```env
# Application Configuration
VITE_APP_TITLE=RekberPay
VITE_APP_LOGO=https://your-logo-url.png

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

### Complete `.env.local` Example

```env
# Database
DATABASE_URL=mysql://rekberpay_user:secure_password@localhost:3306/rekberpay

# OAuth
VITE_APP_ID=app_123456789
VITE_OAUTH_PORTAL_URL=https://api.manus.im
OAUTH_SERVER_URL=https://api.manus.im
JWT_SECRET=your_super_secret_jwt_key_12345

# Application
VITE_APP_TITLE=RekberPay
VITE_APP_LOGO=https://placehold.co/128x128/E1E7EF/1F2937?text=RekberPay

# Owner
OWNER_NAME=John Doe
OWNER_OPEN_ID=user_123456789

# API Keys
BUILT_IN_FORGE_API_KEY=forge_key_123456789
BUILT_IN_FORGE_API_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_KEY=frontend_key_123456789
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=analytics_123456789
```

## Step 6: Start Development Server

```bash
# Start the development server
pnpm run dev

# Output should show:
# [OAuth] Initialized with baseURL: https://api.manus.im
# Server running on http://localhost:3000/
```

### Verify Server is Running

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the RekberPay landing page.

## Step 7: Test Authentication

1. Click "Login" or "Get Started" button
2. You'll be redirected to Manus OAuth portal
3. Sign in with your account
4. You'll be redirected back to the dashboard
5. You should see your user profile

## Development Workflow

### Daily Development

```bash
# Start development server
pnpm run dev

# In another terminal, watch for TypeScript errors
pnpm run type-check:watch

# Format code before committing
pnpm run format
```

### Making Changes

1. Create a feature branch
2. Make your changes
3. Test locally
4. Commit with clear messages
5. Push and create a PR

### Database Changes

If you modify `drizzle/schema.ts`:

```bash
# Generate migration
pnpm db:generate

# Review the generated SQL file
cat drizzle/migrations/

# Apply migration
pnpm db:push

# Commit changes
git add drizzle/
git commit -m "db: Update schema for feature"
```

## Common Issues and Solutions

### Port 3000 Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3001 pnpm run dev
```

### Database Connection Error

```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1"

# Check DATABASE_URL in .env.local
echo $DATABASE_URL

# Test connection
mysql -u rekberpay_user -p -h localhost -D rekberpay
```

### OAuth Redirect URI Mismatch

1. Verify `VITE_APP_ID` is correct
2. Check redirect URI in Manus dashboard matches `http://localhost:3000/api/oauth/callback`
3. Clear browser cookies and try again

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf .tsbuildinfo

# Reinstall dependencies
pnpm install

# Run type check
pnpm run type-check
```

### pnpm Installation Issues

```bash
# Update pnpm
pnpm add -g pnpm@latest

# Clear cache
pnpm store prune

# Reinstall
pnpm install
```

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | MySQL connection string | `mysql://user:pass@localhost:3306/db` |
| `VITE_APP_ID` | Manus OAuth app ID | `app_123456789` |
| `VITE_OAUTH_PORTAL_URL` | OAuth portal URL | `https://api.manus.im` |
| `OAUTH_SERVER_URL` | OAuth server URL | `https://api.manus.im` |
| `JWT_SECRET` | Session token secret | `your_secret_key` |
| `VITE_APP_TITLE` | Application title | `RekberPay` |
| `VITE_APP_LOGO` | Logo URL | `https://example.com/logo.png` |
| `OWNER_NAME` | Owner name | `John Doe` |
| `OWNER_OPEN_ID` | Owner's Manus ID | `user_123456789` |
| `BUILT_IN_FORGE_API_KEY` | Backend API key | `forge_key_123456789` |
| `BUILT_IN_FORGE_API_URL` | API URL | `https://api.manus.im` |
| `VITE_FRONTEND_FORGE_API_KEY` | Frontend API key | `frontend_key_123456789` |
| `VITE_FRONTEND_FORGE_API_URL` | Frontend API URL | `https://api.manus.im` |
| `VITE_ANALYTICS_ENDPOINT` | Analytics endpoint | `https://analytics.example.com` |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | `analytics_123456789` |

## Next Steps

1. **Explore the codebase** - Familiarize yourself with the project structure
2. **Read the README** - Understand the project overview and features
3. **Check the CONTRIBUTING guide** - Learn how to contribute
4. **Create a feature branch** - Start working on your feature
5. **Run tests** - Ensure everything works correctly

## Getting Help

- **Documentation:** Check README.md and CONTRIBUTING.md
- **Issues:** Search GitHub issues for similar problems
- **Discussions:** Start a discussion in GitHub
- **Email:** dev@rekberpay.com

## Additional Resources

- [Node.js Documentation](https://nodejs.org/docs/)
- [pnpm Documentation](https://pnpm.io/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

Happy coding! 🚀
