# FARMSTOCK — System Architecture & Design Documentation

## 1. Executive Summary
**FARMSTOCK** is a production-grade peer-to-peer agricultural equipment sharing and trade ecosystem designed specifically for farmers, machinery owners, agricultural cooperatives, and rural communities across India.

The platform eliminates intermediaries and middlemen by enabling direct farmer-to-farmer transactions for both purchasing machinery (tractors, harvesters, rotavators, sprayers, water pumps, solar equipment) and renting implements on an hourly, daily, weekly, or seasonal basis in **Indian Rupees (₹)** with vernacular support for **English, Marathi, Hindi, and Spanish**.

---

## 2. Layered Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FARMSTOCK Web Client                     │
│  React 18 • Vite • Tailwind CSS • i18next • Lucide React    │
│  State: TanStack Query & React Context (Auth + WebSockets)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
               REST HTTP & WebSockets (ws://)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Express.js API Engine                    │
│      JWT Authentication • Zod Validation • Multer Upload    │
│      Socket.IO Real-time Events • Role Guards (RBAC)        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                    Prisma ORM (Data Layer)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  Relational Database (SQL)                  │
│   20+ Normalized Models • Unique Constraints • Cascade Del   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Core Modules & Subsystems

### 3.1 Dual-Transaction Engine
1. **Purchase Engine**:
   - Buyers submit price offers to machinery owners with custom messages and preferred contact modes.
   - Owners can `ACCEPT` or `REJECT` offers.
   - When accepted, status transitions to `COMPLETED` upon physical inspection and handover.
   - Duplicate requests and self-purchases are blocked at the database level.

2. **Rental Engine & Collision Detection**:
   - Date range selector validates `startDate < endDate`.
   - Before confirming any booking, server-side collision queries run against the database:
     $$\text{Conflict exists if: } (\text{Start}_{\text{req}} \le \text{End}_{\text{booked}}) \land (\text{End}_{\text{req}} \ge \text{Start}_{\text{booked}})$$
   - When an owner approves a booking, calendar dates are locked in `RentalAvailability` to prevent double-booking.

### 3.2 Real-Time Communication System
- Powered by Socket.IO with WebSocket fallback.
- Separate private rooms: `user:<userId>` for instantaneous deal notifications, and `conversation:<id>` for 1-to-1 farmer negotiations.
- Typing indicator broadcasts (`typing`, `stop_typing`).
- Inline equipment card embedded directly in the chat window so both parties never lose context of the machine being discussed.

### 3.3 Vernacular Agrarian Localization (i18n)
- Native support for 4 languages:
  1. English (`en`)
  2. Marathi (`mr` / मराठी)
  3. Hindi (`hi` / हिंदी)
  4. Spanish (`es` / Español)
- Instant language switcher in the navigation bar with state persisted in browser `localStorage`.
- All prices strictly formatted according to the Indian Numbering System (`₹1,50,000` / `₹8,90,000`).

---

## 4. Security & Governance Safeguards
- Passwords salted and hashed with `bcryptjs` (10 rounds).
- JWT tokens signed with SHA-256 and verified through middleware guards (`authenticateToken`, `requireAdmin`).
- Authorization checks ensure only product owners can edit/delete their own listings.
- User report submission system allowing farmers to flag suspicious or fraudulent machinery for administrative moderation.
