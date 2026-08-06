# Dayjoy Enterprise AI Platform

A production-ready NestJS backend for Dayjoy's enterprise AI platform, including Voice AI, WhatsApp AI, Website AI, internal AI assistants, and a RAG-powered knowledge base.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Dayjoy Backend (NestJS)                │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Users  │  Customers  │  Distributors  │  Products │
│  Orders │  Employees │  Notifications │  AI │  Knowledge   │
│  Analytics │  Admin │  RBAC │  Security │  Logging        │
├─────────────────────────────────────────────────────────────┤
│                     Prisma ORM                              │
├─────────────────────────────────────────────────────────────┤
│                     PostgreSQL Database                     │
│  users, customers, distributors, employees, orders          │
│  products, ai_agents, conversations, messages               │
│  ai_memory, rag_sources, rag_documents, rag_chunks         │
│  rag_embeddings, rag_queries, tenants, tenant_config        │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

| #  | Module           | Description                                               |
|----|------------------|-----------------------------------------------------------|
| 1  | Config           | Environment-based configuration management                |
| 2  | Database         | Prisma ORM setup and service                              |
| 3  | Auth             | JWT authentication, login, register, refresh              |
| 4  | Users            | User CRUD and profile management                          |
| 5  | Customers        | Customer profiles and relationship to users               |
| 6  | Distributors     | Distributor management and network hierarchy              |
| 7  | Products         | Product catalog management                                |
| 8  | Orders           | Order creation, status tracking, and history              |
| 9  | Employees        | Employee records and role assignments                     |
| 10 | Notifications    | Email, SMS, WhatsApp, in-app notification service layer   |
| 11 | AI               | AI agents, conversations, messages, memory, tools         |
| 12 | Knowledge (RAG)  | RAG sources, documents, chunks, embeddings, queries       |
| 13 | Analytics        | User, order, AI, and knowledge metrics + dashboard        |
| 14 | Admin            | User management, tenant config, system stats              |
| 15 | RBAC Guards      | Role-based access control (@Roles decorator, guards)      |
| 16 | Security         | Helmet, CORS, rate limiting, security middleware          |

## API Endpoints Summary

### Auth (`/api/auth`)

- `POST /register` – Register new user
- `POST /login` – Login with email/password
- `POST /refresh` – Refresh JWT token
- `POST /logout` – Logout (invalidate token)
- `POST /forgot-password` – Request password reset
- `POST /reset-password` – Reset password with token
- `POST /verify-email` – Verify email address

### Users (`/api/users`)

- `GET /me` – Get current user profile
- `PUT /me` – Update current user profile
- `GET /:id` – Get user by ID
- `PUT /:id` – Update user by ID

### Customers (`/api/customers`)

- `GET /` – List customers (tenant-scoped)
- `POST /` – Create customer
- `GET /:id` – Get customer by ID
- `PUT /:id` – Update customer

### Distributors (`/api/distributors`)

- `GET /` – List distributors
- `GET /tree` – Get distributor network tree
- `POST /` – Create distributor
- `GET /:id` – Get distributor by ID
- `PUT /:id` – Update distributor

### Products (`/api/products`)

- `GET /` – List products
- `POST /` – Create product
- `GET /:id` – Get product by ID
- `PUT /:id` – Update product
- `DELETE /:id` – Delete product

### Orders (`/api/orders`)

- `GET /` – List orders
- `POST /` – Create order
- `GET /:id` – Get order by ID
- `PUT /:id/status` – Update order status

### Employees (`/api/employees`)

- `GET /` – List employees
- `POST /` – Create employee
- `GET /:id` – Get employee by ID
- `PUT /:id` – Update employee

### AI (`/api/ai`)

- `GET /agents` – List AI agents
- `GET /agents/:id` – Get agent by ID
- `GET /conversations` – List conversations
- `POST /conversations` – Create conversation
- `GET /conversations/:id` – Get conversation with messages
- `POST /conversations/:id/messages` – Send message in conversation
- `GET /memory/user/:userId` – Get user memory
- `GET /memory/customer/:customerId` – Get customer memory
- `POST /memory` – Upsert memory entry
- `POST /tools/:toolName` – Invoke AI tool

### Knowledge / RAG (`/api/knowledge`)

- `GET /sources` – List RAG sources
- `GET /sources/agent/:agentId` – Get sources by agent
- `POST /ingest` – Ingest new knowledge source
- `POST /query` – Query knowledge base

### Analytics (`/api/analytics`)

- `GET /users` – User metrics
- `GET /orders` – Order metrics
- `GET /ai` – AI usage metrics
- `GET /knowledge` – Knowledge query metrics
- `GET /dashboard` – Dashboard summary (all metrics)

### Admin (`/api/admin`)

- `GET /users` – List all users (tenant)
- `GET /users/:id` – Get user by ID
- `PUT /users/role` – Update user role
- `GET /tenants` – List all tenants (global admin)
- `GET /tenants/:id` – Get tenant by ID
- `GET /config` – List tenant config
- `POST /config` – Create config entry
- `PUT /config` – Update config entry
- `DELETE /config/:key` – Delete config entry
- `GET /stats` – Global system stats

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dayjoy?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGINS=http://localhost:3000,https://dayjoy.com

# Rate Limiting (optional overrides)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10
```

## Setup & Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm or npm or yarn
- PostgreSQL 14+
- Prisma CLI (`pnpm add -D prisma` or `npm install -D prisma`)

### Installation

```bash
# Clone the repository
git clone https://github.com/yashrajkr/dayjoy-enterprise-ai.git
cd dayjoy-enterprise-ai

# Install dependencies
pnpm install
# or
npm install

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials and secrets
```

### Database Setup

```bash
# Generate Prisma client
pnpm prisma generate
# or
npm run prisma:generate

# Run migrations (creates tables)
pnpm prisma migrate dev
# or
npm run prisma:migrate:dev

# (Optional) Seed the database
pnpm prisma db seed
# or
npm run prisma:seed

# (Optional) Open Prisma Studio to inspect data
pnpm prisma studio
# or
npm run prisma:studio
```

### Running the Application

```bash
# Development mode (with hot reload)
pnpm run dev
# or
npm run dev

# Production build
pnpm run build
pnpm run start

# Production mode (optimized)
pnpm run start:prod
```

The API will be available at `http://localhost:3000` by default.

## Testing

```bash
# Run unit tests
pnpm run test
# or
npm run test

# Run e2e tests
pnpm run test:e2e
# or
npm run test:e2e

# Run tests with coverage
pnpm run test:cov
# or
npm run test:cov
```

## API Usage Examples

### Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dayjoy.com",
    "password": "SecurePassword123!",
    "name": "Admin User",
    "role": "ADMIN"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@dayjoy.com",
    "password": "SecurePassword123!"
  }'
```

Response includes `access_token` and `refresh_token`.

### Access Protected Endpoint

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Create AI Conversation

```bash
curl -X POST http://localhost:3000/api/ai/conversations \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent-123",
    "channel": "WEB"
  }'
```

### Send Message in Conversation

```bash
curl -X POST http://localhost:3000/api/ai/conversations/CONVERSATION_ID/messages \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "user",
    "content": "Hello, I need help with my order."
  }'
```

### Query Knowledge Base

```bash
curl -X POST http://localhost:3000/api/knowledge/query \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the return policy?",
    "topK": 5
  }'
```

## Security Features

- **JWT Authentication** – Stateless, secure token-based auth
- **RBAC** – Role-based access control (`ADMIN`, `MANAGER`, `EMPLOYEE`, `DISTRIBUTOR`, `CUSTOMER`)
- **Helmet** – Security headers (CSP, X-Frame-Options, etc.)
- **CORS** – Configurable cross-origin policy
- **Rate Limiting** – Protects against brute force and DoS
  - 100 requests / 15 min for general API
  - 10 requests / 15 min for auth endpoints
- **Input Validation** – `class-validator` + `class-transformer`
- **No-cache for API** – Sensitive endpoints not cached
- **x-powered-by removed** – Reduces fingerprinting

## Deployment

### Docker (Optional)

You can containerize the application:

```dockerfile
# Dockerfile (example)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

```bash
docker build -t dayjoy-enterprise-ai .
docker run -p 3000:3000 --env-file .env dayjoy-enterprise-ai
```

### Production Checklist

- Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` in env
- Configure `CORS_ORIGINS` for your production domains
- Ensure `DATABASE_URL` points to a production PostgreSQL instance
- Enable SSL/TLS for database and API
- Set `NODE_ENV=production`
- Configure proper logging and monitoring
- Set up backup strategy for database
- Review rate limits and adjust for traffic

## Contributing

1. Create a feature branch
2. Make changes
3. Write/update tests
4. Submit a pull request

## License

Proprietary – Dayjoy Enterprise AI Platform.

---

**Built with NestJS, Prisma, PostgreSQL, and TypeScript**
