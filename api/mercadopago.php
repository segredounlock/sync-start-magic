<?php
/**
 * API Mercado Pago - Backend PHP para criar e verificar pagamentos PIX
 * Busca token APENAS do REVENDEDOR
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

// Função para obter token do revendedor
function getRevendedorToken($pdo, $userId) {
    if (!$userId) return null;
    
    $modo = getUserConfig($pdo, $userId, 'revendedorMercadoPagoModo');
    if (!$modo) $modo = 'prod';
    
    if ($modo === 'test') {
        return getUserConfig($pdo, $userId, 'revendedorMercadoPagoKeyTest');
    } else {
        return getUserConfig($pdo, $userId, 'revendedorMercadoPagoKeyProd');
    }
}

// Criar PIX
if ($action === 'create_pix') {
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0;
    $description = isset($input['description']) ? $input['description'] : 'Recarga';
    $email = isset($input['email']) ? $input['email'] : 'cliente@email.com';
    $firstName = isset($input['firstName']) ? $input['firstName'] : 'Cliente';
    $lastName = isset($input['lastName']) ? $input['lastName'] : 'Recarga';
    $externalReference = isset($input['externalReference']) ? $input['externalReference'] : 'REF_' . time();
    $userId = isset($input['userId']) ? $input['userId'] : null;
    
    if (!$userId) {
        echo json_encode(array('success' => false, 'error' => 'Revendedor não identificado'));
        exit;
    }
    
    if ($amount <= 0) {
        echo json_encode(array('success' => false, 'error' => 'Valor inválido'));
        exit;
    }
    
    $token = getRevendedorToken($pdo, $userId);
    if (!$token) {
        echo json_encode(array('success' => false, 'error' => 'Token do Mercado Pago não configurado pelo revendedor'));
        exit;
    }
    
    $paymentData = array(
        'transaction_amount' => $amount,
        'description' => $description,
        'payment_method_id' => 'pix',
        'payer' => array(
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName
        ),
        'external_reference' => $externalReference
    );
    
    $ch = curl_init('https://api.mercadopago.com/v1/payments');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token,
        'X-Idempotency-Key: ' . uniqid('mp_', true)
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        echo json_encode(array('success' => false, 'error' => 'Erro de conexão: ' . $curlError));
        exit;
    }
    
    $result = json_decode($response, true);
    
    if ($httpCode >= 400 || isset($result['error'])) {
        $errorMsg = isset($result['message']) ? $result['message'] : 'Erro ao criar pagamento';
        echo json_encode(array('success' => false, 'error' => $errorMsg));
        exit;
    }
    
    $pixData = isset($result['point_of_interaction']['transaction_data']) ? $result['point_of_interaction']['transaction_data'] : array();
    
    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => $result['id'],
            'status' => $result['status'],
            'status_detail' => isset($result['status_detail']) ? $result['status_detail'] : '',
            'transaction_amount' => $result['transaction_amount'],
            'point_of_interaction' => array(
                'transaction_data' => array(
                    'qr_code' => isset($pixData['qr_code']) ? $pixData['qr_code'] : '',
                    'qr_code_base64' => isset($pixData['qr_code_base64']) ? $pixData['qr_code_base64'] : '',
                    'ticket_url' => isset($pixData['ticket_url']) ? $pixData['ticket_url'] : ''
                )
            ),
            'date_created' => isset($result['date_created']) ? $result['date_created'] : '',
            'external_reference' => isset($result['external_reference']) ? $result['external_reference'] : ''
        )
    ));
    exit;
}

// Verificar pagamento
if ($action === 'check_payment') {
    $paymentId = isset($_GET['payment_id']) ? $_GET['payment_id'] : '';
    $userId = isset($_GET['userId']) ? $_GET['userId'] : null;
    
    if (!$paymentId) {
        echo json_encode(array('success' => false, 'error' => 'ID do pagamento não informado'));
        exit;
    }
    
    if (!$userId) {
        echo json_encode(array('success' => false, 'error' => 'Revendedor não identificado'));
        exit;
    }
    
    $token = getRevendedorToken($pdo, $userId);
    if (!$token) {
        echo json_encode(array('success' => false, 'error' => 'Token não configurado'));
        exit;
    }
    
    $ch = curl_init('https://api.mercadopago.com/v1/payments/' . urlencode($paymentId));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array('Authorization: Bearer ' . $token));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if ($httpCode >= 400 || isset($result['error'])) {
        $errorMsg = isset($result['message']) ? $result['message'] : 'Erro ao verificar pagamento';
        echo json_encode(array('success' => false, 'error' => $errorMsg));
        exit;
    }
    
    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => $result['id'],
            'status' => $result['status'],
            'status_detail' => isset($result['status_detail']) ? $result['status_detail'] : '',
            'transaction_amount' => isset($result['transaction_amount']) ? $result['transaction_amount'] : 0,
            'date_approved' => isset($result['date_approved']) ? $result['date_approved'] : null,
            'external_reference' => isset($result['external_reference']) ? $result['external_reference'] : ''
        )
    ));
    exit;
}

// Reembolso (refund) - usado quando a recarga é cancelada
if ($action === 'refund_payment') {
    $paymentId = isset($input['paymentId']) ? trim($input['paymentId']) : '';
    $userId = isset($input['userId']) ? $input['userId'] : null;
    $amount = isset($input['amount']) ? floatval($input['amount']) : 0;

    if (!$paymentId || !$userId) {
        echo json_encode(array('success' => false, 'error' => 'paymentId e userId são obrigatórios'));
        exit;
    }

    $token = getRevendedorToken($pdo, $userId);
    if (!$token) {
        echo json_encode(array('success' => false, 'error' => 'Token do Mercado Pago não configurado'));
        exit;
    }

    $body = $amount > 0 ? json_encode(array('amount' => $amount)) : '{}';
    $ch = curl_init('https://api.mercadopago.com/v1/payments/' . urlencode($paymentId) . '/refunds');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    if ($curlError) {
        echo json_encode(array('success' => false, 'error' => 'Erro de conexão: ' . $curlError));
        exit;
    }

    $result = json_decode($response, true);
    if ($httpCode >= 200 && $httpCode < 300) {
        echo json_encode(array('success' => true, 'data' => array('id' => $result['id'] ?? $paymentId)));
        exit;
    }
    $errorMsg = isset($result['message']) ? $result['message'] : 'Erro ao processar reembolso';
    echo json_encode(array('success' => false, 'error' => $errorMsg));
    exit;
}

echo json_encode(array('success' => false, 'error' => 'Ação não reconhecida: ' . $action));
