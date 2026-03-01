<?php
/**
 * Teste de configuração do PHP para Mercado Pago
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$tests = [];

// Verificar cURL
$tests['curl_enabled'] = function_exists('curl_init');

// Verificar JSON
$tests['json_enabled'] = function_exists('json_encode');

// Verificar versão do PHP
$tests['php_version'] = PHP_VERSION;

// Testar conexão com a API do Mercado Pago
if ($tests['curl_enabled']) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://api.mercadopago.com');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_NOBODY, true);
    
    curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    $tests['mercadopago_connection'] = [
        'success' => $httpCode > 0 && empty($error),
        'http_code' => $httpCode,
        'error' => $error ?: null
    ];
} else {
    $tests['mercadopago_connection'] = [
        'success' => false,
        'error' => 'cURL não habilitado'
    ];
}

// Resultado
$allPassed = $tests['curl_enabled'] && $tests['json_enabled'] && $tests['mercadopago_connection']['success'];

echo json_encode([
    'success' => $allPassed,
    'message' => $allPassed ? 'Tudo OK! O sistema está pronto para usar o Mercado Pago.' : 'Alguns testes falharam. Verifique os detalhes.',
    'tests' => $tests
], JSON_PRETTY_PRINT);
