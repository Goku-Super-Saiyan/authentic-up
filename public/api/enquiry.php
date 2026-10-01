<?php
// Hostinger version of POST /api/enquiry (the Vercel one is api/enquiry.ts).
// Saves the enquiry in MySQL and emails it to the team with PHP mail().
// Settings live in iup-config.php one level above public_html, never in this repo
// (copy hostinger/iup-config.example.php there and fill it in).

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(int $status, array $body): void { http_response_code($status); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
function clean($v, int $max = 500): string { return is_string($v) ? mb_substr(trim($v), 0, $max) : ''; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') reply(405, ['error' => 'Use POST']);

$b = json_decode(file_get_contents('php://input') ?: '', true);
if (!is_array($b)) reply(400, ['error' => 'Send JSON']);
if (!empty($b['website'])) reply(200, ['ok' => true, 'reference' => 'IUP-000000']); // honeypot field filled in by bots

$e = [
  'kind' => clean($b['kind'] ?? '', 60), 'name' => clean($b['name'] ?? '', 120), 'email' => clean($b['email'] ?? '', 160),
  'phone' => clean($b['phone'] ?? '', 20), 'craft' => clean($b['craft'] ?? '', 80), 'district' => clean($b['district'] ?? '', 60),
  'quantity' => clean($b['quantity'] ?? '', 120), 'budget' => clean($b['budget'] ?? '', 40), 'message' => clean($b['message'] ?? '', 4000),
];
if ($e['name'] === '' || !filter_var($e['email'], FILTER_VALIDATE_EMAIL) || mb_strlen($e['message']) < 10)
  reply(422, ['error' => 'Add your name, a valid email and a few words about what you need.']);

$reference = 'IUP-' . random_int(100000, 999999);
$cfgFile = getenv('IUP_CONFIG') ?: dirname(__DIR__, 2) . '/iup-config.php';
$cfg = is_file($cfgFile) ? (include $cfgFile) : [];
if (!is_array($cfg)) $cfg = [];

if (!empty($cfg['db_dsn'])) {
  try {
    $db = new PDO($cfg['db_dsn'], $cfg['db_user'] ?? null, $cfg['db_pass'] ?? null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $q = $db->prepare('INSERT INTO enquiries (reference, kind, name, email, phone, craft, district, quantity, budget, message) VALUES (?,?,?,?,?,?,?,?,?,?)');
    $q->execute([$reference, $e['kind'], $e['name'], $e['email'], $e['phone'] ?: null, $e['craft'], $e['district'], $e['quantity'], $e['budget'], $e['message']]);
  } catch (Throwable $t) {
    error_log('enquiry save failed: ' . $t->getMessage());
    reply(502, ['error' => "We couldn't save your enquiry. Please try again or write to us directly."]);
  }
}

if (!empty($cfg['mail_to']) && !empty($cfg['mail_from'])) {
  $lines = [];
  foreach ($e as $k => $v) if ($v !== '') $lines[] = str_pad($k, 10) . ' ' . $v;
  $subject = '=?UTF-8?B?' . base64_encode("$reference · " . ($e['kind'] ?: 'Enquiry') . " from {$e['name']}") . '?=';
  $headers = implode("\r\n", [
    'From: ' . $cfg['mail_from'],
    'Reply-To: ' . str_replace(["\r", "\n"], '', $e['email']),
    'Content-Type: text/plain; charset=UTF-8',
  ]);
  // The enquiry is already saved; a mail hiccup shouldn't fail the buyer.
  @mail($cfg['mail_to'], $subject, "New enquiry $reference\n\n" . implode("\n", $lines), $headers);
}

reply(200, ['ok' => true, 'reference' => $reference]);
