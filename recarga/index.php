<?php
/**
 * Recarga Router - Versão Simples SEM .htaccess
 * 
 * Esta solução não depende de .htaccess
 * Basta acessar: https://seu-site.com/recarga/
 * 
 * O arquivo recarga.html já terá os caminhos corrigidos com /
 */

// Servir o arquivo recarga.html corrigido
$recargaFile = dirname(__DIR__) . '/recarga.html';

if (!file_exists($recargaFile)) {
    http_response_code(404);
    die('Arquivo recarga.html não encontrado');
}

// Headers para evitar cache
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Servir o arquivo
readfile($recargaFile);
?>