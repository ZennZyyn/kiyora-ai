// Vercel Serverless Function: meneruskan chat ke endpoint Kiyora (menghindari CORS di browser)
const UPSTREAM = (process.env.UPSTREAM || 'https://kiyoraai.vercel.app').replace(/\/+$/, '');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const history = req.body && req.body.history;
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'history wajib berupa array' });
  }

  try {
    const up = await fetch(`${UPSTREAM}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history }),
      signal: AbortSignal.timeout(55000),
    });
    const data = await up.json().catch(() => ({}));
    return res.status(up.status).json(data);
  } catch (e) {
    return res.status(502).json({ error: 'proxy: ' + e.message });
  }
};
