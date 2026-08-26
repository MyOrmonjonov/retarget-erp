# CRM

Spring Boot 4.1 / Java 17 backend for the CRM. REST API only — the frontend SPA lives in a separate project. Telegram integration uses webhooks (Telegram calls this server directly).

## Local setup

1. Copy `.env.example` to `.env` and adjust if needed (defaults work for local Postgres).
2. Start Postgres:
   ```
   docker compose up -d
   ```
3. Run the app (dev profile is the default):
   ```
   ./mvnw spring-boot:run
   ```
   Flyway applies migrations from `src/main/resources/db/migration` automatically on startup.

## Verify the Customer API

```
curl -X POST http://localhost:8080/api/customers \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test User","phone":"+998901234567"}'

curl http://localhost:8080/api/customers
```

## Telegram webhook

The webhook endpoint is `POST /api/telegram/webhook/{TELEGRAM_WEBHOOK_SECRET}`. `TELEGRAM_WEBHOOK_SECRET` comes from your `.env` (default `dev-secret`).

For local development, expose the app with ngrok:
```
ngrok http 8080
```

Then register the webhook with Telegram (replace `<BOT_TOKEN>`, `<NGROK_URL>`, `<WEBHOOK_SECRET>`):
```
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<NGROK_URL>/api/telegram/webhook/<WEBHOOK_SECRET>"
```

Send a message to the bot in Telegram — it should echo it back, confirming the webhook path works end to end.

## Not yet implemented

- Authentication/authorization
- CRM entities beyond `Customer` (deals, tasks, pipeline)
