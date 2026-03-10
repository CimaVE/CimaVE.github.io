# CIMA VE - Product Requirements Document

## Problem Statement
Build a full-stack investment platform for Venezuela called "CIMA VE". The platform targets young Venezuelan investors, providing access to the Bolsa de Valores de Caracas and global markets.

## User Personas
- **Young Venezuelan Investors** (18-35): First-time investors looking for accessible, mobile-first investment tools
- **Experienced Traders**: Users who want real-time data, AI insights, and portfolio management

## Core Requirements
- JWT + Google Social Login authentication
- Real-time market data (stocks + crypto)
- AI-powered investment analysis (GPT-5.2 via Emergent)
- Minimalist "Trade Republic" design (black #0A0A0A, white, burgundy #8B1538)
- Mobile-first with bottom navigation
- Venezuela-specific features (BCV rate, Pago Móvil, Bolívares)

## Tech Stack
- **Frontend:** React, Tailwind CSS, react-router-dom, framer-motion, lucide-react, shadcn/ui
- **Backend:** FastAPI, MongoDB (motor async driver), JWT auth
- **Integrations:** Alpha Vantage (stocks), Emergent LLM Key (AI), Open Exchange Rate API (BCV)

## Architecture
```
/app/
├── backend/
│   ├── server.py          # All API endpoints
│   ├── tests/
│   │   └── test_cima_api.py
│   └── .env
└── frontend/
    └── src/
        ├── App.js                    # Router with all routes
        ├── contexts/AuthContext.js    # Auth state management
        ├── components/
        │   ├── layout/BottomNav.js   # Shared mobile bottom nav
        │   ├── DashboardLayout.js    # Legacy sidebar (unused)
        │   ├── ProtectedRoute.js
        │   └── ui/                   # Shadcn components
        └── pages/
            ├── Landing.js, Login.js, Register.js, AuthCallback.js
            ├── Dashboard.js, Profile.js
            ├── Collections.js, Academy.js, Alerts.js, Goals.js
            ├── Reports.js, Referrals.js
            ├── Deposit.js, Withdraw.js
            ├── Security.js, KYC.js
            └── (future pages)
```

## API Endpoints
- `/api/auth/register` (POST), `/api/auth/login` (POST), `/api/auth/session` (GET), `/api/auth/me` (GET)
- `/api/portfolio` (GET), `/api/portfolio/holdings` (POST/DELETE)
- `/api/market/stocks` (GET), `/api/market/stocks/:symbol` (GET)
- `/api/market/crypto` (GET), `/api/market/crypto/:coin_id` (GET)
- `/api/insights/generate` (POST), `/api/insights/history` (GET)
- `/api/collections` (GET), `/api/collections/:id` (GET)
- `/api/goals` (GET/POST/PUT/DELETE)
- `/api/alerts` (GET/POST/DELETE)
- `/api/academy/courses` (GET), `/api/academy/progress` (GET/POST)
- `/api/reports/monthly` (GET)
- `/api/referrals` (GET), `/api/referrals/apply` (POST)

## DB Schema
- **users:** {user_id, email, name, password_hash, google_id, picture, cima_score, level}
- **portfolios:** {portfolio_id, user_id, name, holdings[], total_value, total_invested}
- **goals:** {goal_id, user_id, title, target_amount, current_amount, deadline, category}
- **alerts:** {alert_id, user_id, symbol, alert_type, threshold, is_active}
- **insights:** {insight_id, user_id, content, created_at}

## What's Been Implemented (as of March 10, 2026)
- Full authentication (JWT + Google OAuth)
- Dashboard with portfolio value, BCV rate, AI insights, trade panel
- Bottom navigation across all pages (Inicio, Mercado, Trade, Aprende, Perfil)
- Profile page with wallet, settings links
- Deposit (Pago Móvil) and Withdraw pages
- Security page (2FA, password change, sessions)
- KYC verification page (3-step process)
- Collections/Market page with investment themes
- Academy with courses and progress tracking
- Goals (Modo Objetivo) with fund tracking
- Alerts with price notifications
- Reports with monthly stats
- Referral system
- Landing page with TradingView chart embed

## Known Mocked Features
- Crypto market data (simulated in backend CRYPTO_DATA)
- Stock data (local cache with Alpha Vantage fallback)

## Upcoming Tasks (P0-P2)
- **P0:** Integrate live TradingView chart in dashboard/market page
- **P1:** Real BCV rate from official source (currently using open.er-api.com)
- **P1:** Connect real crypto data via CoinGecko API
- **P2:** Build detailed History/Transactions page
- **P2:** Improve Notifications page

## Future/Backlog
- Full "Modo Objetivo" investment goals feature
- "Academia" section with actual course content
- Real trading execution integration
- Push notifications with service workers
