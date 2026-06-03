/**
 * requests.js — Salve Comida
 * Lógica das páginas de receber alimentos e minhas solicitações.
 */

// ============================================================
// PÁGINA: receber.html — Alimentos disponíveis
// ============================================================
function initReceiveFood() {
 const container = document.getElementById('foods-grid');
 if (!container) return;

 renderFoods();

 // Filtros
 ['search-input','filter-category','filter-location','filter-status','sort-by'].forEach(id =>{
 const el = document.getElementById(id);
 if (el) el.addEventListener('input', renderFoods);
 if (el) el.addEventListener('change', renderFoods);
 });

 // Modal de solicitação
 initRequestModal();
}

function renderFoods() {
 const container = document.getElementById('foods-grid');
 let foods = Storage.getFoods();

 const search = (document.getElementById('search-input') || {}).value || '';
 const category = (document.getElementById('filter-category') || {}).value || '';
 const location = (document.getElementById('filter-location') || {}).value || '';
 const status = (document.getElementById('filter-status') || {}).value || '';
 const sortBy = (document.getElementById('sort-by') || {}).value || '';

 if (search) foods = foods.filter(f =>f.foodName.toLowerCase().includes(search.toLowerCase()) || (f.description || '').toLowerCase().includes(search.toLowerCase()));
 if (category) foods = foods.filter(f =>f.category === category);
 if (location) foods = foods.filter(f =>f.location.toLowerCase().includes(location.toLowerCase()));
 if (status) foods = foods.filter(f =>f.status === status);

 if (sortBy === 'expiry') {
 foods.sort((a, b) =>(a.expiryDate || '').localeCompare(b.expiryDate || ''));
 } else if (sortBy === 'name') {
 foods.sort((a, b) =>a.foodName.localeCompare(b.foodName));
 } else if (sortBy === 'newest') {
 foods.sort((a, b) =>(b.createdAt || '').localeCompare(a.createdAt || ''));
 }

 const countEl = document.getElementById('results-count');
 if (countEl) countEl.textContent = `${foods.length} item(s) encontrado(s)`;

 if (foods.length === 0) {
 container.innerHTML = `
 <div class="empty-state" style="grid-column:1/-1">
 <div class="empty-icon"></div>
 <h3>Nenhum alimento encontrado</h3>
 <p>Tente ajustar os filtros ou volte mais tarde.</p>
 </div>`;
 return;
 }

 container.innerHTML = foods.map(food =>buildFoodCard(food)).join('');
}

function buildFoodCard(food) {
 const days = App.daysUntil(food.expiryDate);
 const urgentClass = (days !== null && days <= 1) ? 'style="color:#dc2626;font-weight:600"' : '';

 return `
 <div class="food-card fade-in">
 <div class="food-card-img">
 ${App.foodImageHtml(food, 'w-full')}
 </div>
 <div class="food-card-body">
 <div class="food-card-title">${escHtmlR(food.foodName)}</div>
 <div style="margin-bottom:0.25rem">${App.foodBadge(food.status)}</div>
 <div class="food-card-meta">
 <div class="food-meta-row"><strong>${App.categoryLabel(food.category)}</strong></div>
 <div class="food-meta-row"><strong>${escHtmlR(food.quantity)}</strong></div>
 <div class="food-meta-row">${escHtmlR(food.location)}</div>
 <div class="food-meta-row">${escHtmlR(food.donorName)}</div>
 <div class="food-meta-row" ${urgentClass}>
 Limite: ${App.formatDate(food.expiryDate)}
 ${days !== null && days >= 0 ? `<em style="font-size:0.75rem;color:inherit">(${days === 0 ? 'hoje!' : days + 'd'})</em>` : ''}
 </div>
 <div class="food-meta-row">${App.deliveryLabel(food.deliveryOption)}</div>
 </div>
 ${food.description ? `<p style="font-size:0.83rem;margin-top:0.5rem;color:var(--grey-mid)">${escHtmlR(food.description)}</p>` : ''}
 </div>
 <div class="food-card-footer">
 <span style="font-size:0.8rem;color:var(--grey-mid)">${App.foodStateLabel(food.foodState)}</span>
 ${food.status !== 'closed'
 ? `<button class="btn btn-secondary btn-sm" onclick="openRequest('${food.id}')">Solicitar</button>`
 : `<span class="badge badge-closed">Encerrado</span>`
 }
 </div>
 </div>`;
}

// ---- Modal de Solicitação ----
let _currentFoodId = null;

function openRequest(foodId) {
 const food = Storage.getFoodById(foodId);
 if (!food) return;
 _currentFoodId = foodId;

 document.getElementById('req-food-name').textContent = food.foodName;
 document.getElementById('req-food-qty').textContent = food.quantity;
 document.getElementById('req-food-donor').textContent = food.donorName;
 document.getElementById('req-food-local').textContent = food.location;
 document.getElementById('req-food-expiry').textContent = App.formatDate(food.expiryDate);

 const deliveryRow = document.getElementById('req-delivery-row');
 if (deliveryRow) {
 deliveryRow.style.display = food.deliveryOption !== 'local' ? '' : 'none';
 }

 const form = document.getElementById('request-form');
 if (form) form.reset();
 document.getElementById('req-alert').innerHTML = '';

 openModalR('request-modal');
}

function initRequestModal() {
 const form = document.getElementById('request-form');
 if (!form) return;

 App.clearErrorOnInput(form);

 form.addEventListener('submit', e =>{
 e.preventDefault();
 if (!App.validateRequired(form)) {
 App.showAlert('req-alert', 'error', 'Preencha todos os campos obrigatórios.');
 return;
 }

 const food = Storage.getFoodById(_currentFoodId);
 if (!food) return;

 const req = {
 foodId: _currentFoodId,
 foodName: food.foodName,
 donorName: food.donorName,
 requesterName: form['req-name'].value.trim(),
 contact: form['req-contact'].value.trim(),
 qty: form['req-qty'].value.trim(),
 message: form['req-message'].value.trim(),
 mode: form['req-mode'].value,
 };

 Storage.addRequest(req);

 // Verifica se deve reservar
 const allReqs = Storage.getRequestsByFood(_currentFoodId);
 if (allReqs.length >0 && food.status === 'available') {
 Storage.updateFood(_currentFoodId, { status: 'reserved' });
 }

 App.showAlert('req-alert', 'success', ' Solicitação enviada! O doador entrará em contato em breve.');

 setTimeout(() =>{
 closeModalR('request-modal');
 renderFoods();
 }, 2500);
 });
}

function openModalR(id) {
 const el = document.getElementById(id);
 if (el) el.classList.add('open');
}

function closeModalR(id) {
 const el = document.getElementById(id);
 if (el) el.classList.remove('open');
}

// ============================================================
// PÁGINA: minhas-solicitacoes.html
// ============================================================
function initMyRequests() {
 const container = document.getElementById('my-requests-list');
 if (!container) return;
 renderMyRequests();
}

function renderMyRequests() {
 const container = document.getElementById('my-requests-list');
 const requests = Storage.getRequests();

 if (requests.length === 0) {
 container.innerHTML = `
 <div class="empty-state">
 <div class="empty-icon"></div>
 <h3>Nenhuma solicitação ainda</h3>
 <p>Explore os alimentos disponíveis e faça sua primeira solicitação.</p>
 <a href="receber.html" class="btn btn-primary mt-2">Ver alimentos</a>
 </div>`;
 return;
 }

 // Agrupa por status para melhor visualização
 const sorted = [...requests].sort((a, b) =>(b.createdAt || '').localeCompare(a.createdAt || ''));

 container.innerHTML = sorted.map(r =>buildRequestCard(r)).join('');
}

function buildRequestCard(r) {
 return `
 <div class="request-card fade-in" id="reqcard-${r.id}">
 <div class="request-card-header">
 <div>
 <strong style="font-size:1rem;font-family:var(--font-display)">${escHtmlR(r.foodName)}</strong>
 <div style="font-size:0.8rem;color:var(--grey-mid);margin-top:0.15rem">Doador: ${escHtmlR(r.donorName)} · ${App.formatDatetime(r.createdAt)}</div>
 </div>
 ${App.reqBadge(r.status)}
 </div>
 <div class="request-card-body">
 <div class="request-info-grid">
 <div class="request-info-item"><label>Solicitante</label><span>${escHtmlR(r.requesterName)}</span></div>
 <div class="request-info-item"><label>Contato</label><span>${escHtmlR(r.contact)}</span></div>
 <div class="request-info-item"><label>Quantidade solicitada</label><span>${escHtmlR(r.qty)}</span></div>
 <div class="request-info-item"><label>Modalidade</label><span>${r.mode === 'delivery' ? ' Entrega' : ' Retirada'}</span></div>
 </div>
 ${r.message ? `<div style="background:var(--grey-pale);border-radius:8px;padding:0.75rem;font-size:0.88rem;color:var(--grey-mid)">"${escHtmlR(r.message)}"</div>` : ''}
 </div>
 <div class="request-actions">
 ${r.status === 'pending' ? `
 <button class="btn btn-primary btn-sm" onclick="updateReqStatus('${r.id}','accepted')">Aceitar</button>
 <button class="btn btn-danger btn-sm" onclick="updateReqStatus('${r.id}','refused')">Recusar</button>
 ` : ''}
 ${r.status === 'accepted' ? `
 <button class="btn btn-sm" style="background:var(--green-pale);color:var(--green-dark)" onclick="updateReqStatus('${r.id}','done')">Marcar como finalizado</button>
 ` : ''}
 ${['refused','done'].includes(r.status) ? `<span style="font-size:0.85rem;color:var(--grey-mid)">Nenhuma ação disponível.</span>` : ''}
 </div>
 </div>`;
}

function updateReqStatus(id, status) {
 Storage.updateRequest(id, { status });
 renderMyRequests();
 App.showAlert('my-requests-alert', 'success', 'Status do pedido atualizado.');
}

// ---- Escape HTML (local) ----
function escHtmlR(str) {
 if (!str) return '';
 return String(str)
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;');
}
