# XAMPP local development notes (Linux)

XAMPP installs to `/opt/lampp` and provides MariaDB + phpMyAdmin.

## Start / stop

```bash
sudo /opt/lampp/lampp start          # Apache + MySQL
sudo /opt/lampp/lampp startmysql     # MySQL only
sudo /opt/lampp/lampp stop
sudo /opt/lampp/lampp status
```

## App DB bootstrap

```bash
npm run db:setup
```

Uses XAMPP MySQL as `root` with an empty password (default).

## Useful URLs

- phpMyAdmin: http://localhost/phpmyadmin
- Tournament site (Vite): http://localhost:5173
- API: http://localhost:5000/api/health
