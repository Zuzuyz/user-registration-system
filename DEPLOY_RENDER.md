# Deploy to Render

## 1. Create the web service

In Render:

1. Click `New +`
2. Click `Web Service`
3. Select the GitHub repo `Zuzuyz/user-registration-system`

Render can read the basic app setup from `render.yaml`, but if it asks you manually, use:

- Build Command: `npm run install:backend`
- Start Command: `npm start`

## 2. Create a Postgres database

Render does not create this app's database automatically from `render.yaml`.

Create a Render Postgres service first or in parallel, then copy its connection string into the web service environment variables:

- `DATABASE_URL`

## 3. Set environment variables in the web service

In the Render web service dashboard, open `Environment` and add:

- `DATABASE_URL`

Recommended:

- `NODE_ENV=production`

You can use Render's internal Postgres connection string for `DATABASE_URL`.

## 4. Deploy

After the variables are saved, redeploy the web service.

## 5. Test logins

- Admin: `shubham@gmail.com` / `123456`
- NGO: `shreyasi@gmail.com` / `123456`
- Rescue: `aarav.nair@rescuenexus.in` / `123456`

## Notes

- The app serves both frontend and API from the same Express server.
- The backend listens on `process.env.PORT`, which Render provides automatically.
- The app auto-creates the `users` table and seeds the demo accounts on startup.
