const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;
const rateLimitStore = new Map();

function getRateLimitKey(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(key) {
  const now = Date.now();
  const record = rateLimitStore.get(key) || { count: 0, start: now };

  if (now - record.start > RATE_LIMIT_WINDOW_MS) {
    record.count = 1;
    record.start = now;
  } else {
    record.count += 1;
  }

  rateLimitStore.set(key, record);

  if (rateLimitStore.size > 5000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now - v.start > RATE_LIMIT_WINDOW_MS) rateLimitStore.delete(k);
    }
  }

  return record.count <= RATE_LIMIT_MAX;
}

export default (req, res) => {
  const clientKey = getRateLimitKey(req);
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta más tarde.' });
  }

  const SB_URL = process.env.VITE_SB_URL;
  const SB_ANON_KEY = process.env.VITE_SB_ANON_KEY;

  if (!SB_URL || !SB_ANON_KEY) {
    return res.status(500).json({
      error: 'Variables de entorno de SB faltantes en la configuración del servidor.',
      url: null,
      anonKey: null,
    });
  }

  return res.status(200).json({
    url: SB_URL,
    anonKey: SB_ANON_KEY,
  });
};