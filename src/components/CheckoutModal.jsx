import { useState } from 'react';
import { useShop } from '../context/ShopContext';
import Modal from './ui/Modal';
import { MessageCircle } from 'lucide-react';
import { analytics } from '../services/analytics';

const CheckoutModal = ({ isOpen, onClose, onSuccess, businessName }) => {
  const { cart, businessConfig, processOrder, confirmOrder, addToast } = useShop();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    payment: 'whatsapp',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const deliveryFee = businessConfig.delivery?.cost || 0;
  const finalTotal = cartTotal + deliveryFee;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method) => {
    setFormData((prev) => ({ ...prev, payment: method }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      addToast('Por favor ingresa tu nombre', 'Campo requerido');
      return false;
    }
    if (!formData.address.trim()) {
      addToast('Por favor ingresa tu dirección', 'Campo requerido');
      return false;
    }
    if (!formData.phone.trim()) {
      addToast('Por favor ingresa tu teléfono', 'Campo requerido');
      return false;
    }
    return true;
  };

  const handleWhatsappOrder = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const orderDetails = await processOrder(formData);
      await confirmOrder(orderDetails);

      analytics.whatsappClick(itemCount, finalTotal, businessName);

      const message = encodeURIComponent(
        `Hola, quiero hacer un pedido:\n\n${orderDetails.items
          .map((item) => `${item.name} x${item.qty} - $${(item.price * item.qty).toLocaleString()}`)
          .join('\n')}\n\nTotal: $${orderDetails.total.toLocaleString()}\n\nNombre: ${orderDetails.name}\nDirección: ${orderDetails.address}\nTeléfono: ${orderDetails.phone}`
      );

      const whatsappUrl = `https://wa.me/${businessConfig.whatsapp}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      onSuccess(orderDetails);
      onClose();
    } catch (err) {
      addToast(err.message || 'Error procesando el pedido', 'Error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirmar pedido">
      <div className="space-y-4 max-h-96 overflow-y-auto">
        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
          <h3 className="font-semibold text-sm">Resumen del pedido</h3>
          {cart.map((item) => (
            <div key={item._cartKey} className="flex justify-between text-sm">
              <span>{item.name} x{item.qty}</span>
              <span>${(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          {deliveryFee > 0 && (
            <div className="flex justify-between text-sm border-t pt-2">
              <span>Domicilio</span>
              <span>${deliveryFee.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>${finalTotal.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            name="name"
            placeholder="Tu nombre"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <input
            type="text"
            name="address"
            placeholder="Tu dirección"
            value={formData.address}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Tu teléfono"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold block">Método de pago</label>
          <div className="space-y-2">
            <button
              onClick={() => handlePaymentChange('whatsapp')}
              className={`w-full p-3 rounded-lg border-2 flex items-center gap-2 transition-colors ${
                formData.payment === 'whatsapp'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <MessageCircle size={18} />
              <span className="text-sm">Pagar por WhatsApp</span>
            </button>
          </div>
        </div>

        <button
          onClick={handleWhatsappOrder}
          disabled={isProcessing}
          className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Procesando...' : 'Continuar a WhatsApp'}
        </button>

        <button
          onClick={onClose}
          className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default CheckoutModal;