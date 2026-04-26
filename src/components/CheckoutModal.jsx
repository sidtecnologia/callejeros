import { useState } from 'react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import PrivacyContent from '../utils/privacy';
import { formatMoney } from '../utils/format';
import ConfirmarPedidoYPagoModal from './ConfirmarPedidoYPagoModal';

const sanitize = (value, max) => value.trim().slice(0, max).replace(/[<>]/g, '');

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const { processOrder } = useShop();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    payment: 'Efectivo',
    terms: false,
  });
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [transferOrder, setTransferOrder] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.trim().length < 3) {
      newErrors.name = 'Ingresa tu nombre completo';
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Ingresa una dirección válida';
    }
    if (!/^\d{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Ingresa un número de WhatsApp válido';
    }
    if (!formData.terms) {
      newErrors.terms = 'Debes aceptar los términos y condiciones';
    }
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const sanitizedData = {
        ...formData,
        name: sanitize(formData.name, 100),
        address: sanitize(formData.address, 200),
        phone: formData.phone.replace(/\s/g, '').slice(0, 15),
      };

      const details = await processOrder(sanitizedData);

      if (sanitizedData.payment === 'Transferencia') {
        setTransferOrder(details);
        onClose();
      } else {
        onClose();
        onSuccess(details);
      }
    } catch (error) {
      alert(error.message || 'Error procesando la orden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Datos de Entrega">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Nombre Completo</label>
            <input
              required
              type="text"
              maxLength={100}
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">WhatsApp</label>
            <input
              required
              type="tel"
              maxLength={15}
              inputMode="numeric"
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                errors.phone ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="3001234567"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/[^\d\s]/g, ''))}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">Dirección de Entrega</label>
            <input
              required
              type="text"
              maxLength={200}
              className={`w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                errors.address ? 'border-red-400' : 'border-gray-300'
              }`}
              placeholder="Calle 123 # 45-67 Barrio"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">Método de Pago</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 p-3 border rounded-xl flex-1 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="Efectivo"
                  checked={formData.payment === 'Efectivo'}
                  onChange={(e) => handleChange('payment', e.target.value)}
                  className="accent-primary"
                />
                <span>Efectivo</span>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded-xl flex-1 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="payment"
                  value="Transferencia"
                  checked={formData.payment === 'Transferencia'}
                  onChange={(e) => handleChange('payment', e.target.value)}
                  className="accent-primary"
                />
                <span>Transferencia</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="terms"
              type="checkbox"
              required
              checked={formData.terms}
              onChange={(e) => handleChange('terms', e.target.checked)}
              className="w-5 h-5 accent-primary rounded"
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              Acepto el{' '}
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="text-primary hover:underline inline"
              >
                tratamiento de datos personales
              </button>
              .
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg flex justify-center"
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={isPrivacyOpen} onClose={() => setPrivacyOpen(false)} title="Tratamiento de Datos">
        <div className="space-y-4">
          <PrivacyContent />
          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setPrivacyOpen(false)}
              className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmarPedidoYPagoModal
        isOpen={!!transferOrder}
        onClose={() => setTransferOrder(null)}
        orderDetails={transferOrder}
      />
    </>
  );
};

export default CheckoutModal;