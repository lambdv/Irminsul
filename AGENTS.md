# Agents.md

## Overview
irminsul is a genshin impact ai power web applcation for theorycrafting and metagaming usecases, such as browsing character stats, doing damage/stat calculations or gaining information about the meta game through seelie AI, an AI RAG chatbot.

## Project Structure
 if you make changes in the project structure, please update this file.
Irminsul Architecture
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login, settings)
│   ├── (main)/            # Main app (ai, archive, calculator, pricing)
│   ├── (microapp)/        # Embedded apps (calc)
│   └── api/               # API routes
│       ├── (data)/        # REST data endpoints (characters, weapons, artifacts)
│       ├── ai/            # AI chat endpoint
│       ├── auth/          # Auth.js routes
│       ├── calc/          # Calculator factory API
│       ├── checkout/      # Stripe checkout
│       └── graphql/       # GraphQL endpoint
├── components/            # Reusable UI components
│   ├── archive/          # Data display components
│   ├── calculator-graph/ # Visual calculator UI
│   ├── cn/               # shadcn/ui primitives
│   ├── navigation/       # Nav, sidenav, footer
│   └── ui/               # Generic UI components
├── feature/              # Domain logic (feature modules)
│   ├── ai/               # Seelie AI chatbot (LangChain, tools, RAG)
│   ├── archive/          # Genshin data handling
│   ├── calc/             # Damage calculation (aminus, litegraph)
│   ├── calculator/       # Calculator business logic
│   ├── settings/         # User settings
│   └── subscriptions/    # Stripe subscription logic
├── lib/                  # Shared utilities
│   ├── ai/               # AI SDK configuration
│   ├── openapi/          # API schema generation
│   ├── pricing/          # Stripe pricing logic
│   └── session-*.ts      # Auth session utilities
├── db/                   # Database layer
│   └── schema/           # Drizzle ORM schemas
├── store/                # Client state (Zustand)
│   ├── Calculator*.ts    # Calculator state
│   └── *Filters.ts       # Archive filter state
├── schemas/              # Zod validation schemas
├── types/                # TypeScript definitions
└── utils/                # Helper functions
---
Data Flow:
Client (React + Zustand) 
    → API Routes (Next.js)
    → Feature Layer (domain logic)
    → DB (Drizzle + Neon) / External APIs
Key Patterns:
- Feature-sliced architecture
- Route groups for layout composition
- Server Actions for mutations
- Zod for runtime validation
- Zustand for client state
---

## Tech Stack
- Next.js 16
- Bun
- TypeScript
- React
- Drizzle ORM
- Neon Database
- Auth.js
- Stripe
- Google AI Studio
- LangChain
- LangGraph

## Code Style
you should always write turse, concise and minimal amount of code, with a focus on ease of readability and simplicity for humans.