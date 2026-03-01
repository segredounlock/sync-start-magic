<?php
/**
 * Proxy backend para a API de Recargas (express.poeki.dev)
 * - Evita depender de localStorage (funciona em qualquer dispositivo)
 * - Mantém a API Key no servidor (SQLite)
 *
 * Entrada (JSON via POST):
 * {
 *   "endpoint": "/v1/me/balance",
 *   "method": "GET" | "POST",
 *   "body": { ... } | null
 * }
 */

error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!function_exists('curl_init')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Extensão cURL não está habilitada no PHP. Habilite no php.ini do XAMPP.'
    ]);
    exit();
}

require_once __DIR__ . '/db.php';
$pdo = getDb();
ensureSchema($pdo);

// Config no servidor (fonte da verdade)
$apiKey = trim((string)(getConfig($pdo, 'adminApiKey') ?? ''));
$baseURL = trim((string)(getConfig($pdo, 'adminApiBaseURL') ?? ''));
if ($baseURL === '') {
    // fallback padrão compatível com o projeto
    $baseURL = 'https://express.poeki.dev/api';
}

// Ler input
$raw = file_get_contents('php://input') ?: '';
$input = json_decode($raw, true);
if (!is_array($input)) $input = [];

$endpoint = (string)($input['endpoint'] ?? '');
$method = strtoupper((string)($input['method'] ?? 'GET'));
$body = $input['body'] ?? null;

if ($endpoint === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'endpoint não fornecido']);
    exit();
}

if ($apiKey === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'API Key não configurada no servidor. Configure no painel Admin.']);
    exit();
}

// Normalizar endpoint para começar com "/"
if ($endpoint[0] !== '/') $endpoint = '/' . $endpoint;

$url = rtrim($baseURL, '/') . $endpoint;

// Requisição
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// Em ambiente local (XAMPP) costuma dar problema de certificado em algumas máquinas
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

$headers = [
    'Content-Type: application/json',
    'X-API-Key: ' . $apiKey
];

if ($method === 'POST') {
    curl_setopt($ch, CURLOPT_POST, true);
    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } else {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(new stdClass()));
    }
} else {
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
}

curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$resp = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$err = curl_error($ch);
$errno = curl_errno($ch);
curl_close($ch);

if ($err) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => "cURL Error ($errno): $err"
    ]);
    exit();
}

// Tentar repassar JSON da API original
$decoded = json_decode($resp, true);
if ($decoded === null && $resp !== 'null') {
    http_response_code($httpCode ?: 502);
    echo json_encode([
        'success' => false,
        'error' => 'Resposta inválida da API de recargas',
        'http_code' => $httpCode,
        'raw_response' => substr($resp, 0, 500)
    ]);
    exit();
}

http_response_code($httpCode ?: 200);
echo json_encode($decoded);

