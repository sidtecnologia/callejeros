import { useState } from 'react';
import Modal from './ui/Modal';
import { Copy, Check, CheckCircle2 } from 'lucide-react';
import { formatMoney } from '../utils/format';
import { useShop } from '../context/ShopContext';
import { BUSINESS_CONFIG } from '../config/businessConfig';

const ConfirmarPedidoYPagoModal = ({ isOpen, onClose, orderDetails }) => {
  const { confirmOrder, addToast } = useShop();
  const [copied, setCopied] = useState(false);
  const [includeDelivery, setIncludeDelivery] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!orderDetails) return null;

  const totalToPay = includeDelivery
    ? orderDetails.total + BUSINESS_CONFIG.delivery.cost
    : orderDetails.total;

  const isMobile = () =>
    /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini/i.test(navigator.userAgent || '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BUSINESS_CONFIG.nequi.number);
    } catch {
      const el = document.createElement('textarea');
      el.value = BUSINESS_CONFIG.nequi.number;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buildMessage = () => {
    const lines = [];
    lines.push('Hola, adjunto comprobante de pago para confirmar mi pedido.');
    lines.push(`Nombre: ${orderDetails.name}`);
    lines.push(`Dirección: ${orderDetails.address}`);
    lines.push(`Valor transferido: $${formatMoney(totalToPay)}`);
    lines.push('');
    lines.push('Pedido:');
    orderDetails.items.forEach((item, idx) => {
      const obs = item.observation ? ` (${item.observation})` : '';
      lines.push(`${idx + 1}. ${item.qty} x ${item.name}${obs} - $${formatMoney(item.price * item.qty)}`);
    });
    lines.push('');
    lines.push(`Total pedido: $${formatMoney(orderDetails.total)}`);
    return lines.join('\n');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(buildMessage());
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
    <Modal isOpen={isOpen} onClose={onClose} title="Pago por transferencia">
      <div className="space-y-5">

        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
          <CheckCircle2 className="text-yellow-500 w-6 h-6 flex-shrink-0" />
          <div>
            <p className="font-semibold text-yellow-800 text-sm">¡Pedido verificado!</p>
            <p className="text-yellow-600 text-xs">Realiza la transferencia y envía el comprobante para confirmar.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Escanea el QR de Nequi</p>
          <img
            src={BUSINESS_CONFIG.nequi.qrUrl}
            alt="QR Nequi"
            className="w-48 h-48 rounded-2xl border border-gray-200 shadow object-cover"
          />
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Número de cuenta Nequi</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-100 rounded-xl px-4 py-3 font-mono text-gray-800 text-base tracking-widest select-all">
              {BUSINESS_CONFIG.nequi.number}
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                copied ? 'bg-green-500 text-white' : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Subtotal pedido</span>
            <span className="font-semibold text-gray-800">${formatMoney(orderDetails.total)}</span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDelivery}
              onChange={(e) => setIncludeDelivery(e.target.checked)}
              className="w-5 h-5 accent-primary rounded"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">¿Incluir pago de domicilio?</p>
              <p className="text-xs text-gray-400">+${formatMoney(BUSINESS_CONFIG.delivery.cost)} — ¿o pagas al recibir?</p>
            </div>
          </label>

          <div className="border-t pt-2 flex justify-between items-center">
            <span className="font-bold text-gray-800">Total a transferir</span>
            <span className="text-xl font-bold text-primary">${formatMoney(totalToPay)}</span>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2"
        >
          <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WA" className="w-6 h-6" />
          {loading ? 'Registrando pedido...' : 'Enviar comprobante'}
        </button>

      </div>
    </Modal>
  );
};

export default ConfirmarPedidoYPagoModal;