## Byway LMS Backend (`lmsBackend`)

Byway is an e‑learning / learning management system (LMS) where **tutors can create and upload courses** and **students can pay for courses and learn online**.

This repository (`lmsBackend`) is the **backend API** for Byway, built with **Node.js, Express, and MongoDB (via Mongoose)**. It exposes RESTful endpoints for authentication, tutor and student management, course creation and enrollment, payments, and learning progress tracking.

---

## Features

- **Authentication & Authorization**
  - Email/password signup & login
  - Role‑based access: `student`, `tutor`, (optionally `admin`)
  - JWT‑based auth with secure cookies
  - Rate limiting and basic security middleware

- **User Management**
  - Tutor profiles (bio, expertise, social links, avatar, etc.)
  - Student profiles (name, avatar, learning preferences)
  - Password hashing with `bcrypt` / `bcryptjs`
  - Password reset and email notifications (via `nodemailer`)

- **Course Management**
  - Tutors can **create, update, and delete** courses
  - Course metadata: title, description, price, level, category, language, tags
  - Course content: sections, lessons, video and document uploads
  - Course publishing / draft states and visibility controls
  - Media upload & storage integration via **Cloudinary** (using `cloudinary`, `multer`, `streamifier`)

- **Enrollment & Learning**
  - Students can enroll in paid courses after successful payment
  - Track course progress (completed lessons, percentage done)
  - Access control for course content (only enrolled students)
  - Basic analytics (e.g. number of students per course, revenue per course) as needed

- **Payments**
  - Payment integration via **Flutterwave** (`flutterwave-node-v3`)
  - Secure payment initialization and verification flows
  - Webhook support for asynchronous payment notifications (if configured)
  - Storage of transaction history and enrollment on successful payment

- **Notifications & Communication**
  - Transactional emails (welcome emails, payment receipts, password reset)
  - Optional tutor‑student communication endpoints (e.g. Q&A, announcements) if implemented

- **Logging & Monitoring**
  - HTTP request logging via `morgan`
  - Centralized error handling using `express-async-handler`

---

## Tech Stack

- **Runtime**: Node.js (ES modules, `"type": "module"`)
- **Framework**: Express
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, cookies, `cookie-parser`
- **File Uploads**: `multer`, `cloudinary`, `streamifier`
- **Payments**: `flutterwave-node-v3`
- **Email**: `nodemailer`
- **Environment Management**: `dotenv`
- **Other utilities**: `axios`, `crypto`, `lru-cache`, `cors`, `express-rate-limit`, `body-parser`

---

## Project Structure (Typical)

Your exact structure may differ, but a typical layout for this backend looks like:

```text
lmsBackend-dev/
  server.js             # Application entry point
  /config               # Database, cloudinary, payment, email configs
  /models               # Mongoose models (User, Course, Lesson, Payment, Enrollment, etc.)
  /controllers          # Route controllers / business logic
  /routes               # Express route definitions (auth, courses, payments, users, etc.)
  /middleware           # Auth middleware, error handlers, rate limiting, validators
  /services             # Payment, email, media upload services
  /utils                # Helpers, constants, error classes
  .env                  # Environment variables (NOT committed)
  package.json
  README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **MongoDB** instance (local or hosted, e.g. MongoDB Atlas)
- **Flutterwave** account & API keys (for payments)
- **Cloudinary** account (for media uploads)
- An SMTP provider for email (or Gmail/other, depending on your `nodemailer` setup)

### Installation

```bash
git clone <your-repo-url> byway-lms-backend
cd byway-lms-backend
npm install
```

---

## Environment Configuration

Create a `.env` file in the project root with values similar to the following (adapt to your real names/secrets):

```bash
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db-name>?retryWrites=true&w=majority

JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
COOKIE_SECRET=<your-cookie-secret>

CLOUDINARY_CLOUD_NAME=<cloudinary-cloud-name>
CLOUDINARY_API_KEY=<cloudinary-api-key>
CLOUDINARY_API_SECRET=<cloudinary-api-secret>

FLW_PUBLIC_KEY=<flutterwave-public-key>
FLW_SECRET_KEY=<flutterwave-secret-key>
FLW_ENCRYPTION_KEY=<flutterwave-encryption-key>
FLW_REDIRECT_URL=<frontend-url-after-payment>

SMTP_HOST=<smtp-host>
SMTP_PORT=<smtp-port>
SMTP_USER=<smtp-username>
SMTP_PASS=<smtp-password>
SMTP_FROM=<"Byway" <no-reply@byway.com>>

CLIENT_URL=http://localhost:3000  # Byway frontend URL
```

> **Never commit your real `.env` file or secrets to version control.**

---

## Running the Server

In development, the project uses `nodemon` to auto‑reload on changes.

```bash
# Development
npm run dev

# or
npm start     # same as dev in this setup
```

By default the server will run on `http://localhost:5000` (configurable via `PORT`).

---

## Core Domains & Endpoints (High‑Level)

The exact paths may differ depending on your route definitions, but these are the typical domains:

- **Auth**
  - `POST /api/auth/register` – register as student or tutor
  - `POST /api/auth/login` – login and receive JWT (in cookie or header)
  - `POST /api/auth/logout` – clear session
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`

- **Users**
  - `GET /api/users/me` – get current user
  - `PATCH /api/users/me` – update profile
  - `GET /api/tutors` – list tutors
  - `GET /api/tutors/:id` – tutor public profile

- **Courses**
  - `POST /api/courses` – **(tutor)** create course
  - `GET /api/courses` – list all published courses (search/filter by category, level, etc.)
  - `GET /api/courses/:id` – course details
  - `PATCH /api/courses/:id` – **(tutor)** update course
  - `DELETE /api/courses/:id` – **(tutor/admin)** delete course
  - `POST /api/courses/:id/content` – **(tutor)** add/update lessons, sections, media

- **Enrollment & Learning**
  - `GET /api/my/courses` – **(student)** list of enrolled courses
  - `GET /api/my/courses/:id` – access course content if enrolled
  - `POST /api/my/courses/:id/progress` – update lesson completion

- **Payments**
  - `POST /api/payments/initialize` – start payment for a course
  - `POST /api/payments/verify` – verify payment and enroll user
  - `POST /api/payments/webhook` – Flutterwave webhook endpoint (if configured)

Use an API tool like Postman or Insomnia, or connect from the Byway frontend, to interact with these endpoints.

---

## Development Guidelines

- **Coding style**
  - Use ES modules (`import` / `export`), as `"type": "module"` is enabled.
  - Group logic by domain (auth, courses, payments, users, etc.) in controllers/services.
  - Keep routes thin: perform heavy logic in controllers/services, not in route definitions.

- **Error handling**
  - Wrap async route handlers with `express-async-handler` or a similar pattern.
  - Use centralized error middleware for consistent API responses.

- **Security**
  - Use `express-rate-limit` on sensitive endpoints (auth, payments).
  - Validate all input (e.g. with a validation library) before hitting controllers.
  - Store only necessary user data, hash passwords, and never log secrets.

---

## Testing

You can use tools like **Postman**, **Insomnia**, or automated tests (e.g. Jest, Supertest) to verify:

- User registration and login flows
- Tutor course creation and updates
- Student course purchase and enrollment via Flutterwave
- Access control (only enrolled students can access premium content)
- Email notifications where applicable

---

## Deployment

When deploying Byway’s backend (for example to services like Render, Railway, Heroku, or a custom VPS):

- Set all environment variables from the `.env` file in the hosting provider
- Point your **MongoDB URI** to a production database
- Configure **Flutterwave** and **Cloudinary** to use production keys and callback URLs
- Ensure `NODE_ENV=production` and enable proper logging/monitoring
- Serve the Byway frontend (if separate) from its own host, and configure `CORS` in this backend to allow that origin

---

## Relationship to Byway Frontend

- This `lmsBackend` project is the **API layer for the Byway learning platform**.
- It is responsible for:
  - Authentication & authorization
  - Business logic around course creation, enrollment, and learning
  - Payments and integrations (Flutterwave, Cloudinary, email)
  - Providing data consumed by the Byway frontend (web/mobile).

Any Byway web or mobile client should interact with this backend via the documented REST endpoints.

---

## Roadmap Ideas

- Add advanced analytics dashboards for tutors (course performance, revenue, engagement)
- Add reviews & ratings for courses
- Add quizzes, assignments, and certifications
- Add multi‑currency and multi‑language support
- Add subscription / membership‑based plans in addition to one‑time course purchases

---

## License

This project currently uses the `ISC` license as specified in `package.json`. Adjust if your licensing needs change.

