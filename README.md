# Momentum backend starter (XAMPP + PHP + MySQL)

The current app is a **front-end prototype**. Sign-in, habit records, tasks, reflections, focus logs and preferences are saved in the browser's `localStorage`, scoped by the local profile. Nothing is sent to a server in this build. Do not use real or reused passwords with prototype accounts.

This folder prepares the next backend step for a local XAMPP project. It is deliberately not wired to the front end yet, so opening `index.html` works without Apache or MySQL.

## Run the front end now

1. Extract `momentum-os.zip`.
2. Open `index.html` in a recent browser, or copy the whole `momentum-os` folder into `C:\xampp\htdocs\momentum-os` and browse to `http://localhost/momentum-os/`.
3. Use **Create account** or **Explore in demo mode**. The data stays in that browser until a backend is connected.

## Prepare XAMPP later

1. Start **Apache** and **MySQL** in the XAMPP Control Panel.
2. Open `http://localhost/phpmyadmin/` and import `schema.sql` (it creates `momentum_os`).
3. Copy `config.example.php` to `config.php`, then set your local database values. Keep `config.php` out of public repositories.
4. The `api/` examples use PDO prepared statements and PHP sessions. Review `php.ini`/session settings for your local setup before use.
5. Implement and test the server auth/state requests, then replace the prototype `Auth` methods in `js/auth.js` with `fetch()` calls to `/backend/api/auth.php`. Do not store passwords or password hashes in browser storage in a production implementation. Use HTTPS in production, server-side `password_hash()` / `password_verify()`, HttpOnly session cookies, CSRF protection for state-changing requests, input validation, and authorization checks on every user-owned record.

## Suggested integration contract

- `POST /backend/api/auth.php` JSON `{ "action": "signup", "name": "...", "email": "...", "password": "..." }`
- `POST /backend/api/auth.php` JSON `{ "action": "login", "email": "...", "password": "..." }`
- `GET /backend/api/auth.php` returns the current session user
- `POST /backend/api/auth.php` JSON `{ "action": "logout" }`
- `GET /backend/api/state.php` returns the authenticated user's app state
- `PUT /backend/api/state.php` stores validated state for the authenticated user

The included API code is a starter, not production-certified. Keep the database configuration outside public source control and test error handling/session behavior in your local environment before connecting the UI.
