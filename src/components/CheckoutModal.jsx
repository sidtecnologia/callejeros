import { useState, useCallback } from 'react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { useStoreHours } from '../hooks/useStoreHours';
import PrivacyContent from '../utils/privacy';
import ConfirmarPedidoYPagoModal from './ConfirmarPedidoYPagoModal';

const PICKUP_ADDRESS = 'Recoger en el local';

const INITIAL_FORM = {
  name: '',
  address: '',
  phone: '',
  orderType: 'Para llevar',
  payment: 'Efectivo',
  terms: false,
};

const ORDER_TYPES = ['Para llevar', 'Para recoger'];
const PAYMENT_METHODS = ['Efectivo', 'Transferencia'];

const sanitize = (value, max) =>
  value.trim().slice(0, max).replace(/[<>]/g, '');

const inputClass = (hasError) =>
  `w-full p-3 rounded-xl border focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`;

const validate = ({ name, address, phone, orderType, terms }) => {
  const errors = {};

  if (name.trim().length < 3) {
    errors.name = 'Ingresa tu nombre completo';
  }

  if (orderType === 'Para llevar' && address.trim().length < 5) {
    errors.address = 'Ingresa una dirección válida';
  }

  if (!/^\d{7,15}$/.test(phone.replace(/\s/g, ''))) {
    errors.phone = 'Ingresa un número de WhatsApp válido';
  }

  if (!terms) {
    errors.terms = 'Debes aceptar los términos y condiciones';
  }

  return errors;
};

const Field = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">
      {label}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const RadioOption = ({ name, value, checked, onChange }) => (
  <label
    className={`flex items-center gap-2 p-3 border rounded-xl flex-1 cursor-pointer hover:bg-gray-50 ${
      checked ? 'border-primary bg-gray-50' : ''
    }`}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="accent-primary"
    />
    <span>{value}</span>
  </label>
);

const CheckoutModal = ({ isOpen, onClose, onSuccess }) => {
  const { processOrder, businessConfig } = useShop();
  const isStoreOpen = useStoreHours();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isPrivacyOpen, setPrivacyOpen] = useState(false);
  const [transferOrder, setTransferOrder] = useState(null);

  const isPickup = formData.orderType === 'Para recoger';

  const handleChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) =>
      prev[field] ? { ...prev, [field]: undefined } : prev
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStoreOpen) {
      alert(
        'El negocio está cerrado en este momento. Intenta nuevamente durante el horario de atención.'
      );
      onClose();
      return;
    }

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const details = await processOrder({
        ...formData,
        name: sanitize(formData.name, 100),
        address: isPickup ? PICKUP_ADDRESS : sanitize(formData.address, 200),
        phone: formData.phone.replace(/\s/g, '').slice(0, 15),
      });

      onClose();

      if (formData.payment === 'Transferencia') {
        setTransferOrder(details);
      } else {
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
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Tipo de Pedido
            </label>
            <div className="flex gap-4">
              {ORDER_TYPES.map((type) => (
                <RadioOption
                  key={type}
                  name="orderType"
                  value={type}
                  checked={formData.orderType === type}
                  onChange={(v) => handleChange('orderType', v)}
                />
              ))}
            </div>
          </div>

          <Field label="Nombre Completo" error={errors.name}>
            <input
              type="text"
              maxLength={100}
              className={inputClass(errors.name)}
              placeholder="Juan Pérez"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Field>

          <Field label="WhatsApp" error={errors.phone}>
            <input
              type="tel"
              maxLength={15}
              inputMode="numeric"
              className={inputClass(errors.phone)}
              placeholder="3001234567"
              value={formData.phone}
              onChange={(e) =>
                handleChange('phone', e.target.value.replace(/[^\d\s]/g, ''))
              }
            />
          </Field>

          {isPickup ? (
            <p className="text-sm text-gray-600 bg-gray-50 border rounded-xl p-3">
              Recogerás tu pedido en el local
              {businessConfig?.address ? `: ${businessConfig.address}` : '.'}
            </p>
          ) : (
            <Field label="Dirección de Entrega" error={errors.address}>
              <input
                type="text"
                maxLength={200}
                className={inputClass(errors.address)}
                placeholder="Calle 123 # 45-67 Barrio"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </Field>
          )}

          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Método de Pago
            </label>
            <div className="flex gap-4">
              {PAYMENT_METHODS.map((method) => (
                <RadioOption
                  key={method}
                  name="payment"
                  value={method}
                  checked={formData.payment === method}
                  onChange={(v) => handleChange('payment', v)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              id="terms"
              type="checkbox"
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

          {errors.terms && (
            <p className="text-red-500 text-xs -mt-2">{errors.terms}</p>
          )}

          <button
            type="submit"
            disabled={loading || !isStoreOpen}
            className="w-full btn-primary py-3 text-lg flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? 'Verificando...'
              : !isStoreOpen
                ? 'Negocio cerrado'
                : 'Continuar'}
          </button>
        </form>
      </Modal>

      <Modal
        isOpen={isPrivacyOpen}
        onClose={() => setPrivacyOpen(false)}
        title="Tratamiento de Datos"
      >
        <div className="space-y-4">
          <PrivacyContent businessConfig={businessConfig} />
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