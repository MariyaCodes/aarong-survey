# Aarong Employee Product Survey

A full-stack MERN web application for Aarong employees to complete product feedback surveys on **Aarong Earth** and **Aarong Dairy** products. Styled after the [Aarong brand](https://www.aarong.com/bgd/landing-page).

## Features

- **Employee login** — Employee ID + PIN
- **Host portal** — Edit pre-loaded survey questions and export data
- **Shared questions by product line** — e.g. Aloe Vera and Tulsi Face Wash share the same questions; each variant is surveyed separately
- **Tick/checkbox, yes/no, and rating questions**
- **40+ pre-seeded products** from Aarong Earth & Aarong Dairy catalogs
- **Google Sheets export** (optional) + CSV download
- **Free online hosting** — Vercel (frontend) + Render (backend) + MongoDB Atlas (database)

## Project Structure

```
aarong-survey/
├── backend/          # Node.js + Express + MongoDB API
├── frontend/         # React + Vite (HTML/CSS/JSX)
└── README.md
```

## Demo Credentials

| Role     | Login        | Password/PIN |
|----------|--------------|--------------|
| Employee | `EMP001`     | `1234`         |
| Host     | `host`       | `admin123`     |

## Local Setup

### 1. MongoDB Atlas (free)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and allow network access (`0.0.0.0/0` for development)
3. Copy your connection string

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGODB_URI and JWT_SECRET
npm run seed
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App runs at `http://localhost:5173`

## Deploy Online (Free — Accessible Anywhere)

### Step 1: Push to GitHub

```bash
cd aarong-survey
git init
git add .
git commit -m "Add Aarong employee survey app"
git remote add origin https://github.com/YOUR_USERNAME/aarong-survey.git
git push -u origin main
```

### Step 2: Deploy Backend on Render (free)

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build: `npm install` · Start: `npm start`
5. Add environment variables:
   - `MONGODB_URI` — your Atlas connection string
   - `JWT_SECRET` — a long random string
   - `FRONTEND_URL` — your Vercel URL (add after Step 3)
6. After deploy, run seed once via Render Shell: `npm run seed`
7. Copy your API URL, e.g. `https://aarong-survey-api.onrender.com`

### Step 3: Deploy Frontend on Vercel (free)

1. Go to [vercel.com](https://vercel.com) → **Import Project** from GitHub
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `VITE_API_URL` = `https://YOUR-RENDER-URL.onrender.com/api`
4. Deploy — your site will be live at `https://your-app.vercel.app`

### Step 4: Update CORS

In Render, set `FRONTEND_URL` to your Vercel URL and redeploy the backend.

---

**Alternative:** Railway, Fly.io, or Cyclic can host the backend instead of Render.

## Google Sheets Integration (Optional)

Survey responses auto-sync to Google Sheets when configured.

1. Create a Google Sheet and copy its ID from the URL
2. In [Google Cloud Console](https://console.cloud.google.com), create a service account
3. Enable **Google Sheets API**, download JSON key
4. Share the Sheet with the service account email (Editor)
5. Add to backend `.env`:

```
GOOGLE_SHEET_ID=your-sheet-id
GOOGLE_SERVICE_ACCOUNT_EMAIL=xxx@xxx.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Without this, use **Download CSV** from the host dashboard and import into Google Sheets manually.

## How Shared Questions Work

Products belong to a **product line** (e.g. `earth-face-wash`):

| Product | Variant   | Product Line     |
|---------|-----------|------------------|
| Face Wash | Aloe Vera | earth-face-wash  |
| Face Wash | Tulsi     | earth-face-wash  |
| Face Wash | Neem      | earth-face-wash  |

All variants use the **same questions**. Employees must submit **each variant separately**, but the host only edits questions once per line.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/employee/login` | Employee login |
| POST | `/api/auth/host/login` | Host login |
| GET | `/api/survey/products` | List products (employee) |
| GET | `/api/survey/products/:id/survey` | Get questions for product |
| POST | `/api/survey/submit` | Submit survey answers |
| GET | `/api/host/dashboard` | Host stats |
| PUT | `/api/host/product-lines/:id/questions` | Edit questions |
| GET | `/api/host/export/csv` | Download CSV |
| POST | `/api/host/export/sheets` | Sync to Google Sheets |

## Tech Stack

- **Frontend:** React, Vite, React Router, CSS (Aarong-themed)
- **Backend:** Node.js, Express, JWT, bcrypt
- **Database:** MongoDB + Mongoose
- **Export:** Google Sheets API, CSV

## Product References

Products are based on the official [Aarong Earth](https://www.aarong.com/bgd/brands/aarong-earth) catalog and [Aarong Dairy](https://aarongdairy.com.bd/) range.

---

Built for CSE471 — A BRAC social enterprise product feedback system.
