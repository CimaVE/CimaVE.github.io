# CIMA VE - Product Requirements Document

## Original Problem Statement
Crear un fullstack para CIMA VE - Plataforma integral de inversiones diseñada para el mercado venezolano que permite acceder tanto a la Bolsa de Valores de Caracas como a mercados internacionales (NASDAQ, NYSE) desde una única interfaz digital.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React 19 + Tailwind CSS + shadcn/ui + Framer Motion
- **Auth**: JWT + Google OAuth (Emergent Auth)
- **AI**: GPT-5.2 via Emergent Integrations
- **Market Data**: Alpha Vantage (stocks) + Simulated CoinGecko (crypto)

## User Personas
1. **El Profesional Urbano** (28-42 años): $500-$5,000 USD inicial, busca proteger patrimonio
2. **El Emprendedor Digital** (18-35 años): $100-$1,000 USD inicial, quiere aprender
3. **La Diáspora Conectado** (25-45 años): $1,000-$10,000 USD, conecta ahorros exterior con bolsa local

## Core Requirements (Static)
- Dashboard unificado de portafolio (nacional + internacional)
- Cima Collections (inversiones temáticas curadas)
- Modo Objetivo (metas de inversión con seguimiento)
- Cima Pulse (alertas de precio inteligentes)
- Academia integrada con cursos y certificaciones
- Cima Insights (análisis personalizado con IA)
- Sistema de referidos con bonos
- Reportes fiscales automáticos

## What's Been Implemented (March 2026)

### Backend APIs (/app/backend/server.py)
- ✅ Auth: Register, Login, Google OAuth, Session management
- ✅ Portfolio: CRUD de holdings, cálculo de totales
- ✅ Market Data: Stocks (Alpha Vantage + cache), Crypto (simulado)
- ✅ Collections: 6 colecciones temáticas curadas
- ✅ Goals: CRUD completo para Modo Objetivo
- ✅ Alerts: Sistema Cima Pulse
- ✅ Academy: Cursos y seguimiento de progreso
- ✅ Insights: Generación con GPT-5.2
- ✅ Reports: Reporte mensual
- ✅ Referrals: Sistema de códigos y bonos

### Frontend Pages (/app/frontend/src/pages/)
- ✅ Landing: Hero, features, collections preview, academia, CTA
- ✅ Login/Register: Email/password + Google OAuth
- ✅ Dashboard: Portfolio overview, market data, insights, goals, alerts
- ✅ Collections: Grid de colecciones temáticas con detalle
- ✅ Goals: Crear, ver, agregar fondos, eliminar
- ✅ Alerts: Crear alertas de precio, ver estado
- ✅ Academy: Ver cursos, progreso, completar lecciones
- ✅ Reports: Reporte mensual con métricas
- ✅ Referrals: Código, compartir, aplicar código

### Design
- ✅ Dark theme premium estilo Revolut/Fey
- ✅ Typography: Outfit (headings) + Manrope (body)
- ✅ Glass morphism cards
- ✅ Color palette: Electric Blue + Emerald + Cima Gold
- ✅ Responsive (mobile + desktop)

## Prioritized Backlog

### P0 (Critical for launch)
- [ ] Real CoinGecko API integration
- [ ] KYC biométrico integration (Truora/Veriff)
- [ ] Conexión real con Bolsa de Caracas
- [ ] Payment processing (Stripe/PayPal)

### P1 (High priority)
- [ ] Cima Futuro (cuentas para menores)
- [ ] Metas Compartidas
- [ ] Historial fiscal completo
- [ ] Push notifications
- [ ] WhatsApp/Telegram alertas

### P2 (Medium priority)
- [ ] Cima Business (tesorería empresarial)
- [ ] Alianzas universitarias
- [ ] Semana de Inversión event
- [ ] Mobile app (React Native)

## Next Tasks
1. Integrar CoinGecko API real (reemplazar datos simulados)
2. Implementar gráficos de precios históricos (recharts)
3. Agregar transacciones simuladas de compra/venta
4. Implementar Cima Score dinámico basado en actividad
5. Agregar notificaciones en tiempo real
