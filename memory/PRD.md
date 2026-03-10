# CIMA VE - Product Requirements Document

## Original Problem Statement
Crear un fullstack para CIMA VE - Plataforma integral de inversiones diseñada para el mercado venezolano que permite acceder tanto a la Bolsa de Valores de Caracas como a mercados internacionales (NASDAQ, NYSE) desde una única interfaz digital.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui + Framer Motion
- **Auth**: JWT + Google OAuth (Emergent Auth)
- **AI**: GPT-5.2 via Emergent Integrations
- **Market Data**: Alpha Vantage (stocks) + Simulated (crypto)

## Design System (Trade Republic Inspired)
- **Background**: #0A0A0A (pure black)
- **Surface**: #111111 (cards)
- **Border**: #1a1a1a
- **Text**: White with opacity variants
- **Accent**: #8B1538 (Burgundy/Wine Red)
- **Success**: #22C55E (green for positive values)
- **Error**: #EF4444 (red for negative values)
- **Font**: Inter (all weights)

## What's Been Implemented (March 2026)

### Backend APIs - 100% Working
- Auth: Register, Login, Google OAuth
- Portfolio: CRUD holdings
- Market Data: Stocks (Alpha Vantage) + Crypto (simulated)
- Collections: 6 themed investment bundles
- Goals: CRUD with progress tracking
- Alerts: Price alerts system
- Academy: Courses with progress
- Insights: AI-powered analysis with GPT-5.2
- Reports: Monthly summary
- Referrals: Code system with bonuses

### Frontend Pages
- Landing: Minimalist hero, product, markets, security sections
- Login/Register: Clean forms with Google OAuth
- Dashboard: Portfolio overview, market data, AI insights, goals, alerts
- Collections: Themed investment bundles grid
- Goals: Create/track financial goals
- Alerts: Price alert management + Push notifications
- Academy: Courses with progress tracking
- Reports: Monthly financial summary
- Referrals: Share code, apply code

### New Features Added
- **Push Notifications**: Browser notifications for price alerts
  - Request permission from dashboard
  - Auto-check alerts every 60 seconds
  - Notifications for triggered alerts, goal progress, goal completion

## Prioritized Backlog

### P0 (Critical)
- [ ] Real CoinGecko API integration
- [ ] KYC integration
- [ ] Payment processing

### P1 (High)
- [ ] Historical price charts
- [ ] Transaction simulator (buy/sell)
- [ ] Email notifications fallback
- [ ] Mobile app (React Native)

### P2 (Medium)
- [ ] Shared goals feature
- [ ] Social trading
- [ ] Advanced analytics

## Next Tasks
1. Integrate CoinGecko API for real crypto prices
2. Add price history charts with recharts
3. Implement buy/sell simulation flow
4. Add email notification service as fallback for push
