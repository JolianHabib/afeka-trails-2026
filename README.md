# 🏔️ Afeka Trails 2026

**Final Project — Web Development, Afeka College**
An AI-powered trip-planning platform with interactive maps, weather forecast integration, and user authentication.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                    │
│                 Next.js 14 — Port 3000                  │
│   • Middleware: JWT verification on protected routes     │
│   • Pages: /, /plan, /history                           │
│   • Auth: /auth/login, /auth/register                   │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│  Express Auth Server │   │        External APIs         │
│      Port 5000       │   │  • OpenRouter LLM            │
│  • POST /auth/register│  │  • OpenWeatherMap            │
│  • POST /auth/login   │  │  • OpenStreetMap / Leaflet   │
│  • POST /token/refresh│  └─────────────────────────────┘
│  • POST /token/verify │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     MongoDB Atlas     │
│  Collections:         │
│  • users              │
│  • trails             │
└──────────────────────┘
```

---

## 🚀 Installation and Setup

### Prerequisites

* Node.js v18+
* MongoDB local instance or MongoDB Atlas
* API keys for:

  * OpenRouter
  * OpenWeatherMap

---

### 1. Run the Express Auth Server

```bash
cd express-server
npm install
cp .env.example .env
# Edit the .env file with your own values
npm run dev
```

---

### 2. Run the Next.js Application

```bash
cd nextjs-app
npm install
cp .env.local.example .env.local
# Edit the .env.local file with your own values
npm run dev
```

---

### 3. Open the Application

```text
http://localhost:3000
```

---

## 🔑 Environment Variables

### express-server/.env

| Key                  | Description                   |
| -------------------- | ----------------------------- |
| `MONGODB_URI`        | MongoDB connection string     |
| `JWT_SECRET`         | Secret key for access tokens  |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens |
| `CLIENT_URL`         | Next.js client URL            |

---

### nextjs-app/.env.local

| Key                       | Description                              |
| ------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_AUTH_SERVER` | Express authentication server URL        |
| `JWT_SECRET`              | Must match the Express server JWT secret |
| `OPENROUTER_API_KEY`      | OpenRouter API key for LLM access        |
| `OPENWEATHER_API_KEY`     | OpenWeatherMap API key                   |
| `MONGODB_URI`             | MongoDB connection string                |

---

## 📡 API Endpoints

### Express Server

| Method | Path                 | Description             |
| ------ | -------------------- | ----------------------- |
| POST   | `/api/auth/register` | Register a new user     |
| POST   | `/api/auth/login`    | Log in an existing user |
| POST   | `/api/token/refresh` | Refresh access token    |
| POST   | `/api/token/verify`  | Verify access token     |

---

### Next.js API Routes

| Method   | Path                    | Description                                 |
| -------- | ----------------------- | ------------------------------------------- |
| POST     | `/api/auth/set-cookies` | Store authentication cookies                |
| POST     | `/api/auth/logout`      | Clear authentication cookies                |
| POST     | `/api/token/refresh`    | Internal token refresh                      |
| POST     | `/api/trails/generate`  | Generate a trail using LLM                  |
| GET/POST | `/api/trails/save`      | Save or retrieve trails                     |
| GET      | `/api/trails/[id]`      | Retrieve trail details and weather forecast |

---

## 🔐 Security

* **Password hashing** using bcrypt with salt rounds
* **JWT authentication** with access and refresh tokens
* **Access token** valid for 1 day
* **Refresh token** valid for 30 days
* **Silent refresh** handled automatically in the background
* **Middleware protection** for protected pages and API routes

---

## 🛠️ Technologies

| Layer          | Technologies                       |
| -------------- | ---------------------------------- |
| Frontend       | Next.js 14, React 18, Tailwind CSS |
| Backend        | Express.js                         |
| Authentication | JWT, bcryptjs                      |
| Database       | MongoDB, Mongoose                  |
| Maps           | Leaflet.js, react-leaflet          |
| AI             | OpenRouter, GPT-4o-mini            |
| Weather        | OpenWeatherMap API                 |
| Deployment     | Vercel, Render, MongoDB Atlas      |

---

## ☁️ Deployment

The project can be deployed using:

* **Frontend:** Vercel
* **Backend:** Render, Railway, or Heroku
* **Database:** MongoDB Atlas

---

## 🌐 Live Demo

```text
https://afeka-trails-2026-three.vercel.app
```

---

## 📂 Repository

```text
https://github.com/JolianHabib/afeka-trails-2026
```

---

## 📌 Project Summary

Afeka Trails 2026 is a full-stack AI-based trip-planning platform that allows users to generate personalized trip routes, view them on interactive maps, check weather forecasts, and save route history after authentication.

Built as a final Web Development project at Afeka College.

---

Built with ❤️ as part of the Afeka 2026 final project.
