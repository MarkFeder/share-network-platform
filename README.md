# Network Telemetry & ISP Management Platform

A full-stack infrastructure monitoring solution for ISPs and network operators. Built with TypeScript, React, Node.js, and PostgreSQL.

## Quick Start

### IDE Setup (WebStorm / Rider / IntelliJ)

1. **Extract** the project archive
2. **Open** the folder in your JetBrains IDE
3. The IDE will automatically recognize the `.idea/` configuration
4. **Select a run configuration** from the toolbar dropdown
5. **Click Run** to execute

### Run Configurations

| Configuration | Description |
|---------------|-------------|
| `Full Stack: Dev` | Runs backend + frontend simultaneously |
| `Backend: Dev Server` | Backend with hot reload (tsx watch) |
| `Frontend: Dev Server` | Vite dev server |
| `Backend: Build` | TypeScript compilation |
| `Frontend: Build` | Production build |
| `Backend: Tests` | Jest test suite |
| `Frontend: Tests` | Vitest test suite |
| `Docker: Full Stack` | Docker Compose deployment |
| `Prisma: Generate Client` | Generate Prisma client |
| `Prisma: Migrate Dev` | Run database migrations |
| `Install: All Dependencies` | npm install for all workspaces |
| `Lint: All` | ESLint across all packages |

### Manual Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start infrastructure (PostgreSQL, Redis, RabbitMQ)
docker-compose up -d postgres redis rabbitmq

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Start development servers
npm run dev
```

## Project Structure

```
share-network-platform/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── api/            # REST API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utilities (Redis, Logger)
│   │   ├── config/         # Configuration
│   │   └── types/          # TypeScript types
│   └── prisma/             # Database schema
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API client
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # CSS/Tailwind
├── docker/                 # Docker configs
│   ├── prometheus.yml
│   └── grafana/
├── .idea/                  # JetBrains IDE config
│   ├── runConfigurations/  # Pre-configured run tasks
│   ├── codeStyles/         # Code formatting rules
│   └── inspectionProfiles/ # Linting settings
└── docker-compose.yml
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Real-time**: Socket.IO
- **Metrics**: Prometheus client

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: TanStack Query + Zustand
- **Routing**: React Router v6
- **Real-time**: Socket.IO client

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Monitoring**: Prometheus + Grafana
- **CI/CD**: GitHub Actions ready

## Features

- **Device Management**: Register, monitor, and manage network devices
- **Real-time Telemetry**: Live metrics with WebSocket updates
- **Alert System**: Configurable thresholds with severity levels
- **Network Topology**: Visual device hierarchy and connectivity
- **Multi-tenant**: Organization-based data isolation
- **Authentication**: JWT-based auth with refresh tokens
- **API Metrics**: Prometheus-compatible endpoints

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/network_platform

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:admin@localhost:5672

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Devices
- `GET /api/v1/devices` - List devices
- `GET /api/v1/devices/:id` - Get device
- `POST /api/v1/devices` - Create device
- `PUT /api/v1/devices/:id` - Update device
- `DELETE /api/v1/devices/:id` - Delete device
- `GET /api/v1/devices/stats` - Device statistics
- `GET /api/v1/devices/topology` - Network topology

### Telemetry
- `POST /api/v1/telemetry/ingest` - Ingest telemetry
- `POST /api/v1/telemetry/ingest/batch` - Batch ingest
- `GET /api/v1/telemetry/device/:id/latest` - Latest metrics
- `GET /api/v1/telemetry/device/:id/history` - Historical data
- `GET /api/v1/telemetry/dashboard` - Dashboard metrics

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed status
- `GET /health/ready` - Kubernetes readiness
- `GET /health/live` - Kubernetes liveness
- `GET /metrics` - Prometheus metrics

## Development

### Code Style
- 2-space indentation
- Single quotes
- Semicolons required
- ESLint + Prettier on save

### Testing
```bash
# Backend tests
npm run test --workspace=backend

# Frontend tests
npm run test --workspace=frontend
```

### Database
```bash
# Create migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio
```

## Deployment

### Docker Compose (Development)
```bash
docker-compose up -d
```

### Production
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

## License

MIT License - see LICENSE file for details.
