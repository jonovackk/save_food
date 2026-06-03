/**
 * app.js — Salve Comida v2
 * Utilitários compartilhados. Inicializa navbar, auth, seed.
 */

document.addEventListener('DOMContentLoaded', () =>{
 Storage.seedIfEmpty();
 App.initNavbar();
 App.setActiveNav();
 Auth.updateNavAuth();
});

const App = (() =>{

 const CATEGORIES = {
 fruits: { label: 'Frutas e verduras', emoji: '' },
 breads: { label: 'Pães e massas', emoji: '' },
 meals: { label: 'Refeições prontas', emoji: '' },
 canned: { label: 'Enlatados', emoji: '' },
 dairy: { label: 'Laticínios', emoji: '' },
 beverages: { label: 'Bebidas', emoji: '' },
 other: { label: 'Outros', emoji: '' },
 };

 const DONOR_TYPES = {
 person:'Pessoa física', restaurant:'Restaurante', market:'Mercado',
 bakery:'Padaria', company:'Empresa', other:'Outro',
 };

 const DELIVERY_OPTIONS = {
 local:'Apenas retirada no local', delivery:'Posso entregar', negotiate:'A combinar',
 };

 const FOOD_STATES = {
 new:'Novo/fechado', fresh:'Preparado recentemente', nearexpiry:'Próximo do vencimento', other:'Outro',
 };

 const STATUS_FOOD = {
 available:{ label:'Disponível', cls:'badge-available' },
 reserved: { label:'Reservado', cls:'badge-reserved' },
 closed: { label:'Encerrado', cls:'badge-closed' },
 };

 const STATUS_REQ = {
 pending: { label:'Pendente', cls:'badge-pending' },
 accepted: { label:'Aceito', cls:'badge-accepted' },
 refused: { label:'Recusado', cls:'badge-refused' },
 done: { label:'Finalizado', cls:'badge-done' },
 };

 function initNavbar() {
 const btn = document.querySelector('.nav-hamburger');
 const links = document.querySelector('.nav-links');
 if (!btn || !links) return;
 btn.addEventListener('click', () =>links.classList.toggle('open'));
 document.addEventListener('click', e =>{
 if (!btn.contains(e.target) && !links.contains(e.target))
 links.classList.remove('open');
 });
 }

 function setActiveNav() {
 const page = location.pathname.split('/').pop() || 'index.html';
 document.querySelectorAll('.nav-links a').forEach(a =>{
 const href = a.getAttribute('href');
 if (href === page || (page === '' && href === 'index.html'))
 a.classList.add('active');
 });
 }

 function formatDate(iso) {
 if (!iso) return '—';
 const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`;
 }

 function daysUntil(iso) {
 if (!iso) return null;
 return Math.ceil((new Date(iso) - new Date()) / 86400000);
 }

 function formatDatetime(iso) {
 if (!iso) return '—';
 const d = new Date(iso);
 return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
 }

 function foodBadge(status) {
 const s = STATUS_FOOD[status] || STATUS_FOOD.available;
 return `<span class="badge ${s.cls}">${s.label}</span>`;
 }

 function reqBadge(status) {
 const s = STATUS_REQ[status] || STATUS_REQ.pending;
 return `<span class="badge ${s.cls}">${s.label}</span>`;
 }

 function categoryEmoji(cat) { return (CATEGORIES[cat]||CATEGORIES.other).emoji; }
 function categoryLabel(cat) { return (CATEGORIES[cat]||CATEGORIES.other).label; }
 function donorTypeLabel(t) { return DONOR_TYPES[t] || t; }
 function deliveryLabel(d) { return DELIVERY_OPTIONS[d] || d; }
 function foodStateLabel(s) { return FOOD_STATES[s] || s; }

 function showAlert(containerId, type, msg) {
 const el = document.getElementById(containerId);
 if (!el) return;
 const icons = { success:'', error:'', info:'' };
 el.innerHTML = `<div class="alert alert-${type} fade-in"><span>${icons[type]||''}</span><span>${msg}</span></div>`;
 el.scrollIntoView({ behavior:'smooth', block:'nearest' });
 setTimeout(() =>{ el.innerHTML = ''; }, 6000);
 }

 function validateRequired(formEl) {
 let valid = true;
 formEl.querySelectorAll('[required]').forEach(el =>{
 const g = el.closest('.form-group');
 if (!el.value.trim()) { if (g) g.classList.add('has-error'); valid = false; }
 else { if (g) g.classList.remove('has-error'); }
 });
 return valid;
 }

 function clearErrorOnInput(formEl) {
 formEl.querySelectorAll('.form-control').forEach(el =>{
 el.addEventListener('input', () =>{
 const g = el.closest('.form-group');
 if (g) g.classList.remove('has-error');
 });
 });
 }

 function foodImageHtml(food, cls='') {
 if (food.image && food.image.startsWith('data:'))
 return `<img src="${food.image}" alt="${food.foodName}" class="${cls}">`;
 return `<span style="font-size:2.5rem">${categoryEmoji(food.category)}</span>`;
 }

 function escHtml(str) {
 if (!str) return '';
 return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
 }

 return {
 initNavbar, setActiveNav, formatDate, daysUntil, formatDatetime,
 foodBadge, reqBadge, categoryEmoji, categoryLabel,
 donorTypeLabel, deliveryLabel, foodStateLabel,
 showAlert, validateRequired, clearErrorOnInput, foodImageHtml, escHtml,
 CATEGORIES, STATUS_FOOD, STATUS_REQ,
 };
})();
