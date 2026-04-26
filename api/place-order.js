import { createClient } from '@supabase/supabase-js';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;
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

function sanitizeString(value, maxLength = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength).replace(/[<>]/g, '');
}

function isValidPhone(phone) {
  return /^\d{7,15}$/.test(String(phone).replace(/\s/g, ''));
}

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const clientKey = getRateLimitKey(req);
  if (!checkRateLimit(clientKey)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un momento.' });
  }

  const supabaseUrl = process.env.SB_URL;
  const supabaseServiceRoleKey = process.env.SB_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const { orderDetails } = req.body;

    if (
      !orderDetails ||
      !Array.isArray(orderDetails.items) ||
      orderDetails.items.length === 0 ||
      orderDetails.items.length > 50
    ) {
      return res.status(400).json({ error: 'Datos de la orden inválidos o vacíos.' });
    }

    const name = sanitizeString(orderDetails.name, 100);
    const address = sanitizeString(orderDetails.address, 200);
    const observation = sanitizeString(orderDetails.observation || '', 500);
    const phone = sanitizeString(String(orderDetails.phone || ''), 20);
    const payment = ['Efectivo', 'Transferencia'].includes(orderDetails.payment)
      ? orderDetails.payment
      : null;

    if (!name || !address || !phone || !payment) {
      return res.status(400).json({ error: 'Campos obligatorios inválidos o faltantes.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Número de teléfono inválido.' });
    }

    const itemIds = orderDetails.items.map((i) => i.id);
    const uniqueIds = [...new Set(itemIds)];

    if (uniqueIds.length !== orderDetails.items.length) {
      return res.status(400).json({ error: 'Ítems duplicados en la orden.' });
    }

    const { data: dbProducts, error: fetchError } = await supabase
      .from('products')
      .select('id, name, stock, price')
      .in('id', uniqueIds);

    if (fetchError || !dbProducts) {
      return res.status(500).json({ error: 'Error al verificar productos.' });
    }

    const productMap = Object.fromEntries(dbProducts.map((p) => [String(p.id), p]));

    const stockUpdates = [];
    let computedTotal = 0;

    for (const item of orderDetails.items) {
      const dbProduct = productMap[String(item.id)];

      if (!dbProduct) {
        return res.status(400).json({ error: `Producto no encontrado: ${item.id}` });
      }

      const qty = parseInt(item.qty, 10);
      if (!Number.isInteger(qty) || qty <= 0 || qty > 100) {
        return res.status(400).json({ error: `Cantidad inválida para: ${dbProduct.name}` });
      }

      if (dbProduct.stock < qty) {
        return res.status(400).json({
          error: `Stock insuficiente para ${dbProduct.name}. Disponible: ${dbProduct.stock}`,
        });
      }

      computedTotal += dbProduct.price * qty;
      stockUpdates.push({ id: dbProduct.id, newStock: dbProduct.stock - qty });
    }

    const updates = stockUpdates.map(({ id, newStock }) =>
      supabase.from('products').update({ stock: newStock }).eq('id', id).select()
    );

    const updateResults = await Promise.all(updates);

    for (const result of updateResults) {
      if (result.error) {
        throw new Error('Error al actualizar el stock: ' + result.error.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Orden procesada con éxito.',
      total: computedTotal,
    });
  } catch (error) {
    console.error('Error al procesar la orden:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
};