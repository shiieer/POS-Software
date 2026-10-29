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
├── package.json                    # Root — Husky + lint-staged + commitlint
├── commitlint.config.js            # Conventional commit rules
├── .husky/
│   ├── pre-commit                  # Runs lint-staged on staged files
│   └── commit-msg                  # Enforces conventional commit format
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
│   │   │   ├── new-order/          # POS checkout with payment method selection
│   │   │   ├── orders/             # Order board with status + payment filters
│   │   │   ├── tables/             # Table management & QR viewer
│   │   │   ├── menu/               # Menu CRUD
│   │   │   ├── reports/            # Sales reports
│   │   │   ├── staff/              # Staff management
│   │   │   ├── profile/            # Profile settings
│   │   │   └── more/               # More / settings hub
│   │   ├── shared/
│   │   │   ├── components/         # ScreenContainer, AppHeader, Toast, etc.
│   │   │   └── hooks/              # useMerchantName, useOrientationLayout, etc.
│   │   ├── navigation/             # BottomTabNav, SideRailNav
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
    │   │                           # CustomerNotificationCenter, OrderSuccess,
    │   │                           # OrderDetailModal, OrderStatusDrawer, etc.
    │   ├── hooks/                  # useCart, useMenu, useTable,
    │   │                           # useCustomerOrderNotifications,
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
- Automatic deletion of associated menu images from Supabase Storage upon menu deletion, with historic order integrity preservation
- Table management — create tables, generate QR codes, toggle active/inactive
- Smart LAN IP detection when building QR URLs so phones can scan without manual config
- QR token verification endpoint (`GET /tables/verify`)
- Customer order creation — public endpoint, no auth required
- Customer QRIS payment proof upload endpoint (`POST /order/{id}/payment-proof`) with image validation and Supabase Storage integration
- Staff order lifecycle: `pending` → `preparing` → `ready` → `served`
- Safeguards preventing cancellation of already paid orders
- Payment tracking independent of kitchen status — cash or QRIS, paid or unpaid
- QRIS payment confirmation workflow
- Staff management (admin only)
- Sales reports with date range filters
- Merchant name + QRIS image settings
- Swagger UI at `/docs`

### Customer Web App (`web/`)
- Full device width, mobile-first layout
- QR scan flow — reads `?table=` and `?token=` from URL, verifies with backend before showing menu
- Category tabs with smooth horizontal scrolling
- Item quantity stepper directly on menu cards
- Cart persisted in `localStorage` per table — survives page refresh
- Checkout modal with optional customer name, order notes, and payment method (Cash / QRIS)
- QRIS payment proof upload directly from gallery or camera (`capture="environment"`), with fullscreen zoom modal and replace option
- Notification bell icon in header — always visible, lights up with a red badge on any order update
- Bell drawer slides up from the bottom, drag down to dismiss (no close button)
- Live order status per item in the notification drawer: pending → preparing ☕ → ready 🎉 → served
- Payment line adapts per method: QRIS shows confirmation state, cash shows when to pay
- `OrderDetailModal` shows kitchen status banner + payment banner, with QRIS payment proof upload/preview
- `OrderSuccess` screen icon and heading update in real time with kitchen status
- QRIS confirmation triggers browser OS notification (if permission granted)
- Automatic LAN IP substitution — `VITE_API_URL` localhost is replaced with the current hostname at runtime

### Staff Mobile App (`app/`)
- Custom animated splash screen on app launch
- Secure login with JWT
- Responsive layout — portrait uses bottom tabs, landscape switches to side rail
- Merchant name loaded dynamically from backend settings across Login screen, feature headers, and profile (no hardcoded store name)
- Tapping the active Menu tab while on add/edit screen returns to the menu list
- **New Order screen** — pick Cash or QRIS, and choose Paid Now or Pay Later before submitting
- **Order board** — status filter (All / New / Preparing / Ready / Served / Canceled) combined with payment filter (All / Unpaid / Paid)
- Real-time polling every 6 seconds, pull-to-refresh supported
- QRIS pending banner at top of order board for unconfirmed QRIS orders
- Visual badge on order card when customer has attached a QRIS payment proof
- Modal confirmation prompts for key actions (Start Preparing, Mark Paid, Cancel Order)
- Order detail card with QRIS payment proof image preview and tap-to-expand modal
- In-modal proof review when confirming QRIS payments
- Protection against cancelling orders that are already paid
- Table management — drag-to-dismiss settings sheet, simple slide animation for Active/Maintenance toggle
- **Profile screen** — avatar upload (picks from photo library, uploads to Supabase `avatars` bucket), stats bar showing Orders Today / Role / Tenure, and account details section (account ID, joined date, active status)
- Menu CRUD with image picker, category assignment, and delete confirmation with Supabase storage cleanup
- Sales reports
- Staff management (admin only)

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
CUSTOMER_WEB_URL=http://YOUR_LAN_IP:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_MENU_BUCKET=menu_images
SUPABASE_QR_BUCKET=qr_codes
SUPABASE_QRIS_BUCKET=qris
SUPABASE_PAYMENT_PROOF_BUCKET=payment-proofs
SUPABASE_AVATARS_BUCKET=avatars
```


```bash
python run.py
# API available at http://0.0.0.0:8000
# Swagger UI at  http://localhost:8000/docs
```

---

### 2. Customer Web App (`web/`)

```bash
cd web
npm install
copy .env.example .env   # or: cp .env.example .env on macOS/Linux
npm run dev
```

`web/.env` reference:

```env
VITE_API_URL=http://YOUR_LAN_IP:8000
```

> Must use `VITE_` prefix — Vite only exposes variables with that prefix to the browser. The app replaces `localhost` with `window.location.hostname` at runtime for LAN access.

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
copy .env.example .env   # set EXPO_PUBLIC_API_URL=http://YOUR_LAN_IP:8000
npm start
```

Press `a` for Android emulator, `i` for iOS simulator, or scan the Expo QR with Expo Go on your phone.

---

## Testing QR Ordering End-to-End

1. Find your machine's LAN IP — e.g. `10.10.10.232` on Windows: `ipconfig`, macOS/Linux: `ifconfig`
2. Set `CUSTOMER_WEB_URL=http://YOUR_LAN_IP:5173` in `backend/.env`
3. Set `VITE_API_URL=http://YOUR_LAN_IP:8000` in `web/.env`
4. Start the backend (`python run.py`) and web app (`npm run dev` in `web/`)
5. Open the staff app, go to **Table Management**, and create a table
6. Tap a table card → **View QR** to see the QR code
7. Scan the QR with your phone — it opens `http://YOUR_LAN_IP:5173/?table=X&token=...`
8. Browse the menu, add items, choose Cash or QRIS, and place an order
9. Back in the staff app the order appears on the **Orders** board
10. Use the payment filter (Unpaid) to quickly find orders needing payment confirmation
11. As kitchen status updates, the customer's bell badge lights up automatically

---

## Order Flow

### Cash
1. Customer selects Cash at checkout → order created with `payment_method=cash`, `is_paid=false`
2. Staff sees amber **CASH · BAYAR KASIR** badge on the order card
3. Kitchen progresses: New → Preparing → Ready → Served (independent of payment)
4. Customer web shows kitchen status live (☕ preparing, 🎉 ready)
5. Staff taps **Terima Kasir (Cash)** in order detail → `is_paid=true`
6. Customer web payment status updates to **Lunas**

### QRIS
1. Customer scans QRIS inside checkout modal, taps **Saya Sudah Bayar** → order created with `payment_method=qris`, `is_paid=false`
2. Customer uploads payment transaction proof screenshot from camera or gallery directly on the success screen or order detail
3. Staff sees red **QRIS · PERLU KONFIRMASI** badge and **Bukti QRIS Terlampir** badge on the order card
4. Staff taps the order to review the customer's payment proof screenshot (tap to zoom/fullscreen) and checks bank/GoBiz incoming notification
5. Staff taps **Konfirmasi QRIS** (confirmation modal displays payment proof summary) → `is_paid=true`
6. Once marked as paid, the order cannot be accidentally cancelled
7. Customer web polls every 3 s and detects the change → green confirmation banner + OS notification (if permitted)

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | Public | Login, returns JWT |
| `GET` | `/auth/me` | User | Current user info |
| `POST` | `/auth/me/avatar` | User | Upload profile avatar image |
| `GET` | `/auth/staff` | Public | List all active staff accounts |
| `GET` | `/menu` | Public | List available menu items |
| `POST` | `/menu` | Admin | Create menu item |
| `PATCH` | `/menu/{id}` | Admin | Update menu item |
| `DELETE` | `/menu/{id}` | Admin | Delete menu item (auto-cleans Supabase storage) |
| `POST` | `/menu/{id}/image` | Admin | Upload item image |
| `DELETE` | `/menu/{id}/image` | Admin | Remove item image |
| `GET` | `/tables/verify` | Public | Verify table QR token |
| `GET` | `/tables` | Admin | List all tables |
| `POST` | `/tables` | Admin | Create table & generate QR |
| `PATCH` | `/tables/{id}/active` | Admin | Toggle table active state |
| `DELETE` | `/tables/{id}` | Admin | Delete table |
| `GET` | `/tables/{id}/qr` | Admin | Get table QR image (PNG) |
| `POST` | `/order` | Public | Submit customer order |
| `POST` | `/order/{id}/payment-proof` | Public | Upload customer QRIS payment proof image |
| `GET` | `/order` | Staff | List orders (status + active_only filters) |
| `GET` | `/order/public/{id}` | Public | Get order status (customer polling) |
| `GET` | `/order/{id}` | Staff | Get single order detail |
| `PATCH` | `/order/{id}/status` | Staff | Update kitchen status (prevents cancelling paid orders) |
| `PATCH` | `/order/{id}/payment` | Staff | Confirm payment |
| `GET` | `/reports/sales` | Admin | Sales report with date filters |
| `GET` | `/staff` | Admin | List staff |
| `POST` | `/staff` | Admin | Create staff account |
| `DELETE` | `/staff/{id}` | Admin | Remove staff |
| `GET` | `/settings/qris` | Public | Get QRIS image + merchant name |
| `PUT` | `/settings/qris` | Admin | Update QRIS settings |
| `PUT` | `/settings/merchant-name` | Admin | Update merchant name |

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

## Git Hooks

This repo uses [Husky](https://typicode.github.io/husky) with [commitlint](https://commitlint.js.org) and [lint-staged](https://github.com/lint-staged/lint-staged). Hooks are installed automatically when you run `npm install` at the repo root.

### pre-commit

Runs `lint-staged` — only processes files you've staged:

| Staged files | Action |
|---|---|
| `web/src/**/*.{ts,tsx}` | `oxlint --fix` |
| `backend/**/*.py` | `ruff check --fix` |

### commit-msg

Enforces [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<optional scope>): <subject>
```

Valid types:

| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code change that isn't a fix or feature |
| `perf` | Performance improvement |
| `test` | Adding or fixing tests |
| `chore` | Build process, dependencies, tooling |
| `revert` | Revert a previous commit |
| `ci` | CI/CD config changes |

**Valid examples:**
```
feat: add payment filter to orders board
fix: remove duplicate Ionicons import in CartPanel
chore: set up husky and commitlint
docs: update README with order flow section
feat(tables): add drag-to-dismiss settings sheet
```

**Blocked examples:**
```
update stuff          ✗  no type
Fix: something        ✗  uppercase type
feat:no space         ✗  missing space after colon
```

### Setup (first time)

```bash
# At the repo root — installs husky hooks automatically
npm install
```

If hooks don't trigger, re-run:
```bash
npx husky
```

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

