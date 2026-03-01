<?php
/**
 * API de dados - Banco único no servidor (SQLite)
 * Todas as operações de users, saldos, recargas, catalogs e transactions.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db.php';

$pdo = getDb();
ensureSchema($pdo);

$input = json_decode(file_get_contents('php://input') ?: '{}', true) ?: [];
$action = $_GET['action'] ?? $input['action'] ?? '';

/**
 * Chama a API de reembolso do módulo de pagamento (Mercado Pago, Virtual Pay ou PushinPay).
 * Retorna array com 'success' => true/false e opcionalmente 'error'.
 */
function doRefundPayment($paymentModule, $paymentId, $userId, $amount) {
    $module = in_array($paymentModule, ['mercadopago', 'virtualpay', 'pushinpay'], true) ? $paymentModule : 'mercadopago';
    $base = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost');
    $path = dirname($_SERVER['SCRIPT_NAME'] ?? '/api');
    $path = rtrim(str_replace('\\', '/', $path), '/');
    $url = $base . $path . '/' . $module . '.php?action=refund_payment';
    $payload = json_encode(['paymentId' => $paymentId, 'userId' => $userId, 'amount' => $amount]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 30
        ]
    ]);
    $response = @file_get_contents($url, false, $ctx);
    if ($response === false) {
        return ['success' => false, 'error' => 'Falha ao conectar na API de reembolso'];
    }
    $j = json_decode($response, true);
    return is_array($j) ? $j : ['success' => false, 'error' => 'Resposta inválida'];
}

/**
 * Calcula o valor do bônus para um usuário em um depósito.
 * Bônus pode ser: fixo (R$ X para depósito >= mínimo) ou percentual (% sobre qualquer valor).
 */
function getBonusValorForUser($pdo, $userId, $valorDeposito) {
    $valorDeposito = (float)$valorDeposito;
    $uid = (string)$userId;

    $getBonusFromConfig = function ($tipo, $valor, $depMin) use ($valorDeposito) {
        $tipo = $tipo === 'percentual' ? 'percentual' : 'fixo';
        $valor = (float)$valor;
        $depMin = (float)$depMin;
        if ($valor <= 0) return 0.0;
        if ($tipo === 'percentual') {
            return round($valorDeposito * $valor / 100, 2);
        }
        if ($valorDeposito >= $depMin) return $valor;
        return 0.0;
    };

    $tipoInd = getUserConfig($pdo, $uid, 'revendedorBonusTipo');
    $valInd = getUserConfig($pdo, $uid, 'revendedorBonusValor');
    $depInd = getUserConfig($pdo, $uid, 'revendedorBonusDepositoMinimo');
    if ($valInd !== null && $valInd !== '' && (float)$valInd > 0) {
        $bonus = $getBonusFromConfig($tipoInd ?: 'fixo', $valInd, $depInd ?: 0);
        if ($bonus > 0) return $bonus;
    }

    $tipoGeral = getConfig($pdo, 'bonusGeralTipo');
    $valGeral = getConfig($pdo, 'bonusGeralValor');
    $depGeral = getConfig($pdo, 'bonusGeralDepositoMinimo');
    if ($valGeral !== null && $valGeral !== '' && (float)$valGeral > 0) {
        return $getBonusFromConfig($tipoGeral ?: 'fixo', $valGeral, $depGeral ?: 0);
    }
    return 0.0;
}

function applyBonusAndRecord($pdo, $userId, $valorDeposito, $tipo) {
    $bonus = getBonusValorForUser($pdo, $userId, $valorDeposito);
    if ($bonus <= 0) return 0;
    $uid = (string)$userId;
    $ex = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
    $ex->execute([$uid]);
    $row = $ex->fetch(PDO::FETCH_ASSOC);
    if ($row) {
        $pdo->prepare("UPDATE saldos SET valor=valor+? WHERE userId=?")->execute([$bonus, $uid]);
    } else {
        $pdo->prepare("INSERT INTO saldos (userId, valor) VALUES (?,?)")->execute([$uid, $bonus]);
    }
    $username = '';
    $u = $pdo->prepare("SELECT username, nome FROM users WHERE id=?");
    $u->execute([$uid]);
    $ur = $u->fetch(PDO::FETCH_ASSOC);
    if ($ur) $username = $ur['username'] ?? $ur['nome'] ?? $uid;
    $id = 'bonus_' . time() . '_' . bin2hex(random_bytes(4));
    $pdo->prepare("INSERT INTO bonus_historico (id, userId, username, valorDeposito, valorBonus, tipo, createdAt) VALUES (?,?,?,?,?,?,?)")
        ->execute([$id, $uid, $username, $valorDeposito, $bonus, $tipo, date('c')]);
    return $bonus;
}

function jsonOk($data = null) {
    echo json_encode(array_filter(['success' => true, 'data' => $data], fn($v) => $v !== null));
}

function jsonErr($msg) {
    echo json_encode(['success' => false, 'error' => $msg]);
}

try {
    switch ($action) {
        case 'state_getAll': {
            $users = $pdo->query("SELECT * FROM users")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($users as &$u) { $u['active'] = (bool)($u['active'] ?? 1); }
            $saldos = [];
            foreach ($pdo->query("SELECT * FROM saldos")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $saldos[$r['userId']] = (float)$r['valor'];
            }
            $recargas = [];
            foreach ($pdo->query("SELECT id, data FROM recargas")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $recargas[] = array_merge(json_decode($r['data'], true) ?: [], ['id' => $r['id']]);
            }
            $catalogs = [];
            foreach ($pdo->query("SELECT * FROM catalogs")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $catalogs[$r['userId']] = json_decode($r['data'], true);
            }
            $transactions = [];
            foreach ($pdo->query("SELECT * FROM transactions")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $d = json_decode($r['data'] ?? '{}', true);
                $transactions[] = ['id' => $r['id']] + (is_array($d) ? $d : []);
            }
            jsonOk(compact('users', 'saldos', 'recargas', 'catalogs', 'transactions'));
            break;
        }

        case 'user_create': {
            $d = $input;
            $check = $pdo->prepare("SELECT 1 FROM users WHERE username=?");
            $check->execute([$d['username'] ?? '']);
            if ($check->fetch()) throw new Exception('Usuário já existe');
            $id = (string)($d['id'] ?? (int)(time() * 1000));
            $stmt = $pdo->prepare("INSERT INTO users (id,username,password,type,nome,email,createdAt,active) VALUES (?,?,?,?,?,?,?,1)");
            $stmt->execute([$id, $d['username'], $d['password'] ?? '', $d['type'], $d['nome'] ?? '', $d['email'] ?? '', $d['createdAt'] ?? date('c')]);
            if (($d['type'] ?? '') === 'revendedor') {
                $pdo->prepare("INSERT OR REPLACE INTO saldos (userId, valor) VALUES (?,0)")->execute([$id]);
            }
            jsonOk(['id' => $id, 'username' => $d['username'], 'password' => $d['password'] ?? '', 'type' => $d['type'], 'nome' => $d['nome'] ?? '', 'email' => $d['email'] ?? '', 'createdAt' => $d['createdAt'] ?? date('c'), 'active' => true]);
            break;
        }
        case 'user_get': {
            $u = $pdo->prepare("SELECT * FROM users WHERE username=?");
            $u->execute([$_GET['username'] ?? $input['username'] ?? '']);
            $r = $u->fetch(PDO::FETCH_ASSOC);
            if ($r) { $r['active'] = (bool)($r['active'] ?? 1); }
            jsonOk($r ?: null);
            break;
        }
        case 'user_getById': {
            $u = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u->execute([$_GET['id'] ?? $input['id'] ?? '']);
            $r = $u->fetch(PDO::FETCH_ASSOC);
            if ($r) { $r['active'] = (bool)($r['active'] ?? 1); }
            jsonOk($r ?: null);
            break;
        }
        case 'user_getAll': {
            $rows = $pdo->query("SELECT * FROM users")->fetchAll(PDO::FETCH_ASSOC);
            foreach ($rows as &$u) { $u['active'] = (bool)($u['active'] ?? 1); }
            jsonOk($rows);
            break;
        }

        // --- Código de convite (revendedor indica alguém para criar conta) ---
        case 'invite_code_get': {
            $userId = $input['userId'] ?? $_GET['userId'] ?? '';
            if (!$userId) {
                jsonErr('userId é obrigatório');
                exit;
            }
            $u = $pdo->prepare("SELECT id, type, nome, username FROM users WHERE id = ?");
            $u->execute([$userId]);
            $user = $u->fetch(PDO::FETCH_ASSOC);
            if (!$user || ($user['type'] ?? '') !== 'revendedor') {
                jsonErr('Apenas revendedores podem ter código de convite');
                exit;
            }
            $code = getUserConfig($pdo, $userId, 'revendedorInviteCode');
            if (!$code || trim($code) === '') {
                $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
                $code = '';
                for ($i = 0; $i < 8; $i++) {
                    $code .= $chars[random_int(0, strlen($chars) - 1)];
                }
                setUserConfig($pdo, $userId, 'revendedorInviteCode', $code);
            }
            jsonOk(['code' => $code, 'inviterName' => $user['nome'] ?: $user['username']]);
            break;
        }
        case 'invite_validate': {
            $code = trim($input['code'] ?? $_GET['code'] ?? '');
            if (!$code) {
                jsonOk(['success' => false, 'error' => 'Código não informado']);
                break;
            }
            $row = $pdo->prepare("SELECT uc.userId FROM user_config uc INNER JOIN users u ON u.id = uc.userId WHERE uc.k = 'revendedorInviteCode' AND uc.v = ? AND u.type = 'revendedor' AND (u.active = 1 OR u.active IS NULL)");
            $row->execute([$code]);
            $r = $row->fetch(PDO::FETCH_ASSOC);
            if (!$r) {
                jsonOk(['success' => false, 'error' => 'Código inválido ou expirado']);
                break;
            }
            $inviter = $pdo->prepare("SELECT nome, username FROM users WHERE id = ?");
            $inviter->execute([$r['userId']]);
            $inv = $inviter->fetch(PDO::FETCH_ASSOC);
            jsonOk(['success' => true, 'inviterName' => $inv['nome'] ?: $inv['username'], 'inviterId' => $r['userId']]);
            break;
        }
        case 'invite_register': {
            $code = trim($input['code'] ?? '');
            $username = trim($input['username'] ?? '');
            $password = (string)($input['password'] ?? '');
            $nome = trim($input['nome'] ?? '');
            $email = trim($input['email'] ?? '');
            if (!$code || !$username || !$password) {
                jsonErr('Código, usuário e senha são obrigatórios');
                exit;
            }
            if (strlen($username) < 3) {
                jsonErr('Usuário deve ter pelo menos 3 caracteres');
                exit;
            }
            if (strlen($password) < 4) {
                jsonErr('Senha deve ter pelo menos 4 caracteres');
                exit;
            }
            $row = $pdo->prepare("SELECT uc.userId FROM user_config uc INNER JOIN users u ON u.id = uc.userId WHERE uc.k = 'revendedorInviteCode' AND uc.v = ? AND u.type = 'revendedor'");
            $row->execute([$code]);
            $r = $row->fetch(PDO::FETCH_ASSOC);
            if (!$r) {
                jsonErr('Código de convite inválido');
                exit;
            }
            $inviterId = $r['userId'];
            $check = $pdo->prepare("SELECT 1 FROM users WHERE username = ?");
            $check->execute([$username]);
            if ($check->fetch()) {
                jsonErr('Este usuário já está em uso. Escolha outro.');
                exit;
            }
            $id = (string)(time() * 1000);
            $pdo->prepare("INSERT INTO users (id, username, password, type, nome, email, createdAt, active) VALUES (?, ?, ?, 'revendedor', ?, ?, datetime('now'), 1)")
                ->execute([$id, $username, $password, $nome ?: $username, $email]);
            $pdo->prepare("INSERT OR REPLACE INTO saldos (userId, valor) VALUES (?, 0)")->execute([$id]);
            setUserConfig($pdo, $id, 'revendedorInvitedBy', $inviterId);
            jsonOk(['success' => true, 'id' => $id, 'username' => $username, 'message' => 'Conta criada. Faça login com seu usuário e senha.']);
            break;
        }

        case 'user_update': {
            $id = $input['userId'] ?? $input['id'] ?? '';
            $up = $input['updates'] ?? $input;
            unset($up['userId'], $up['id'], $up['updates']);
            $sets = [];
            $vals = [];
            foreach ($up as $k => $v) {
                if ($k === 'active') $v = $v ? 1 : 0;
                $sets[] = "$k=?";
                $vals[] = $v;
            }
            if (empty($sets)) { jsonOk(null); break; }
            $vals[] = $id;
            $pdo->prepare("UPDATE users SET " . implode(',', $sets) . " WHERE id=?")->execute($vals);
            $u = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u->execute([$id]);
            $r = $u->fetch(PDO::FETCH_ASSOC);
            if ($r) { $r['active'] = (bool)($r['active'] ?? 1); }
            jsonOk($r);
            break;
        }
        case 'user_delete': {
            $id = $input['userId'] ?? $input['id'] ?? '';
            $pdo->prepare("DELETE FROM users WHERE id=?")->execute([$id]);
            $pdo->prepare("DELETE FROM saldos WHERE userId=?")->execute([$id]);
            $pdo->prepare("DELETE FROM catalogs WHERE userId=?")->execute([$id]);
            jsonOk(null);
            break;
        }

        case 'saldo_get': {
            $uid = $_GET['userId'] ?? $input['userId'] ?? '';
            $s = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $s->execute([$uid]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            jsonOk($r ? (float)$r['valor'] : 0);
            break;
        }
        case 'saldo_getAll': {
            $out = [];
            foreach ($pdo->query("SELECT userId, valor FROM saldos")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $out[$r['userId']] = (float)$r['valor'];
            }
            jsonOk($out);
            break;
        }
        case 'saldo_getTotalEmUso': {
            $r = $pdo->query("SELECT COALESCE(SUM(valor),0) as t FROM saldos")->fetch(PDO::FETCH_ASSOC);
            jsonOk((float)($r['t'] ?? 0));
            break;
        }
        case 'saldo_set': {
            $uid = $input['userId'] ?? '';
            $v = (float)($input['valor'] ?? 0);
            $pdo->prepare("INSERT OR REPLACE INTO saldos (userId, valor) VALUES (?,?)")->execute([$uid, $v]);
            jsonOk($v);
            break;
        }
        case 'saldo_add': {
            $uid = $input['userId'] ?? '';
            $v = (float)($input['valor'] ?? 0);
            $ex = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $ex->execute([$uid]);
            $row = $ex->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $pdo->prepare("UPDATE saldos SET valor=valor+? WHERE userId=?")->execute([$v, $uid]);
            } else {
                $pdo->prepare("INSERT INTO saldos (userId, valor) VALUES (?,?)")->execute([$uid, $v]);
            }
            $bonusCredited = applyBonusAndRecord($pdo, $uid, $v, 'geral');
            $s = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $s->execute([$uid]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            jsonOk(['saldo' => $r ? (float)$r['valor'] : $v, 'bonusCredited' => $bonusCredited]);
            break;
        }
        /**
         * saldo_addFromPayment - Idempotente: adiciona saldo APENAS uma vez por pagamento PIX.
         * REGRA: O valor creditado é SEMPRE 1:1 - R$100 pagos = R$100 creditados. Nenhuma multiplicação.
         */
        case 'saldo_addFromPayment': {
            $paymentId = (string)($input['paymentId'] ?? '');
            $uid = (string)($input['userId'] ?? '');
            $v = (float)($input['valor'] ?? 0);
            $module = (string)($input['module'] ?? 'mercadopago');

            if (!$paymentId || !$uid) {
                jsonErr('paymentId e userId são obrigatórios');
                break;
            }
            if ($v <= 0) {
                jsonErr('Valor deve ser maior que zero');
                break;
            }

            // Verificar se este pagamento JÁ foi processado (evitar duplicação)
            $tx = $pdo->prepare("SELECT data FROM transactions WHERE id=?");
            $tx->execute([$paymentId]);
            $row = $tx->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $d = json_decode($row['data'] ?? '{}', true);
                if (is_array($d) && ($d['status'] ?? '') === 'approved') {
                    // Já processado - idempotente: retornar sucesso sem alterar nada
                    $s = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
                    $s->execute([$uid]);
                    $r = $s->fetch(PDO::FETCH_ASSOC);
                    jsonOk(['saldo' => $r ? (float)$r['valor'] : 0, 'alreadyProcessed' => true]);
                    break;
                }
            }

            // Creditar valor EXATO (1:1 - sem multiplicação)
            $ex = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $ex->execute([$uid]);
            $row = $ex->fetch(PDO::FETCH_ASSOC);
            if ($row) {
                $pdo->prepare("UPDATE saldos SET valor=valor+? WHERE userId=?")->execute([$v, $uid]);
            } else {
                $pdo->prepare("INSERT INTO saldos (userId, valor) VALUES (?,?)")->execute([$uid, $v]);
            }
            $s = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $s->execute([$uid]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            $newSaldo = $r ? (float)$r['valor'] : $v;

            // Registrar transação como aprovada
            $bonusCredited = applyBonusAndRecord($pdo, $uid, $v, 'geral');
            $s2 = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $s2->execute([$uid]);
            $r2 = $s2->fetch(PDO::FETCH_ASSOC);
            $newSaldo = $r2 ? (float)$r2['valor'] : $newSaldo;

            $txData = [
                'id' => $paymentId,
                'userId' => $uid,
                'type' => 'add_saldo',
                'amount' => $v,
                'status' => 'approved',
                'approved' => true,
                'approvedAt' => date('c'),
                'module' => $module,
                'createdAt' => date('c')
            ];
            $pdo->prepare("INSERT OR REPLACE INTO transactions (id, data) VALUES (?,?)")->execute([$paymentId, json_encode($txData)]);

            jsonOk(['saldo' => $newSaldo, 'credited' => $v, 'bonusCredited' => $bonusCredited]);
            break;
        }
        case 'saldo_subtract': {
            $uid = $input['userId'] ?? '';
            $v = (float)($input['valor'] ?? 0);
            $s = $pdo->prepare("SELECT valor FROM saldos WHERE userId=?");
            $s->execute([$uid]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            $cur = $r ? (float)$r['valor'] : 0;
            if ($cur < $v) throw new Exception('Saldo insuficiente');
            $pdo->prepare("UPDATE saldos SET valor=valor-? WHERE userId=?")->execute([$v, $uid]);
            jsonOk($cur - $v);
            break;
        }

        case 'recarga_create': {
            $d = $input;
            unset($d['action']);
            $id = (string)($d['id'] ?? (int)(time() * 1000));
            $d['id'] = $id;
            $d['createdAt'] = $d['createdAt'] ?? date('c');
            $pdo->prepare("INSERT INTO recargas (id, data) VALUES (?,?)")->execute([$id, json_encode($d)]);
            jsonOk($d);
            break;
        }
        case 'recarga_getAll': {
            $out = [];
            foreach ($pdo->query("SELECT id, data FROM recargas")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $out[] = json_decode($r['data'], true) + ['id' => $r['id']];
            }
            jsonOk($out);
            break;
        }
        case 'recarga_getByUser': {
            $uid = $_GET['userId'] ?? $input['userId'] ?? '';
            $out = [];
            foreach ($pdo->query("SELECT id, data FROM recargas")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $d = json_decode($r['data'], true);
                if (($d['userId'] ?? '') === $uid) $out[] = $d + ['id' => $r['id']];
            }
            jsonOk($out);
            break;
        }
        case 'recarga_update': {
            $id = $input['recargaId'] ?? $input['id'] ?? '';
            $up = $input['updates'] ?? $input;
            unset($up['recargaId'], $up['id'], $up['updates']);
            $s = $pdo->prepare("SELECT data FROM recargas WHERE id=?");
            $s->execute([$id]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            if (!$r) { jsonOk(null); break; }
            $data = array_merge(json_decode($r['data'], true) ?: [], $up);
            $newStatus = isset($data['status']) ? strtolower(trim((string)$data['status'])) : '';
            $isCancelado = in_array($newStatus, ['cancelado', 'cancelled', 'canceled'], true);
            if ($isCancelado && !empty($data['paymentId']) && empty($data['refunded'])) {
                $paymentModule = isset($data['paymentModule']) && in_array($data['paymentModule'], ['mercadopago', 'virtualpay', 'pushinpay'], true) ? $data['paymentModule'] : 'mercadopago';
                $amount = isset($data['salePrice']) ? floatval($data['salePrice']) : 0;
                $userId = $data['userId'] ?? '';
                $refundResult = doRefundPayment($paymentModule, $data['paymentId'], $userId, $amount);
                if (!empty($refundResult['success'])) {
                    $data['refunded'] = true;
                    $data['refundedAt'] = date('c');
                } else {
                    $data['refundError'] = isset($refundResult['error']) ? $refundResult['error'] : 'Erro ao reembolsar';
                }
            }
            $pdo->prepare("UPDATE recargas SET data=? WHERE id=?")->execute([json_encode($data), $id]);
            jsonOk($data);
            break;
        }
        case 'recarga_backupAndClear': {
            $recargas = [];
            foreach ($pdo->query("SELECT id, data FROM recargas")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $recargas[] = ['id' => $row['id']] + (json_decode($row['data'] ?? '{}', true) ?: []);
            }
            setConfig($pdo, 'adminRecargasBackup', json_encode([
                'timestamp' => date('c'),
                'recargas' => $recargas
            ], JSON_UNESCAPED_UNICODE));
            $pdo->exec("DELETE FROM recargas");
            jsonOk(['backedUp' => count($recargas)]);
            break;
        }

        case 'catalog_get': {
            $uid = $_GET['userId'] ?? $input['userId'] ?? '';
            $s = $pdo->prepare("SELECT data FROM catalogs WHERE userId=?");
            $s->execute([$uid]);
            $r = $s->fetch(PDO::FETCH_ASSOC);
            $v = $r ? json_decode($r['data'], true) : null;
            jsonOk(is_array($v) ? $v : null);
            break;
        }
        case 'catalog_getAll': {
            $out = [];
            foreach ($pdo->query("SELECT userId, data FROM catalogs")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $out[$r['userId']] = json_decode($r['data'], true);
            }
            jsonOk($out);
            break;
        }
        case 'catalog_set': {
            $uid = $input['userId'] ?? '';
            $c = $input['catalog'] ?? $input['data'] ?? [];
            $pdo->prepare("INSERT OR REPLACE INTO catalogs (userId, data) VALUES (?,?)")->execute([$uid, json_encode($c)]);
            jsonOk(null);
            break;
        }
        case 'catalog_delete': {
            $uid = $input['userId'] ?? '';
            $pdo->prepare("DELETE FROM catalogs WHERE userId=?")->execute([$uid]);
            jsonOk(null);
            break;
        }

        case 'transaction_getAll': {
            $out = [];
            foreach ($pdo->query("SELECT id, data FROM transactions")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $out[] = json_decode($r['data'], true) + ['id' => $r['id']];
            }
            jsonOk($out);
            break;
        }
        case 'transaction_add': {
            $d = $input;
            unset($d['action']);
            $id = (string)($d['id'] ?? time() . '_' . bin2hex(random_bytes(4)));
            $d['id'] = $id;
            $pdo->prepare("INSERT OR REPLACE INTO transactions (id, data) VALUES (?,?)")->execute([$id, json_encode($d)]);
            jsonOk($d);
            break;
        }
        case 'transaction_backupAndClear': {
            $transactions = [];
            foreach ($pdo->query("SELECT id, data FROM transactions")->fetchAll(PDO::FETCH_ASSOC) as $r) {
                $transactions[] = ['id' => $r['id']] + (json_decode($r['data'] ?? '{}', true) ?: []);
            }
            setConfig($pdo, 'adminSalesBackup', json_encode([
                'timestamp' => date('c'),
                'transactions' => $transactions
            ], JSON_UNESCAPED_UNICODE));
            $pdo->exec("DELETE FROM transactions");
            jsonOk(['backedUp' => count($transactions)]);
            break;
        }

        case 'init': {
            ensureSchema($pdo);
            jsonOk(['ok' => true]);
            break;
        }

        case 'config_set': {
            $d = $input;
            // Configurações globais (admin) usadas pela página pública e pelo painel
            $allowedKeys = [
                'adminMercadoPagoModo',
                'adminMercadoPagoKeyTest',
                'adminMercadoPagoKeyProd',
                'adminApiKey',
                'adminApiBaseURL',
                'adminPaymentModule',
                'adminVirtualPayClientId',
                'adminVirtualPayClientSecret',
                'adminPushinPayToken',
                // Catálogo publicado pelo admin (JSON string)
                'adminCatalog',
                'bonusGeralValor',
                'bonusGeralTipo',
                'bonusGeralDepositoMinimo',
                'revendedorPaymentModule',
                'siteTitle'
            ];
            foreach ($allowedKeys as $key) {
                if (array_key_exists($key, $d)) {
                    $value = $d[$key];
                    // Validação especial para adminMercadoPagoModo
                    if ($key === 'adminMercadoPagoModo') {
                        // Garantir que o modo seja 'test' ou 'prod'
                        $value = ($value === 'test' || $value === 'prod') ? $value : 'prod';
                    }
                    // Validação especial para módulos
                    if ($key === 'adminPaymentModule' || $key === 'revendedorPaymentModule') {
                        $value = ($value === 'mercadopago' || $value === 'virtualpay' || $value === 'pushinpay') ? $value : 'mercadopago';
                    }
                    setConfig($pdo, $key, $value === null ? '' : (string)$value);
                }
            }
            jsonOk(['ok' => true]);
            break;
        }

        case 'config_get': {
            // IMPORTANTE: este endpoint é público (CORS "*").
            // Para não expor segredos diretamente, retornamos "********" quando configurado.
            // Os backends PHP (ex: mercadopago.php) usam os segredos direto do SQLite.
            $sensitiveKeys = ['adminMercadoPagoKeyTest', 'adminMercadoPagoKeyProd', 'adminApiKey', 'adminVirtualPayClientSecret', 'adminPushinPayToken'];
            $maskIfConfigured = function ($v) {
                $v = $v ?? '';
                if (trim((string)$v) === '') return '';
                return '********';
            };

            $k = $_GET['k'] ?? $input['k'] ?? '';
            if ($k === '') {
                $keyTest = getConfig($pdo, 'adminMercadoPagoKeyTest');
                $keyProd = getConfig($pdo, 'adminMercadoPagoKeyProd');
                $apiKey = getConfig($pdo, 'adminApiKey');
                $vpClientId = getConfig($pdo, 'adminVirtualPayClientId');
                $vpClientSecret = getConfig($pdo, 'adminVirtualPayClientSecret');
                $pushinPayToken = getConfig($pdo, 'adminPushinPayToken');
                $out = [
                    'adminMercadoPagoModo' => getConfig($pdo, 'adminMercadoPagoModo'),
                    'adminMercadoPagoKeyTest' => $maskIfConfigured($keyTest),
                    'adminMercadoPagoKeyProd' => $maskIfConfigured($keyProd),
                    'adminApiKey' => $maskIfConfigured($apiKey),
                    'adminApiBaseURL' => getConfig($pdo, 'adminApiBaseURL'),
                    'adminPaymentModule' => getConfig($pdo, 'adminPaymentModule'),
                    'adminVirtualPayClientId' => $vpClientId ?? '',
                    'adminVirtualPayClientSecret' => $maskIfConfigured($vpClientSecret),
                    'adminPushinPayToken' => $maskIfConfigured($pushinPayToken),
                    'revendedorPaymentModule' => getConfig($pdo, 'revendedorPaymentModule'),
                    'bonusGeralValor' => (float)(getConfig($pdo, 'bonusGeralValor') ?: 0),
                    'bonusGeralTipo' => getConfig($pdo, 'bonusGeralTipo') ?: 'fixo',
                    'bonusGeralDepositoMinimo' => (float)(getConfig($pdo, 'bonusGeralDepositoMinimo') ?: 0),
                    'siteTitle' => trim((string)(getConfig($pdo, 'siteTitle') ?: '')) !== '' ? trim((string)getConfig($pdo, 'siteTitle')) : 'Recarga Express'
                ];
                jsonOk($out);
            } else {
                $val = getConfig($pdo, $k);
                if (in_array($k, $sensitiveKeys, true)) {
                    jsonOk($maskIfConfigured($val));
                } else {
                    jsonOk($val);
                }
            }
            break;
        }

        case 'user_config_get': {
            $userId = $_GET['userId'] ?? $input['userId'] ?? '';
            if (trim((string)$userId) === '') throw new Exception('userId é obrigatório');

            // Importante: endpoint público. Mascarar segredos quando configurados.
            $maskIfConfigured = function ($v) {
                $v = $v ?? '';
                if (trim((string)$v) === '') return '';
                return '********';
            };

            $keys = [
                'revendedorMercadoPagoModo',
                'revendedorMercadoPagoKeyTest',
                'revendedorMercadoPagoKeyProd',
                'revendedorVirtualPayClientId',
                'revendedorVirtualPayClientSecret',
                'revendedorPushinPayToken',
                'revendedorPaymentModule',
                'revendedorTelegramUsername',
                'revendedorWhatsAppNumber',
                'revendedorBonusValor',
                'revendedorBonusTipo',
                'revendedorBonusDepositoMinimo',
                'revendedorSiteTitle',
                'revendedorLandingConfig'
            ];

            $out = [];
            foreach ($keys as $k) {
                $val = getUserConfig($pdo, $userId, $k);
                if ($k === 'revendedorMercadoPagoKeyTest' || $k === 'revendedorMercadoPagoKeyProd' || $k === 'revendedorVirtualPayClientSecret' || $k === 'revendedorPushinPayToken') {
                    $out[$k] = $maskIfConfigured($val);
                } else {
                    $out[$k] = $val ?? '';
                }
            }
            jsonOk($out);
            break;
        }

        case 'user_config_set': {
            $userId = $input['userId'] ?? '';
            if (trim((string)$userId) === '') throw new Exception('userId é obrigatório');

            $allowed = [
                'revendedorMercadoPagoModo',
                'revendedorMercadoPagoKeyTest',
                'revendedorMercadoPagoKeyProd',
                'revendedorVirtualPayClientId',
                'revendedorVirtualPayClientSecret',
                'revendedorPushinPayToken',
                'revendedorPaymentModule',
                'revendedorTelegramUsername',
                'revendedorWhatsAppNumber',
                'revendedorBonusValor',
                'revendedorBonusTipo',
                'revendedorBonusDepositoMinimo',
                'revendedorSiteTitle',
                'revendedorLandingConfig'
            ];

            foreach ($allowed as $k) {
                if (!array_key_exists($k, $input)) continue;
                $value = $input[$k];
                $value = $value === null ? '' : (string)$value;

                if ($k === 'revendedorLandingConfig') {
                    // Validar que é JSON válido (objeto)
                    if ($value !== '') {
                        $dec = json_decode($value, true);
                        if (!is_array($dec)) $value = '';
                    }
                }
                if ($k === 'revendedorMercadoPagoModo') {
                    // Permitir vazio (novo revendedor / não configurado)
                    if ($value !== '') {
                        $value = ($value === 'test' || $value === 'prod') ? $value : 'prod';
                    }
                }
                if ($k === 'revendedorPaymentModule') {
                    // Permitir vazio (novo revendedor / não configurado)
                    if ($value !== '') {
                        $value = ($value === 'mercadopago' || $value === 'virtualpay' || $value === 'pushinpay') ? $value : 'mercadopago';
                    }
                }

                setUserConfig($pdo, $userId, $k, $value);
            }

            jsonOk(['ok' => true]);
            break;
        }

        case 'bonus_getConfig': {
            $geral = [
                'tipo' => getConfig($pdo, 'bonusGeralTipo') ?: 'fixo',
                'valor' => (float)(getConfig($pdo, 'bonusGeralValor') ?: 0),
                'depositoMinimo' => (float)(getConfig($pdo, 'bonusGeralDepositoMinimo') ?: 0)
            ];
            $revendedores = [];
            foreach ($pdo->query("SELECT id, username, nome FROM users WHERE type='revendedor'")->fetchAll(PDO::FETCH_ASSOC) as $u) {
                $tipo = getUserConfig($pdo, $u['id'], 'revendedorBonusTipo') ?: 'fixo';
                $val = getUserConfig($pdo, $u['id'], 'revendedorBonusValor');
                $dep = getUserConfig($pdo, $u['id'], 'revendedorBonusDepositoMinimo');
                $revendedores[] = [
                    'userId' => $u['id'],
                    'username' => $u['username'] ?? '',
                    'nome' => $u['nome'] ?? $u['username'] ?? '',
                    'tipo' => $tipo,
                    'valor' => ($val !== null && $val !== '') ? (float)$val : 0,
                    'depositoMinimo' => ($dep !== null && $dep !== '') ? (float)$dep : 0
                ];
            }
            jsonOk(['geral' => $geral, 'revendedores' => $revendedores]);
            break;
        }

        case 'bonus_setGeral': {
            $tipo = ($input['tipo'] ?? 'fixo') === 'percentual' ? 'percentual' : 'fixo';
            $v = (float)($input['valor'] ?? 0);
            $dep = (float)($input['depositoMinimo'] ?? 0);
            if ($v < 0) $v = 0;
            if ($dep < 0) $dep = 0;
            setConfig($pdo, 'bonusGeralTipo', $tipo);
            setConfig($pdo, 'bonusGeralValor', (string)$v);
            setConfig($pdo, 'bonusGeralDepositoMinimo', (string)$dep);
            jsonOk(['geral' => ['tipo' => $tipo, 'valor' => $v, 'depositoMinimo' => $dep]]);
            break;
        }

        case 'bonus_setRevendedor': {
            $userId = (string)($input['userId'] ?? '');
            if ($userId === '') throw new Exception('userId é obrigatório');
            $tipo = ($input['tipo'] ?? 'fixo') === 'percentual' ? 'percentual' : 'fixo';
            $v = (float)($input['valor'] ?? 0);
            $dep = (float)($input['depositoMinimo'] ?? 0);
            if ($v < 0) $v = 0;
            if ($dep < 0) $dep = 0;
            if ($v <= 0) {
                setUserConfig($pdo, $userId, 'revendedorBonusValor', '');
                setUserConfig($pdo, $userId, 'revendedorBonusTipo', '');
                setUserConfig($pdo, $userId, 'revendedorBonusDepositoMinimo', '');
                jsonOk(['userId' => $userId, 'valor' => 0, 'tipo' => '', 'depositoMinimo' => 0]);
            } else {
                setUserConfig($pdo, $userId, 'revendedorBonusTipo', $tipo);
                setUserConfig($pdo, $userId, 'revendedorBonusValor', (string)$v);
                setUserConfig($pdo, $userId, 'revendedorBonusDepositoMinimo', (string)$dep);
                jsonOk(['userId' => $userId, 'valor' => $v, 'tipo' => $tipo, 'depositoMinimo' => $dep]);
            }
            break;
        }

        case 'bonus_getHistorico': {
            $limit = (int)($_GET['limit'] ?? $input['limit'] ?? 500);
            if ($limit > 2000) $limit = 2000;
            $rows = $pdo->prepare("SELECT id, userId, username, valorDeposito, valorBonus, tipo, createdAt FROM bonus_historico ORDER BY createdAt DESC LIMIT ?");
            $rows->execute([$limit]);
            $list = [];
            while ($r = $rows->fetch(PDO::FETCH_ASSOC)) {
                $list[] = [
                    'id' => $r['id'],
                    'userId' => $r['userId'],
                    'username' => $r['username'] ?? '',
                    'valorDeposito' => (float)$r['valorDeposito'],
                    'valorBonus' => (float)$r['valorBonus'],
                    'tipo' => $r['tipo'] ?? 'geral',
                    'createdAt' => $r['createdAt']
                ];
            }
            $total = $pdo->query("SELECT COALESCE(SUM(valorBonus),0) as t FROM bonus_historico")->fetch(PDO::FETCH_ASSOC);
            jsonOk(['list' => $list, 'totalConcedido' => (float)($total['t'] ?? 0)]);
            break;
        }

        case 'admin_change_password': {
            $userId = $input['userId'] ?? '';
            $currentPassword = (string)($input['currentPassword'] ?? '');
            $newPassword = (string)($input['newPassword'] ?? '');

            if (trim((string)$userId) === '') throw new Exception('userId é obrigatório');
            if (trim((string)$currentPassword) === '') throw new Exception('Senha atual é obrigatória');
            if (trim((string)$newPassword) === '') throw new Exception('Nova senha é obrigatória');

            $u = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u->execute([(string)$userId]);
            $row = $u->fetch(PDO::FETCH_ASSOC);
            if (!$row) throw new Exception('Admin não encontrado', 404);
            if (($row['type'] ?? '') !== 'admin') throw new Exception('Apenas admin pode alterar a senha', 403);

            // Comparação robusta:
            $stored = (string)($row['password'] ?? '');
            $storedTrim = trim($stored);
            $cpTrim = trim($currentPassword);
            if ($storedTrim === '') throw new Exception('Senha atual não configurada para este admin', 400);
            $isBcrypt = (str_starts_with($storedTrim, '$2y$') || str_starts_with($storedTrim, '$2a$') || str_starts_with($storedTrim, '$2b$'));
            if ($isBcrypt) {
                if (!password_verify($cpTrim, $storedTrim)) throw new Exception('Senha atual incorreta', 400);
            } else {
                if ($storedTrim !== $cpTrim) throw new Exception('Senha atual incorreta', 400);
            }

            // Atualizar apenas a senha
            $pdo->prepare("UPDATE users SET password=? WHERE id=?")->execute([$newPassword, (string)$userId]);

            $u2 = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u2->execute([(string)$userId]);
            $updated = $u2->fetch(PDO::FETCH_ASSOC);
            if ($updated) { $updated['active'] = (bool)($updated['active'] ?? 1); }

            jsonOk($updated ?: null);
            break;
        }

        case 'user_change_password': {
            $userId = $input['userId'] ?? '';
            $currentPassword = (string)($input['currentPassword'] ?? '');
            $newPassword = (string)($input['newPassword'] ?? '');

            if (trim((string)$userId) === '') throw new Exception('userId é obrigatório');
            if (trim((string)$currentPassword) === '') throw new Exception('Senha atual é obrigatória');
            if (trim((string)$newPassword) === '') throw new Exception('Nova senha é obrigatória');

            $u = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u->execute([(string)$userId]);
            $row = $u->fetch(PDO::FETCH_ASSOC);
            if (!$row) throw new Exception('Usuário não encontrado', 404);

            // Comparação robusta:
            $stored = (string)($row['password'] ?? '');
            $storedTrim = trim($stored);
            $cpTrim = trim($currentPassword);
            if ($storedTrim === '') throw new Exception('Senha não configurada para este usuário', 400);
            $isBcrypt = (str_starts_with($storedTrim, '$2y$') || str_starts_with($storedTrim, '$2a$') || str_starts_with($storedTrim, '$2b$'));
            if ($isBcrypt) {
                if (!password_verify($cpTrim, $storedTrim)) throw new Exception('Senha atual incorreta', 400);
            } else {
                if ($storedTrim !== $cpTrim) throw new Exception('Senha atual incorreta', 400);
            }

            $pdo->prepare("UPDATE users SET password=? WHERE id=?")->execute([$newPassword, (string)$userId]);

            $u2 = $pdo->prepare("SELECT * FROM users WHERE id=?");
            $u2->execute([(string)$userId]);
            $updated = $u2->fetch(PDO::FETCH_ASSOC);
            if ($updated) { $updated['active'] = (bool)($updated['active'] ?? 1); }

            jsonOk($updated ?: null);
            break;
        }

        default:
            http_response_code(400);
            jsonErr('Ação inválida: ' . $action);
    }
} catch (Throwable $e) {
    // Se for erro "esperado" (validação/autorização), não retornar 500.
    // Isso evita aparecer "Internal Server Error" no navegador quando a senha está incorreta, etc.
    $code = (int)($e->getCode() ?: 500);
    if ($code < 400 || $code > 599) $code = 500;
    http_response_code($code);
    jsonErr($e->getMessage());
}
