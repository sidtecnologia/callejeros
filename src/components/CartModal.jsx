import { useShop } from '../context/ShopContext';
import Modal from './ui/Modal';
import { Trash2, Plus, Minus } from 'lucide-react';
import { analytics } from '../services/analytics';

const CartModal = ({ isOpen, onClose, onCheckout, businessName }) => {
  const { cart, removeFromCart, updateCartQty } = useShop();

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleViewCart = () => {
    analytics.viewCart(itemCount, cartTotal, businessName);
  };

  const handleCheckout = () => {
    onCheckout();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Carrito de compras">
      <div
        onClick={handleViewCart}
        className="space-y-4"
      >
        {cart.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Tu carrito está vacío</p>
        ) : (
          <>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cart.map((item) => (
                <div
                  key={item._cartKey}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    {item.size && <p className="text-xs text-gray-500">{item.size}</p>}
                    <p className="text-sm text-gray-600">${(item.price * item.qty).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateCartQty(item._cartKey, -1)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item._cartKey, 1)}
                      className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._cartKey)}
                    className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Proceder al pago
              </button>

              <button
                onClick={onClose}
                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Continuar comprando
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default CartModal;