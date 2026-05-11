import { useState, useEffect, useMemo } from 'react';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import Modal from './ui/Modal';
import { useShop } from '../context/ShopContext';
import { formatMoney } from '../utils/format';

const ProductModal = ({ product, isOpen, onClose }) => {
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [observation, setObservation] = useState('');
  const [selectedExtras, setSelectedExtras] = useState({});
  const [selectedSize, setSelectedSize] = useState(null);
  const { addToCart, products } = useShop();

  const hasSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setImgIndex(0);
      setObservation('');
      setSelectedExtras({});
      setSelectedSize(hasSizes ? null : null);
    }
  }, [isOpen]);

  const effectivePrice = useMemo(() => {
    if (hasSizes && selectedSize) {
      return selectedSize.price;
    }
    return product?.price ?? 0;
  }, [hasSizes, selectedSize, product]);

  const extrasPool = useMemo(() => {
    if (!products || !product) return [];
    return products.filter(
      (p) => p.id !== product.id && p.category && /aderez|adicional/i.test(p.category)
    );
  }, [products, product]);

  const aderezos = useMemo(
    () => extrasPool.filter((p) => /aderez/i.test(p.category)),
    [extrasPool]
  );
  const adicionales = useMemo(
    () => extrasPool.filter((p) => /adicional/i.test(p.category)),
    [extrasPool]
  );

  const toggleExtra = (id) => {
    setSelectedExtras((prev) => {
      const copy = { ...prev };
      if (copy[id]) delete copy[id];
      else copy[id] = 1;
      return copy;
    });
  };

  const changeExtraQty = (id, delta) => {
    setSelectedExtras((prev) => {
      const current = prev[id] || 0;
      return { ...prev, [id]: Math.max(1, current + delta) };
    });
  };

  const handleAddToCart = () => {
    if (hasSizes && !selectedSize) return;
    const sanitizedObservation = observation.trim().slice(0, 300).replace(/[<>]/g, '');
    addToCart(product, qty, sanitizedObservation, selectedSize);

    Object.entries(selectedExtras).forEach(([id, extraQty]) => {
      const extraProduct = products.find((p) => String(p.id) === String(id));
      if (extraProduct) addToCart(extraProduct, extraQty, '');
    });

    onClose();
  };

  if (!product) return null;

  const images = Array.isArray(product.image)
    ? product.image
    : product.image
    ? [product.image]
    : ['/img/placeholder.png'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Producto">
      <div className="space-y-6">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
          <img src={images[imgIndex]} alt={product.name} className="w-full h-full object-cover" />
          {images.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setImgIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === imgIndex ? 'bg-white w-4' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
          <p className="text-2xl font-bold text-primary mt-1">
            {hasSizes
              ? selectedSize
                ? `$${formatMoney(selectedSize.price)}`
                : <span className="text-base font-semibold text-gray-400">Selecciona un tamaño</span>
              : `$${formatMoney(product.price)}`
            }
          </p>
          <p className="text-gray-600 mt-3">{product.description}</p>
        </div>

        {hasSizes && (
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Tamaño <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {product.sizes.map((size) => {
                const isSelected = selectedSize?.label === size.label;
                return (
                  <button
                    key={size.label}
                    onClick={() => setSelectedSize(size)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                      {size.label}
                    </span>
                    <span className={`text-xs mt-0.5 ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
                      ${formatMoney(size.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">Observaciones</label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Ej: Sin cebolla..."
            rows={2}
            maxLength={300}
            className="w-full p-3 rounded-xl border border-gray-300 outline-none resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-0.5">{observation.length}/300</p>
        </div>

        {(aderezos.length > 0 || adicionales.length > 0) && (
          <div className="space-y-4">
            {aderezos.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-xl border">
                <h4 className="font-semibold mb-3">Aderezos</h4>
                <div className="space-y-2">
                  {aderezos.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedExtras[e.id]}
                          onChange={() => toggleExtra(e.id)}
                          className="w-5 h-5 accent-primary"
                        />
                        <div>
                          <p className="font-medium text-sm">{e.name}</p>
                          <p className="text-xs text-primary">${formatMoney(e.price)}</p>
                        </div>
                      </div>
                      {selectedExtras[e.id] && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeExtraQty(e.id, -1)} className="w-6 h-6 bg-gray-100 rounded">-</button>
                          <span className="text-sm font-bold">{selectedExtras[e.id]}</span>
                          <button onClick={() => changeExtraQty(e.id, 1)} className="w-6 h-6 bg-gray-100 rounded">+</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adicionales.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-xl border">
                <h4 className="font-semibold mb-3">Adicionales</h4>
                <div className="space-y-2">
                  {adicionales.map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={!!selectedExtras[e.id]}
                          onChange={() => toggleExtra(e.id)}
                          className="w-5 h-5 accent-primary"
                        />
                        <div>
                          <p className="font-medium text-sm">{e.name}</p>
                          <p className="text-xs text-primary">${formatMoney(e.price)}</p>
                        </div>
                      </div>
                      {selectedExtras[e.id] && (
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeExtraQty(e.id, -1)} className="w-6 h-6 bg-gray-100 rounded">-</button>
                          <span className="text-sm font-bold">{selectedExtras[e.id]}</span>
                          <button onClick={() => changeExtraQty(e.id, 1)} className="w-6 h-6 bg-gray-100 rounded">+</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="sticky bottom-0 bg-white border-t px-6 py-4 -mx-6 mt-4 flex items-center justify-between gap-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3"><Minus size={18} /></button>
            <span className="w-8 text-center font-bold">{qty}</span>
            <button onClick={() => setQty(Math.min(qty + 1, product.stock || 99))} className="p-3"><Plus size={18} /></button>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.stock || product.stock < qty || (hasSizes && !selectedSize)}
            className="flex-1 bg-primary text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart size={20} />
            <span>
              {!product.stock || product.stock < qty
                ? 'Sin Stock'
                : hasSizes && !selectedSize
                ? 'Elige un tamaño'
                : `Agregar${effectivePrice ? ` · $${formatMoney(effectivePrice * qty)}` : ''}`}
            </span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ProductModal;