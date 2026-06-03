/**
 * auth.js — Salve Comida
 * Gerencia autenticação via JWT + API real.
 * Depende de js/api.js (deve ser carregado antes).
 */

var Auth = (function() {

  var TOKEN_KEY = 'sc_token';
  var USER_KEY  = 'sc_user';

  function getToken()      { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t)     { localStorage.setItem(TOKEN_KEY, t); }
  function clearSession()  {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function getCachedUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch(e) { return null; }
  }
  function setCachedUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }

  async function fetchCurrentUser() {
    if (!getToken()) return null;
    try {
      var user = await Api.auth.me();
      setCachedUser(user);
      return user;
    } catch(e) {
      if (e.status === 401) clearSession();
      return null;
    }
  }

  async function requireLogin(redirectTo) {
    var user = await fetchCurrentUser();
    if (!user) {
      sessionStorage.setItem('sc_after_login', location.href);
      location.replace(redirectTo || 'login.html');
      return null;
    }
    return user;
  }

  function logout() {
    clearSession();
    location.replace('index.html');
  }

  async function updateNavAuth() {
    var user = await fetchCurrentUser();
    var authArea = document.querySelector('.nav-auth');
    var mobileMenu = document.getElementById('nav-mobile');

    if (user) {
      var initials = user.name.split(' ').slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase();

      if (authArea) {
        authArea.innerHTML =
          '<a href="perfil.html" class="nav-user-btn">' +
            '<div class="nav-avatar">' + initials + '</div>' +
            '<span>' + user.name.split(' ')[0] + '</span>' +
          '</a>' +
          '<button onclick="Auth.logout()" class="btn btn-sm btn-outline" style="color:var(--grey-mid)">Sair</button>';
      }
      if (mobileMenu) {
        var authDiv = mobileMenu.querySelector('.nav-mobile-auth');
        if (authDiv) {
          authDiv.innerHTML =
            '<a href="perfil.html" class="btn btn-outline">👤 Perfil</a>' +
            '<button onclick="Auth.logout()" class="btn btn-primary">Sair</button>';
        }
      }
    }
  }

  function canDonate(user)  { return user && (user.role === 'DONOR'    || user.role === 'BOTH'); }
  function canReceive(user) { return user && (user.role === 'RECEIVER'  || user.role === 'BOTH'); }

  return {
    getToken: getToken,
    setToken: setToken,
    clearSession: clearSession,
    getCachedUser: getCachedUser,
    setCachedUser: setCachedUser,
    fetchCurrentUser: fetchCurrentUser,
    requireLogin: requireLogin,
    logout: logout,
    updateNavAuth: updateNavAuth,
    canDonate: canDonate,
    canReceive: canReceive,
  };
})();

(function injectStyles() {
  var style = document.createElement('style');
  style.textContent =
    '.nav-user-btn{display:inline-flex!important;align-items:center;gap:.4rem;' +
    'padding:.3rem .75rem!important;border-radius:999px!important;' +
    'font-weight:600!important;font-size:.88rem!important;cursor:pointer}' +
    '.nav-user-btn:hover{background:var(--green-pale)!important;color:var(--green-main)!important}' +
    '.nav-avatar{width:28px;height:28px;border-radius:50%;background:var(--green-main);' +
    'color:#fff;font-size:.7rem;font-weight:700;display:flex;align-items:center;' +
    'justify-content:center;flex-shrink:0}';
  document.head.appendChild(style);
})();
