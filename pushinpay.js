// PushinPay Integration - Via Backend PHP
// O backend PHP (api/pushinpay.php) busca as credenciais do revendedor
// diretamente do banco SQLite. O frontend NÃO precisa lidar com credenciais.
// Cada revendedor usa SOMENTE suas próprias credenciais (sem fallback para admin).

class PushinPayIntegration {
    constructor() {
        this.backendUrl = '/api/pushinpay.php';
    }

    // Criar pagamento via backend PHP
    // O backend busca as credenciais do revendedor no banco SQLite usando o userId
    async createPayment(paymentData) {
        try {
            console.log('Criando pagamento PushinPay via backend...', paymentData);

            const requestBody = {
                amount: paymentData.amount,
                description: paymentData.description || 'Recarga de Celular',
                email: paymentData.email || 'cliente@email.com',
                firstName: paymentData.firstName || 'Cliente',
                lastName: paymentData.lastName || 'Recarga',
                externalReference: paymentData.externalReference || `REF_${Date.now()}`,
                userId: paymentData.userId || null,
                isAdmin: paymentData.isAdmin || false
            };

            // Adicionar webhook_url se fornecido
            if (paymentData.notificationUrl) {
                requestBody.webhook_url = paymentData.notificationUrl;
            }

            const response = await fetch(`${this.backendUrl}?action=create_payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Erro HTTP ao criar pagamento:', response.status, text);
                throw new Error(`Erro HTTP ${response.status}: ${text.substring(0, 200)}`);
            }

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                throw new Error(`Erro ao processar resposta do servidor: ${parseError.message}`);
            }

            if (!result.success) {
                console.error('Erro ao criar pagamento PushinPay:', result);
                throw new Error(result.error || 'Falha ao criar pagamento PushinPay');
            }

            const data = result.data;
            console.log('Pagamento PushinPay criado com sucesso:', data);

            // Salvar transação localmente
            this.saveTransaction(data.id || data.transactionId, {
                amount: paymentData.amount,
                status: data.status || 'pending',
                createdAt: Date.now()
            });

            return data;
        } catch (error) {
            console.error('Erro ao criar pagamento PushinPay:', error);
            throw error;
        }
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

            const userId = options.userId || null;
            const isAdmin = options.isAdmin ? '1' : '0';

            let url = `${this.backendUrl}?action=check_payment&payment_id=${encodeURIComponent(paymentId)}`;
            if (userId) url += `&userId=${encodeURIComponent(userId)}`;
            url += `&isAdmin=${isAdmin}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Erro HTTP ao verificar pagamento:', response.status, text);
                throw new Error(`Erro HTTP ${response.status}: ${text.substring(0, 200)}`);
            }

            let result;
            try {
                result = await response.json();
            } catch (parseError) {
                console.error('Erro ao fazer parse do JSON:', parseError);
                throw new Error(`Erro ao processar resposta do servidor: ${parseError.message}`);
            }

            if (!result.success) {
                const errorMsg = result.error || 'Erro ao verificar pagamento';
                // Não logar erro se for erro de rota não encontrada (pode ser esperado)
                // A API pode não suportar verificação de status, mas o pagamento será detectado via webhook
                if (!errorMsg.includes('route') && !errorMsg.includes('not be found') && !errorMsg.includes('404')) {
                    console.error('Erro ao verificar pagamento:', result);
                } else {
                    // Se for 404, retornar status pendente em vez de erro
                    console.warn('⚠️ Verificação de status não disponível (404). O pagamento será detectado via webhook quando configurado.');
                    return {
                        id: paymentId,
                        status: 'pending',
                        status_detail: 'pending_waiting_payment',
                        transaction_amount: 0
                    };
                }
                throw new Error(errorMsg);
            }
            
            // Se a resposta tem warning sobre webhook, logar mas continuar
            if (result.warning) {
                console.info('ℹ️', result.warning);
            }

            const data = result.data;

            // Atualizar cache local
            if (data.status === 'approved' || data.status === 'paid') {
                this.saveTransaction(paymentId, {
                    amount: data.transaction_amount || data.amount,
                    status: 'approved',
                    approvedAt: Date.now()
                });
            }

            return {
                id: data.id || paymentId,
                status: data.status === 'paid' ? 'approved' : data.status,
                status_detail: data.status === 'paid' || data.status === 'approved' ? 'accredited' : (data.status_detail || 'pending_waiting_payment'),
                transaction_amount: data.transaction_amount || data.amount
            };
        } catch (error) {
            const errorMessage = error.message || error.toString();
            // Não logar erro se for erro de rota não encontrada (pode ser esperado)
            if (!errorMessage.includes('route') || !errorMessage.includes('not be found')) {
                console.error('Erro ao verificar pagamento:', error);
            }

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

    // Salvar transação no localStorage
    saveTransaction(paymentId, data) {
        try {
            const transactions = JSON.parse(localStorage.getItem('pushinpay_transactions') || '{}');
            transactions[paymentId] = {
                ...transactions[paymentId],
                ...data,
                updatedAt: Date.now()
            };
            localStorage.setItem('pushinpay_transactions', JSON.stringify(transactions));
        } catch (e) {
            console.warn('Erro ao salvar transação localmente:', e);
        }
    }

    // Obter transação do localStorage
    getTransaction(paymentId) {
        try {
            const transactions = JSON.parse(localStorage.getItem('pushinpay_transactions') || '{}');
            return transactions[paymentId] || null;
        } catch (e) {
            return null;
        }
    }

    // Método mantido para compatibilidade (não faz mais nada, backend cuida de tudo)
    async ensureAdminConfigLoaded(forceRefresh = true) {
        // Não precisa mais carregar configs do admin no frontend.
        // O backend busca as credenciais do banco SQLite diretamente.
        return;
    }

    // Método mantido para compatibilidade
    async ensureRevendedorConfigLoaded(userId) {
        // Não precisa mais carregar configs do revendedor no frontend.
        // O backend busca as credenciais do banco SQLite diretamente.
        return;
    }

    // Método mantido para compatibilidade
    getCredentials(userId = null, isAdmin = false) {
        return { token: null };
    }
}

// Export singleton
const pushinPay = new PushinPayIntegration();
