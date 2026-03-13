<?php
/**
 * SQLite - Banco de dados único do servidor
 * Garante que todos os dados (users, saldos, recargas, catalogs, transactions) 
 * fiquem persistidos no servidor e visíveis para todos que entram no site.
 */

$DB_FILE = __DIR__ . '/recarga.db';

function getDb() {
    global $DB_FILE;
    try {
        $pdo = new PDO('sqlite:' . $DB_FILE);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->exec('PRAGMA foreign_keys = ON');
        return $pdo;
    } catch (PDOException $e) {
        throw new RuntimeException('Erro ao conectar ao banco: ' . $e->getMessage());
    }
}

function ensureSchema($pdo) {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT,
            type TEXT NOT NULL,
            nome TEXT,
            email TEXT,
            createdAt TEXT,
            active INTEGER DEFAULT 1
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS saldos (
            userId TEXT PRIMARY KEY,
            valor REAL DEFAULT 0
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS recargas (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS catalogs (
            userId TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS config (
            k TEXT PRIMARY KEY,
            v TEXT
        )
    ");

    // Configurações por usuário (revendedor/admin) - persistidas no servidor
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS user_config (
            userId TEXT NOT NULL,
            k TEXT NOT NULL,
            v TEXT,
            PRIMARY KEY (userId, k)
        )
    ");

    // Histórico de bônus concedidos (depósito)
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS bonus_historico (
            id TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            username TEXT,
            valorDeposito REAL NOT NULL,
            valorBonus REAL NOT NULL,
            tipo TEXT NOT NULL,
            createdAt TEXT NOT NULL
        )
    ");

    // Admin padrão se não existir nenhum usuário
    $stmt = $pdo->query("SELECT 1 FROM users WHERE username='admin' LIMIT 1");
    if ($stmt->fetch() === false) {
        $id = (string)(time() * 1000);
        $pdo->prepare("
            INSERT INTO users (id, username, password, type, nome, email, createdAt, active)
            VALUES (?, 'admin', 'admin123', 'admin', 'Administrador', 'admin@recargaexpress.com', datetime('now'), 1)
        ")->execute([$id]);
    }
    
    // Virtual Pay: NÃO definir credenciais padrão.
    // Cada revendedor configura suas próprias credenciais no painel.
    // Admin pode configurar as dele se quiser (para cobrar revendedores).

    // Configurações padrão da API de recargas (Recarga Express v2) se não existirem
    $apiBase = getConfig($pdo, 'adminApiBaseURL');
    if ($apiBase === null || trim((string)$apiBase) === '') {
        setConfig($pdo, 'adminApiBaseURL', 'https://express.poeki.dev/api');
    }
    // Nota: os endpoints no api.js agora usam prefixo /v2/ ao invés de /v1/
    $apiKey = getConfig($pdo, 'adminApiKey');
    if ($apiKey === null || trim((string)$apiKey) === '') {
        // Mesmo valor do config.example.js (para ambiente de demonstração)
        setConfig($pdo, 'adminApiKey', 're_6f81798cbef1a8ce8ccc83459ad51755123ade11a2252d20');
    }

    // Módulo de pagamento padrão
    $pm = getConfig($pdo, 'adminPaymentModule');
    if ($pm === null || trim((string)$pm) === '') {
        setConfig($pdo, 'adminPaymentModule', 'virtualpay');
    }
}

function getConfig($pdo, $k) {
    $s = $pdo->prepare("SELECT v FROM config WHERE k = ?");
    $s->execute([$k]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    return $r ? $r['v'] : null;
}

function setConfig($pdo, $k, $v) {
    $pdo->prepare("INSERT OR REPLACE INTO config (k, v) VALUES (?, ?)")->execute([$k, $v !== null ? $v : '']);
}

function getUserConfig($pdo, $userId, $k) {
    $s = $pdo->prepare("SELECT v FROM user_config WHERE userId = ? AND k = ?");
    $s->execute([(string)$userId, (string)$k]);
    $r = $s->fetch(PDO::FETCH_ASSOC);
    return $r ? $r['v'] : null;
}

function setUserConfig($pdo, $userId, $k, $v) {
    $pdo->prepare("INSERT OR REPLACE INTO user_config (userId, k, v) VALUES (?, ?, ?)")
        ->execute([(string)$userId, (string)$k, $v !== null ? (string)$v : '']);
}
