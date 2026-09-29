# hello2026

Minimal Node.js app: **Sign in with Google**, then show your name, email and login timestamp.

- Backend: Express + `google-auth-library` (verifies the Google ID token server-side)
- Frontend: vanilla HTML/JS with Google Identity Services

## Setup

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) create an
   **OAuth client ID** of type **Web application**.
2. Add `http://localhost:3000` to **Authorized JavaScript origins**.
3. Configure and run:

```sh
cp .env.example .env   # then paste your client ID into GOOGLE_CLIENT_ID
npm install
npm start              # http://localhost:3000
```

## Tests

```sh
npm test
```

## Layout

```
index.js         starts the server
src/app.js       express app (/cfg, /api/login)
public/          index.html + main.js (frontend)
test/            node:test tests
```
