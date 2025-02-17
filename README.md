# Irminsul
---
A monolithic Genshin Impact database, encyclopedia and tooling plateform.
Irminsul aims to provide the best user experience for Genshin Metagaming and Theorycrafting use cases.

<div align="center">
  
![Irminsul Screenshot](./example.jpg)
[www.irminsul.moe](https://www.irminsul.moe/)

</div>

---

## Installation

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
Create a `.env` file in the root directory with the following variables:
```txt
    BLOB_READ_WRITE_TOKEN="" # unused
    DATABASE_TYPE=neon       # unused in code, this just shows that we're using neon for the database
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

### 4 Run Application

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

## Features
- [x] Character, Weapon and Artifact Archive Database for information found in the game
- [x] Articles and Guides for written content

~~- [x] AI agent chatbot for answering questions releated to the game~~
~~- [x] User generated content with Akadymia~~
~~- [x] Damage Calculator~~
~~- [x] Energy Recharge Calculator~~

