# Dr. Dhruba Prasad Bhattarai — Research Portfolio

Bilingual (EN/NE) academic research portfolio built with Next.js 16, MongoDB, and Cloudflare R2.

## Tech Stack

- **Framework** — Next.js 16 (App Router, Turbopack)
- **Database** — MongoDB + Mongoose
- **Auth** — NextAuth v4 (Google OAuth + credentials + email verification)
- **Storage** — Cloudflare R2 (presigned uploads/downloads)
- **Styling** — Tailwind CSS v4 + CSS design tokens
- **Testing** — Jest + Testing Library (75 tests)

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the example and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your site URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `ADMIN_SECRET` | Secret for creating the first admin account |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 API access key |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key |
| `R2_BUCKET_NAME` | R2 bucket name |
| `SMTP_HOST` | SMTP server (e.g. `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (587) |
| `SMTP_USER` | SMTP username / email |
| `SMTP_PASS` | SMTP password / app password |

### 3. Start MongoDB

```bash
brew services start mongodb-community
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Create the first admin account

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "admin@yourdomain.com",
    "password": "yourpassword",
    "adminSecret": "your-ADMIN_SECRET-value"
  }'
```

Then sign in at [http://localhost:3000/auth/signin](http://localhost:3000/auth/signin).

## Production Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Self-hosted

```bash
npm run build
npm start
```

Use a process manager to keep it running:

```bash
npm install -g pm2
pm2 start npm --name "bhattarai-research" -- start
pm2 save
pm2 startup   # auto-start on reboot
```

## Cloudflare R2 CORS

Add this CORS policy to your R2 bucket (**Settings → CORS**):

```json
[
  {
    "AllowedOrigins": ["https://yourdomain.com"],
    "AllowedMethods": ["GET", "PUT", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## Running Tests

```bash
npm test              # run all 75 tests
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages + API routes
├── components/
│   ├── layout/       # Navbar, Footer
│   └── ui/           # 20+ reusable components
├── hooks/            # useDownload
├── lib/              # MongoDB, auth, R2, email
├── models/           # Mongoose models
└── styles/           # tokens.css — edit to restyle the whole site
```

## Features

- Bilingual EN/NE throughout (language toggle in navbar)
- Publication management — upload PDFs to R2, track downloads
- Timeline / journey page with drag-to-reorder admin
- Contact form → saved to DB, viewable in admin inbox
- Analytics dashboard — download charts, top publications
- Cite modal (APA, Harvard, MLA, BibTeX)
- Share to 8 platforms (Twitter, Facebook, WhatsApp, Telegram, etc.)
- Dark/light mode with no flash
- SEO meta tags + dynamic OpenGraph per publication
