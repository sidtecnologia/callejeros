import { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, placeOrderAPI, saveOrderToDB } from '../services/api';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBusinessModalOpen, setBusinessModalOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const addToast = (message, title = '') => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
    const toast = { id, title, message };
    setToasts((prev) => [toast, ...prev]);
    setTimeout(() => removeToast(id), 3200);
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter(t => t.id !== id));
  };

  const addToCart = (product, qty, observation = '') => {
    let limitReached = false;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;

      if (currentQty + qty > product.stock) {
        limitReached = true;
        return prevCart;
      }

      if (existing) {
        return prevCart.map(item =>
          item.id === product.id
            ? {
              ...item,
              qty: item.qty + qty,
              observation: observation ?
                (item.observation ? `${item.observation} | ${observation}` : observation)
                : item.observation
            }
            : item
        );
      } else {
        return [...prevCart, { ...product, qty, observation: observation || '' }];
      }
    });

    if (limitReached) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
    } else {
      addToast(`${product.name} agregado al carrito.`, 'Producto agregado');
    }
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateCartQty = (id, delta) => {
    let limitReached = false;
    const product = products.find(p => p.id === id);

    setCart(prevCart => {
      const item = prevCart.find(i => i.id === id);
      if (!item) return prevCart;

      const newQty = item.qty + delta;

      if (newQty > product.stock) {
        limitReached = true;
        return prevCart;
      }

      if (newQty <= 0) {
        return prevCart.filter(i => i.id !== id);
      } else {
        return prevCart.map(i => i.id === id ? { ...i, qty: newQty } : i);
      }
    });

    if (limitReached) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
    }
  };

  const clearCart = () => setCart([]);

  const processOrder = async (customerData) => {
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const itemObservations = cart
      .map(i => i.observation && i.observation.trim() ? i.observation.trim() : null)
      .filter(Boolean);

    const aggregatedObservation = itemObservations.length > 0 ? itemObservations.join(' | ') : '';

    return {
      name: customerData.name,
      address: customerData.address,
      phone: customerData.phone,
      payment: customerData.payment,
      items: cart,
      total,
      observation: aggregatedObservation
    };
  };

  const confirmOrder = async (orderDetails) => {
    try {
      const dbOrder = {
        customer_name: orderDetails.name,
        customer_address: orderDetails.address,
        phone: String(orderDetails.phone || ''),
        payment_method: orderDetails.payment,
        total_amount: orderDetails.total,
        order_items: orderDetails.items,
        observation: orderDetails.observation || '',
        order_status: 'Pendiente'
      };

      // 1. Guardar en base de datos (Supabase)
      await saveOrderToDB(dbOrder);

      // 2. Intentar notificación externa (opcional)
      try {
        if (typeof placeOrderAPI === 'function') {
          await placeOrderAPI(orderDetails, products);
        }
      } catch (apiErr) {
        // Solo registramos el error de la API sin detener el flujo principal
        console.warn("La notificación externa falló, pero el pedido se guardó:", apiErr);
      }

      // 3. Finalizar proceso exitoso
      await fetchProducts();
      clearCart();
      addToast('Pedido confirmado y enviado correctamente.', 'Pedido enviado');

      return true;
    } catch (err) {
      console.error("Error crítico al procesar pedido:", err);
      addToast('Error al confirmar el pedido: ' + (err.message || err), 'Error');
      throw err;
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      loading,
      error,
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
      removeToast
    }}>
      {children}
    </ShopContext.Provider>
  );
};