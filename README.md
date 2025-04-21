# Irminsul 
Metagaming and Theorycrafting suite for Genshin Impact.
https://www.irminsul.moe/

> This is a monorepo for The Irminsul Project
> Irmisnul is a web application that aims to provide the best UI/UX for information and tooling.

## Features
Imrinsul provides an intergrated ecosystem and suite of tools
- **Database**: ingame data archive for characters, weapons, artifacts, ect.
- **RAG Chatbot**: AI answers based on accuarate and up-to-date information stored in a vector knowledge base. 
- **Calculators (WIP)**: webui to calculate character/team damage output and energy recharge requirements 

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

## Repository Structure
```
├── apps/               
│   ├── Imrinsul/      # main applicaiton            
│   └── tavern/        # websocket server 
│
├── packages/           
│   ├── genshindata/   # genshin json data and image assets         
│   └── scraper/       # scripts to get data and assets
│            
└── README.md          # what you're reading now. i think
```  


