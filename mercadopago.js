// Mercado Pago Integration - Via Backend PHP (evita CORS)
class MercadoPagoIntegration {
    constructor() {
        // URL do backend PHP para proxy das chamadas ao Mercado Pago
        this.backendUrl = '/api/mercadopago.php';
    }

    // Obter Access Token configurado (revendedor ou admin), conforme modo Teste/Produção
    async getAccessToken(userId = null, isAdmin = false) {
        // Se for admin, garantir que as configurações estão atualizadas do servidor
        if (isAdmin) {
            await this.ensureAdminConfigLoaded();
        }
        
        const modo = isAdmin
            ? (localStorage.getItem('adminMercadoPagoModo') || 'prod')
            : (userId ? (localStorage.getItem(`revendedorMercadoPagoModo_${userId}`) || 'prod') : 'prod');
        const useTest = modo === 'test';
        let token = null;
        if (isAdmin) {
            token = (useTest ? localStorage.getItem('adminMercadoPagoKeyTest') : localStorage.getItem('adminMercadoPagoKeyProd')) || null;
            if (!token) token = localStorage.getItem('adminMercadoPagoKey') || null;
        } else if (userId) {
            token = (useTest ? localStorage.getItem(`revendedorMercadoPagoKeyTest_${userId}`) : localStorage.getItem(`revendedorMercadoPagoKeyProd_${userId}`)) || null;
            if (!token) token = localStorage.getItem(`revendedorMercadoPagoKey_${userId}`) || null;
        }
        return token || null;
    }

    // Garantir que as configurações do admin estão carregadas do servidor (sempre forçar atualização)
    async ensureAdminConfigLoaded(forceRefresh = true) {
        try {
            // Adicionar timestamp para evitar cache
            const cacheBuster = forceRefresh ? '&_t=' + Date.now() : '';
            const r = await fetch('/api/data.php?action=config_get' + cacheBuster);
            const j = await r.json();
            if (j && j.success && j.data && typeof j.data === 'object') {
                const c = j.data;
                let updated = false;
                
                // Atualizar localStorage com valores do servidor (sempre sobrescrever)
                if (c.adminMercadoPagoModo !== undefined && c.adminMercadoPagoModo !== null) {
                    const modo = (c.adminMercadoPagoModo === 'test' || c.adminMercadoPagoModo === 'prod') ? c.adminMercadoPagoModo : 'prod';
                    const currentModo = localStorage.getItem('adminMercadoPagoModo');
                    if (currentModo !== modo) {
                        localStorage.setItem('adminMercadoPagoModo', modo);
                        updated = true;
                    }
                }
                if (c.adminMercadoPagoKeyTest !== undefined && c.adminMercadoPagoKeyTest !== null) {
                    // Não sobrescrever com valor mascarado "********"
                    const keyTest = c.adminMercadoPagoKeyTest || '';
                    if (keyTest && !keyTest.includes('*')) {
                        const currentKeyTest = localStorage.getItem('adminMercadoPagoKeyTest') || '';
                        if (currentKeyTest !== keyTest) {
                            localStorage.setItem('adminMercadoPagoKeyTest', keyTest);
                            updated = true;
                        }
                    }
                }
                if (c.adminMercadoPagoKeyProd !== undefined && c.adminMercadoPagoKeyProd !== null) {
                    // Não sobrescrever com valor mascarado "********"
                    const keyProd = c.adminMercadoPagoKeyProd || '';
                    if (keyProd && !keyProd.includes('*')) {
                        const currentKeyProd = localStorage.getItem('adminMercadoPagoKeyProd') || '';
                        if (currentKeyProd !== keyProd) {
                            localStorage.setItem('adminMercadoPagoKeyProd', keyProd);
                            updated = true;
                        }
                    }
                }
                
                if (updated) {
                    console.log('Configurações do Mercado Pago atualizadas do servidor');
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar configurações do admin do servidor:', e);
        }
    }

    // Criar pagamento PIX via backend PHP
    async createPixPayment(paymentData) {
        try {
            console.log('Criando pagamento PIX via backend...', paymentData);
            
            // IMPORTANTE: Enviar userId para o backend buscar o token do revendedor
            const requestBody = {
                amount: paymentData.amount,
                description: paymentData.description || 'Recarga de Celular',
                email: paymentData.email || 'cliente@email.com',
                firstName: paymentData.firstName || 'Cliente',
                lastName: paymentData.lastName || 'Recarga',
                externalReference: paymentData.externalReference || `REF_${Date.now()}`,
                userId: paymentData.userId || null  // IMPORTANTE: userId do revendedor
            };
            
            const response = await fetch(`${this.backendUrl}?action=create_pix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const result = await response.json();

            if (!result.success) {
                console.error('Erro ao criar pagamento PIX:', result);
                throw new Error(result.error || 'Falha ao criar pagamento PIX');
            }

            const data = result.data;
            console.log('Pagamento PIX criado com sucesso:', data);

            // Salvar transação localmente
            this.saveTransaction(data.id, {
                amount: paymentData.amount,
                status: data.status,
                createdAt: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Erro ao criar pagamento PIX:', error);
            throw error;
        }
    }

    // Alias para compatibilidade
    async createPixPaymentReal(paymentData) {
        return this.createPixPayment(paymentData);
    }

    // Verificar status do pagamento via backend PHP
    async getPaymentStatus(paymentId, options = {}) {
        try {
            // Verificar cache local primeiro para pagamentos já aprovados
            const cachedTransaction = this.getTransaction(paymentId);
            if (cachedTransaction && cachedTransaction.status === 'approved') {
                return {
                    id: paymentId,
                    status: 'approved',
                    status_detail: 'accredited',
                    transaction_amount: cachedTransaction.amount
                };
            }

            // IMPORTANTE: Enviar userId para o backend buscar o token do revendedor
            const userId = options.userId || null;
            let url = `${this.backendUrl}?action=check_payment&payment_id=${encodeURIComponent(paymentId)}`;
            if (userId) {
                url += `&userId=${encodeURIComponent(userId)}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (!result.success) {
                console.error('Erro ao verificar pagamento:', result);
                throw new Error(result.error || 'Erro ao verificar pagamento');
            }

            const data = result.data;

            // Atualizar cache local
            if (data.status === 'approved') {
                this.saveTransaction(paymentId, {
                    amount: data.transaction_amount,
                    status: 'approved',
                    approvedAt: Date.now()
                });
            }

            return {
                id: data.id,
                status: data.status,
                status_detail: data.status_detail,
                transaction_amount: data.transaction_amount
            };
        } catch (error) {
            console.error('Erro ao verificar pagamento:', error);
            
            // Fallback para cache local
            const cachedTransaction = this.getTransaction(paymentId);
            if (cachedTransaction) {
                return {
                    id: paymentId,
                    status: cachedTransaction.status || 'pending',
                    status_detail: cachedTransaction.status === 'approved' ? 'accredited' : 'pending_waiting_payment',
                    transaction_amount: cachedTransaction.amount || 0
                };
            }
            
            throw error;
        }
    }

    // Alias para compatibilidade
    async getPaymentStatusReal(paymentId, options = {}) {
        return this.getPaymentStatus(paymentId, options);
    }

    // Salvar transação no localStorage
    saveTransaction(paymentId, data) {
        const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '{}');
        transactions[paymentId] = {
            ...transactions[paymentId],
            ...data,
            updatedAt: Date.now()
        };
        localStorage.setItem('mp_transactions', JSON.stringify(transactions));
    }

    // Obter transação do localStorage
    getTransaction(paymentId) {
        const transactions = JSON.parse(localStorage.getItem('mp_transactions') || '{}');
        return transactions[paymentId] || null;
    }

    // Marcar pagamento como aprovado manualmente (para testes/admin)
    approvePayment(paymentId, amount) {
        this.saveTransaction(paymentId, {
            amount: amount,
            status: 'approved',
            approvedAt: Date.now(),
            approved: true
        });
    }
}

// Export singleton
const mercadoPago = new MercadoPagoIntegration();
