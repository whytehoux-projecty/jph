# JPHeritage — Unified Digital Banking Platform

A modern, enterprise-grade digital banking web application built with **Next.js 14 (App Router)**, **React 19**, **TypeScript**, **TailwindCSS**, **Prisma ORM**, and **NextAuth.js**. 

The **JPHeritage Unified Bank** consolidates three core banking portals into a single, high-performance monorepo:
1. 🌐 **Corporate & Marketing Website** (`/`): High-converting commercial banking storefront, showcasing legacy merger history, personal & business banking products, and onboarding applications.
2. 🏛️ **Customer E-Banking Portal** (`/dashboard`): Secure client dashboard for account management, domestic & international wire transfers, cards management, bill payments, savings goals, and e-statements.
3. 🛡️ **Back-Office Admin Portal** (`/admin`): Full-featured back-office management console for reviewing transactions, approving applications, freezing accounts, overriding balances for live demonstrations, handling customer support tickets, and broadcasting notifications.

---

## 🏗️ Architecture & Features

### 1. Corporate Website (`app/(corporate)`)
- **Homepage & Landing Experience**: Responsive hero sections, heritage merger showcase, dynamic rate calculators, and security guarantees.
- **Product Portfolios**: Dedicated showcases for Personal Banking (`/personal-banking`) and Business/Commercial Banking (`/business-banking`).
- **Institutional About**: Company history, governance, security infrastructure, and leadership (`/about`).
- **Customer Acquisition**: Online account application funnel (`/apply`), contact messaging (`/contact`), and onboarding (`/signup`).

### 2. Customer E-Banking Portal (`app/(portal)`)
- **Secure Authentication**: NextAuth v5 session management with role-based routing and credentials authentication.
- **Account Management**: Real-time checking and savings overview, balances, and transaction history (`/accounts`, `/overview`).
- **Funds Transfer**: Multi-step transfer workflow supporting internal transfers, external wires, and international routing (`/transfer`).
- **Cards Management**: Virtual card generation, spend limits, ATM controls, PIN management, and card freezing (`/cards`).
- **Bill Pay & Payees**: Automated bill payments, scheduled recurring drafts, and payee management (`/bills`).
- **E-Statements**: Periodic statement generation and downloadable records (`/statements`).
- **Customer Notifications & Beneficiaries**: Live alerts, push notifications, and verified beneficiary directory (`/beneficiaries`).

### 3. Back-Office Admin Portal (`app/(admin)`)
- **Command Center Dashboard**: Executive KPI metrics (Total Accounts, AUM, Active Users, Pending Queue) and real-time activity stream (`/admin`).
- **Workflow Approvals**:
  - **Transactions (`/admin/transactions`)**: Audit, approve, or reject pending wires and high-value transfers.
  - **Account Applications (`/admin/applications`)**: Review applicant KYC data and automatically provision accounts upon approval.
  - **Access Requests (`/admin/requests`)**: Verify legacy account holders requesting digital banking credentials.
- **Entity Oversight**:
  - **User Directory (`/admin/users`)**: Tier upgrades (Basic, Premium, Private Banking), status toggles, and user suspension.
  - **Accounts & Balance Tool (`/admin/accounts`)**: Freeze/unfreeze accounts and execute instant balance adjustments for demo scenarios.
  - **Card Management (`/admin/cards`)**: Issue, freeze, or cancel debit and credit cards.
  - **Bill Pay Dispatch (`/admin/bills`)**: Review and process customer bill payment orders.
  - **Support Inbox (`/admin/support`)**: Triage customer inquiries and send resolutions.
  - **System Notifications (`/admin/notifications`)**: Broadcast announcements or dispatch targeted in-portal alerts.
  - **Manual Statements (`/admin/statements`)**: Generate statements on demand.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, Server Components)
- **UI & Styling**: [TailwindCSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/)
- **State & Animations**: [Framer Motion](https://www.framer.com/motion/), React Hooks
- **Data & ORM**: [Prisma ORM](https://www.prisma.io/) with SQLite (local demo) / PostgreSQL (production cloud)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/)
- **Charts & Data Viz**: [Recharts](https://recharts.org/)
- **Form Handling**: React Hook Form with [Zod](https://zod.dev/) schema validation

---

## 📁 Repository Structure

```
unified-bank/
├── app/
│   ├── (admin)/admin/           # Back-office admin dashboard and management views
│   ├── (corporate)/             # Corporate marketing pages & customer onboarding
│   ├── (portal)/                # Authenticated customer e-banking portal
│   ├── actions/                 # Next.js Server Actions (mutations & workflow handlers)
│   ├── api/                     # API route handlers & NextAuth endpoints
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles & design tokens
├── components/
│   ├── admin/                   # Admin portal components & data tables
│   ├── commercial/              # Corporate website components
│   ├── dashboard/               # Customer portal widgets and metrics
│   ├── portal/                  # Reusable banking portal components
│   └── ui/                      # Base shadcn/ui primitives
├── docs/                        # Architecture & deployment documentation
│   ├── deployment_plan.md       # Free cloud hosting guide (Vercel + Supabase)
│   ├── admin_portal_walkthrough.md # Comprehensive admin portal operational guide
│   ├── jph_gap_analysis.md      # Gap analysis against legacy standalone portals
│   ├── gap_fix_plan.md          # Implementation plan for gap closures
│   └── implementation_plan.md   # Unified architectural design specification
├── lib/                         # Utilities, Prisma client singleton, and constants
├── prisma/
│   ├── schema.prisma            # Database schema definition
│   └── seed.ts                  # Database seeding script (mock users, accounts, demo data)
├── public/                      # Static assets, logos, and vector illustrations
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or higher
- **Package Manager**: `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/whytehoux-projecty/jph.git
   cd jph
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secure-random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize and Seed Database**:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser:
   - Corporate Landing: `http://localhost:3000/`
   - Customer Portal: `http://localhost:3000/login`
   - Admin Console: `http://localhost:3000/admin`

---

## 📚 Documentation Index

All architectural and operations documentation is maintained inside the [`docs/`](./docs) directory:

- 📘 [**Deployment Plan (Free Cloud Stack)**](./docs/deployment_plan.md): Step-by-step instructions for deploying to Vercel and Supabase PostgreSQL for free.
- 📕 [**Admin Portal Walkthrough**](./docs/admin_portal_walkthrough.md): Comprehensive feature breakdown and operations guide for the administrative back-office.
- 📙 [**JPH Gap Analysis**](./docs/jph_gap_analysis.md): Technical comparison between legacy standalone apps and the unified Next.js monorepo.
- 📗 [**Gap Fix Plan**](./docs/gap_fix_plan.md): Historical milestone tracking for UI/UX and feature alignment.
- 📓 [**Unified Architecture Plan**](./docs/implementation_plan.md): Full technical specification for data models, server actions, and portal boundaries.

---

## 🌐 Deployment to Production

For production or cloud showcase deployments, review [docs/deployment_plan.md](./docs/deployment_plan.md). The recommended free cloud stack is:
- **Application Server & CDN**: [Vercel](https://vercel.com) (Next.js native serverless runtime)
- **Database**: [Supabase](https://supabase.com) (Managed free PostgreSQL instance)

---

## 📄 License

Internal Proprietary — JPHeritage Banking Group.
