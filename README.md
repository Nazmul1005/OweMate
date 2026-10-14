<div align="center">

# 💸 OweMate

**Personal finance tracker + peer-to-peer lending manager**

[![React Native](https://img.shields.io/badge/React_Native-0.85-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-56-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

> Track what you spend. Know who owes you. Never lose track of shared money again.

</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Real-time balance overview with net worth calculation |
| 🤝 **P2P Lending** | Track money lent to and borrowed from friends |
| 📒 **Ledger** | Full transaction history with search & filtering |
| 📈 **Analytics** | Visual breakdowns of your spending & lending patterns |
| 🔄 **Pull-to-Refresh** | Instant data sync with a swipe gesture |
| 🌑 **Dark Mode** | Beautiful dark UI built for readability |

---

## 🏗️ Architecture

```
OweMate/
├── backend/              # REST API
│   ├── src/
│   │   ├── server.js     # Express app entry point
│   │   ├── routes/       # API route handlers
│   │   │   ├── transactions.js
│   │   │   ├── dashboard.js
│   │   │   └── friends.js
│   │   └── seed.js       # Sample data seeder
│   └── prisma/
│       └── schema.prisma # Database schema
│
└── mobile/               # React Native app
    ├── app/
    │   ├── (tabs)/       # Tab-based navigation
    │   │   ├── index.tsx     # 📊 Dashboard screen
    │   │   ├── ledger.tsx    # 📒 Transaction ledger
    │   │   ├── analytics.tsx # 📈 Analytics screen
    │   │   └── settings.tsx  # ⚙️  Settings screen
    │   └── friend/       # Friend transaction history
    ├── components/       # Reusable UI components
    └── constants/        # API config & constants
```

---

## 🛠️ Tech Stack

### Backend
- **[Node.js](https://nodejs.org)** + **[Express](https://expressjs.com)** — REST API server
- **[Prisma ORM](https://www.prisma.io)** — Type-safe database client
- **[PostgreSQL](https://www.postgresql.org)** — Relational database
- **[Docker](https://www.docker.com)** — Containerised database (optional)

### Mobile
- **[React Native](https://reactnative.dev)** + **[Expo](https://expo.dev)** — Cross-platform mobile app
- **[Expo Router](https://expo.github.io/router)** — File-based navigation
- **[NativeWind](https://www.nativewind.dev)** — Tailwind CSS for React Native
- **[Axios](https://axios-http.com)** — HTTP client
- **[React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)** — Smooth animations

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [PostgreSQL](https://www.postgresql.org) running locally (or via Docker)
- [Expo Go](https://expo.dev/client) app on your phone

---

### 1. Clone the Repository

```bash
git clone https://github.com/Nazmul1005/OweMate.git
cd OweMate
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Open .env and update DATABASE_URL to your PostgreSQL instance
```

**`.env` example:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/owemate"
PORT=3000
CORS_ORIGIN=*
```

> **Using Docker?** Spin up PostgreSQL instantly:
> ```bash
> docker compose up -d
> ```

```bash
# Run database migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npm run db:seed

# Start the development server
npm run dev
# → API running at http://localhost:3000
```

---

### 3. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

> **📱 Physical Android device?**
> Update `API_BASE_URL` in `mobile/constants/api.ts` to your machine's LAN IP:
> ```ts
> const API_BASE_URL = 'http://192.168.1.x:3000'; // replace with your IP
> ```

---

## 📡 API Reference

Base URL: `http://localhost:3000`

### Health Check

```
GET /health
```
```json
{ "status": "ok", "timestamp": "2026-10-14T17:53:01.000Z" }
```

---

### Dashboard

```
GET /api/dashboard
```

Returns the user's financial summary.

```json
{
  "data": {
    "personalBalance": 250.00,
    "totalOwedToMe": 150.00,
    "totalIOwe": 75.00,
    "netWorth": 325.00,
    "recentTransactions": []
  }
}
```

---

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/transactions` | List all transactions |
| `POST` | `/api/transactions` | Create a new transaction |

**POST `/api/transactions` — Request body:**
```json
{
  "amount": 50.00,
  "transaction_type": "LENT_TO_FRIEND",
  "friend_name": "Alice",
  "description": "Lunch split"
}
```

**Transaction types:**

| Type | Description |
|------|-------------|
| `PERSONAL_EXPENSE` | Money you spent personally |
| `PERSONAL_INCOME` | Money you received personally |
| `LENT_TO_FRIEND` | Money you lent to a friend |
| `BORROWED_FROM_FRIEND` | Money you borrowed from a friend |

---

### Friends

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/friends` | All friends with net balances |
| `GET` | `/api/friends/:name/transactions` | Transaction history with a specific friend |

---

## 🗃️ Database Schema

```prisma
model Transaction {
  id               String          @id @default(cuid())
  amount           Float
  transaction_type TransactionType
  friend_name      String?
  description      String
  date             DateTime        @default(now())
  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt
}

enum TransactionType {
  PERSONAL_EXPENSE
  PERSONAL_INCOME
  LENT_TO_FRIEND
  BORROWED_FROM_FRIEND
}
```

---

## 🧑‍💻 Development Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with hot-reload (nodemon) |
| `npm run start` | Start server in production mode |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |

### Mobile

| Command | Description |
|---------|-------------|
| `npx expo start` | Start Expo dev server (any platform) |
| `npm run android` | Start on Android emulator/device |
| `npm run ios` | Start on iOS simulator/device |
| `npm run web` | Start in web browser |

---

## 📂 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | — | PostgreSQL connection string **(required)** |
| `PORT` | `3000` | API server port |
| `CORS_ORIGIN` | `*` | Allowed CORS origins |

---
