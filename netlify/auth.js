const crypto = require('node:crypto');

const COOKIE_NAME = 'secure_drop_session';
const SESSION_TTL_SECONDS = 30 * 60;

function sign(expiry, secret) {
  return crypto.createHmac('sha256', secret).update(String(expiry)).digest('hex');
}

function createSession(secret) {
  const expiry = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  return `${expiry}.${sign(expiry, secret)}`;
}

function isAuthenticated(event, secret) {
  const headers = event.headers || {};
  const cookieHeader = headers.cookie || headers.Cookie || '';
  const cookie = cookieHeader.split(';').map(part => part.trim())
    .find(part => part.startsWith(`${COOKIE_NAME}=`));
  if (!cookie) return false;

  const token = cookie.slice(COOKIE_NAME.length + 1);
  const [expiryText, signature] = token.split('.');
  const expiry = Number(expiryText);
  if (!Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false;
  if (!/^[a-f0-9]{64}$/.test(signature || '')) return false;

  const expected = Buffer.from(sign(expiry, secret), 'hex');
  const actual = Buffer.from(signature, 'hex');
  return crypto.timingSafeEqual(expected, actual);
}

exports.createSession = createSession;
exports.isAuthenticated = isAuthenticated;
exports.cookieHeader = (token) =>
  `${COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
