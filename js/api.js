/**
 * api.js — cliente centralizado da API do Salve Comida
 * Todas as páginas importam este arquivo para comunicar com o backend.
 */

var API_BASE = 'https://save-food-9vhv.onrender.com';

const _fetch = async function(path, opts) {
 opts = opts || {};
 const token = localStorage.getItem('sc_token');
 const headers = { 'Content-Type': 'application/json' };
 if (token) headers['Authorization'] = 'Bearer ' + token;

 var fetchOpts = {
 method: opts.method || 'GET',
 headers: headers,
 };
 if (opts.body !== undefined) {
 fetchOpts.body = JSON.stringify(opts.body);
 }

 var res = await fetch(API_BASE + '/api' + path, fetchOpts);
 var data;
 try { data = await res.json(); } catch(e) { data = {}; }

 if (!res.ok) {
 var err = new Error(data.error || 'Erro na requisição.');
 err.status = res.status;
 throw err;
 }
 return data;
};

var Api = {

 auth: {
 register: function(data) {
 return _fetch('/auth/register', { method: 'POST', body: data });
 },
 login: function(data) {
 return _fetch('/auth/login', { method: 'POST', body: data });
 },
 me: function() {
 return _fetch('/auth/me');
 },
 forgotPassword: function(email) {
 return _fetch('/auth/forgot-password', { method: 'POST', body: { email: email } });
 },
 resetPassword: function(token, password) {
 return _fetch('/auth/reset-password', { method: 'POST', body: { token: token, password: password } });
 },
 },

 users: {
 me: function() {
 return _fetch('/users/me');
 },
 update: function(data) {
 return _fetch('/users/me', { method: 'PATCH', body: data });
 },
 },

 donations: {
 list: function(params) {
 var qs = params ? ('?' + new URLSearchParams(params).toString()) : '';
 return _fetch('/donations' + qs);
 },
 get: function(id) {
 return _fetch('/donations/' + id);
 },
 my: function() {
 return _fetch('/donations/my');
 },
 metrics: function() {
 return _fetch('/donations/metrics');
 },
 create: function(data) {
 return _fetch('/donations', { method: 'POST', body: data });
 },
 update: function(id, data) {
 return _fetch('/donations/' + id, { method: 'PATCH', body: data });
 },
 remove: function(id) {
 return _fetch('/donations/' + id, { method: 'DELETE' });
 },
 createRequest: function(donationId, data) {
 return _fetch('/donations/' + donationId + '/requests', { method: 'POST', body: data });
 },
 },

 upload: {
 image: async function(file) {
 var token = localStorage.getItem('sc_token');
 var form = new FormData();
 form.append('image', file);
 var res = await fetch('/api/upload', {
 method: 'POST',
 headers: token ? { 'Authorization': 'Bearer ' + token } : {},
 body: form,
 });
 var data = await res.json();
 if (!res.ok) throw new Error(data.error || 'Erro no upload.');
 return data;
 },
 },

 requests: {
 my: function() {
 return _fetch('/requests/my');
 },
 dailyStatus: function() {
 return _fetch('/requests/daily-status');
 },
 received: function() {
 return _fetch('/requests/received');
 },
 updateStatus: function(id, status) {
 return _fetch('/requests/' + id + '/status', { method: 'PATCH', body: { status: status } });
 },
 cancel: function(id) {
 return _fetch('/requests/' + id, { method: 'DELETE' });
 },
 },

};
