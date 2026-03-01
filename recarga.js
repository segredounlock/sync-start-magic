// Recarga Public Page Logic
class RecargaPublic {
    constructor() {
        this.api = api;
        this.db = db;
        this.catalog = [];
        this.selectedCarrier = null;
        this.selectedValue = null;
        this.selectedPhone = '';
        this.currentStep = 1;
        this.revendedorId = null; // ID do revendedor que está vendendo
        this.currentPaymentId = null;
        this.currentPaymentEmail = null;
        this.pixCheckInterval = null;
        this.statusCheckInterval = null; // Polling até status "feita"
        this._rechargeProcessing = false; // Flag para evitar processamento duplicado
        this.siteTitle = 'Recarga Express';
        this.init();
    }

    async init() {
        await this.db.init();
        await this.loadApiConfig();
        this.checkRevendedor();
        await this.loadRevendedorConfig();

        // Se a URL tiver pedido= (ou id=), exibir apenas a view de status (link fixo)
        const urlParams = new URLSearchParams(window.location.search);
        const pedidoId = urlParams.get('pedido') || urlParams.get('id');
        if (pedidoId && this.revendedorId) {
            await this.loadStatusView(pedidoId);
            return;
        }

        this.setupEventListeners();
        await this.checkMinimumBalance();
        this.loadCatalog();
        if (this.revendedorId) {
            await this.loadAndDisplayFloatingContacts();
        }
    }

    async loadApiConfig() {
        try {
            // SEMPRE carregar do servidor primeiro (fonte da verdade)
            // Isso garante que funciona em modo anônimo e outras sessões
            // Usar caminho absoluto para funcionar de qualquer lugar
            const r = await fetch('/api/data.php?action=config_get');
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                
                // API Key e Base URL
                if (c.adminApiKey) {
                    // Não sobrescrever com valor mascarado "********"
                    if (!String(c.adminApiKey).includes('*')) {
                        this.api.setApiKey(c.adminApiKey);
                        localStorage.setItem('adminApiKey', c.adminApiKey);
                    }
                }
                if (c.adminApiBaseURL) {
                    this.api.setBaseURL(c.adminApiBaseURL);
                    localStorage.setItem('adminApiBaseURL', c.adminApiBaseURL);
                }
                
                // Configurações do Mercado Pago (para pagamentos PIX)
                if (c.adminMercadoPagoModo !== undefined && c.adminMercadoPagoModo !== null) {
                    const modo = (c.adminMercadoPagoModo === 'test' || c.adminMercadoPagoModo === 'prod') ? c.adminMercadoPagoModo : 'prod';
                    localStorage.setItem('adminMercadoPagoModo', modo);
                }
                // Chaves sensíveis: manter localStorage se servidor retornar mascarado
                if (c.adminMercadoPagoKeyTest !== undefined && c.adminMercadoPagoKeyTest !== null) {
                    if (!c.adminMercadoPagoKeyTest.includes('*') && c.adminMercadoPagoKeyTest !== '') {
                        localStorage.setItem('adminMercadoPagoKeyTest', c.adminMercadoPagoKeyTest);
                    }
                }
                if (c.adminMercadoPagoKeyProd !== undefined && c.adminMercadoPagoKeyProd !== null) {
                    if (!c.adminMercadoPagoKeyProd.includes('*') && c.adminMercadoPagoKeyProd !== '') {
                        localStorage.setItem('adminMercadoPagoKeyProd', c.adminMercadoPagoKeyProd);
                    }
                }
                // Configurações do Virtual Pay: manter localStorage se servidor retornar mascarado
                if (c.adminVirtualPayClientId !== undefined && c.adminVirtualPayClientId !== null) {
                    if (!c.adminVirtualPayClientId.includes('*') && c.adminVirtualPayClientId !== '') {
                        localStorage.setItem('adminVirtualPayClientId', c.adminVirtualPayClientId);
                    }
                }
                if (c.adminVirtualPayClientSecret !== undefined && c.adminVirtualPayClientSecret !== null) {
                    if (!c.adminVirtualPayClientSecret.includes('*') && c.adminVirtualPayClientSecret !== '') {
                        localStorage.setItem('adminVirtualPayClientSecret', c.adminVirtualPayClientSecret);
                    }
                }
                // Módulo de pagamento selecionado (admin - fallback)
                if (c.adminPaymentModule !== undefined && c.adminPaymentModule !== null) {
                    const paymentModule = (c.adminPaymentModule === 'mercadopago' || c.adminPaymentModule === 'virtualpay' || c.adminPaymentModule === 'pushinpay') ? c.adminPaymentModule : 'mercadopago';
                    localStorage.setItem('adminPaymentModule', paymentModule);
                } else {
                    localStorage.setItem('adminPaymentModule', 'mercadopago'); // Padrão
                }
                // Nome do sistema (personalização)
                if (c.siteTitle !== undefined && c.siteTitle !== null && String(c.siteTitle).trim() !== '') {
                    this.siteTitle = String(c.siteTitle).trim();
                    document.title = this.siteTitle + ' - Recarga de Celular';
                    const logoText = document.querySelector('.recarga-logo .logo-text');
                    if (logoText) logoText.textContent = this.siteTitle;
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações do servidor:', e);
            // Fallback para localStorage se o servidor falhar
            const apiKey = localStorage.getItem('adminApiKey') || '';
            const baseURL = localStorage.getItem('adminApiBaseURL') || '';
            if (apiKey && baseURL) {
                this.api.setApiKey(apiKey);
                this.api.setBaseURL(baseURL);
            }
        }
    }

    // Carregar configurações específicas do revendedor do servidor
    async loadRevendedorConfig() {
        if (!this.revendedorId) return;
        
        try {
            const r = await fetch(`/api/data.php?action=user_config_get&userId=${encodeURIComponent(this.revendedorId)}`);
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                
                // Módulo de pagamento do revendedor (prioridade sobre admin)
                if (c.revendedorPaymentModule && (c.revendedorPaymentModule === 'mercadopago' || c.revendedorPaymentModule === 'virtualpay' || c.revendedorPaymentModule === 'pushinpay')) {
                    this.revendedorPaymentModule = c.revendedorPaymentModule;
                    localStorage.setItem(`revendedorPaymentModule_${this.revendedorId}`, c.revendedorPaymentModule);
                    console.log(`✅ Módulo de pagamento do revendedor carregado do servidor: ${c.revendedorPaymentModule}`);
                } else {
                    console.log(`⚠️ Módulo de pagamento do revendedor não configurado ou inválido. Valor recebido: ${c.revendedorPaymentModule}`);
                }
                
                // Credenciais Virtual Pay do revendedor (salvar no localStorage se não mascaradas)
                if (c.revendedorVirtualPayClientId && !c.revendedorVirtualPayClientId.includes('*')) {
                    localStorage.setItem(`revendedorVirtualPayClientId_${this.revendedorId}`, c.revendedorVirtualPayClientId);
                    console.log('Virtual Pay Client ID do revendedor carregado do servidor');
                }
                if (c.revendedorVirtualPayClientSecret && !c.revendedorVirtualPayClientSecret.includes('*')) {
                    localStorage.setItem(`revendedorVirtualPayClientSecret_${this.revendedorId}`, c.revendedorVirtualPayClientSecret);
                    console.log('Virtual Pay Client Secret do revendedor carregado do servidor');
                }
                
                // Credenciais PushinPay do revendedor (salvar no localStorage se não mascaradas)
                if (c.revendedorPushinPayToken && !c.revendedorPushinPayToken.includes('*')) {
                    localStorage.setItem(`revendedorPushinPayToken_${this.revendedorId}`, c.revendedorPushinPayToken);
                    console.log('PushinPay Token do revendedor carregado do servidor');
                }
                
                // Credenciais Mercado Pago do revendedor
                if (c.revendedorMercadoPagoModo) {
                    localStorage.setItem(`revendedorMercadoPagoModo_${this.revendedorId}`, c.revendedorMercadoPagoModo);
                }
                if (c.revendedorMercadoPagoKeyTest && !c.revendedorMercadoPagoKeyTest.includes('*')) {
                    localStorage.setItem(`revendedorMercadoPagoKeyTest_${this.revendedorId}`, c.revendedorMercadoPagoKeyTest);
                }
                if (c.revendedorMercadoPagoKeyProd && !c.revendedorMercadoPagoKeyProd.includes('*')) {
                    localStorage.setItem(`revendedorMercadoPagoKeyProd_${this.revendedorId}`, c.revendedorMercadoPagoKeyProd);
                }
                
                // Contatos do revendedor
                if (c.revendedorTelegramUsername) {
                    localStorage.setItem(`revendedorTelegramUsername_${this.revendedorId}`, c.revendedorTelegramUsername);
                }
                if (c.revendedorWhatsAppNumber) {
                    localStorage.setItem(`revendedorWhatsAppNumber_${this.revendedorId}`, c.revendedorWhatsAppNumber);
                }

                // Nome da página do revendedor (personalização por revendedor)
                if (c.revendedorSiteTitle !== undefined && c.revendedorSiteTitle !== null && String(c.revendedorSiteTitle).trim() !== '') {
                    this.siteTitle = String(c.revendedorSiteTitle).trim();
                    document.title = this.siteTitle + ' - Recarga de Celular';
                    const logoText = document.querySelector('.recarga-logo .logo-text');
                    if (logoText) logoText.textContent = this.siteTitle;
                }

                // Primeira tela do link 100% editável (cores + textos)
                if (typeof c.revendedorLandingConfig === 'string' && c.revendedorLandingConfig) {
                    try {
                        const landing = JSON.parse(c.revendedorLandingConfig);
                        if (landing && typeof landing === 'object') {
                            const def = {
                                title: 'Recarga de Celular',
                                titleAccent: 'na Hora',
                                subtitle: 'Escolha sua operadora, o valor e pague via PIX. Aprovação imediata, sem complicação.',
                                buttonText: 'Fazer recarga agora',
                                pill1: '📱 Todas as operadoras',
                                pill2: '💳 PIX instantâneo',
                                pill3: '💰 A partir de R$ 5',
                                primaryColor: '#0f172a',
                                accentColor: '#f59e0b'
                            };
                            const root = document.querySelector('.recarga-page') || document.documentElement;
                            if (landing.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(landing.primaryColor)) {
                                root.style.setProperty('--recarga-primary', landing.primaryColor);
                            }
                            if (landing.accentColor && /^#[0-9A-Fa-f]{6}$/.test(landing.accentColor)) {
                                root.style.setProperty('--recarga-accent', landing.accentColor);
                                root.style.setProperty('--recarga-accent-2', landing.accentColor);
                            }
                            const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text || ''; };
                            setText('landingTitle', landing.title || def.title);
                            setText('landingTitleAccent', landing.titleAccent || def.titleAccent);
                            setText('landingDesc', landing.subtitle || def.subtitle);
                            setText('landingBtnText', landing.buttonText || def.buttonText);
                            setText('landingPill1', landing.pill1 || def.pill1);
                            setText('landingPill2', landing.pill2 || def.pill2);
                            setText('landingPill3', landing.pill3 || def.pill3);
                        }
                    } catch (err) {
                        console.warn('revendedorLandingConfig inválido:', err);
                    }
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações do revendedor:', e);
        }
    }

    checkRevendedor() {
        // Verificar se há um parâmetro de revendedor na URL
        const urlParams = new URLSearchParams(window.location.search);
        let revendedorParam = urlParams.get('revendedor');
        
        // Se não encontrar 'revendedor', tentar 'ref' (compatibilidade)
        if (!revendedorParam) {
            revendedorParam = urlParams.get('ref');
        }
        
        if (!revendedorParam) {
            // Se não houver parâmetro, não exibir a página
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
                    <h1 style="color: var(--danger-color);">Acesso Negado</h1>
                    <p style="color: var(--text-secondary);">Link de recarga inválido. Entre em contato com o revendedor.</p>
                </div>
            `;
            return;
        }
        
        // Verificar se o revendedor existe e está ativo
        const revendedor = this.db.getUserById(revendedorParam);
        
        if (!revendedor) {
            // Revendedor não existe - não exibir a página
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px; text-align: center; padding: 24px;">
                    <h1 style="color: var(--danger-color);">Revendedor não encontrado</h1>
                    <p style="color: var(--text-secondary);">O revendedor não existe no sistema. Entre em contato com o administrador.</p>
                    <p style="color: var(--text-secondary); font-size: 14px;">Se você migrou para o novo sistema, crie o revendedor novamente no painel administrativo e use o novo link de recarga.</p>
                </div>
            `;
            return;
        }
        
        if (revendedor.type !== 'revendedor') {
            // Não é um revendedor - não exibir a página
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
                    <h1 style="color: var(--danger-color);">Acesso Negado</h1>
                    <p style="color: var(--text-secondary);">Usuário inválido. Entre em contato com o administrador.</p>
                </div>
            `;
            return;
        }
        
        if (!revendedor.active) {
            // Revendedor inativo - não exibir a página
            document.body.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background: var(--bg-color); color: var(--text-primary); flex-direction: column; gap: 20px;">
                    <h1 style="color: var(--danger-color);">Revendedor Inativo</h1>
                    <p style="color: var(--text-secondary);">Este revendedor está inativo. Entre em contato com o administrador.</p>
                </div>
            `;
            return;
        }
        
        // Revendedor válido e ativo
        this.revendedorId = revendedorParam;
        console.log('Revendedor da URL:', revendedor.username, 'ID:', this.revendedorId);
    }

    setupEventListeners() {
        // Campo de Telefone
        const phoneInput = document.getElementById('phoneNumber');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e);
                this.validatePhone(e.target.value);
            });
        }

        // Botão Pagar (Step 1)
        document.getElementById('btnPagar').addEventListener('click', () => {
            this.goToCheckout();
        });

        // Botão Finalizar PIX
        document.getElementById('btnFinalizarPix').addEventListener('click', () => {
            this.processPixPayment();
        });

        // Botão Copiar PIX
        document.getElementById('btnCopyPix').addEventListener('click', () => {
            this.copyPixCode();
        });

        // Botão Cancelar PIX
        const btnCancelPix = document.getElementById('btnCancelPix');
        if (btnCancelPix) {
            btnCancelPix.addEventListener('click', () => {
                this.cancelPayment();
            });
        }

        // Landing: botão para começar recarga
        const btnComecar = document.getElementById('btnComecarRecarga');
        if (btnComecar) {
            btnComecar.addEventListener('click', () => {
                document.getElementById('step0').classList.remove('active');
                document.getElementById('step0').style.display = 'none';
                document.getElementById('step1').style.display = 'block';
                document.getElementById('step1').classList.add('active');
                this.showRecargaScreen('operators');
            });
        }

        // Voltar para operadoras (a partir da tela de valores)
        const btnVoltarOperadora = document.getElementById('btnVoltarOperadora');
        if (btnVoltarOperadora) {
            btnVoltarOperadora.addEventListener('click', () => {
                this.selectedCarrier = null;
                this.selectedValue = null;
                this.showRecargaScreen('operators');
            });
        }

        // Trocar operadora ou valor (volta para operadoras)
        const btnTrocar = document.getElementById('btnTrocarOperadoraValor');
        if (btnTrocar) {
            btnTrocar.addEventListener('click', () => {
                this.selectedValue = null;
                this.selectedCarrier = null;
                this.showRecargaScreen('operators');
                this.renderOperators();
            });
        }

        // Continuar para o número (resumo → telefone)
        const btnContinuar = document.getElementById('btnContinuarNumero');
        if (btnContinuar) {
            btnContinuar.addEventListener('click', () => {
                this.showRecargaScreen('phone');
                this.updatePaymentButton();
            });
        }

        // Voltar ao resumo (a partir da tela do número)
        const btnVoltarResumo = document.getElementById('btnVoltarResumo');
        if (btnVoltarResumo) {
            btnVoltarResumo.addEventListener('click', () => {
                this.showRecargaScreen('summary');
            });
        }

        // Botões de Download - um único handler cada
        const btnDownloadPDF = document.getElementById('btnDownloadPDF');
        if (btnDownloadPDF) {
            btnDownloadPDF.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.downloadReceiptPDF();
            });
        }
        const btnDownloadTIM = document.getElementById('btnDownloadTIM');
        if (btnDownloadTIM) {
            btnDownloadTIM.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.downloadReceiptTIM();
            });
        }
    }

    downloadReceiptPDF() {
        try {
            if (!this.currentReceiptData) {
                console.error('currentReceiptData não encontrado:', this.currentReceiptData);
                this.showNotification('Dados do comprovante não encontrados', 'error');
                return;
            }

            const data = this.currentReceiptData;
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                throw new Error('Não foi possível criar contexto do canvas');
            }
            
            // Configurar canvas (A4: 210x297mm = 595x842px em 72dpi)
            canvas.width = 595;
            canvas.height = 842;
            
            // Fundo branco
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Cores
            const primaryColor = '#00d084';
            const textColor = '#333333';
            const lightGray = '#999999';
            
            let y = 60;
            
            // Função auxiliar para desenhar texto
            const drawText = (text, x, fontSize, color, bold = false) => {
                ctx.fillStyle = color;
                ctx.font = (bold ? 'bold ' : '') + fontSize + 'px Arial';
                ctx.fillText(text, x, y);
                y += fontSize + 10;
            };
            
            // Cabeçalho
            ctx.fillStyle = primaryColor;
            ctx.font = 'bold 28px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('COMPROVANTE DE RECARGA', canvas.width / 2, y);
            y += 40;
            
            ctx.textAlign = 'left';
            ctx.fillStyle = lightGray;
            ctx.font = '12px Arial';
            ctx.fillText('Data: ' + (data.date || new Date().toLocaleString('pt-BR')), 50, y);
            y += 30;
            
            // Linha separadora
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(canvas.width - 50, y);
            ctx.stroke();
            y += 30;
            
            // Dados
            const drawField = (label, value) => {
                ctx.fillStyle = lightGray;
                ctx.font = 'bold 12px Arial';
                ctx.fillText(label, 50, y);
                y += 20;
                
                ctx.fillStyle = textColor;
                ctx.font = 'bold 16px Arial';
                ctx.fillText(value || 'N/A', 50, y);
                y += 30;
            };
            
            drawField('OPERADORA', data.carrier);
            drawField('NÚMERO', data.phone);
            drawField('VALOR RECARGA', 'R$ ' + (data.value || '0.00'));
            drawField('VALOR PAGO', 'R$ ' + (data.paid || '0.00'));
            drawField('STATUS', (data.status || 'pendente').toUpperCase());
            
            // Linha separadora
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(canvas.width - 50, y);
            ctx.stroke();
            y += 30;
            
            // ID do pedido
            ctx.fillStyle = lightGray;
            ctx.font = 'bold 12px Arial';
            ctx.fillText('ID DO PEDIDO', 50, y);
            y += 20;
            
            ctx.fillStyle = primaryColor;
            ctx.font = 'bold 14px Arial';
            ctx.fillText(data.orderId || 'N/A', 50, y);
            y += 40;
            
            // Rodapé
            ctx.fillStyle = lightGray;
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Comprovante gerado automaticamente', canvas.width / 2, canvas.height - 40);
            ctx.fillText((this.siteTitle || 'Recarga Express') + ' - ' + new Date().getFullYear(), canvas.width / 2, canvas.height - 20);
            
            // Função para fazer download
            const downloadImage = (imageData) => {
                try {
                    const link = document.createElement('a');
                    link.href = imageData;
                    link.download = 'comprovante_recarga_' + (data.orderId || Date.now()) + '.png';
                    link.style.display = 'none';
                    document.body.appendChild(link);
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        if (imageData.startsWith('blob:')) {
                            URL.revokeObjectURL(imageData);
                        }
                    }, 100);
                    
                    this.showNotification('Comprovante baixado com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao fazer download:', error);
                    this.showNotification('Erro ao baixar comprovante. Tente novamente.', 'error');
                }
            };
            
            // Tentar usar toBlob primeiro (mais eficiente)
            if (canvas.toBlob) {
                canvas.toBlob((blob) => {
                    if (blob) {
                        const url = URL.createObjectURL(blob);
                        downloadImage(url);
                    } else {
                        // Fallback para toDataURL se toBlob falhar
                        console.warn('toBlob retornou null, usando toDataURL');
                        const dataUrl = canvas.toDataURL('image/png');
                        downloadImage(dataUrl);
                    }
                }, 'image/png');
            } else {
                // Fallback para navegadores que não suportam toBlob
                console.warn('toBlob não disponível, usando toDataURL');
                const dataUrl = canvas.toDataURL('image/png');
                downloadImage(dataUrl);
            }
        } catch (error) {
            console.error('Erro ao gerar comprovante:', error);
            this.showNotification('Erro ao gerar comprovante: ' + error.message, 'error');
        }
    }

    downloadReceiptTIM() {
        try {
            if (!this.currentReceiptData) {
                console.error('currentReceiptData não encontrado para TIM:', this.currentReceiptData);
                this.showNotification('Dados do comprovante não encontrados', 'error');
                return;
            }

            const data = this.currentReceiptData;
            
            // Redirecionar para TIM (simulando acesso ao comprovante)
            // Em produção, isso poderia abrir um link do TIM ou gerar um PDF específico
            const timLink = 'https://www.tim.com.br/';
            
            this.showNotification('Abrindo comprovante TIM...', 'info');
            const newWindow = window.open(timLink, '_blank');
            
            if (!newWindow) {
                this.showNotification('Por favor, permita pop-ups para abrir o comprovante TIM', 'warning');
            }
        } catch (error) {
            console.error('Erro ao abrir comprovante TIM:', error);
            this.showNotification('Erro ao abrir comprovante TIM: ' + error.message, 'error');
        }
    }

    async loadAndDisplayFloatingContacts() {
        try {
            if (!this.revendedorId) {
                console.warn('⚠️ revendedorId não definido, não é possível carregar contatos');
                return;
            }

            console.log('📞 Carregando contatos do revendedor:', this.revendedorId);
            const response = await fetch(`/api/data.php?action=user_config_get&userId=${encodeURIComponent(this.revendedorId)}`);
            const result = await response.json();
            
            console.log('📞 Resposta da API de contatos:', result);
            
            if (result.success && result.data) {
                const telegramLink = (result.data.revendedorTelegramUsername || '').trim();
                const whatsappLink = (result.data.revendedorWhatsAppNumber || '').trim();
                
                console.log('📞 Links encontrados - Telegram:', telegramLink ? 'Sim' : 'Não', 'WhatsApp:', whatsappLink ? 'Sim' : 'Não');
                
                // Validar se os links são URLs válidas
                const hasValidTelegram = telegramLink && (telegramLink.startsWith('http://') || telegramLink.startsWith('https://') || telegramLink.startsWith('t.me/'));
                const hasValidWhatsApp = whatsappLink && (whatsappLink.startsWith('http://') || whatsappLink.startsWith('https://') || whatsappLink.startsWith('wa.me/'));
                
                if (hasValidTelegram || hasValidWhatsApp) {
                    // Normalizar links se necessário
                    let telegramUrl = telegramLink;
                    let whatsappUrl = whatsappLink;
                    
                    if (telegramUrl && !telegramUrl.startsWith('http')) {
                        telegramUrl = telegramUrl.startsWith('t.me/') ? 'https://' + telegramUrl : 'https://t.me/' + telegramUrl.replace('@', '');
                    }
                    
                    if (whatsappUrl && !whatsappUrl.startsWith('http')) {
                        whatsappUrl = whatsappUrl.startsWith('wa.me/') ? 'https://' + whatsappUrl : 'https://wa.me/' + whatsappUrl.replace(/\D/g, '');
                    }
                    
                    console.log('✅ Criando ícones de contato flutuantes');
                    this.createFloatingContacts(telegramUrl, whatsappUrl);
                } else {
                    console.log('⚠️ Nenhum link de contato válido encontrado');
                }
            } else {
                console.warn('⚠️ Resposta da API não contém dados válidos:', result);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar contatos do revendedor:', error);
        }
    }

    createFloatingContacts(telegramLink, whatsappLink) {
        // Remover container existente se houver (evitar duplicação)
        const existingContainer = document.getElementById('floating-contacts');
        if (existingContainer) {
            existingContainer.remove();
        }

        const container = document.createElement('div');
        container.id = 'floating-contacts';
        container.style.cssText = 'position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 12px; z-index: 10000;';

        if (telegramLink) {
            const telegramBtn = document.createElement('a');
            telegramBtn.href = telegramLink;
            telegramBtn.target = '_blank';
            telegramBtn.rel = 'noopener noreferrer';
            telegramBtn.style.cssText = 'width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #0088cc, #0077b5); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; text-decoration: none; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.4); transition: all 0.3s ease; cursor: pointer;';
            telegramBtn.innerHTML = '📱';
            telegramBtn.title = 'Fale conosco no Telegram';
            telegramBtn.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 16px rgba(0, 136, 204, 0.6)';
            };
            telegramBtn.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.4)';
            };
            container.appendChild(telegramBtn);
        }

        if (whatsappLink) {
            const whatsappBtn = document.createElement('a');
            whatsappBtn.href = whatsappLink;
            whatsappBtn.target = '_blank';
            whatsappBtn.rel = 'noopener noreferrer';
            whatsappBtn.style.cssText = 'width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #25d366, #20ba61); display: flex; align-items: center; justify-content: center; color: white; font-size: 28px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4); transition: all 0.3s ease; cursor: pointer;';
            whatsappBtn.innerHTML = '💬';
            whatsappBtn.title = 'Fale conosco no WhatsApp';
            whatsappBtn.onmouseover = function() {
                this.style.transform = 'scale(1.1)';
                this.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.6)';
            };
            whatsappBtn.onmouseout = function() {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
            };
            container.appendChild(whatsappBtn);
        }

        document.body.appendChild(container);
    }

    async checkMinimumBalance() {
        try {
            if (!this.revendedorId) return;
            
            const saldo = this.db.getSaldo(this.revendedorId);
            const SALDO_MINIMO = 5;
            
            if (saldo < SALDO_MINIMO) {
                // Carregar contatos do revendedor
                try {
                    const response = await fetch(`/api/data.php?action=user_config_get&userId=${this.revendedorId}`);
                    const result = await response.json();
                    
                    let telegramLink = '';
                    let whatsappLink = '';
                    
                    if (result.success && result.data) {
                        telegramLink = result.data.revendedorTelegramUsername || '';
                        whatsappLink = result.data.revendedorWhatsAppNumber || '';
                    }
                    
                    // Mostrar modal de bloqueio
                    this.showBlockedModal(telegramLink, whatsappLink);
                } catch (error) {
                    console.warn('Erro ao carregar contatos:', error);
                    this.showBlockedModal('', '');
                }
            }
        } catch (error) {
            console.warn('Erro ao verificar saldo mínimo:', error);
        }
    }

    showBlockedModal(telegramLink, whatsappLink) {
        // Ocultar conteúdo principal
        const mainContent = document.querySelector('main') || document.querySelector('.container');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Criar overlay
        const overlay = document.createElement('div');
        overlay.id = 'blocked-overlay';
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.9); display: flex; align-items: center; justify-content: center; z-index: 9999;';
        
        // Criar modal
        const modal = document.createElement('div');
        modal.style.cssText = 'background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border: 2px solid #ff6b6b; border-radius: 12px; padding: 40px; max-width: 500px; text-align: center; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15); animation: slideIn 0.4s ease-out;';
        
        // Adicionar animação CSS
        const style = document.createElement('style');
        style.textContent = '@keyframes slideIn { from { opacity: 0; transform: translateY(-30px); } to { opacity: 1; transform: translateY(0); } }';
        document.head.appendChild(style);
        
        // Conteúdo do modal
        let modalContent = '<div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>';
        modalContent += '<h2 style="color: #ff6b6b; font-size: 24px; margin-bottom: 15px; font-weight: bold;">Revendedor Indisponível</h2>';
        modalContent += '<p style="color: #64748b; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">Entre em contato para mais informações.</p>';
        modalContent += '<div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">';
        
        // Adicionar botão de WhatsApp se disponível
        if (whatsappLink) {
            modalContent += `<a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #25d366, #20ba61); color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);">💬 WhatsApp</a>`;
        }
        
        // Adicionar botão de Telegram se disponível
        if (telegramLink) {
            modalContent += `<a href="${telegramLink}" target="_blank" rel="noopener noreferrer" style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #0088cc, #0077b5); color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);">📱 Telegram</a>`;
        }
        
        // Se nenhum contato, adicionar botão genérico
        if (!whatsappLink && !telegramLink) {
            modalContent += '<button style="flex: 1; min-width: 150px; background: linear-gradient(135deg, #666, #555); color: white; padding: 14px 24px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: not-allowed; opacity: 0.6;">Sem contato disponível</button>';
        }
        
        modalContent += '</div>';
        modal.innerHTML = modalContent;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    async loadCatalog() {
        try {
            // Aguardar um pouco para garantir que o revendedor foi definido
            if (!this.revendedorId) {
                // Tentar novamente após um delay
                setTimeout(() => {
                    this.loadCatalog();
                }, 200);
                return;
            }

            console.log('Carregando catálogo para revendedor:', this.revendedorId);
            
            // Verificar se o revendedor tem catálogo personalizado
            const customCatalog = this.db.getCatalog(this.revendedorId);
            
            if (customCatalog && Array.isArray(customCatalog) && customCatalog.length > 0) {
                console.log('Usando catálogo personalizado do revendedor:', customCatalog);
                // Usar catálogo personalizado do revendedor
                this.catalog = customCatalog;
                this.renderOperators();
                return;
            }

            console.log('Catálogo personalizado não encontrado, carregando da API...');
            
            // Se não tiver catálogo personalizado, carregar da API
            const response = await this.api.getCatalog();
            if (response.success) {
                this.catalog = response.data;
                console.log('Catálogo carregado da API:', this.catalog);
                this.renderOperators();
            }
        } catch (error) {
            console.error('Erro ao carregar catálogo:', error);
            document.getElementById('operatorsGrid').innerHTML = 
                `<div style="color: var(--danger-color);">Erro ao carregar catálogo: ${error.message}</div>`;
        }
    }

    renderOperators() {
        const container = document.getElementById('operatorsGrid');
        
        if (this.catalog.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma operadora disponível</div>';
            return;
        }

        container.innerHTML = this.catalog.map(carrier => `
            <button class="operator-btn" data-carrier-id="${carrier.carrierId}" data-carrier-name="${carrier.name}">
                ${carrier.name}
            </button>
        `).join('');

        // Event listeners para operadoras
        container.querySelectorAll('.operator-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectOperator(e.currentTarget);
            });
        });
    }

    showRecargaScreen(screen) {
        const screens = ['operators', 'values', 'summary', 'phone'];
        const map = {
            operators: 'recargaScreenOperators',
            values: 'recargaScreenValues',
            summary: 'recargaScreenSummary',
            phone: 'recargaScreenPhone'
        };
        const id = map[screen];
        if (!id) return;
        screens.forEach(s => {
            const el = document.getElementById(map[s]);
            if (el) el.style.display = (map[s] === id) ? 'block' : 'none';
        });
        if (screen === 'summary' && this.selectedCarrier && this.selectedValue) {
            document.getElementById('summaryOperadora').textContent = this.selectedCarrier.name;
            const val = (this.selectedValue.salePrice || this.selectedValue.cost || this.selectedValue.value);
            document.getElementById('summaryValor').textContent = 'R$ ' + (typeof val === 'number' ? val.toFixed(2) : val);
        }
    }

    selectOperator(button) {
        document.querySelectorAll('.operator-btn').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
        const carrierId = button.dataset.carrierId;
        const carrierName = button.dataset.carrierName;

        this.selectedCarrier = this.catalog.find(c => c.carrierId === carrierId);
        this.selectedValue = null;
        this.renderValues();
        const nomeEl = document.getElementById('valuesOperadoraNome');
        if (nomeEl) nomeEl.textContent = carrierName || this.selectedCarrier?.name || '';
        this.showRecargaScreen('values');
    }

    renderValues() {
        if (!this.selectedCarrier) return;

        const container = document.getElementById('valuesGrid');
        container.innerHTML = this.selectedCarrier.values.map(value => {
            // Usar preço de venda personalizado se existir, senão usar o custo
            const salePrice = value.salePrice || value.cost;
            const originalValue = value.originalValue || value.value;
            
            return `
                <div class="value-card" data-value-id="${value.valueId}" data-value="${originalValue}" data-cost="${value.originalCost || value.cost}" data-sale-price="${salePrice}">
                    <div class="value-receive">RECEBA R$ ${originalValue.toFixed(2)}</div>
                    <div class="value-pay">Pague R$ ${salePrice.toFixed(2)}</div>
                </div>
            `;
        }).join('');

        // Event listeners para valores
        container.querySelectorAll('.value-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectValue(card);
            });
        });
    }

    selectValue(card) {
        document.querySelectorAll('.value-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const salePrice = parseFloat(card.dataset.salePrice) || parseFloat(card.dataset.cost);

        this.selectedValue = {
            valueId: card.dataset.valueId,
            value: parseFloat(card.dataset.value),
            originalValue: parseFloat(card.dataset.value),
            cost: parseFloat(card.dataset.cost),
            originalCost: parseFloat(card.dataset.cost),
            salePrice: salePrice
        };

        document.getElementById('valorPagar').textContent = `R$ ${salePrice.toFixed(2)}`;
        this.showRecargaScreen('summary');
    }

    formatPhoneNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
            if (value.length <= 2) {
                value = value;
            } else if (value.length <= 7) {
                value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
            } else {
                value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
            }
        }
        
        e.target.value = value;
        this.selectedPhone = value.replace(/\D/g, '');
    }

    validatePhone(phone) {
        const phoneClean = phone.replace(/\D/g, '');
        const phoneCheck = document.getElementById('phoneCheck');
        const phoneHint = document.getElementById('phoneHint');
        const phoneInput = document.getElementById('phoneNumber');

        if (phoneClean.length === 11) {
            phoneInput.classList.add('valid');
            phoneCheck.style.display = 'block';
            phoneHint.textContent = 'Número válido';
            phoneHint.style.color = 'var(--success-color)';
            this.updatePaymentButton();
        } else if (phoneClean.length > 0) {
            phoneInput.classList.remove('valid');
            phoneCheck.style.display = 'none';
            phoneHint.textContent = 'Digite um número válido (DDD + 9 dígitos)';
            phoneHint.style.color = 'var(--danger-color)';
            this.updatePaymentButton();
        } else {
            phoneInput.classList.remove('valid');
            phoneCheck.style.display = 'none';
            phoneHint.textContent = '';
            this.updatePaymentButton();
        }
    }

    updatePaymentButton() {
        const phoneClean = (this.selectedPhone || '').replace(/\D/g, '');
        const btnPagar = document.getElementById('btnPagar');
        if (!btnPagar) return;
        if (this.selectedCarrier && this.selectedValue && phoneClean.length === 11) {
            btnPagar.disabled = false;
        } else {
            btnPagar.disabled = true;
        }
    }

    async goToCheckout() {
        // Verificar saldo do revendedor
        if (!this.revendedorId) {
            this.showNotification('Sistema temporariamente indisponível. Entre em contato com o administrador.', 'error');
            return;
        }

        const saldo = this.db.getSaldo(this.revendedorId);
        const costToCheck = this.selectedValue.cost;
        
        if (saldo < costToCheck) {
            // Redirecionar direto para contatos do revendedor
            try {
                const response = await fetch(`/api/data.php?action=user_config_get&userId=${this.revendedorId}`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    const telegramLink = result.data.revendedorTelegramUsername || '';
                    const whatsappLink = result.data.revendedorWhatsAppNumber || '';
                    
                    // Prioridade: WhatsApp > Telegram
                    if (whatsappLink) {
                        window.location.href = whatsappLink;
                        return;
                    }
                    else if (telegramLink) {
                        window.location.href = telegramLink;
                        return;
                    }
                }
            } catch (error) {
                console.warn('Erro ao carregar contatos:', error);
            }
            
            // Fallback: mostrar erro se não houver contatos
            this.showNotification(
                `Saldo insuficiente. Você precisa de R$ ${costToCheck.toFixed(2)} mas possui R$ ${saldo.toFixed(2)}.`,
                'error'
            );
            return;
        }

        this.fillCheckout();
        this.showStep(2);
    }


    fillCheckout() {
        const salePrice = this.selectedValue.salePrice || this.selectedValue.cost;
        
        // Item
        const checkoutItem = document.getElementById('checkoutItem');
        checkoutItem.innerHTML = `
            <div class="checkout-item-icon">⚡</div>
            <div class="checkout-item-info">
                <div class="checkout-item-name">Recarga ${this.selectedCarrier.name}</div>
                <div class="checkout-item-details">${this.formatPhone(this.selectedPhone)} - R$ ${this.selectedValue.value.toFixed(2)}</div>
            </div>
            <div class="checkout-item-price">R$ ${salePrice.toFixed(2)}</div>
        `;

        // Resumo
        document.getElementById('summarySubtotal').textContent = `R$ ${salePrice.toFixed(2)}`;
        document.getElementById('summaryTotal').textContent = `R$ ${salePrice.toFixed(2)}`;
    }

    async processPixPayment() {
        // Verificar saldo novamente antes de processar (usar custo real da API)
        const saldo = this.db.getSaldo(this.revendedorId);
        const costToCheck = this.selectedValue.cost || this.selectedValue.originalCost;
        const salePrice = this.selectedValue.salePrice || this.selectedValue.cost || costToCheck;
        
        if (saldo < costToCheck) {
            const revendedor = this.db.getUserById(this.revendedorId);
            this.showNotification(
                `Saldo insuficiente! Você precisa de R$ ${costToCheck.toFixed(2)} mas possui apenas R$ ${saldo.toFixed(2)}. Entre em contato com o administrador para adicionar saldo.`,
                'error'
            );
            
            // Voltar para step 1
            this.showStep(1);
            return;
        }

        // Obter módulo de pagamento selecionado (prioridade: revendedor > admin > padrão)
        const paymentModule = this.revendedorPaymentModule || localStorage.getItem(`revendedorPaymentModule_${this.revendedorId}`) || localStorage.getItem('adminPaymentModule') || 'mercadopago';
        console.log(`Módulo de pagamento selecionado: ${paymentModule}`);
        
        try {
            const revendedor = this.db.getUserById(this.revendedorId);
            
            // Sanitizar nome para Virtual Pay (mínimo 3 caracteres, sem caracteres especiais)
            const sanitizeName = (name) => {
                return name.replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Cliente';
            };
            
            const paymentData = {
                amount: salePrice,
                description: `Recarga ${this.selectedCarrier.name} - ${this.formatPhone(this.selectedPhone)}`,
                email: revendedor?.email || 'cliente@recargaexpress.com',
                firstName: sanitizeName('Cliente'),
                lastName: sanitizeName('Recarga'),
                externalReference: `RECARGA_${this.revendedorId}_${Date.now()}`,
                notificationUrl: window.location.origin + '/webhook-mercadopago.html',
                userId: this.revendedorId,
                isAdmin: false  // Usar configurações do Revendedor para pagamentos públicos
            };

            let pixPayment;
            let isTest = false;
            
            if (paymentModule === 'virtualpay') {
                // Usar Virtual Pay com credenciais do Revendedor
                await virtualPay.ensureAdminConfigLoaded(true);
                this.showNotification('Gerando pagamento via Virtual Pay...', 'success');
                
                // Garantir que o nome tem pelo menos 3 caracteres
                if (paymentData.firstName.length < 3) {
                    paymentData.firstName = 'Cliente';
                }
                if (paymentData.lastName.length < 3) {
                    paymentData.lastName = 'Recarga';
                }
                
                pixPayment = await virtualPay.createPayment(paymentData);
                isTest = false; // Virtual Pay sempre produção
            } else if (paymentModule === 'pushinpay') {
                // Usar PushinPay com credenciais do Revendedor
                await pushinPay.ensureAdminConfigLoaded(true);
                this.showNotification('Gerando pagamento via PushinPay...', 'success');
                
                pixPayment = await pushinPay.createPayment(paymentData);
                isTest = false; // PushinPay sempre produção (não tem modo teste separado)
            } else {
                // Usar Mercado Pago com credenciais do Revendedor (padrão)
                await mercadoPago.ensureAdminConfigLoaded(true);
                
                // Verificar modo do revendedor primeiro, depois admin
                const modoRevendedor = localStorage.getItem(`revendedorMercadoPagoModo_${this.revendedorId}`) || '';
                const modoAdmin = localStorage.getItem('adminMercadoPagoModo') || 'prod';
                const modoFinal = modoRevendedor || modoAdmin;
                isTest = modoFinal === 'test';
                
                // Log para debug - mostrar qual modo está sendo usado
                console.log(`**Modo PIX carregado: ${modoFinal === 'test' ? 'Teste (sandbox)' : 'Produção'}**`);
                console.log(`**Token que será usado: ${isTest ? 'TEST' : 'PROD'}**`);
                
                const modoTexto = isTest ? 'teste' : 'real';
                this.showNotification(`Gerando pagamento PIX ${modoTexto}...`, 'success');
                pixPayment = await mercadoPago.createPixPayment(paymentData);
            }

            if (pixPayment.status === 'pending' || pixPayment.status === 'in_process') {
                await this.showPixPaymentSimulated(pixPayment, salePrice, isTest, paymentModule);
                this.showStep(3);
            } else {
                throw new Error('Erro ao gerar pagamento');
            }
        } catch (error) {
            this.showNotification(`Erro ao processar pagamento: ${error.message}`, 'error');
            console.error('Erro:', error);
        }
    }

    async showPixPaymentSimulated(paymentData, valor, isTest = false, paymentModule = 'mercadopago') {
        this.isPixTestMode = isTest;
        this.currentPaymentModule = paymentModule;
        
        // Log completo da resposta da API para debug
        console.log('🔍 showPixPaymentSimulated - paymentData completo:', JSON.stringify(paymentData, null, 2));
        console.log('🔍 paymentModule:', paymentModule);
        
        // Obter dados do PIX (adaptar para todos os módulos)
        let pixData, qrCode, qrCodeBase64, pixCode;
        
        if (paymentModule === 'virtualpay') {
            // Virtual Pay estrutura
            pixData = paymentData.pix_data || paymentData.payment_data || {};
            qrCode = pixData.qr_code || paymentData.qr_code || '';
            qrCodeBase64 = pixData.qr_code_base64 || paymentData.qr_code_base64 || '';
            pixCode = pixData.copy_paste || paymentData.copy_paste || paymentData.pix_code || qrCode;
        } else if (paymentModule === 'pushinpay') {
            // PushinPay estrutura - tentar pegar de múltiplos lugares
            pixData = paymentData.pix_data || {};
            // PushinPay retorna: qr_code, qr_code_base64, copy_paste, pix_code
            qrCode = paymentData.qr_code || pixData.qr_code || paymentData.pix_data?.qr_code || '';
            qrCodeBase64 = paymentData.qr_code_base64 || pixData.qr_code_base64 || paymentData.pix_data?.qr_code_base64 || '';
            // copy_paste é o código PIX copia e cola (mesmo que qr_code)
            pixCode = paymentData.copy_paste || paymentData.pix_code || pixData.copy_paste || paymentData.pix_data?.copy_paste || qrCode;
            
            console.log('🔍 PushinPay (recarga.js) - Dados extraídos:', {
                hasQrCode: !!qrCode,
                qrCodeLength: qrCode ? qrCode.length : 0,
                qrCodePreview: qrCode ? qrCode.substring(0, 50) + '...' : 'vazio',
                hasQrCodeBase64: !!qrCodeBase64,
                qrCodeBase64Length: qrCodeBase64 ? qrCodeBase64.length : 0,
                qrCodeBase64Preview: qrCodeBase64 ? qrCodeBase64.substring(0, 50) + '...' : 'vazio',
                hasPixCode: !!pixCode,
                pixCodeLength: pixCode ? pixCode.length : 0,
                pixCodePreview: pixCode ? pixCode.substring(0, 50) + '...' : 'vazio',
                paymentDataKeys: Object.keys(paymentData),
                pixDataKeys: pixData ? Object.keys(pixData) : []
            });
        } else {
            // Mercado Pago estrutura
            pixData = paymentData.point_of_interaction?.transaction_data;
            qrCode = pixData?.qr_code || '';
            qrCodeBase64 = pixData?.qr_code_base64 || '';
            pixCode = qrCode;
        }

        // Salvar transação no servidor (SQLite) para funcionar em qualquer dispositivo
        const paymentId = paymentData.id || paymentData.transactionId;

        // Garantir que selectedCarrier tem carrierId (normalizar _id -> carrierId)
        const carrierToSave = { ...this.selectedCarrier };
        if (!carrierToSave.carrierId && carrierToSave._id) {
            carrierToSave.carrierId = carrierToSave._id;
        }

        const transactionPayload = {
            id: paymentId,
            userId: this.revendedorId,
            type: 'public_payment',
            amount: valor,
            status: 'pending',
            module: paymentModule,
            createdAt: new Date().toISOString(),
            revendedorId: this.revendedorId,
            selectedValue: this.selectedValue,
            selectedCarrier: carrierToSave,
            selectedPhone: this.selectedPhone
        };

        try {
            await this.db.upsertTransaction(paymentId, transactionPayload);
            console.log('Transação salva no servidor com sucesso:', paymentId);
        } catch (e) {
            console.warn('Falha ao salvar transação no servidor (fallback local):', e);
            // Fallback local - salvar em AMBAS as chaves para garantir recuperação
            try {
                const localData = {
                    createdAt: Date.now(),
                    amount: valor,
                    approved: false,
                    revendedorId: this.revendedorId,
                    selectedValue: this.selectedValue,
                    selectedCarrier: carrierToSave,
                    selectedPhone: this.selectedPhone,
                    module: paymentModule
                };
                // Salvar em ambas as chaves para o fallback funcionar independente do módulo
                const mpTx = JSON.parse(localStorage.getItem('mp_transactions') || '{}');
                mpTx[paymentId] = localData;
                localStorage.setItem('mp_transactions', JSON.stringify(mpTx));
                const vpTx = JSON.parse(localStorage.getItem('vp_transactions') || '{}');
                vpTx[paymentId] = localData;
                localStorage.setItem('vp_transactions', JSON.stringify(vpTx));
            } catch (localErr) {
                console.error('Falha crítica ao salvar transação localmente:', localErr);
            }
        }

        const qrcode = document.getElementById('pixQRCode');
        if (!qrcode) {
            console.error('Elemento pixQRCode não encontrado no DOM!');
        } else {
            console.log('📸 Gerando QR Code - Base64:', !!qrCodeBase64, 'QR Code:', !!qrCode, 'PIX Code:', !!pixCode);
            
            if (qrCodeBase64 && qrCodeBase64.length > 100 && qrCodeBase64.trim() !== '') {
                // Validar se o base64 é válido (não contém apenas espaços ou caracteres inválidos)
                let cleanBase64 = qrCodeBase64.trim();
                let base64Data = null;
                
                // Verificar se já tem prefixo data:image
                if (cleanBase64.startsWith('data:image')) {
                    // Já tem prefixo completo, usar diretamente
                    base64Data = cleanBase64;
                    console.log('✅ Base64 já tem prefixo data:image');
                } else {
                    // Remover qualquer prefixo parcial que possa existir
                    if (cleanBase64.includes(',')) {
                        cleanBase64 = cleanBase64.split(',').pop(); // Pegar apenas a parte após a vírgula
                    }
                    
                    // Validar se é base64 válido (caracteres alfanuméricos, +, /, =)
                    if (cleanBase64.match(/^[A-Za-z0-9+\/=\s]+$/)) {
                        // Remover espaços em branco
                        cleanBase64 = cleanBase64.replace(/\s/g, '');
                        // Adicionar prefixo
                        base64Data = 'data:image/png;base64,' + cleanBase64;
                        console.log('✅ Base64 puro detectado, adicionando prefixo');
                    } else {
                        console.warn('⚠️ Base64 inválido ou formato desconhecido:', cleanBase64.substring(0, 50));
                        base64Data = null;
                    }
                }
                
                if (base64Data) {
                    console.log('✅ Usando QR Code Base64 da API (tamanho:', cleanBase64.length, ')');
                    qrcode.innerHTML = `<img src="${base64Data}" alt="QR Code PIX" style="max-width: 250px; border-radius: 8px; display: block; margin: 0 auto;" onload="console.log('✅ QR Code Base64 carregado com sucesso');" onerror="console.error('❌ Erro ao carregar QR Code Base64'); this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"><div style="display:none;" class="qrcode-placeholder"><div class="qrcode-icon">📱</div><p>${isTest ? 'QR Code PIX (TESTE)' : 'Escaneie o QR Code'}</p><p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">${isTest ? 'Modo de teste - Use o código PIX abaixo' : 'Use o código PIX abaixo ou escaneie'}</p></div>`;
                } else {
                    // Se base64 inválido, tentar gerar via código PIX
                    console.warn('⚠️ Base64 inválido, tentando gerar via código PIX');
                    if (pixCode && pixCode.length > 50) {
                        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`;
                        qrcode.innerHTML = `<img src="${qrCodeUrl}" alt="QR Code PIX" style="max-width: 250px; border-radius: 8px; border: 2px solid var(--border-color); display: block; margin: 0 auto;" onload="console.log('✅ QR Code gerado via API pública');" onerror="console.error('❌ Erro ao gerar QR Code'); this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"><div style="display:none;" class="qrcode-placeholder"><div class="qrcode-icon">📱</div><p>${isTest ? 'QR Code PIX (TESTE)' : 'Escaneie o QR Code'}</p><p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">${isTest ? 'Modo de teste - Use o código PIX abaixo' : 'Use o código PIX abaixo ou escaneie'}</p></div>`;
                    }
                }
            } else if (pixCode && pixCode.length > 50) {
                // Se não tem base64 mas tem código PIX, gerar QR Code usando API pública
                // Priorizar pixCode (copy_paste) que é o código completo
                // Código PIX válido geralmente tem mais de 50 caracteres e começa com "000201"
                console.log('✅ Gerando QR Code via API pública com código PIX (tamanho:', pixCode.length, ')');
                console.log('📋 Primeiros 50 caracteres do código:', pixCode.substring(0, 50));
                
                // Tentar múltiplas APIs de QR Code como fallback
                const qrCodeUrl1 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(pixCode)}`;
                const qrCodeUrl2 = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(pixCode)}`;
                
                qrcode.innerHTML = `
                    <img id="qrcode-img" 
                         src="${qrCodeUrl1}" 
                         alt="QR Code PIX" 
                         style="max-width: 250px; border-radius: 8px; border: 2px solid var(--border-color); display: block; margin: 0 auto;"
                         onload="console.log('✅ QR Code carregado com sucesso da API qrserver.com');"
                         onerror="console.error('❌ Erro ao carregar QR Code da primeira API, tentando segunda...'); const img = this; img.src = '${qrCodeUrl2}'; img.onerror = function() { console.error('❌ Erro ao carregar QR Code da segunda API também'); img.style.display='none'; const placeholder = img.nextElementSibling; if(placeholder) placeholder.style.display='block'; };">
                    <div style="display:none;" class="qrcode-placeholder">
                        <div class="qrcode-icon">📱</div>
                        <p>${isTest ? 'QR Code PIX (TESTE)' : 'Escaneie o QR Code'}</p>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">${isTest ? 'Modo de teste - Use o código PIX abaixo' : 'Use o código PIX abaixo ou escaneie'}</p>
                    </div>
                `;
            } else if (qrCode && qrCode.length > 50) {
                // Fallback: usar qrCode se pixCode não estiver disponível
                console.log('⚠️ Usando qrCode como fallback (tamanho:', qrCode.length, ')');
                console.log('📋 Primeiros 50 caracteres do código:', qrCode.substring(0, 50));
                
                const qrCodeUrl1 = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode)}`;
                const qrCodeUrl2 = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${encodeURIComponent(qrCode)}`;
                
                qrcode.innerHTML = `
                    <img id="qrcode-img" 
                         src="${qrCodeUrl1}" 
                         alt="QR Code PIX" 
                         style="max-width: 250px; border-radius: 8px; border: 2px solid var(--border-color); display: block; margin: 0 auto;"
                         onload="console.log('✅ QR Code carregado com sucesso (fallback)');"
                         onerror="console.error('❌ Erro ao carregar QR Code (fallback) da primeira API, tentando segunda...'); const img = this; img.src = '${qrCodeUrl2}'; img.onerror = function() { console.error('❌ Erro ao carregar QR Code (fallback) da segunda API também'); img.style.display='none'; const placeholder = img.nextElementSibling; if(placeholder) placeholder.style.display='block'; };">
                    <div style="display:none;" class="qrcode-placeholder">
                        <div class="qrcode-icon">📱</div>
                        <p>${isTest ? 'QR Code PIX (TESTE)' : 'Escaneie o QR Code'}</p>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">${isTest ? 'Modo de teste - Use o código PIX abaixo' : 'Use o código PIX abaixo ou escaneie'}</p>
                    </div>
                `;
            } else {
                // Fallback se não tiver código PIX
                console.error('❌ Nenhum código PIX disponível para gerar QR Code!', {
                    qrCode: qrCode ? qrCode.substring(0, 50) : 'vazio',
                    pixCode: pixCode ? pixCode.substring(0, 50) : 'vazio',
                    qrCodeBase64: qrCodeBase64 ? 'presente' : 'vazio'
                });
                qrcode.innerHTML = `
                    <div class="qrcode-placeholder">
                        <div class="qrcode-icon">📱</div>
                        <p>${isTest ? 'QR Code PIX (TESTE)' : 'Escaneie o QR Code'}</p>
                        <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">
                            ${isTest ? 'Modo de teste - Use o código PIX abaixo' : 'Use o código PIX abaixo ou escaneie'}
                        </p>
                    </div>
                `;
            }
        }

        // Preencher campo de código PIX (usar pixCode primeiro, depois qrCode)
        const pixCodeInput = document.getElementById('pixCode');
        if (pixCodeInput) {
            const codeToUse = pixCode || qrCode || '';
            pixCodeInput.value = codeToUse;
            console.log('📋 Código PIX preenchido no campo (tamanho:', codeToUse.length, ')');
        } else {
            console.error('Elemento pixCode não encontrado no DOM!');
        }
        document.getElementById('pixValue').textContent = `R$ ${valor.toFixed(2)}`;

        const pixStatus = document.getElementById('pixStatus');
        let statusHtml = `
            <div class="status-loading">
                <span>⏳</span> Aguardando pagamento${isTest ? ' (MODO TESTE)' : ''}...
            </div>
            <p style="margin-top: 10px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                Após o pagamento, a recarga será processada automaticamente
            </p>
        `;
        if (isTest) {
            statusHtml += `<button id="btnSimularPagamento" class="btn btn-primary" style="margin-top: 15px; width: 100%;">🧪 Simular Pagamento Aprovado (Teste)</button>`;
        }
        pixStatus.innerHTML = statusHtml;

        if (isTest) {
            document.getElementById('btnSimularPagamento').addEventListener('click', () => this.simulatePaymentApproval());
        }

        // Salvar ID do pagamento para verificação
        this.currentPaymentId = paymentId;

        // Verificar pagamento automaticamente a cada 3 segundos
        if (this.pixCheckInterval) {
            clearInterval(this.pixCheckInterval);
        }
        this.pixCheckInterval = setInterval(() => {
            this.checkPixPaymentSimulated();
        }, 3000);
    }

    simulatePaymentApproval() {
        // Aprovar pagamento simulado
        mercadoPago.approvePayment(this.currentPaymentId, this.selectedValue.salePrice || this.selectedValue.cost);
        this.showNotification('Pagamento simulado aprovado! Processando recarga...', 'success');
    }

    async checkPixPaymentSimulated() {
        if (!this.currentPaymentId) return;

        try {
            // Usar o módulo correto para verificar pagamento (prioridade: currentPaymentModule > revendedor > admin > padrão)
            const paymentModule = this.currentPaymentModule || this.revendedorPaymentModule || localStorage.getItem(`revendedorPaymentModule_${this.revendedorId}`) || localStorage.getItem('adminPaymentModule') || 'mercadopago';
            let payment;
            
            if (paymentModule === 'virtualpay') {
                await virtualPay.ensureAdminConfigLoaded(true);
                payment = await virtualPay.getPaymentStatus(this.currentPaymentId, { userId: this.revendedorId, isAdmin: false });
            } else if (paymentModule === 'pushinpay') {
                await pushinPay.ensureAdminConfigLoaded(true);
                payment = await pushinPay.getPaymentStatus(this.currentPaymentId, { userId: this.revendedorId, isAdmin: false });
            } else {
                await mercadoPago.ensureAdminConfigLoaded(true);
                payment = await mercadoPago.getPaymentStatus(this.currentPaymentId, { userId: this.revendedorId, isAdmin: false });
            }
            
            const statusElement = document.getElementById('pixStatus');
            if (statusElement) {
                if (payment.status === 'approved') {
                    // PROTEÇÃO CONTRA PROCESSAMENTO DUPLICADO
                    if (this._rechargeProcessing) {
                        console.log('Recarga já está sendo processada, ignorando...');
                        return;
                    }
                    this._rechargeProcessing = true;

                    statusElement.innerHTML = `
                        <div class="status-success">
                            <span>✓</span> Pagamento aprovado! Processando recarga...
                        </div>
                    `;
                    
                    // Parar verificação IMEDIATAMENTE
                    if (this.pixCheckInterval) {
                        clearInterval(this.pixCheckInterval);
                        this.pixCheckInterval = null;
                    }

                    // Persistir status aprovado no servidor
                    try {
                        await this.db.upsertTransaction(this.currentPaymentId, {
                            status: 'approved',
                            approved: true,
                            approvedAt: new Date().toISOString()
                        });
                    } catch (e) {
                        console.warn('Falha ao atualizar transação como aprovada:', e);
                    }

                    // Processar recarga automaticamente
                    try {
                        await this.processRecharge();
                    } catch (rechargeError) {
                        console.error('Erro ao processar recarga após pagamento:', rechargeError);
                        this._rechargeProcessing = false;
                    }
                } else if (payment.status === 'pending' || payment.status === 'in_process') {
                    const btnSimular = document.getElementById('btnSimularPagamento');
                    const isTest = !!this.isPixTestMode;
                    if (!btnSimular && isTest) {
                        statusElement.innerHTML = `
                            <div class="status-loading">
                                <span>⏳</span> Aguardando pagamento (MODO TESTE)...
                            </div>
                            <p style="margin-top: 10px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                                Após o pagamento, a recarga será processada automaticamente
                            </p>
                            <button id="btnSimularPagamento" class="btn btn-primary" style="margin-top: 15px; width: 100%;">
                                🧪 Simular Pagamento Aprovado (Teste)
                            </button>
                        `;
                        document.getElementById('btnSimularPagamento').addEventListener('click', () => this.simulatePaymentApproval());
                    } else if (!btnSimular && !isTest) {
                        statusElement.innerHTML = `
                            <div class="status-loading">
                                <span>⏳</span> Aguardando pagamento...
                            </div>
                            <p style="margin-top: 10px; font-size: 12px; color: var(--text-secondary); text-align: center;">
                                Após o pagamento, a recarga será processada automaticamente
                            </p>
                        `;
                    }
                }
            }
        } catch (error) {
            // Não mostrar erro se for erro de rota não encontrada (pode ser esperado se API não suportar verificação)
            const errorMessage = error.message || error.toString();
            if (errorMessage.includes('route') && errorMessage.includes('not be found')) {
                // Silenciar erro de rota não encontrada após primeira tentativa
                if (!this._routeNotFoundLogged) {
                    console.warn('⚠️ Rota de verificação de status não encontrada na API. Continuando verificação...');
                    this._routeNotFoundLogged = true;
                }
                // Continuar verificando, mas com intervalo maior
                if (this.pixCheckInterval) {
                    clearInterval(this.pixCheckInterval);
                    this.pixCheckInterval = setInterval(() => {
                        this.checkPixPaymentSimulated();
                    }, 10000); // Verificar a cada 10 segundos em vez de 3
                }
            } else {
                console.error('Erro ao verificar pagamento:', error);
            }
        }
    }

    async processRecharge() {
        try {
            // Recuperar dados da transação se necessário
            if (!this.selectedValue || !this.selectedCarrier || !this.selectedPhone) {
                console.log('Dados da recarga não estão em memória, tentando recuperar...');
                
                // 1) Tentar do servidor (SQLite via cache)
                const t = this.db.getTransactionById(this.currentPaymentId);
                if (t && t.selectedValue && t.selectedCarrier && t.selectedPhone) {
                    console.log('Dados recuperados do servidor/cache:', t);
                    this.selectedValue = t.selectedValue;
                    this.selectedCarrier = t.selectedCarrier;
                    this.selectedPhone = t.selectedPhone;
                } else {
                    // 2) Fallback: tentar de AMBAS as chaves localStorage
                    console.log('Tentando recuperar do localStorage...');
                    let transaction = null;
                    
                    // Tentar mp_transactions
                    try {
                        const mpTx = JSON.parse(localStorage.getItem('mp_transactions') || '{}');
                        if (mpTx[this.currentPaymentId]) transaction = mpTx[this.currentPaymentId];
                    } catch (e) { /* ignorar */ }
                    
                    // Tentar vp_transactions se não encontrou
                    if (!transaction) {
                        try {
                            const vpTx = JSON.parse(localStorage.getItem('vp_transactions') || '{}');
                            if (vpTx[this.currentPaymentId]) transaction = vpTx[this.currentPaymentId];
                        } catch (e) { /* ignorar */ }
                    }
                    
                    if (transaction && transaction.selectedValue && transaction.selectedCarrier && transaction.selectedPhone) {
                        console.log('Dados recuperados do localStorage:', transaction);
                        this.selectedValue = transaction.selectedValue;
                        this.selectedCarrier = transaction.selectedCarrier;
                        this.selectedPhone = transaction.selectedPhone;
                    }
                }
                
                // 3) Último recurso: tentar refresh do banco e buscar novamente
                if (!this.selectedValue || !this.selectedCarrier || !this.selectedPhone) {
                    console.log('Última tentativa: refresh do banco...');
                    try {
                        await this.db.refresh();
                        const t2 = this.db.getTransactionById(this.currentPaymentId);
                        if (t2 && t2.selectedValue && t2.selectedCarrier && t2.selectedPhone) {
                            console.log('Dados recuperados após refresh:', t2);
                            this.selectedValue = t2.selectedValue;
                            this.selectedCarrier = t2.selectedCarrier;
                            this.selectedPhone = t2.selectedPhone;
                        }
                    } catch (refreshErr) {
                        console.warn('Erro no refresh:', refreshErr);
                    }
                }
            }

            if (!this.selectedValue || !this.selectedCarrier || !this.selectedPhone) {
                throw new Error('Dados da recarga não encontrados. Por favor, entre em contato com o revendedor.');
            }

            // Garantir que selectedCarrier tem carrierId (normalizar _id -> carrierId)
            if (!this.selectedCarrier.carrierId && this.selectedCarrier._id) {
                this.selectedCarrier.carrierId = this.selectedCarrier._id;
            }

            // Valores para processamento
            const saldo = this.db.getSaldo(this.revendedorId);
            const costToDebit = this.selectedValue.cost || this.selectedValue.originalCost || this.selectedValue.salePrice;
            const salePrice = this.selectedValue.salePrice || this.selectedValue.cost || costToDebit;
            const originalValue = this.selectedValue.value || this.selectedValue.originalValue;
            
            console.log('Processando recarga:', {
                saldo,
                costToDebit,
                salePrice,
                originalValue
            });

            // Verificar saldo (se insuficiente, salvar como pendente)
            const saldoInsuficiente = saldo < costToDebit;

            if (saldoInsuficiente) {
                // Salvar recarga com status "aguardando_saldo" para o admin processar
                const revendedor = this.db.getUserById(this.revendedorId);
                
                // Obter API Key atual do servidor para associar à recarga
                let apiKeyAtual = '';
                try {
                    const configRes = await fetch('/api/data.php?action=config_get');
                    const configJson = await configRes.json();
                    if (configJson && configJson.success && configJson.data && configJson.data.adminApiKey) {
                        apiKeyAtual = configJson.data.adminApiKey;
                        // Se estiver mascarado, tentar do localStorage
                        if (apiKeyAtual.includes('*')) {
                            apiKeyAtual = localStorage.getItem('adminApiKey') || '';
                        }
                    }
                } catch (e) {
                    console.warn('Não foi possível obter API Key do servidor:', e);
                }
                
                const recargaData = {
                    userId: this.revendedorId,
                    username: revendedor.username,
                    apiOrderId: null,
                    phoneNumber: this.selectedPhone,
                    value: originalValue,
                    cost: costToDebit,
                    salePrice: salePrice,
                    profit: salePrice - costToDebit,
                    status: 'aguardando_saldo',
                    carrier: this.selectedCarrier.name,
                    carrierName: this.selectedCarrier.name,
                    carrierId: this.selectedCarrier.carrierId,
                    valueId: this.selectedValue.valueId,
                    paymentId: this.currentPaymentId,
                    paymentModule: this.currentPaymentModule || 'mercadopago',
                    origin: 'public',
                    type: 'recarga',
                    errorMessage: `Saldo insuficiente. Necessário: R$ ${costToDebit.toFixed(2)}, Disponível: R$ ${saldo.toFixed(2)}`,
                    requiresAdminAction: true,
                    apiKey: apiKeyAtual && !apiKeyAtual.includes('*') ? apiKeyAtual : '' // Salvar API Key usada
                };

                console.log('Salvando recarga pendente (saldo insuficiente):', recargaData);
                await this.db.createRecarga(recargaData);

                // Mostrar mensagem ao cliente
                this.showNotification('Pagamento recebido! Processamento pendente - aguardando confirmação do administrador.', 'success');
                
                const statusElement = document.getElementById('pixStatus');
                if (statusElement) {
                    statusElement.innerHTML = `
                        <div style="color: var(--warning-color); text-align: center; padding: 20px;">
                            <span style="font-size: 48px;">⚠️</span>
                            <h3 style="margin-top: 15px;">Pagamento Recebido!</h3>
                            <p style="margin-top: 10px;">
                                Sua recarga está aguardando processamento.
                            </p>
                            <p style="margin-top: 10px; font-weight: 600;">
                                Por favor, entre em contato com o administrador para finalizar o processamento.
                            </p>
                            <div style="margin-top: 20px; padding: 15px; background: rgba(255,193,7,0.1); border-radius: 8px; border: 1px solid var(--warning-color);">
                                <p style="font-size: 14px; margin: 5px 0;"><strong>Telefone:</strong> ${this.formatPhone(this.selectedPhone)}</p>
                                <p style="font-size: 14px; margin: 5px 0;"><strong>Valor:</strong> R$ ${originalValue.toFixed(2)}</p>
                                <p style="font-size: 14px; margin: 5px 0;"><strong>Operadora:</strong> ${this.selectedCarrier.name}</p>
                            </div>
                        </div>
                    `;
                }
                
                return; // Não continuar processamento
            }

            // Criar recarga via API do express.poeki.dev
            const rechargeData = {
                carrierId: this.selectedCarrier.carrierId,
                phoneNumber: this.selectedPhone,
                valueId: this.selectedValue.valueId
            };

            // Verificar se precisa de campo extra
            if (this.selectedCarrier.extraField?.required) {
                console.warn('Operadora requer campo extra, tentando sem ele...');
            }

            console.log('Enviando recarga para API:', rechargeData);
            const response = await this.api.createRecharge(rechargeData);

            if (response.success) {
                // Debitar do saldo do revendedor (usar custo real da API)
                await this.db.subtractSaldo(this.revendedorId, costToDebit);

                // Salvar recarga no banco local
                const revendedor = this.db.getUserById(this.revendedorId);
                
                // Obter API Key atual do servidor para associar à recarga
                let apiKeyAtual = '';
                try {
                    const configRes = await fetch('/api/data.php?action=config_get');
                    const configJson = await configRes.json();
                    if (configJson && configJson.success && configJson.data && configJson.data.adminApiKey) {
                        apiKeyAtual = configJson.data.adminApiKey;
                        // Se estiver mascarado, tentar do localStorage
                        if (apiKeyAtual.includes('*')) {
                            apiKeyAtual = localStorage.getItem('adminApiKey') || '';
                        }
                    }
                } catch (e) {
                    console.warn('Não foi possível obter API Key do servidor:', e);
                }
                
                const recargaData = {
                    userId: this.revendedorId,
                    username: revendedor.username,
                    apiOrderId: response.data._id,
                    phoneNumber: this.selectedPhone,
                    value: originalValue,
                    cost: costToDebit,
                    salePrice: salePrice,
                    profit: salePrice - costToDebit,
                    status: response.data.status || 'pendente',
                    carrier: response.data.carrier || this.selectedCarrier.name,
                    carrierName: this.selectedCarrier.name,
                    paymentId: this.currentPaymentId,
                    paymentModule: this.currentPaymentModule || 'mercadopago',
                    origin: 'public',
                    type: 'recarga',
                    apiKey: apiKeyAtual && !apiKeyAtual.includes('*') ? apiKeyAtual : '' // Salvar API Key usada
                };

                console.log('Salvando recarga:', recargaData);
                await this.db.createRecarga(recargaData);

                // Mostrar confirmação
                this.showConfirmation(response.data);
            } else {
                throw new Error(response.message || 'Erro ao processar recarga');
            }
        } catch (error) {
            this.showNotification(`Erro ao processar recarga: ${error.message}`, 'error');
            console.error('Erro ao processar recarga:', error);
            
            // Salvar recarga com erro para admin revisar
            try {
                const revendedor = this.db.getUserById(this.revendedorId);
                const costToDebit = this.selectedValue.cost || this.selectedValue.originalCost || this.selectedValue.salePrice;
                const salePrice = this.selectedValue.salePrice || this.selectedValue.cost || costToDebit;
                const originalValue = this.selectedValue.value || this.selectedValue.originalValue;
                
                // Obter API Key atual do servidor para associar à recarga
                let apiKeyAtual = '';
                try {
                    const configRes = await fetch('/api/data.php?action=config_get');
                    const configJson = await configRes.json();
                    if (configJson && configJson.success && configJson.data && configJson.data.adminApiKey) {
                        apiKeyAtual = configJson.data.adminApiKey;
                        // Se estiver mascarado, tentar do localStorage
                        if (apiKeyAtual.includes('*')) {
                            apiKeyAtual = localStorage.getItem('adminApiKey') || '';
                        }
                    }
                } catch (e) {
                    console.warn('Não foi possível obter API Key do servidor:', e);
                }
                
                const recargaData = {
                    userId: this.revendedorId,
                    username: revendedor.username,
                    apiOrderId: null,
                    phoneNumber: this.selectedPhone,
                    value: originalValue,
                    cost: costToDebit,
                    salePrice: salePrice,
                    profit: salePrice - costToDebit,
                    status: 'erro',
                    carrier: this.selectedCarrier.name,
                    carrierName: this.selectedCarrier.name,
                    carrierId: this.selectedCarrier.carrierId,
                    valueId: this.selectedValue.valueId,
                    paymentId: this.currentPaymentId,
                    paymentModule: this.currentPaymentModule || 'mercadopago',
                    origin: 'public',
                    type: 'recarga',
                    errorMessage: error.message,
                    requiresAdminAction: true,
                    apiKey: apiKeyAtual && !apiKeyAtual.includes('*') ? apiKeyAtual : '' // Salvar API Key usada
                };

                console.log('Salvando recarga com erro:', recargaData);
                await this.db.createRecarga(recargaData);
            } catch (saveError) {
                console.error('Erro ao salvar recarga com erro:', saveError);
            }
            
            // Mostrar erro na tela
            const statusElement = document.getElementById('pixStatus');
            if (statusElement) {
                statusElement.innerHTML = `
                    <div style="color: var(--warning-color); text-align: center; padding: 20px;">
                        <span style="font-size: 48px;">⚠️</span>
                        <h3 style="margin-top: 15px;">Pagamento Recebido!</h3>
                        <p style="margin-top: 10px;">
                            Houve um problema ao processar sua recarga automaticamente.
                        </p>
                        <p style="margin-top: 10px; font-weight: 600; color: var(--danger-color);">
                            ${error.message}
                        </p>
                        <p style="margin-top: 15px; font-weight: 600;">
                            Por favor, entre em contato com o administrador para finalizar o processamento.
                        </p>
                        <div style="margin-top: 20px; padding: 15px; background: rgba(255,193,7,0.1); border-radius: 8px; border: 1px solid var(--warning-color);">
                            <p style="font-size: 14px; margin: 5px 0;"><strong>Telefone:</strong> ${this.formatPhone(this.selectedPhone)}</p>
                            <p style="font-size: 14px; margin: 5px 0;"><strong>Valor:</strong> R$ ${(this.selectedValue.value || this.selectedValue.originalValue).toFixed(2)}</p>
                            <p style="font-size: 14px; margin: 5px 0;"><strong>Operadora:</strong> ${this.selectedCarrier.name}</p>
                        </div>
                    </div>
                `;
            }
        }
    }

    async _updateConfirmationStatus(novoStatus, orderId) {
        const badgeText = document.getElementById('confirmationStatusBadgeText');
        if (badgeText) badgeText.textContent = novoStatus;
        if (this.currentReceiptData) this.currentReceiptData.status = novoStatus;
        const statusStr = String(novoStatus).toLowerCase();
        const feita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(statusStr);
        if (feita) {
            const badge = document.getElementById('confirmationStatusBadge');
            const note = document.getElementById('receiptNote');
            const wrap = document.getElementById('receiptWrap');
            if (badge) badge.classList.add('concluida');
            if (badgeText) badgeText.textContent = 'Recarga concluída';
            if (note) note.textContent = 'Recarga concluída — Comprovante válido.';
            if (wrap) wrap.classList.add('receipt-valid');
        }
        const recargas = this.db.getAllRecargas();
        const rec = recargas.find(r => r.apiOrderId === orderId);
        if (rec) await this.db.updateRecarga(rec.id, { status: novoStatus }).catch(() => {});
    }

    _showRecargaSucesso() {
        const badge = document.getElementById('confirmationStatusBadge');
        const badgeText = document.getElementById('confirmationStatusBadgeText');
        const note = document.getElementById('receiptNote');
        const wrap = document.getElementById('receiptWrap');
        if (badge) badge.classList.add('concluida');
        if (badgeText) badgeText.textContent = 'Recarga concluída';
        if (note) note.textContent = 'Recarga concluída — Comprovante válido.';
        if (wrap) wrap.classList.add('receipt-valid');

        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Recarga realizada!',
                text: 'Sua recarga foi processada com sucesso. O comprovante já é válido.',
                confirmButtonText: 'OK',
                confirmButtonColor: '#00d084',
                timer: 4000,
                timerProgressBar: true
            });
        } else {
            this.showNotification('✓ Recarga realizada com sucesso! Comprovante válido.', 'success');
        }
    }

    _stopStatusPolling() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }

    _startStatusPolling(orderId) {
        this._stopStatusPolling();
        const INTERVALO_MS = 5000;
        const MAX_TENTATIVAS = 120; // 10 min (120 x 5s)
        let tentativas = 0;

        this.statusCheckInterval = setInterval(async () => {
            tentativas++;
            if (tentativas > MAX_TENTATIVAS) {
                this._stopStatusPolling();
                return;
            }
            try {
                const res = await this.api.getOrder(orderId);
                if (res && res.success && res.data && res.data.status != null) {
                    const status = res.data.status.toString().toLowerCase();
                    const statusFeita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(status);
                    
                    await this._updateConfirmationStatus(res.data.status, orderId);
                    
                    if (statusFeita) {
                        this._stopStatusPolling();
                        this._showRecargaSucesso();
                    }
                }
            } catch (e) {
                console.warn('Erro ao verificar status:', e);
            }
        }, INTERVALO_MS);
    }

    showConfirmation(orderData) {
        const orderId = orderData._id;
        const salePrice = this.selectedValue.salePrice || this.selectedValue.cost || this.selectedValue.value;
        const statusInicial = (orderData.status || 'pendente').toString().toLowerCase();
        const statusFeita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(statusInicial);

        // Link fixo para acompanhar (funciona mesmo saindo da página)
        const baseUrl = window.location.origin + window.location.pathname;
        const statusLink = `${baseUrl}?revendedor=${encodeURIComponent(this.revendedorId)}&pedido=${encodeURIComponent(orderId)}`;
        const linkInput = document.getElementById('confirmationStatusLinkInput');
        if (linkInput) linkInput.value = statusLink;

        // Copiar link
        const btnCopy = document.getElementById('btnCopyStatusLink');
        if (btnCopy) {
            btnCopy.onclick = () => {
                linkInput.select();
                linkInput.setSelectionRange(0, 99999);
                try {
                    navigator.clipboard.writeText(statusLink);
                    this.showNotification('Link copiado! Guarde para acompanhar o status.', 'success');
                } catch (e) {
                    document.execCommand('copy');
                    this.showNotification('Link copiado!', 'success');
                }
            };
        }

        // Nova recarga (sem pedido na URL)
        const btnNova = document.getElementById('btnNovaRecargaConfirm');
        if (btnNova) btnNova.href = `${baseUrl}?revendedor=${encodeURIComponent(this.revendedorId)}`;

        // Preencher comprovante
        const receiptDate = document.getElementById('receiptDate');
        if (receiptDate) receiptDate.textContent = new Date().toLocaleString('pt-BR');
        const receiptCarrier = document.getElementById('receiptCarrier');
        if (receiptCarrier) receiptCarrier.textContent = this.selectedCarrier.name;
        const receiptPhone = document.getElementById('receiptPhone');
        if (receiptPhone) receiptPhone.textContent = this.formatPhone(this.selectedPhone);
        const receiptValue = document.getElementById('receiptValue');
        if (receiptValue) receiptValue.textContent = 'R$ ' + this.selectedValue.value.toFixed(2);
        const receiptPaid = document.getElementById('receiptPaid');
        if (receiptPaid) receiptPaid.textContent = 'R$ ' + salePrice.toFixed(2);
        const receiptOrderId = document.getElementById('receiptOrderId');
        if (receiptOrderId) receiptOrderId.textContent = orderId;

        // Salvar para download e para view de status (link fixo)
        this.currentReceiptData = {
            carrier: this.selectedCarrier.name,
            phone: this.formatPhone(this.selectedPhone),
            value: this.selectedValue.value.toFixed(2),
            paid: salePrice.toFixed(2),
            orderId: orderId,
            date: new Date().toLocaleString('pt-BR'),
            status: orderData.status || 'pendente'
        };
        try {
            localStorage.setItem(`recarga_receipt_${orderId}`, JSON.stringify(this.currentReceiptData));
        } catch (e) {}

        // Título e badge de status
        const titleEl = document.getElementById('confirmationTitle');
        const subtitleEl = document.getElementById('confirmationSubtitle');
        const badgeEl = document.getElementById('confirmationStatusBadge');
        const badgeTextEl = document.getElementById('confirmationStatusBadgeText');
        const receiptNoteEl = document.getElementById('receiptNote');
        const receiptWrapEl = document.getElementById('receiptWrap');
        if (titleEl) titleEl.textContent = 'Pagamento confirmado';
        if (subtitleEl) subtitleEl.textContent = 'Sua recarga está sendo processada. Guarde o link abaixo para acompanhar a qualquer momento.';
        if (badgeEl) {
            badgeEl.classList.remove('concluida');
            if (statusFeita) badgeEl.classList.add('concluida');
        }
        if (badgeTextEl) badgeTextEl.textContent = statusFeita ? 'Recarga concluída' : 'Processando';
        if (receiptNoteEl) receiptNoteEl.textContent = statusFeita ? 'Recarga concluída — Comprovante válido.' : 'Quando a recarga for concluída, o comprovante abaixo será válido.';
        if (receiptWrapEl) receiptWrapEl.classList.toggle('receipt-valid', statusFeita);

        this.showStep(4);

        // Botão atualizar status
        const btnAtualizar = document.getElementById('btnAtualizarStatusConfirm');
        if (btnAtualizar) {
            btnAtualizar.onclick = async () => {
                try {
                    const res = await this.api.getOrder(orderId);
                    if (res && res.success && res.data && res.data.status != null) {
                        await this._updateConfirmationStatus(res.data.status, orderId);
                        const status = res.data.status.toString().toLowerCase();
                        const feita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(status);
                        if (feita) {
                            this._stopStatusPolling();
                            this._showRecargaSucesso();
                        }
                    }
                } catch (e) {
                    console.warn('Erro ao atualizar status:', e);
                    this.showNotification('Erro ao atualizar status. Tente novamente.', 'error');
                }
            };
        }

        if (statusFeita) {
            this._showRecargaSucesso();
        } else {
            this._startStatusPolling(orderId);
        }
    }

    copyPixCode() {
        const pixCode = document.getElementById('pixCode');
        pixCode.select();
        document.execCommand('copy');
        this.showNotification('Código PIX copiado!', 'success');
    }

    /**
     * Pré-visualizar a tela de confirmação/comprovante com dados de exemplo.
     * No navegador: abra o link de recarga (com ?revendedor=ID), abra o Console (F12) e digite:
     *   recargaPublic.previewComprovante()
     * Para ver também a versão "recarga concluída": recargaPublic.previewComprovante(true)
     */
    previewComprovante(comoConcluida = false) {
        if (!this.revendedorId) {
            this.showNotification('Abra a página pelo link do revendedor (ex: ?revendedor=1) antes.', 'error');
            return;
        }
        this.selectedCarrier = this.selectedCarrier || { name: 'Claro' };
        this.selectedValue = this.selectedValue || { value: 20, salePrice: 22, cost: 19 };
        this.selectedPhone = this.selectedPhone || '11999998888';
        const orderId = 'PREVIEW-' + Date.now();
        this.showConfirmation({
            _id: orderId,
            status: comoConcluida ? 'feita' : 'pendente'
        });
        this.showNotification('Preview do comprovante (dados de teste)', 'success');
    }

    cancelPayment() {
        if (confirm('Deseja cancelar o pagamento?')) {
            window.location.reload();
        }
    }

    showStep(step) {
        document.querySelectorAll('.recarga-step').forEach(s => {
            s.classList.remove('active');
            s.style.display = '';
        });
        const el = document.getElementById(`step${step}`);
        if (el) {
            el.style.display = 'block';
            el.classList.add('active');
        }
        this.currentStep = step;
    }

    // View de status ao abrir o link fixo (?revendedor=X&pedido=Y)
    async loadStatusView(pedidoId) {
        this.showStep(5);
        const content = document.getElementById('statusContent');
        const actions = document.getElementById('statusActions');
        const btnNova = document.getElementById('statusBtnNovaRecarga');
        if (!content) return;

        const baseUrl = window.location.origin + window.location.pathname;
        const linkNovaRecarga = `${baseUrl}?revendedor=${encodeURIComponent(this.revendedorId)}`;
        if (btnNova) btnNova.href = linkNovaRecarga;

        content.innerHTML = `
            <div class="status-loading-state">
                <span class="status-loading-spinner"></span>
                <p>Carregando status...</p>
            </div>
        `;

        try {
            const res = await this.api.getOrder(pedidoId);
            const data = res && res.success && res.data ? res.data : null;
            const status = data && data.status != null ? String(data.status).toLowerCase() : 'desconhecido';
            const statusFeita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(status);

            let html = `<div class="status-badge ${statusFeita ? 'concluida' : 'processando'}">`;
            html += `<span>${statusFeita ? '✓' : '⏳'}</span>`;
            html += `<span>${statusFeita ? 'Recarga concluída' : 'Recarga em processamento'}</span></div>`;
            html += `<p style="margin: 0 0 8px; font-size: 0.875rem; color: var(--recarga-muted);">ID do pedido</p>`;
            html += `<p style="margin: 0 0 16px; font-weight: 600; word-break: break-all; font-size: 0.9375rem;">${pedidoId}</p>`;

            if (statusFeita) {
                let receipt = null;
                try {
                    const stored = localStorage.getItem(`recarga_receipt_${pedidoId}`);
                    if (stored) receipt = JSON.parse(stored);
                } catch (e) {}
                if (receipt) {
                    html += `<div class="status-receipt-block">`;
                    html += `<p style="font-size: 0.875rem; font-weight: 600; color: #059669; margin-bottom: 12px;">✓ Comprovante válido</p>`;
                    html += `<div class="receipt-card"><div class="receipt-card-body">`;
                    html += `<div class="receipt-row"><span class="receipt-label">Operadora</span><span>${(receipt.carrier || '-')}</span></div>`;
                    html += `<div class="receipt-row"><span class="receipt-label">Número</span><span>${(receipt.phone || '-')}</span></div>`;
                    html += `<div class="receipt-row"><span class="receipt-label">Valor</span><span>${(receipt.value != null ? 'R$ ' + receipt.value : receipt.paid ? 'R$ ' + receipt.paid : '-')}</span></div>`;
                    html += `<div class="receipt-row receipt-row-id"><span class="receipt-label">ID</span><span class="receipt-order-id">${pedidoId}</span></div>`;
                    html += `</div></div></div>`;
                } else {
                    html += `<div class="status-receipt-block"><p style="font-size: 0.875rem; color: var(--recarga-muted);">Recarga concluída. Comprovante completo disponível na sessão em que você realizou o pagamento.</p></div>`;
                }
            }

            content.innerHTML = html;
            if (actions) actions.style.display = 'block';
        } catch (e) {
            console.warn('Erro ao carregar status do pedido:', e);
            content.innerHTML = `
                <div class="status-badge erro"><span>!</span><span>Erro ao carregar</span></div>
                <p style="margin: 0 0 12px; font-size: 0.875rem; color: var(--recarga-muted);">Não foi possível carregar o status. Verifique o link ou tente mais tarde.</p>
                <p style="margin: 0; font-size: 0.8125rem; word-break: break-all;">ID: ${pedidoId}</p>
            `;
            if (actions) actions.style.display = 'block';
        }
    }

    formatPhone(phone) {
        const clean = phone.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
        }
        return phone;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await db.init();
    window.recargaPublic = new RecargaPublic();
});

