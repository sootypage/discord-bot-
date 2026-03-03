WEB DASHBOARD ZIP (Next.js + Discord OAuth)

1) Put this entire 'web' folder inside your discordbot project:
   discordbot/
     index.js
     package.json
     web/   <-- this folder

2) In Discord Developer Portal:
   OAuth2 -> General -> Redirects:
   http://localhost:3001/api/auth/callback

3) Create web/.env.local by copying .env.local.example and filling values.

4) Install deps:
   cd web
   npm install

5) Start bot + website from root (requires concurrently in root package.json):
   npm start

Website: http://localhost:3001
