import { Plus, Lock } from 'lucide-react';
import { formatMoney } from '../utils/format';

const ProductCard = ({ product, onClick, isStoreOpen = true }) => {
  const isOutOfStock = !product.stock || product.stock <= 0;
  const isDisabled = isOutOfStock || !isStoreOpen;

  return (
    <div
      className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 relative ${isDisabled ? 'opacity-75' : ''}`}
      onClick={() => !isDisabled && onClick(product)}
    >
      {product.bestSeller && (
        <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10 shadow-sm">
          Más Vendido
        </span>
      )}

      {isOutOfStock && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
          <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold shadow-lg transform -rotate-12">
            AGOTADO
          </span>
        </div>
      )}

      {!isStoreOpen && !isOutOfStock && (
        <div className="absolute inset-0 bg-gray-900/10 flex items-center justify-center z-20">
          <div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-xl flex items-center gap-2 border border-amber-200">
            <Lock size={12} className="text-amber-600" />
            <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider">
              Cerrado
            </span>
          </div>
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image?.[0] || '/img/placeholder.png'}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${!isDisabled ? 'group-hover:scale-105' : ''}`}
          loading="lazy"
        />

        {!isDisabled && (
          <div className="absolute bottom-1.5 right-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Plus size={16} className="text-primary" />
          </div>
        )}
      </div>

      <div className="p-2.5">
        <h3 className="font-bold text-gray-800 line-clamp-1 text-sm mb-0.5">
          {product.name}
        </h3>

        <p className="text-gray-500 text-[11px] line-clamp-2 mb-2 h-7 leading-tight">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span
            className={`text-sm font-bold ${
              !isStoreOpen ? 'text-gray-500' : 'text-primary'
            }`}
          >
            ${formatMoney(product.price)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;