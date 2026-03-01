<?php
/**
 * API Virtual Pay v2 - Backend PHP
 * 
 * Documentação oficial: https://virtualpay.online/docs/openapi.json
 * 
 * URL Base Produção: https://api.virtualpay.online/v2
 * 
 * Autenticação via headers:
 *   x-client-id: Client ID do merchant (revendedor)
 *   x-client-secret: Client Secret do merchant (revendedor)
 * 
 * Endpoints:
 *   POST /transactions          - Criar transação (deposit PIX)
 *   GET  /transactions/{uuid}   - Consultar transação
 * 
 * REGRA DE NEGÓCIO:
 * - Cada revendedor usa SOMENTE suas próprias credenciais (x-client-id e x-client-secret).
 * - NÃO há fallback para credenciais do admin.
 * - Se o revendedor não configurou, retorna erro pedindo para configurar.
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/db.php';

$pdo = getDb();
ensureSchema($pdo);

$inputRaw = file_get_contents('php://input');
$input = $inputRaw ? json_decode($inputRaw, true) : array();
if (!$input) $input = array();

$action = isset($_GET['action']) ? $_GET['action'] : '';

// URL base da API do Virtual Pay v2 (Produção)
$VPAY_BASE_URL = 'https://api.virtualpay.online/v2';
// Path para reembolso conforme docs: https://virtualpay.online/docs/
// Se a documentação indicar outro path (ex: POST /transactions/:id/refund), as tentativas abaixo incluem as variações comuns.

// ===================== GERADOR DE DADOS ALEATÓRIOS (estilo 4devs) =====================

/**
 * Gera um CPF válido aleatório (com dígitos verificadores corretos).
 */
function gerarCpfValido() {
    $n = array();
    for ($i = 0; $i < 9; $i++) {
        $n[] = mt_rand(0, 9);
    }
    // Primeiro dígito verificador
    $soma = 0;
    for ($i = 0; $i < 9; $i++) {
        $soma += $n[$i] * (10 - $i);
    }
    $resto = $soma % 11;
    $n[9] = ($resto < 2) ? 0 : 11 - $resto;
    // Segundo dígito verificador
    $soma = 0;
    for ($i = 0; $i < 10; $i++) {
        $soma += $n[$i] * (11 - $i);
    }
    $resto = $soma % 11;
    $n[10] = ($resto < 2) ? 0 : 11 - $resto;
    return implode('', $n);
}

/**
 * Gera um nome completo aleatório brasileiro.
 */
function gerarNomeAleatorio() {
    $nomes = array('João', 'Maria', 'Pedro', 'Ana', 'Lucas', 'Julia', 'Carlos', 'Fernanda', 'Rafael', 'Beatriz', 'Gabriel', 'Larissa', 'Mateus', 'Camila', 'Bruno', 'Amanda', 'Felipe', 'Leticia', 'Thiago', 'Patricia', 'Diego', 'Vanessa', 'Rodrigo', 'Mariana', 'Gustavo', 'Isabela', 'Leonardo', 'Natalia', 'Andre', 'Renata');
    $sobrenomes = array('Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Araujo', 'Melo', 'Barbosa', 'Rocha', 'Dias', 'Nascimento', 'Andrade', 'Moreira', 'Nunes', 'Marques', 'Machado', 'Mendes', 'Freitas', 'Cardoso', 'Ramos', 'Teixeira');
    $nome = $nomes[array_rand($nomes)];
    $sobrenome = $sobrenomes[array_rand($sobrenomes)];
    return $nome . ' ' . $sobrenome;
}

/**
 * Gera um email aleatório baseado no nome.
 */
function gerarEmailAleatorio($nome) {
    $dominios = array('gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com.br', 'live.com');
    $nomeEmail = strtolower(str_replace(' ', '.', preg_replace('/[^a-zA-Z ]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', $nome))));
    $nomeEmail .= mt_rand(10, 999);
    return $nomeEmail . '@' . $dominios[array_rand($dominios)];
}

/**
 * Gera um telefone celular aleatório brasileiro.
 */
function gerarTelefoneAleatorio() {
    $ddds = array('11','21','31','41','51','61','71','81','85','27','48','47','19','13','16','15','14','12','62','67','65','68','69','63','64','82','83','84','86','87','88','89','91','92','93','94','95','96','97','98','99');
    $ddd = $ddds[array_rand($ddds)];
    $numero = '9' . mt_rand(1000, 9999) . mt_rand(1000, 9999);
    return $ddd . $numero;
}

/**
 * Obter credenciais do Virtual Pay para um revendedor.
 * Busca SOMENTE as credenciais do revendedor no banco SQLite (user_config).
 * NÃO faz fallback para admin.
 * 
 * clientId = x-client-id (header)
 * clientSecret = x-client-secret (header)
 */
function getVirtualPayCredentials($pdo, $userId) {
    $clientId = null;
    $clientSecret = null;

    if ($userId) {
        $revendedorClientId = getUserConfig($pdo, $userId, 'revendedorVirtualPayClientId');
        $revendedorClientSecret = getUserConfig($pdo, $userId, 'revendedorVirtualPayClientSecret');
        if ($revendedorClientId && trim($revendedorClientId) !== '' && strpos($revendedorClientId, '*') === false) {
            $clientId = trim($revendedorClientId);
        }
        if ($revendedorClientSecret && trim($revendedorClientSecret) !== '' && strpos($revendedorClientSecret, '*') === false) {
            $clientSecret = trim($revendedorClientSecret);
        }
    }

    return array('clientId' => $clientId, 'clientSecret' => $clientSecret);
}

/**
 * Obter credenciais do admin (para quando o admin faz pagamento direto no painel).
 */
function getAdminVirtualPayCredentials($pdo) {
    $clientId = getConfig($pdo, 'adminVirtualPayClientId');
    $clientSecret = getConfig($pdo, 'adminVirtualPayClientSecret');
    if ($clientId) $clientId = trim($clientId);
    if ($clientSecret) $clientSecret = trim($clientSecret);
    return array('clientId' => $clientId, 'clientSecret' => $clientSecret);
}

// ===================== CRIAR PAGAMENTO PIX (DEPOSIT) =====================
if ($action === 'create_payment') {
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0;
    $description = isset($input['description']) ? $input['description'] : 'Recarga de Celular';
    $email = isset($input['email']) ? $input['email'] : '';
    $firstName = isset($input['firstName']) ? $input['firstName'] : 'Cliente';
    $lastName = isset($input['lastName']) ? $input['lastName'] : 'Recarga';
    $externalReference = isset($input['externalReference']) ? $input['externalReference'] : 'REF_' . time();
    $userId = isset($input['userId']) ? $input['userId'] : null;
    $isAdmin = isset($input['isAdmin']) ? (bool)$input['isAdmin'] : false;

    if ($amount <= 0) {
        echo json_encode(array('success' => false, 'error' => 'Valor inválido'));
        exit;
    }

    // Obter credenciais: admin usa as do admin, revendedor usa as dele (sem fallback)
    if ($isAdmin) {
        $creds = getAdminVirtualPayCredentials($pdo);
    } else {
        $creds = getVirtualPayCredentials($pdo, $userId);
    }
    
    $clientId = $creds['clientId'];
    $clientSecret = $creds['clientSecret'];

    if (!$clientId || trim($clientId) === '' || !$clientSecret || trim($clientSecret) === '') {
        echo json_encode(array(
            'success' => false, 
            'error' => 'Virtual Pay Client ID ou Client Secret não configurados. O revendedor precisa configurar suas credenciais do Virtual Pay no painel de configurações.'
        ));
        exit;
    }

    // Gerar dados aleatórios realistas para cada transação (estilo 4devs)
    $cpfAleatorio = gerarCpfValido();
    $nomeAleatorio = gerarNomeAleatorio();
    $emailAleatorio = gerarEmailAleatorio($nomeAleatorio);
    $telefoneAleatorio = gerarTelefoneAleatorio();

    // Montar payload conforme documentação oficial Virtual Pay API v2
    // POST /transactions
    $paymentPayload = array(
        'type' => 'deposit',
        'payment_method' => 'pix',
        'amount' => round($amount, 2),
        'description' => $description,
        'name' => $nomeAleatorio,
        'document' => $cpfAleatorio,
        'reference' => $externalReference,
        'email' => ($email && trim($email) !== '') ? $email : $emailAleatorio,
        'phone' => $telefoneAleatorio
    );

    // Autenticação via headers: x-client-id e x-client-secret
    $apiUrl = $VPAY_BASE_URL . '/transactions';

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentPayload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: application/json',
        'x-client-id: ' . $clientId,
        'x-client-secret: ' . $clientSecret
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo json_encode(array('success' => false, 'error' => 'Erro de conexão com Virtual Pay: ' . $curlError));
        exit;
    }

    $result = json_decode($response, true);

    // Log para debug
    error_log('VirtualPay create_payment HTTP ' . $httpCode . ' | URL: ' . $apiUrl . ' | Payload: ' . json_encode($paymentPayload) . ' | Response: ' . substr($response, 0, 500));

    if ($httpCode >= 400 || !$result) {
        $errorMsg = 'Erro HTTP ' . $httpCode;
        if ($result) {
            if (isset($result['message'])) {
                $errorMsg = $result['message'];
            }
            if (isset($result['error'])) {
                $errorMsg .= ' - ' . (is_string($result['error']) ? $result['error'] : json_encode($result['error']));
            }
            if (isset($result['errors']) && is_array($result['errors'])) {
                $errorDetails = array();
                foreach ($result['errors'] as $field => $msgs) {
                    if (is_array($msgs)) {
                        $errorDetails[] = $field . ': ' . implode(', ', $msgs);
                    }
                }
                if ($errorDetails) {
                    $errorMsg .= ' | Detalhes: ' . implode('; ', $errorDetails);
                }
            }
        } else {
            $errorMsg .= ': ' . substr($response, 0, 200);
        }
        echo json_encode(array('success' => false, 'error' => $errorMsg, 'http_code' => $httpCode));
        exit;
    }

    // Resposta do Virtual Pay v2 (TransactionResponse)
    // Campos: id (uuid), type, amount, tax, net_amount, status, copy_paste, created_at, etc.
    $transactionId = isset($result['id']) ? $result['id'] : '';
    $copyPaste = isset($result['copy_paste']) ? $result['copy_paste'] : '';
    $status = isset($result['status']) ? $result['status'] : 'pending';
    $transactionAmount = isset($result['amount']) ? $result['amount'] : $amount;

    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => $transactionId,
            'transactionId' => $transactionId,
            'status' => $status,
            'status_detail' => $status === 'paid' ? 'accredited' : 'pending_waiting_payment',
            'transaction_amount' => $transactionAmount,
            'tax' => isset($result['tax']) ? $result['tax'] : 0,
            'net_amount' => isset($result['net_amount']) ? $result['net_amount'] : $transactionAmount,
            'pix_data' => array(
                'qr_code' => $copyPaste,
                'qr_code_base64' => '',
                'copy_paste' => $copyPaste
            ),
            'qr_code' => $copyPaste,
            'qr_code_base64' => '',
            'copy_paste' => $copyPaste,
            'pix_code' => $copyPaste,
            'payment_link' => '',
            'date_created' => isset($result['created_at']) ? $result['created_at'] : date('c'),
            'external_reference' => $externalReference
        )
    ));
    exit;
}

// ===================== VERIFICAR PAGAMENTO =====================
if ($action === 'check_payment') {
    $paymentId = isset($_GET['payment_id']) ? $_GET['payment_id'] : '';
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
    $isAdmin = isset($_GET['isAdmin']) && $_GET['isAdmin'] === '1';

    if (!$paymentId) {
        echo json_encode(array('success' => false, 'error' => 'ID do pagamento não informado'));
        exit;
    }

    // Obter credenciais: admin usa as do admin, revendedor usa as dele
    if ($isAdmin) {
        $creds = getAdminVirtualPayCredentials($pdo);
    } else {
        $creds = getVirtualPayCredentials($pdo, $userId);
    }
    
    $clientId = $creds['clientId'];
    $clientSecret = $creds['clientSecret'];

    if (!$clientId || !$clientSecret) {
        echo json_encode(array('success' => false, 'error' => 'Credenciais do Virtual Pay não configuradas para este revendedor'));
        exit;
    }

    // GET /transactions/{uuid}
    $apiUrl = $VPAY_BASE_URL . '/transactions/' . urlencode($paymentId);

    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Accept: application/json',
        'Content-Type: application/json',
        'x-client-id: ' . $clientId,
        'x-client-secret: ' . $clientSecret
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo json_encode(array('success' => false, 'error' => 'Erro de conexão: ' . $curlError));
        exit;
    }

    $result = json_decode($response, true);

    error_log('VirtualPay check_payment HTTP ' . $httpCode . ' | Response: ' . substr($response, 0, 500));

    if ($httpCode >= 400 || !$result) {
        $errorMsg = isset($result['message']) ? $result['message'] : 'Erro ao verificar pagamento (HTTP ' . $httpCode . ')';
        echo json_encode(array('success' => false, 'error' => $errorMsg));
        exit;
    }

    // Resposta: TransactionResponse
    $status = isset($result['status']) ? $result['status'] : 'pending';
    
    // Mapear status do Virtual Pay para o formato esperado pelo frontend
    // Virtual Pay: pending, in_process, in_analysis, paid, canceled, refund, denied, expired
    // Frontend: approved, pending, rejected, cancelled
    $mappedStatus = $status;
    if ($status === 'paid') {
        $mappedStatus = 'approved';
    } elseif ($status === 'denied' || $status === 'canceled' || $status === 'expired') {
        $mappedStatus = 'rejected';
    }

    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => isset($result['id']) ? $result['id'] : $paymentId,
            'status' => $mappedStatus,
            'original_status' => $status,
            'status_detail' => $mappedStatus === 'approved' ? 'accredited' : 'pending_waiting_payment',
            'transaction_amount' => isset($result['amount']) ? $result['amount'] : 0,
            'date_approved' => ($status === 'paid' && isset($result['updated_at'])) ? $result['updated_at'] : null,
            'external_reference' => isset($result['reference']) ? $result['reference'] : '',
            'copy_paste' => isset($result['copy_paste']) ? $result['copy_paste'] : ''
        )
    ));
    exit;
}

// ===================== REEMBOLSO =====================
// OpenAPI 2.0.0 (https://virtualpay.online/docs/openapi.json) documenta apenas:
//   POST /transactions, GET /transactions/{uuid}
// Não existe endpoint de refund/cancel na spec. TransactionStatus inclui "refund" e "canceled"
// mas não há path para acioná-los. Tentamos PATCH por compatibilidade; se a API não suportar,
// orientamos estorno manual no painel.
if ($action === 'refund_payment') {
    $paymentId = isset($input['paymentId']) ? trim($input['paymentId']) : '';
    $userId = isset($input['userId']) ? $input['userId'] : null;
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0;

    if (!$paymentId || !$userId) {
        echo json_encode(array('success' => false, 'error' => 'paymentId e userId são obrigatórios'));
        exit;
    }

    $clientId = getUserConfig($pdo, $userId, 'revendedorVirtualPayClientId');
    $clientSecret = getUserConfig($pdo, $userId, 'revendedorVirtualPayClientSecret');
    if (!$clientId || !$clientSecret || strpos($clientId, '*') !== false || strpos($clientSecret, '*') !== false) {
        echo json_encode(array('success' => false, 'error' => 'Credenciais Virtual Pay não configuradas'));
        exit;
    }

    $headers = array(
        'Accept: application/json',
        'Content-Type: application/json',
        'x-client-id: ' . $clientId,
        'x-client-secret: ' . $clientSecret
    );

    // OpenAPI não documenta endpoint de reembolso. Tentativa: PATCH /transactions/{uuid} com status "refund"
    $url = $VPAY_BASE_URL . '/transactions/' . urlencode($paymentId);
    $body = array('status' => 'refund');
    if ($amount > 0) {
        $body['amount'] = $amount;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_TIMEOUT, 25);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo json_encode(array('success' => false, 'error' => 'Erro de conexão: ' . $curlError));
        exit;
    }

    $result = is_string($response) ? json_decode($response, true) : null;
    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(array('success' => true, 'data' => array('id' => $paymentId)));
        exit;
    }

    // API não suporta PATCH para refund (não documentado no OpenAPI) — orientar estorno manual
    $noRefundMessage = 'A API Virtual Pay v2 (openapi) não documenta endpoint de reembolso. Realize o estorno manualmente no painel do Virtual Pay ou entre em contato com o suporte.';
    if ($httpCode === 404 || $httpCode === 405 || $httpCode === 422 || $httpCode === 400) {
        $apiMsg = isset($result['message']) ? $result['message'] : (isset($result['error']) ? (is_string($result['error']) ? $result['error'] : json_encode($result['error'])) : '');
        echo json_encode(array(
            'success' => false,
            'error' => $noRefundMessage . ($apiMsg ? ' Resposta da API: ' . $apiMsg : ''),
            'debug' => array('http_code' => $httpCode, 'response_preview' => substr($response, 0, 300))
        ));
        exit;
    }

    $detail = isset($result['message']) ? $result['message'] : (isset($result['error']) ? (is_string($result['error']) ? $result['error'] : json_encode($result['error'])) : 'HTTP ' . $httpCode);
    if (isset($result['errors']) && is_array($result['errors'])) {
        $detail .= ' | ' . json_encode($result['errors']);
    }
    error_log('VirtualPay refund falhou. HTTP ' . $httpCode . ' | Resposta: ' . substr($response, 0, 500));
    echo json_encode(array(
        'success' => false,
        'error' => 'Reembolso Virtual Pay: ' . $detail,
        'debug' => array('http_code' => $httpCode, 'response_preview' => substr($response, 0, 300))
    ));
    exit;
}

// ===================== TESTE =====================
if ($action === 'test') {
    echo json_encode(array(
        'success' => true, 
        'message' => 'Virtual Pay API v2 backend funcionando', 
        'base_url' => $VPAY_BASE_URL,
        'auth_method' => 'x-client-id + x-client-secret headers'
    ));
    exit;
}

echo json_encode(array('success' => false, 'error' => 'Ação não reconhecida: ' . $action));