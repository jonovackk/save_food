/**
 * email.js — envio de e-mails via Resend
 * Requer variável de ambiente: RESEND_API_KEY
 * Se não configurada, loga o e-mail no console (útil para dev).
 */

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';
const FROM     = process.env.EMAIL_FROM || 'Salve Comida <noreply@salvecomida.com>';

async function sendEmail({ to, subject, html }) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[email] SEM RESEND_API_KEY — e-mail simulado para ${to}:\n${subject}`);
    return;
  }
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({ from: FROM, to, subject, html });
}

async function sendPasswordReset(email, token) {
  const link = `${BASE_URL}/redefinir-senha.html?token=${token}`;
  await sendEmail({
    to: email,
    subject: 'Redefinir senha — Salve Comida',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d7a4f">Redefinir sua senha</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Salve Comida</strong>.</p>
        <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
        <a href="${link}" style="display:inline-block;margin:1rem 0;padding:.75rem 1.5rem;background:#2d7a4f;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Redefinir senha
        </a>
        <p style="color:#888;font-size:.85rem">Se você não solicitou isso, ignore este e-mail.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:1.5rem 0">
        <p style="color:#aaa;font-size:.8rem">Salve Comida — plataforma de doação de alimentos</p>
      </div>`,
  });
}

async function sendRequestAccepted(email, donorName, foodTitle, pickupLocation) {
  await sendEmail({
    to: email,
    subject: `Solicitação aceita — ${foodTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d7a4f">Sua solicitação foi aceita!</h2>
        <p>O doador <strong>${donorName}</strong> aceitou sua solicitação de <strong>${foodTitle}</strong>.</p>
        <p><strong>Local de retirada:</strong> ${pickupLocation}</p>
        <p>Entre em contato com o doador para combinar os detalhes da retirada.</p>
        <a href="${BASE_URL}/minhas-solicitacoes.html" style="display:inline-block;margin:1rem 0;padding:.75rem 1.5rem;background:#2d7a4f;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Ver minhas solicitações
        </a>
      </div>`,
  });
}

async function sendRequestReceived(email, requesterName, foodTitle) {
  await sendEmail({
    to: email,
    subject: `Nova solicitação — ${foodTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#2d7a4f">Nova solicitação recebida!</h2>
        <p><strong>${requesterName}</strong> solicitou sua doação de <strong>${foodTitle}</strong>.</p>
        <a href="${BASE_URL}/solicitacoes-recebidas.html" style="display:inline-block;margin:1rem 0;padding:.75rem 1.5rem;background:#2d7a4f;color:white;border-radius:8px;text-decoration:none;font-weight:600">
          Ver solicitações recebidas
        </a>
      </div>`,
  });
}

module.exports = { sendPasswordReset, sendRequestAccepted, sendRequestReceived };
