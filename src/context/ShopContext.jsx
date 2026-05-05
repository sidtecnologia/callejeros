import { createContext, useContext, useState, useEffect } from 'react';
import { getProducts, validateOrderAPI, saveOrderToDB } from '../services/api';

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
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToCart = (product, qty, observation = '', size = null) => {
    let limitReached = false;

    setCart((prevCart) => {
      const cartKey = size ? `${product.id}__${size.label}` : String(product.id);
      const existing = prevCart.find((item) => item._cartKey === cartKey);
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
      } else {
        return [
          ...prevCart,
          {
            ...product,
            _cartKey: cartKey,
            qty,
            price: size ? size.price : product.price,
            size: size ? size.label : null,
            observation: observation || '',
          },
        ];
      }
    });

    if (limitReached) {
      alert(`Solo quedan ${product.stock} unidades disponibles.`);
    } else {
      addToast(`${product.name}${size ? ` (${size.label})` : ''} agregado al carrito.`, 'Producto agregado');
    }
  };

  const removeFromCart = (cartKey) => {
    setCart((prevCart) => prevCart.filter((item) => item._cartKey !== cartKey));
  };

  const updateCartQty = (cartKey, delta) => {
    let limitReached = false;
    const cartItem = cart.find((i) => i._cartKey === cartKey);
    const product = products.find((p) => p.id === cartItem?.id);

    setCart((prevCart) => {
      const item = prevCart.find((i) => i._cartKey === cartKey);
      if (!item || !product) return prevCart;

      const newQty = item.qty + delta;

      if (newQty > product.stock) {
        limitReached = true;
        return prevCart;
      }

      if (newQty <= 0) return prevCart.filter((i) => i._cartKey !== cartKey);
      return prevCart.map((i) => (i._cartKey === cartKey ? { ...i, qty: newQty } : i));
    });

    if (limitReached) {
      alert(`Solo quedan ${product?.stock} unidades disponibles.`);
    }
  };

  const clearCart = () => setCart([]);

  const processOrder = async (customerData) => {
    const itemObservations = cart
      .map((i) => (i.observation && i.observation.trim() ? i.observation.trim() : null))
      .filter(Boolean);

    const aggregatedObservation =
      itemObservations.length > 0 ? itemObservations.join(' | ') : '';

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
      })),
    };

    const result = await validateOrderAPI(orderPayload);

    return {
      name: result.customerData.name,
      address: result.customerData.address,
      phone: result.customerData.phone,
      payment: result.customerData.payment,
      observation: result.customerData.observation || '',
      items: result.validatedItems,
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
    await fetchProducts();
    clearCart();
    addToast('Pedido confirmado y enviado correctamente.', 'Pedido enviado');
  };

  return (
    <ShopContext.Provider
      value={{
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
        removeToast,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};