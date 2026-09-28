# Store Rating Application

A simple full-stack internship coding challenge project using React, Express.js and MySQL.

## Requirements
- Node.js 18+
- MySQL / XAMPP

## 1. Database setup
1. Open phpMyAdmin.
2. Import `database.sql`.
3. Check that the `store_rating` database is created.

## 2. Backend setup
Open terminal inside `backend`:

```bash
npm install
```

Copy `.env.example` to `.env` and update MySQL password if needed.

Then run:

```bash
node seed.js
npm start
```

Backend runs at `http://localhost:5000`.

## 3. Frontend setup
Open another terminal inside `frontend`:

```bash
npm install
npm run dev
```

Open the URL shown by Vite, normally `http://localhost:5173`.

## Demo accounts
- Admin: `admin@example.com` / `Admin@123`
- Store Owner: `owner@example.com` / `Owner@123`
- Normal User: `user@example.com` / `User@123`

## Notes
- New registrations are normal users.
- Rating is restricted to 1-5.
- A normal user has one rating per store; submitting again updates the existing rating.
- Password update uses the same password validation as registration.
