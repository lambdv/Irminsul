# Irminsul

Metagaming and Theorycrafting suite for Genshin Impact.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

## 📚 Documentation

- [Monorepo Overview](#-project-structure) (current file)
- [Irminsul Documentation](./apps/Irminsul/README.md)

## 🚀 Project Structure

```
irminsul/
├── apps/           # Applications
│   └── Irminsul/   # Next.js application with AI capabilities
│       ├── README.md  # Application-specific documentation
│       └── ...        # Application code
├── packages/       # Shared packages
├── turbo.json      # Turborepo configuration
└── package.json    # Root package configuration
```

## 📦 Prerequisites

- Node.js (version specified in package.json)
- npm (version 10.2.4 or higher)
- Docker (for containerized development)
- SQLite or PostgreSQL (for database)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/lambdv/Irminsul.git
cd Irminsul
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy example environment files
cp apps/Irminsul/.env.example apps/Irminsul/.env
```

4. Configure your environment variables in `.env` file with necessary API keys and database credentials.

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development servers for all applications
- `npm run build` - Build all applications and packages
- `npm run test` - Run tests across all applications and packages
- `npm run lint` - Run linting across all applications and packages
- `npm run clean` - Clean build artifacts
- `npm run install:all` - Install dependencies for all workspaces

### Database Management

- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio for database management
- `npm run db:migrate` - Run database migrations
- `npm run db:generate` - Generate migration files

## 📚 Workspaces

### Applications
- [`apps/Irminsul`](./apps/Irminsul/README.md) - Main Next.js application with features:
  - AI integration (OpenAI, Google AI, DeepSeek)
  - Authentication (NextAuth.js)
  - Database (Drizzle ORM with SQLite/PostgreSQL)
  - Payment processing (Stripe)
  - Real-time features (Socket.IO)
  - Modern UI (Material-UI, Tailwind CSS)
  - For detailed setup and configuration, see the [application documentation](./apps/Irminsul/README.md)

### Packages
- Shared packages are located in the `packages/` directory

## 🛡️ Security

- Environment variables are used for sensitive configuration
- API keys and secrets are never committed to the repository
- Authentication is handled through NextAuth.js
- Database access is secured through ORM

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 📫 Support

For support, please open an issue in the [GitHub repository](https://github.com/lambdv/Irminsul/issues).
