/**
 * Database - Banco único no servidor (SQLite via api/data.php)
 * Tudo que for criado fica salvo no servidor e visível para todos que entram no site.
 * Usa cache em memória para leituras síncronas; escritas são async e atualizam o servidor.
 */

// Sempre usar caminho absoluto da raiz do site (funciona em / e em /recarga/)
const DATA_API = '/api/data.php';

class Database {
    constructor() {
        this._cache = { users: [], saldos: {}, recargas: [], catalogs: {}, transactions: [] };
        this._ready = null;
    }

    async _req(action, params = {}, method = 'GET') {
        const isGet = method === 'GET';
        const baseUrl = DATA_API.startsWith('http') ? DATA_API : ((typeof location !== 'undefined' ? location.origin : '') + DATA_API);
        const url = isGet
            ? `${baseUrl}?action=${encodeURIComponent(action)}&` + new URLSearchParams(params).toString()
            : baseUrl;
        const opt = {
            method: isGet ? 'GET' : 'POST',
            headers: { 'Content-Type': 'application/json' }
        };
        if (!isGet) opt.body = JSON.stringify({ action, ...params });
        const r = await fetch(url, opt);
        if (!r.ok) {
            throw new Error('Servidor retornou ' + r.status + '. Verifique se o Apache está rodando.');
        }
        const text = await r.text();
        if (!text || text.trim() === '') {
            throw new Error('Servidor não retornou dados. Verifique se o Apache/PHP está rodando.');
        }
        let j;
        try {
            j = JSON.parse(text);
        } catch (e) {
            console.error('Resposta inválida:', text.substring(0, 200));
            throw new Error('Resposta inválida do servidor. Verifique o console.');
        }
        if (!j.success) throw new Error(j.error || 'Erro na API');
        return j.data;
    }

    /** Inicializa o cache a partir do servidor. Deve ser aguardado antes de usar. */
    async init() {
        if (this._ready) return this._ready;
        this._ready = (async () => {
            try {
                const s = await this._req('state_getAll');
                this._cache.users = Array.isArray(s.users) ? s.users : [];
                this._cache.saldos = s.saldos && typeof s.saldos === 'object' ? s.saldos : {};
                this._cache.recargas = Array.isArray(s.recargas) ? s.recargas : [];
                this._cache.catalogs = s.catalogs && typeof s.catalogs === 'object' ? s.catalogs : {};
                this._cache.transactions = Array.isArray(s.transactions) ? s.transactions : [];

                // Migração única: localStorage (users/saldos) -> servidor (preserva IDs e links de recarga)
                // Importante: não gravar nada persistente no navegador.
                // A marcação de migração fica só na sessão atual (aba) via sessionStorage.
                if (typeof localStorage !== 'undefined' && typeof sessionStorage !== 'undefined' && sessionStorage.getItem('migrated_users_v1') !== '1') {
                    try {
                        const raw = localStorage.getItem('users') || localStorage.getItem('revendedores');
                        if (raw) {
                            const arr = JSON.parse(raw);
                            const list = Array.isArray(arr) ? arr : (Array.isArray(arr?.revendedores) ? arr.revendedores : (Array.isArray(arr?.users) ? arr.users : []));
                            for (const u of list) {
                                if ((u.type || '') !== 'revendedor' || !u.id) continue;
                                if (this._cache.users.some(x => String(x.id) === String(u.id))) continue;
                                try {
                                    await this._req('user_create', { id: String(u.id), username: u.username, password: u.password || '', type: 'revendedor', nome: u.nome || '', email: u.email || '' }, 'POST');
                                    this._cache.users.push({ ...u, id: String(u.id), active: u.active !== false });
                                    this._cache.saldos[String(u.id)] = this._cache.saldos[String(u.id)] ?? 0;
                                } catch (err) { console.warn('Migrate user', u.username, err); }
                            }
                        }
                        const saldosRaw = localStorage.getItem('saldos');
                        if (saldosRaw) {
                            try {
                                const obj = JSON.parse(saldosRaw);
                                if (obj && typeof obj === 'object') {
                                    for (const [uid, val] of Object.entries(obj)) {
                                        try {
                                            await this._req('saldo_set', { userId: String(uid), valor: Number(val) || 0 }, 'POST');
                                            this._cache.saldos[String(uid)] = Number(val) || 0;
                                        } catch (err) { console.warn('Migrate saldo', uid, err); }
                                    }
                                }
                            } catch (err) { console.warn('Migrate saldos parse', err); }
                        }
                        sessionStorage.setItem('migrated_users_v1', '1');
                    } catch (e) { console.warn('Migration localStorage', e); }
                }
            } catch (e) {
                console.error('Database init:', e);
                this._cache = { users: [], saldos: {}, recargas: [], catalogs: {}, transactions: [] };
                throw e;
            }
        })();
        return this._ready;
    }

    // --- Users (leituras do cache) ---
    getUser(username) {
        return this._cache.users.find(u => u.username === username) || null;
    }

    getUserById(id) {
        const sid = String(id || '').trim();
        return this._cache.users.find(u => String(u.id) === sid) || null;
    }

    getAllUsers() {
        return Array.isArray(this._cache.users) ? [...this._cache.users] : [];
    }

    getRevendedores() {
        return this._cache.users.filter(u => u.type === 'revendedor');
    }

    async createUser(userData) {
        const body = { username: userData.username, password: userData.password, type: userData.type, nome: userData.nome, email: userData.email || '' };
        if (userData.id != null && userData.id !== '') body.id = String(userData.id);
        const d = await this._req('user_create', body, 'POST');
        const u = { ...d, id: d.id, active: true };
        this._cache.users.push(u);
        if (u.type === 'revendedor') this._cache.saldos[u.id] = 0;
        return u;
    }

    async updateUser(userId, updates) {
        const r = await this._req('user_update', { userId, updates }, 'POST');
        if (r) {
            const i = this._cache.users.findIndex(u => String(u.id) === String(userId));
            if (i >= 0) this._cache.users[i] = { ...this._cache.users[i], ...r };
        }
        return r;
    }

    async deleteUser(userId) {
        await this._req('user_delete', { userId }, 'POST');
        this._cache.users = this._cache.users.filter(u => String(u.id) !== String(userId));
        delete this._cache.saldos[userId];
        delete this._cache.catalogs[userId];
    }

    // --- Saldos ---
    getSaldo(userId) {
        return Number(this._cache.saldos[userId]) || 0;
    }

    async setSaldo(userId, valor) {
        await this._req('saldo_set', { userId, valor: Number(valor) }, 'POST');
        this._cache.saldos[userId] = Number(valor);
    }

    async addSaldo(userId, valor) {
        const v = await this._req('saldo_add', { userId, valor: Number(valor) }, 'POST');
        const saldo = (typeof v === 'object' && v != null && typeof v.saldo === 'number') ? v.saldo : Number(v);
        this._cache.saldos[userId] = saldo;
        return typeof v === 'object' && v != null ? v : saldo;
    }

    /**
     * Adiciona saldo a partir de pagamento PIX aprovado. Idempotente - nunca credita duas vezes.
     * Valor creditado = valor pago (1:1, sem multiplicação).
     */
    async addSaldoFromPayment(paymentId, userId, valor, module = 'mercadopago') {
        const res = await this._req('saldo_addFromPayment', {
            paymentId: String(paymentId),
            userId: String(userId),
            valor: Number(valor),
            module: String(module)
        }, 'POST');
        this._cache.saldos[userId] = Number(res.saldo);
        // Atualizar cache de transações
        const tx = { id: paymentId, userId, type: 'add_saldo', amount: valor, status: 'approved', approved: true, module, createdAt: new Date().toISOString() };
        const idx = (this._cache.transactions || []).findIndex(t => String(t.id) === String(paymentId));
        if (idx >= 0) this._cache.transactions[idx] = tx;
        else this._cache.transactions.push(tx);
        return res;
    }

    async subtractSaldo(userId, valor) {
        const v = await this._req('saldo_subtract', { userId, valor: Number(valor) }, 'POST');
        this._cache.saldos[userId] = Number(v);
        return v;
    }

    getTotalSaldoEmUso() {
        return Object.values(this._cache.saldos || {}).reduce((s, v) => s + (Number(v) || 0), 0);
    }

    // --- Recargas ---
    getAllRecargas() {
        return Array.isArray(this._cache.recargas) ? [...this._cache.recargas] : [];
    }

    getRecargasByUser(userId) {
        return (this._cache.recargas || []).filter(r => r.userId === userId);
    }

    async createRecarga(recargaData) {
        const id = (Date.now()).toString();
        const rec = { id, ...recargaData, createdAt: new Date().toISOString() };
        await this._req('recarga_create', rec, 'POST');
        this._cache.recargas.push(rec);
        return rec;
    }

    async updateRecarga(recargaId, updates) {
        const r = await this._req('recarga_update', { recargaId, updates }, 'POST');
        if (r) {
            const i = this._cache.recargas.findIndex(x => x.id === recargaId);
            if (i >= 0) this._cache.recargas[i] = { ...this._cache.recargas[i], ...updates };
        }
        return r;
    }

    getTotalRecargas() { return (this._cache.recargas || []).length; }

    getTotalGastoByUser(userId) {
        return (this._cache.recargas || [])
            .filter(r => r.userId === userId)
            .reduce((s, r) => s + (Number(r.cost) || 0), 0);
    }

    // --- Catalogs ---
    getCatalog(userId) {
        const c = this._cache.catalogs[String(userId)];
        return Array.isArray(c) ? c : null;
    }

    getAllCatalogs() {
        return { ...(this._cache.catalogs || {}) };
    }

    async setCatalog(userId, catalog) {
        if (!Array.isArray(catalog)) return;
        await this._req('catalog_set', { userId: String(userId), catalog }, 'POST');
        this._cache.catalogs[String(userId)] = catalog;
    }

    async deleteCatalog(userId) {
        await this._req('catalog_delete', { userId }, 'POST');
        delete this._cache.catalogs[String(userId)];
    }

    // --- Transactions (add_saldo PIX, etc.) ---
    getTransactions() {
        return Array.isArray(this._cache.transactions) ? [...this._cache.transactions] : [];
    }

    getTransactionById(id) {
        const sid = String(id || '').trim();
        if (!sid) return null;
        return (this._cache.transactions || []).find(t => String(t.id) === sid) || null;
    }

    async addTransaction(t) {
        const d = await this._req('transaction_add', { id: t.id, userId: t.userId, type: t.type, amount: t.amount, status: t.status, createdAt: t.createdAt || new Date().toISOString(), ...t }, 'POST');
        this._cache.transactions.push(d);
        return d;
    }

    /** Upsert (INSERT OR REPLACE) mantendo dados existentes no cache. */
    async upsertTransaction(id, updates) {
        const sid = String(id || '').trim();
        if (!sid) throw new Error('Transaction id inválido');
        const existing = this.getTransactionById(sid) || {};
        const merged = { ...existing, ...updates, id: sid };
        const d = await this._req(
            'transaction_add',
            { id: merged.id, userId: merged.userId, type: merged.type, amount: merged.amount, status: merged.status, createdAt: merged.createdAt || new Date().toISOString(), ...merged },
            'POST'
        );
        const idx = (this._cache.transactions || []).findIndex(t => String(t.id) === sid);
        if (idx >= 0) this._cache.transactions[idx] = { ...this._cache.transactions[idx], ...d };
        else this._cache.transactions.push(d);
        return d;
    }

    /** Atualiza o cache a partir do servidor (útil após ações em outra aba/dispositivo). */
    async refresh() {
        const s = await this._req('state_getAll');
        this._cache.users = Array.isArray(s.users) ? s.users : [];
        this._cache.saldos = s.saldos && typeof s.saldos === 'object' ? s.saldos : {};
        this._cache.recargas = Array.isArray(s.recargas) ? s.recargas : [];
        this._cache.catalogs = s.catalogs && typeof s.catalogs === 'object' ? s.catalogs : {};
        this._cache.transactions = Array.isArray(s.transactions) ? s.transactions : [];
    }
}

const db = new Database();
