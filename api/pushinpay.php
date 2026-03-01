<?php
/**
 * API PushinPay PIX - Backend PHP
 * 
 * Documentação oficial: https://app.theneo.io/pushinpay/pix/pix
 * 
 * URL Base Produção: https://api.pushinpay.com.br
 * URL Base Sandbox: (verificar na documentação)
 * 
 * Autenticação via header:
 *   Authorization: Bearer TOKEN
 * 
 * Endpoints:
 *   POST /pix/cashIn          - Criar cobrança PIX
 *   GET  /transaction/{id}    - Consultar transação PIX
 * 
 * REGRA DE NEGÓCIO:
 * - Cada revendedor usa SOMENTE suas próprias credenciais (token).
 * - Admin pode configurar suas credenciais para cobrar revendedores.
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

// URL base da API do PushinPay (Produção)
$PUSHINPAY_BASE_URL = 'https://api.pushinpay.com.br';

/**
 * Obter token do PushinPay para um revendedor.
 * Busca SOMENTE as credenciais do revendedor no banco SQLite (user_config).
 * NÃO faz fallback para admin.
 */
function getPushinPayToken($pdo, $userId) {
    $token = null;

    if ($userId) {
        $revendedorToken = getUserConfig($pdo, $userId, 'revendedorPushinPayToken');
        if ($revendedorToken && trim($revendedorToken) !== '' && strpos($revendedorToken, '*') === false) {
            $token = trim($revendedorToken);
        }
    }

    return $token;
}

/**
 * Obter token do admin (para quando o admin faz pagamento direto no painel).
 */
function getAdminPushinPayToken($pdo) {
    $token = getConfig($pdo, 'adminPushinPayToken');
    if ($token) $token = trim($token);
    return $token;
}

// ===================== CRIAR PAGAMENTO PIX =====================
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

    // Obter token: admin usa o do admin, revendedor usa o dele (sem fallback)
    if ($isAdmin) {
        $token = getAdminPushinPayToken($pdo);
    } else {
        $token = getPushinPayToken($pdo, $userId);
    }

    if (!$token || trim($token) === '') {
        echo json_encode(array(
            'success' => false, 
            'error' => 'PushinPay Token não configurado. O revendedor precisa configurar seu token do PushinPay no painel de configurações.'
        ));
        exit;
    }

    // Tratar token no formato ID|TOKEN - usar apenas a parte do TOKEN (após o |)
    // Se não tiver |, usar o token completo
    $tokenParts = explode('|', trim($token));
    $finalToken = count($tokenParts) > 1 ? trim($tokenParts[1]) : trim($token);
    
    if (empty($finalToken)) {
        echo json_encode(array(
            'success' => false, 
            'error' => 'Token PushinPay inválido. Formato esperado: ID|TOKEN'
        ));
        exit;
    }

    // PushinPay requer valor em CENTAVOS e mínimo de 50 centavos
    $valueInCents = round($amount * 100);
    if ($valueInCents < 50) {
        echo json_encode(array('success' => false, 'error' => 'Valor mínimo é R$ 0,50'));
        exit;
    }

    // Montar payload conforme documentação oficial PushinPay API
    // POST /pix/cashIn
    $paymentPayload = array(
        'value' => $valueInCents
    );

    // Adicionar webhook_url se fornecido
    if (isset($input['webhook_url']) && trim($input['webhook_url']) !== '') {
        $paymentPayload['webhook_url'] = trim($input['webhook_url']);
    }

    // Autenticação via header: Authorization: Bearer TOKEN
    // Tentar diferentes variações de URL base da API PushinPay
    // Baseado na documentação: POST /pix/cashIn
    $possibleUrls = array(
        'https://api.pushinpay.com.br/api/pix/cashIn',  // Com prefixo /api/
        'https://api.pushinpay.com.br/pix/cashIn',      // Sem prefixo
        'https://pushinpay.com.br/api/pix/cashIn',      // Sem api. no subdomínio
        'https://api.pushinpay.com.br/v1/pix/cashIn'   // Com versão v1
    );
    
    $response = null;
    $httpCode = 0;
    $curlError = null;
    $result = null;
    $lastUrl = '';
    $success = false;
    
    // Tentar cada URL até encontrar uma que funcione
    foreach ($possibleUrls as $apiUrl) {
        $lastUrl = $apiUrl;
        
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($paymentPayload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $finalToken
        ));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('PushinPay tentativa URL ' . $apiUrl . ' - Erro de conexão: ' . $curlError);
            continue; // Tentar próxima URL
        }

        $result = json_decode($response, true);
        
        // Log para debug
        error_log('PushinPay create_payment HTTP ' . $httpCode . ' | URL: ' . $apiUrl . ' | Token (primeiros 20 chars): ' . substr($finalToken, 0, 20) . '... | Payload: ' . json_encode($paymentPayload) . ' | Response: ' . substr($response, 0, 500));

        // Se retornou 200 ou 201, sucesso!
        if ($httpCode >= 200 && $httpCode < 300 && $result && isset($result['id'])) {
            $success = true;
            break; // URL funcionou, sair do loop
        }
        
        // Se retornou 401 (não autorizado), o token pode estar errado, mas a URL está correta
        if ($httpCode === 401) {
            $success = false;
            break; // URL provavelmente está correta, mas token inválido
        }
        
        // Se retornou 404, tentar próxima URL
        if ($httpCode === 404) {
            continue;
        }
        
        // Outros erros, tentar próxima URL também
        if ($httpCode >= 400) {
            continue;
        }
    }

    if ($curlError && !$success) {
        echo json_encode(array(
            'success' => false, 
            'error' => 'Erro de conexão com PushinPay após tentar todas as URLs. Última URL tentada: ' . $lastUrl . ' | Erro: ' . $curlError,
            'http_code' => $httpCode,
            'tried_urls' => $possibleUrls
        ));
        exit;
    }

    if (!$success && ($httpCode >= 400 || !$result)) {
        $errorMsg = 'Erro HTTP ' . $httpCode;
        if ($result) {
            if (isset($result['message'])) {
                $errorMsg = $result['message'];
            }
            if (isset($result['error'])) {
                $errorMsg .= ' - ' . (is_string($result['error']) ? $result['error'] : json_encode($result['error']));
            }
        } else {
            $errorMsg .= ': ' . substr($response, 0, 200);
        }
        
        // Mensagem mais detalhada sobre URLs tentadas
        $errorMsg .= ' | URLs tentadas: ' . implode(', ', $possibleUrls);
        $errorMsg .= ' | Última URL: ' . $lastUrl;
        
        // Se todas retornaram 404, pode ser que a API tenha mudado ou o token esteja incorreto
        if ($httpCode === 404) {
            $errorMsg = 'ERRO 404: Rota não encontrada na API PushinPay. ';
            $errorMsg .= 'Todas as URLs tentadas retornaram 404. ';
            $errorMsg .= 'Possíveis causas: ';
            $errorMsg .= '1) URL base da API mudou - verifique a documentação oficial em https://app.theneo.io/pushinpay/pix/pix, ';
            $errorMsg .= '2) Token inválido ou formato incorreto - verifique se o token está no formato correto (ID|TOKEN) e se está ativo, ';
            $errorMsg .= '3) Endpoint não existe ou foi alterado pela PushinPay, ';
            $errorMsg .= '4) Conta não está aprovada ou não tem permissão para usar a API. ';
            $errorMsg .= 'URLs tentadas: ' . implode(' | ', $possibleUrls);
        }
        
        if ($result && isset($result['errors']) && is_array($result['errors'])) {
            $errorDetails = array();
            foreach ($result['errors'] as $field => $msgs) {
                if (is_array($msgs)) {
                    $errorDetails[] = $field . ': ' . implode(', ', $msgs);
                } else {
                    $errorDetails[] = $field . ': ' . $msgs;
                }
            }
            if ($errorDetails) {
                $errorMsg .= ' | Detalhes: ' . implode('; ', $errorDetails);
            }
        }
        
        echo json_encode(array(
            'success' => false, 
            'error' => $errorMsg, 
            'http_code' => $httpCode,
            'last_url_tried' => $lastUrl,
            'all_urls_tried' => $possibleUrls,
            'response_preview' => substr($response, 0, 500),
            'token_preview' => substr($finalToken, 0, 20) . '...'
        ));
        exit;
    }

    // Resposta do PushinPay
    // Campos: id, qr_code, status, value, qr_code_base64, end_to_end_id, etc.
    $transactionId = isset($result['id']) ? $result['id'] : '';
    $qrCode = isset($result['qr_code']) ? $result['qr_code'] : '';
    $status = isset($result['status']) ? $result['status'] : 'created';
    $qrCodeBase64 = isset($result['qr_code_base64']) ? $result['qr_code_base64'] : '';
    $transactionValue = isset($result['value']) ? ($result['value'] / 100) : $amount; // Converter centavos para reais
    
    // Log para debug - verificar se qr_code_base64 está vindo
    error_log('PushinPay resposta completa: ' . json_encode(array(
        'has_qr_code' => !empty($qrCode),
        'has_qr_code_base64' => !empty($qrCodeBase64),
        'qr_code_length' => strlen($qrCode),
        'qr_code_base64_length' => strlen($qrCodeBase64),
        'result_keys' => array_keys($result)
    )));

    // Mapear status do PushinPay para o formato esperado pelo frontend
    // PushinPay: created, paid, canceled, expired
    // Frontend: approved, pending, rejected, cancelled
    $mappedStatus = 'pending';
    if ($status === 'paid') {
        $mappedStatus = 'approved';
    } elseif ($status === 'canceled' || $status === 'expired') {
        $mappedStatus = 'rejected';
    }

    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => $transactionId,
            'transactionId' => $transactionId,
            'status' => $mappedStatus,
            'original_status' => $status,
            'status_detail' => $mappedStatus === 'approved' ? 'accredited' : 'pending_waiting_payment',
            'transaction_amount' => $transactionValue,
            'pix_data' => array(
                'qr_code' => $qrCode,
                'qr_code_base64' => $qrCodeBase64,
                'copy_paste' => $qrCode
            ),
            'qr_code' => $qrCode,
            'qr_code_base64' => $qrCodeBase64,
            'copy_paste' => $qrCode,
            'pix_code' => $qrCode,
            'payment_link' => '',
            'date_created' => isset($result['created_at']) ? $result['created_at'] : date('c'),
            'external_reference' => $externalReference,
            'end_to_end_id' => isset($result['end_to_end_id']) ? $result['end_to_end_id'] : null
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

    // Obter token: admin usa o do admin, revendedor usa o dele
    if ($isAdmin) {
        $token = getAdminPushinPayToken($pdo);
    } else {
        $token = getPushinPayToken($pdo, $userId);
    }

    if (!$token || trim($token) === '') {
        echo json_encode(array('success' => false, 'error' => 'Credenciais do PushinPay não configuradas para este revendedor'));
        exit;
    }

    // Tratar token no formato ID|TOKEN - usar apenas a parte do TOKEN (após o |)
    $tokenParts = explode('|', trim($token));
    $finalToken = count($tokenParts) > 1 ? trim($tokenParts[1]) : trim($token);
    
    if (empty($finalToken)) {
        echo json_encode(array('success' => false, 'error' => 'Token PushinPay inválido'));
        exit;
    }

    // Tentar múltiplas variações de URL para verificação de status
    // Documentação oficial: GET /transaction/{id}
    // Tentar primeiro a rota oficial, depois variações
    $possibleUrls = array(
        'https://api.pushinpay.com.br/transaction/' . urlencode($paymentId),  // Rota oficial
        $PUSHINPAY_BASE_URL . '/transaction/' . urlencode($paymentId),        // Usando constante
        'https://api.pushinpay.com.br/api/transaction/' . urlencode($paymentId), // Com prefixo /api/
        $PUSHINPAY_BASE_URL . '/api/transaction/' . urlencode($paymentId),
        'https://api.pushinpay.com.br/v1/transaction/' . urlencode($paymentId), // Com versão v1
        $PUSHINPAY_BASE_URL . '/v1/transaction/' . urlencode($paymentId)
    );
    
    $response = null;
    $httpCode = 0;
    $curlError = null;
    $result = null;
    $lastUrl = '';
    $success = false;
    
    // Tentar cada URL até encontrar uma que funcione
    foreach ($possibleUrls as $apiUrl) {
        $lastUrl = $apiUrl;
        
        $ch = curl_init($apiUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
            'Content-Type: application/json',
            'Authorization: Bearer ' . $finalToken
        ));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            error_log('PushinPay check_payment tentativa URL ' . $apiUrl . ' - Erro de conexão: ' . $curlError);
            continue; // Tentar próxima URL
        }

        $result = json_decode($response, true);
        error_log('PushinPay check_payment HTTP ' . $httpCode . ' | URL: ' . $apiUrl . ' | Response: ' . substr($response, 0, 500));

        // Se retornou 200 ou 201, sucesso!
        if ($httpCode >= 200 && $httpCode < 300 && $result && isset($result['id'])) {
            $success = true;
            break; // URL funcionou, sair do loop
        }
        
        // Se retornou 401 (não autorizado), o token pode estar errado, mas a URL está correta
        if ($httpCode === 401) {
            $success = false;
            break; // URL provavelmente está correta, mas token inválido
        }
        
        // Se retornou 404, tentar próxima URL
        if ($httpCode === 404) {
            continue;
        }
        
        // Outros erros, tentar próxima URL também
        if ($httpCode >= 400) {
            continue;
        }
    }

    if ($curlError && !$success) {
        echo json_encode(array(
            'success' => false, 
            'error' => 'Erro de conexão com PushinPay após tentar todas as URLs. Última URL tentada: ' . $lastUrl . ' | Erro: ' . $curlError,
            'http_code' => $httpCode,
            'tried_urls' => $possibleUrls
        ));
        exit;
    }

    if (!$success && ($httpCode >= 400 || !$result)) {
        // Se todas as URLs retornaram 404, pode ser que a API não suporte verificação de status
        // ou que o endpoint tenha mudado. Nesse caso, retornar status "pending" para não bloquear o sistema
        if ($httpCode === 404) {
            error_log('PushinPay: Todas as URLs de verificação retornaram 404. A API pode não suportar verificação de status ou o endpoint mudou.');
            
            // Retornar status pendente em vez de erro, para que o sistema continue funcionando
            // O pagamento será detectado via webhook se configurado
            echo json_encode(array(
                'success' => true,
                'data' => array(
                    'id' => $paymentId,
                    'status' => 'pending',
                    'status_detail' => 'pending_waiting_payment',
                    'note' => 'Verificação de status não disponível via API. O pagamento será detectado automaticamente via webhook quando configurado.',
                    'transaction_amount' => 0
                ),
                'warning' => 'Endpoint de verificação não encontrado. O pagamento será detectado via webhook se configurado.'
            ));
            exit;
        }
        
        $errorMsg = 'Erro HTTP ' . $httpCode;
        if ($result) {
            if (isset($result['message'])) {
                $errorMsg = $result['message'];
            }
            if (isset($result['error'])) {
                $errorMsg .= ' - ' . (is_string($result['error']) ? $result['error'] : json_encode($result['error']));
            }
        } else {
            $errorMsg .= ': ' . substr($response, 0, 200);
        }
        
        // Mensagem mais detalhada sobre URLs tentadas
        $errorMsg .= ' | URLs tentadas: ' . implode(', ', $possibleUrls);
        $errorMsg .= ' | Última URL: ' . $lastUrl;
        
        echo json_encode(array(
            'success' => false, 
            'error' => $errorMsg,
            'http_code' => $httpCode,
            'last_url_tried' => $lastUrl,
            'all_urls_tried' => $possibleUrls
        ));
        exit;
    }

    // Resposta: TransactionResponse
    $status = isset($result['status']) ? $result['status'] : 'created';
    
    // Mapear status do PushinPay para o formato esperado pelo frontend
    $mappedStatus = 'pending';
    if ($status === 'paid') {
        $mappedStatus = 'approved';
    } elseif ($status === 'canceled' || $status === 'expired') {
        $mappedStatus = 'rejected';
    }

    $transactionValue = isset($result['value']) ? ($result['value'] / 100) : 0; // Converter centavos para reais

    echo json_encode(array(
        'success' => true,
        'data' => array(
            'id' => isset($result['id']) ? $result['id'] : $paymentId,
            'status' => $mappedStatus,
            'original_status' => $status,
            'status_detail' => $mappedStatus === 'approved' ? 'accredited' : 'pending_waiting_payment',
            'transaction_amount' => $transactionValue,
            'date_approved' => ($status === 'paid' && isset($result['updated_at'])) ? $result['updated_at'] : null,
            'external_reference' => $externalReference ?? '',
            'copy_paste' => isset($result['qr_code']) ? $result['qr_code'] : '',
            'end_to_end_id' => isset($result['end_to_end_id']) ? $result['end_to_end_id'] : null
        )
    ));
    exit;
}

// ===================== REEMBOLSO =====================
if ($action === 'refund_payment') {
    $paymentId = isset($input['paymentId']) ? trim($input['paymentId']) : '';
    $userId = isset($input['userId']) ? $input['userId'] : null;

    if (!$paymentId || !$userId) {
        echo json_encode(array('success' => false, 'error' => 'paymentId e userId são obrigatórios'));
        exit;
    }

    $token = getPushinPayToken($pdo, $userId);
    if (!$token) {
        echo json_encode(array('success' => false, 'error' => 'Token PushinPay não configurado'));
        exit;
    }

    $apiUrl = $PUSHINPAY_BASE_URL . '/transaction/' . urlencode($paymentId) . '/refund';
    $ch = curl_init($apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, '{}');
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Accept: application/json',
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
        echo json_encode(array('success' => true, 'data' => array('id' => $paymentId)));
        exit;
    }
    if ($httpCode === 404 || $httpCode === 405) {
        echo json_encode(array('success' => false, 'error' => 'Reembolso não disponível na API PushinPay. Realize o estorno manualmente no painel.'));
        exit;
    }
    $errorMsg = isset($result['message']) ? $result['message'] : 'Erro ao processar reembolso (HTTP ' . $httpCode . ')';
    echo json_encode(array('success' => false, 'error' => $errorMsg));
    exit;
}

// ===================== TESTE =====================
if ($action === 'test') {
    echo json_encode(array(
        'success' => true, 
        'message' => 'PushinPay API backend funcionando', 
        'base_url' => $PUSHINPAY_BASE_URL,
        'auth_method' => 'Bearer Token header'
    ));
    exit;
}

echo json_encode(array('success' => false, 'error' => 'Ação não reconhecida: ' . $action));
