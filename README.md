# AFFO POS

A full-stack point-of-sale system for cafes and restaurants, built across three separate apps that work together:

- **FastAPI** backend — auth, menu, tables, orders, staff management, and sales reports
- **Expo (React Native)** staff POS app — order board, table management, menu CRUD, and more
- **React + Vite** customer web app — mobile self-ordering via table QR codes

---

## Project Structure

```
pos_software/
├── README.md
├── .gitignore
│
├── backend/                        # FastAPI REST API
│   ├── app/
│   │   ├── core/                   # QR generation, storage, security
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   ├── routers/                # auth, menu, tables, orders, reports, staff, settings
│   │   ├── schemas/                # Pydantic request/response models
│   │   ├── services/               # Business logic layer
│   │   ├── config.py               # Settings (loaded from .env)
│   │   ├── database.py             # DB session setup
│   │   ├── dependencies.py         # FastAPI dependency injection
│   │   └── main.py                 # App factory, CORS, router registration
│   ├── tests/                      # pytest suite
│   ├── requirements.txt
│   ├── requirements-test.txt
│   ├── run.py                      # Entrypoint (0.0.0.0:8000)
│   └── .env.example
│
├── app/                            # Expo staff POS app (React Native)
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/               # Login screen & token management
│   │   │   ├── new-order/          # POS checkout flow
│   │   │   ├── orders/             # Order management board
│   │   │   ├── tables/             # Table management & QR viewer
│   │   │   ├── menu/               # Menu CRUD
│   │   │   ├── reports/            # Sales reports
│   │   │   ├── staff/              # Staff management
│   │   │   ├── profile/            # Profile settings
│   │   │   └── more/               # More / settings hub
│   │   ├── shared/                 # Shared UI components & hooks
│   │   ├── services/               # API service layer
│   │   ├── types/                  # TypeScript types
│   │   └── constants/              # App-wide constants
│   ├── package.json
│   └── .env.example
│
└── web/                            # Customer self-ordering web app
    ├── src/
    │   ├── api/                    # API client (dynamic LAN host detection)
    │   ├── components/             # Header, MenuList, CartBar, CheckoutModal,
    │   │                           # OrderStatusDrawer, OrderSuccess, and more
    │   ├── hooks/                  # useCart, useMenu, useTable, useOrderStatus,
    │   │                           # useQrisSettings, useLocalStorage
    │   ├── types/                  # TypeScript interfaces
    │   └── utils/                  # formatCurrency
    ├── vite.config.ts              # Vite + Tailwind v4, host: true for LAN access
    └── .env.example
```

---

## Features

### Backend (FastAPI)
- JWT authentication with admin and staff role separation
- Full menu CRUD with image upload via Supabase Storage
- Table management — create tables, generate QR codes, toggle active/inactive
- QR token verification endpoint for customer web app (`GET /tables/verify`)
- Customer order creation (public, no auth)
- Staff order lifecycle: `pending` → `confirmed` → `processing` → `ready` → `completed`
- QRIS payment confirmation workflow
- Staff management (admin only)
- Sales reports with date range filters
- QRIS merchant settings (image + merchant name)
- Swagger UI at `/docs`

### Customer Web App (`web/`)
- Mobile-first UI with full device width layout
- QR code scanning flow — reads `?table=` and `?token=` from URL, verifies with backend
- Category tabs with smooth horizontal scrolling
- Item quantity stepper directly on menu cards
- Cart state persisted in `localStorage` per table
- Checkout modal with optional customer name, order notes, and payment method selection (Cash / QRIS)
- Live order status tracking — notification bell in header polls the backend every 4 seconds
- Bell badge lights up on status changes (pending → confirmed → processing → ready)
- Order status drawer — slide up from bell, drag down to dismiss
- QRIS payment confirmation banner when cashier confirms payment
- Automatic LAN IP detection so phones on the same Wi-Fi can reach the backend without manual config

### Staff Mobile App (`app/`)
- Secure login with JWT stored in device keychain
- New order POS screen with menu search and cart
- Order management board with status filters and real-time refresh
- Table management — add/remove tables, view & download QR codes, toggle active state
- Menu management — add/edit items with image picker and category assignment
- Sales reports with charts
- Staff management (admin only)
- Profile and store settings

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Python | 3.11 |
| Node.js | 18 (22 recommended) |
| npm | 9 |
| Expo Go | Latest (for staff app on device) |
| Supabase project | For image & QR storage |

---

## Quick Start

### 1. Backend

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
venv\Scripts\Activate.ps1        # Windows PowerShell
# source venv/bin/activate        # macOS / Linux

pip install -r requirements.txt

# Copy and fill in the environment file
copy .env.example .env
```

`backend/.env` reference:

```env
SECRET_KEY=your-long-random-secret
DATABASE_URL=sqlite:///./data/pos.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
CUSTOMER_WEB_URL=http://localhost:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_MENU_BUCKET=menu_images
SUPABASE_QR_BUCKET=qr_codes
SUPABASE_QRIS_BUCKET=qris
```

> `CUSTOMER_WEB_URL` is used to build QR code URLs. Leave it as `localhost:5173` for development — the backend automatically substitutes the real LAN IP when generating QR codes so phones can scan them.

```bash
python run.py
# API available at http://localhost:8000
# Swagger UI at  http://localhost:8000/docs
```

---

### 2. Customer Web App (`web/`)

```bash
cd web
npm install
cp .env.example .env   # or: copy .env.example .env on Windows
npm run dev
```

`web/.env` reference:

```env
VITE_API_URL=http://localhost:8000
```

> The app auto-replaces `localhost` with `window.location.hostname` at runtime, so phones on the same Wi-Fi automatically reach the backend.

Vite starts with network exposure:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://YOUR_LAN_IP:5173/
```

---

### 3. Staff Mobile App (`app/`)

```bash
cd app
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000
npm start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the Expo QR code with Expo Go on your phone.

---

## Testing QR Ordering End-to-End

1. Start both the backend and the web app.
2. Open the staff app (or Expo dev build) on your computer or phone.
3. Go to **Table Management** and create a table if none exist.
4. Tap a table card → **View QR** to open the QR image.
5. Scan the QR with your phone's camera — it opens the customer web app with the correct `?table=` and `?token=` params.
6. Browse the menu, add items, and place an order.
7. Back in the staff app, the order appears in the **Orders** board.
8. As the cashier updates the order status, the customer's notification bell badge updates automatically.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | Public | Login, returns JWT |
| `GET` | `/auth/me` | User | Current user info |
| `GET` | `/menu` | Public | List available menu items |
| `POST` | `/menu` | Admin | Create menu item |
| `PATCH` | `/menu/{id}` | Admin | Update menu item |
| `DELETE` | `/menu/{id}` | Admin | Delete menu item |
| `POST` | `/menu/{id}/image` | Admin | Upload item image |
| `DELETE` | `/menu/{id}/image` | Admin | Remove item image |
| `GET` | `/tables/verify` | Public | Verify table QR token |
| `GET` | `/tables` | Admin | List all tables |
| `POST` | `/tables` | Admin | Create table & generate QR |
| `PATCH` | `/tables/{id}/active` | Admin | Toggle table active state |
| `DELETE` | `/tables/{id}` | Admin | Delete table |
| `GET` | `/tables/{id}/qr` | Admin | Get table QR image (PNG) |
| `POST` | `/order` | Public | Submit customer order |
| `GET` | `/order` | Staff | List orders (with filters) |
| `GET` | `/order/public/{id}` | Public | Get order status (for polling) |
| `PATCH` | `/order/{id}/status` | Staff | Update order status |
| `PATCH` | `/order/{id}/payment` | Staff | Mark order as paid |
| `GET` | `/reports/sales` | Admin | Sales report with date filters |
| `GET` | `/staff` | Admin | List staff |
| `POST` | `/staff` | Admin | Create staff account |
| `DELETE` | `/staff/{id}` | Admin | Remove staff |
| `GET` | `/settings/qris` | Public | Get QRIS merchant settings |
| `PUT` | `/settings/qris` | Admin | Update QRIS settings |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | FastAPI, SQLAlchemy, SQLite / PostgreSQL, Pydantic v2, Uvicorn |
| **Customer Web** | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| **Staff Mobile** | React Native, Expo, NativeWind, Axios |
| **Storage** | Supabase Storage (menu images, QR codes, QRIS image) |
| **Testing** | pytest, httpx, pytest-cov |

---

## Environment Files

| File | Purpose |
|------|---------|
| `backend/.env` | Backend secrets and config — **never commit** |
| `backend/.env.example` | Template — safe to commit |
| `app/.env` | Expo API URL — **never commit** |
| `app/.env.example` | Template — safe to commit |
| `web/.env` | Vite API URL — **never commit** |
| `web/.env.example` | Template — safe to commit |

---

## Production Deployment

Set stable HTTPS URLs in each service's environment:

```env
# backend/.env
CUSTOMER_WEB_URL=https://order.yourdomain.com

# web/.env
VITE_API_URL=https://api.yourdomain.com

# app/.env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com
```

