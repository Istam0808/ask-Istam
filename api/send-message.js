const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, description: 'Method not allowed' });
  }

  const { BOT_TOKEN, CHAT_ID } = process.env;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({
      ok: false,
      description: 'Telegram environment variables are not configured',
    });
  }

  const msg = String(req.body?.msg || '').trim();
  const tg = String(req.body?.tg || '').trim();

  if (!msg) {
    return res.status(400).json({ ok: false, description: 'Message is required' });
  }

  const from = tg ? `@${tg}` : 'Аноним';
  const text = `📩 Новый вопрос\n\n👤 От: ${from}\n\n💬 Вопрос:\n${msg}`;

  try {
    const telegramRes = await fetch(`${TELEGRAM_API_URL}${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok || !data.ok) {
      return res.status(telegramRes.status || 502).json({
        ok: false,
        description: data.description || 'Telegram request failed',
      });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(502).json({ ok: false, description: 'Telegram request failed' });
  }
};
