# TwinWallet 

> **Manage Together. Save Together.**

TwinWallet is a private, high-performance financial management mobile application custom-engineered for exactly **TWO** partner users (e.g., Gopi and Ananya).

---

## Key Features

- **Strict 2-User Enforcement**: No multi-wallet clutter, family plans, ads, or paywalls. Built exclusively for two partners.
- **Dynamic Partner Naming**: User identity is dynamically rendered using real stored names (e.g., *"Gopi's Income"*, *"Ananya's Expenses"*), strictly avoiding hardcoded terms like "Boy", "Girl", "User1", "User2".
- **Single Source of Truth (SSOT)**: Income and Expense transactions are the sole source of truth. No static or pre-calculated total values are stored in the database.
- **Automatic Monthly Ledger Roll-Forward**: Previous month's closing balance ($\text{Opening} + \text{Income} - \text{Expenses}$) automatically rolls forward as the next month's opening balance. Historical months become read-only.
- **Financial Calculation Engine**:
  $$\text{Closing Balance} = \text{Opening Balance} + \text{Total Income} - \text{Total Expenses}$$
  $$\text{Savings Rate (\%)} = \left(\frac{\text{Savings}}{\text{Total Income}}\right) \times 100$$
  $$\text{Average Daily Expense} = \frac{\text{Total Monthly Expenses}}{\text{Days Elapsed}}$$
- **PDF & CSV Exporting**: Generate official PDF monthly summary statements and raw CSV transaction ledgers.
- **Material Design 3 & Dark Mode**: Sleek, minimalist dark mode UI with interactive cards and contribution progress indicators.

---

## Tech Stack

### Frontend
- **Framework**: React Native with Expo (TypeScript)
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation (Native Stack + Bottom Tabs)
- **HTTP Client**: Axios with JWT Interceptors
- **Theme**: Material Design 3 (Dark & Light theme support)

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM & Database**: SQLAlchemy 2.0 (Asyncio) + Alembic
- **Database Engine**: PostgreSQL (Neon Database)
- **Authentication**: JWT Auth (Access & Refresh tokens) + direct `bcrypt` hashing

---

## Project Structure

```
Twin Wallet/
├── backend/
│   ├── app/
│   │   ├── api/          # REST API endpoints (auth, income, expense, ledger, analytics, reports)
│   │   ├── core/         # Security, database connection, configuration settings
│   │   ├── models/       # SQLAlchemy async database models
│   │   ├── schemas/      # Pydantic v2 schemas
│   │   ├── services/     # Financial calculation engine & PDF report generator
│   │   └── main.py       # FastAPI application entry point
│   ├── alembic/          # Async database migrations
│   ├── tests/            # Pytest unit and integration test suite
│   ├── Dockerfile        # Container configuration for Render deployment
│   └── requirements.txt  # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios API callers
│   │   ├── components/   # BalanceCard, PartnerComparisonCard, TransactionItem
│   │   ├── navigation/   # Auth & Main tab navigation stacks
│   │   ├── screens/      # Dashboard, AddTransaction, Analytics, Transactions, Profile
│   │   ├── store/        # Redux Toolkit auth, wallet, and theme slices
│   │   └── theme/        # Dark/Light mode color tokens
│   ├── App.tsx           # Mobile root component
│   └── package.json      # Expo dependencies
└── README.md
```

---

## Quick Start Guide

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
python -m pytest -v
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Swagger API documentation will be available at `http://localhost:8000/docs`.

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
```
Use Expo Go app on your Android device or run an Android emulator (`npx expo start --android`).

---

## Deployment Guide

### Backend (Render)
1. Push repository to GitHub.
2. Create a new **Web Service** on [Render](https://render.com).
3. Connect your GitHub repository and select `Dockerfile` build.
4. Set environment variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string (`postgresql+asyncpg://...`).
   - `JWT_SECRET_KEY`: Long random secret key.

### Database Hosting (Neon PostgreSQL)
1. Create a PostgreSQL project on [Neon.tech](https://neon.tech).
2. Copy the connection string into Render's `DATABASE_URL` setting.
