/**
 * storage.js — Salve Comida (v2)
 * CRUD centralizado para todos os modelos:
 *   foods, requests, users, notifications, ongs
 */

const Storage = (() => {
  const KEYS = {
    foods:    'salvecomida_foods',
    requests: 'salvecomida_requests',
    users:    'salvecomida_users',
    session:  'salvecomida_session',
    notifs:   'salvecomida_notifs',
    ongs:     'salvecomida_ongs',
  };

  /* ─────────────────────────────────────────
     ALIMENTOS
  ───────────────────────────────────────── */
  function getFoods()         { return _get(KEYS.foods, []); }
  function saveFoods(d)       { _set(KEYS.foods, d); }
  function getFoodById(id)    { return getFoods().find(f => f.id === id) || null; }

  function addFood(food) {
    const list = getFoods();
    food.id = _uid('food');
    food.createdAt = _now();
    food.status = 'available';
    list.push(food);
    saveFoods(list);
    return food;
  }

  function updateFood(id, updates) {
    const list = getFoods();
    const i = list.findIndex(f => f.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...updates };
    saveFoods(list);
    return list[i];
  }

  function deleteFood(id) { saveFoods(getFoods().filter(f => f.id !== id)); }

  /* ─────────────────────────────────────────
     SOLICITAÇÕES
  ───────────────────────────────────────── */
  function getRequests()          { return _get(KEYS.requests, []); }
  function saveRequests(d)        { _set(KEYS.requests, d); }
  function getRequestsByFood(fid) { return getRequests().filter(r => r.foodId === fid); }
  function getRequestsByUser(uid) { return getRequests().filter(r => r.userId === uid); }

  function addRequest(req) {
    const list = getRequests();
    req.id = _uid('req');
    req.createdAt = _now();
    req.status = 'pending';
    list.push(req);
    saveRequests(list);
    return req;
  }

  function updateRequest(id, updates) {
    const list = getRequests();
    const i = list.findIndex(r => r.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...updates };
    saveRequests(list);
    return list[i];
  }

  /* ─────────────────────────────────────────
     USUÁRIOS / AUTENTICAÇÃO
  ───────────────────────────────────────── */
  function getUsers()      { return _get(KEYS.users, []); }
  function saveUsers(d)    { _set(KEYS.users, d); }
  function getUserById(id) { return getUsers().find(u => u.id === id) || null; }
  function getUserByEmail(email) {
    return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  function registerUser(data) {
    if (getUserByEmail(data.email)) return { ok: false, msg: 'Este e-mail já está cadastrado.' };
    const user = {
      id:        _uid('usr'),
      name:      data.name.trim(),
      email:     data.email.trim().toLowerCase(),
      password:  _hashSimple(data.password), // hash simples (não use em produção!)
      phone:     data.phone || '',
      role:      data.role || 'user',        // user | donor | ong | admin
      ongId:     data.ongId || null,
      avatar:    data.avatar || '',
      createdAt: _now(),
      verified:  false,                      // simulado — em prod: e-mail real
      verifyToken: _uid('tok'),
    };
    const list = getUsers();
    list.push(user);
    saveUsers(list);
    // Simula envio de e-mail de verificação
    addNotification({
      userId: user.id,
      type: 'system',
      title: 'Bem-vindo ao Salve Comida! 🌱',
      body: `Olá ${user.name}! Sua conta foi criada. Clique em "Verificar e-mail" no painel para ativar.`,
      link: '',
    });
    return { ok: true, user };
  }

  function loginUser(email, password) {
    const user = getUserByEmail(email);
    if (!user) return { ok: false, msg: 'E-mail não encontrado.' };
    if (user.password !== _hashSimple(password)) return { ok: false, msg: 'Senha incorreta.' };
    _set(KEYS.session, { userId: user.id, loginAt: _now() });
    return { ok: true, user };
  }

  function logoutUser() { localStorage.removeItem(KEYS.session); }

  function getSession() {
    const s = _get(KEYS.session, null);
    if (!s) return null;
    return getUserById(s.userId);
  }

  function updateUser(id, updates) {
    const list = getUsers();
    const i = list.findIndex(u => u.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...updates };
    saveUsers(list);
    // Atualiza sessão se for o mesmo
    const sess = _get(KEYS.session, null);
    if (sess && sess.userId === id) _set(KEYS.session, sess);
    return list[i];
  }

  /* ─────────────────────────────────────────
     NOTIFICAÇÕES
  ───────────────────────────────────────── */
  function getNotifications(userId) {
    return _get(KEYS.notifs, []).filter(n => n.userId === userId);
  }

  function addNotification(n) {
    const list = _get(KEYS.notifs, []);
    n.id = _uid('ntf');
    n.createdAt = _now();
    n.read = false;
    list.unshift(n);
    // Mantém máx 50 por usuário
    const filtered = list.filter(x => x.userId === n.userId).slice(0, 50);
    const others   = list.filter(x => x.userId !== n.userId);
    _set(KEYS.notifs, [...filtered, ...others]);
    return n;
  }

  function markNotifRead(id) {
    const list = _get(KEYS.notifs, []);
    const i = list.findIndex(n => n.id === id);
    if (i !== -1) { list[i].read = true; _set(KEYS.notifs, list); }
  }

  function markAllNotifsRead(userId) {
    const list = _get(KEYS.notifs, []).map(n =>
      n.userId === userId ? { ...n, read: true } : n
    );
    _set(KEYS.notifs, list);
  }

  function unreadCount(userId) {
    return _get(KEYS.notifs, []).filter(n => n.userId === userId && !n.read).length;
  }

  /* ─────────────────────────────────────────
     ONGs PARCEIRAS
  ───────────────────────────────────────── */
  function getOngs()       { return _get(KEYS.ongs, []); }
  function saveOngs(d)     { _set(KEYS.ongs, d); }
  function getOngById(id)  { return getOngs().find(o => o.id === id) || null; }

  function addOng(ong) {
    const list = getOngs();
    ong.id = _uid('ong');
    ong.createdAt = _now();
    ong.status = 'pending'; // pending | active | suspended
    ong.totalReceived = 0;
    ong.totalKg = 0;
    list.push(ong);
    saveOngs(list);
    return ong;
  }

  function updateOng(id, updates) {
    const list = getOngs();
    const i = list.findIndex(o => o.id === id);
    if (i === -1) return null;
    list[i] = { ...list[i], ...updates };
    saveOngs(list);
    return list[i];
  }

  /* ─────────────────────────────────────────
     SEED DADOS
  ───────────────────────────────────────── */
  function seedIfEmpty() {
    _seedFoods();
    _seedOngs();
    _seedAdminUser();
  }

  function _seedFoods() {
    if (getFoods().length > 0) return;
    const seeds = [
      { id:'seed_1', donorName:'Padaria Pão Bom', donorType:'bakery', contact:'paobom@email.com', foodName:'Pães variados', category:'breads', description:'Pães franceses, de queijo e doces produzidos hoje cedo. Fresquinhos e prontos para consumo.', quantity:'20 unidades', expiryDate:_futureDate(1), foodState:'fresh', location:'Centro', lat:-23.5505, lng:-46.6333, deliveryOption:'local', observations:'Retirar até as 18h.', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
      { id:'seed_2', donorName:'Restaurante Sabor Caseiro', donorType:'restaurant', contact:'saborcaseiro@email.com', foodName:'Marmitas prontas', category:'meals', description:'Marmitas com arroz, feijão, carne e legumes. Preparadas hoje.', quantity:'10 unidades', expiryDate:_futureDate(0), foodState:'fresh', location:'Bairro Norte', lat:-23.5320, lng:-46.6250, deliveryOption:'delivery', observations:'Podemos entregar.', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
      { id:'seed_3', donorName:'Mercado União', donorType:'market', contact:'(11) 99999-1234', foodName:'Frutas variadas', category:'fruits', description:'Mix de maçãs, bananas e laranjas. Frutas maduras, perfeitas para consumo imediato.', quantity:'5 kg', expiryDate:_futureDate(2), foodState:'nearexpiry', location:'Bairro Sul', lat:-23.5690, lng:-46.6420, deliveryOption:'local', observations:'Trazer sacolas.', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
      { id:'seed_4', donorName:'Comunidade Local', donorType:'person', contact:'comunidade@email.com', foodName:'Leite longa vida', category:'dairy', description:'Caixas de leite integral 1L fechadas, dentro do prazo.', quantity:'8 unidades', expiryDate:_futureDate(25), foodState:'new', location:'Centro', lat:-23.5480, lng:-46.6380, deliveryOption:'negotiate', observations:'', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
      { id:'seed_5', donorName:'Empresa Alimentos SA', donorType:'company', contact:'doacoes@alimentossa.com', foodName:'Enlatados variados', category:'canned', description:'Latas de milho, ervilha, extrato de tomate e atum. Estoque excedente.', quantity:'30 unidades', expiryDate:_futureDate(180), foodState:'new', location:'Zona Industrial', lat:-23.5900, lng:-46.6550, deliveryOption:'negotiate', observations:'Disponível dias úteis 8h–17h.', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
      { id:'seed_6', donorName:'ONG Mãos Abertas', donorType:'company', contact:'maosabertas@ong.org', foodName:'Cestas básicas', category:'canned', description:'Cestas com arroz, feijão, macarrão, óleo e sal. Para famílias em vulnerabilidade.', quantity:'15 cestas', expiryDate:_futureDate(60), foodState:'new', location:'Zona Leste', lat:-23.5450, lng:-46.5900, deliveryOption:'delivery', observations:'Agendar retirada por e-mail.', image:'', status:'available', createdAt:_now(), userId:'admin_1' },
    ];
    saveFoods(seeds);
  }

  function _seedOngs() {
    if (getOngs().length > 0) return;
    const ongs = [
      { id:'ong_1', name:'ONG Mãos Abertas', cnpj:'12.345.678/0001-99', email:'maosabertas@ong.org', phone:'(11) 3333-4444', address:'Rua da Esperança, 100 – Zona Leste, SP', lat:-23.5450, lng:-46.5900, description:'Atendemos famílias em vulnerabilidade alimentar há 15 anos. Distribuímos cestas e refeições diariamente.', focus:'Segurança alimentar e nutrição', capacity:'150 famílias/mês', logo:'🤲', status:'active', totalReceived:240, totalKg:1800, joinedAt:'2024-01-10', userId:'ong_usr_1' },
      { id:'ong_2', name:'Instituto Sem Fome', cnpj:'98.765.432/0001-11', email:'contato@semfome.org.br', phone:'(11) 4444-5555', address:'Av. Solidária, 500 – Centro, SP', lat:-23.5505, lng:-46.6333, description:'Resgatamos alimentos excedentes de supermercados e restaurantes para distribuir a populações de rua e famílias carentes.', focus:'Resgate e redistribuição de alimentos', capacity:'300 refeições/dia', logo:'🍽️', status:'active', totalReceived:520, totalKg:3200, joinedAt:'2024-03-05', userId:'ong_usr_2' },
      { id:'ong_3', name:'Casa do Bem', cnpj:'11.222.333/0001-44', email:'casadobem@email.com', phone:'(11) 5555-6666', address:'Rua da Paz, 78 – Bairro Sul, SP', lat:-23.5690, lng:-46.6420, description:'Abrigo para mulheres e crianças em situação de risco. Oferecemos alimentação, acolhimento e suporte psicossocial.', focus:'Acolhimento e alimentação', capacity:'80 pessoas/mês', logo:'🏠', status:'active', totalReceived:180, totalKg:950, joinedAt:'2024-05-20', userId:'ong_usr_3' },
      { id:'ong_4', name:'Rede Solidária SP', cnpj:'55.666.777/0001-88', email:'rede@solidariasp.org', phone:'(11) 7777-8888', address:'Rua das Flores, 200 – Bairro Norte, SP', lat:-23.5320, lng:-46.6250, description:'Rede de voluntários que conecta doadores a comunidades periféricas. Operamos em 12 bairros.', focus:'Distribuição em periferias', capacity:'200 famílias/mês', logo:'🌐', status:'pending', totalReceived:0, totalKg:0, joinedAt:_now().split('T')[0], userId:'ong_usr_4' },
    ];
    saveOngs(ongs);
  }

  function _seedAdminUser() {
    if (getUserByEmail('admin@salvecomida.com')) return;
    const admin = {
      id: 'admin_1',
      name: 'Admin Salve Comida',
      email: 'admin@salvecomida.com',
      password: _hashSimple('admin123'),
      phone: '(11) 98765-4321',
      role: 'admin',
      ongId: null,
      avatar: '',
      createdAt: _now(),
      verified: true,
      verifyToken: '',
    };
    const list = getUsers();
    list.push(admin);
    saveUsers(list);
  }

  /* ─────────────────────────────────────────
     HELPERS PRIVADOS
  ───────────────────────────────────────── */
  function _get(key, fallback) {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : fallback; }
    catch { return fallback; }
  }
  function _set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function _uid(prefix) { return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2,6); }
  function _now() { return new Date().toISOString(); }
  function _futureDate(days) { const d=new Date(); d.setDate(d.getDate()+days); return d.toISOString().split('T')[0]; }

  // Hash simples XOR — NÃO usar em produção real
  function _hashSimple(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    return 'h' + Math.abs(h).toString(16);
  }

  /* ─────────────────────────────────────────
     MÉTRICAS DE IMPACTO
  ───────────────────────────────────────── */
  function getImpactMetrics() {
    const foods    = getFoods();
    const requests = getRequests();
    const ongs     = getOngs();

    const donated  = foods.filter(f => f.status === 'closed' || f.status === 'reserved').length;
    const doneReqs = requests.filter(r => r.status === 'done').length;
    const activeOngs = ongs.filter(o => o.status === 'active').length;

    // Estimativas simuladas baseadas nos dados
    const kgSaved = donated * 2.5 + doneReqs * 1.8;
    const co2     = kgSaved * 2.5;   // ~2.5kg CO2 por kg alimento
    const families = Math.floor(doneReqs * 1.3);
    const meals    = doneReqs * 4;

    // Histórico mensal (últimos 6 meses — simulado)
    const months = _last6Months();
    const monthlyData = months.map((m, i) => ({
      month: m,
      donations: Math.max(0, Math.floor((donated + i * 2) * (0.5 + Math.random() * 0.8))),
      requests:  Math.max(0, Math.floor((doneReqs + i * 3) * (0.4 + Math.random() * 0.9))),
      kg:        Math.max(0, Math.floor(kgSaved * (0.3 + Math.random() * 0.5))),
    }));

    const byCategory = {};
    foods.forEach(f => {
      byCategory[f.category] = (byCategory[f.category] || 0) + 1;
    });

    return { donated, doneReqs, activeOngs, kgSaved: Math.round(kgSaved), co2: Math.round(co2), families, meals, monthlyData, byCategory, totalFoods: foods.length, totalRequests: requests.length };
  }

  function _last6Months() {
    const labels = [];
    const names = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    const d = new Date();
    for (let i = 5; i >= 0; i--) {
      const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
      labels.push(names[m.getMonth()] + '/' + String(m.getFullYear()).slice(2));
    }
    return labels;
  }

  return {
    // foods
    getFoods, addFood, updateFood, deleteFood, getFoodById,
    // requests
    getRequests, addRequest, updateRequest, getRequestsByFood, getRequestsByUser,
    // auth
    getUsers, getUserById, getUserByEmail, registerUser, loginUser, logoutUser, getSession, updateUser,
    // notifs
    getNotifications, addNotification, markNotifRead, markAllNotifsRead, unreadCount,
    // ongs
    getOngs, addOng, updateOng, getOngById,
    // metrics
    getImpactMetrics,
    // seed
    seedIfEmpty,
  };
})();
