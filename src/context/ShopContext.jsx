import { createContext, useContext, useState, useEffect } from 'react';
import {
  getProducts,
  validateOrderAPI,
  saveOrderToDB,
  getBusinessConfig
} from '../services/api';
import { BUSINESS_CONFIG_DEFAULTS } from '../config/businessConfig';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

const EMPTY_SCHEDULE = {
  mon: [],
  tue: [],
  wed: [],
  thu: [],
  fri: [],
  sat: [],
  sun: [],
};

const normalizeShift = (shift) => {
  if (!shift || typeof shift !== 'object') return null;

  const open = typeof shift.open === 'string' ? shift.open : '';
  const close = typeof shift.close === 'string' ? shift.close : '';

  if (!open || !close) return null;

  return {
    open,
    close,
  };
};

const normalizeSchedule = (value) => {
  if (Array.isArray(value)) {
    const legacyShifts = value
      .map(normalizeShift)
      .filter(Boolean);

    return {
      mon: legacyShifts,
      tue: legacyShifts,
      wed: legacyShifts,
      thu: legacyShifts,
      fri: legacyShifts,
      sat: legacyShifts,
      sun: legacyShifts,
    };
  }

  if (!value || typeof value !== 'object') {
    return EMPTY_SCHEDULE;
  }

  return Object.keys(EMPTY_SCHEDULE).reduce((schedule, day) => {
    const dayShifts = Array.isArray(value[day]) ? value[day] : [];

    schedule[day] = dayShifts
      .map(normalizeShift)
      .filter(Boolean);

    return schedule;
  }, { ...EMPTY_SCHEDULE });
};

const getProductCategory = (product) => {
  if (!product) return null;

  const category =
    product.category ??
    product.category_name ??
    product.categoryName ??
    product.categoria ??
    null;

  if (typeof category === 'string') {
    return category.trim() || null;
  }

  if (category && typeof category === 'object') {
    return (
      category.name ??
      category.title ??
      category.nombre ??
      category.label ??
      null
    );
  }

  return null;
};

const getProductCategoryId = (product) => {
  if (!product) return null;

  return (
    product.category_id ??
    product.categoryId ??
    product.categoria_id ??
    null
  );
};

const mapDbToConfig = (row) => ({
  name: row.name || '',
  description: row.description || '',
  email: row.email || '',
  phone: row.phone || '',
  phoneRaw: row.phone || '',
  address: row.address || '',
  mapsUrl: row.maps_url || '',
  whatsapp: row.whatsapp || '',
  nequi: {
    number: row.nequi_number || '',
    qrUrl: row.nequi_qr_url || '',
  },
  delivery: {
    cost: row.delivery_cost ?? 0,
  },
  banners: Array.isArray(row.banners) ? row.banners : [],
  schedule: {
    label: row.schedule_label || '',
    shifts: normalizeSchedule(row.schedule_shifts),
    timezone: row.schedule_tz || 'America/Bogota',
  },
});

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [businessConfig, setBusinessConfig] = useState(
    BUSINESS_CONFIG_DEFAULTS
  );

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [data, configRow] = await Promise.all([
        getProducts(),
        getBusinessConfig(),
      ]);

      setProducts(data);

      if (configRow) {
        setBusinessConfig(mapDbToConfig(configRow));
      }
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, title = '') => {
    const id =
      Date.now().toString() +
      Math.random().toString(36).slice(2, 9);

    const toast = {
      id,
      title,
      message,
    };

    setToasts((prev) => [toast, ...prev]);

    setTimeout(() => removeToast(id), 3200);

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (
    product,
    qty,
    observation = '',
    size = null
  ) => {
    let limitReached = false;

    const category = getProductCategory(product);
    const categoryId = getProductCategoryId(product);

    setCart((prevCart) => {
      const cartKey = size
        ? `${product.id}__${size.label}`
        : String(product.id);

      const existing = prevCart.find(
        (item) => item._cartKey === cartKey
      );

      const currentQty = existing ? existing.qty : 0;

      if (currentQty + qty > product.stock) {
        limitReached = true;
        return prevCart;
      }

      if (existing) {
        return prevCart.map((item) =>
          item._cartKey === cartKey
            ? {
                ...item,
                qty: item.qty + qty,
                observation: observation
                  ? item.observation
                    ? `${item.observation} | ${observation}`
                    : observation
                  : item.observation,
              }
            : item
        );
      }

      return [
        ...prevCart,
        {
          ...product,
          _cartKey: cartKey,
          qty,
          price: size ? size.price : product.price,
          size: size ? size.label : null,
          observation: observation || '',
          category,
          category_id: categoryId,
        },
      ];
    });

    if (limitReached) {
      alert(
        `Solo quedan ${product.stock} unidades disponibles.`
      );
    } else {
      addToast(
        `${product.name}${size ? ` (${size.label})` : ''} agregado al carrito.`,
        'Producto agregado'
      );
    }
  };

  const removeFromCart = (cartKey) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item._cartKey !== cartKey)
    );
  };

  const updateCartQty = (cartKey, delta) => {
    let limitReached = false;

    const cartItem = cart.find(
      (i) => i._cartKey === cartKey
    );

    const product = products.find(
      (p) => p.id === cartItem?.id
    );

    setCart((prevCart) => {
      const item = prevCart.find(
        (i) => i._cartKey === cartKey
      );

      if (!item || !product) return prevCart;

      const newQty = item.qty + delta;

      if (newQty > product.stock) {
        limitReached = true;
        return prevCart;
      }

      if (newQty <= 0) {
        return prevCart.filter(
          (i) => i._cartKey !== cartKey
        );
      }

      return prevCart.map((i) =>
        i._cartKey === cartKey
          ? {
              ...i,
              qty: newQty,
            }
          : i
      );
    });

    if (limitReached) {
      alert(
        `Solo quedan ${product?.stock} unidades disponibles.`
      );
    }
  };

  const clearCart = () => setCart([]);

  const processOrder = async (customerData) => {
    const itemObservations = cart
      .map((i) =>
        i.observation && i.observation.trim()
          ? i.observation.trim()
          : null
      )
      .filter(Boolean);

    const aggregatedObservation =
      itemObservations.length > 0
        ? itemObservations.join(' | ')
        : '';

    const orderPayload = {
      name: customerData.name,
      address: customerData.address,
      phone: customerData.phone,
      payment: customerData.payment,
      observation: aggregatedObservation,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        size: item.size || null,
        observation: item.observation || '',
        category: item.category || null,
        category_id: item.category_id || null,
      })),
    };

    const result = await validateOrderAPI(orderPayload);

    const validatedItems = Array.isArray(result.validatedItems)
      ? result.validatedItems
      : [];

    const itemsWithCategory = validatedItems.map((validatedItem) => {
      const originalItem = cart.find(
        (item) =>
          String(item.id) === String(validatedItem.id) &&
          (
            item.size || null
          ) === (
            validatedItem.size || null
          )
      );

      return {
        ...validatedItem,
        category:
          validatedItem.category ??
          validatedItem.category_name ??
          validatedItem.categoryName ??
          validatedItem.categoria ??
          originalItem?.category ??
          null,
        category_id:
          validatedItem.category_id ??
          validatedItem.categoryId ??
          originalItem?.category_id ??
          null,
      };
    });

    return {
      name: result.customerData.name,
      address: result.customerData.address,
      phone: result.customerData.phone,
      payment: result.customerData.payment,
      observation: result.customerData.observation || '',
      items: itemsWithCategory,
      total: result.total,
    };
  };

  const confirmOrder = async (orderDetails) => {
    const dbOrder = {
      customer_name: orderDetails.name,
      customer_address: orderDetails.address,
      phone: String(orderDetails.phone || ''),
      payment_method: orderDetails.payment,
      total_amount: orderDetails.total,
      order_items: orderDetails.items,
      observation: orderDetails.observation || null,
      order_status: 'Recibido',
      payment_status: 'Pendiente',
    };

    await saveOrderToDB(dbOrder);

    const [data, configRow] = await Promise.all([
      getProducts(),
      getBusinessConfig(),
    ]);

    setProducts(data);

    if (configRow) {
      setBusinessConfig(mapDbToConfig(configRow));
    }

    clearCart();

    addToast(
      'Pedido confirmado y enviado correctamente.',
      'Pedido enviado'
    );
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        loading,
        error,
        businessConfig,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        processOrder,
        confirmOrder,
        isBusinessModalOpen,
        setBusinessModalOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};