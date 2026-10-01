<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/cd148b9a-1885-44aa-99d8-12386f5f5e3d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Run the Node.js API

The portal authentication API uses the Supabase Data API. Copy `.env.example` to
`.env`, set `SUPABASE_URL` to your project's URL and `SUPABASE_SERVICE_ROLE_KEY`
to the project's service-role key. Keep that key server-side and never expose it
in frontend code. Also set a random `JWT_SECRET` of at least 32 bytes.

1. Run `backend/migrations/001_auth.sql` in the Supabase Dashboard SQL Editor.
2. Temporarily set `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12–72 bytes), and
   `ADMIN_DISPLAY_NAME` in `.env`, then run `npm run staff:create`.
3. Remove the `ADMIN_PASSWORD` value from `.env` after provisioning.
4. Start the API using `npm run dev:api`; in a second terminal, start the React
   app using `npm run dev`.

The Vite development server proxies `/api` and `/health` to port 5000. Pharmacy
registration creates an `UNDER_REVIEW` account; public registration cannot create
staff users or assign roles. Staff accounts must be provisioned by an operator.

The current backend implements the authentication and session APIs described in
`backend.md`. The remaining product, order, fulfilment, billing, and analytics API
domains are not yet implemented.
# B2B-Pharmaceutical-
