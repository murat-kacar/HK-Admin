# HK-APP Production Deployment Guide (External DB & Storage)

This folder contains the application image and proxy configuration.

## 📦 Contents
- `hk-app-prod.tar`: Pre-built application image.
- `docker-compose.yml`: Minimal orchestration (App + Proxy).
- `.env.production`: Configuration for external services.

## 🚀 How to Deploy

1. **Import the Image**: 
   ```bash
   docker load -i hk-app-prod.tar
   ```
2. **Configure External Services**: 
   Open `.env.production` and enter the credentials for your **External PostgreSQL** and other services.
3. **Launch**:
   ```bash
   docker-compose up -d
   ```

## 🔐 External Connections
- **Database**: This setup expects an external database. Update `DATABASE_URL` in `.env.production`.
- **Storage**: If using external storage (S3, Cloudinary, etc.), configure the relevant app settings in the environment file.

## 📂 Note on Volumes
This version does not use local volumes for DB or uploads, assuming external persistence is managed separately.
