<?php
// Copy to iup-config.php in the folder ABOVE public_html (Hostinger File Manager),
// then fill in the values from hPanel. Never commit the real file.
return [
  // hPanel > Databases > MySQL Databases
  'db_dsn'  => 'mysql:host=localhost;dbname=u000000000_authenticup;charset=utf8mb4',
  'db_user' => 'u000000000_authenticup',
  'db_pass' => 'PASTE-THE-DATABASE-PASSWORD-HERE',
  // hPanel > Emails: create hello@authenticup.in first
  'mail_to'   => 'hello@authenticup.in',
  'mail_from' => 'Authentic UP <hello@authenticup.in>',
];
