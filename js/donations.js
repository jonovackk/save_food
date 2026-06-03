/**
 * donations.js — Salve Comida
 * Lógica das páginas de doação e minhas doações.
 */

// ============================================================
// PÁGINA: doar.html
// ============================================================
function initDonateForm() {
 const form = document.getElementById('donate-form');
 if (!form) return;

 App.clearErrorOnInput(form);

 // Preview de imagem
 const uploadArea = document.getElementById('img-upload-area');
 const fileInput = document.getElementById('food-image');
 const preview = document.getElementById('img-preview');
 const previewImg = document.getElementById('preview-img');
 const removeBtn = document.getElementById('img-remove');

 if (uploadArea) {
 uploadArea.addEventListener('click', () =>fileInput.click());
 uploadArea.addEventListener('dragover', e =>{ e.preventDefault(); uploadArea.style.borderColor = 'var(--green-light)'; });
 uploadArea.addEventListener('dragleave', () =>{ uploadArea.style.borderColor = ''; });
 uploadArea.addEventListener('drop', e =>{
 e.preventDefault();
 uploadArea.style.borderColor = '';
 if (e.dataTransfer.files[0]) handleImageFile(e.dataTransfer.files[0]);
 });
 }

 if (fileInput) {
 fileInput.addEventListener('change', () =>{
 if (fileInput.files[0]) handleImageFile(fileInput.files[0]);
 });
 }

 function handleImageFile(file) {
 if (!file.type.startsWith('image/')) return;
 const reader = new FileReader();
 reader.onload = e =>{
 previewImg.src = e.target.result;
 preview.style.display = 'block';
 uploadArea.style.display = 'none';
 };
 reader.readAsDataURL(file);
 }

 if (removeBtn) {
 removeBtn.addEventListener('click', () =>{
 previewImg.src = '';
 preview.style.display = 'none';
 uploadArea.style.display = 'block';
 fileInput.value = '';
 });
 }

 // Submit
 form.addEventListener('submit', e =>{
 e.preventDefault();
 if (!App.validateRequired(form)) {
 App.showAlert('donate-alert', 'error', 'Por favor, preencha todos os campos obrigatórios.');
 return;
 }

 const food = {
 donorName: form.donorName.value.trim(),
 donorType: form.donorType.value,
 contact: form.contact.value.trim(),
 foodName: form.foodName.value.trim(),
 category: form.category.value,
 description: form.description.value.trim(),
 quantity: form.quantity.value.trim(),
 expiryDate: form.expiryDate.value,
 foodState: form.foodState.value,
 location: form.location.value.trim(),
 deliveryOption: form.deliveryOption.value,
 observations: form.observations ? form.observations.value.trim() : '',
 image: previewImg ? previewImg.src : '',
 };

 Storage.addFood(food);

 App.showAlert('donate-alert', 'success', ' Doação cadastrada com sucesso! Obrigado pela sua solidariedade.');

 form.reset();
 if (preview) preview.style.display = 'none';
 if (uploadArea) uploadArea.style.display = 'block';
 if (previewImg) previewImg.src = '';

 // Atualiza contador live
 setTimeout(() =>{
 window.location.href = 'minhas-doacoes.html';
 }, 2000);
 });
}

// ============================================================
// PÁGINA: minhas-doacoes.html
// ============================================================
function initMyDonations() {
 const container = document.getElementById('my-donations-list');
 if (!container) return;
 renderMyDonations();
}

function renderMyDonations() {
 const container = document.getElementById('my-donations-list');
 const foods = Storage.getFoods();

 if (foods.length === 0) {
 container.innerHTML = `
 <div class="empty-state">
 <div class="empty-icon"></div>
 <h3>Nenhuma doação cadastrada</h3>
 <p>Que tal fazer sua primeira doação?</p>
 <a href="doar.html" class="btn btn-primary mt-2">Cadastrar doação</a>
 </div>`;
 return;
 }

 container.innerHTML = foods.map(food =>buildMyDonationCard(food)).join('');
 attachMyDonationEvents();
}

function buildMyDonationCard(food) {
 const requests = Storage.getRequestsByFood(food.id);
 const pendingCount = requests.filter(r =>r.status === 'pending').length;

 return `
 <div class="my-donation-card fade-in" id="mycard-${food.id}">
 <div class="my-donation-header">
 <div>
 <div class="my-donation-title">${escHtml(food.foodName)}</div>
 <div style="font-size:0.82rem;color:var(--grey-mid);margin-top:0.2rem">${App.categoryLabel(food.category)} · Cadastrado em ${App.formatDate(food.createdAt ? food.createdAt.split('T')[0] : '')}</div>
 </div>
 <div class="flex items-center gap-1">
 ${App.foodBadge(food.status)}
 ${pendingCount >0 ? `<span class="badge badge-pending">${pendingCount} solicit.</span>` : ''}
 </div>
 </div>
 <div class="my-donation-body">
 <div class="my-donation-img">
 ${App.foodImageHtml(food)}
 </div>
 <div style="flex:1">
 <div class="my-donation-meta">
 <div class="my-donation-meta-item"><strong>Qtd:</strong>${escHtml(food.quantity)}</div>
 <div class="my-donation-meta-item"><strong>Local:</strong>${escHtml(food.location)}</div>
 <div class="my-donation-meta-item"><strong>Limite:</strong>${App.formatDate(food.expiryDate)}</div>
 <div class="my-donation-meta-item"><strong>Entrega:</strong>${App.deliveryLabel(food.deliveryOption)}</div>
 <div class="my-donation-meta-item"><strong>Doador:</strong>${escHtml(food.donorName)}</div>
 <div class="my-donation-meta-item"><strong>Contato:</strong>${escHtml(food.contact)}</div>
 </div>
 ${food.description ? `<p style="font-size:0.88rem;color:var(--grey-mid);margin-top:0.75rem">${escHtml(food.description)}</p>` : ''}
 </div>
 </div>
 <div class="my-donation-footer">
 <select class="form-control" style="width:auto;min-width:160px;padding:0.45rem 0.75rem;font-size:0.88rem" 
 data-action="change-status" data-id="${food.id}">
 <option value="available" ${food.status === 'available' ? 'selected' : ''}>Disponível</option>
 <option value="reserved" ${food.status === 'reserved' ? 'selected' : ''}>Reservado</option>
 <option value="closed" ${food.status === 'closed' ? 'selected' : ''}>Encerrado</option>
 </select>
 <button class="btn btn-outline btn-sm" data-action="edit" data-id="${food.id}">Editar</button>
 <button class="btn btn-sm" style="background:#fff7ed;color:var(--orange-main);border:1px solid var(--orange-main)" 
 data-action="view-requests" data-id="${food.id}">
 Ver solicitações ${pendingCount >0 ? `(${pendingCount})` : ''}
 </button>
 <button class="btn btn-danger btn-sm" data-action="delete" data-id="${food.id}">Remover</button>
 </div>
 </div>`;
}

function attachMyDonationEvents() {
 document.querySelectorAll('[data-action]').forEach(el =>{
 el.addEventListener('change', handleMyDonationAction);
 el.addEventListener('click', handleMyDonationAction);
 });
}

function handleMyDonationAction(e) {
 const action = e.currentTarget.dataset.action;
 const id = e.currentTarget.dataset.id;
 if (!action || !id) return;

 if (action === 'change-status') {
 Storage.updateFood(id, { status: e.currentTarget.value });
 renderMyDonations();
 App.showAlert('my-donations-alert', 'success', 'Status atualizado com sucesso.');
 }

 if (action === 'delete') {
 if (!confirm('Deseja remover esta doação? As solicitações associadas também serão afetadas.')) return;
 Storage.deleteFood(id);
 renderMyDonations();
 App.showAlert('my-donations-alert', 'success', 'Doação removida.');
 }

 if (action === 'edit') {
 openEditModal(id);
 }

 if (action === 'view-requests') {
 openRequestsModal(id);
 }
}

// ---- Modal de edição ----
function openEditModal(id) {
 const food = Storage.getFoodById(id);
 if (!food) return;

 document.getElementById('edit-food-id').value = id;
 document.getElementById('edit-foodName').value = food.foodName;
 document.getElementById('edit-quantity').value = food.quantity;
 document.getElementById('edit-location').value = food.location;
 document.getElementById('edit-expiryDate').value = food.expiryDate;
 document.getElementById('edit-description').value = food.description;
 document.getElementById('edit-observations').value = food.observations || '';
 document.getElementById('edit-deliveryOption').value = food.deliveryOption;
 document.getElementById('edit-category').value = food.category;

 openModal('edit-modal');
}

function initEditModal() {
 const form = document.getElementById('edit-form');
 if (!form) return;

 form.addEventListener('submit', e =>{
 e.preventDefault();
 const id = document.getElementById('edit-food-id').value;
 Storage.updateFood(id, {
 foodName: form['edit-foodName'].value.trim(),
 quantity: form['edit-quantity'].value.trim(),
 location: form['edit-location'].value.trim(),
 expiryDate: form['edit-expiryDate'].value,
 description: form['edit-description'].value.trim(),
 observations: form['edit-observations'].value.trim(),
 deliveryOption: form['edit-deliveryOption'].value,
 category: form['edit-category'].value,
 });
 closeModal('edit-modal');
 renderMyDonations();
 App.showAlert('my-donations-alert', 'success', 'Doação atualizada com sucesso!');
 });
}

// ---- Modal de solicitações recebidas ----
function openRequestsModal(foodId) {
 const food = Storage.getFoodById(foodId);
 const requests = Storage.getRequestsByFood(foodId);

 document.getElementById('requests-modal-title').textContent = `Solicitações: ${food ? food.foodName : ''}`;

 const body = document.getElementById('requests-modal-body');
 if (requests.length === 0) {
 body.innerHTML = `<p style="color:var(--grey-mid);text-align:center;padding:2rem">Nenhuma solicitação recebida ainda.</p>`;
 } else {
 body.innerHTML = requests.map(r =>`
 <div class="request-card mb-2">
 <div class="request-card-header">
 <div>
 <strong>${escHtml(r.requesterName)}</strong>
 <div style="font-size:0.8rem;color:var(--grey-mid)">${App.formatDatetime(r.createdAt)}</div>
 </div>
 ${App.reqBadge(r.status)}
 </div>
 <div class="request-card-body">
 <div class="request-info-grid">
 <div class="request-info-item"><label>Contato</label><span>${escHtml(r.contact)}</span></div>
 <div class="request-info-item"><label>Quantidade</label><span>${escHtml(r.qty)}</span></div>
 <div class="request-info-item"><label>Modalidade</label><span>${r.mode === 'delivery' ? 'Entrega' : 'Retirada'}</span></div>
 <div class="request-info-item"><label>Status</label><span>${App.reqBadge(r.status)}</span></div>
 </div>
 ${r.message ? `<p style="font-size:0.88rem;color:var(--grey-mid);background:var(--grey-pale);padding:0.75rem;border-radius:8px">"${escHtml(r.message)}"</p>` : ''}
 </div>
 <div class="request-actions">
 ${r.status === 'pending' ? `
 <button class="btn btn-primary btn-sm" onclick="changeReqStatus('${r.id}','accepted')">Aceitar</button>
 <button class="btn btn-danger btn-sm" onclick="changeReqStatus('${r.id}','refused')">Recusar</button>
 ` : ''}
 ${r.status === 'accepted' ? `
 <button class="btn btn-sm" style="background:var(--green-pale);color:var(--green-dark)" onclick="changeReqStatus('${r.id}','done')">Finalizar</button>
 ` : ''}
 </div>
 </div>`).join('');
 }

 openModal('requests-modal');
}

function changeReqStatus(reqId, status) {
 Storage.updateRequest(reqId, { status });
 // Reabrir modal com dados atualizados
 const req = Storage.getRequests().find(r =>r.id === reqId);
 if (req) openRequestsModal(req.foodId);
 renderMyDonations();
}

// ---- Modal helpers ----
function openModal(id) {
 const el = document.getElementById(id);
 if (el) el.classList.add('open');
}

function closeModal(id) {
 const el = document.getElementById(id);
 if (el) el.classList.remove('open');
}

// ---- Escape HTML ----
function escHtml(str) {
 if (!str) return '';
 return String(str)
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;');
}
