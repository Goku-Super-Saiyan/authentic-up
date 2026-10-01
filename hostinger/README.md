# Running Authentic UP on Hostinger

One Hostinger web hosting plan (Premium or Business) covers the site, the database and email.

1. **Domain**: in hPanel, add authenticup.in as a website. Hostinger shows the DNS records (or nameservers) to set in GoDaddy; remove the Vercel A and CNAME records then.
2. **Email**: hPanel > Emails, create `hello@authenticup.in`. Add the MX, SPF and DKIM records hPanel lists in GoDaddy (skip if GoDaddy now points to Hostinger nameservers).
3. **Database**: hPanel > Databases > MySQL Databases, create one, then open phpMyAdmin and import `hostinger/schema-mysql.sql`.
4. **Settings**: copy `hostinger/iup-config.example.php` to `iup-config.php` in the folder *above* `public_html` (File Manager) and fill in the database name, user, password and email. It never goes in GitHub.
5. **Auto deploy**: hPanel > Files > FTP Accounts gives the FTP host, user and password. Add them in GitHub (authentic-up > Settings > Secrets and variables > Actions) as `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`. Every push to `main` then builds the site and uploads `dist/` to `public_html/` (`.github/workflows/deploy-hostinger.yml`).
6. **SSL**: hPanel > Security > SSL, install the free certificate. `public/.htaccess` then forces HTTPS.

The enquiry form posts to `/api/enquiry`; on Hostinger `.htaccess` routes that to `api/enquiry.php`, which saves the enquiry in MySQL and emails it with `mail()`.
