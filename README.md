# Dayjoy Enterprise AI Platform

> Multi-tenant SaaS with Voice AI, WhatsApp AI, Website AI, RAG, and CRM

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Supabase account (free)

### Setup

1. **Install dependencies:**
```bash
pnpm install
```

2. **Setup Supabase Database:**
   - Go to https://supabase.com
   - Create free account
   - Create new project
   - Copy DATABASE_URL from Settings → Database
   - Add to `.env` file

3. **Generate Prisma Client:**
```bash
pnpm db:generate
```

4. **Run Migrations:**
```bash
pnpm db:migrate:deploy
```

5. **Seed Database:**
```bash
pnpm db:seed
```

6. **Start Server:**
```bash
pnpm dev
```

Server runs on http://localhost:3000

## Test Credentials

- **Admin**: admin@dayjoy.com / admin123
- **Manager**: john@dayjoy.com / password123
- **Agent**: jane@dayjoy.com / password123

## Project Structure

```
dayjoy-enterprise-ai/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seeds/seed.ts
├── src/
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   └── ...
│   └── index.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## API Endpoints

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

### Users
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Products
- GET /api/products
- GET /api/products/:id
- POST /api/products

### Customers, Orders, Leads, AI, RAG
- Full CRUD for all modules

## Scripts

```bash
pnpm dev              # Start development
pnpm build            # Build for production
pnpm db:generate      # Generate Prisma Client
pnpm db:migrate:deploy # Deploy migrations
pnpm db:seed          # Seed database
pnpm db:studio        # Open Prisma Studio
```

## License

MIT
