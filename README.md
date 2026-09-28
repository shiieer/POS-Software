# AFFO POS

Point-of-sale system for cafes and restaurants. Includes:
- **FastAPI** backend for auth, menu, tables, orders, and sales reports.
- **Expo (React Native)** staff app for managing orders, tables, and POS operations.
- **React + Vite + Tailwind CSS** customer self-ordering web app accessible via table QR codes.

---

## Project Structure

```
pos_affo/
├── .gitignore
├── README.md
├── backend/                  # FastAPI REST API
│   ├── app/                  # Application code (routers, models, schemas, services)
│   ├── tests/                # Pytest suite
│   ├── requirements.txt      # Runtime Python dependencies
│   ├── requirements-test.txt # Test dependencies
│   ├── run.py                # Entrypoint (binds to 0.0.0.0:8000)
│   └── .env.example          # Environment template
├── app/                      # Expo mobile app (Staff POS)
│   ├── src/                  # Screens, components, services
│   ├── package.json
│   └── .env.example
└── web/                      # Customer ordering web app (Mobile web)
    ├── src/
    │   ├── api/              # API client (dynamic host detection)
    │   ├── components/       # UI components (Header, MenuList, CartBar, Modals)
    │   ├── hooks/            # useCart, useMenu, useTable, useLocalStorage
    │   └── types/            # TypeScript interfaces
    ├── package.json
    ├── vite.config.ts        # Vite + Tailwind v4 with network exposure
    └── index.html
```

---

## Features

### Backend (FastAPI)
- JWT authentication (admin & staff roles)
- Menu CRUD with image upload (Supabase Storage)
- Table management with QR code generation
- Public QR table token verification (`GET /tables/verify`)
- Customer order creation & staff order lifecycle (`pending` → `preparing` → `ready` → `served`)
- Sales reports with date filters
- Interactive API documentation at `/docs`

### Customer Web App (`web/`)
- Mobile-first, lightweight React + Vite + Tailwind CSS v4 stack
- Table detection via QR code parameters (`?table=:id&token=:token`)
- QR verification against backend before showing menu
- Dynamic category navigation & instant filtering
- Item counter on menu cards (increase / decrease directly)
- Persistent cart state across refreshes (scoped per table via `localStorage`)
- Order confirmation modal with optional customer name & special notes
- Automatic LAN IP detection for seamless mobile phone testing

### Staff Mobile App (`app/`)
- Staff login with secure token storage
- Order management board with status filters
- POS checkout & cash/QRIS payment marking
- Menu and sales reporting views

---

## Prerequisites

| Tool | Version |
|------|---------|
| Python | 3.11+ |
| Node.js | 18+ (v22 recommended) |
| npm | 9+ |
| Supabase Account | For menu images & QR code storage |
| Expo Go | For running the staff mobile app |

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
```

**Activate environment:**
- Windows (PowerShell): `venv\Scripts\Activate.ps1`
- macOS / Linux: `source venv/bin/activate`

**Install dependencies:**
```bash
pip install -r requirements.txt
```

**Configure `.env`:**
```bash
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

Update your `backend/.env`:
```env
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///./data/pos.db
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-admin-password
CUSTOMER_WEB_URL=http://YOUR_LOCAL_IP:5173

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_MENU_BUCKET=menu_images
SUPABASE_QR_BUCKET=qr_codes
```

**Run the backend:**
```bash
python run.py
```
*Listens on `http://0.0.0.0:8000` (Swagger UI at `http://localhost:8000/docs`).*

---

### 2. Customer Web App Setup (`web/`)

```bash
cd web
npm install
npm run dev
```

Vite will run with network exposure:
```
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://YOUR_LOCAL_IP:5173/
```

**Testing QR Ordering on Phone:**
1. Connect your phone to the same Wi-Fi network as your computer.
2. Open the URL or scan the table QR code:
   ```
   http://YOUR_LOCAL_IP:5173/?table=1&token=TABLE_QR_TOKEN
   ```

---

### 3. Staff Mobile App Setup (`app/`)

```bash
cd app
npm install
npm start
```

Press `a` for Android, `i` for iOS simulator, or scan the QR code with Expo Go.

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login, returns JWT |
| GET | `/auth/me` | User | Current user profile |
| GET | `/menu` | Public | List available menu items |
| POST | `/menu` | Admin | Create menu item |
| POST | `/menu/{id}/image` | Admin | Upload menu image |
| DELETE | `/menu/{id}/image` | Admin | Remove menu image |
| GET | `/tables/verify` | Public | Verify table ID and QR token |
| GET | `/tables` | Admin | List all tables |
| POST | `/tables` | Admin | Create table & generate QR |
| GET | `/tables/{id}/qr` | Admin | Redirect to table QR image |
| POST | `/order` | Public | Submit customer order |
| GET | `/order` | Staff | List active orders |
| PATCH | `/order/{id}/status` | Staff | Update order status |
| PATCH | `/order/{id}/payment` | Staff | Mark order paid |
| GET | `/reports/sales` | Admin | Sales report summary |

---

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| **Backend** | FastAPI, SQLAlchemy, SQLite, Pydantic, Uvicorn |
| **Customer Web** | React 19, Vite, Tailwind CSS v4, React Router |
| **Staff Mobile** | React Native, Expo, NativeWind, Axios |
| **Cloud Storage** | Supabase Storage (images & QR codes) |
| **Testing** | pytest, httpx, pytest-cov |
