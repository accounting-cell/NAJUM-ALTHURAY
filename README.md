# 🌟 Najm Althuraya - Transaction Management System

A complete, production-ready web application for managing government service transactions with role-based access control, multi-language support, and modern UI.

## 📋 Features

### ✨ Core Functionality
- ✅ **User Authentication** - Secure JWT-based login system
- ✅ **Transaction Management** - Create, read, update, delete transactions
- ✅ **Shift Handover** - Transfer transactions between employees (Supervisor only)
- ✅ **User Management** - Add, edit, delete users (Admin only)
- ✅ **System Settings** - Customize app name, colors, language (Admin only)
- ✅ **Role-Based Access** - Admin, Supervisor, Employee with different permissions

### 🌍 Multi-Language Support
- Arabic (RTL)
- English (LTR)
- Switchable from login page and dashboard

### 📱 Responsive Design
- Mobile-friendly
- Tablet-optimized
- Desktop-ready
- Works on all screen sizes

### 🎨 Customizable Branding
- Change app name
- Customize primary and secondary colors
- Dynamic theme application

## 🏗️ Technology Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** express-validator

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **HTTP Client:** Axios
- **Internationalization:** i18next
- **Icons:** Lucide React

### Deployment
- **Database:** Supabase (Free tier)
- **Backend:** Railway (Free $5 credit/month)
- **Frontend:** Vercel (Free tier)
- **Domain:** Custom domain support

## 📁 Project Structure

```
najm-system/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── routes/             # API routes
│   ├── server.js           # Main server file
│   └── package.json        # Dependencies
│
├── frontend/               # React Application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main pages
│   │   ├── context/       # React Context (Auth)
│   │   ├── utils/         # Utilities (API)
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   └── package.json       # Dependencies
│
├── database/              # Database schema
│   └── schema.sql         # PostgreSQL schema
│
└── docs/                  # Documentation
    └── DEPLOYMENT_GUIDE.md # Step-by-step deployment
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account (free)
- Railway account (free)
- Vercel account (free)

### Local Development

1. **Clone/Extract the project**

2. **Setup Database:**
   - Create Supabase project
   - Run `database/schema.sql` in Supabase SQL Editor

3. **Setup Backend:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your database URL and JWT secret
   npm start
   ```

4. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend URL
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

### Default Login
- **Email:** admin@najum-althuraya.com
- **Password:** admin123
- ⚠️ **Change this immediately after first login!**

## 🌐 Deployment

See **[DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)** for complete step-by-step instructions.

### Quick Deployment Summary:

1. **Database (Supabase)**
   - Create project
   - Run schema
   - Get connection string

2. **Backend (Railway)**
   - Deploy code
   - Set environment variables
   - Get backend URL

3. **Frontend (Vercel)**
   - Deploy code
   - Set VITE_API_URL
   - Connect custom domain

## 👥 User Roles & Permissions

### Admin
- Full system access
- Manage users (add, edit, delete)
- Manage all transactions
- Create shift handovers
- Change system settings
- View all statistics

### Supervisor
- View all transactions
- Create and edit transactions
- Create shift handovers
- Assign transactions to employees
- View all users

### Employee
- View own transactions only
- Create new transactions
- Edit own transactions
- Search by client name and mobile only
- Accept assigned handovers

## 📊 Database Schema

### Main Tables
- **users** - System users with roles
- **transactions** - Customer transactions
- **transaction_history** - Audit trail
- **handovers** - Shift handover records
- **handover_items** - Handover transaction mapping
- **settings** - System configuration

## 🔒 Security Features

- ✅ Passwords hashed with bcryptjs
- ✅ JWT token authentication
- ✅ Role-based authorization
- ✅ SQL injection protection
- ✅ HTTPS/SSL (via deployment platforms)
- ✅ CORS configuration
- ✅ Input validation

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Transactions
- `GET /api/transactions` - Get transactions (filtered by role)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction (Admin only)

### Users (Admin/Supervisor only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user (Admin only)
- `PUT /api/users/:id` - Update user (Admin only)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Handovers (Supervisor only)
- `GET /api/handovers` - Get all handovers
- `POST /api/handovers` - Create handover
- `GET /api/handovers/:id` - Get handover details
- `PUT /api/handovers/:id/accept` - Accept handover (Employee)

### Settings
- `GET /api/settings` - Get system settings
- `PUT /api/settings` - Update settings (Admin only)

## 🎯 Transaction Fields

- Transaction Number (auto-generated)
- Service Type (text field)
- Transaction Type (dropdown: New, Renewal, Update, Cancellation)
- Client Full Name
- Passport/ID Number
- Mobile Number
- Status (Pending, In Progress, Ready, Delivered, Cancelled)
- Receive Date
- Expected Delivery Date
- Notes
- Assigned Employee
- Created By
- Timestamps

## 💰 Costs

### Free Tier Limits:
- **Supabase:** 500MB storage, unlimited API requests
- **Railway:** $5 credit/month (~500hrs runtime)
- **Vercel:** Unlimited deployments, 100GB bandwidth

**Total Cost:** FREE to $5-10/month for 10-20 users

## 🐛 Troubleshooting

### Backend Issues
- Check DATABASE_URL is correct
- Verify JWT_SECRET is set
- Check Railway logs for errors

### Frontend Issues
- Ensure VITE_API_URL points to backend
- Rebuild after environment variable changes
- Check browser console for errors

### Database Issues
- Verify schema was run successfully
- Check Supabase connection pooling
- Ensure credentials are correct

## 📝 License

This project is proprietary software developed for Najm Althuraya.

## 🤝 Support

For issues or questions:
1. Check the [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
2. Review the troubleshooting section
3. Check backend logs in Railway
4. Verify environment variables

## ✅ Checklist After Installation

- [ ] Database schema run successfully
- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] Domain connected and working
- [ ] Default admin login successful
- [ ] Admin password changed
- [ ] First test user created
- [ ] First test transaction created
- [ ] Settings customized (app name, colors)

## 🎉 You're Ready!

Your transaction management system is now fully functional and ready to use!

**Default Access:** https://najum-althuraya.com

Enjoy your new system! 🚀
