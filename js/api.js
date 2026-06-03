/**
 * api.js — cliente centralizado da API do Salve Comida
 * Todas as páginas importam este arquivo para comunicar com o backend.
 */

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

  var res = await fetch('/api' + path, fetchOpts);
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

  requests: {
    my: function() {
      return _fetch('/requests/my');
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
