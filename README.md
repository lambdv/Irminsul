# Irminsul 

Metagaming and Theorycrafting suite for Genshin Impact.

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm / yarn / npm

### 1. Clone the repository
```bash
git clone https://github.com/lambdv/Irminsul
cd Irminsul
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Bariables
Create a `.env` file in apps/Irminsul/ with the following variables:
```txt
    DATABASE_URL=""          # setup neon directly through https://neon.tech/ or through vercel
                             # if using a different database type, change code in src/db/db.ts

    AUTH_DRIZZLE_URL=""      # https://authjs.dev/getting-started/adapters/drizzle?framework=next-js
    # auth provider with authjs using discord https://discord.com/developers/docs/intro
    AUTH_DISCORD_ID=""
    AUTH_DISCORD_SECRET=""

    AUTH_SECRET=""           # secret key for authjs. made locally using `openssl rand -base64 32` 

    STRIPE_SECRET_KEY=""     # for payments integration using stripe 
    STRIPE_WEBHOOK_SECRET="" # shouldn't break anything if not set up in most cases
```

### 4 Build/Run Application

#### Development
```bash
npm run dev
```

#### Production
```bash
npm run build
npm run start
```

#### Docker
```bash
docker build -t irminsul .
docker run -p 3000:3000 irminsul
```
