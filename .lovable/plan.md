

# Dados Avançados — Exibição Completa no Antifraude

## Problema Identificado
A seção "Dados Avançados" existe no código, mas os campos só aparecem se tiverem valor (`connectionType && ...`). Fingerprints coletados antes da atualização do sistema têm `raw_data` vazio ou com poucos campos, então nada aparece. Além disso, vários campos coletados pelo fingerprint (como `mathHash`, `intlHash`, `voicesHash`, `windowSize`, `doNotTrack`, etc.) nem sequer têm renderização na UI.

## Solução

### 1. Mostrar TODOS os campos do raw_data automaticamente
Em vez de listar cada campo manualmente com condicional, iterar sobre todas as chaves de `raw_data` e exibir todas em um grid organizado por categorias:

- **Conexão**: connectionType, connectionDownlink, connectionRtt, connectionSaveData
- **Tela/Janela**: screenOrientation, windowSize, availScreen, outerSize, screenIsExtended
- **Hardware**: batteryLevel, batteryCharging, audioInputDevices, videoInputDevices, audioOutputDevices, storageQuota, storageUsage, jsHeapSizeLimit
- **Fingerprints avançados**: audioHash, fontHash, mathHash, intlHash, voicesHash, webglExtensionsHash, webglParams, webglVendor
- **Privacidade/Bot**: adBlockerDetected, webdriver, doNotTrack, cookieEnabled, pdfViewerEnabled
- **Navegador**: languages, uaBrands, uaMobile, uaPlatform, timezoneOffset

### 2. Adicionar botão "Ver JSON completo"
Um botão expansível que mostra o `raw_data` completo em formato JSON formatado, para análise forense detalhada.

### 3. Atualizar interface `FingerprintRecord`
Adicionar `raw_data: Record<string, any> | null` ao tipo para eliminar os casts `(fp as any)`.

### Arquivos alterados
- `src/components/AntifraudSection.tsx` — reorganizar seção de dados avançados com categorias, iteração automática e visualizador JSON

