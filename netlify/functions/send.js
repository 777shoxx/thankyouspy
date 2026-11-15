// Brauzerdan kelgan matn/fayllarni Telegram botga yuboradi.
// Netlify > Site settings > Environment variables: BOT_TOKEN, CHAT_ID

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) return { statusCode: 500, body: 'BOT_TOKEN/CHAT_ID sozlanmagan' };

  const h = event.headers;
  const kind = h['x-kind'];
  const sender = safeDecode(h['x-sender']) || 'Anonim';
  const api = (m) => `https://api.telegram.org/bot${BOT_TOKEN}/${m}`;
  const raw = Buffer.from(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');

  try {
    let res;

    if (kind === 'text') {
      const text = `💬 ${sender}:\n\n${raw.toString('utf8')}`.slice(0, 4096);
      res = await fetch(api('sendMessage'), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
      });
    } else if (kind === 'file') {
      const name = safeDecode(h['x-filename']) || 'file';
      const mime = (h['content-type'] || 'application/octet-stream').split(';')[0];

      // Rasm > 10 MB bo'lmasa photo, video bo'lsa video, qolgani document
      let method = 'sendDocument', field = 'document';
      if (mime.startsWith('image/') && mime !== 'image/svg+xml' && mime !== 'image/gif') { method = 'sendPhoto'; field = 'photo'; }
      else if (mime.startsWith('video/')) { method = 'sendVideo'; field = 'video'; }

      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('caption', `📎 ${name}\n👤 ${sender}`.slice(0, 1024));
      form.append(field, new Blob([raw], { type: mime }), name);
      res = await fetch(api(method), { method: 'POST', body: form });
    } else {
      return { statusCode: 400, body: 'Noto\'g\'ri so\'rov' };
    }

    const data = await res.json();
    if (!data.ok) return { statusCode: 502, body: data.description || 'Telegram xatosi' };
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    return { statusCode: 500, body: String(e.message || e) };
  }
};

function safeDecode(s) {
  try { return decodeURIComponent(s || ''); } catch { return s || ''; }
}
