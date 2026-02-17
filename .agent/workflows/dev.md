---
description: HK-APP Development Workflow
---

This workflow describes how to manage the development environment for HK-APP using Docker (preferred) or local NPM.

## 🐳 Docker Development (Preferred)

Use this method for standard development with hot-reload and database integration.

// turbo
1. Start the Environment:
   ```bash
   # From project root
   cd hk-db-dev && docker-compose up -d
   cd ../hk-app-dev && docker-compose -f docker-compose.dev.yml up -d
   ```

2. View Logs:
   ```bash
   docker logs -f hk-app-dev
   ```

3. Stop the Environment:
   ```bash
   docker-compose -f docker-compose.dev.yml down
   cd ../hk-db-dev && docker-compose down
   ```

## 💻 Local NPM Development (Fallback)

Use this method if you need to run the app outside of Docker for debugging.

1. Ensure Database is Running:
   ```bash
   cd hk-db-dev && docker-compose up -d
   ```

2. Run Locally:
   ```bash
   cd hk-app-dev
   npm install
   npm run dev
   ```

## 🛠 Troubleshooting

- **Database Errors**: Ensure `hk-app-db-dev` is running and `setup.sql` is applied.
- **Port Conflict**: If port 3000 is busy, use `fuser -k 3000/tcp` to clear it.
- **Node Version**: Next.js 16 requires Node.js >= 20.9.0.
