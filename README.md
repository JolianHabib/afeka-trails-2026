# 🏔️ מסלול טיולים אפקה 2026

**פרויקט סיום — פיתוח WEB, אפקה**  
פלטפורמה לתכנון מסלולי טיול חכמה עם AI, מפות אינטראקטיביות ותחזית מזג אויר.

---

## 🏗️ ארכיטקטורה

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                      │
│               Next.js 14 — Port 3000                     │
│   • Middleware (JWT verification on every route)          │
│   • Page: / (Home), /plan, /history                      │
│   • Auth: /auth/login, /auth/register                    │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│  Express Auth Server  │   │   External APIs             │
│     Port 5000         │   │  • OpenRouter (LLM)         │
│  • POST /auth/register│   │  • OpenWeatherMap           │
│  • POST /auth/login   │   │  • OpenStreetMap (Leaflet)  │
│  • POST /token/refresh│   └─────────────────────────────┘
│  • POST /token/verify │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    MongoDB Atlas      │
│  Collections:         │
│  • users (bcrypt+salt)│
│  • trails             │
└──────────────────────┘
```

---

## 🚀 התקנה והרצה

### דרישות מוקדמות
- Node.js v18+
- MongoDB (local או Atlas)
- מפתח API: OpenRouter, OpenWeatherMap

### 1. שרת Express (Auth)

```bash
cd express-server
npm install
cp .env.example .env
# ערוך את .env עם הערכים שלך
npm run dev
```

### 2. אפליקציית Next.js

```bash
cd nextjs-app
npm install
cp .env.local.example .env.local
# ערוך את .env.local עם הערכים שלך
npm run dev
```

### 3. פתח את הדפדפן
```
http://localhost:3000
```

---

## 🔑 משתני סביבה

### express-server/.env
| מפתח | תיאור |
|------|--------|
| `MONGODB_URI` | כתובת MongoDB |
| `JWT_SECRET` | מפתח סודי לאסימון גישה |
| `JWT_REFRESH_SECRET` | מפתח סודי לאסימון רענון |
| `CLIENT_URL` | כתובת לקוח Next.js |

### nextjs-app/.env.local
| מפתח | תיאור |
|------|--------|
| `NEXT_PUBLIC_AUTH_SERVER` | כתובת שרת Express |
| `JWT_SECRET` | חייב להיות זהה לשרת Express |
| `OPENROUTER_API_KEY` | מפתח OpenRouter לגישה ל-LLM |
| `OPENWEATHER_API_KEY` | מפתח OpenWeatherMap |
| `MONGODB_URI` | אותה DB כמו Express |

---

## 📡 API Endpoints

### Express Server
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/auth/register` | רישום משתמש |
| POST | `/api/auth/login` | התחברות |
| POST | `/api/token/refresh` | רענון אסימון שקט |
| POST | `/api/token/verify` | אימות אסימון |

### Next.js API Routes
| Method | Path | תיאור |
|--------|------|--------|
| POST | `/api/auth/set-cookies` | שמירת cookies |
| POST | `/api/auth/logout` | ניקוי cookies |
| POST | `/api/token/refresh` | רענון פנימי |
| POST | `/api/trails/generate` | יצירת מסלול עם LLM |
| GET/POST | `/api/trails/save` | שמירה / שליפת מסלולים |
| GET | `/api/trails/[id]` | מסלול + תחזית מזג אויר |

---

## 🔐 אבטחה

- **סיסמאות** — מוצפנות עם bcrypt (12 rounds salt)
- **JWT** — אסימון גישה ל-1 יום, אסימון רענון ל-30 יום
- **Silent Refresh** — מתחדש אוטומטית ב-background אחת ליום ללא מידיעת המשתמש
- **Middleware** — כל דף מוגן, כולל API routes

---

## 🛠️ טכנולוגיות

| שכבה | טכנולוגיה |
|------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS |
| Backend | Express.js |
| Auth | JWT, bcryptjs |
| מסד נתונים | MongoDB + Mongoose |
| מפות | Leaflet.js, react-leaflet |
| AI | OpenRouter (GPT-4o-mini) |
| מזג אויר | OpenWeatherMap API |

---

## ☁️ פריסה בענן

המשתמשים יכולים לפרוס את הפרויקט על:
- **Express**: Railway, Render, Heroku
- **Next.js**: Vercel (מומלץ)
- **DB**: MongoDB Atlas

---

*נבנה עם ❤️ לפרויקט סיום אפקה 2026*
