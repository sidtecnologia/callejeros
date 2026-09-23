import { Clock, Info } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { getStoreStatus } from '../hooks/useStoreHours';

const StoreStatusBanner = () => {
  const { setBusinessModalOpen, businessConfig } = useShop();
  const status = getStoreStatus(businessConfig);

  const isBetweenShifts = status.reason === 'between_shifts';

  return (
    <div className="bg-amber-50 border border-amber-200 p-4 mb-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-amber-800">
        <div className="bg-amber-100 p-2 rounded-full">
          <Clock size={20} />
        </div>

        <div>
          <p className="font-bold text-sm text-left">
            {isBetweenShifts ? 'Estamos en pausa' : 'Estamos cerrados'}
          </p>

          <p className="text-xs text-left">
            {isBetweenShifts
              ? 'En este momento estamos fuera de nuestro horario de atención. Puedes consultar nuestros horarios.'
              : businessConfig.schedule.label
                ? `Nuestro horario es de ${businessConfig.schedule.label}. Puedes consultar los horarios completos.`
                : 'Puedes consultar nuestros horarios de atención.'}
          </p>
        </div>
      </div>

      <button
        onClick={() => setBusinessModalOpen(true)}
        className="inline-flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors w-full sm:w-auto justify-center"
      >
        <Info size={16} />
        <span>Ver información del negocio</span>
      </button>
    </div>
  );
};

export default StoreStatusBanner;