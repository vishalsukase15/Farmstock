# 🌾 FARMSTOCK — Agricultural Equipment Marketplace System

> **“Empowering Farmers. Connecting Equipment. Growing Together.”**  
> An open, modern, secure digital platform designed to enable direct peer-to-peer buying, selling, and renting of agricultural machinery across India without middlemen or broker commissions.

---

## ✨ Key Features

- **Direct Farmer-to-Farmer Marketplace**: Buy, sell, or rent agricultural equipment with zero commission.
- **Strict Indian Rupee (₹) Pricing**: Full support for the Indian numbering system (e.g., `₹2,40,000`), with transparent hourly, daily, weekly, and monthly rental rates.
- **Multilingual Support (i18n)**:
  - 🇬🇧 English
  - 🇮🇳 मराठी (Marathi)
  - 🇮🇳 हिंदी (Hindi)
  - 🇪🇸 Español (Spanish)
- **Dual Transaction Engine**:
  - **Purchase Engine**: Submit price offers, negotiate with owners, and finalize deals.
  - **Rental Engine**: Calendar-based booking with server-side collision checks to prevent overlapping reservations.
- **Real-Time Communication**: Integrated Socket.IO chat with unread counters, typing status, and inline equipment cards.
- **Shopping Cart & Wishlist**: Save machinery for upcoming seasons or stage multiple items for purchase requests.
- **Farmer Trust & Verification**: Verified farmer badges, community ratings & reviews, and report moderation tools.
- **Administrative Control Center**: Moderate listings, manage registered users, and inspect Recharts analytics.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide React, TanStack Query, i18next, Recharts
- **Backend**: Node.js, Express.js, TypeScript, Socket.IO, Zod, JWT Auth, Multer, bcryptjs
- **Database**: PostgreSQL / SQLite with Prisma ORM (20+ normalized relational models)
- **Real-Time**: Socket.IO WebSockets

---

## 🚀 Quick Start Guide (Windows PowerShell)

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22+ recommended)
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```powershell
# From the root directory:
npm install
```

### 2. Configure Environment Variables
Verify or edit `apps/api/.env`:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="farmstock-jwt-secret-key-2026-production"
REFRESH_SECRET="farmstock-refresh-secret-key-2026-production"
CLIENT_URL="http://localhost:5173"
UPLOAD_DIR="./uploads"
```

### 3. Initialize Database & Seed Demo Data
```powershell
# Generate Prisma Client & push schema to dev database
npm run db:push

# Seed authentic Indian agricultural equipment & demo farmers
npm run db:seed
```

### 4. Run Both Backend and Frontend
In terminal 1 (Backend API & Socket Server):
```powershell
npm run dev:api
# Running on http://localhost:5000
```

In terminal 2 (Vite React Web Client):
```powershell
npm run dev:web
# Running on http://localhost:5173
```

---

## 👨‍🌾 Pre-Seeded Demo Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Seller (Farmer)** | `ramesh.patil@farmstock.com` | `Farmer@123` | Progressive Farmer, Satara (Owner of Mahindra Tractor, Rotavator) |
| **Buyer / Renter** | `suresh.shinde@farmstock.com` | `Farmer@123` | Vegetable & Crop Farmer, Kolhapur |
| **Heavy Machinery Owner** | `gurpreet.singh@farmstock.com` | `Farmer@123` | Heavy Implements & Combine Harvester Owner, Ludhiana |
| **Administrator** | `admin@farmstock.com` | `Admin@123` | Platform Administrator & Listing Moderator |

*(Quick demo buttons are also available directly on the login screen for instant 1-click login!)*

---

## 📂 Project Structure

```
c:\Users\Vishal\OneDrive\Desktop\Projects\ANTIG Farmstock\
├── apps/
│   ├── web/                    # React 18 + Vite + Tailwind frontend
│   │   ├── src/
│   │   │   ├── components/     # Reusable components (Navbar, Footer, ProductCard, etc.)
│   │   │   ├── context/        # Auth & Socket providers
│   │   │   ├── i18n/           # Multi-language translations (EN, MR, HI, ES)
│   │   │   ├── pages/          # 40 Complete Pages (Public, User, Admin)
│   │   │   ├── services/       # Axios API client
│   │   │   └── types/          # TypeScript interfaces
│   └── api/                    # Express + Socket.IO backend
│       ├── prisma/             # Prisma schema & SQLite/Postgres configuration
│       ├── src/
│       │   ├── modules/        # Modular domain controllers & routes
│       │   ├── sockets/        # Real-time WebSocket handlers
│       │   └── server.ts       # Main server entry point
├── docs/                       # Architecture & REST API Documentation
└── package.json                # Monorepo workspaces configuration
```

---

## 📜 License
Developed for academic major project presentation and rural agrarian empowerment. MIT License.
