import { useState } from 'react';
import Modal from './ui/Modal';
import { CheckCircle } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { useShop } from '../context/ShopContext';

const PICKUP = 'Para recoger';

const isMobile = () =>
  /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini/i.test(
    navigator.userAgent || ''
  );

const buildOrderMessage = (order) => {
  const pickup = (order.orderType || order.order_type) === PICKUP;

  const lines = [
    '*He realizado un pedido:*',
    '',
    `Cliente: ${order.name}`,
    `Tipo: ${pickup ? 'Para recoger en el local' : 'A domicilio'}`,
  ];

  if (!pickup) {
    lines.push(`Dirección: ${order.address}`);
  }

  lines.push(`Pago: ${order.payment || 'Efectivo'}`, '', '*Pedido:*');

  order.items.forEach((item, idx) => {
    const size = item.size ? ` [${item.size}]` : '';
    const obs = item.observation ? ` (${item.observation})` : '';
    lines.push(
      `${idx + 1}. ${item.qty} x ${item.name}${size}${obs} - $${formatMoney(item.price * item.qty)}`
    );
  });

  if (order.observation) {
    lines.push('', `Observaciones: ${order.observation}`);
  }

  lines.push('', `*Total: $${formatMoney(order.total)}*`);

  return lines.join('\n');
};

const SuccessModal = ({ isOpen, onClose, orderDetails }) => {
  const { confirmOrder, addToast, businessConfig } = useShop();
  const [loading, setLoading] = useState(false);

  if (!orderDetails) return null;

  const pickup = (orderDetails.orderType || orderDetails.order_type) === PICKUP;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmOrder(orderDetails);

      const encoded = encodeURIComponent(buildOrderMessage(orderDetails));
      const phone = businessConfig.whatsapp;
      const link = isMobile()
        ? `whatsapp://send?phone=${phone}&text=${encoded}`
        : `https://wa.me/${phone}?text=${encoded}`;

      window.open(link, '_blank', 'noopener,noreferrer');

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
          <h3 className="text-xl font-bold text-gray-800">
            ¡Tu comida está casi lista!
          </h3>
          <p className="text-gray-500 mt-2">
            {pickup
              ? 'Confirma el pedido por WhatsApp para que lo preparemos. Pasa a recogerlo al local.'
              : 'Confirma el pedido por WhatsApp para proceder con el despacho.'}
          </p>
        </div>

        <div className="bg-gray-100 p-4 rounded-xl text-left space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Tipo de pedido:</span>{' '}
            {pickup ? 'Para recoger en el local' : 'A domicilio'}
          </p>

          {!pickup && (
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Dirección:</span>{' '}
              {orderDetails.address}
            </p>
          )}

          <p className="text-lg font-bold">
            Total a pagar:{' '}
            <span className="text-primary">${formatMoney(orderDetails.total)}</span>
          </p>

          {orderDetails.observation ? (
            <div>
              <p className="font-semibold text-sm text-gray-700">
                Observaciones del pedido:
              </p>
              <p className="text-sm text-gray-600">{orderDetails.observation}</p>
            </div>
          ) : null}
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WA"
            className="w-6 h-6"
          />
          {loading ? 'Registrando pedido...' : 'Confirmar por WhatsApp'}
        </button>

        <button
          onClick={onClose}
          className="text-gray-400 text-sm hover:text-gray-600 underline"
        >
          Cancelar pedido y volver al menú
        </button>
      </div>
    </Modal>
  );
};

export default SuccessModal;