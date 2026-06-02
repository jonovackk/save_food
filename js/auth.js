/**
 * auth.js — Salve Comida v2
 * Sistema de autenticação por e-mail (simulado com localStorage).
 * Páginas: login.html, cadastro.html, perfil.html
 * Guard: Auth.requireLogin() — redireciona para login.html se não logado.
 */

const Auth = (() => {

  /* ── Guard: redireciona se não logado ── */
  function requireLogin(redirectTo) {
    if (!Storage.getSession()) {
      const dest = redirectTo || 'login.html';
      // Salva URL atual para redirecionar após login
      sessionStorage.setItem('sc_after_login', location.href);
      location.replace(dest);
    }
  }

  /* ── Retorna usuário logado ou null ── */
  function current() { return Storage.getSession(); }

  /* ── Atualiza navbar com estado de login ── */
  function updateNavAuth() {
    const user = current();
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    // Remove itens de auth antigos
    navLinks.querySelectorAll('[data-auth-item]').forEach(el => el.remove());

    const unread = user ? Storage.unreadCount(user.id) : 0;

    if (user) {
      // Badge de notificações
      const notifLi = document.createElement('a');
      notifLi.setAttribute('data-auth-item', '1');
      notifLi.href = 'perfil.html#notificacoes';
      notifLi.className = 'nav-notif-btn';
      notifLi.innerHTML = `🔔 ${unread > 0 ? `<span class="notif-badge">${unread}</span>` : ''}`;
      notifLi.title = 'Notificações';

      // Avatar + nome
      const avatarLi = document.createElement('a');
      avatarLi.setAttribute('data-auth-item', '1');
      avatarLi.href = 'perfil.html';
      avatarLi.className = 'nav-user-btn';
      avatarLi.innerHTML = `
        <div class="nav-avatar">${user.avatar ? `<img src="${user.avatar}">` : _initials(user.name)}</div>
        <span>${user.name.split(' ')[0]}</span>`;

      navLinks.appendChild(notifLi);
      navLinks.appendChild(avatarLi);
    } else {
      const loginLi = document.createElement('a');
      loginLi.setAttribute('data-auth-item', '1');
      loginLi.href = 'login.html';
      loginLi.className = 'btn btn-sm btn-outline';
      loginLi.style.marginLeft = '0.25rem';
      loginLi.textContent = 'Entrar';
      navLinks.appendChild(loginLi);
    }
  }

  function _initials(name) {
    return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  }

  /* ── Logout ── */
  function logout() {
    Storage.logoutUser();
    location.replace('index.html');
  }

  /* ── Helpers de role ── */
  function isAdmin()  { const u = current(); return u && u.role === 'admin'; }
  function isDonor()  { const u = current(); return u && (u.role === 'donor' || u.role === 'admin'); }
  function isOng()    { const u = current(); return u && (u.role === 'ong'   || u.role === 'admin'); }

  return { requireLogin, current, updateNavAuth, logout, isAdmin, isDonor, isOng };
})();

// Injeta estilos de auth na navbar
(function injectAuthStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .nav-notif-btn {
      position:relative; padding:0.45rem 0.7rem !important;
      font-size:1rem; cursor:pointer;
    }
    .notif-badge {
      position:absolute; top:2px; right:2px;
      background:var(--orange-main); color:#fff;
      font-size:0.65rem; font-weight:700;
      min-width:16px; height:16px; border-radius:999px;
      display:inline-flex; align-items:center; justify-content:center;
      padding:0 3px; line-height:1;
    }
    .nav-user-btn {
      display:inline-flex !important; align-items:center; gap:0.4rem;
      padding:0.3rem 0.75rem !important;
      border-radius:999px !important;
      font-weight:600 !important; font-size:0.88rem !important;
    }
    .nav-user-btn:hover { background:var(--green-pale) !important; color:var(--green-main) !important; }
    .nav-avatar {
      width:28px; height:28px; border-radius:50%;
      background:var(--green-main); color:#fff;
      font-size:0.7rem; font-weight:700;
      display:flex; align-items:center; justify-content:center;
      overflow:hidden; flex-shrink:0;
    }
    .nav-avatar img { width:100%; height:100%; object-fit:cover; }
  `;
  document.head.appendChild(style);
})();
