const crypto = require('node:crypto');
const { createSession, cookieHeader } = require('../auth');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { APP_PASSWORD, AUTH_SECRET, APP_MESSAGE = '' } = process.env;
  if (!APP_PASSWORD || APP_PASSWORD.length < 16 || !AUTH_SECRET || AUTH_SECRET.length < 32) {
    return { statusCode: 500, body: 'APP_PASSWORD (kamida 16 belgi) va AUTH_SECRET (kamida 32 belgi) sozlanishi kerak' };
  }

  let password;
  try {
    password = JSON.parse(event.body || '').password;
  } catch {
    return { statusCode: 400, body: 'Noto\'g\'ri so\'rov' };
  }

  if (typeof password !== 'string') return { statusCode: 400, body: 'Noto\'g\'ri so\'rov' };
  const expected = crypto.createHash('sha256').update(APP_PASSWORD).digest();
  const actual = crypto.createHash('sha256').update(password).digest();
  if (!crypto.timingSafeEqual(expected, actual)) return { statusCode: 401, body: 'Parol noto\'g\'ri' };

  return {
    statusCode: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'set-cookie': cookieHeader(createSession(AUTH_SECRET)),
    },
    body: JSON.stringify({ message: APP_MESSAGE }),
  };
};
