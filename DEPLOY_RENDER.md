# Deploy to Render

## 1. Create the web service

In Render:

1. Click `New +`
2. Click `Web Service`
3. Select the GitHub repo `Zuzuyz/user-registration-system`

Render can read the basic app setup from `render.yaml`, but if it asks you manually, use:

- Build Command: `npm run install:backend`
- Start Command: `npm start`

## 2. Create a MySQL database

Render does not create this app's database automatically from `render.yaml`.

Use Render's MySQL guide:

- https://render.com/docs/deploy-mysql

Create the MySQL service first or in parallel, then copy these values into the web service environment variables:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

## 3. Set environment variables in the web service

In the Render web service dashboard, open `Environment` and add:

- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`

Recommended:

- `DB_PORT=3306`

Do not set `AUTO_CREATE_DATABASE` unless your MySQL user has permission to create databases.

## 4. Deploy

After the variables are saved, redeploy the web service.

## 5. Test logins

- Admin: `shubham@gmail.com` / `123456`
- NGO: `shreyasi@gmail.com` / `123456`
- Rescue: `aarav.nair@rescuenexus.in` / `123456`

## Notes

- The app serves both frontend and API from the same Express server.
- The backend listens on `process.env.PORT`, which Render provides automatically.
- The database bootstrap is deployment-safe: it avoids `CREATE DATABASE` on hosted MySQL unless explicitly enabled.
