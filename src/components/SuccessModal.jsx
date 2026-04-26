import { useState } from 'react';
import Modal from './ui/Modal';
import { CheckCircle } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { useShop } from '../context/ShopContext';
import { BUSINESS_CONFIG } from '../config/businessConfig';

const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
  const { confirmOrder, addToast } = useShop();
  const [loading, setLoading] = useState(false);

  if (!orderDetails) return null;

  const isMobile = () =>
    /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent || '');

  const buildCashMessage = () => {
    const lines = [];
    lines.push(`Hola, soy ${orderDetails.name}`);
    lines.push(`he realizado un pedido para la dirección: ${orderDetails.address}`);
    lines.push(`Pago: ${orderDetails.payment || 'Efectivo'}`);
    lines.push('');
    lines.push('Pedido:');
    orderDetails.items.forEach((item, idx) => {
      const obs = item.observation ? ` (${item.observation})` : '';
      lines.push(`${idx + 1}. ${item.qty} x ${item.name}${obs} - $${formatMoney(item.price * item.qty)}`);
    });
    lines.push('');
    lines.push(`Total: $${formatMoney(orderDetails.total)}`);
    return lines.join('\n');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(buildCashMessage());
      const link = isMobile()
        ? `whatsapp://send?phone=${BUSINESS_CONFIG.whatsapp}&text=${encoded}`
        : `https://wa.me/${BUSINESS_CONFIG.whatsapp}?text=${encoded}`;
      window.open(link, '_blank', 'noopener,noreferrer');

      await confirmOrder(orderDetails);
      if (onClose) onClose();
    } catch (err) {
      addToast('No se pudo registrar el pedido. Por favor intenta de nuevo.', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pago en efectivo">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="text-green-500 w-20 h-20 animate-bounce" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">¡Tu comida está casi lista!</h3>
          <p className="text-gray-500 mt-2">Confirma el pedido por WhatsApp para proceder con el despacho.</p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl text-left">
          <p className="text-lg font-bold mb-2">
            Total a pagar: <span className="text-primary">${formatMoney(orderDetails.total)}</span>
          </p>
          {orderDetails.observation ? (
            <div className="mt-2">
              <p className="font-semibold text-sm text-gray-700">Observaciones del pedido:</p>
              <p className="text-sm text-gray-600">{orderDetails.observation}</p>
            </div>
          ) : null}
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6" />
          {loading ? 'Registrando pedido...' : 'Confirmar por WhatsApp'}
        </button>

        <button onClick={onClose} className="text-gray-400 text-sm hover:text-gray-600 underline">
          Cancelar pedido y volver al menú
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;