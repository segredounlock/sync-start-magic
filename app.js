// Garante que db.getTransactions exista (compatibilidade com cache antigo de database.js)
if (typeof db !== 'undefined' && typeof db.getTransactions !== 'function') {
    db.getTransactions = function() { return Array.isArray(this._cache && this._cache.transactions) ? this._cache.transactions.slice() : []; };
}

// Não persistir dados no navegador: usar sessionStorage no lugar de localStorage.
// Assim nada fica gravado após fechar o navegador (sem "lembrar sessão").
const localStorage = window.sessionStorage;

// Main Application Logic
class RecargaApp {
    constructor() {
        this.api = api;
        this.db = db;
        this.currentUser = null;
        this.catalog = [];
        this.currentPage = 1;
        this.appTitle = 'Recarga Express';
        this.vendasStatusPollInterval = null;
        this.catalogRefreshInterval = null;
        this.listenersAttached = false;  // Flag para evitar múltiplos listeners
        this.currentReceiptData = null;  // Dados do comprovante atual para download
        
        // Aguardar DOM estar pronto antes de inicializar
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.init();
            });
        } else {
            this.init();
        }
    }

    async init() {
        try {
        await db.init();
            
            // Verificar se há usuários no banco
            if (db._cache.users.length === 0) {
                console.warn('Nenhum usuário encontrado no banco. Verificando se há usuário admin padrão...');
                try {
                    // Tentar buscar usuário admin do servidor
                    const adminUser = await db._req('user_get', { username: 'admin' }, 'GET');
                    if (adminUser) {
                        db._cache.users.push(adminUser);
                    } else {
                        console.warn('Usuário admin não encontrado. O banco pode estar vazio.');
                    }
                } catch (e) {
                    console.error('Erro ao verificar usuário admin:', e);
                }
            }
            
        // Carregar configurações primeiro para garantir que API key está configurada
        await this.loadAdminConfig();
        this.setupEventListeners();
        this.checkAuth();
        } catch (error) {
            console.error('Erro na inicialização:', error);
            this.showNotification(`Erro ao inicializar: ${error.message}`, 'error');
        }
    }

    async loadAdminConfig() {
        // Garantir que sempre tenta carregar API key do localStorage se não estiver configurada
        const currentApiKey = this.api.apiKey;
        const currentBaseURL = this.api.baseURL;
        
        // Se não há API key configurada, tentar carregar do localStorage
        if (!currentApiKey || currentApiKey.trim() === '') {
            const storedKey = localStorage.getItem('adminApiKey') || '';
            if (storedKey && !storedKey.includes('*') && storedKey.trim() !== '') {
                this.api.setApiKey(storedKey);
            }
        }
        
        // Se não há Base URL configurada, tentar carregar do localStorage
        if (!currentBaseURL || currentBaseURL.trim() === '') {
            const storedURL = localStorage.getItem('adminApiBaseURL') || '';
            if (storedURL && storedURL.trim() !== '') {
                this.api.setBaseURL(storedURL);
            }
        }
        // SEMPRE carregar do servidor primeiro (fonte da verdade)
        // Isso garante que funciona em modo anônimo, outras sessões e navegadores
        let apiKey = '';
        let baseURL = '';
        let modo = 'prod';
        let keyTest = '';
        let keyProd = '';

        try {
            const r = await fetch('api/data.php?action=config_get');
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                // API Key e Base URL (sempre usar do servidor se disponível)
                // Se o valor do servidor está mascarado (contém *), usar do localStorage
                if (c.adminApiKey !== undefined && c.adminApiKey !== null && c.adminApiKey !== '') {
                    if (c.adminApiKey.includes('*')) {
                        // Valor mascarado do servidor, usar do localStorage se existir
                        const storedKey = localStorage.getItem('adminApiKey') || '';
                        apiKey = storedKey && !storedKey.includes('*') ? storedKey : '';
                    } else {
                        // Valor não mascarado do servidor, usar ele
                        apiKey = c.adminApiKey;
                        if (apiKey && apiKey.trim() !== '') {
                            localStorage.setItem('adminApiKey', apiKey);
                        }
                    }
                } else {
                    // Fallback para localStorage apenas se servidor não tiver
                    const storedKey = localStorage.getItem('adminApiKey') || '';
                    apiKey = storedKey && !storedKey.includes('*') ? storedKey : '';
                }
                if (c.adminApiBaseURL !== undefined && c.adminApiBaseURL !== null && c.adminApiBaseURL !== '') {
                    baseURL = c.adminApiBaseURL;
                    localStorage.setItem('adminApiBaseURL', baseURL);
                } else {
                    baseURL = localStorage.getItem('adminApiBaseURL') || '';
                }
                // Mercado Pago configs (sempre usar do servidor se disponível)
                if (c.adminMercadoPagoModo !== undefined && c.adminMercadoPagoModo !== null) { 
                    modo = (c.adminMercadoPagoModo === 'test' || c.adminMercadoPagoModo === 'prod') ? c.adminMercadoPagoModo : 'prod'; 
                    localStorage.setItem('adminMercadoPagoModo', modo); 
                } else {
                    modo = localStorage.getItem('adminMercadoPagoModo') || 'prod';
                }
                // Chaves sensíveis: se servidor retornar mascarado (contém *), manter localStorage
                if (c.adminMercadoPagoKeyTest !== undefined && c.adminMercadoPagoKeyTest !== null) { 
                    if (c.adminMercadoPagoKeyTest.includes('*') || c.adminMercadoPagoKeyTest === '') {
                        // Valor mascarado, manter localStorage existente
                        keyTest = localStorage.getItem('adminMercadoPagoKeyTest') || '';
                    } else {
                        // Valor não mascarado (não deveria acontecer, mas por segurança)
                        keyTest = c.adminMercadoPagoKeyTest || '';
                        localStorage.setItem('adminMercadoPagoKeyTest', keyTest);
                    }
                } else {
                    keyTest = localStorage.getItem('adminMercadoPagoKeyTest') || '';
                }
                if (c.adminMercadoPagoKeyProd !== undefined && c.adminMercadoPagoKeyProd !== null) { 
                    if (c.adminMercadoPagoKeyProd.includes('*') || c.adminMercadoPagoKeyProd === '') {
                        keyProd = localStorage.getItem('adminMercadoPagoKeyProd') || localStorage.getItem('adminMercadoPagoKey') || '';
                    } else {
                        keyProd = c.adminMercadoPagoKeyProd || '';
                        localStorage.setItem('adminMercadoPagoKeyProd', keyProd);
                    }
                } else {
                    keyProd = localStorage.getItem('adminMercadoPagoKeyProd') || localStorage.getItem('adminMercadoPagoKey') || '';
                }
                // Virtual Pay configs: manter localStorage se servidor retornar mascarado
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
                // PushinPay configs: manter localStorage se servidor retornar mascarado
                if (c.adminPushinPayToken !== undefined && c.adminPushinPayToken !== null) {
                    if (!c.adminPushinPayToken.includes('*') && c.adminPushinPayToken !== '') {
                        localStorage.setItem('adminPushinPayToken', c.adminPushinPayToken);
                    }
                }
                // Módulo de pagamento selecionado
                if (c.adminPaymentModule !== undefined && c.adminPaymentModule !== null) {
                    const paymentModule = (c.adminPaymentModule === 'mercadopago' || c.adminPaymentModule === 'virtualpay' || c.adminPaymentModule === 'pushinpay') ? c.adminPaymentModule : 'mercadopago';
                    localStorage.setItem('adminPaymentModule', paymentModule);
                } else {
                    localStorage.setItem('adminPaymentModule', 'mercadopago'); // Padrão
                }
                if (c.siteTitle !== undefined && c.siteTitle !== null && String(c.siteTitle).trim() !== '') {
                    this.appTitle = String(c.siteTitle).trim();
                } else {
                    this.appTitle = 'Recarga Express';
                }
                this.applyAppTitle();
                const siteTitleInput = document.getElementById('configSiteTitle');
                if (siteTitleInput) siteTitleInput.value = this.appTitle;
            } else {
                // Se servidor não retornar dados, usar localStorage como fallback
                apiKey = localStorage.getItem('adminApiKey') || '';
                baseURL = localStorage.getItem('adminApiBaseURL') || '';
                modo = localStorage.getItem('adminMercadoPagoModo') || 'prod';
                keyTest = localStorage.getItem('adminMercadoPagoKeyTest') || '';
                keyProd = localStorage.getItem('adminMercadoPagoKeyProd') || localStorage.getItem('adminMercadoPagoKey') || '';
                this.appTitle = 'Recarga Express';
                const siteTitleInput = document.getElementById('configSiteTitle');
                if (siteTitleInput) siteTitleInput.value = this.appTitle;
            }
            this.applyAppTitle();
        } catch (e) { 
            // Se não conseguir carregar do servidor, usar valores do localStorage
            console.warn('Não foi possível carregar configurações do servidor:', e);
            apiKey = localStorage.getItem('adminApiKey') || '';
            baseURL = localStorage.getItem('adminApiBaseURL') || '';
            modo = localStorage.getItem('adminMercadoPagoModo') || 'prod';
            keyTest = localStorage.getItem('adminMercadoPagoKeyTest') || '';
            keyProd = localStorage.getItem('adminMercadoPagoKeyProd') || localStorage.getItem('adminMercadoPagoKey') || '';
        }
        this.applyAppTitle();

        this.api.setApiKey(apiKey);
        this.api.setBaseURL(baseURL);

        const apiKeyInput = document.getElementById('adminApiKey');
        const apiBaseUrlInput = document.getElementById('adminApiBaseUrl');
        const modoSelect = document.getElementById('adminMercadoPagoModo');
        const keyTestInput = document.getElementById('adminMercadoPagoKeyTest');
        const keyProdInput = document.getElementById('adminMercadoPagoKeyProd');
        const virtualPayClientIdInput = document.getElementById('adminVirtualPayClientId');
        const virtualPayClientSecretInput = document.getElementById('adminVirtualPayClientSecret');
        const pushinPayTokenInput = document.getElementById('adminPushinPayToken');
        const paymentModuleSelect = document.getElementById('adminPaymentModule');
        
        // Se apiKey está vazio ou mascarado, deixar o campo vazio para permitir edição
        // Mas garantir que a API key do localStorage seja usada pela instância da API
        if (apiKeyInput) {
            if (apiKey && !apiKey.includes('*') && apiKey.length > 0) {
                // Se tem valor real não mascarado, preencher o campo
                apiKeyInput.value = apiKey;
            } else {
                // Deixar vazio se não houver valor real ou se estiver mascarado
                // Mas usar a API key do localStorage se existir
                apiKeyInput.value = '';
                const storedApiKey = localStorage.getItem('adminApiKey') || '';
                if (storedApiKey && !storedApiKey.includes('*')) {
                    // Se há uma API key válida no localStorage, usar ela
                    this.api.setApiKey(storedApiKey);
                    apiKey = storedApiKey; // Atualizar variável local
                }
            }
        }
        if (apiBaseUrlInput) apiBaseUrlInput.value = baseURL;
        
        // Garantir que a API key e baseURL estejam configuradas
        // Se apiKey está vazio ou mascarado, tentar usar do localStorage
        let finalApiKey = apiKey;
        if (!finalApiKey || finalApiKey.includes('*') || finalApiKey.trim() === '') {
            const storedKey = localStorage.getItem('adminApiKey') || '';
            if (storedKey && !storedKey.includes('*') && storedKey.trim() !== '') {
                finalApiKey = storedKey;
            }
        }
        
        if (finalApiKey && !finalApiKey.includes('*') && finalApiKey.trim() !== '') {
            this.api.setApiKey(finalApiKey);
        }
        if (baseURL && baseURL.trim() !== '') {
            this.api.setBaseURL(baseURL);
        }
        if (modoSelect) {
            modoSelect.value = modo;
            // Forçar atualização visual do select
            modoSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
        if (keyTestInput) keyTestInput.value = keyTest;
        if (keyProdInput) keyProdInput.value = keyProd;
        
        // Virtual Pay - já carregado acima do servidor, apenas preencher os campos
        const virtualPayClientId = localStorage.getItem('adminVirtualPayClientId') || '';
        const virtualPayClientSecret = localStorage.getItem('adminVirtualPayClientSecret') || '';
        if (virtualPayClientIdInput) virtualPayClientIdInput.value = virtualPayClientId;
        if (virtualPayClientSecretInput) virtualPayClientSecretInput.value = virtualPayClientSecret;
        
        // PushinPay - não mostrar a chave quando já configurada, apenas placeholder
        const pushinPayToken = localStorage.getItem('adminPushinPayToken') || '';
        if (pushinPayTokenInput) {
            // Se já tem token configurado, deixar campo vazio e mostrar apenas placeholder
            if (pushinPayToken && pushinPayToken.trim() !== '') {
                pushinPayTokenInput.value = '';
                pushinPayTokenInput.placeholder = 'Token já configurado. Digite novo token no formato: ID|TOKEN';
            } else {
                pushinPayTokenInput.value = '';
                pushinPayTokenInput.placeholder = '61654|v8bWGW6CqckhBygzIYDDvEPmEJcstrVR1BtYhut110a55e52';
            }
        }
        
        // Módulo de pagamento
        const paymentModule = localStorage.getItem('adminPaymentModule') || 'mercadopago';
        if (paymentModuleSelect) {
            paymentModuleSelect.value = paymentModule;
        }
        this.updateAdminPaymentPanel();
    }

    applyAppTitle() {
        const title = this.appTitle || 'Recarga Express';
        const text = '⚡ ' + title;
        const loginLogo = document.querySelector('#loginScreen .login-logo');
        if (loginLogo) loginLogo.textContent = text;
        const appLogo = document.querySelector('.logo');
        if (appLogo) appLogo.textContent = text;
        document.title = title + ' - Painel de Revenda';
    }

    updateAdminPaymentPanel() {
        const select = document.getElementById('adminPaymentModule');
        if (!select) return;
        const module = (select.value === 'mercadopago' || select.value === 'virtualpay' || select.value === 'pushinpay') ? select.value : 'mercadopago';
        document.querySelectorAll('.payment-credentials-panel').forEach(panel => {
            panel.style.display = panel.dataset.module === module ? 'block' : 'none';
        });
    }

    async checkAuth() {
        try {
        // Garantir que o banco está inicializado antes de verificar autenticação
        if (!this.db._ready) {
            await this.db.init();
        } else {
            await this.db._ready;
        }
        
            const realStorage = window.localStorage;
            try {
                const stored = realStorage.getItem('currentUser');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    if (parsed && parsed.id) {
                        let user = this.db.getUserById(parsed.id);
                        
                        // Se não encontrou no cache, tentar buscar do servidor
                        if (!user) {
                            try {
                                const serverUser = await this.db._req('user_getById', { id: parsed.id }, 'GET');
                                if (serverUser) {
                                    const existingIndex = this.db._cache.users.findIndex(u => String(u.id) === String(parsed.id));
                                    if (existingIndex >= 0) {
                                        this.db._cache.users[existingIndex] = serverUser;
                                    } else {
                                        this.db._cache.users.push(serverUser);
                                    }
                                    user = serverUser;
                                }
                            } catch (e) {
                                console.error('Erro ao buscar usuário do servidor em checkAuth:', e);
                            }
                        }
                        
                        if (user && user.active) {
                            this.currentUser = user;
                            document.getElementById('loginScreen').style.display = 'none';
                            document.getElementById('appScreen').style.display = 'block';
                            this.loadUserInterface();
                            return;
                        }
                    }
                }
            } catch (e) {
                console.error('Erro ao verificar sessão:', e);
            }
        this.currentUser = null;
            try { realStorage.removeItem('currentUser'); } catch (_) {}
        try { localStorage.removeItem('currentUser'); } catch (_) {}
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
        } catch (error) {
            console.error('Erro em checkAuth:', error);
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('appScreen').style.display = 'none';
        }
    }

    setupEventListeners() {
        // Evitar adicionar listeners múltiplas vezes
        if (this.listenersAttached) return;
        this.listenersAttached = true;

        // Login - onclick inline + addEventListener
        const loginBtn = document.getElementById('loginBtn');
        const loginForm = document.getElementById('loginForm');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
                this.handleLogin();
        });
        }
        // Cadastro com código de convite (tela de login)
        const showInviteBtn = document.getElementById('showInviteRegisterBtn');
        const hideInviteBtn = document.getElementById('hideInviteRegisterBtn');
        const inviteRegisterCard = document.getElementById('inviteRegisterCard');
        const inviteRegisterForm = document.getElementById('inviteRegisterForm');
        const inviteCodeInput = document.getElementById('inviteCode');
        const inviteCodeHint = document.getElementById('inviteCodeHint');
        if (showInviteBtn) {
            showInviteBtn.addEventListener('click', () => {
                if (inviteRegisterCard) {
                    inviteRegisterCard.style.display = 'block';
                    requestAnimationFrame(() => {
                        inviteRegisterCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                }
                const params = new URLSearchParams(window.location.search);
                if (params.get('invite') && inviteCodeInput) inviteCodeInput.value = params.get('invite').trim();
                if (inviteCodeInput && inviteCodeInput.value.trim()) this.validateInviteCode(inviteCodeInput.value.trim());
            });
        }
        if (hideInviteBtn) {
            hideInviteBtn.addEventListener('click', () => {
                if (inviteRegisterCard) inviteRegisterCard.style.display = 'none';
            });
        }
        if (inviteCodeInput) {
            inviteCodeInput.addEventListener('blur', () => {
                const code = inviteCodeInput.value.trim();
                if (code.length >= 4) this.validateInviteCode(code);
                else if (inviteCodeHint) inviteCodeHint.textContent = '';
            });
        }
        if (inviteRegisterForm) {
            inviteRegisterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitInviteRegister();
            });
        }
        // Se URL tiver ?invite=CODE, mostrar formulário de cadastro e preencher código
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('invite') && inviteRegisterCard && inviteCodeInput) {
            inviteCodeInput.value = urlParams.get('invite').trim();
            inviteRegisterCard.style.display = 'block';
            if (inviteCodeInput.value.trim().length >= 4) this.validateInviteCode(inviteCodeInput.value.trim());
            requestAnimationFrame(() => {
                inviteRegisterCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Admin tabs (currentTarget = botão .tab ao clicar em ícone ou texto)
        document.querySelectorAll('#adminTabs .tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) this.switchTab(tabName);
            });
        });

        // Revendedor tabs
        document.querySelectorAll('#revendedorTabs .tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) this.switchTab(tabName);
            });
        });

        // Menu drawer (mobile)
        const menuDrawerBtn = document.getElementById('menuDrawerBtn');
        const menuDrawerOverlay = document.getElementById('menuDrawerOverlay');
        const menuDrawerClose = document.getElementById('menuDrawerClose');
        if (menuDrawerBtn) {
            menuDrawerBtn.addEventListener('click', () => this.openMenuDrawer());
        }
        if (menuDrawerOverlay) {
            menuDrawerOverlay.addEventListener('click', (e) => {
                if (e.target === menuDrawerOverlay) this.closeMenuDrawer();
            });
        }
        if (menuDrawerClose) {
            menuDrawerClose.addEventListener('click', () => this.closeMenuDrawer());
        }
        document.querySelectorAll('.menu-drawer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) {
                    this.switchTab(tabName);
                    this.closeMenuDrawer();
                }
            });
        });

        // Admin: Add Revendedor
        document.getElementById('addRevendedorBtn').addEventListener('click', () => {
            this.openModal('addRevendedorModal');
        });

        const revSearchEl = document.getElementById('revendedoresSearch');
        if (revSearchEl) {
            revSearchEl.addEventListener('input', () => { this.filterRevendedoresList(); this.updateRevendedoresSearchClear(); });
            revSearchEl.addEventListener('search', () => { this.filterRevendedoresList(); this.updateRevendedoresSearchClear(); });
        }
        const revSearchClearBtn = document.getElementById('revendedoresSearchClear');
        if (revSearchClearBtn) {
            revSearchClearBtn.addEventListener('click', () => {
                const inp = document.getElementById('revendedoresSearch');
                if (inp) { inp.value = ''; inp.focus(); this.filterRevendedoresList(); this.updateRevendedoresSearchClear(); }
            });
        }

        document.getElementById('closeAddRevendedorBtn').addEventListener('click', () => {
            this.closeModal('addRevendedorModal');
        });

        document.getElementById('addRevendedorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createRevendedor();
        });

        document.getElementById('closeEditRevendedorBtn').addEventListener('click', () => {
            this.closeModal('editRevendedorModal');
        });

        document.getElementById('editRevendedorForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditRevendedor();
        });

        // Admin: Add Saldo
        document.getElementById('closeAddSaldoBtn').addEventListener('click', () => {
            this.closeModal('addSaldoModal');
        });

        document.getElementById('addSaldoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addSaldoToRevendedor();
        });

        // Admin: Save Config
        const saveAdminConfigBtn = document.getElementById('saveAdminConfigBtn');
        if (saveAdminConfigBtn) {
            saveAdminConfigBtn.addEventListener('click', () => {
                this.saveAdminConfig();
            });
        }

        // Admin: trocar login (usuário/senha)
        const changeAdminPasswordBtn = document.getElementById('changeAdminPasswordBtn');
        if (changeAdminPasswordBtn) {
            changeAdminPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeAdminPassword();
            });
        }

        // Listener para redefinição de senha do revendedor
        const changeRevendedorPasswordBtn = document.getElementById('changeRevendedorPasswordBtn');
        if (changeRevendedorPasswordBtn) {
            changeRevendedorPasswordBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.changeRevendedorPassword();
            });
        }

        // Listener para mudança no modo PIX (feedback visual e atualização imediata)
        const modoSelect = document.getElementById('adminMercadoPagoModo');
        if (modoSelect) {
            modoSelect.addEventListener('change', async (e) => {
                const modo = e.target.value;
                const modoValido = (modo === 'test' || modo === 'prod') ? modo : 'prod';
                
                // Atualizar localStorage imediatamente
                localStorage.setItem('adminMercadoPagoModo', modoValido);
                
                // Salvar no servidor imediatamente
                try {
                    const response = await fetch('api/data.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: 'config_set', 
                            adminMercadoPagoModo: modoValido 
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        // Forçar atualização nas configurações do Mercado Pago
                        await mercadoPago.ensureAdminConfigLoaded(true);
                        const modoTexto = modoValido === 'test' ? 'Teste (sandbox)' : 'Produção';
                        console.log(`**Modo PIX alterado para: ${modoTexto}**`);
                        console.log(`**Token que será usado: ${modoValido === 'test' ? 'TEST' : 'PROD'}**`);
                    }
                } catch (e) {
                    console.warn('Erro ao salvar modo no servidor:', e);
                }
            });
        }

        // Listener para mudança no módulo de pagamento (salvar imediatamente)
        const paymentModuleSelect = document.getElementById('adminPaymentModule');
        if (paymentModuleSelect) {
            paymentModuleSelect.addEventListener('change', async (e) => {
                const module = e.target.value;
                const moduleValido = (module === '' || module === 'mercadopago' || module === 'virtualpay' || module === 'pushinpay') ? module : 'mercadopago';
                
                // Atualizar localStorage imediatamente
                localStorage.setItem('adminPaymentModule', moduleValido);
                
                // Salvar no servidor imediatamente
                try {
                    const response = await fetch('api/data.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: 'config_set', 
                            adminPaymentModule: moduleValido 
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        let moduleTexto = 'Mercado Pago';
                        if (moduleValido === 'virtualpay') moduleTexto = 'Virtual Pay';
                        else if (moduleValido === 'pushinpay') moduleTexto = 'PushinPay';
                        console.log(`**Módulo de pagamento alterado para: ${moduleTexto}**`);
                        this.showNotification(`Módulo de pagamento alterado para: ${moduleTexto}`, 'success');
                    }
                } catch (e) {
                    console.warn('Erro ao salvar módulo no servidor:', e);
                }
            });
        }

        // Admin: Catalog
        document.getElementById('loadOriginalCatalogBtn').addEventListener('click', () => {
            this.loadOriginalCatalog();
        });

        document.getElementById('saveCatalogBtn').addEventListener('click', () => {
            this.saveAdminCatalog();
        });

        document.getElementById('assignCatalogBtn').addEventListener('click', () => {
            this.assignCatalogToRevendedor();
        });

        const catalogRevendedorSelect = document.getElementById('catalogRevendedorSelect');
        if (catalogRevendedorSelect) {
            catalogRevendedorSelect.addEventListener('change', () => this.loadCatalogFromSelectedRevendedor());
        }

        // Revendedor: Catalog
        document.getElementById('revendedorSaveCatalogBtn').addEventListener('click', () => {
            this.saveRevendedorCatalog();
        });
        const revendedorLoadAdminCatalogBtn = document.getElementById('revendedorLoadAdminCatalogBtn');
        if (revendedorLoadAdminCatalogBtn) {
            revendedorLoadAdminCatalogBtn.addEventListener('click', () => {
                this.loadAdminCatalogForRevendedor({ mergeSalePrices: true });
            });
        }

        // Revendedor: Save Config
        const saveRevendedorConfigBtn = document.getElementById('saveRevendedorConfigBtn');
        if (saveRevendedorConfigBtn) {
            saveRevendedorConfigBtn.addEventListener('click', () => {
                this.saveRevendedorConfig();
            });
        }

        // Configurações em modais (abrir/fechar/salvar)
        document.querySelectorAll('[data-open-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-open-modal');
                if (modalId) this.openModal(modalId);
            });
        });
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', () => {
                const modalId = btn.getAttribute('data-close-modal');
                if (modalId) this.closeModal(modalId);
            });
        });
        document.querySelectorAll('[data-save-admin-config]').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this.saveAdminConfig();
                const modalId = btn.getAttribute('data-close-after-save');
                if (modalId) this.closeModal(modalId);
            });
        });
        const adminPaymentModuleSelect = document.getElementById('adminPaymentModule');
        if (adminPaymentModuleSelect) {
            adminPaymentModuleSelect.addEventListener('change', () => this.updateAdminPaymentPanel());
        }
        const configSavePersonalizacaoBtn = document.getElementById('configSavePersonalizacaoBtn');
        if (configSavePersonalizacaoBtn) {
            configSavePersonalizacaoBtn.addEventListener('click', () => this.savePersonalizacao());
        }
        const adminSavePaymentConfigBtn = document.getElementById('adminSavePaymentConfigBtn');
        if (adminSavePaymentConfigBtn) {
            adminSavePaymentConfigBtn.addEventListener('click', async () => {
                await this.saveAdminConfig();
            });
        }
        const revendedorSavePaymentConfigBtn = document.getElementById('revendedorSavePaymentConfigBtn');
        if (revendedorSavePaymentConfigBtn) {
            revendedorSavePaymentConfigBtn.addEventListener('click', async () => {
                await this.saveRevendedorConfig();
            });
        }
        const revendedorSavePersonalizacaoBtn = document.getElementById('revendedorSavePersonalizacaoBtn');
        if (revendedorSavePersonalizacaoBtn) {
            revendedorSavePersonalizacaoBtn.addEventListener('click', () => this.saveRevendedorPersonalizacao());
        }
        const revendedorSaveLandingBtn = document.getElementById('revendedorSaveLandingBtn');
        if (revendedorSaveLandingBtn) {
            revendedorSaveLandingBtn.addEventListener('click', () => this.saveRevendedorLanding());
        }
        document.querySelectorAll('[data-save-revendedor-config]').forEach(btn => {
            btn.addEventListener('click', async () => {
                await this.saveRevendedorConfig();
                const modalId = btn.getAttribute('data-close-after-save');
                if (modalId) this.closeModal(modalId);
            });
        });

        // Listener para mudança no modo PIX do revendedor (salvar imediatamente no servidor)
        const revendedorModoSelect = document.getElementById('revendedorMercadoPagoModo');
        if (revendedorModoSelect) {
            revendedorModoSelect.addEventListener('change', async (e) => {
                const modo = e.target.value;
                const modoValido = (modo === 'test' || modo === 'prod') ? modo : 'prod';
                
                // Atualizar localStorage imediatamente
                const id = this.currentUser?.id;
                if (id) {
                    localStorage.setItem(`revendedorMercadoPagoModo_${id}`, modoValido);
                }
                localStorage.setItem('adminMercadoPagoModo', modoValido);
                
                // Salvar no servidor imediatamente (nas configurações do admin, que são usadas na página pública)
                try {
                    const response = await fetch('api/data.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: 'config_set', 
                            adminMercadoPagoModo: modoValido 
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        await mercadoPago.ensureAdminConfigLoaded(true);
                        const modoTexto = modoValido === 'test' ? 'Teste (sandbox)' : 'Produção';
                        console.log(`**Modo PIX alterado para: ${modoTexto}**`);
                    }
                } catch (e) {
                    console.warn('Erro ao salvar modo no servidor:', e);
                }
            });
        }

        // Listener para mudança no módulo de pagamento do revendedor (salvar imediatamente)
        // IMPORTANTE: Revendedor só pode alterar o módulo usado para COBRAR SEUS CLIENTES
        // NÃO pode alterar o módulo usado para COBRAR ELE MESMO (adminPaymentModule)
        const revendedorPaymentModuleSelect = document.getElementById('revendedorPaymentModule');
        if (revendedorPaymentModuleSelect) {
            revendedorPaymentModuleSelect.addEventListener('change', async (e) => {
                this.updateRevendedorPaymentPanel();
                const module = e.target.value;
                const moduleValido = (module === 'mercadopago' || module === 'virtualpay' || module === 'pushinpay') ? module : '';
                
                // Atualizar localStorage imediatamente (APENAS para o revendedor)
                const id = this.currentUser?.id;
                if (id) {
                    localStorage.setItem(`revendedorPaymentModule_${id}`, moduleValido);
                    console.log(`✅ Módulo de pagamento do revendedor (para clientes) alterado para: ${moduleValido || 'padrão do sistema'}`);
                } else {
                    console.warn('⚠️ ID do revendedor não encontrado');
                    return;
                }
                
                // Salvar no servidor (user_config_set - configuração por usuário)
                // NÃO salvar em adminPaymentModule (isso é só do admin)
                try {
                    const response = await fetch('api/data.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            action: 'user_config_set',
                            userId: id,
                            revendedorPaymentModule: moduleValido
                        })
                    });
                    const result = await response.json();
                    if (result.success) {
                        const moduleTexto = moduleValido === 'mercadopago' ? 'Mercado Pago' : (moduleValido === 'virtualpay' ? 'Virtual Pay' : (moduleValido === 'pushinpay' ? 'PushinPay' : 'padrão do sistema'));
                        console.log(`**Módulo de pagamento (para clientes) alterado para: ${moduleTexto}**`);
                        this.showNotification(`Módulo de pagamento (para clientes) alterado para: ${moduleTexto}`, 'success');
                    } else {
                        throw new Error(result.error || 'Erro ao salvar');
                    }
                } catch (e) {
                    console.error('Erro ao salvar módulo no servidor:', e);
                    this.showNotification('Erro ao salvar módulo de pagamento. Tente novamente.', 'error');
                }
            });
        }

        // Revendedor: Add Saldo
        const addSaldoRevendedorBtn = document.getElementById('addSaldoRevendedorBtn');
        if (addSaldoRevendedorBtn) {
            addSaldoRevendedorBtn.addEventListener('click', () => {
                this.openModal('addSaldoRevendedorModal');
            });
        }

        const closeAddSaldoRevendedorBtn = document.getElementById('closeAddSaldoRevendedorBtn');
        if (closeAddSaldoRevendedorBtn) {
            closeAddSaldoRevendedorBtn.addEventListener('click', () => {
                this.closeModal('addSaldoRevendedorModal');
            });
        }

        // Event listeners para modal de comprovante
        const closeReceiptBtn = document.getElementById('closeReceiptBtn');
        const closeReceiptBtn2 = document.getElementById('closeReceiptBtn2');
        const downloadReceiptBtn = document.getElementById('downloadReceiptBtn');
        
        const closeReceiptModal = () => {
            this.closeModal('receiptModal');
            // Não limpar currentReceiptData aqui para permitir download mesmo após fechar
        };
        
        if (closeReceiptBtn) {
            closeReceiptBtn.addEventListener('click', closeReceiptModal);
        }
        if (closeReceiptBtn2) {
            closeReceiptBtn2.addEventListener('click', closeReceiptModal);
        }
        if (downloadReceiptBtn) {
            downloadReceiptBtn.addEventListener('click', () => {
                if (this.currentReceiptData) {
                    this.downloadReceiptPDF(this.currentReceiptData);
                }
            });
        }

        const addSaldoRevendedorForm = document.getElementById('addSaldoRevendedorForm');
        if (addSaldoRevendedorForm) {
            addSaldoRevendedorForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processAddSaldoRevendedor();
            });
        }

        // Revendedor: Recharge Form
        const rechargeForm = document.getElementById('rechargeForm');
        if (rechargeForm) {
            rechargeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createRecharge();
            });
        }

        // Revendedor: Carrier select
        const carrierSelect = document.getElementById('carrierSelect');
        if (carrierSelect) {
            carrierSelect.addEventListener('change', (e) => {
                this.updateValueSelect(e.target.value);
            });
        }

        // Revendedor: Value select
        const valueSelect = document.getElementById('valueSelect');
        if (valueSelect) {
            valueSelect.addEventListener('change', (e) => {
                this.updateValueInfo(e.target.value);
            });
        }

        // Revendedor: Check phone
        const checkPhoneBtn = document.getElementById('checkPhoneBtn');
        if (checkPhoneBtn) {
            checkPhoneBtn.addEventListener('click', () => {
                this.checkPhoneStatus();
            });
        }

        // Revendedor: Format phone number input
        const phoneNumber = document.getElementById('phoneNumber');
        if (phoneNumber) {
            phoneNumber.addEventListener('input', (e) => {
                // Remove caracteres não numéricos enquanto digita
                let value = e.target.value.replace(/\D/g, '');
                // Limita a 11 dígitos (DDD + 9 dígitos)
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                e.target.value = value;
            });
        }

        const closePhoneStatusBtn = document.getElementById('closePhoneStatusBtn');
        if (closePhoneStatusBtn) {
            closePhoneStatusBtn.addEventListener('click', () => {
                this.closeModal('phoneStatusModal');
            });
        }

        // Revendedor: Refresh catalog
        const refreshCatalogBtn = document.getElementById('refreshCatalogBtn');
        if (refreshCatalogBtn) {
            refreshCatalogBtn.addEventListener('click', () => {
                this.loadCatalog();
            });
        }

        // Close modals
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    async changeAdminPassword() {
        try {
            if (!this.currentUser || this.currentUser.type !== 'admin') {
                this.showNotification('Apenas o admin pode alterar a senha', 'error');
                return;
            }

            const currentPassword = (document.getElementById('adminCurrentPassword')?.value ?? '').trim();
            const newPassword = (document.getElementById('adminNewPassword')?.value ?? '').trim();
            const confirmPassword = (document.getElementById('adminConfirmPassword')?.value ?? '').trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showNotification('Preencha todos os campos', 'warning');
                return;
            }

            if (newPassword.length < 6) {
                this.showNotification('Nova senha deve ter no mínimo 6 caracteres', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showNotification('As senhas não conferem', 'warning');
                return;
            }

            const resp = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'admin_change_password',
                    userId: this.currentUser.id,
                    currentPassword,
                    newPassword
                })
            });
            const j = await resp.json().catch(() => null);
            if (!j || !j.success) {
                throw new Error(j?.error || 'Falha ao atualizar senha');
            }

            // Limpar campos
            const cpEl = document.getElementById('adminCurrentPassword');
            const npEl = document.getElementById('adminNewPassword');
            const cnEl = document.getElementById('adminConfirmPassword');
            if (cpEl) cpEl.value = '';
            if (npEl) npEl.value = '';
            if (cnEl) cnEl.value = '';

            this.showNotification('Senha atualizada com sucesso!', 'success');
            this.closeModal('adminSecurityModal');
        } catch (e) {
            this.showNotification(e?.message || 'Erro ao atualizar senha', 'error');
        }
    }

    async changeRevendedorPassword() {
        try {
            if (!this.currentUser || this.currentUser.type !== 'revendedor') {
                this.showNotification('Apenas revendedores podem alterar sua senha', 'error');
                return;
            }

            const currentPassword = (document.getElementById('revendedorCurrentPassword')?.value ?? '').trim();
            const newPassword = (document.getElementById('revendedorNewPassword')?.value ?? '').trim();
            const confirmPassword = (document.getElementById('revendedorConfirmPassword')?.value ?? '').trim();

            if (!currentPassword || !newPassword || !confirmPassword) {
                this.showNotification('Preencha todos os campos', 'warning');
                return;
            }

            if (newPassword.length < 6) {
                this.showNotification('Nova senha deve ter no mínimo 6 caracteres', 'warning');
                return;
            }

            if (newPassword !== confirmPassword) {
                this.showNotification('As senhas não conferem', 'warning');
                return;
            }

            const resp = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'user_change_password',
                    userId: this.currentUser.id,
                    currentPassword,
                    newPassword
                })
            });
            const j = await resp.json().catch(() => null);
            if (!j || !j.success) {
                throw new Error(j?.error || 'Falha ao atualizar senha');
            }

            // Limpar campos
            const cpEl = document.getElementById('revendedorCurrentPassword');
            const npEl = document.getElementById('revendedorNewPassword');
            const cnEl = document.getElementById('revendedorConfirmPassword');
            if (cpEl) cpEl.value = '';
            if (npEl) npEl.value = '';
            if (cnEl) cnEl.value = '';

            this.showNotification('Senha atualizada com sucesso!', 'success');
            this.closeModal('revendedorSecurityModal');
        } catch (e) {
            this.showNotification(e?.message || 'Erro ao atualizar senha', 'error');
        }
    }

    handleLogin() {
        const username = document.getElementById('username')?.value?.trim();
        const password = document.getElementById('password')?.value?.trim();
        if (!username || !password) {
            this.showNotification('Preencha usuário e senha', 'error');
            return;
        }
        const btn = document.getElementById('loginBtn');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Entrando...';
        }
        this.login(username, password, null).catch(err => {
            console.error('Erro no login:', err);
            this.showNotification('Erro: ' + (err?.message || 'Não foi possível entrar'), 'error');
        }).finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Entrar';
            }
        });
    }

    async login(username, password, userType, skipCheck = false) {
        try {
        // Garantir que o banco está inicializado
        if (!this.db._ready) {
            await this.db.init();
        } else {
            await this.db._ready;
        }

        if (!skipCheck) {
            if (!username || !password) {
                this.showNotification('Por favor, preencha todos os campos', 'error');
                return;
            }

                // Tentar buscar do servidor se não encontrar no cache
                let user = this.db.getUser(username);
            
            if (!user) {
                    console.log('Usuário não encontrado no cache, tentando buscar do servidor...');
                    try {
                        const serverUser = await this.db._req('user_get', { username }, 'GET');
                        if (serverUser) {
                            // Adicionar ao cache
                            const existingIndex = this.db._cache.users.findIndex(u => u.username === username);
                            if (existingIndex >= 0) {
                                this.db._cache.users[existingIndex] = serverUser;
                            } else {
                                this.db._cache.users.push(serverUser);
                            }
                            user = serverUser;
                        }
                    } catch (e) {
                        console.error('Erro ao buscar usuário do servidor:', e);
                    }
                }
                
                if (!user) {
                    console.error('Usuário não encontrado:', username);
                    console.log('Usuários disponíveis:', this.db._cache.users.map(u => u.username));
                this.showNotification('Usuário não encontrado', 'error');
                return;
            }

            if (user.password !== password) {
                    console.error('Senha incorreta para usuário:', username);
                this.showNotification('Senha incorreta', 'error');
                return;
            }

            // Detectar automaticamente o tipo de usuário do banco de dados
            userType = user.type;

            if (!user.active) {
                this.showNotification('Usuário desativado', 'error');
                return;
            }

            this.currentUser = user;
        } else {
            const user = this.db.getUser(username);
            if (!user) {
                console.error('Usuário não encontrado no skipCheck');
                return;
            }
            this.currentUser = user;
        }

        if (!this.currentUser) {
            this.showNotification('Erro ao fazer login', 'error');
            return;
        }

        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('appScreen').style.display = 'block';
            try { window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser)); } catch (_) {}

        this.loadUserInterface();
        } catch (error) {
            console.error('Erro no login:', error);
            this.showNotification(`Erro ao fazer login: ${error.message}`, 'error');
        }
    }

    logout() {
        this.currentUser = null;
        // Parar timers/loops de atualização quando sair
        if (this.vendasStatusPollInterval) {
            clearInterval(this.vendasStatusPollInterval);
            this.vendasStatusPollInterval = null;
        }
        if (this.pixCheckInterval) {
            clearInterval(this.pixCheckInterval);
            this.pixCheckInterval = null;
        }
        if (this.catalogRefreshInterval) {
            clearInterval(this.catalogRefreshInterval);
            this.catalogRefreshInterval = null;
        }

        try { window.localStorage.removeItem('currentUser'); } catch (_) {}
        // Finalizar sessão: limpar qualquer dado salvo na aba (configs/sessão)
        try { localStorage.clear(); } catch (_) {}

        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('appScreen').style.display = 'none';
        document.getElementById('loginForm').reset();
    }

    loadUserInterface() {
        // Botões do header
        const recargaBtn = document.getElementById('recargaBtn');
        const addSaldoBtn = document.getElementById('addSaldoBtn');
        
        // Esconder botões por padrão
        if (recargaBtn) recargaBtn.style.display = 'none';
        if (addSaldoBtn) addSaldoBtn.style.display = 'none';
        
        // Mostrar botões apenas para revendedores
        if (this.currentUser.type === 'revendedor') {
            if (recargaBtn) {
                recargaBtn.style.display = 'inline-flex';
                recargaBtn.onclick = () => {
                    this.generateRecargaLink();
                };
            }

            if (addSaldoBtn) {
                addSaldoBtn.style.display = 'inline-flex';
                addSaldoBtn.onclick = () => {
                    this.openModal('addSaldoRevendedorModal');
                };
            }
        }

        if (this.currentUser.type === 'admin') {
            document.getElementById('adminTabs').style.display = 'flex';
            document.getElementById('revendedorTabs').style.display = 'none';
            const revendedoresTab = document.getElementById('adminRevendedoresTab');
            if (revendedoresTab) {
                revendedoresTab.style.display = 'inline-flex';
            }
            this.loadAdminDashboard();
            this.loadRevendedores();
            if (this.catalogRefreshInterval) {
                clearInterval(this.catalogRefreshInterval);
                this.catalogRefreshInterval = null;
            }
            const CATALOG_SYNC_SECONDS = 60;
            this.catalogRefreshInterval = setInterval(() => this.refreshCatalogFromApiAndSave(), CATALOG_SYNC_SECONDS * 1000);
            setTimeout(() => this.refreshCatalogFromApiAndSave(), 3000);
        } else {
            document.getElementById('adminTabs').style.display = 'none';
            document.getElementById('revendedorTabs').style.display = 'flex';
            const revendedoresTab = document.getElementById('adminRevendedoresTab');
            if (revendedoresTab) {
                revendedoresTab.style.display = 'none';
            }
            this.loadRevendedorDashboard();
            this.loadCatalog();
        }

        document.getElementById('currentUser').textContent = this.currentUser.nome || this.currentUser.username;
        document.getElementById('userTypeBadge').textContent = this.currentUser.type === 'admin' ? '👑 Admin' : '👤 Revendedor';
        this.updateBalanceDisplay();
    }

    updateBalanceDisplay() {
        if (this.currentUser.type === 'admin') {
            this.loadAdminBalance();
        } else {
            const saldo = this.db.getSaldo(this.currentUser.id);
            document.getElementById('balanceValue').textContent = this.formatCurrency(saldo);
        }
    }

    async loadAdminBalance() {
        try {
            const response = await this.api.getBalance();
            if (response.success) {
                document.getElementById('balanceValue').textContent = this.formatCurrency(response.data.balance);
                document.getElementById('adminTotalBalance').textContent = this.formatCurrency(response.data.balance);
            }
        } catch (error) {
            console.error('Error loading balance:', error);
        }
    }

    switchTab(tabName) {
        if (this.vendasStatusPollInterval) {
            clearInterval(this.vendasStatusPollInterval);
            this.vendasStatusPollInterval = null;
        }
        // catalogRefreshInterval não é limpo aqui: continua rodando para manter catálogo em sync com a API
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab content
        const tabContent = document.getElementById(tabName);
        if (tabContent) {
            tabContent.classList.add('active');
        }

        // Update tab buttons
        const tabsContainer = this.currentUser.type === 'admin' ? '#adminTabs' : '#revendedorTabs';
        document.querySelectorAll(`${tabsContainer} .tab`).forEach(tab => {
            tab.classList.remove('active');
        });
        const tabBtn = document.querySelector(`${tabsContainer} [data-tab="${tabName}"]`);
        if (tabBtn) tabBtn.classList.add('active');

        // Atualizar item ativo no drawer do menu (mobile)
        const menuNavId = this.currentUser.type === 'admin' ? 'adminMenuNav' : 'revendedorMenuNav';
        const menuNav = document.getElementById(menuNavId);
        if (menuNav) {
            menuNav.querySelectorAll('.menu-drawer-item').forEach(item => {
                item.classList.toggle('active', item.dataset.tab === tabName);
            });
        }

        // Load data for specific tabs
        if (tabName === 'admin-dashboard') {
            this.loadAdminDashboard();
        } else if (tabName === 'admin-revendedores') {
            this.loadRevendedores();
        } else if (tabName === 'admin-catalog') {
            this.loadAdminCatalogEditor();
        } else if (tabName === 'admin-pix-recargas') {
            this.loadAdminPixRecargas();
        } else if (tabName === 'admin-vendas') {
            this.loadAdminVendas();
        } else if (tabName === 'admin-historico') {
            this.loadAdminHistorico();
        } else if (tabName === 'admin-bonus') {
            this.loadAdminBonus();
        } else if (tabName === 'admin-config') {
            this.loadAdminConfig();
        } else if (tabName === 'revendedor-dashboard') {
            this.loadRevendedorDashboard();
        } else if (tabName === 'revendedor-catalog') {
            this.loadRevendedorCatalogEditor();
        } else if (tabName === 'revendedor-recharge') {
            // Carregar catálogo quando abrir a aba Nova Recarga
            this.loadCatalogForRecharge();
        } else if (tabName === 'revendedor-orders') {
            this.loadRevendedorOrders();
        } else if (tabName === 'revendedor-sales') {
            this.loadRevendedorSales();
        } else if (tabName === 'revendedor-config') {
            this.loadRevendedorConfig();
        }
    }

    openMenuDrawer() {
        const overlay = document.getElementById('menuDrawerOverlay');
        const adminNav = document.getElementById('adminMenuNav');
        const revendedorNav = document.getElementById('revendedorMenuNav');
        if (!overlay) return;
        if (this.currentUser.type === 'admin') {
            if (adminNav) adminNav.style.display = 'block';
            if (revendedorNav) revendedorNav.style.display = 'none';
        } else {
            if (adminNav) adminNav.style.display = 'none';
            if (revendedorNav) revendedorNav.style.display = 'block';
        }
        overlay.classList.add('is-open');
        overlay.setAttribute('aria-hidden', 'false');
    }

    closeMenuDrawer() {
        const overlay = document.getElementById('menuDrawerOverlay');
        if (!overlay) return;
        overlay.classList.remove('is-open');
        overlay.setAttribute('aria-hidden', 'true');
    }

    // Admin Functions
    async loadAdminDashboard() {
        try {
            const balance = await this.api.getBalance();
            const revendedores = this.db.getRevendedores();
            const saldoEmUso = this.db.getTotalSaldoEmUso();
            const totalRecargas = this.db.getTotalRecargas();

            if (balance.success) {
                document.getElementById('adminTotalBalance').textContent = this.formatCurrency(balance.data.balance);
            }
            document.getElementById('totalRevendedores').textContent = revendedores.length;
            document.getElementById('saldoEmUso').textContent = this.formatCurrency(saldoEmUso);
            document.getElementById('totalRecargas').textContent = totalRecargas;
        } catch (error) {
            console.error('Error loading admin dashboard:', error);
        }
    }

    loadRevendedores() {
        const revendedores = this.db.getRevendedores();
        const container = document.getElementById('revendedoresList');
        const countEl = document.getElementById('revendedoresCount');
        const toolbar = document.getElementById('revendedoresToolbar');
        const zeroState = document.getElementById('revendedoresZeroState');

        if (revendedores.length === 0) {
            if (toolbar) toolbar.style.display = 'none';
            if (zeroState) {
                zeroState.style.display = 'block';
                zeroState.innerHTML = `
                    <div class="revendedores-zero-content">
                        <div class="revendedores-zero-icon" aria-hidden="true">👥</div>
                        <h3 class="revendedores-zero-title">Nenhum revendedor cadastrado</h3>
                        <p class="revendedores-zero-desc">Adicione o primeiro revendedor para começar a vender recargas.</p>
                        <button type="button" class="btn btn-primary revendedores-zero-cta" id="revendedoresZeroAddBtn">➕ Adicionar revendedor</button>
                    </div>
                `;
                const addBtn = document.getElementById('revendedoresZeroAddBtn');
                if (addBtn) addBtn.addEventListener('click', () => this.openModal('addRevendedorModal'));
            }
            if (container) {
                container.style.display = 'none';
                container.innerHTML = '';
            }
            return;
        }

        if (toolbar) toolbar.style.display = '';
        if (zeroState) { zeroState.style.display = 'none'; zeroState.innerHTML = ''; }
        if (container) container.style.display = '';

        const searchText = (rev) => [rev.username, rev.nome, rev.email].filter(Boolean).join(' ').toLowerCase();
        const initial = (str) => (str && str.trim()) ? (str.trim().charAt(0).toUpperCase()) : '?';
        container.innerHTML = `
            <table class="data-table revendedores-table">
                <thead>
                    <tr>
                        <th class="revendedor-th-avatar"></th>
                        <th>Usuário</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Saldo</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${revendedores.map(rev => {
                        const saldo = this.db.getSaldo(rev.id);
                        const search = searchText(rev);
                        const ini = initial(rev.nome || rev.username);
                        return `
                            <tr data-search="${search.replace(/"/g, '&quot;')}" data-initial="${ini}">
                                <td class="revendedor-cell-avatar" data-label="">
                                    <span class="revendedor-avatar">${ini}</span>
                                </td>
                                <td data-label="Usuário">${rev.username}</td>
                                <td data-label="Nome">${rev.nome}</td>
                                <td data-label="E-mail">${rev.email || '-'}</td>
                                <td data-label="Saldo" class="revendedor-cell-saldo revendedor-cell-num"><strong>${this.formatCurrency(saldo)}</strong></td>
                                <td data-label="Status"><span class="status-badge ${rev.active ? 'clear' : 'blacklisted'}">${rev.active ? 'Ativo' : 'Inativo'}</span></td>
                                <td data-label="Ações">
                                    <div class="table-actions">
                                        <button class="btn btn-secondary btn-small" data-action="edit" data-rev-id="${rev.id}">✏️ Editar</button>
                                        <button class="btn btn-danger btn-small" data-action="delete" data-rev-id="${rev.id}">🗑️ Apagar</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        this.filterRevendedoresList();
        this.updateRevendedoresSearchClear();

        setTimeout(() => {
            container.querySelectorAll('[data-action="edit"]').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const revId = newBtn.getAttribute('data-rev-id');
                    if (revId) this.openEditRevendedorModal(revId);
                });
            });

            container.querySelectorAll('[data-action="delete"]').forEach(btn => {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const revId = newBtn.getAttribute('data-rev-id');
                    if (revId) this.deleteRevendedor(revId);
                });
            });
        }, 100);
    }

    filterRevendedoresList() {
        const searchInput = document.getElementById('revendedoresSearch');
        const container = document.getElementById('revendedoresList');
        const countEl = document.getElementById('revendedoresCount');
        const emptyEl = document.getElementById('revendedoresListEmpty');
        if (!container || !countEl) return;
        const rows = container.querySelectorAll('tbody tr');
        const term = (searchInput?.value || '').trim().toLowerCase();
        let visible = 0;
        rows.forEach(tr => {
            const show = !term || (tr.getAttribute('data-search') || '').includes(term);
            tr.style.display = show ? '' : 'none';
            if (show) visible++;
        });
        const total = rows.length;
        if (total === 0) {
            countEl.textContent = '';
        } else {
            countEl.textContent = term ? `${visible} de ${total}` : `${total} revendedor(es)`;
        }
        if (emptyEl) {
            if (term && visible === 0) {
                emptyEl.style.display = 'block';
                emptyEl.innerHTML = `
                    <div class="revendedores-empty-msg">
                        <p class="revendedores-empty-title">Nenhum resultado</p>
                        <p class="revendedores-empty-desc">Nenhum revendedor encontrado para "<strong>${this.escapeHtml(term)}</strong>".</p>
                        <button type="button" class="btn btn-secondary revendedores-empty-clear" id="revendedoresEmptyClearBtn">Limpar busca</button>
                    </div>
                `;
                const clearBtn = document.getElementById('revendedoresEmptyClearBtn');
                if (clearBtn) clearBtn.addEventListener('click', () => { if (searchInput) { searchInput.value = ''; searchInput.focus(); this.filterRevendedoresList(); this.updateRevendedoresSearchClear(); } });
            } else {
                emptyEl.style.display = 'none';
                emptyEl.innerHTML = '';
            }
        }
        if (container) container.style.display = (term && visible === 0) ? 'none' : '';
        this.updateRevendedoresSearchClear();
    }

    updateRevendedoresSearchClear() {
        const searchInput = document.getElementById('revendedoresSearch');
        const clearBtn = document.getElementById('revendedoresSearchClear');
        if (!clearBtn) return;
        const hasText = (searchInput?.value || '').trim().length > 0;
        clearBtn.style.display = hasText ? '' : 'none';
    }

    escapeHtml(s) {
        const div = document.createElement('div');
        div.textContent = s;
        return div.innerHTML;
    }

    openEditRevendedorModal(revendedorId) {
        const rev = this.db.getUserById(revendedorId);
        if (!rev) {
            this.showNotification('Revendedor não encontrado', 'error');
            return;
        }
        const saldo = this.db.getSaldo(revendedorId);
        document.getElementById('editRevendedorId').value = revendedorId;
        document.getElementById('editRevendedorUsername').value = rev.username || '';
        document.getElementById('editRevendedorNome').value = rev.nome || '';
        document.getElementById('editRevendedorEmail').value = rev.email || '';
        document.getElementById('editRevendedorPassword').value = '';
        document.getElementById('editRevendedorSaldo').value = saldo.toFixed(2);
        document.getElementById('editRevendedorStatus').value = rev.active ? 'true' : 'false';
        
        // Adicionar tooltip/indicação do saldo atual
        const saldoInput = document.getElementById('editRevendedorSaldo');
        const existingHint = document.querySelector('.saldo-current-hint');
        if (existingHint) existingHint.remove();
        
        const hint = document.createElement('div');
        hint.className = 'saldo-current-hint';
        hint.style.cssText = 'color: var(--text-secondary); font-size: 13px; margin-top: 8px; padding: 8px; background: rgba(99, 102, 241, 0.1); border-radius: 6px;';
        hint.innerHTML = `💡 <strong>Saldo atual:</strong> R$ ${saldo.toFixed(2)}`;
        saldoInput.parentElement.insertBefore(hint, saldoInput.nextElementSibling);
        
        this.openModal('editRevendedorModal');
    }

    async saveEditRevendedor() {
        // Evitar submit duplicado (clique duplo / lag / event duplicado)
        if (this._savingEditRevendedor) return;
        this._savingEditRevendedor = true;

        const form = document.getElementById('editRevendedorForm');
        const submitBtn = form ? form.querySelector('button[type="submit"]') : null;
        const prevBtnText = submitBtn ? submitBtn.textContent : null;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Salvando...';
        }

        const id = document.getElementById('editRevendedorId').value;
        const nome = document.getElementById('editRevendedorNome').value.trim();
        const email = document.getElementById('editRevendedorEmail').value.trim();
        const novaSenha = document.getElementById('editRevendedorPassword').value;
        const novoSaldoRaw = parseFloat(document.getElementById('editRevendedorSaldo').value);
        const novoSaldo = Math.round((Number(novoSaldoRaw) || 0) * 100) / 100;
        const novoStatus = document.getElementById('editRevendedorStatus').value === 'true';
        
        console.log('saveEditRevendedor chamado:', { id, nome, email, novoSaldo, novoStatus });
        
        if (!id) return;
        if (!nome) {
            this.showNotification('Nome é obrigatório', 'error');
            return;
        }
        if (!Number.isFinite(novoSaldo) || novoSaldo < 0) {
            this.showNotification('Saldo inválido', 'error');
            return;
        }
        
        try {
            // Atualizar dados do usuário
            const updates = { nome, email, active: novoStatus };
            if (novaSenha && novaSenha.length > 0) updates.password = novaSenha;
            
            console.log('Atualizando usuário com:', updates);
            await this.db.updateUser(id, updates);
            console.log('Usuário atualizado com sucesso');
            
            // Atualizar saldo (sempre setar o valor EXATO; idempotente contra submit duplicado)
            await this.db.setSaldo(id, novoSaldo);
            console.log('Saldo atualizado com sucesso');
            
            this.showNotification('Revendedor atualizado com sucesso!', 'success');
            this.closeModal('editRevendedorModal');
            this.loadRevendedores();
        } catch (e) {
            console.error('Erro ao salvar edição:', e);
            this.showNotification(e.message || 'Erro ao atualizar', 'error');
        } finally {
            this._savingEditRevendedor = false;
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = prevBtnText || 'Salvar alterações';
            }
        }
    }

    async deleteRevendedor(revendedorId) {
        const rev = this.db.getUserById(revendedorId);
        if (!rev) return;
        if (!confirm(`Apagar o revendedor "${rev.nome || rev.username}"? O saldo e as recargas vinculadas continuarão no sistema, mas o login não existirá mais.`)) return;
        try {
            await this.db.deleteUser(revendedorId);
            this.showNotification('Revendedor apagado.', 'success');
            this.loadRevendedores();
        } catch (e) {
            this.showNotification(e.message || 'Erro ao apagar', 'error');
        }
    }

    openAddSaldoModal(revendedorId) {
        try {
            const revendedor = this.db.getUserById(revendedorId);
            if (!revendedor) {
                this.showNotification('Revendedor não encontrado', 'error');
                return;
            }

            const saldo = this.db.getSaldo(revendedorId);
            const saldoRevendedorInput = document.getElementById('saldoRevendedor');
            const saldoAtualInput = document.getElementById('saldoAtual');
            const addSaldoForm = document.getElementById('addSaldoForm');

            if (!saldoRevendedorInput || !saldoAtualInput || !addSaldoForm) {
                this.showNotification('Erro ao abrir modal. Elementos não encontrados.', 'error');
                console.error('Elementos do modal não encontrados');
                return;
            }

            saldoRevendedorInput.value = revendedor.nome;
            saldoRevendedorInput.dataset.userId = revendedorId;
            saldoAtualInput.value = this.formatCurrency(saldo);
            addSaldoForm.reset();
            this.openModal('addSaldoModal');
        } catch (error) {
            console.error('Erro ao abrir modal de saldo:', error);
            this.showNotification('Erro ao abrir modal', 'error');
        }
    }

    async addSaldoToRevendedor() {
        try {
            const saldoRevendedorInput = document.getElementById('saldoRevendedor');
            const saldoValorInput = document.getElementById('saldoValor');

            if (!saldoRevendedorInput || !saldoValorInput) {
                this.showNotification('Erro: Campos do formulário não encontrados', 'error');
                return;
            }

            const userId = saldoRevendedorInput.dataset.userId;
            const valor = parseFloat(saldoValorInput.value);

            if (!userId) {
                this.showNotification('Erro: ID do revendedor não encontrado', 'error');
                return;
            }

            if (!valor || valor <= 0 || isNaN(valor)) {
                this.showNotification('Por favor, informe um valor válido maior que zero', 'error');
                return;
            }

            // Regra de negócio: o Admin controla o saldo distribuído baseado no saldo REAL da API Key.
            // Não permitir que "saldo em uso" (soma dos saldos dos revendedores) ultrapasse o saldo real.
            try {
                const balanceResp = await this.api.getBalance();
                if (balanceResp && balanceResp.success && balanceResp.data && balanceResp.data.balance != null) {
                    const adminBalance = Number(balanceResp.data.balance) || 0;
                    const saldoEmUsoAtual = this.db.getTotalSaldoEmUso();
                    const saldoEmUsoApos = saldoEmUsoAtual + valor;
                    if (saldoEmUsoApos - adminBalance > 0.00001) {
                        const disponivel = Math.max(0, adminBalance - saldoEmUsoAtual);
                        this.showNotification(
                            `Saldo insuficiente na conta da API. Disponível para distribuir: ${this.formatCurrency(disponivel)} (Saldo API: ${this.formatCurrency(adminBalance)} | Em uso: ${this.formatCurrency(saldoEmUsoAtual)})`,
                            'error'
                        );
                        return;
                    }
                }
            } catch (e) {
                console.warn('Não foi possível validar saldo da API antes de adicionar saldo:', e);
                // Se não conseguir validar, permitir (mas o admin verá o saldo real no dashboard).
            }

            await this.db.addSaldo(userId, valor);
            this.showNotification(`Saldo de R$ ${valor.toFixed(2)} adicionado com sucesso!`, 'success');
            this.closeModal('addSaldoModal');
            this.loadRevendedores();
            this.loadAdminDashboard();
        } catch (error) {
            console.error('Erro ao adicionar saldo:', error);
            this.showNotification(error.message || 'Erro ao adicionar saldo', 'error');
        }
    }

    async createRevendedor() {
        const username = document.getElementById('revendedorUsername').value.trim();
        const password = document.getElementById('revendedorPassword').value;
        const nome = document.getElementById('revendedorNome').value.trim();
        const email = document.getElementById('revendedorEmail').value.trim();

        try {
            const revendedor = await this.db.createUser({
                username,
                password,
                type: 'revendedor',
                nome,
                email
            });

            this.showNotification('Revendedor criado com sucesso!', 'success');
            this.closeModal('addRevendedorModal');
            document.getElementById('addRevendedorForm').reset();
            this.loadRevendedores();
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async toggleRevendedorStatus(userId) {
        const user = this.db.getUserById(userId);
        if (!user) return;

        await this.db.updateUser(userId, { active: !user.active });
        this.showNotification(`Revendedor ${user.active ? 'desativado' : 'ativado'}`, 'success');
        this.loadRevendedores();
    }

    loadAdminPixRecargas() {
        const container = document.getElementById('adminPixRecargasList');
        const filterSelect = document.getElementById('pixRecargasFilter');
        if (!container) return;
        if (!filterSelect) {
            container.innerHTML = '<div class="empty-state"><p>Erro: filtro não encontrado. Recarregue a página.</p></div>';
            return;
        }
        try {
            const rawTransactions = this.db.getTransactions();
            const addSaldoList = (Array.isArray(rawTransactions) ? rawTransactions : []).filter(t => (t && t.type === 'add_saldo' && t.userId));

            const revsFromDb = this.db.getRevendedores();
        const revIdsFromAddSaldo = [...new Set(addSaldoList.map(t => t.userId).filter(Boolean))];
        const revMap = new Map();
        revsFromDb.forEach(rev => {
            const k = String(rev.id || '');
            revMap.set(k, { id: rev.id, nome: rev.nome || rev.username, username: rev.username });
        });
        revIdsFromAddSaldo.forEach(uid => {
            const k = String(uid || '');
            if (!revMap.has(k)) {
                const u = this.db.getUserById(uid);
                revMap.set(k, { id: uid, nome: u?.nome || u?.username || uid, username: u?.username || uid });
            }
        });
        const revendedores = Array.from(revMap.values());

        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">Todos os Revendedores</option>';
        revendedores.forEach(rev => {
            const option = document.createElement('option');
            option.value = rev.id;
            option.textContent = `${rev.nome || rev.username} (${rev.username})`;
            if (String(rev.id) === String(currentValue)) option.selected = true;
            filterSelect.appendChild(option);
        });
        try { filterSelect.value = currentValue; } catch (_) {}

        filterSelect.onchange = () => this.loadAdminPixRecargas();

        const selectedRevendedor = filterSelect.value || 'all';
        let filteredAddSaldo = addSaldoList;
        if (selectedRevendedor !== 'all') {
            filteredAddSaldo = addSaldoList.filter(t => String(t.userId || '') === String(selectedRevendedor));
        }

        const totalAddSaldo = filteredAddSaldo.length;
        const isPaidStatus = (status) => {
            const s = String(status || '').toLowerCase().trim();
            // Aceitar variações comuns de "pago"
            return (
                s === 'approved' ||
                s === 'paid' ||
                s === 'pago' ||
                s === 'aprovado' ||
                s === 'completed' ||
                s === 'success' ||
                s === 'succeeded'
            );
        };
        // "Total arrecadado" deve considerar apenas transações pagas
        const totalAddSaldoValor = filteredAddSaldo
            .filter(t => isPaidStatus(t.status))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        if (filteredAddSaldo.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💳</div>
                    <h3>Nenhuma adição de saldo PIX encontrada</h3>
                    <p>Não há recargas de saldo via PIX para o revendedor selecionado.</p>
                </div>
            `;
            return;
        }

        const listHtml = `
            <h3 style="margin: 24px 0 12px; color: var(--text-primary);">Adições de saldo PIX</h3>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Revendedor</th>
                            <th>Valor</th>
                            <th>ID da transação</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredAddSaldo.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(t => {
                            const u = this.db.getUserById(t.userId);
                            return `
                            <tr>
                                <td>${t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                                <td>${(u?.nome || u?.username || t.userId || '-')}</td>
                                <td>R$ ${Number(t.amount || 0).toFixed(2)}</td>
                                <td style="font-family: monospace; font-size: 12px;">${t.id || '-'}</td>
                                <td><span class="status-badge ${(t.status || 'aprovado').toLowerCase()}">${(t.status === 'approved' ? 'Aprovado' : t.status) || 'Aprovado'}</span></td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = `
            <div class="stats-grid" style="margin-bottom: 30px;">
                <div class="stat-card sales-stat">
                    <div class="stat-icon">📥</div>
                    <div class="stat-content">
                        <div class="stat-label">Total de Adições</div>
                        <div class="stat-value">${totalAddSaldo}</div>
                        <div class="stat-desc">Recargas de saldo via PIX</div>
                    </div>
                </div>
                <div class="stat-card sales-stat highlight-success">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <div class="stat-label">Valor Total</div>
                        <div class="stat-value">${this.formatCurrency(totalAddSaldoValor)}</div>
                        <div class="stat-desc">Total arrecadado</div>
                    </div>
                </div>
            </div>
            ${listHtml}
        `;
        } catch (e) {
            console.error('loadAdminPixRecargas:', e);
            container.innerHTML = `<div class="empty-state"><p>Erro ao carregar: ${(e && e.message) || e}. Recarregue a página.</p></div>`;
        }
    }


    /** Atualiza o status de recargas "pendente" consultando a API (GET /v1/me/orders/:id). */
    async refreshPendenteRecargasFromApi(recargas) {
        const toRefresh = (recargas || []).filter(r =>
            r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente')
        );
        await Promise.all(toRefresh.map(async (r) => {
            try {
                const res = await this.api.getOrder(r.apiOrderId);
                if (res && res.success && res.data && res.data.status != null) {
                    const oldStatus = r.status;
                    await this.db.updateRecarga(r.id, { status: res.data.status });
                    // Atualizar cache local também
                    const index = this.db._cache.recargas.findIndex(rec => rec.id === r.id);
                    if (index >= 0) {
                        this.db._cache.recargas[index].status = res.data.status;
                    }
                    
                    // Se o modal de comprovante está aberto e a recarga foi atualizada para "feita", atualizar o modal
                    const receiptModal = document.getElementById('receiptModal');
                    if (receiptModal && receiptModal.classList.contains('active') && this.currentReceiptData) {
                        const statusLower = String(res.data.status || '').toLowerCase();
                        const statusFeita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(statusLower);
                        
                        // Se o orderId corresponde e o status mudou para "feita", atualizar o modal
                        if (this.currentReceiptData.orderId === r.apiOrderId && statusFeita && oldStatus !== res.data.status) {
                            this.currentReceiptData.status = statusLower;
                            this.showReceiptModal(this.currentReceiptData);
                        }
                    }
                }
            } catch (e) {
                console.warn('Erro ao atualizar status da recarga', r.apiOrderId, e);
            }
        }));
    }

    async loadAdminVendas(skipRefresh = false) {
        const recargas = this.db.getAllRecargas();
        const container = document.getElementById('adminVendasList');
        const statsContainer = document.getElementById('salesStatsSummary');
        const filterSelect = document.getElementById('vendasFilter');
        if (!filterSelect) return;

        // Obter API Key atual para filtrar vendas
        const currentApiKey = this.api.apiKey || localStorage.getItem('adminApiKey') || '';
        console.log('🔑 Carregando vendas para API Key:', currentApiKey ? currentApiKey.substring(0, 20) + '...' : 'NENHUMA');

        // Filtrar recargas pela API Key atual (se a recarga tiver campo apiKey)
        // Se não tiver campo apiKey, incluir (compatibilidade com vendas antigas)
        let recargasFiltradasPorApiKey = recargas;
        if (currentApiKey && currentApiKey.trim() !== '' && !currentApiKey.includes('*')) {
            recargasFiltradasPorApiKey = recargas.filter(r => {
                // Se não tem campo apiKey, incluir (vendas antigas)
                if (!r.apiKey) return true;
                // Se tem campo apiKey, filtrar pela API Key atual
                return r.apiKey === currentApiKey;
            });
            console.log(`📊 Total de recargas: ${recargas.length}, Filtradas por API Key: ${recargasFiltradasPorApiKey.length}`);
        }

        // Montar lista de revendedores: getRevendedores + userIds únicos das recargas filtradas
        const revsFromDb = this.db.getRevendedores();
        const revIdsFromRecargas = [...new Set(recargasFiltradasPorApiKey.map(r => r.userId).filter(Boolean))];
        const revMap = new Map();
        revsFromDb.forEach(rev => {
            revMap.set(rev.id, { id: rev.id, nome: rev.nome || rev.username, username: rev.username });
        });
        revIdsFromRecargas.forEach(uid => {
            if (!revMap.has(uid)) {
                const rec = recargasFiltradasPorApiKey.find(r => r.userId === uid);
                revMap.set(uid, { id: uid, nome: rec?.username || uid, username: rec?.username || uid });
            }
        });
        const revendedores = Array.from(revMap.values());

        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">Todos os Revendedores</option>';
        revendedores.forEach(rev => {
            const option = document.createElement('option');
            option.value = rev.id;
            option.textContent = `${rev.nome || rev.username} (${rev.username})`;
            if (String(rev.id) === String(currentValue)) option.selected = true;
            filterSelect.appendChild(option);
        });
        try { filterSelect.value = currentValue; } catch (_) {}

        filterSelect.onchange = () => this.loadAdminVendas();

        const selectedRevendedor = filterSelect.value;
        let filteredRecargas = recargasFiltradasPorApiKey;
        
        if (selectedRevendedor !== 'all') {
            filteredRecargas = recargasFiltradasPorApiKey.filter(r => r.userId === selectedRevendedor);
        }

        // Calcular estatísticas gerais (API key atual)
        const totalVendas = filteredRecargas.length;
        const totalRecebido = filteredRecargas.reduce((sum, r) => sum + (r.salePrice || r.cost), 0);
        const totalCusto = filteredRecargas.reduce((sum, r) => sum + r.cost, 0);
        const totalLucro = filteredRecargas.reduce((sum, r) => sum + (r.profit || 0), 0);
        const vendasPublicas = filteredRecargas.filter(r => r.origin === 'public').length;
        const vendasManuais = filteredRecargas.filter(r => r.origin !== 'public').length;

        statsContainer.innerHTML = `
            <div style="margin-bottom: 12px;"><h3 style="margin:0; color: var(--text-primary);">📊 Progresso da API key atual</h3><p style="margin:4px 0 0; color: var(--text-secondary); font-size: 0.9rem;">Totais e lista de vendas da chave em uso.</p></div>
            <div class="stats-grid" style="margin-bottom: 30px;">
                <div class="stat-card sales-stat">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <div class="stat-label">Total de Vendas</div>
                        <div class="stat-value">${totalVendas}</div>
                        <div class="stat-desc">Recargas realizadas</div>
                    </div>
                </div>
                <div class="stat-card sales-stat">
                    <div class="stat-icon">💰</div>
                    <div class="stat-content">
                        <div class="stat-label">Total Recebido</div>
                        <div class="stat-value">${this.formatCurrency(totalRecebido)}</div>
                        <div class="stat-desc">Valor total arrecadado</div>
                    </div>
                </div>
                <div class="stat-card sales-stat">
                    <div class="stat-icon">💸</div>
                    <div class="stat-content">
                        <div class="stat-label">Total em Custos</div>
                        <div class="stat-value">${this.formatCurrency(totalCusto)}</div>
                        <div class="stat-desc">Investimento total</div>
                    </div>
                </div>
                <div class="stat-card sales-stat highlight-success">
                    <div class="stat-icon">✨</div>
                    <div class="stat-content">
                        <div class="stat-label">Lucro Total</div>
                        <div class="stat-value">${this.formatCurrency(totalLucro)}</div>
                        <div class="stat-desc">Ganho líquido</div>
                    </div>
                </div>
                <div class="stat-card sales-stat">
                    <div class="stat-icon">🌐</div>
                    <div class="stat-content">
                        <div class="stat-label">Vendas Públicas</div>
                        <div class="stat-value">${vendasPublicas}</div>
                        <div class="stat-desc">Via link de recarga</div>
                    </div>
                </div>
                <div class="stat-card sales-stat">
                    <div class="stat-icon">👤</div>
                    <div class="stat-content">
                        <div class="stat-label">Vendas Manuais</div>
                        <div class="stat-value">${vendasManuais}</div>
                        <div class="stat-desc">Direto no painel</div>
                    </div>
                </div>
            </div>
        `;

        if (filteredRecargas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💰</div>
                    <h3>Nenhuma venda encontrada</h3>
                    <p>Não há vendas para o revendedor selecionado.</p>
                </div>
            `;
            return;
        }

        const listHtml = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin: 24px 0 12px; flex-wrap: wrap; gap: 8px;">
                <h3 style="margin:0; color: var(--text-primary);">Lista de Vendas</h3>
                <button type="button" class="btn btn-secondary btn-small" id="btnAtualizarStatusVendas">🔄 Atualizar status</button>
            </div>
            <div class="table-container">
                <table class="data-table data-table--wide">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Revendedor</th>
                            <th>Telefone</th>
                            <th>Operadora</th>
                            <th>Valor</th>
                            <th>Custo</th>
                            <th>Pago</th>
                            <th>Lucro</th>
                            <th>Origem</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredRecargas.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(r => `
                            <tr>
                                <td>${r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-'}</td>
                                <td>${(r.username || '-')}</td>
                                <td>${(r.phoneNumber || r.phone || '-')}</td>
                                <td>${(r.carrier && typeof r.carrier === 'object' ? (r.carrier.name || r.carrierName || '-') : (r.carrier || r.carrierName)) || '-'}</td>
                                <td>R$ ${Number(r.value || 0).toFixed(2)}</td>
                                <td>R$ ${Number(r.cost || 0).toFixed(2)}</td>
                                <td>R$ ${Number(r.salePrice || r.cost || 0).toFixed(2)}</td>
                                <td>R$ ${Number(r.profit || 0).toFixed(2)}</td>
                                <td>${r.origin === 'public' ? 'PIX/Link' : 'Painel'}</td>
                                <td><span class="status-badge ${(r.status || 'pendente').toLowerCase()}">${r.status || 'pendente'}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        container.innerHTML = listHtml;

        const btnAtualizar = document.getElementById('btnAtualizarStatusVendas');
        if (btnAtualizar) {
            btnAtualizar.onclick = () => {
                const recs = this.db.getAllRecargas();
                const toR = recs.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
                this.refreshPendenteRecargasFromApi(toR).then(() => this.loadAdminVendas(true));
            };
        }

        if (skipRefresh) return;

        const toRefresh = recargas.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
        if (toRefresh.length) {
            this.refreshPendenteRecargasFromApi(toRefresh).then(() => this.loadAdminVendas(true));
        }
        if (this.vendasStatusPollInterval) {
            clearInterval(this.vendasStatusPollInterval);
            this.vendasStatusPollInterval = null;
        }
        this.vendasStatusPollInterval = setInterval(() => {
            const recs2 = this.db.getAllRecargas();
            const toR2 = recs2.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
            this.refreshPendenteRecargasFromApi(toR2).then(() => this.loadAdminVendas(true));
        }, 30000);
    }

    getHistoricoDateRange() {
        const period = document.getElementById('historicoPeriodo')?.value || '30dias';
        const now = new Date();
        let start = new Date(now);
        let end = new Date(now);
        end.setHours(23, 59, 59, 999);
        if (period === 'hoje') {
            start.setHours(0, 0, 0, 0);
        } else if (period === '7dias') {
            start.setDate(now.getDate() - 6);
            start.setHours(0, 0, 0, 0);
        } else if (period === '30dias') {
            start.setDate(now.getDate() - 29);
            start.setHours(0, 0, 0, 0);
        } else if (period === 'este_mes') {
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
        } else if (period === 'mes_passado') {
            start.setMonth(now.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setDate(0);
            end.setHours(23, 59, 59, 999);
        } else if (period === 'personalizado') {
            const inpInicio = document.getElementById('historicoDataInicio');
            const inpFim = document.getElementById('historicoDataFim');
            if (inpInicio?.value) start = new Date(inpInicio.value + 'T00:00:00');
            else start.setFullYear(2000, 0, 1);
            if (inpFim?.value) {
                end = new Date(inpFim.value + 'T23:59:59');
            }
        }
        return { start, end };
    }

    loadAdminHistorico() {
        const recargas = this.db.getAllRecargas();
        const currentApiKey = this.api.apiKey || localStorage.getItem('adminApiKey') || '';
        let recargasFiltradasPorApiKey = recargas;
        if (currentApiKey && currentApiKey.trim() !== '' && !currentApiKey.includes('*')) {
            recargasFiltradasPorApiKey = recargas.filter(r => !r.apiKey || r.apiKey === currentApiKey);
        }

        const revsFromDb = this.db.getRevendedores();
        const revIdsFromRecargas = [...new Set(recargasFiltradasPorApiKey.map(r => r.userId).filter(Boolean))];
        const revMap = new Map();
        revsFromDb.forEach(rev => {
            revMap.set(rev.id, { id: rev.id, nome: rev.nome || rev.username, username: rev.username });
        });
        revIdsFromRecargas.forEach(uid => {
            if (!revMap.has(uid)) {
                const rec = recargasFiltradasPorApiKey.find(r => r.userId === uid);
                revMap.set(uid, { id: uid, nome: rec?.username || uid, username: rec?.username || uid });
            }
        });

        const revSelect = document.getElementById('historicoRevendedor');
        if (revSelect) {
            const cur = revSelect.value;
            revSelect.innerHTML = '<option value="all">Todos</option>';
            Array.from(revMap.values()).forEach(rev => {
                const opt = document.createElement('option');
                opt.value = rev.id;
                opt.textContent = `${rev.nome || rev.username} (${rev.username})`;
                revSelect.appendChild(opt);
            });
            try { revSelect.value = cur || 'all'; } catch (_) {}
        }

        const periodSelect = document.getElementById('historicoPeriodo');
        const datesGroup = document.getElementById('historicoDatesGroup');
        const datesGroupFim = document.getElementById('historicoDatesGroupFim');
        if (periodSelect) {
            periodSelect.onchange = () => {
                const isCustom = periodSelect.value === 'personalizado';
                if (datesGroup) datesGroup.style.display = isCustom ? 'block' : 'none';
                if (datesGroupFim) datesGroupFim.style.display = isCustom ? 'block' : 'none';
                if (isCustom) {
                    const end = new Date();
                    const start = new Date(end);
                    start.setDate(start.getDate() - 29);
                    document.getElementById('historicoDataInicio').value = start.toISOString().slice(0, 10);
                    document.getElementById('historicoDataFim').value = end.toISOString().slice(0, 10);
                }
            };
        }

        const aplicarBtn = document.getElementById('historicoAplicarBtn');
        if (aplicarBtn) {
            aplicarBtn.onclick = () => this.applyHistoricoFilters(recargasFiltradasPorApiKey, revMap);
        }

        this.applyHistoricoFilters(recargasFiltradasPorApiKey, revMap);
    }

    applyHistoricoFilters(recargasFiltradasPorApiKey, revMap) {
        const { start, end } = this.getHistoricoDateRange();
        const revValue = document.getElementById('historicoRevendedor')?.value || 'all';

        let list = recargasFiltradasPorApiKey.filter(r => {
            const createdAt = r.createdAt ? new Date(r.createdAt).getTime() : 0;
            if (createdAt < start.getTime() || createdAt > end.getTime()) return false;
            if (revValue !== 'all' && r.userId !== revValue) return false;
            return true;
        });

        list = list.slice().sort((a, b) => (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime());

        const totalVendido = list.reduce((s, r) => s + (Number(r.salePrice) || Number(r.cost) || 0), 0);
        const totalCusto = list.reduce((s, r) => s + (Number(r.cost) || 0), 0);
        const totalLucro = list.reduce((s, r) => s + (Number(r.profit) || 0), 0);
        const qtdRecargas = list.length;
        const qtdPix = list.filter(r => r.origin === 'public').length;
        const qtdPainel = list.filter(r => r.origin !== 'public').length;

        const summaryEl = document.getElementById('historicoSummary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div class="stats-grid" style="margin-bottom: 0;">
                    <div class="stat-card sales-stat">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-label">Quantidade de recargas</div>
                            <div class="stat-value">${qtdRecargas}</div>
                            <div class="stat-desc">No período selecionado</div>
                        </div>
                    </div>
                    <div class="stat-card sales-stat">
                        <div class="stat-icon">💰</div>
                        <div class="stat-content">
                            <div class="stat-label">Total vendido (receita)</div>
                            <div class="stat-value">${this.formatCurrency(totalVendido)}</div>
                            <div class="stat-desc">Valor pago pelos clientes</div>
                        </div>
                    </div>
                    <div class="stat-card sales-stat">
                        <div class="stat-icon">💸</div>
                        <div class="stat-content">
                            <div class="stat-label">Total em custos</div>
                            <div class="stat-value">${this.formatCurrency(totalCusto)}</div>
                            <div class="stat-desc">Custo das recargas</div>
                        </div>
                    </div>
                    <div class="stat-card sales-stat highlight-success">
                        <div class="stat-icon">✨</div>
                        <div class="stat-content">
                            <div class="stat-label">Lucro total</div>
                            <div class="stat-value">${this.formatCurrency(totalLucro)}</div>
                            <div class="stat-desc">Ganho líquido</div>
                        </div>
                    </div>
                    <div class="stat-card sales-stat">
                        <div class="stat-icon">💳</div>
                        <div class="stat-content">
                            <div class="stat-label">Via PIX / Link</div>
                            <div class="stat-value">${qtdPix}</div>
                            <div class="stat-desc">Recargas públicas</div>
                        </div>
                    </div>
                    <div class="stat-card sales-stat">
                        <div class="stat-icon">👤</div>
                        <div class="stat-content">
                            <div class="stat-label">Via painel</div>
                            <div class="stat-value">${qtdPainel}</div>
                            <div class="stat-desc">Recargas manuais</div>
                        </div>
                    </div>
                </div>
            `;
        }

        const rankingByRev = new Map();
        list.forEach(r => {
            const uid = r.userId || 'unknown';
            const nome = r.username || revMap.get(uid)?.nome || uid;
            if (!rankingByRev.has(uid)) {
                rankingByRev.set(uid, { userId: uid, nome, qtd: 0, vendido: 0, lucro: 0 });
            }
            const row = rankingByRev.get(uid);
            row.qtd += 1;
            row.vendido += Number(r.salePrice) || Number(r.cost) || 0;
            row.lucro += Number(r.profit) || 0;
        });
        const ranking = Array.from(rankingByRev.values()).sort((a, b) => b.vendido - a.vendido);

        const rankingContainer = document.getElementById('historicoRanking');
        const rankingContent = document.getElementById('historicoRankingContent');
        if (rankingContainer && rankingContent) {
            if (ranking.length === 0) {
                rankingContainer.style.display = 'none';
            } else {
                rankingContainer.style.display = 'block';
                rankingContent.innerHTML = `
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Revendedor</th>
                                    <th>Qtd vendas</th>
                                    <th>Total vendido</th>
                                    <th>Lucro</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${ranking.map((r, i) => `
                                    <tr>
                                        <td>${i + 1}</td>
                                        <td><strong>${r.nome}</strong></td>
                                        <td>${r.qtd}</td>
                                        <td>${this.formatCurrency(r.vendido)}</td>
                                        <td>${this.formatCurrency(r.lucro)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

        const tabela = document.getElementById('historicoTabela');
        const tabelaBody = document.getElementById('historicoTabelaBody');
        const placeholder = document.getElementById('historicoTabelaPlaceholder');
        if (tabela && tabelaBody && placeholder) {
            if (list.length === 0) {
                tabela.style.display = 'none';
                placeholder.style.display = 'block';
                placeholder.innerHTML = '<p>Nenhuma recarga no período selecionado.</p>';
            } else {
                placeholder.style.display = 'none';
                tabela.style.display = 'table';
                tabelaBody.innerHTML = list.map(r => {
                    const carrierName = (r.carrier && typeof r.carrier === 'object') ? (r.carrier.name || r.carrierName) : (r.carrier || r.carrierName);
                    const valor = Number(r.value || 0);
                    const custo = Number(r.cost || 0);
                    const pago = Number(r.salePrice || r.cost || 0);
                    const lucro = Number(r.profit || 0);
                    const dataStr = r.createdAt ? new Date(r.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
                    return `
                        <tr>
                            <td>${dataStr}</td>
                            <td>${r.username || '-'}</td>
                            <td>${r.phoneNumber || r.phone || '-'}</td>
                            <td>${carrierName || '-'}</td>
                            <td>R$ ${valor.toFixed(2)}</td>
                            <td>R$ ${custo.toFixed(2)}</td>
                            <td>R$ ${pago.toFixed(2)}</td>
                            <td>R$ ${lucro.toFixed(2)}</td>
                            <td>${r.origin === 'public' ? 'PIX/Link' : 'Painel'}</td>
                            <td><span class="status-badge ${(r.status || 'pendente').toLowerCase()}">${r.status || 'pendente'}</span></td>
                            <td>${r.apiOrderId || r.id || '-'}</td>
                        </tr>
                    `;
                }).join('');
            }
        }
    }

    async loadAdminBonus() {
        const geralInput = document.getElementById('bonusGeralValor');
        const listaComBonus = document.getElementById('bonusListaComBonus');
        const porRevendedorLista = document.getElementById('bonusPorRevendedorLista');
        const totalConcedidoEl = document.getElementById('bonusTotalConcedido');
        const rankingLista = document.getElementById('bonusRankingLista');
        const historicoTabela = document.getElementById('bonusHistoricoTabela');
        const historicoBody = document.getElementById('bonusHistoricoBody');
        const historicoVazio = document.getElementById('bonusHistoricoVazio');

        try {
            const configRes = await fetch('api/data.php?action=bonus_getConfig');
            const configJson = await configRes.json();
            if (!configJson || !configJson.success) {
                listaComBonus.innerHTML = '<p class="muted">Erro ao carregar configuração de bônus.</p>';
                porRevendedorLista.innerHTML = '<p class="muted">Erro ao carregar revendedores.</p>';
                return;
            }
            const cfg = configJson.data || {};
            const geral = cfg.geral && typeof cfg.geral === 'object'
                ? { tipo: cfg.geral.tipo || 'fixo', valor: Number(cfg.geral.valor) || 0, depositoMinimo: Number(cfg.geral.depositoMinimo) || 0 }
                : { tipo: 'fixo', valor: 0, depositoMinimo: 0 };
            const revendedores = Array.isArray(cfg.revendedores) ? cfg.revendedores : [];

            const tipoGeralEl = document.getElementById('bonusGeralTipo');
            const depositoMinGeralEl = document.getElementById('bonusGeralDepositoMinimo');
            const valorLabel = document.getElementById('bonusGeralValorLabel');
            const depMinGroup = document.querySelector('.bonus-geral-dep-min');
            if (tipoGeralEl) tipoGeralEl.value = geral.tipo === 'percentual' ? 'percentual' : 'fixo';
            if (geralInput) geralInput.value = geral.valor > 0 ? geral.valor.toFixed(2) : '';
            if (depositoMinGeralEl) depositoMinGeralEl.value = geral.depositoMinimo > 0 ? geral.depositoMinimo.toFixed(2) : '';
            const updateGeralLabelAndDep = () => {
                const isFixo = document.getElementById('bonusGeralTipo')?.value !== 'percentual';
                if (valorLabel) valorLabel.textContent = isFixo ? 'Valor (R$)' : 'Valor (%)';
                if (depMinGroup) depMinGroup.style.display = isFixo ? 'block' : 'none';
            };
            updateGeralLabelAndDep();
            if (tipoGeralEl) tipoGeralEl.addEventListener('change', updateGeralLabelAndDep);

            const comBonus = revendedores.filter(r => (Number(r.valor) || 0) > 0);
            const fmtBonusDesc = (r) => {
                const v = Number(r.valor);
                const t = r.tipo === 'percentual' ? 'percentual' : 'fixo';
                if (t === 'percentual') return `${v}% do depósito`;
                const d = Number(r.depositoMinimo) || 0;
                return d > 0 ? `R$ ${v.toFixed(2)} (dep. mín. R$ ${d.toFixed(2)})` : `R$ ${v.toFixed(2)}`;
            };
            if (listaComBonus) {
                if (comBonus.length === 0) {
                    listaComBonus.innerHTML = '<p class="muted">Nenhum revendedor com bônus individual ativo.</p>';
                } else {
                    listaComBonus.innerHTML = `
                        <ul style="list-style: none; margin: 0; padding: 0;">
                            ${comBonus.map(r => `
                                <li style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                                    <span><strong>${(r.nome || r.username || r.userId)}</strong> — ${fmtBonusDesc(r)}</span>
                                    <button type="button" class="btn btn-secondary btn-small bonus-remover-btn" data-user-id="${r.userId}">Remover bônus</button>
                                </li>
                            `).join('')}
                        </ul>
                    `;
                    listaComBonus.querySelectorAll('.bonus-remover-btn').forEach(btn => {
                        btn.addEventListener('click', () => this.bonusRemoverRevendedor(btn.getAttribute('data-user-id')));
                    });
                }
            }

            if (porRevendedorLista) {
                if (revendedores.length === 0) {
                    porRevendedorLista.innerHTML = '<p class="muted">Nenhum revendedor cadastrado.</p>';
                } else {
                    porRevendedorLista.innerHTML = `
                        <div class="table-responsive bonus-rev-table-wrap">
                            <table class="data-table bonus-rev-table">
                                <thead>
                                    <tr><th>Revendedor</th><th>Tipo</th><th>Valor</th><th>Dep. mín. (R$)</th><th>Ação</th></tr>
                                </thead>
                                <tbody>
                                    ${revendedores.map(r => {
                                        const t = r.tipo === 'percentual' ? 'percentual' : 'fixo';
                                        const v = (Number(r.valor) || 0) > 0 ? Number(r.valor).toFixed(2) : '';
                                        const d = (Number(r.depositoMinimo) || 0) > 0 ? Number(r.depositoMinimo).toFixed(2) : '';
                                        return `
                                        <tr>
                                            <td data-label="Revendedor">${r.nome || r.username || r.userId}</td>
                                            <td data-label="Tipo">
                                                <select class="bonus-rev-tipo filter-select" data-user-id="${r.userId}">
                                                    <option value="fixo" ${t === 'fixo' ? 'selected' : ''}>Fixo</option>
                                                    <option value="percentual" ${t === 'percentual' ? 'selected' : ''}>%</option>
                                                </select>
                                            </td>
                                            <td data-label="Valor"><input type="number" min="0" step="0.01" class="bonus-rev-valor" data-user-id="${r.userId}" value="${v}" placeholder="0"></td>
                                            <td data-label="Dep. mín."><input type="number" min="0" step="0.01" class="bonus-rev-dep" data-user-id="${r.userId}" value="${d}" placeholder="0"></td>
                                            <td data-label="Ação"><button type="button" class="btn btn-primary btn-small bonus-set-rev-btn" data-user-id="${r.userId}">Definir / Remover</button></td>
                                        </tr>
                                    `; }).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
                    porRevendedorLista.querySelectorAll('.bonus-set-rev-btn').forEach(btn => {
                        const uid = btn.getAttribute('data-user-id');
                        btn.addEventListener('click', () => {
                            const tipoSel = porRevendedorLista.querySelector(`.bonus-rev-tipo[data-user-id="${uid}"]`);
                            const inputVal = porRevendedorLista.querySelector(`.bonus-rev-valor[data-user-id="${uid}"]`);
                            const inputDep = porRevendedorLista.querySelector(`.bonus-rev-dep[data-user-id="${uid}"]`);
                            const tipo = tipoSel ? tipoSel.value : 'fixo';
                            const val = inputVal ? parseFloat(inputVal.value) : 0;
                            const dep = inputDep ? parseFloat(inputDep.value) : 0;
                            this.bonusSetRevendedor(uid, tipo, isNaN(val) ? 0 : val, isNaN(dep) ? 0 : dep);
                        });
                    });
                }
            }

            const salvarGeralBtn = document.getElementById('bonusSalvarGeralBtn');
            if (salvarGeralBtn) {
                salvarGeralBtn.onclick = () => {
                    const tipo = document.getElementById('bonusGeralTipo')?.value === 'percentual' ? 'percentual' : 'fixo';
                    const v = parseFloat(geralInput?.value);
                    const dep = parseFloat(depositoMinGeralEl?.value);
                    this.bonusSetGeral(tipo, isNaN(v) ? 0 : v, isNaN(dep) ? 0 : dep);
                };
            }
        } catch (e) {
            console.error('Erro ao carregar bônus:', e);
            if (listaComBonus) listaComBonus.innerHTML = '<p class="muted">Erro ao carregar.</p>';
            if (porRevendedorLista) porRevendedorLista.innerHTML = '<p class="muted">Erro ao carregar.</p>';
        }

        try {
            const histRes = await fetch('api/data.php?action=bonus_getHistorico&limit=500');
            const histJson = await histRes.json();
            if (!histJson || !histJson.success) {
                if (totalConcedidoEl) totalConcedidoEl.textContent = 'R$ 0,00';
                if (historicoVazio) { historicoVazio.style.display = 'block'; historicoTabela.style.display = 'none'; }
                return;
            }
            const list = histJson.data?.list || [];
            const totalConcedido = Number(histJson.data?.totalConcedido) || 0;
            if (totalConcedidoEl) totalConcedidoEl.textContent = this.formatCurrency(totalConcedido);

            const byUser = new Map();
            list.forEach(item => {
                const uid = item.userId || 'unknown';
                if (!byUser.has(uid)) byUser.set(uid, { userId: uid, nome: item.username || uid, total: 0 });
                byUser.get(uid).total += Number(item.valorBonus) || 0;
            });
            const ranking = Array.from(byUser.values()).sort((a, b) => b.total - a.total).slice(0, 10);
            if (rankingLista) {
                if (ranking.length === 0) {
                    rankingLista.innerHTML = '<li class="muted">Nenhum bônus concedido ainda.</li>';
                } else {
                    rankingLista.innerHTML = ranking.map((r, i) =>
                        `<li>${i + 1}. ${r.nome} — ${this.formatCurrency(r.total)}</li>`
                    ).join('');
                }
            }

            if (historicoTabela && historicoBody && historicoVazio) {
                if (list.length === 0) {
                    historicoVazio.style.display = 'block';
                    historicoTabela.style.display = 'none';
                } else {
                    historicoVazio.style.display = 'none';
                    historicoTabela.style.display = 'table';
                    historicoBody.innerHTML = list.map(item => {
                        const dataStr = item.createdAt ? new Date(item.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '-';
                        return `
                            <tr>
                                <td data-label="Data/Hora">${dataStr}</td>
                                <td data-label="Revendedor">${item.username || item.userId || '-'}</td>
                                <td data-label="Valor depósito">${this.formatCurrency(Number(item.valorDeposito) || 0)}</td>
                                <td data-label="Valor bônus">${this.formatCurrency(Number(item.valorBonus) || 0)}</td>
                                <td data-label="Tipo">${item.tipo || 'geral'}</td>
                            </tr>
                        `;
                    }).join('');
                }
            }
        } catch (e) {
            console.error('Erro ao carregar histórico de bônus:', e);
            if (totalConcedidoEl) totalConcedidoEl.textContent = 'R$ 0,00';
            if (historicoVazio) { historicoVazio.style.display = 'block'; if (historicoTabela) historicoTabela.style.display = 'none'; }
        }
    }

    async bonusSetGeral(tipo, valor, depositoMinimo) {
        try {
            const res = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'bonus_setGeral', tipo: tipo || 'fixo', valor: Number(valor) || 0, depositoMinimo: Number(depositoMinimo) || 0 })
            });
            const j = await res.json();
            if (j && j.success) {
                this.showNotification('Bônus geral salvo.', 'success');
                this.loadAdminBonus();
            } else {
                this.showNotification(j?.error || 'Erro ao salvar bônus geral.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro: ' + (e.message || e), 'error');
        }
    }

    async bonusSetRevendedor(userId, tipo, valor, depositoMinimo) {
        try {
            const res = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'bonus_setRevendedor',
                    userId,
                    tipo: tipo || 'fixo',
                    valor: Number(valor) || 0,
                    depositoMinimo: Number(depositoMinimo) || 0
                })
            });
            const j = await res.json();
            if (j && j.success) {
                this.showNotification((Number(valor) || 0) > 0 ? 'Bônus do revendedor definido.' : 'Bônus do revendedor removido.', 'success');
                this.loadAdminBonus();
            } else {
                this.showNotification(j?.error || 'Erro ao definir bônus.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro: ' + (e.message || e), 'error');
        }
    }

    async bonusRemoverRevendedor(userId) {
        await this.bonusSetRevendedor(userId, 'fixo', 0, 0);
    }

    async savePersonalizacao() {
        const input = document.getElementById('configSiteTitle');
        const title = (input?.value ?? '').trim() || 'Recarga Express';
        try {
            const res = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'config_set', siteTitle: title })
            });
            const j = await res.json();
            if (j && j.success) {
                this.appTitle = title;
                this.applyAppTitle();
                this.showNotification('Personalização salva. O nome do sistema foi atualizado.', 'success');
            } else {
                this.showNotification(j?.error || 'Erro ao salvar.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro: ' + (e.message || e), 'error');
        }
    }

    async saveAdminConfig() {
        const apiKeyInput = document.getElementById('adminApiKey');
        const apiKey = (apiKeyInput?.value ?? '').trim();
        const baseURL = (document.getElementById('adminApiBaseUrl')?.value ?? '').trim();
        const modoSelect = document.getElementById('adminMercadoPagoModo');
        const modo = modoSelect ? modoSelect.value : 'prod';
        const keyTest = (document.getElementById('adminMercadoPagoKeyTest')?.value ?? '').trim();
        const keyProd = (document.getElementById('adminMercadoPagoKeyProd')?.value ?? '').trim();
        const virtualPayClientId = (document.getElementById('adminVirtualPayClientId')?.value ?? '').trim();
        const virtualPayClientSecret = (document.getElementById('adminVirtualPayClientSecret')?.value ?? '').trim();
        const pushinPayToken = (document.getElementById('adminPushinPayToken')?.value ?? '').trim();
        const paymentModuleSelect = document.getElementById('adminPaymentModule');
        const paymentModule = paymentModuleSelect ? paymentModuleSelect.value : 'mercadopago';
        const paymentModuleValido = (paymentModule === 'mercadopago' || paymentModule === 'virtualpay' || paymentModule === 'pushinpay') ? paymentModule : 'mercadopago';

        const modoValido = (modo === 'test' || modo === 'prod') ? modo : 'prod';

        const currentStoredKey = (localStorage.getItem('adminApiKey') || '').trim();
        const apiKeyIsChanging = apiKey && !apiKey.includes('*') && currentStoredKey && currentStoredKey !== apiKey;
        if (apiKeyIsChanging) {
            try {
                const recargaBackupRes = await fetch('api/data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'recarga_backupAndClear' })
                });
                const recargaBackupJson = await recargaBackupRes.json().catch(() => ({}));
                if (recargaBackupJson && recargaBackupJson.success && recargaBackupJson.data && recargaBackupJson.data.backedUp > 0) {
                    this.showNotification(`API key atualizada. ${recargaBackupJson.data.backedUp} venda(s) da key antiga foram arquivadas. Listas de Vendas e Recargas PIX foram limpas.`, 'success');
                } else {
                    this.showNotification('API key atualizada. Listas de Vendas e Recargas PIX foram limpas.', 'success');
                }
            } catch (e) {
                console.warn('Erro ao fazer backup de recargas:', e);
            }
            try {
                await fetch('api/data.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'transaction_backupAndClear' })
                }).then(r => r.json()).catch(() => ({}));
            } catch (e) {
                console.warn('Erro ao fazer backup de transactions:', e);
            }
            this.db._cache.recargas = [];
            this.db._cache.transactions = [];
            try {
                await this.db.refresh();
            } catch (_) {}
            try {
                await this.loadAdminVendas();
            } catch (e) {
                console.warn('Erro ao atualizar aba Vendas:', e);
            }
            try {
                this.loadAdminPixRecargas();
            } catch (e) {
                console.warn('Erro ao atualizar aba Recargas PIX:', e);
            }
        }

        // API Key: só atualizar se preenchida e não mascarada (evitar enviar ****)
        // Vazio = "manter a atual" (não enviar no config_set)
        if (apiKey && !apiKey.includes('*')) {
            localStorage.setItem('adminApiKey', apiKey);
            this.api.setApiKey(apiKey);
        } else {
            const currentApiKey = localStorage.getItem('adminApiKey') || '';
            if (currentApiKey && !currentApiKey.includes('*')) this.api.setApiKey(currentApiKey);
        }
        localStorage.setItem('adminApiBaseURL', baseURL);
        localStorage.setItem('adminMercadoPagoModo', modoValido);
        if (keyTest) localStorage.setItem('adminMercadoPagoKeyTest', keyTest);
        if (keyProd) {
            localStorage.setItem('adminMercadoPagoKeyProd', keyProd);
            localStorage.setItem('adminMercadoPagoKey', keyProd);
        }
        if (virtualPayClientId) localStorage.setItem('adminVirtualPayClientId', virtualPayClientId);
        if (virtualPayClientSecret) localStorage.setItem('adminVirtualPayClientSecret', virtualPayClientSecret);
        if (pushinPayToken) localStorage.setItem('adminPushinPayToken', pushinPayToken);
        localStorage.setItem('adminPaymentModule', paymentModuleValido);
        this.api.setBaseURL(baseURL);

        const configData = { 
            action: 'config_set', 
            adminMercadoPagoModo: modoValido, 
            adminApiBaseURL: baseURL,
            adminPaymentModule: paymentModuleValido
        };
        if (apiKey && !apiKey.includes('*')) configData.adminApiKey = apiKey;
        if (keyTest) configData.adminMercadoPagoKeyTest = keyTest;
        if (keyProd) configData.adminMercadoPagoKeyProd = keyProd;
        if (virtualPayClientId) configData.adminVirtualPayClientId = virtualPayClientId;
        if (virtualPayClientSecret) configData.adminVirtualPayClientSecret = virtualPayClientSecret;
        if (pushinPayToken) configData.adminPushinPayToken = pushinPayToken;

        try {
            const response = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configData)
            });
            const result = await response.json();
            if (!result.success) {
                console.warn('Config servidor:', result.error);
                this.showNotification('Configurações salvas localmente, mas houve erro ao salvar no servidor', 'warning');
            } else {
                await this.loadAdminConfig();
                await mercadoPago.ensureAdminConfigLoaded();
                const msg = (apiKey && !apiKey.includes('*')) ? 'Configurações salvas! A API Key foi atualizada.' : 'Configurações salvas com sucesso!';
                this.showNotification(msg, 'success');
                
                // Recarregar lista de vendas para mostrar apenas vendas da nova API Key
                if (apiKey && !apiKey.includes('*') && apiKeyIsChanging) {
                    setTimeout(() => {
                        this.loadAdminVendas();
                    }, 500);
                }
            }
        } catch (e) {
            console.warn('Erro ao salvar config no servidor:', e);
            this.showNotification('Configurações salvas localmente, mas houve erro ao salvar no servidor', 'warning');
        }
    }

    // Revendedor Functions
    loadRevendedorDashboard() {
        const saldo = this.db.getSaldo(this.currentUser.id);
        const recargas = this.db.getRecargasByUser(this.currentUser.id);
        const totalGasto = this.db.getTotalGastoByUser(this.currentUser.id);

        const welcomeEl = document.getElementById('revendedorDashboardWelcome');
        if (welcomeEl) {
            const nome = (this.currentUser.nome || this.currentUser.username || '').trim() || 'Revendedor';
            welcomeEl.textContent = nome ? `Olá, ${nome}!` : 'Olá!';
        }

        document.getElementById('revendedorBalance').textContent = this.formatCurrency(saldo);
        const totalRecargasEl = document.getElementById('revendedorTotalRecargas');
        if (totalRecargasEl) totalRecargasEl.textContent = recargas.length;
        document.getElementById('revendedorTotalGasto').textContent = this.formatCurrency(totalGasto);
        const statusEl = document.getElementById('revendedorStatus');
        if (statusEl) {
            statusEl.textContent = this.currentUser.active ? 'Ativo' : 'Inativo';
            statusEl.className = 'rev-dash-stat-value rev-dash-status' + (this.currentUser.active ? ' rev-dash-status-ativo' : ' rev-dash-status-inativo');
        }

        // Atalhos do dashboard: Nova recarga e Recargas PIX
        document.querySelectorAll('.rev-dash-action-link[data-tab]').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const tab = link.getAttribute('data-tab');
                if (tab) this.switchTab(tab);
                this.closeMenuDrawer();
            };
        });
    }

    async loadCatalog() {
        const catalogContent = document.getElementById('catalogContent');
        if (!catalogContent) return;
        
        catalogContent.innerHTML = '<div class="loading">Carregando catálogo...</div>';

        try {
            // Verificar se revendedor tem catálogo personalizado
            let catalog = null;
            if (this.currentUser.type === 'revendedor') {
                catalog = this.db.getCatalog(this.currentUser.id);
            }

            if (catalog) {
                // Usar catálogo personalizado
                this.catalog = catalog;
                this.renderCatalog();
                this.updateCarrierSelect();
            } else {
                // Carregar catálogo original da API
                const response = await this.api.getCatalog();
                if (response.success) {
                    this.catalog = response.data;
                    this.renderCatalog();
                    this.updateCarrierSelect();
                }
            }
        } catch (error) {
            catalogContent.innerHTML = `<div class="loading" style="color: var(--danger-color);">Erro: ${error.message}</div>`;
        }
    }

    async loadCatalogForRecharge() {
        // Função específica para carregar catálogo na aba Nova Recarga
        try {
            // Mostrar loading nos selects
            const carrierSelect = document.getElementById('carrierSelect');
            const valueSelect = document.getElementById('valueSelect');
            
            if (carrierSelect) {
                carrierSelect.innerHTML = '<option value="">Carregando operadoras...</option>';
                carrierSelect.disabled = true;
            }
            if (valueSelect) {
                valueSelect.innerHTML = '<option value="">Selecione uma operadora primeiro</option>';
                valueSelect.disabled = true;
            }

            // Verificar se revendedor tem catálogo personalizado
            let catalog = null;
            if (this.currentUser && this.currentUser.type === 'revendedor') {
                catalog = this.db.getCatalog(this.currentUser.id);
            }

            if (catalog && Array.isArray(catalog) && catalog.length > 0) {
                // Usar catálogo personalizado (já tem cost editado pelo admin)
                this.catalog = this.ensureCatalogCosts(catalog);
                console.log('Catálogo personalizado carregado para recarga:', catalog.length, 'operadoras');
                this.updateCarrierSelect();
            } else {
                // Preferir catálogo publicado pelo admin; se não existir, carregar da API
                const serverCatalog = await this.fetchAdminCatalogFromServer();
                if (serverCatalog && Array.isArray(serverCatalog) && serverCatalog.length > 0) {
                    this.catalog = this.ensureCatalogCosts(serverCatalog);
                    console.log('Catálogo do admin carregado para recarga:', this.catalog.length, 'operadoras');
                    this.updateCarrierSelect();
                } else {
                    console.log('Carregando catálogo da API...');
                    const response = await this.api.getCatalog();
                    const raw = (response && response.success && response.data) ? response.data : (Array.isArray(response) ? response : null);
                    if (raw && Array.isArray(raw)) {
                        this.catalog = this.normalizeCatalogFromApi(raw);
                        console.log('Catálogo da API carregado:', this.catalog.length, 'operadoras');
                        this.updateCarrierSelect();
                    } else {
                        console.error('Erro ao carregar catálogo:', response);
                        if (carrierSelect) {
                            carrierSelect.innerHTML = '<option value="">Erro ao carregar operadoras</option>';
                        }
                        this.showNotification('Erro ao carregar catálogo. Tente novamente.', 'error');
                    }
                }
            }

            // Reabilitar selects
            if (carrierSelect) {
                carrierSelect.disabled = false;
            }
            if (valueSelect) {
                valueSelect.disabled = false;
            }
        } catch (error) {
            console.error('Erro ao carregar catálogo para recarga:', error);
            const carrierSelect = document.getElementById('carrierSelect');
            if (carrierSelect) {
                carrierSelect.innerHTML = '<option value="">Erro ao carregar</option>';
            }
            this.showNotification(`Erro ao carregar catálogo: ${error.message}`, 'error');
        }
    }

    renderCatalog() {
        const catalogContent = document.getElementById('catalogContent');
        
        if (this.catalog.length === 0) {
            catalogContent.innerHTML = '<div class="loading">Nenhuma operadora disponível</div>';
            return;
        }

        catalogContent.innerHTML = this.catalog.map(carrier => {
            const valuesHtml = carrier.values.map(value => {
                const salePrice = value.salePrice || value.cost;
                const originalValue = value.originalValue || value.value;
                const originalCost = value.originalCost || value.cost;
                
                return `
                    <div class="value-item">
                        <div class="value-item-info">
                            <span class="value-item-value">R$ ${originalValue.toFixed(2)}</span>
                            <span class="value-item-cost">Preço: R$ ${salePrice.toFixed(2)} | Custo: R$ ${originalCost.toFixed(2)}</span>
                        </div>
                    </div>
                `;
            }).join('');

            const extraFieldHtml = carrier.extraField?.required 
                ? `<div style="margin-top: 10px; padding: 8px; background: #fef3c7; border-radius: 6px; font-size: 12px;">
                    ⚠️ Requer: ${carrier.extraField.title}
                   </div>`
                : '';

            return `
                <div class="carrier-card">
                    <div class="carrier-name">${carrier.name}</div>
                    <div class="values-list">
                        ${valuesHtml}
                    </div>
                    ${extraFieldHtml}
                </div>
            `;
        }).join('');
    }

    updateCarrierSelect() {
        const select = document.getElementById('carrierSelect');
        if (!select) {
            console.warn('Elemento carrierSelect não encontrado');
            return;
        }

        if (!this.catalog || !Array.isArray(this.catalog) || this.catalog.length === 0) {
            console.warn('Catálogo não disponível ou vazio');
            select.innerHTML = '<option value="">Nenhuma operadora disponível</option>';
            select.disabled = false;
            return;
        }

        select.innerHTML = '<option value="">Selecione uma operadora</option>';
        
        let loadedCount = 0;
        this.catalog.forEach(carrier => {
            if (carrier.carrierId && carrier.name) {
                const option = document.createElement('option');
                option.value = carrier.carrierId;
                option.textContent = carrier.name;
                select.appendChild(option);
                loadedCount++;
            }
        });

        select.disabled = false;
        console.log(`Operadoras carregadas: ${loadedCount} de ${this.catalog.length}`);
        
        if (loadedCount === 0) {
            select.innerHTML = '<option value="">Nenhuma operadora disponível</option>';
            this.showNotification('Nenhuma operadora disponível no catálogo', 'error');
        }
    }

    updateValueSelect(carrierId) {
        const select = document.getElementById('valueSelect');
        if (!select) {
            console.warn('Elemento valueSelect não encontrado');
            return;
        }

        select.innerHTML = '<option value="">Selecione um valor</option>';

        if (!carrierId) {
            // Limpar campo extra quando não há operadora selecionada
            const extraDataGroup = document.getElementById('extraDataGroup');
            if (extraDataGroup) {
                extraDataGroup.style.display = 'none';
            }
            return;
        }

        if (!this.catalog || !Array.isArray(this.catalog)) {
            console.warn('Catálogo não disponível');
            return;
        }

        const carrier = this.catalog.find(c => c.carrierId === carrierId);
        if (!carrier) {
            console.warn('Operadora não encontrada no catálogo:', carrierId);
            return;
        }

        const extraDataGroup = document.getElementById('extraDataGroup');
        const extraDataLabel = document.getElementById('extraDataLabel');
        const extraDataInput = document.getElementById('extraData');

        if (extraDataGroup && extraDataLabel && extraDataInput) {
            if (carrier.extraField?.required) {
                extraDataGroup.style.display = 'block';
                extraDataLabel.textContent = carrier.extraField.title + ' *';
                extraDataInput.required = true;
            } else {
                extraDataGroup.style.display = 'none';
                extraDataInput.required = false;
            }
        }

        if (!carrier.values || !Array.isArray(carrier.values) || carrier.values.length === 0) {
            console.warn('Operadora não possui valores disponíveis:', carrier.name);
            select.innerHTML = '<option value="">Nenhum valor disponível</option>';
            return;
        }

        carrier.values.forEach(value => {
            const vid = value.valueId ?? value.id;
            if (vid == null || vid === '') {
                console.warn('Valor sem valueId/id:', value);
                return;
            }

            const salePrice = value.salePrice ?? value.cost ?? 0;
            const originalValue = value.originalValue ?? value.value ?? 0;
            const currentCost = value.cost ?? value.originalCost ?? 0;
            
            const option = document.createElement('option');
            option.value = vid;
            option.textContent = `R$ ${Number(originalValue).toFixed(2)} (Venda: R$ ${Number(salePrice).toFixed(2)} | Custo: R$ ${Number(currentCost).toFixed(2)})`;
            option.dataset.value = String(originalValue);
            option.dataset.cost = String(currentCost);
            option.dataset.salePrice = String(salePrice);
            select.appendChild(option);
        });

        console.log(`Valores carregados para ${carrier.name}: ${carrier.values.length}`);
    }

    updateValueInfo(valueId) {
        const select = document.getElementById('valueSelect');
        const selectedOption = select.options[select.selectedIndex];
        const valueInfo = document.getElementById('valueInfo');

        if (valueId && selectedOption.dataset.value) {
            const value = parseFloat(selectedOption.dataset.value);
            const cost = parseFloat(selectedOption.dataset.cost);
            const salePrice = parseFloat(selectedOption.dataset.salePrice) || cost;
            const profit = salePrice - cost;
            
            valueInfo.innerHTML = `
                <strong>Valor da Recarga:</strong> R$ ${value.toFixed(2)}<br>
                <strong>Preço de Venda:</strong> R$ ${salePrice.toFixed(2)}<br>
                <strong>Custo (API):</strong> R$ ${cost.toFixed(2)}<br>
                ${profit > 0 ? `<strong style="color: var(--success-color);">Lucro:</strong> R$ ${profit.toFixed(2)}` : ''}
            `;
        } else {
            valueInfo.innerHTML = '';
        }
    }

    async checkPhoneStatus() {
        const phoneNumberInput = document.getElementById('phoneNumber');
        const phoneNumberRaw = phoneNumberInput.value.trim();
        // Remove todos os caracteres não numéricos (espaços, parênteses, hífens, etc)
        const phoneNumber = phoneNumberRaw.replace(/\D/g, '');
        const carrierId = document.getElementById('carrierSelect').value;

        if (!phoneNumber) {
            this.showNotification('Por favor, informe o número de telefone', 'error');
            return;
        }

        // Validar formato do telefone (deve ter 10 ou 11 dígitos)
        if (phoneNumber.length < 10 || phoneNumber.length > 11) {
            this.showNotification('Número de telefone inválido. Use DDD + número (ex: 11999998888)', 'error');
            return;
        }

        this.openModal('phoneStatusModal');
        const content = document.getElementById('phoneStatusContent');
        content.innerHTML = '<div class="loading">Verificando status do telefone...</div>';

        try {
            // Enviar apenas números para a API
            const response = await this.api.checkPhone(phoneNumber, carrierId || null);
            if (response.success) {
                const data = response.data;
                const statusClass = data.status.toLowerCase();
                
                content.innerHTML = `
                    <div style="text-align: center;">
                        <div class="status-badge ${statusClass}" style="margin-bottom: 20px; display: inline-block;">
                            ${data.status}
                        </div>
                        <p style="margin-bottom: 15px; color: var(--text-primary);">${data.message}</p>
                        ${data.cooldownExpiresAt ? `
                            <p style="font-size: 14px; color: var(--text-secondary);">
                                Cooldown expira em: ${new Date(data.cooldownExpiresAt).toLocaleString('pt-BR')}
                            </p>
                        ` : ''}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao verificar telefone:', error);
            content.innerHTML = `
                <div style="color: var(--danger-color); text-align: center;">
                    <p>Erro ao verificar status: ${error.message}</p>
                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 10px;">
                        Certifique-se de que o número está no formato correto (DDD + número, apenas dígitos)
                    </p>
                </div>
            `;
        }
    }

    async createRecharge() {
        const carrierId = document.getElementById('carrierSelect').value;
        const phoneNumberInput = document.getElementById('phoneNumber');
        const phoneNumber = phoneNumberInput.value.trim().replace(/\D/g, ''); // Remove caracteres não numéricos
        const valueId = document.getElementById('valueSelect').value;
        const extraDataInput = document.getElementById('extraData');
        const extraData = extraDataInput ? extraDataInput.value.trim() : '';
        const valueSelect = document.getElementById('valueSelect');
        const selectedOption = valueSelect.options[valueSelect.selectedIndex];

        // Validações conforme documentação da API
        if (!carrierId || !phoneNumber || !valueId) {
            this.showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
            return;
        }

        // Validar telefone (deve ter pelo menos 10 dígitos - DDD + número)
        if (phoneNumber.length < 10 || phoneNumber.length > 11) {
            this.showNotification('Número de telefone inválido. Use DDD + número (ex: 11999998888)', 'error');
            return;
        }

        // Verificar se o valor selecionado tem os dados necessários
        if (!selectedOption || !selectedOption.dataset.cost) {
            this.showNotification('Erro: Dados do valor selecionado não encontrados. Recarregue a página.', 'error');
            return;
        }

        const cost = parseFloat(selectedOption.dataset.cost);
        const salePrice = parseFloat(selectedOption.dataset.salePrice) || cost;
        const userSaldo = this.db.getSaldo(this.currentUser.id);

        if (userSaldo < cost) {
            this.showNotification(`Saldo insuficiente! Você tem R$ ${userSaldo.toFixed(2)} e precisa de R$ ${cost.toFixed(2)}`, 'error');
            return;
        }

        // Preparar dados conforme documentação da API: POST /v1/recharges
        // Body: { carrierId, phoneNumber, valueId, extraData? }
        const rechargeData = {
            carrierId: carrierId,
            phoneNumber: phoneNumber,
            valueId: valueId
        };

        // Adicionar extraData apenas se fornecido (conforme documentação)
        if (extraData && extraData.length > 0) {
            rechargeData.extraData = extraData;
        }

        try {
            this.showNotification('Processando recarga...', 'success');
            
            // Criar recarga via API conforme documentação: POST /v1/recharges
            const response = await this.api.createRecharge(rechargeData);
            
            if (response.success && response.data) {
                // Debitar do saldo do usuário (usar custo real)
                await this.db.subtractSaldo(this.currentUser.id, cost);

                // Salvar recarga no banco local
                const currentApiKey = this.api.apiKey || localStorage.getItem('adminApiKey') || '';
                const recarga = await this.db.createRecarga({
                    userId: this.currentUser.id,
                    username: this.currentUser.username,
                    apiOrderId: response.data._id,
                    phoneNumber: phoneNumber,
                    value: parseFloat(selectedOption.dataset.value),
                    cost: cost, // Custo real da API
                    salePrice: salePrice, // Preço de venda
                    profit: salePrice - cost, // Lucro
                    status: response.data.status || 'pendente',
                    carrier: response.data.carrier || { name: 'N/A' },
                    extraData: extraData || null,
                    origin: 'panel',
                    apiKey: currentApiKey && !currentApiKey.includes('*') ? currentApiKey : '' // Salvar API Key usada
                });

                this.showNotification('Recarga criada com sucesso!', 'success');
                
                // Obter nome da operadora do catálogo
                const selectedCarrier = this.catalog?.find(c => c.carrierId === carrierId);
                const carrierName = selectedCarrier?.name || response.data.carrier?.name || 'N/A';
                
                // Preparar dados do comprovante
                const orderId = response.data._id || recarga.id || `temp_${Date.now()}`;
                const receiptData = {
                    date: new Date().toLocaleString('pt-BR'),
                    carrier: carrierName,
                    phone: this.formatPhone(phoneNumber),
                    value: parseFloat(selectedOption.dataset.value).toFixed(2),
                    paid: salePrice.toFixed(2),
                    status: (response.data.status || 'pendente').toLowerCase(),
                    orderId: orderId
                };
                
                // Mostrar comprovante no modal
                this.showReceiptModal(receiptData);
                
                // Limpar formulário
                document.getElementById('rechargeForm').reset();
                const valueInfo = document.getElementById('valueInfo');
                if (valueInfo) {
                    valueInfo.innerHTML = '';
                }
                const extraDataGroup = document.getElementById('extraDataGroup');
                if (extraDataGroup) {
                    extraDataGroup.style.display = 'none';
                }
                
                // Atualizar saldo na tela
                this.updateBalanceDisplay();
                
                // Recarregar pedidos e mudar para aba de pedidos
                this.loadRevendedorOrders();
                this.switchTab('revendedor-orders');
            } else {
                throw new Error(response.message || 'Erro desconhecido ao criar recarga');
            }
        } catch (error) {
            console.error('Erro ao criar recarga:', error);
            this.showNotification(`Erro ao criar recarga: ${error.message}`, 'error');
        }
    }

    loadRevendedorOrders() {
        // Filtrar apenas transações de saldo (tipo add_saldo)
        const transactions = this.db.getTransactions();
        const saldoTransactions = transactions.filter(t => t.userId === this.currentUser.id && t.type === 'add_saldo');
        
        const container = document.getElementById('ordersContent');

        if (saldoTransactions.length === 0) {
            container.innerHTML = '<div class="loading">Nenhuma recarga PIX encontrada</div>';
            return;
        }

        saldoTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        container.innerHTML = `
            <div class="orders-list">
                ${saldoTransactions.map(trans => this.renderSaldoCard(trans)).join('')}
            </div>
        `;
    }

    renderSaldoCard(transaction) {
        const statusClass = transaction.status.toLowerCase();
        const createdAt = new Date(transaction.createdAt).toLocaleString('pt-BR');

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">💰 Recarga de Saldo</span>
                    <span class="order-status ${statusClass}">${transaction.status === 'approved' ? 'Aprovado' : transaction.status}</span>
                </div>
                <div class="order-details">
                    <div class="order-detail">
                        <span class="order-detail-label">Tipo</span>
                        <span class="order-detail-value">Adição de Saldo PIX</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Valor</span>
                        <span class="order-detail-value" style="color: var(--success-color); font-weight: 600;">R$ ${transaction.amount.toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">ID da Transação</span>
                        <span class="order-detail-value" style="font-family: monospace; font-size: 12px;">${transaction.id}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Data</span>
                        <span class="order-detail-value">${createdAt}</span>
                    </div>
                </div>
            </div>
        `;
    }

    loadRevendedorSales(skipRefresh = false) {
        const recargas = this.db.getRecargasByUser(this.currentUser.id);
        
        // Calcular estatísticas
        const totalVendas = recargas.length;
        const totalRecebido = recargas.reduce((sum, r) => sum + (r.salePrice || r.cost), 0);
        const totalCusto = recargas.reduce((sum, r) => sum + r.cost, 0);
        const totalLucro = recargas.reduce((sum, r) => sum + (r.profit || 0), 0);
        
        // Vendas por origem
        const vendasPublicas = recargas.filter(r => r.origin === 'public').length;
        const vendasManuais = recargas.filter(r => r.origin !== 'public').length;

        // Renderizar resumo com design limpo e moderno
        const summaryContainer = document.getElementById('salesSummary');
        summaryContainer.innerHTML = `
            <div class="stat-card sales-stat">
                <div class="stat-icon">📊</div>
                <div class="stat-content">
                    <div class="stat-label">Total de Vendas</div>
                    <div class="stat-value">${totalVendas}</div>
                    <div class="stat-desc">Recargas realizadas</div>
                </div>
            </div>
            <div class="stat-card sales-stat">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <div class="stat-label">Total Recebido</div>
                    <div class="stat-value">${this.formatCurrency(totalRecebido)}</div>
                    <div class="stat-desc">Valor total arrecadado</div>
                </div>
            </div>
            <div class="stat-card sales-stat">
                <div class="stat-icon">💸</div>
                <div class="stat-content">
                    <div class="stat-label">Total em Custos</div>
                    <div class="stat-value">${this.formatCurrency(totalCusto)}</div>
                    <div class="stat-desc">Investimento total</div>
                </div>
            </div>
            <div class="stat-card sales-stat highlight-success">
                <div class="stat-icon">✨</div>
                <div class="stat-content">
                    <div class="stat-label">Lucro Total</div>
                    <div class="stat-value">${this.formatCurrency(totalLucro)}</div>
                    <div class="stat-desc">Ganho líquido</div>
                </div>
            </div>
            <div class="stat-card sales-stat">
                <div class="stat-icon">🌐</div>
                <div class="stat-content">
                    <div class="stat-label">Vendas Públicas</div>
                    <div class="stat-value">${vendasPublicas}</div>
                    <div class="stat-desc">Via link de recarga</div>
                </div>
            </div>
            <div class="stat-card sales-stat">
                <div class="stat-icon">👤</div>
                <div class="stat-content">
                    <div class="stat-label">Vendas Manuais</div>
                    <div class="stat-value">${vendasManuais}</div>
                    <div class="stat-desc">Direto no painel</div>
                </div>
            </div>
        `;

        // Renderizar histórico
        const historyContainer = document.getElementById('salesHistory');
        if (recargas.length === 0) {
            historyContainer.innerHTML = '<div class="loading">Nenhuma venda encontrada</div>';
            return;
        }

        recargas.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        historyContainer.innerHTML = `
            <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
                <button type="button" class="btn btn-secondary btn-small" id="btnAtualizarStatusVendasRev">🔄 Atualizar status</button>
            </div>
            <div class="orders-list">
                ${recargas.map(rec => this.renderRecargaCard(rec)).join('')}
            </div>
        `;

        const btnRev = document.getElementById('btnAtualizarStatusVendasRev');
        if (btnRev) {
            btnRev.onclick = () => {
                const recs = this.db.getRecargasByUser(this.currentUser.id);
                const toR = recs.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
                this.refreshPendenteRecargasFromApi(toR).then(() => this.loadRevendedorSales(true));
            };
        }

        // Adicionar event listeners para botões de download de comprovante
        historyContainer.querySelectorAll('.btn-download-receipt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const apiOrderId = e.target.getAttribute('data-api-order-id');
                const recargaId = e.target.getAttribute('data-recarga-id');
                if (apiOrderId && window.app) {
                    window.app.downloadReceiptFromApi(apiOrderId, recargaId);
                }
            });
        });

        if (skipRefresh) return;

        const toRefresh = recargas.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
        if (toRefresh.length) {
            this.refreshPendenteRecargasFromApi(toRefresh).then(() => this.loadRevendedorSales(true));
        }
        if (this.vendasStatusPollInterval) {
            clearInterval(this.vendasStatusPollInterval);
            this.vendasStatusPollInterval = null;
        }
        this.vendasStatusPollInterval = setInterval(() => {
            const recs2 = this.db.getRecargasByUser(this.currentUser.id);
            const toR2 = recs2.filter(r => r.apiOrderId && (String(r.status || '').toLowerCase() === 'pendente'));
            this.refreshPendenteRecargasFromApi(toR2).then(() => this.loadRevendedorSales(true));
        }, 30000);
    }

    renderRecargaCard(recarga, showUser = false) {
        const statusClass = recarga.status.toLowerCase();
        const createdAt = new Date(recarga.createdAt).toLocaleString('pt-BR');
        const carrierName = recarga.carrierName || recarga.carrier?.name || recarga.carrier || '-';

        return `
            <div class="order-card">
                <div class="order-header">
                    <span class="order-id">ID: ${recarga.id}</span>
                    <span class="order-status ${statusClass}">${recarga.status}</span>
                </div>
                ${showUser ? `<div style="margin-bottom: 10px;"><strong>Revendedor:</strong> ${recarga.username}</div>` : ''}
                <div class="order-details">
                    <div class="order-detail">
                        <span class="order-detail-label">Telefone</span>
                        <span class="order-detail-value">${recarga.phoneNumber}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Operadora</span>
                        <span class="order-detail-value">${carrierName}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Valor Recebido</span>
                        <span class="order-detail-value">R$ ${recarga.value.toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Valor Pago</span>
                        <span class="order-detail-value">R$ ${(recarga.salePrice || recarga.cost).toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Custo</span>
                        <span class="order-detail-value">R$ ${recarga.cost.toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Lucro</span>
                        <span class="order-detail-value" style="color: var(--success-color); font-weight: 600;">R$ ${(recarga.profit || 0).toFixed(2)}</span>
                    </div>
                    <div class="order-detail">
                        <span class="order-detail-label">Criado em</span>
                        <span class="order-detail-value">${createdAt}</span>
                    </div>
                    ${recarga.apiOrderId ? `
                    <div class="order-detail">
                        <span class="order-detail-label">ID da API</span>
                        <span class="order-detail-value" style="font-family: monospace; font-size: 12px;">${recarga.apiOrderId}</span>
                </div>
                    ` : ''}
                </div>
                ${(recarga.status && (String(recarga.status).toLowerCase() === 'feita' || String(recarga.status).toLowerCase() === 'done' || String(recarga.status).toLowerCase() === 'completed' || String(recarga.status).toLowerCase() === 'success')) && recarga.apiOrderId ? `
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                    <button type="button" class="btn btn-primary btn-small btn-download-receipt" data-api-order-id="${recarga.apiOrderId}" data-recarga-id="${recarga.id}" style="width: 100%;">
                        📄 Baixar Comprovante
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    }

    openModal(modalId) {
        if (modalId === 'revendedorLandingModal') {
            this.loadRevendedorLandingForm().then(() => {
                document.getElementById(modalId).classList.add('active');
                this.bindLandingColorSync();
            }).catch(() => {
                document.getElementById(modalId).classList.add('active');
                this.bindLandingColorSync();
            });
            return;
        }
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    // Revendedor Config Functions
    async loadRevendedorConfig() {
        const id = this.currentUser.id;
        
        // Carregar do servidor primeiro:
        // - Config global do admin (default do sistema)
        // - Config do revendedor (override por-usuário)
        let adminModo = 'prod';
        let adminPaymentModule = '';
        let adminVirtualPayClientId = '';
        let adminVirtualPayClientSecret = '';
        let adminPushinPayToken = '';

        let modo = '';
        let keyTest = '';
        let keyProd = '';
        let virtualPayClientId = '';
        let virtualPayClientSecret = '';
        let pushinPayToken = '';
        let paymentModule = '';
        let whatsappSuporte = '';
        let telegramUsername = '';
        let whatsappNumber = '';
        let revendedorSiteTitle = '';
        
        try {
            const [adminResp, userResp] = await Promise.all([
                fetch('api/data.php?action=config_get'),
                fetch(`api/data.php?action=user_config_get&userId=${encodeURIComponent(id)}`)
            ]);

            const adminJson = await adminResp.json().catch(() => null);
            const userJson = await userResp.json().catch(() => null);

            if (adminJson && adminJson.success && adminJson.data && typeof adminJson.data === 'object') {
                const c = adminJson.data;
                adminModo = (c.adminMercadoPagoModo === 'test' || c.adminMercadoPagoModo === 'prod') ? c.adminMercadoPagoModo : 'prod';
                adminPaymentModule = (c.adminPaymentModule === 'mercadopago' || c.adminPaymentModule === 'virtualpay' || c.adminPaymentModule === 'pushinpay') ? c.adminPaymentModule : '';
                adminVirtualPayClientId = c.adminVirtualPayClientId || '';
                adminVirtualPayClientSecret = c.adminVirtualPayClientSecret || '';
                adminPushinPayToken = c.adminPushinPayToken || '';

                // Guardar defaults do admin apenas na sessão (para o resto do app)
                localStorage.setItem('adminMercadoPagoModo', adminModo);
                if (adminPaymentModule) localStorage.setItem('adminPaymentModule', adminPaymentModule);
                // Não salvar valores mascarados (********) no localStorage
                if (adminVirtualPayClientId && !adminVirtualPayClientId.includes('*')) localStorage.setItem('adminVirtualPayClientId', adminVirtualPayClientId);
                if (adminVirtualPayClientSecret && !adminVirtualPayClientSecret.includes('*')) localStorage.setItem('adminVirtualPayClientSecret', adminVirtualPayClientSecret);
                if (adminPushinPayToken && !adminPushinPayToken.includes('*')) localStorage.setItem('adminPushinPayToken', adminPushinPayToken);
            }

            if (userJson && userJson.success && userJson.data && typeof userJson.data === 'object') {
                const u = userJson.data;
                modo = (u.revendedorMercadoPagoModo === 'test' || u.revendedorMercadoPagoModo === 'prod') ? u.revendedorMercadoPagoModo : '';
                keyTest = u.revendedorMercadoPagoKeyTest || '';
                keyProd = u.revendedorMercadoPagoKeyProd || '';
                virtualPayClientId = u.revendedorVirtualPayClientId || '';
                virtualPayClientSecret = u.revendedorVirtualPayClientSecret || '';
                pushinPayToken = u.revendedorPushinPayToken || '';
                paymentModule = (u.revendedorPaymentModule === 'mercadopago' || u.revendedorPaymentModule === 'virtualpay' || u.revendedorPaymentModule === 'pushinpay') ? u.revendedorPaymentModule : '';
                whatsappSuporte = u.revendedorWhatsappSuporte || '';
                telegramUsername = u.revendedorTelegramUsername || '';
                whatsappNumber = u.revendedorWhatsAppNumber || '';
                revendedorSiteTitle = u.revendedorSiteTitle || '';

                // Guardar overrides do revendedor apenas na sessão (compatibilidade com o app atual)
                localStorage.setItem(`revendedorMercadoPagoModo_${id}`, modo);
                // Não salvar valores mascarados (********) no localStorage
                if (keyTest && !keyTest.includes('*')) localStorage.setItem(`revendedorMercadoPagoKeyTest_${id}`, keyTest);
                if (keyProd && !keyProd.includes('*')) localStorage.setItem(`revendedorMercadoPagoKeyProd_${id}`, keyProd);
                if (virtualPayClientId && !virtualPayClientId.includes('*')) localStorage.setItem(`revendedorVirtualPayClientId_${id}`, virtualPayClientId);
                if (virtualPayClientSecret && !virtualPayClientSecret.includes('*')) localStorage.setItem(`revendedorVirtualPayClientSecret_${id}`, virtualPayClientSecret);
                if (pushinPayToken && !pushinPayToken.includes('*')) localStorage.setItem(`revendedorPushinPayToken_${id}`, pushinPayToken);
                localStorage.setItem(`revendedorPaymentModule_${id}`, paymentModule);
                localStorage.setItem(`revendedorWhatsappSuporte_${id}`, whatsappSuporte);
                localStorage.setItem(`revendedorTelegramUsername_${id}`, telegramUsername);
                localStorage.setItem(`revendedorWhatsAppNumber_${id}`, whatsappNumber);
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações do servidor:', e);
            modo = localStorage.getItem(`revendedorMercadoPagoModo_${id}`) || '';
            keyTest = localStorage.getItem(`revendedorMercadoPagoKeyTest_${id}`) || '';
            keyProd = localStorage.getItem(`revendedorMercadoPagoKeyProd_${id}`) || '';
            virtualPayClientId = localStorage.getItem(`revendedorVirtualPayClientId_${id}`) || '';
            virtualPayClientSecret = localStorage.getItem(`revendedorVirtualPayClientSecret_${id}`) || '';
            paymentModule = localStorage.getItem(`revendedorPaymentModule_${id}`) || '';
            whatsappSuporte = localStorage.getItem(`revendedorWhatsappSuporte_${id}`) || '';
        }
        
        const modoSelect = document.getElementById('revendedorMercadoPagoModo');
        const keyTestInput = document.getElementById('revendedorMercadoPagoKeyTest');
        const keyProdInput = document.getElementById('revendedorMercadoPagoKeyProd');
        const revendedorVirtualPayClientIdInput = document.getElementById('revendedorVirtualPayClientId');
        const revendedorVirtualPayClientSecretInput = document.getElementById('revendedorVirtualPayClientSecret');
        const revendedorPushinPayTokenInput = document.getElementById('revendedorPushinPayToken');
        const revendedorPaymentModuleSelect = document.getElementById('revendedorPaymentModule');
        
        if (modoSelect) modoSelect.value = modo || '';
        // Não preencher campos com valores mascarados - deixar vazio para o usuário digitar
        if (keyTestInput) {
            if (keyTest && /^[*]+$/.test(keyTest)) {
                keyTestInput.value = ''; // Limpar se for apenas asteriscos
            } else {
                keyTestInput.value = keyTest;
            }
        }
        if (keyProdInput) {
            if (keyProd && /^[*]+$/.test(keyProd)) {
                keyProdInput.value = ''; // Limpar se for apenas asteriscos
            } else {
                keyProdInput.value = keyProd;
            }
        }
        
        // Virtual Pay
        if (revendedorVirtualPayClientIdInput) revendedorVirtualPayClientIdInput.value = virtualPayClientId || '';
        if (revendedorVirtualPayClientSecretInput) {
            if (virtualPayClientSecret && /^[*]+$/.test(virtualPayClientSecret)) {
                revendedorVirtualPayClientSecretInput.value = '';
            } else {
                revendedorVirtualPayClientSecretInput.value = virtualPayClientSecret || '';
            }
        }
        
        // PushinPay - não mostrar a chave quando já configurada, apenas placeholder
        if (revendedorPushinPayTokenInput) {
            if (pushinPayToken && /^[*]+$/.test(pushinPayToken)) {
                revendedorPushinPayTokenInput.value = '';
                revendedorPushinPayTokenInput.placeholder = 'Digite o token no formato: ID|TOKEN';
            } else if (pushinPayToken && pushinPayToken.trim() !== '') {
                // Token já configurado, não mostrar
                revendedorPushinPayTokenInput.value = '';
                revendedorPushinPayTokenInput.placeholder = 'Token já configurado. Digite novo token no formato: ID|TOKEN';
            } else {
                revendedorPushinPayTokenInput.value = '';
                revendedorPushinPayTokenInput.placeholder = '61654|v8bWGW6CqckhBygzIYDDvEPmEJcstrVR1BtYhut110a55e52';
            }
        }
        
        // Módulo de pagamento
        if (revendedorPaymentModuleSelect) {
            revendedorPaymentModuleSelect.value = paymentModule || '';
        }
        this.updateRevendedorPaymentPanel();
        
        // WhatsApp Suporte
        const revendedorWhatsappSuporteInput = document.getElementById('revendedorWhatsappSuporte');
        if (revendedorWhatsappSuporteInput) {
            revendedorWhatsappSuporteInput.value = whatsappSuporte || '';
        }

        // Contatos (Telegram e WhatsApp)
        const revendedorTelegramUsernameInput = document.getElementById('revendedorTelegramUsername');
        if (revendedorTelegramUsernameInput) {
            revendedorTelegramUsernameInput.value = telegramUsername || '';
        }
        const revendedorWhatsAppNumberInput = document.getElementById('revendedorWhatsAppNumber');
        if (revendedorWhatsAppNumberInput) {
            revendedorWhatsAppNumberInput.value = whatsappNumber || '';
        }

        const revendedorSiteTitleInput = document.getElementById('revendedorSiteTitle');
        if (revendedorSiteTitleInput) {
            revendedorSiteTitleInput.value = revendedorSiteTitle || '';
        }
        if (this.currentUser && this.currentUser.type === 'revendedor') {
            this.loadRevendedorInviteCode();
        }
    }

    async loadRevendedorInviteCode() {
        const id = this.currentUser?.id;
        if (!id) return;
        const codeEl = document.getElementById('revendedorInviteCode');
        const linkEl = document.getElementById('revendedorInviteLink');
        const btnCopy = document.getElementById('revendedorCopyInviteCodeBtn');
        const btnLink = document.getElementById('revendedorCopyInviteLinkBtn');
        try {
            const r = await fetch(`api/data.php?action=invite_code_get`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id })
            });
            const j = await r.json();
            if (j && j.success && j.data && j.data.code) {
                const code = j.data.code;
                const base = window.location.origin + window.location.pathname;
                const link = `${base}?invite=${encodeURIComponent(code)}`;
                if (codeEl) codeEl.value = code;
                if (linkEl) linkEl.value = link;
                if (btnCopy) {
                    btnCopy.onclick = () => {
                        codeEl.select();
                        navigator.clipboard.writeText(code).then(() => this.showNotification('Código copiado!', 'success')).catch(() => {});
                    };
                }
                if (btnLink) {
                    btnLink.onclick = () => {
                        linkEl.select();
                        navigator.clipboard.writeText(link).then(() => this.showNotification('Link copiado!', 'success')).catch(() => {});
                    };
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar código de convite:', e);
        }
    }

    async validateInviteCode(code) {
        const hint = document.getElementById('inviteCodeHint');
        if (!hint) return;
        if (!code || code.length < 4) {
            hint.textContent = '';
            hint.style.color = '';
            return;
        }
        try {
            const r = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'invite_validate', code: code.trim() })
            });
            const j = await r.json();
            const data = j.data || j;
            if (data && data.success && data.inviterName) {
                hint.textContent = 'Convite de: ' + data.inviterName;
                hint.style.color = 'var(--success-color, #059669)';
            } else {
                hint.textContent = data && data.error ? data.error : 'Código inválido';
                hint.style.color = 'var(--danger-color, #dc2626)';
            }
        } catch (e) {
            hint.textContent = 'Erro ao validar código.';
            hint.style.color = 'var(--danger-color, #dc2626)';
        }
    }

    async submitInviteRegister() {
        const code = (document.getElementById('inviteCode')?.value ?? '').trim();
        const username = (document.getElementById('inviteUsername')?.value ?? '').trim();
        const password = document.getElementById('invitePassword')?.value ?? '';
        const nome = (document.getElementById('inviteNome')?.value ?? '').trim();
        const email = (document.getElementById('inviteEmail')?.value ?? '').trim();
        const btn = document.getElementById('inviteRegisterSubmitBtn');
        if (!code || !username || !password) {
            this.showNotification('Preencha código, usuário e senha.', 'error');
            return;
        }
        if (username.length < 3) {
            this.showNotification('Usuário deve ter pelo menos 3 caracteres.', 'error');
            return;
        }
        if (password.length < 4) {
            this.showNotification('Senha deve ter pelo menos 4 caracteres.', 'error');
            return;
        }
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Criando conta...';
        }
        try {
            const r = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'invite_register', code, username, password, nome, email })
            });
            const j = await r.json();
            if (j && j.success) {
                this.showNotification('Conta criada! Faça login com seu usuário e senha.', 'success');
                document.getElementById('inviteRegisterForm').reset();
                document.getElementById('inviteCodeHint').textContent = '';
                const card = document.getElementById('inviteRegisterCard');
                if (card) card.style.display = 'none';
                document.getElementById('inviteUsername').focus();
            } else {
                this.showNotification(j.error || 'Erro ao criar conta.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro de conexão. Tente novamente.', 'error');
        }
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Criar minha conta';
        }
    }

    async saveRevendedorPersonalizacao() {
        const input = document.getElementById('revendedorSiteTitle');
        const title = (input?.value ?? '').trim();
        const id = this.currentUser?.id;
        if (!id) return;
        try {
            const res = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'user_config_set', userId: id, revendedorSiteTitle: title })
            });
            const j = await res.json();
            if (j && j.success) {
                this.showNotification('Nome da sua página salvo. Quem acessar seu link de recarga verá esse nome.', 'success');
            } else {
                this.showNotification(j?.error || 'Erro ao salvar.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro: ' + (e.message || e), 'error');
        }
    }

    defaultsLanding() {
        return {
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
    }

    bindLandingColorSync() {
        const primaryColor = document.getElementById('landingEditPrimaryColor');
        const primaryText = document.getElementById('landingEditPrimaryColorText');
        const accentColor = document.getElementById('landingEditAccentColor');
        const accentText = document.getElementById('landingEditAccentColorText');
        const hexRe = /^#[0-9A-Fa-f]{6}$/;
        if (primaryColor && primaryText) {
            primaryColor.oninput = () => { primaryText.value = primaryColor.value; };
            primaryText.oninput = () => { if (hexRe.test(primaryText.value.trim())) primaryColor.value = primaryText.value.trim(); };
        }
        if (accentColor && accentText) {
            accentColor.oninput = () => { accentText.value = accentColor.value; };
            accentText.oninput = () => { if (hexRe.test(accentText.value.trim())) accentColor.value = accentText.value.trim(); };
        }
    }

    async loadRevendedorLandingForm() {
        const id = this.currentUser?.id;
        const def = this.defaultsLanding();
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        set('landingEditTitle', def.title);
        set('landingEditTitleAccent', def.titleAccent);
        set('landingEditSubtitle', def.subtitle);
        set('landingEditButtonText', def.buttonText);
        set('landingEditPill1', def.pill1);
        set('landingEditPill2', def.pill2);
        set('landingEditPill3', def.pill3);
        set('landingEditPrimaryColor', def.primaryColor);
        set('landingEditPrimaryColorText', def.primaryColor);
        set('landingEditAccentColor', def.accentColor);
        set('landingEditAccentColorText', def.accentColor);
        if (!id) return;
        try {
            const res = await fetch(`api/data.php?action=user_config_get&userId=${encodeURIComponent(id)}`);
            const j = await res.json();
            if (j && j.success && j.data && typeof j.data.revendedorLandingConfig === 'string' && j.data.revendedorLandingConfig) {
                const data = JSON.parse(j.data.revendedorLandingConfig);
                if (data && typeof data === 'object') {
                    set('landingEditTitle', data.title ?? def.title);
                    set('landingEditTitleAccent', data.titleAccent ?? def.titleAccent);
                    set('landingEditSubtitle', data.subtitle ?? def.subtitle);
                    set('landingEditButtonText', data.buttonText ?? def.buttonText);
                    set('landingEditPill1', data.pill1 ?? def.pill1);
                    set('landingEditPill2', data.pill2 ?? def.pill2);
                    set('landingEditPill3', data.pill3 ?? def.pill3);
                    const prim = (data.primaryColor && /^#[0-9A-Fa-f]{6}$/.test(data.primaryColor)) ? data.primaryColor : def.primaryColor;
                    const acc = (data.accentColor && /^#[0-9A-Fa-f]{6}$/.test(data.accentColor)) ? data.accentColor : def.accentColor;
                    set('landingEditPrimaryColor', prim);
                    set('landingEditPrimaryColorText', prim);
                    set('landingEditAccentColor', acc);
                    set('landingEditAccentColorText', acc);
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar config da landing:', e);
        }
    }

    async saveRevendedorLanding() {
        const id = this.currentUser?.id;
        if (!id) return;
        const get = (id) => { const el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
        const hexRe = /^#[0-9A-Fa-f]{6}$/;
        const def = this.defaultsLanding();
        const primaryColor = get('landingEditPrimaryColorText');
        const accentColor = get('landingEditAccentColorText');
        const payload = {
            title: get('landingEditTitle') || def.title,
            titleAccent: get('landingEditTitleAccent') || def.titleAccent,
            subtitle: get('landingEditSubtitle') || def.subtitle,
            buttonText: get('landingEditButtonText') || def.buttonText,
            pill1: get('landingEditPill1') || def.pill1,
            pill2: get('landingEditPill2') || def.pill2,
            pill3: get('landingEditPill3') || def.pill3,
            primaryColor: hexRe.test(primaryColor) ? primaryColor : def.primaryColor,
            accentColor: hexRe.test(accentColor) ? accentColor : def.accentColor
        };
        try {
            const res = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'user_config_set', userId: id, revendedorLandingConfig: JSON.stringify(payload) })
            });
            const j = await res.json();
            if (j && j.success) {
                this.showNotification('Primeira tela do link salva. Quem acessar seu link verá sua personalização.', 'success');
                this.closeModal('revendedorLandingModal');
            } else {
                this.showNotification(j?.error || 'Erro ao salvar.', 'error');
            }
        } catch (e) {
            this.showNotification('Erro: ' + (e.message || e), 'error');
        }
    }

    updateRevendedorPaymentPanel() {
        const select = document.getElementById('revendedorPaymentModule');
        if (!select) return;
        const module = (select.value === 'mercadopago' || select.value === 'virtualpay' || select.value === 'pushinpay') ? select.value : '';
        document.querySelectorAll('#revendedorPaymentPanelMercadopago, #revendedorPaymentPanelVirtualpay, #revendedorPaymentPanelPushinpay').forEach(panel => {
            if (!panel || !panel.dataset) return;
            panel.style.display = panel.dataset.module === module ? 'block' : 'none';
        });
    }

    async saveRevendedorConfig() {
        const id = this.currentUser.id;
        const modoSelect = document.getElementById('revendedorMercadoPagoModo');
        const modo = modoSelect ? modoSelect.value : '';
        const modoValido = (modo === '' || modo === 'test' || modo === 'prod') ? modo : 'prod';
        let keyTest = (document.getElementById('revendedorMercadoPagoKeyTest')?.value ?? '').trim();
        let keyProd = (document.getElementById('revendedorMercadoPagoKeyProd')?.value ?? '').trim();
        let virtualPayClientId = (document.getElementById('revendedorVirtualPayClientId')?.value ?? '').trim();
        let virtualPayClientSecret = (document.getElementById('revendedorVirtualPayClientSecret')?.value ?? '').trim();
        let pushinPayToken = (document.getElementById('revendedorPushinPayToken')?.value ?? '').trim();
        let whatsappSuporte = (document.getElementById('revendedorWhatsappSuporte')?.value ?? '').trim().replace(/\D/g, '');
        let telegramUsername = (document.getElementById('revendedorTelegramUsername')?.value ?? '').trim();
        let whatsappNumber = (document.getElementById('revendedorWhatsAppNumber')?.value ?? '').trim();
        
        // Se o campo contém apenas asteriscos (valor mascarado), tratar como vazio
        if (keyTest && /^[*]+$/.test(keyTest)) keyTest = '';
        if (keyProd && /^[*]+$/.test(keyProd)) keyProd = '';
        if (virtualPayClientId && /^[*]+$/.test(virtualPayClientId)) virtualPayClientId = '';
        if (virtualPayClientSecret && /^[*]+$/.test(virtualPayClientSecret)) virtualPayClientSecret = '';
        if (pushinPayToken && /^[*]+$/.test(pushinPayToken)) pushinPayToken = '';
        
        const paymentModuleSelect = document.getElementById('revendedorPaymentModule');
        const paymentModule = paymentModuleSelect ? paymentModuleSelect.value : '';
        const paymentModuleValido = (paymentModule === '' || paymentModule === 'mercadopago' || paymentModule === 'virtualpay' || paymentModule === 'pushinpay') ? paymentModule : 'mercadopago';

        // Salvar no servidor (por revendedor). Segredos ficam no SQLite e voltam mascarados no GET.
        try {
            const payload = {
                action: 'user_config_set',
                userId: id,
                revendedorMercadoPagoModo: modoValido,
                revendedorPaymentModule: paymentModuleValido,
                revendedorVirtualPayClientId: virtualPayClientId || '',
                revendedorWhatsappSuporte: whatsappSuporte || '',
                revendedorTelegramUsername: telegramUsername || '',
                revendedorWhatsAppNumber: whatsappNumber || '',
            };
            if (keyTest && !keyTest.includes('*')) payload.revendedorMercadoPagoKeyTest = keyTest;
            if (keyProd && !keyProd.includes('*')) payload.revendedorMercadoPagoKeyProd = keyProd;
            if (virtualPayClientSecret && !virtualPayClientSecret.includes('*')) payload.revendedorVirtualPayClientSecret = virtualPayClientSecret;
            if (pushinPayToken && !pushinPayToken.includes('*')) payload.revendedorPushinPayToken = pushinPayToken;

            const response = await fetch('/api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json().catch(() => null);
            if (!result || !result.success) throw new Error(result?.error || 'Falha ao salvar');

            // Atualizar sessão (compatibilidade com o app atual)
            localStorage.setItem(`revendedorMercadoPagoModo_${id}`, modoValido);
            localStorage.setItem(`revendedorPaymentModule_${id}`, paymentModuleValido);
            if (keyTest && !keyTest.includes('*')) localStorage.setItem(`revendedorMercadoPagoKeyTest_${id}`, keyTest);
            if (keyProd && !keyProd.includes('*')) localStorage.setItem(`revendedorMercadoPagoKeyProd_${id}`, keyProd);
            if (virtualPayClientId && !virtualPayClientId.includes('*')) localStorage.setItem(`revendedorVirtualPayClientId_${id}`, virtualPayClientId);
            if (virtualPayClientSecret && !virtualPayClientSecret.includes('*')) localStorage.setItem(`revendedorVirtualPayClientSecret_${id}`, virtualPayClientSecret);
            if (pushinPayToken && !pushinPayToken.includes('*')) localStorage.setItem(`revendedorPushinPayToken_${id}`, pushinPayToken);
            if (whatsappSuporte) localStorage.setItem(`revendedorWhatsappSuporte_${id}`, whatsappSuporte);
            if (telegramUsername) localStorage.setItem(`revendedorTelegramUsername_${id}`, telegramUsername);
            if (whatsappNumber) localStorage.setItem(`revendedorWhatsAppNumber_${id}`, whatsappNumber);

            this.showNotification('Configurações do revendedor salvas com sucesso!', 'success');
        } catch (e) {
            console.warn('Erro ao salvar config do revendedor:', e);
            this.showNotification('Erro ao salvar configurações do revendedor no servidor', 'error');
        }
    }

    // Catalog Management Functions
    /** Normaliza catálogo vindo da API: garante valueId, carrierId, cost, originalCost, etc. */
    normalizeCatalogFromApi(apiCatalog) {
        if (!apiCatalog || !Array.isArray(apiCatalog)) return [];
        return apiCatalog.map(carrier => ({
            ...carrier,
            carrierId: carrier.carrierId || carrier.id,
            name: carrier.name,
            extraField: carrier.extraField,
            values: (carrier.values || []).map(value => {
                const apiCost = parseFloat(value.cost) || 0;
                return {
                    ...value,
                    valueId: value.valueId ?? value.id,
                    value: value.value ?? value.originalValue,
                    cost: apiCost,
                    originalCost: value.originalCost != null ? parseFloat(value.originalCost) : apiCost,
                    originalValue: value.originalValue ?? value.value,
                    salePrice: value.salePrice != null ? parseFloat(value.salePrice) : apiCost
                };
            })
        }));
    }

    mergeCatalogKeepCostsAndPrices(existingCatalog, freshCatalog) {
        if (!Array.isArray(freshCatalog) || freshCatalog.length === 0) return freshCatalog;
        const existing = Array.isArray(existingCatalog) ? existingCatalog : [];
        const costByKey = {};
        const salePriceByKey = {};
        for (const carrier of existing) {
            const cid = String(carrier?.carrierId || carrier?.id || '');
            for (const v of (carrier?.values || [])) {
                const vid = String(v?.valueId ?? v?.id ?? '');
                if (cid && vid) {
                    const key = cid + '|' + vid;
                    if (v.cost !== undefined && v.cost !== null && !isNaN(Number(v.cost))) costByKey[key] = Number(v.cost);
                    if (v.salePrice !== undefined && v.salePrice !== null && !isNaN(Number(v.salePrice))) salePriceByKey[key] = Number(v.salePrice);
                }
            }
        }
        return freshCatalog.map(carrier => {
            const cid = String(carrier?.carrierId || carrier?.id || '');
            const values = (carrier?.values || []).map(v => {
                const vid = String(v?.valueId ?? v?.id ?? '');
                const key = cid + '|' + vid;
                const originalCost = Number(v?.originalCost ?? v?.cost ?? 0) || 0;
                const cost = costByKey[key] !== undefined ? costByKey[key] : (v?.cost ?? originalCost);
                const salePrice = salePriceByKey[key] !== undefined ? Math.max(salePriceByKey[key], cost) : (v?.salePrice ?? cost);
                return {
                    ...v,
                    valueId: v?.valueId ?? v?.id,
                    carrierId: carrier?.carrierId || carrier?.id,
                    originalCost,
                    cost,
                    salePrice,
                    originalValue: v?.originalValue ?? v?.value,
                    value: v?.value ?? v?.originalValue
                };
            });
            return { ...carrier, carrierId: carrier?.carrierId || carrier?.id, values };
        });
    }

    async loadOriginalCatalog() {
        try {
            const response = await this.api.getCatalog();
            const rawData = (response && response.success && response.data) ? response.data : (Array.isArray(response) ? response : null);
            if (rawData && Array.isArray(rawData)) {
                const fresh = this.normalizeCatalogFromApi(rawData);
                this.catalog = this.catalog && this.catalog.length > 0
                    ? this.mergeCatalogKeepCostsAndPrices(this.catalog, fresh)
                    : fresh;
                this.catalogTemplate = JSON.parse(JSON.stringify(this.catalog));
                console.log('Catálogo original carregado:', this.catalog[0]?.values[0]);
                this.renderAdminCatalogEditor(this.catalog);
            } else {
                this.showNotification('Resposta inválida da API de catálogo', 'error');
            }
        } catch (error) {
            this.showNotification(`Erro ao carregar catálogo: ${error.message}`, 'error');
        }
    }

    /**
     * Sincroniza catálogo com a API (express.poeki.dev via recargaexpress.php).
     * Atualiza custo original e operadoras no servidor e nos catálogos dos revendedores,
     * preservando custo editável e preço de venda. Evita conflito nas vendas do site.
     */
    async refreshCatalogFromApiAndSave() {
        if (!this.currentUser || this.currentUser.type !== 'admin') return;
        try {
            const response = await this.api.getCatalog();
            const rawData = (response && response.success && response.data) ? response.data : (Array.isArray(response) ? response : null);
            if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return;
            const fresh = this.normalizeCatalogFromApi(rawData);
            const serverCatalog = await this.fetchAdminCatalogFromServer();
            const mergedAdmin = (serverCatalog && Array.isArray(serverCatalog) && serverCatalog.length > 0)
                ? this.mergeCatalogKeepCostsAndPrices(serverCatalog, fresh)
                : fresh;
            await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'config_set', adminCatalog: JSON.stringify(mergedAdmin) })
            });
            const revendedores = this.db.getRevendedores();
            for (const rev of revendedores) {
                const revCatalog = this.db.getCatalog(rev.id);
                if (revCatalog && Array.isArray(revCatalog) && revCatalog.length > 0) {
                    const mergedRev = this.mergeCatalogKeepCostsAndPrices(revCatalog, fresh);
                    await this.db.setCatalog(rev.id, mergedRev);
                }
            }
            const activeTab = document.querySelector('#adminTabs .tab.active');
            const tabName = activeTab ? (activeTab.getAttribute('data-tab') || '') : '';
            if (tabName === 'admin-catalog') {
                this.catalog = mergedAdmin;
                this.catalogTemplate = JSON.parse(JSON.stringify(mergedAdmin));
                this.renderAdminCatalogEditor(mergedAdmin);
            }
        } catch (e) {
            console.warn('Refresh catálogo da API:', e);
        }
    }

    async loadAdminCatalogEditor() {
        // Preferir catálogo publicado no servidor; se não existir, usar cache/memória ou API
        try {
            const serverCatalog = await this.fetchAdminCatalogFromServer();
            if (serverCatalog && Array.isArray(serverCatalog) && serverCatalog.length > 0) {
                const catalog = this.ensureCatalogCosts(serverCatalog);
                this.catalog = catalog;
                this.catalogTemplate = JSON.parse(JSON.stringify(catalog));
                this.renderAdminCatalogEditor(catalog);
            } else if (this.catalog && this.catalog.length > 0) {
                const catalog = this.ensureCatalogCosts(this.catalog);
                this.catalog = catalog;
                this.renderAdminCatalogEditor(catalog);
            } else {
                await this.loadOriginalCatalog();
            }
        } catch (e) {
            console.warn('Falha ao carregar catálogo do admin do servidor:', e);
            if (this.catalog && this.catalog.length > 0) {
                const catalog = this.ensureCatalogCosts(this.catalog);
                this.catalog = catalog;
                this.renderAdminCatalogEditor(catalog);
            } else {
                await this.loadOriginalCatalog();
            }
        }

        this.loadRevendedoresForCatalog();
    }

    ensureCatalogCosts(catalog) {
        if (!catalog || !Array.isArray(catalog)) return [];
        return catalog.map(carrier => ({
            ...carrier,
            values: (carrier.values || []).map(value => {
                // Se já tem cost editado, preservar
                // Se não tem, usar originalCost como fallback
                const currentCost = value.cost !== undefined && value.cost !== null ? value.cost : (value.originalCost || 0);
                const originalCost = value.originalCost !== undefined && value.originalCost !== null ? value.originalCost : (value.cost || 0);
                
                return {
                    ...value,
                    valueId: value.valueId ?? value.id,
                    cost: currentCost,
                    originalCost: originalCost,
                    value: value.value ?? value.originalValue,
                    originalValue: value.originalValue ?? value.value,
                    salePrice: value.salePrice ?? currentCost
                };
            })
        }));
    }

    renderAdminCatalogEditor(catalog) {
        const container = document.getElementById('adminCatalogContent');
        if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
            container.innerHTML = '<div class="loading">Carregue o catálogo original primeiro</div>';
            return;
        }
        container.innerHTML = catalog.map(carrier => {
            const cid = String(carrier.carrierId || carrier.id || '');
            const valuesHtml = (carrier.values || []).map(value => {
                const vid = String(value.valueId ?? value.id ?? '');
                const val = value.value ?? value.originalValue ?? 0;
                const originalCost = value.originalCost ?? value.cost ?? 0;
                const currentCost = value.cost ?? originalCost;
                const salePrice = value.salePrice ?? currentCost;
                
                return `
                <div class="catalog-value-item-modern">
                    <div class="catalog-value-header">
                        <div class="value-badge">R$ ${Number(val).toFixed(2)}</div>
                        <div class="original-cost-badge">Custo Original: R$ ${Number(originalCost).toFixed(2)}</div>
                    </div>
                    <div class="catalog-inputs-grid">
                        <div class="input-group-modern">
                            <label class="input-label-modern">
                                <span class="label-icon">💰</span>
                                Custo API (Editável)
                            </label>
                            <input type="number" 
                                   class="catalog-cost-input-modern" 
                                   data-carrier-id="${cid}"
                                   data-value-id="${vid}"
                                   value="${currentCost.toFixed(2)}"
                                   step="0.01"
                                   min="${(Math.max(0.01, Number(originalCost))).toFixed(2)}"
                                   title="Não pode ser menor que o Custo Original (R$ ${Number(originalCost).toFixed(2)})">
                            <small class="input-hint">Valor que será debitado do saldo do revendedor. Mínimo: Custo Original (R$ ${Number(originalCost).toFixed(2)})</small>
                        </div>
                        <div class="input-group-modern">
                            <label class="input-label-modern">
                                <span class="label-icon">💵</span>
                                Preço de Venda
                            </label>
                            <input type="number" 
                                   class="catalog-price-input-modern" 
                                   data-carrier-id="${cid}"
                                   data-value-id="${vid}"
                                   value="${Number(salePrice).toFixed(2)}"
                                   step="0.01"
                                   min="${currentCost}">
                            <small class="input-hint">Mínimo: R$ <span class="min-price-${cid}-${vid}">${Number(currentCost).toFixed(2)}</span></small>
                        </div>
                    </div>
                </div>
            `;
            }).join('');

            return `
                <div class="catalog-carrier-editor-modern">
                    <div class="carrier-header-modern">
                        <h3 class="catalog-carrier-name-modern">${carrier.name}</h3>
                        ${carrier.extraField?.required ? `
                            <div class="catalog-extra-field-modern">
                                <span class="extra-icon">⚠️</span>
                                Requer: ${carrier.extraField.title}
                            </div>
                        ` : ''}
                    </div>
                    <div class="catalog-values-list-modern">
                        ${valuesHtml}
                    </div>
                </div>
            `;
        }).join('');

        // Adicionar event listeners para atualizar mínimo dinamicamente
        container.querySelectorAll('.catalog-cost-input-modern').forEach(input => {
            input.addEventListener('input', (e) => {
                const carrierId = (e.target.getAttribute('data-carrier-id') || '').replace(/["'\\]/g, '');
                const valueId = (e.target.getAttribute('data-value-id') || '').replace(/["'\\]/g, '');
                const minPriceElement = container.querySelector(`.min-price-${carrierId}-${valueId}`);
                const priceInput = container.querySelector(`.catalog-price-input-modern[data-carrier-id="${carrierId}"][data-value-id="${valueId}"]`);
                
                if (minPriceElement && priceInput) {
                    const newMin = parseFloat(e.target.value) || 0;
                    minPriceElement.textContent = newMin.toFixed(2);
                    priceInput.setAttribute('min', newMin.toFixed(2));
                    if (parseFloat(priceInput.value) < newMin) {
                        priceInput.value = newMin.toFixed(2);
                    }
                }
            });
        });
    }

    loadRevendedoresForCatalog() {
        const revendedores = this.db.getRevendedores();
        const select = document.getElementById('catalogRevendedorSelect');
        if (!select) return;
        const valorAnterior = select.value || '';

        select.innerHTML = '<option value="">Selecione um revendedor para atribuir catálogo</option>';
        revendedores.forEach(rev => {
            const option = document.createElement('option');
            option.value = rev.id;
            option.textContent = `${rev.nome || rev.username} (${rev.username})`;
            select.appendChild(option);
        });
        if (valorAnterior && revendedores.some(r => String(r.id) === String(valorAnterior))) {
            select.value = valorAnterior;
            this.loadCatalogFromSelectedRevendedor();
        }
    }

    loadCatalogFromSelectedRevendedor() {
        const select = document.getElementById('catalogRevendedorSelect');
        const container = document.getElementById('adminCatalogContent');
        if (!select || !container) return;
        const revendedorId = (select.value || '').trim();

        if (!revendedorId) {
            const base = (this.catalogTemplate && this.catalogTemplate.length) ? this.catalogTemplate : this.catalog;
            if (base && base.length > 0) {
                this.catalog = base;
                this.renderAdminCatalogEditor(base);
            } else {
                container.innerHTML = '<div class="loading" style="padding: 24px; text-align: center; color: var(--text-secondary);">Carregue o catálogo original ou selecione um revendedor para ver o catálogo atribuído.</div>';
            }
            return;
        }

        const catalog = this.db.getCatalog(revendedorId);
        if (catalog && Array.isArray(catalog) && catalog.length > 0) {
            this.catalog = this.ensureCatalogCosts(catalog);
            this.renderAdminCatalogEditor(this.catalog);
        } else {
            const rev = this.db.getUserById(revendedorId);
            const nome = rev ? (rev.nome || rev.username) : revendedorId;
            container.innerHTML = `<div class="loading" style="padding: 24px; text-align: center; color: var(--text-secondary);">Nenhum catálogo atribuído a <strong>${nome}</strong>. Carregue o original, edite os custos e preços e clique em &quot;Atribuir Catálogo ao Revendedor&quot;.</div>`;
        }
    }

    async saveAdminCatalog() {
        const catalog = this.extractCatalogFromEditor();
        if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
            this.showNotification('Erro ao extrair catálogo. Carregue o catálogo e preencha os custos.', 'error');
            return;
        }

        // Validar custos antes de salvar: custo editável não pode ser menor que o custo original
        let hasInvalidCosts = false;
        const originalCostNum = (v) => (v?.originalCost !== undefined && v?.originalCost !== null && !isNaN(Number(v.originalCost))) ? Number(v.originalCost) : 0;
        catalog.forEach(carrier => {
            carrier.values.forEach(value => {
                const cost = Number(value.cost);
                const orig = originalCostNum(value);
                if (!value.cost || isNaN(cost) || cost <= 0) {
                    hasInvalidCosts = true;
                    console.error('Custo inválido ao salvar:', { carrier: carrier.name, value: value.value, cost: value.cost });
                } else if (cost < orig) {
                    hasInvalidCosts = true;
                    console.error('Custo editável menor que o original:', { carrier: carrier.name, value: value.value, cost, originalCost: orig });
                }
            });
        });

        if (hasInvalidCosts) {
            this.showNotification('Erro: O Custo API (Editável) não pode ser menor que o Custo Original. Verifique todos os valores.', 'error');
            return;
        }

        // Salvar catálogo do admin (pode ser usado como template)
        this.catalog = catalog;
        console.log('✅ Catálogo do admin salvo:', catalog[0]?.values[0]);
        // Publicar no servidor para os revendedores conseguirem carregar o catálogo atualizado do admin
        try {
            const response = await fetch('api/data.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'config_set',
                    adminCatalog: JSON.stringify(catalog)
                })
            });
            const result = await response.json();
            if (result && result.success) {
                this.showNotification('Catálogo do admin salvo e publicado com sucesso!', 'success');
            } else {
                this.showNotification('Catálogo salvo, mas falhou ao publicar no servidor.', 'warning');
            }
        } catch (e) {
            console.warn('Erro ao publicar adminCatalog no servidor:', e);
            this.showNotification('Catálogo salvo, mas falhou ao publicar no servidor.', 'warning');
        }
    }

    async fetchAdminCatalogFromServer() {
        const r = await fetch('api/data.php?action=config_get&k=adminCatalog');
        const j = await r.json().catch(() => null);
        if (!j || !j.success) return null;
        const raw = j.data;
        if (!raw) return null;
        if (Array.isArray(raw)) return raw;
        if (typeof raw === 'string') {
            const s = raw.trim();
            if (!s) return null;
            try {
                const parsed = JSON.parse(s);
                return Array.isArray(parsed) ? parsed : null;
            } catch (e) {
                console.warn('adminCatalog inválido (JSON parse):', e);
                return null;
            }
        }
        return null;
    }

    mergeCatalogSalePrices(baseCatalog, incomingCatalog) {
        const base = Array.isArray(baseCatalog) ? baseCatalog : [];
        const incoming = Array.isArray(incomingCatalog) ? incomingCatalog : [];
        const salePriceByKey = {};

        for (const carrier of base) {
            const cid = String(carrier?.carrierId || carrier?.id || '');
            for (const v of (carrier?.values || [])) {
                const vid = String(v?.valueId ?? v?.id ?? '');
                const sp = v?.salePrice;
                if (!cid || !vid) continue;
                if (sp !== undefined && sp !== null && !isNaN(Number(sp))) {
                    salePriceByKey[`${cid}|${vid}`] = Number(sp);
                }
            }
        }

        return incoming.map(carrier => {
            const cid = String(carrier?.carrierId || carrier?.id || '');
            const values = (carrier?.values || []).map(v => {
                const vid = String(v?.valueId ?? v?.id ?? '');
                const key = `${cid}|${vid}`;
                const currentCost = Number(v?.cost ?? v?.originalCost ?? 0) || 0;
                const sp = salePriceByKey[key];
                const mergedSalePrice = (sp !== undefined) ? Math.max(sp, currentCost) : (v?.salePrice ?? currentCost);
                return { ...v, valueId: v?.valueId ?? v?.id, carrierId: carrier?.carrierId || carrier?.id, salePrice: mergedSalePrice };
            });
            return { ...carrier, carrierId: carrier?.carrierId || carrier?.id, values };
        });
    }

    async loadAdminCatalogForRevendedor({ mergeSalePrices = true } = {}) {
        try {
            const serverCatalog = await this.fetchAdminCatalogFromServer();
            if (!serverCatalog || !Array.isArray(serverCatalog) || serverCatalog.length === 0) {
                this.showNotification('O admin ainda não publicou um catálogo. Peça para ele salvar/publicar no painel.', 'error');
                return;
            }

            let catalog = this.ensureCatalogCosts(serverCatalog);
            if (mergeSalePrices && this.currentUser && this.currentUser.type === 'revendedor') {
                const current = this.db.getCatalog(this.currentUser.id);
                if (current && Array.isArray(current) && current.length > 0) {
                    catalog = this.mergeCatalogSalePrices(current, catalog);
                }
            }

            this.catalog = catalog;
            this.renderRevendedorCatalogEditor(catalog);
            this.showNotification('Catálogo do admin carregado. Edite e clique em "Salvar Meu Catálogo" para aplicar.', 'success');
        } catch (e) {
            console.error('Erro ao carregar catálogo do admin:', e);
            this.showNotification('Erro ao carregar catálogo do admin. Tente novamente.', 'error');
        }
    }

    async assignCatalogToRevendedor() {
        const revendedorId = document.getElementById('catalogRevendedorSelect').value;
        
        if (!revendedorId) {
            this.showNotification('Selecione um revendedor', 'error');
            return;
        }

        const catalog = this.extractCatalogFromEditor();
        if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
            this.showNotification('Erro ao extrair catálogo. Carregue o catálogo primeiro e preencha os custos.', 'error');
            return;
        }

        // Validar custos: não pode ser vazio/inválido nem menor que o custo original
        let hasInvalidCosts = false;
        const originalCostNum = (v) => (v?.originalCost !== undefined && v?.originalCost !== null && !isNaN(Number(v.originalCost))) ? Number(v.originalCost) : 0;
        catalog.forEach(carrier => {
            carrier.values.forEach(value => {
                const cost = Number(value.cost);
                const orig = originalCostNum(value);
                if (value.cost === undefined || value.cost === null || isNaN(cost) || cost <= 0) {
                    hasInvalidCosts = true;
                    console.error('Custo inválido encontrado:', { carrier: carrier.name, value: value.value, cost: value.cost, originalCost: value.originalCost });
                } else if (cost < orig) {
                    hasInvalidCosts = true;
                    console.error('Custo editável menor que o original:', { carrier: carrier.name, value: value.value, cost, originalCost: orig });
                }
            });
        });

        if (hasInvalidCosts) {
            this.showNotification('Erro: O Custo API (Editável) não pode ser menor que o Custo Original. Verifique todos os valores.', 'error');
            return;
        }

        // Salvar catálogo para o revendedor
        await this.db.setCatalog(revendedorId, catalog);
        
        // Log detalhado para debug
        console.log('✅ Catálogo atribuído ao revendedor:', {
            revendedorId,
            totalCarriers: catalog.length,
            sampleValue: catalog[0]?.values[0] ? {
                value: catalog[0].values[0].value,
                cost: catalog[0].values[0].cost,
                originalCost: catalog[0].values[0].originalCost,
                salePrice: catalog[0].values[0].salePrice
            } : null
        });
        
        this.showNotification('Catálogo salvo e atribuído ao revendedor com sucesso!', 'success');
        this.loadCatalogFromSelectedRevendedor();
    }

    extractCatalogFromEditor() {
        if (!this.catalog || !Array.isArray(this.catalog) || this.catalog.length === 0) {
            this.showNotification('Carregue o catálogo primeiro', 'error');
            return null;
        }
        const container = document.getElementById('adminCatalogContent');
        if (!container) return null;

        const costMap = {};
        const priceMap = {};
        container.querySelectorAll('.catalog-cost-input-modern, .catalog-cost-input').forEach(inp => {
            const c = (inp.getAttribute('data-carrier-id') || '').toString();
            const v = (inp.getAttribute('data-value-id') || '').toString();
            costMap[c + '|' + v] = inp;
        });
        container.querySelectorAll('.catalog-price-input-modern, .catalog-price-input').forEach(inp => {
            const c = (inp.getAttribute('data-carrier-id') || '').toString();
            const v = (inp.getAttribute('data-value-id') || '').toString();
            priceMap[c + '|' + v] = inp;
        });
        if (Object.keys(costMap).length === 0) {
            this.showNotification('Carregue o catálogo primeiro', 'error');
            return null;
        }

        const editedCatalog = this.catalog.map(carrier => {
            const cid = String(carrier.carrierId || carrier.id || '');
            const editedValues = (carrier.values || []).map(value => {
                const vid = String(value.valueId ?? value.id ?? '');
                const key = cid + '|' + vid;
                const originalCost = value.originalCost ?? value.cost ?? 0;

                const costInput = costMap[key];
                let editedCost;
                if (costInput && costInput.value !== '' && costInput.value != null) {
                    const raw = String(costInput.value).trim().replace(',', '.');
                    editedCost = parseFloat(raw);
                    if (isNaN(editedCost) || editedCost < 0) editedCost = originalCost;
                } else {
                    editedCost = value.cost ?? originalCost;
                }

                const priceInput = priceMap[key];
                const rawPrice = priceInput?.value ? String(priceInput.value).trim().replace(',', '.') : '';
                const salePrice = rawPrice ? (parseFloat(rawPrice) || editedCost) : (value.salePrice ?? editedCost);

                return {
                    ...value,
                    valueId: value.valueId ?? value.id,
                    cost: editedCost,
                    salePrice: salePrice,
                    originalValue: value.originalValue ?? value.value,
                    originalCost: originalCost,
                    carrierId: carrier.carrierId || carrier.id
                };
            });

            return {
                ...carrier,
                carrierId: carrier.carrierId || carrier.id,
                name: carrier.name,
                extraField: carrier.extraField,
                values: editedValues
            };
        });

        return editedCatalog;
    }

    // Revendedor Catalog Functions
    async loadOriginalCatalogForRevendedor() {
        try {
            const response = await this.api.getCatalog();
            const raw = (response && response.success && response.data) ? response.data : (Array.isArray(response) ? response : null);
            if (raw && Array.isArray(raw)) {
                const catalog = this.normalizeCatalogFromApi(raw);
                this.catalog = catalog;
                this.renderRevendedorCatalogEditor(catalog);
            } else {
                this.showNotification('Resposta inválida da API de catálogo', 'error');
            }
        } catch (error) {
            this.showNotification(`Erro ao carregar catálogo: ${error.message}`, 'error');
        }
    }

    async loadRevendedorCatalogEditor() {
        const customCatalog = this.db.getCatalog(this.currentUser.id);
        if (customCatalog && Array.isArray(customCatalog) && customCatalog.length > 0) {
            this.renderRevendedorCatalogEditor(customCatalog);
        } else {
            // Se não houver catálogo do revendedor, tentar usar o catálogo publicado pelo admin.
            const serverCatalog = await this.fetchAdminCatalogFromServer();
            if (serverCatalog && Array.isArray(serverCatalog) && serverCatalog.length > 0) {
                const catalog = this.ensureCatalogCosts(serverCatalog);
                this.catalog = catalog;
                this.renderRevendedorCatalogEditor(catalog);
            } else {
                await this.loadOriginalCatalogForRevendedor();
            }
        }
    }

    renderRevendedorCatalogEditor(catalog) {
        const container = document.getElementById('revendedorCatalogContent');
        if (!catalog || !Array.isArray(catalog) || catalog.length === 0) {
            container.innerHTML = '<div class="loading">Carregue o catálogo original ou peça ao admin que atribua um catálogo.</div>';
            return;
        }
        container.innerHTML = catalog.map(carrier => {
            const cid = String(carrier.carrierId || carrier.id || '');
            const valuesHtml = (carrier.values || []).map(value => {
                const vid = String(value.valueId ?? value.id ?? '');
                const originalValue = value.originalValue ?? value.value ?? 0;
                const currentCost = value.cost ?? value.originalCost ?? 0;
                const salePrice = value.salePrice ?? currentCost;
                const profit = salePrice - currentCost;
                const profitPercent = currentCost > 0 ? ((profit / currentCost) * 100).toFixed(1) : '0.0';
                const minSalePrice = (Number(currentCost) + 0.01).toFixed(2);

                return `
                    <div class="catalog-value-item">
                        <div class="catalog-value-info">
                            <div class="catalog-value-label">Valor da Recarga: R$ ${Number(originalValue).toFixed(2)}</div>
                            <div class="catalog-value-cost">Custo (API): R$ ${Number(currentCost).toFixed(2)}</div>
                        </div>
                        <div class="catalog-value-edit">
                            <label>Lucro (%):</label>
                            <input type="number" 
                                   class="catalog-percent-input" 
                                   data-carrier-id="${cid}"
                                   data-value-id="${vid}"
                                   data-cost="${Number(currentCost).toFixed(2)}"
                                   placeholder="Ex: 7"
                                   value="${profitPercent}"
                                   step="0.1"
                                   min="0"
                                   title="Digite a margem de lucro em % - o preço de venda será calculado automaticamente"
                                   oninput="(window.app&&window.app.updateFromPercent)&&window.app.updateFromPercent(this, ${currentCost})">
                            <label>Seu Preço de Venda:</label>
                            <input type="number" 
                                   class="catalog-price-input" 
                                   data-carrier-id="${cid}"
                                   data-value-id="${vid}"
                                   data-cost="${Number(currentCost).toFixed(2)}"
                                   value="${Number(salePrice).toFixed(2)}"
                                   step="0.01"
                                   min="${minSalePrice}"
                                   oninput="(window.app&&window.app.updateCatalogProfit)&&window.app.updateCatalogProfit(this, ${currentCost})">
                            <div class="catalog-profit" id="profit-${cid}-${vid}">
                                <span>Lucro: R$ ${profit.toFixed(2)} (${profitPercent}%)</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            return `
                <div class="catalog-carrier-editor">
                    <h3 class="catalog-carrier-name">${carrier.name}</h3>
                    ${carrier.extraField?.required ? `
                        <div class="catalog-extra-field">
                            ⚠️ Requer: ${carrier.extraField.title}
                        </div>
                    ` : ''}
                    <div class="catalog-values-list">
                        ${valuesHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateFromPercent(percentInput, currentCost) {
        const raw = String(percentInput.value ?? '').trim().replace(',', '.');
        const percent = raw === '' ? 0 : (parseFloat(raw) || 0);
        const salePrice = Number(currentCost) * (1 + percent / 100);
        const minSalePrice = Number(currentCost) + 0.01;
        const finalPrice = Math.max(minSalePrice, salePrice);
        
        const carrierId = percentInput.getAttribute('data-carrier-id');
        const valueId = percentInput.getAttribute('data-value-id');
        const priceInput = document.querySelector(`.catalog-price-input[data-carrier-id="${carrierId}"][data-value-id="${valueId}"]`);
        if (priceInput) {
            priceInput.value = finalPrice.toFixed(2);
            this.updateCatalogProfit(priceInput, currentCost);
        }
    }

    updateCatalogProfit(input, currentCost) {
        const raw = String(input.value ?? '').trim().replace(',', '.');
        const salePrice = raw === '' ? currentCost : (parseFloat(raw) || currentCost);
        
        // Sincronizar % quando o preço é editado manualmente
        const carrierId = input.getAttribute('data-carrier-id');
        const valueId = input.getAttribute('data-value-id');
        const percentInput = document.querySelector(`.catalog-percent-input[data-carrier-id="${carrierId}"][data-value-id="${valueId}"]`);
        if (percentInput && currentCost > 0) {
            const profit = salePrice - currentCost;
            const profitPercent = ((profit / currentCost) * 100).toFixed(1);
            percentInput.value = profitPercent;
        }
        const profit = salePrice - currentCost;
        const profitPercent = currentCost > 0 ? ((profit / currentCost) * 100).toFixed(1) : '0.0';
        
        const profitElement = document.getElementById(`profit-${carrierId}-${valueId}`);

        // Regra: preço de venda deve ser MAIOR que o custo (API)
        const isInvalid = !(salePrice > currentCost);
        input.classList.toggle('invalid', isInvalid);
        if (profitElement) profitElement.classList.toggle('invalid', isInvalid);
        
        if (profitElement) {
            if (isInvalid) {
                profitElement.innerHTML = `<span style="color: #ef4444;">Preço deve ser maior que o custo (R$ ${Number(currentCost).toFixed(2)})</span>`;
            } else {
                const profitColor = profit > 0 ? '#22c55e' : profit < 0 ? '#ef4444' : '#a0a0a0';
                profitElement.innerHTML = `<span style="color: ${profitColor};">Lucro: R$ ${profit.toFixed(2)} (${profitPercent}%)</span>`;
            }
        }
    }

    async saveRevendedorCatalog() {
        const container = document.getElementById('revendedorCatalogContent');
        const inputs = container.querySelectorAll('.catalog-price-input');
        
        if (inputs.length === 0) {
            this.showNotification('Carregue o catálogo primeiro', 'error');
            return;
        }

        // Validar: preço de venda > custo (API) para todos os itens
        const invalidInputs = [];
        inputs.forEach(inp => {
            const raw = String(inp.value ?? '').trim().replace(',', '.');
            const salePrice = raw === '' ? NaN : parseFloat(raw);
            const cost = parseFloat(String(inp.getAttribute('data-cost') ?? '').replace(',', '.'));
            const isInvalid = !(salePrice > cost);
            inp.classList.toggle('invalid', isInvalid);
            if (isInvalid) invalidInputs.push(inp);
        });
        if (invalidInputs.length > 0) {
            const first = invalidInputs[0];
            first.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
            first.focus?.();
            this.showNotification(
                `Seu preço de venda deve ser maior que o custo (API) em ${invalidInputs.length} item(ns).`,
                'error'
            );
            return;
        }

        // Obter catálogo base (original ou atribuído pelo admin)
        let baseCatalog = this.db.getCatalog(this.currentUser.id);
        if (!baseCatalog || !Array.isArray(baseCatalog) || baseCatalog.length === 0) {
            // Se não tem catálogo personalizado, usar o original da API
            if (!this.catalog || this.catalog.length === 0) {
                this.showNotification('Carregue o catálogo original primeiro', 'error');
                return;
            }
            baseCatalog = this.catalog;
        }

        // Aplicar edições do revendedor (APENAS preço de venda, preservar custo editado pelo admin)
        const editedCatalog = baseCatalog.map(carrier => {
            const cid = String(carrier.carrierId || carrier.id || '');
            const editedValues = (carrier.values || []).map(value => {
                const vid = String(value.valueId ?? value.id ?? '');
                const input = container.querySelector(
                    `.catalog-price-input[data-carrier-id="${cid}"][data-value-id="${vid}"]`
                );
                
                if (!input) return { ...value, valueId: value.valueId ?? value.id, carrierId: carrier.carrierId || carrier.id };
                
                const salePrice = parseFloat(String(input.value).replace(',', '.')) || (value.salePrice ?? value.cost);
                const originalValue = value.originalValue ?? value.value;
                const currentCost = value.cost ?? value.originalCost ?? 0;
                const originalCost = value.originalCost ?? value.cost ?? 0;
                
                return {
                    ...value,
                    valueId: value.valueId ?? value.id,
                    value: originalValue,
                    cost: currentCost,
                    salePrice: salePrice,
                    originalValue: originalValue,
                    originalCost: originalCost,
                    carrierId: carrier.carrierId || carrier.id
                };
            });

            return {
                ...carrier,
                carrierId: carrier.carrierId || carrier.id,
                name: carrier.name,
                extraField: carrier.extraField,
                values: editedValues
            };
        });

        // Salvar catálogo do revendedor
        await this.db.setCatalog(this.currentUser.id, editedCatalog);
        console.log('Catálogo salvo para revendedor:', this.currentUser.id, editedCatalog);
        this.showNotification('Seu catálogo foi salvo com sucesso!', 'success');
    }

    // Adicionar Saldo Revendedor (usando módulo de pagamento selecionado)
    // REGRA: Valor creditado = valor pago (1:1). R$100 no PIX = R$100 no saldo. Nenhuma multiplicação.
    async processAddSaldoRevendedor() {
        const valor = parseFloat(document.getElementById('saldoRevendedorValor').value);

        if (!valor || valor < 1) {
            this.showNotification('Valor mínimo é R$ 1,00', 'error');
            return;
        }

        try {
            // Obter módulo de pagamento selecionado do servidor (fonte da verdade)
            // Primeiro tentar carregar do servidor, depois fallback para localStorage
            let paymentModule = 'mercadopago';
            try {
                const configResp = await fetch('api/data.php?action=config_get');
                const configJson = await configResp.json();
                if (configJson && configJson.success && configJson.data && configJson.data.adminPaymentModule) {
                    paymentModule = configJson.data.adminPaymentModule;
                    localStorage.setItem('adminPaymentModule', paymentModule);
                } else {
                    paymentModule = localStorage.getItem('adminPaymentModule') || 'mercadopago';
                }
            } catch (e) {
                console.warn('Erro ao carregar módulo do servidor, usando localStorage:', e);
                paymentModule = localStorage.getItem('adminPaymentModule') || 'mercadopago';
            }
            
            console.log('🔍 Módulo de pagamento selecionado para adicionar saldo:', paymentModule);
            console.log('🔍 localStorage adminPaymentModule:', localStorage.getItem('adminPaymentModule'));
            
            // Criar dados do pagamento
            const paymentData = {
                amount: valor,
                description: `Recarga de Saldo - ${this.currentUser.nome || this.currentUser.username}`,
                email: this.currentUser.email || 'revendedor@recargaexpress.com',
                firstName: this.currentUser.nome?.split(' ')[0] || this.currentUser.username,
                lastName: this.currentUser.nome?.split(' ').slice(1).join(' ') || '',
                externalReference: `SALDO_${this.currentUser.id}_${Date.now()}`,
                notificationUrl: window.location.origin + '/webhook-mercadopago.html',
                userId: this.currentUser.id,
                isAdmin: true
            };

            let pixPayment;
            
            if (paymentModule === 'virtualpay') {
                // Usar Virtual Pay
                await virtualPay.ensureAdminConfigLoaded(true);
                this.showNotification('Gerando pagamento via Virtual Pay...', 'success');
                pixPayment = await virtualPay.createPayment(paymentData);
            } else if (paymentModule === 'pushinpay') {
                // Usar PushinPay
                console.log('🚀 Usando PushinPay para gerar pagamento');
                await pushinPay.ensureAdminConfigLoaded(true);
                this.showNotification('Gerando pagamento via PushinPay...', 'success');
                pixPayment = await pushinPay.createPayment(paymentData);
                console.log('✅ Pagamento PushinPay criado:', pixPayment);
            } else {
                // Usar Mercado Pago (padrão)
                console.log('⚠️ Usando Mercado Pago (padrão ou módulo não reconhecido)');
                await mercadoPago.ensureAdminConfigLoaded();
                
                const modo = localStorage.getItem('adminMercadoPagoModo') || 'prod';
                const useTest = modo === 'test';
                
                this.showNotification('Gerando pagamento PIX via Mercado Pago...', 'success');
                pixPayment = await mercadoPago.createPixPaymentReal(paymentData);
            }

            // Salvar transação no servidor (SQLite) para funcionar em qualquer dispositivo
            const paymentId = pixPayment.id || pixPayment.transactionId;
            try {
                await this.db.upsertTransaction(paymentId, {
                    id: paymentId,
                    userId: this.currentUser.id,
                    type: 'add_saldo',
                    amount: valor,
                    status: 'pending',
                    module: paymentModule,
                    createdAt: new Date().toISOString()
                });
            } catch (e) {
                console.warn('Falha ao salvar transação no servidor (fallback local):', e);
                // Fallback local (legado)
                const key = paymentModule === 'virtualpay' ? 'vp_transactions' : 'mp_transactions';
                const transactions = JSON.parse(localStorage.getItem(key) || '{}');
                transactions[paymentId] = {
                    createdAt: Date.now(),
                    amount: valor,
                    approved: false,
                    module: paymentModule
                };
                localStorage.setItem(key, JSON.stringify(transactions));
            }

            if (pixPayment.status === 'pending' || pixPayment.status === 'in_process') {
                // Mostrar QR Code e código PIX
                this.showPixPaymentRevendedor(pixPayment, valor, paymentModule);
            } else {
                throw new Error('Erro ao gerar pagamento');
            }
        } catch (error) {
            this.showNotification(`Erro ao processar pagamento: ${error.message}`, 'error');
            console.error('Erro:', error);
        }
    }

    showPixPaymentRevendedor(paymentData, valor, paymentModule = 'mercadopago') {
        const container = document.getElementById('mercadoPagoRevendedorContainer');
        if (!container) {
            this.showNotification('Erro: Container não encontrado', 'error');
            return;
        }

        container.style.display = 'block';

        // Obter dados do PIX (adaptar para todos os módulos)
        let pixData, qrCode, qrCodeBase64, ticketUrl, pixCode;
        
        if (paymentModule === 'virtualpay') {
            // Virtual Pay estrutura
            pixData = paymentData.pix_data || paymentData.payment_data || {};
            qrCode = pixData.qr_code || paymentData.qr_code || '';
            qrCodeBase64 = pixData.qr_code_base64 || paymentData.qr_code_base64 || '';
            pixCode = pixData.copy_paste || paymentData.copy_paste || paymentData.pix_code || '';
            ticketUrl = paymentData.payment_url || '';
        } else if (paymentModule === 'pushinpay') {
            // PushinPay estrutura - os dados podem estar diretamente no paymentData ou em pix_data
            pixData = paymentData.pix_data || {};
            // Tentar pegar de múltiplos lugares possíveis
            qrCode = paymentData.qr_code || pixData.qr_code || paymentData.pix_data?.qr_code || '';
            qrCodeBase64 = paymentData.qr_code_base64 || pixData.qr_code_base64 || paymentData.pix_data?.qr_code_base64 || '';
            pixCode = paymentData.copy_paste || pixData.copy_paste || paymentData.pix_code || paymentData.pix_data?.copy_paste || qrCode;
            ticketUrl = '';
            
            console.log('🔍 PushinPay - Dados extraídos:', {
                qrCode: qrCode ? qrCode.substring(0, 50) + '...' : 'vazio',
                qrCodeBase64: qrCodeBase64 ? qrCodeBase64.substring(0, 50) + '...' : 'vazio',
                pixCode: pixCode ? pixCode.substring(0, 50) + '...' : 'vazio',
                paymentDataKeys: Object.keys(paymentData)
            });
        } else {
            // Mercado Pago estrutura
            pixData = paymentData.point_of_interaction?.transaction_data;
            qrCode = pixData?.qr_code || '';
            qrCodeBase64 = pixData?.qr_code_base64 || '';
            pixCode = pixData?.qr_code || '';
            ticketUrl = pixData?.ticket_url || '';
        }

        // Construir HTML do QR Code
        let qrCodeHtml = '';
        console.log('📸 Gerando QR Code (app.js) - Base64:', !!qrCodeBase64, 'QR Code:', !!qrCode, 'PIX Code:', !!pixCode);
        
        if (qrCodeBase64 && qrCodeBase64.length > 100 && qrCodeBase64.trim() !== '') {
            // Validar e limpar base64 antes de usar
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
                qrCodeHtml = `<img src="${base64Data}" alt="QR Code PIX" style="max-width: 200px; border-radius: 8px; display: block; margin: 0 auto;" onload="console.log('✅ QR Code Base64 carregado com sucesso (app.js)');" onerror="console.error('❌ Erro ao carregar QR Code Base64 (app.js)'); this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"><div style="display:none; padding: 40px; background: var(--card-bg-light); border-radius: 8px; border: 2px dashed var(--border-color); text-align: center;"><p style="font-size: 48px; margin: 0;">📱</p><p style="color: var(--text-secondary); margin-top: 10px;">Use o código abaixo</p></div>`;
            } else {
                // Se base64 inválido, tentar gerar via código PIX
                if (pixCode && pixCode.length > 50) {
                    console.log('⚠️ Base64 inválido, gerando via código PIX');
                    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;
                    qrCodeHtml = `<img src="${qrCodeUrl}" alt="QR Code PIX" style="max-width: 200px; border-radius: 8px; border: 2px solid var(--border-color); display: block; margin: 0 auto;" onload="console.log('✅ QR Code gerado via API pública (app.js)');" onerror="console.error('❌ Erro ao gerar QR Code (app.js)'); this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"><div style="display:none; padding: 40px; background: var(--card-bg-light); border-radius: 8px; border: 2px dashed var(--border-color); text-align: center;"><p style="font-size: 48px; margin: 0;">📱</p><p style="color: var(--text-secondary); margin-top: 10px;">Use o código abaixo</p></div>`;
                }
            }
        }
        
        // Se ainda não tem QR Code HTML, tentar gerar via código PIX
        if (!qrCodeHtml && (pixCode || qrCode)) {
            const pixCodeToUse = pixCode || qrCode;
            if (pixCodeToUse && pixCodeToUse.length > 50) {
                console.log('✅ Gerando QR Code via API pública com código PIX (tamanho:', pixCodeToUse.length, ')');
                const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCodeToUse)}`;
                qrCodeHtml = `<img src="${qrCodeUrl}" alt="QR Code PIX" style="max-width: 200px; border-radius: 8px; border: 2px solid var(--border-color); display: block; margin: 0 auto;" onload="console.log('✅ QR Code gerado via API pública (app.js)');" onerror="console.error('❌ Erro ao gerar QR Code (app.js)'); this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';"><div style="display:none; padding: 40px; background: var(--card-bg-light); border-radius: 8px; border: 2px dashed var(--border-color); text-align: center;"><p style="font-size: 48px; margin: 0;">📱</p><p style="color: var(--text-secondary); margin-top: 10px;">Use o código abaixo</p></div>`;
            }
        }
        
        // Fallback final se não tiver código PIX
        if (!qrCodeHtml) {
            console.error('❌ Nenhum código PIX disponível para gerar QR Code!', {
                qrCode: qrCode ? qrCode.substring(0, 50) : 'vazio',
                pixCode: pixCode ? pixCode.substring(0, 50) : 'vazio',
                qrCodeBase64: qrCodeBase64 ? 'presente' : 'vazio'
            });
            qrCodeHtml = `
                <div style="padding: 40px; background: var(--card-bg-light); border-radius: 8px; border: 2px dashed var(--border-color); text-align: center;">
                    <p style="font-size: 48px; margin: 0;">📱</p>
                    <p style="color: var(--text-secondary); margin-top: 10px;">Escaneie o QR Code</p>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="pix-payment-container" style="background: var(--card-bg); padding: 20px; border-radius: 12px; border: 2px solid var(--success-color);">
                <h3 style="color: var(--text-primary); margin-bottom: 20px; text-align: center;">💳 Pagamento PIX</h3>
                <div class="pix-qrcode-display" style="margin-bottom: 20px; text-align: center;">
                    ${qrCodeHtml}
                </div>
                <div class="pix-code-display" style="margin-bottom: 20px;">
                    <label style="color: var(--text-primary); display: block; margin-bottom: 8px; font-weight: 600;">Código PIX (Copiar e Colar):</label>
                    <div class="pix-code-wrapper" style="display: flex; gap: 10px;">
                        <input type="text" id="pixCodeRevendedor" value="${(pixCode || qrCode || '').replace(/"/g, '&quot;')}" readonly style="flex: 1; padding: 12px; background: var(--card-bg-light); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); font-size: 11px; font-family: monospace;">
                        <button class="btn btn-secondary" id="btnCopyPixRevendedor">Copiar</button>
                    </div>
                </div>
                <div class="pix-info-display" style="background: var(--card-bg-light); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: var(--text-primary); margin-bottom: 8px;"><strong>Valor:</strong> R$ ${valor.toFixed(2)}</p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;"><strong>ID do Pagamento:</strong> <span style="font-family: monospace; font-size: 11px;">${paymentData.id || paymentData.transactionId}</span></p>
                    <p style="color: var(--text-primary); margin-bottom: 8px;"><strong>Módulo:</strong> ${paymentModule === 'virtualpay' ? 'Virtual Pay' : paymentModule === 'pushinpay' ? 'PushinPay' : 'Mercado Pago'}</p>
                    <p style="color: var(--text-primary);"><strong>Status:</strong> <span id="pixStatusRevendedor" style="color: var(--warning-color);">⏳ Aguardando pagamento...</span></p>
                </div>
                <div class="pix-status-check" style="display: flex; flex-direction: column; gap: 10px;">
                    <button class="btn btn-secondary" id="btnCheckPixRevendedor" style="width: 100%;">🔄 Verificar Pagamento</button>
                </div>
            </div>
        `;

        // Event listeners
        document.getElementById('btnCopyPixRevendedor').addEventListener('click', () => {
            this.copyPixCodeRevendedor();
        });

        const paymentId = paymentData.id || paymentData.transactionId;
        document.getElementById('btnCheckPixRevendedor').addEventListener('click', () => {
            this.checkPixPaymentRevendedor(paymentId, valor, paymentModule);
        });

        // Verificar pagamento automaticamente a cada 5 segundos
        if (this.pixCheckInterval) {
            clearInterval(this.pixCheckInterval);
        }
        this.pixCheckInterval = setInterval(() => {
            this.checkPixPaymentRevendedor(paymentId, valor, paymentModule);
        }, 5000);
    }

    async checkPixPaymentRevendedor(paymentId, valor, paymentModule = 'mercadopago') {
        try {
            // Usar o módulo correto para verificar pagamento
            let payment;
            if (paymentModule === 'virtualpay') {
                await virtualPay.ensureAdminConfigLoaded(true);
                payment = await virtualPay.getPaymentStatus(paymentId, { userId: this.currentUser.id, isAdmin: true });
            } else if (paymentModule === 'pushinpay') {
                await pushinPay.ensureAdminConfigLoaded(true);
                payment = await pushinPay.getPaymentStatus(paymentId, { userId: this.currentUser.id, isAdmin: true });
            } else {
                // Mercado Pago (padrão)
                await mercadoPago.ensureAdminConfigLoaded(true);
                payment = await mercadoPago.getPaymentStatus(paymentId, { userId: this.currentUser.id, isAdmin: true });
            }
            
            const statusElement = document.getElementById('pixStatusRevendedor');
            if (statusElement) {
                if (payment.status === 'approved') {
                    statusElement.textContent = '✓ Pagamento Aprovado!';
                    statusElement.style.color = 'var(--success-color)';
                } else if (payment.status === 'pending' || payment.status === 'in_process') {
                    statusElement.textContent = '⏳ Aguardando pagamento...';
                    statusElement.style.color = 'var(--warning-color)';
                } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                    statusElement.textContent = '✗ Pagamento Rejeitado';
                    statusElement.style.color = 'var(--danger-color)';
                    
                    // Parar verificação em caso de rejeição
                    if (this.pixCheckInterval) {
                        clearInterval(this.pixCheckInterval);
                        this.pixCheckInterval = null;
                    }
                } else {
                    statusElement.textContent = payment.status;
                }
            }

            if (payment.status === 'approved') {
                // Pagamento aprovado - adicionar saldo (1:1, sem multiplicação)
                if (this.pixCheckInterval) {
                    clearInterval(this.pixCheckInterval);
                    this.pixCheckInterval = null;
                }
                
                // Usar endpoint idempotente: credita EXATAMENTE o valor pago (R$100 = R$100)
                const res = await this.db.addSaldoFromPayment(paymentId, this.currentUser.id, valor, paymentModule);
                if (!res.alreadyProcessed) {
                    this.showNotification(`Saldo de R$ ${valor.toFixed(2)} adicionado com sucesso!`, 'success');
                }
                this.updateBalanceDisplay();
                
                // Fechar modal após 2 segundos
                setTimeout(() => {
                    this.closeModal('addSaldoRevendedorModal');
                    const form = document.getElementById('addSaldoRevendedorForm');
                    if (form) form.reset();
                    const container = document.getElementById('mercadoPagoRevendedorContainer');
                    if (container) container.style.display = 'none';
                }, 2000);
            }
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
            this.showNotification('Erro ao verificar pagamento. Tentando novamente...', 'warning');
        }
    }

    copyPixCodeRevendedor() {
        const pixCode = document.getElementById('pixCodeRevendedor');
        if (pixCode) {
            pixCode.select();
            document.execCommand('copy');
            this.showNotification('Código PIX copiado!', 'success');
        }
    }

    generateRecargaLink() {
        if (this.currentUser.type !== 'revendedor') {
            this.showNotification('Apenas revendedores podem gerar links de recarga', 'error');
            return;
        }

        // Gerar link único com ID do revendedor
        const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '').replace(/\/$/, '');
        const recargaLink = `${baseUrl}/recarga/?revendedor=${this.currentUser.id}`;
        
        // Criar modal para mostrar o link
        this.showRecargaLinkModal(recargaLink);
    }

    showRecargaLinkModal(link) {
        // Criar modal dinamicamente
        const modalId = 'recargaLinkModal';
        let modal = document.getElementById(modalId);
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Seu Link de Recarga</h2>
                        <button class="modal-close" id="closeRecargaLinkBtn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p style="margin-bottom: 15px; color: var(--text-secondary);">
                            Compartilhe este link com seus clientes para que eles possam fazer recargas:
                        </p>
                        <div class="form-group">
                            <input type="text" id="recargaLinkInput" value="${link}" readonly style="font-family: monospace; font-size: 12px;">
                        </div>
                        <div class="form-actions" style="display: flex; gap: 10px;">
                            <button class="btn btn-primary" id="copyRecargaLinkBtn">📋 Copiar Link</button>
                            <a href="${link}" target="_blank" class="btn btn-secondary" style="text-decoration: none; color: var(--text-primary);">🔗 Abrir Link</a>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            
            // Event listeners
            document.getElementById('closeRecargaLinkBtn').addEventListener('click', () => {
                this.closeModal(modalId);
            });
            
            document.getElementById('copyRecargaLinkBtn').addEventListener('click', () => {
                const input = document.getElementById('recargaLinkInput');
                input.select();
                document.execCommand('copy');
                this.showNotification('Link copiado para a área de transferência!', 'success');
            });
        } else {
            // Atualizar link se modal já existe
            document.getElementById('recargaLinkInput').value = link;
            const openLink = document.querySelector(`#${modalId} a[href]`);
            if (openLink) {
                openLink.href = link;
            }
        }
        
        this.openModal(modalId);
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 11) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
        } else if (cleaned.length === 10) {
            return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
        }
        return phone;
    }

    async downloadReceiptFromApi(apiOrderId, localRecargaId) {
        if (!apiOrderId) {
            this.showNotification('ID da recarga não encontrado', 'error');
            return;
        }

        try {
            this.showNotification('Buscando dados atualizados da recarga...', 'info');
            
            // Buscar dados atualizados da API express.poeki.dev
            const orderResponse = await this.api.getOrder(apiOrderId);
            
            if (!orderResponse.success || !orderResponse.data) {
                throw new Error('Não foi possível obter dados da recarga da API');
            }

            const orderData = orderResponse.data;
            const statusLower = String(orderData.status || '').toLowerCase();
            
            // Verificar se a recarga está "feita" (aceitar variações)
            const statusFeita = ['feita', 'done', 'completed', 'success', 'aprovada', 'approved'].includes(statusLower);
            if (!statusFeita) {
                this.showNotification(`Recarga ainda não foi processada. Status atual: ${orderData.status || 'pendente'}`, 'warning');
                return;
            }

            // Buscar dados da recarga local para complementar
            const recargas = this.db.getAllRecargas();
            const recarga = recargas.find(r => (r.id === localRecargaId) || (r.apiOrderId === apiOrderId));
            
            // Preparar dados do comprovante com dados atualizados da API
            const receiptData = {
                date: orderData.createdAt ? new Date(orderData.createdAt).toLocaleString('pt-BR') : (recarga?.createdAt ? new Date(recarga.createdAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR')),
                carrier: orderData.carrier?.name || recarga?.carrier?.name || (typeof recarga?.carrier === 'string' ? recarga.carrier : null) || recarga?.carrierName || 'N/A',
                phone: this.formatPhone(orderData.phoneNumber || recarga?.phoneNumber || ''),
                value: orderData.value ? parseFloat(orderData.value).toFixed(2) : (recarga?.value ? parseFloat(recarga.value).toFixed(2) : '0.00'),
                paid: recarga?.salePrice ? parseFloat(recarga.salePrice).toFixed(2) : (orderData.value ? parseFloat(orderData.value).toFixed(2) : (recarga?.cost ? parseFloat(recarga.cost).toFixed(2) : '0.00')),
                status: statusLower,
                orderId: apiOrderId
            };

            console.log('Gerando comprovante com dados atualizados da API:', receiptData);
            this.downloadReceiptPDF(receiptData);
            
        } catch (error) {
            console.error('Erro ao buscar dados da API:', error);
            this.showNotification('Erro ao buscar dados da recarga: ' + (error.message || 'Erro desconhecido'), 'error');
        }
    }

    showReceiptModal(receiptData) {
        if (!receiptData) {
            this.showNotification('Dados do comprovante não encontrados', 'error');
            return;
        }

        this.currentReceiptData = receiptData;
        const data = receiptData;
        const receiptContent = document.getElementById('receiptContent');
        
        if (!receiptContent) {
            console.error('Elemento receiptContent não encontrado');
            return;
        }

        // Renderizar comprovante visualmente
        receiptContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #00d084; margin: 0 0 8px; font-size: 24px; font-weight: bold;">COMPROVANTE DE RECARGA</h2>
                <p style="color: #999; margin: 0; font-size: 12px;">Data: ${data.date}</p>
            </div>
            
            <div style="border-top: 2px solid #ccc; border-bottom: 2px solid #ccc; padding: 20px 0; margin: 20px 0;">
                <div style="margin-bottom: 16px;">
                    <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">OPERADORA</div>
                    <div style="color: #333; font-size: 18px; font-weight: bold;">${data.carrier || 'N/A'}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">NÚMERO</div>
                    <div style="color: #333; font-size: 18px; font-weight: bold;">${data.phone || 'N/A'}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">VALOR RECARGA</div>
                    <div style="color: #333; font-size: 18px; font-weight: bold;">R$ ${data.value || '0.00'}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">VALOR PAGO</div>
                    <div style="color: #333; font-size: 18px; font-weight: bold;">R$ ${data.paid || '0.00'}</div>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">STATUS</div>
                    <div style="color: ${data.status === 'feita' || data.status === 'done' ? '#00d084' : '#ff9800'}; font-size: 18px; font-weight: bold; text-transform: uppercase;">${data.status || 'pendente'}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <div style="color: #999; font-size: 12px; font-weight: bold; margin-bottom: 4px;">ID DO PEDIDO</div>
                <div style="color: #00d084; font-size: 14px; font-weight: bold; font-family: monospace; word-break: break-all;">${data.orderId || 'N/A'}</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 11px;">
                <div>Comprovante gerado automaticamente</div>
                <div style="margin-top: 4px;">${this.appTitle || 'Recarga Express'} - ${new Date().getFullYear()}</div>
            </div>
        `;

        this.openModal('receiptModal');
    }

    downloadReceiptPDF(receiptData) {
        if (!receiptData) {
            this.showNotification('Dados do comprovante não encontrados', 'error');
            return;
        }

        const data = receiptData;
        console.log('downloadReceiptPDF chamado com:', data);
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
            console.error('Não foi possível obter contexto 2D do canvas');
            this.showNotification('Erro: navegador não suporta geração de comprovante', 'error');
            return;
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
        ctx.fillText('Data: ' + data.date, 50, y);
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
            ctx.fillText(value, 50, y);
            y += 30;
        };
        
        drawField('OPERADORA', data.carrier || 'N/A');
        drawField('NÚMERO', data.phone || 'N/A');
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
        ctx.fillText(data.orderId, 50, y);
        y += 40;
        
        // Rodapé
        ctx.fillStyle = lightGray;
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Comprovante gerado automaticamente', canvas.width / 2, canvas.height - 40);
        ctx.fillText((this.appTitle || 'Recarga Express') + ' - ' + new Date().getFullYear(), canvas.width / 2, canvas.height - 20);
        
        // Converter para blob e fazer download
        try {
            // Usar toDataURL como método principal (mais compatível)
            const dataURL = canvas.toDataURL('image/png');
            if (!dataURL || dataURL === 'data:,') {
                throw new Error('Canvas vazio ou inválido');
            }
            
            // Limpar orderId para nome de arquivo válido
            const orderIdClean = String(data.orderId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
            
            const link = document.createElement('a');
            link.href = dataURL;
            link.download = 'comprovante_recarga_' + orderIdClean + '.png';
            link.style.display = 'none';
            document.body.appendChild(link);
            
            // Forçar download
            setTimeout(() => {
                try {
                    link.click();
                    setTimeout(() => {
                        document.body.removeChild(link);
                        this.showNotification('Comprovante baixado com sucesso!', 'success');
                    }, 200);
                } catch (clickError) {
                    console.error('Erro ao clicar no link:', clickError);
                    document.body.removeChild(link);
                    // Tentar abrir em nova aba como fallback
                    window.open(dataURL, '_blank');
                    this.showNotification('Comprovante aberto em nova aba. Use Ctrl+S para salvar.', 'info');
                }
            }, 100);
        } catch (error) {
            console.error('Erro ao gerar comprovante:', error);
            this.showNotification('Erro ao baixar comprovante: ' + error.message, 'error');
        }
    }

}

// Função global para o botão de login (fallback inline onclick)
window.tryLogin = function() {
    const app = window.app;
    if (app && app.handleLogin) {
        app.handleLogin();
        return;
    }
    // Fallback quando app ainda não carregou: login direto via API
    const u = document.getElementById('username');
    const p = document.getElementById('password');
    if (!u || !p || !u.value.trim() || !p.value) {
        alert('Preencha usuário e senha');
        return;
    }
    const btn = document.getElementById('loginBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Entrando...';
    }
    fetch('/api/data.php?action=state_getAll')
        .then(r => r.json())
        .then(j => {
            if (!j || !j.success) throw new Error(j?.error || 'Sem resposta');
            const users = (j.data && j.data.users) || [];
            const username = u.value.trim();
            const password = p.value;
            const user = users.find(x => x.username === username);
            if (!user) {
                alert('Usuário não encontrado');
                return;
            }
            if (user.password !== password) {
                alert('Senha incorreta');
                return;
            }
            if (!user.active) {
                alert('Usuário desativado');
                return;
            }
            document.getElementById('loginScreen').style.display = 'none';
            document.getElementById('appScreen').style.display = 'block';
            try {
                window.localStorage.setItem('currentUser', JSON.stringify(user));
            } catch (e) {}
            location.reload();
        })
        .catch(e => alert('Erro: ' + (e.message || e)))
        .finally(() => {
            if (btn) {
                btn.disabled = false;
                btn.textContent = 'Entrar';
            }
        });
};

// Initialize app when DOM is ready (banco único no servidor via api/data.php)
document.addEventListener('DOMContentLoaded', async () => {
    try {
    await db.init();
    if (!window.app) {
        window.app = new RecargaApp();
    }
        await window.app.init();
    window.RecargaApp = RecargaApp;
    } catch (err) {
        console.error('Erro ao iniciar:', err);
        alert('Erro ao carregar: ' + (err.message || err));
    }
});
