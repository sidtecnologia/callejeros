import { Trash2, ArrowRight } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { formatMoney } from '../utils/format';
import { useMemo } from 'react';

const CartModal = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateCartQty, removeFromCart, products, addToCart } = useShop();

  const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const recommended = useMemo(() => {
    if (!products || products.length === 0) return [];
    const grouped = {};
    products.forEach(p => {
      if (!p.category) return;
      if (cart.find(ci => String(ci.id) === String(p.id))) return;
      if (p.stock <= 0) return;
      if (!grouped[p.category]) grouped[p.category] = [];
      grouped[p.category].push(p);
    });
    const result = [];
    Object.keys(grouped).forEach(cat => {
      const arr = grouped[cat].slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      result.push(...arr.slice(0, 2));
    });
    return result;
  }, [products, cart]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tu Pedido">
      {cart.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Tu pedido está vacío.</p>
          <button onClick={onClose} className="mt-4 text-primary font-semibold">Ver menú</button>
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-200">
            {cart.map((item) => (
              <div key={item._cartKey} className="flex gap-4 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                <img
                  src={Array.isArray(item.image) ? item.image[0] : (item.image || '/img/placeholder.png')}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-gray-800">{item.name}</h4>
                      {item.size && (
                        <span className="inline-block text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mb-0.5">
                          {item.size}
                        </span>
                      )}
                      <p className="text-primary font-semibold">${formatMoney(item.price * item.qty)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item._cartKey)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCartQty(item._cartKey, -1)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-full">-</button>
                  <span className="w-6 text-center font-bold">{item.qty}</span>
                  <button onClick={() => updateCartQty(item._cartKey, 1)} className="w-8 h-8 flex items-center justify-center bg-white border rounded-full">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-auto">
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <span>Total:</span>
              <span>${formatMoney(total)}</span>
            </div>
            <button
              onClick={() => { onClose(); onCheckout(); }}
              className="w-full btn-primary flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-lg font-bold"
            >
              <span>Continuar Compra</span>
              <ArrowRight size={20} />
            </button>
          </div>

          {recommended.length > 0 && (
            <div className="pt-6 mt-6 border-t">
              <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">Recomendados</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recommended.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-28 bg-white border rounded-xl p-2 flex flex-col">
                    <img src={Array.isArray(p.image) ? p.image[0] : (p.image || '/img/placeholder.png')} alt={p.name} className="w-full h-20 object-cover rounded-md mb-2" />
                    <h4 className="font-semibold text-xs text-gray-800 truncate mb-1">{p.name}</h4>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs font-bold text-primary">${formatMoney(p.price)}</span>
                      <button onClick={() => addToCart(p, 1, '')} className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CartModal;