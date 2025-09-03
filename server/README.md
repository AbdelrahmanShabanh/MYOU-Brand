# MYOU Store Backend

## Overview

This is the backend API for the MYOU Store e-commerce app, built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in your MongoDB URI and JWT secret:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```
3. Start MongoDB (locally or use MongoDB Atlas)
4. Run the server:
   ```bash
   npm run dev
   # or
   node index.js
   ```

## API Endpoints

- `/api/auth` — User authentication (signup, login, get current user)
- `/api/products` — Product CRUD
- `/api/categories` — Category CRUD
- `/api/orders` — Order management
- `/api/cart` — Cart management
- `/api/admin` — Admin analytics and user management
- `/api/upload` — Image upload (GridFS)

## Environment Variables

- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret for JWT tokens
- `PORT` — Server port (default: 5000)

## File Structure

- `index.js` — Main server entry point
- `models/` — Mongoose models
- `routes/` — Express route handlers
- `middleware/` — Auth middleware

## Notes

- Protect your `.env` file and never commit it to version control.
- Admin-only routes require a user with `role: 'admin'`.
- Image uploads use MongoDB GridFS by default.
