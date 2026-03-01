class RecargaAPI {
    constructor() {
        this.baseURL = null;
        this.apiKey = null;
        // Proxy no servidor (usa API Key salva no SQLite)
        this.proxyURL = '/api/recargaexpress.php';
    }

    setApiKey(key) {
        this.apiKey = key;
    }

    setBaseURL(url) {
        this.baseURL = url;
    }

    async request(endpoint, options = {}) {
        const method = (options.method || 'GET').toUpperCase();
        const bodyStr = options.body;
        let bodyObj = null;
        if (bodyStr && typeof bodyStr === 'string') {
            try { bodyObj = JSON.parse(bodyStr); } catch (_) { bodyObj = null; }
        } else if (bodyStr && typeof bodyStr === 'object') {
            bodyObj = bodyStr;
        }

        // 1) Tentar via proxy do servidor (fonte da verdade, funciona em qualquer dispositivo)
        try {
            const resp = await fetch(this.proxyURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint, method, body: bodyObj })
            });

            const data = await resp.json();

            // A API original já retorna {success, data, message...}
            if (!resp.ok) {
                throw new Error(data?.message || data?.error || `Erro ${resp.status}`);
            }
            return data;
        } catch (proxyError) {
            // 2) Fallback para chamada direta (modo legado) se tiver config no navegador
            if (!this.apiKey || !this.baseURL) {
                throw new Error(proxyError?.message || 'API indisponível e não há configuração local.');
            }

            const url = `${this.baseURL}${endpoint}`;
            const headers = {
                'Content-Type': 'application/json',
                'X-API-Key': this.apiKey,
                ...options.headers
            };

            try {
                const response = await fetch(url, {
                    ...options,
                    headers
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `Erro ${response.status}: ${response.statusText}`);
                }

                return data;
            } catch (error) {
                throw new Error(`Erro na requisição: ${error.message}`);
            }
        }
    }

    async getProfile() {
        return this.request('/v1/me');
    }

    async getBalance() {
        return this.request('/v1/me/balance');
    }

    async getCatalog() {
        return this.request('/v1/catalog');
    }

    async getOrders(page = 1, limit = 15) {
        return this.request(`/v1/me/orders?page=${page}&limit=${limit}`);
    }

    async getOrder(id) {
        return this.request(`/v1/me/orders/${id}`);
    }

    async checkPhone(phoneNumber, carrierId = null) {
        const body = { phoneNumber };
        if (carrierId) {
            body.carrierId = carrierId;
        }
        return this.request('/v1/utils/check-phone', {
            method: 'POST',
            body: JSON.stringify(body)
        });
    }

    async createRecharge(rechargeData) {
        return this.request('/v1/recharges', {
            method: 'POST',
            body: JSON.stringify(rechargeData)
        });
    }
}

const api = new RecargaAPI();

