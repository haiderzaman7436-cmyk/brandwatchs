# Setup Guide

## Prerequisites
- Node.js + npm (or bun)
- A Firebase project
- A Gmail account with an App Password (for order emails)

---

## 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Firestore Database**
4. Go to Project Settings → Your Apps → Add Web App → copy the config
5. Paste your config into `src/lib/firebase.ts` (replace the placeholder values)

---

## 2. Admin Email

Set your admin email in two files:
- `src/contexts/AuthContext.tsx` — find `ADMIN_EMAIL`
- `src/pages/Login.tsx` — find `ADMIN_EMAIL`

---

## 3. Backend Email Setup

```bash
cd stripe-backend
cp .env.example .env
```

Edit `.env` and fill in:
- `EMAIL_USER` — your Gmail address
- `EMAIL_PASS` — a Gmail App Password (not your real password)
  - Generate at: https://myaccount.google.com/apppasswords

Then install and run:
```bash
npm install
npm start
```

---

## 4. Frontend Setup

```bash
npm install
npm run dev
```

---

## 5. Social Links & Branding

Update your store name, social media links, and support email in:
- `src/components/customer/CustomerLayout.tsx`
