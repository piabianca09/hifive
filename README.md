# HiFive - Co-working Business Management Platform

A comprehensive Next.js web application with Supabase integration for managing co-working spaces with membership tracking, customer logs, product sales, and expense management.

## Features

- **Role-Based Access Control**: Admin, Staff, and Member roles with customized permissions
- **Member Management**: Track memberships with different pass types and pricing tiers
- **Customer Logging**: Log walk-in customers and member check-ins
- **Product Sales**: Manage products and track sales transactions
- **Expense Tracking**: Record and manage business expenses with approval workflow
- **QR Code Generation**: Generate QR codes for quick member check-ins
- **Analytics Dashboard**: View insights on customer logs, sales, and expenses
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 15 with React 19
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **State Management**: Zustand
- **Validation**: Zod
- **Additional Libraries**: 
  - QR Code generation (qrcode.react)
  - HTTP client (axios)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── members/              # Member management
│   │   ├── logs/                 # Customer logs
│   │   ├── products/             # Product management
│   │   └── expenses/             # Expense management
│   ├── auth/                     # Authentication pages
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (protected)/              # Protected routes
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── settings/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── auth/                     # Authentication components
│   │   ├── SignInForm.tsx
│   │   └── SignUpForm.tsx
│   ├── layout/
│   │   └── Navbar.tsx
│   └── dashboard/
│       ├── AdminDashboard.tsx
│       └── StaffDashboard.tsx
├── lib/
│   ├── supabase/                 # Supabase client setup
│   │   ├── client.ts
│   │   └── server.ts
│   ├── types/                    # TypeScript types
│   │   └── database.ts
│   ├── schemas/                  # Zod validation schemas
│   │   ├── auth.ts
│   │   └── membership.ts
│   ├── constants/                # Application constants
│   │   ├── membership.ts
│   │   └── roles.ts
│   └── utils/                    # Utility functions
│       └── auth-helpers.ts
├── hooks/
│   ├── useAuth.ts
│   └── usePermission.ts
└── store/
    └── authStore.ts              # Zustand auth store
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Git

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup

Create the following tables in your Supabase project:

#### 1. User Profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff', 'member')),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
```

#### 2. Members Table
```sql
CREATE TABLE members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  phone VARCHAR(20),
  avatar_url TEXT,
  membership_type VARCHAR(50) CHECK (membership_type IN ('student', 'professional')),
  active_pass_type VARCHAR(50) CHECK (active_pass_type IN ('walk-in', 'day-pass', 'night-pass', '1-day', 'weekly', 'monthly')),
  check_in_code VARCHAR(255) NOT NULL UNIQUE,
  membership_start_date DATE,
  membership_end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_members_active ON members(is_active);
CREATE INDEX idx_members_check_in_code ON members(check_in_code);
```

#### 3. Customer Logs Table
```sql
CREATE TABLE customer_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  logged_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  check_in_time TIMESTAMP NOT NULL,
  check_out_time TIMESTAMP,
  log_type VARCHAR(50) NOT NULL CHECK (log_type IN ('walk-in', 'member')),
  membership_type VARCHAR(50) CHECK (membership_type IN ('student', 'professional')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_checkout CHECK (check_out_time IS NULL OR check_out_time >= check_in_time)
);

CREATE INDEX idx_customer_logs_date ON customer_logs(created_at);
CREATE INDEX idx_customer_logs_member ON customer_logs(member_id);
```

#### 4. Products Table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 0),
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_name ON products(name);
```

#### 5. Sales Table
```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price > 0),
  sold_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE SET NULL,
  is_walk_in BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sales_date ON sales(created_at);
CREATE INDEX idx_sales_product ON sales(product_id);
```

#### 6. Expenses Table
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(100) NOT NULL,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  recorded_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_date ON expenses(recorded_date);
CREATE INDEX idx_expenses_created_by ON expenses(created_by);
```

#### 7. Promos Table
```sql
CREATE TABLE promos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (valid_until > valid_from)
);

CREATE INDEX idx_promos_code ON promos(code);
CREATE INDEX idx_promos_active ON promos(is_active);
```

### Running the Application

Development mode:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## User Roles and Permissions

### Admin
- View entire system
- Create, edit, and delete members
- Manage products and sales
- Create and manage promos
- Create and approve expenses
- View analytics and reports
- Access to all dashboard features

### Staff
- Log customer check-ins (walk-in and members)
- Record shift expenses (subject to admin approval)
- View shift balance
- Cannot edit without admin approval
- Limited access to customer data

### Member
- Access personal profile
- View membership details and remaining days
- Download QR code for quick check-in
- View available promos and discounts
- Update profile information

## Membership Pricing

### Walk-in
- Student: ₱30
- Professional: ₱40

### Day Pass
- Student: ₱200
- Professional: ₱250

### Night Pass
- Student: ₱150
- Professional: ₱200

### 1-Day Pass
- Student: ₱300
- Professional: ₱400

### Weekly Pass
- Student: ₱1,000
- Professional: ₱1,200

### Monthly Pass
- Student: ₱2,500
- Professional: ₱3,500

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Row-Level Security**: Database-level access control via Supabase RLS
- **Password Hashing**: Secure password storage via Supabase Auth
- **Role-Based Access Control**: Permission-based feature access
- **Input Validation**: Server and client-side validation with Zod
- **API Route Protection**: Protected API endpoints with auth checks

## Best Practices Implemented

- **Modular Components**: Reusable, maintainable component structure
- **Type Safety**: Full TypeScript support throughout the project
- **Environment Variables**: Sensitive configuration via environment files
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance**: Optimized with Next.js server components
- **Scalability**: Designed to handle growing data and user base

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the project on Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Other Platforms

This application can be deployed to any platform that supports Node.js 18+

## License

This project is proprietary and confidential.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
